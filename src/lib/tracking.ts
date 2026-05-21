"use client";
/**
 * tracking.ts — Singleton batch collector cho hệ Recommendation.
 *
 * Hành vi (theo spec):
 *  - Gom event tại client.
 *  - Gửi batch khi: đủ 10 events HOẶC sau 30 giây HOẶC user rời trang (visibilitychange/pagehide).
 *  - Khi user đóng tab → dùng navigator.sendBeacon để không bị mất.
 *  - Tự sinh sessionId nếu chưa có (lưu localStorage).
 *  - API ẩn lỗi (silent) — không spam toast khi tracking thất bại.
 */

const SESSION_STORAGE_KEY = "rec_session_id";
const BATCH_SIZE = 10;
const FLUSH_INTERVAL_MS = 30_000;

// EventType cho phép — phải khớp với backend validator
export const EVENT_TYPES = {
  PRODUCT_VIEW: "product_view",
  PRODUCT_VIEW_LONG: "product_view_long",
  ADD_TO_CART: "add_to_cart",
  ADD_TO_WISHLIST: "add_to_wishlist",
  PURCHASE: "purchase",
  SEARCH: "search",
  CATEGORY_BROWSE: "category_browse",
  REVIEW_SUBMIT: "review_submit",
  REMOVE_FROM_CART: "remove_from_cart",
} as const;

export type TrackEventType = (typeof EVENT_TYPES)[keyof typeof EVENT_TYPES];

export const ENTITY_TYPES = {
  PRODUCT: "product",
  CATEGORY: "category",
  BRAND: "brand",
  SEARCH: "search",
  PROMOTION: "promotion",
  PAGE: "page",
} as const;

export type TrackEntityType = (typeof ENTITY_TYPES)[keyof typeof ENTITY_TYPES];

export interface TrackEventInput {
  eventType: TrackEventType;
  entityId: string | number;
  entityType: TrackEntityType;
  source?: string;
  referrer?: string;
  deviceType?: string;
  durationMs?: number;
  scrollDepth?: number;
  clickPosition?: string;
  metadata?: Record<string, unknown>;
  occurredAt?: Date;
}

interface QueuedEvent {
  eventType: string;
  entityId: string;
  entityType: string;
  source?: string;
  referrer?: string;
  deviceType?: string;
  durationMs?: number;
  scrollDepth?: number;
  clickPosition?: string;
  metadata?: string;
  occurredAt: string;
}

/** Tự sinh & cache sessionId trong localStorage. */
function ensureSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (!id) {
    // sessionId: timestamp + random ≥ 8 chars → trùng khớp validator backend
    const rand = Math.random().toString(36).slice(2, 10);
    id = `s_${Date.now().toString(36)}_${rand}`;
    window.localStorage.setItem(SESSION_STORAGE_KEY, id);
  }
  return id;
}

/** Lấy AccountId nếu user đã login (đọc từ localStorage cùng nơi AuthContext lưu). */
function readAccountId(): number | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = window.localStorage.getItem("account_info");
    if (!raw) return undefined;
    const obj = JSON.parse(raw) as { accountId?: number };
    return typeof obj?.accountId === "number" && obj.accountId > 0 ? obj.accountId : undefined;
  } catch {
    return undefined;
  }
}

/** Phát hiện loại thiết bị đơn giản (heuristic). */
function detectDeviceType(): string {
  if (typeof window === "undefined") return "server";
  const ua = window.navigator.userAgent || "";
  if (/Mobi|Android|iPhone|iPod/i.test(ua)) return "mobile";
  if (/iPad|Tablet/i.test(ua)) return "tablet";
  return "desktop";
}

/** Resolve URL API tracking — dựa trên NEXT_PUBLIC_API_URL. */
function getApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5216";
  const trimmed = raw.trim().replace(/\/+$/, "");
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
}

class TrackingCollector {
  private queue: QueuedEvent[] = [];
  private timer: ReturnType<typeof setInterval> | null = null;
  private hookedUnload = false;
  private enabled = true;

  /** Cho phép tắt nhanh tracking (debug). */
  setEnabled(value: boolean) {
    this.enabled = value;
  }

  /** Bắt đầu lifecycle (timer + unload hook). Gọi 1 lần ở root layout. */
  start() {
    if (typeof window === "undefined") return;
    if (!this.timer) {
      this.timer = setInterval(() => this.flush("interval"), FLUSH_INTERVAL_MS);
    }
    if (!this.hookedUnload) {
      // Khi tab bị ẩn / đóng → flush bằng sendBeacon (không cần chờ response)
      const onLeave = () => this.flush("beacon");
      window.addEventListener("pagehide", onLeave);
      window.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") onLeave();
      });
      this.hookedUnload = true;
    }
  }

  /** Đẩy 1 event vào queue. Tự flush nếu đủ batch size. */
  enqueue(input: TrackEventInput) {
    if (!this.enabled) return;
    if (typeof window === "undefined") return;
    // Bỏ qua nếu thiếu thông tin tối thiểu
    if (!input.entityId && input.entityId !== 0) return;

    const queued: QueuedEvent = {
      eventType: input.eventType,
      entityId: String(input.entityId),
      entityType: input.entityType,
      source: input.source ?? (typeof location !== "undefined" ? location.pathname : undefined),
      referrer: input.referrer ?? (typeof document !== "undefined" ? document.referrer || undefined : undefined),
      deviceType: input.deviceType ?? detectDeviceType(),
      durationMs: input.durationMs,
      scrollDepth: input.scrollDepth,
      clickPosition: input.clickPosition,
      metadata: input.metadata ? safeStringify(input.metadata) : undefined,
      occurredAt: (input.occurredAt ?? new Date()).toISOString(),
    };
    this.queue.push(queued);

    if (this.queue.length >= BATCH_SIZE) {
      this.flush("size");
    }
  }

  /** Flush ngay lập tức — KHÔNG chờ. Dùng cho lúc gặp event quan trọng (purchase). */
  flushNow() {
    return this.flush("manual");
  }

  private flush(reason: "size" | "interval" | "beacon" | "manual") {
    if (!this.queue.length) return Promise.resolve();
    if (typeof window === "undefined") return Promise.resolve();

    const events = this.queue.splice(0, this.queue.length);
    const body = {
      sessionId: ensureSessionId(),
      accountId: readAccountId(),
      events,
    };

    const url = `${getApiBaseUrl()}/tracking`;

    // Khi user rời trang → dùng sendBeacon (đảm bảo không huỷ)
    if (reason === "beacon" && typeof navigator !== "undefined" && navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(body)], { type: "application/json" });
      const beaconUrl = `${getApiBaseUrl()}/tracking/beacon`;
      navigator.sendBeacon(beaconUrl, blob);
      return Promise.resolve();
    }

    // Trường hợp normal: fetch với keepalive (không block điều hướng)
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      keepalive: true,
      credentials: "omit",
    }).catch(() => {
      // Tracking không quan trọng — failover: silent
    });
  }
}

function safeStringify(value: unknown): string | undefined {
  try {
    return JSON.stringify(value);
  } catch {
    return undefined;
  }
}

// Singleton — tất cả components share 1 instance
const tracking = new TrackingCollector();
export default tracking;
