import type { OrderStatus } from "@/app/(customer)/profile/orders/_components/OrderCard";
import type { CustomerOrderStatusHistory } from "@/features/orders/types/orders";
import type { OrderTrackingEvent } from "@/features/checkout/types/checkout";

const INTERNAL_STATUS_NAMES = new Set([
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivering",
  "delivered",
  "completed",
  "cancelled",
  "refunded",
  "returning",
  "returncompleted",
]);

/** English display labels from CustomerOrderDisplayStatusMapper (API statusName). */
const ENGLISH_DISPLAY_STATUS_TO_UI: Record<string, OrderStatus> = {
  delivering: "delivering",
  "returning to warehouse": "delivering",
  "returned to warehouse": "delivering",
  "refund processing": "delivering",
  cancelled: "cancelled",
  refunded: "refunded",
};

const ENGLISH_DISPLAY_LABELS: Record<string, string> = {
  delivering: "DELIVERING",
  "returning to warehouse": "RETURNING TO WAREHOUSE",
  "returned to warehouse": "RETURNED TO WAREHOUSE",
  "refund processing": "REFUND PROCESSING",
  cancelled: "CANCELLED",
  refunded: "REFUNDED",
};

/** Legacy Vietnamese labels (existing DB history / cached responses). */
const VIETNAMESE_DISPLAY_STATUS_TO_UI: Record<string, OrderStatus> = {
  "đang giao hàng": "delivering",
  "đang hoàn hàng về kho": "delivering",
  "đã về kho": "delivering",
  "đang xử lý hoàn tiền": "delivering",
  "đã huỷ": "cancelled",
  "đã hủy": "cancelled",
  "đã hoàn tiền": "refunded",
};

export const CUSTOMER_ORDER_STATUS_CLASS: Record<OrderStatus, string> = {
  delivering: "text-orange-600",
  completed: "text-emerald-600",
  pending: "text-amber-600",
  shipping: "text-indigo-600",
  cancelled: "text-red-600",
  refunded: "text-sky-600",
};

export interface CustomerOrderDisplay {
  uiStatus: OrderStatus;
  label: string;
  className: string;
}

export interface OrderTimelineEvent {
  time: string;
  status: OrderStatus;
  description: string;
}

export function mapCustomerStatusNameToUi(statusName?: string | null): OrderStatus {
  if (!statusName) return "pending";

  const normalized = statusName.toLowerCase().trim();

  if (ENGLISH_DISPLAY_STATUS_TO_UI[normalized]) {
    return ENGLISH_DISPLAY_STATUS_TO_UI[normalized];
  }
  if (VIETNAMESE_DISPLAY_STATUS_TO_UI[normalized]) {
    return VIETNAMESE_DISPLAY_STATUS_TO_UI[normalized];
  }

  switch (normalized) {
    case "pending":
      return "pending";
    case "confirmed":
    case "processing":
    case "shipped":
      return "shipping";
    case "delivering":
    case "returning":
    case "returncompleted":
      return "delivering";
    case "delivered":
    case "completed":
      return "completed";
    case "cancelled":
      return "cancelled";
    case "refunded":
      return "refunded";
    default:
      return "pending";
  }
}

export function resolveCustomerStatusDisplayLabel(
  apiStatusName?: string | null,
  bucketStatus?: OrderStatus,
): string {
  const normalized = apiStatusName?.toLowerCase().trim() ?? "";

  if (normalized && ENGLISH_DISPLAY_LABELS[normalized]) {
    return ENGLISH_DISPLAY_LABELS[normalized];
  }

  if (
    apiStatusName &&
    !INTERNAL_STATUS_NAMES.has(normalized) &&
    !VIETNAMESE_DISPLAY_STATUS_TO_UI[normalized]
  ) {
    return apiStatusName.toUpperCase();
  }

  if (bucketStatus === "delivering") return "DELIVERING";
  if (bucketStatus === "cancelled") return "CANCELLED";
  if (bucketStatus === "refunded") return "REFUNDED";
  if (bucketStatus === "completed") return "COMPLETED";
  if (bucketStatus === "shipping") return "SHIPPING";
  if (bucketStatus === "pending") return "PENDING";

  return apiStatusName?.toUpperCase() ?? "UNKNOWN";
}

export function getCustomerOrderDisplay(params: {
  statusName?: string | null;
  paymentMethod?: string;
  hasActiveRefund?: boolean;
}): CustomerOrderDisplay {
  const uiStatus = mapCustomerStatusNameToUi(params.statusName);
  let label = resolveCustomerStatusDisplayLabel(params.statusName, uiStatus);
  let className = CUSTOMER_ORDER_STATUS_CLASS[uiStatus];

  if (uiStatus === "pending") {
    if (params.paymentMethod === "SHIP_COD") {
      label = "AWAITING CONFIRMATION";
    } else {
      label = "PENDING PAYMENT";
    }
  } else if (uiStatus === "delivering" && params.hasActiveRefund) {
    label = "REFUND REQUESTED";
    className = "text-sky-600";
  } else if (uiStatus === "shipping") {
    const raw = params.statusName?.toLowerCase();
    if (raw === "confirmed") label = "CONFIRMED";
    else if (raw === "processing") label = "PROCESSING";
    else if (raw === "shipped") label = "SHIPPED";
  } else if (uiStatus === "completed") {
    if (params.statusName?.toLowerCase() === "delivered") {
      label = "DELIVERED";
      className = "text-emerald-600";
    }
  }

  if (params.hasActiveRefund && uiStatus !== "delivering") {
    label = "REFUND REQUESTED";
    className = "text-sky-600";
  }

  return { uiStatus, label, className };
}

export function getTrackerActiveStep(
  statusName?: string | null,
  uiStatus?: OrderStatus,
): number {
  const bucket = uiStatus ?? mapCustomerStatusNameToUi(statusName);
  const raw = statusName?.toLowerCase().trim() ?? "";

  if (bucket === "cancelled" || bucket === "refunded") return 0;
  if (bucket === "pending") return 0;
  if (bucket === "shipping") {
    if (raw === "shipped") return 2;
    return 1;
  }
  if (bucket === "delivering") return 2;
  if (bucket === "completed") {
    if (raw === "completed") return 4;
    return 3;
  }
  return 0;
}

export function isCustomerOrderDelivered(statusName?: string | null): boolean {
  return statusName?.toLowerCase().trim() === "delivered";
}

const NON_CANCELLABLE_STATUSES = new Set([
  ...Object.keys(ENGLISH_DISPLAY_STATUS_TO_UI),
  ...Object.keys(VIETNAMESE_DISPLAY_STATUS_TO_UI),
  "delivering",
  "returning",
  "returncompleted",
  "shipped",
  "processing",
  "delivered",
  "completed",
  "cancelled",
  "refunded",
]);

export function isCustomerOrderCancellable(
  statusName?: string | null,
  paymentMethod?: string,
): boolean {
  if (!statusName) return false;

  const normalized = statusName.toLowerCase().trim();

  if (NON_CANCELLABLE_STATUSES.has(normalized)) {
    return false;
  }

  if (paymentMethod === "SHIP_COD" && normalized === "confirmed") {
    return false;
  }

  return normalized === "pending" || normalized === "confirmed";
}

export function shouldHideOrderHistoryNote(note?: string | null): boolean {
  const n = note?.toLowerCase() ?? "";
  return n.includes("webhook") || n.includes("marked as delivered");
}

function translateLegacyHistoryNote(note: string): string {
  const n = note.toLowerCase();
  if (n.includes("chờ lấy hàng") || n.includes("ready to pick")) return "Ready to pick";
  if (n.includes("đang lấy hàng") || n.includes("picking")) return "Picking up";
  if (n.includes("đã lấy hàng") || n.includes("picked up")) return "Picked up";
  if (n.includes("đang giao hàng") || n.includes("out for delivery")) return "Out for delivery";
  if (n.includes("giao hàng thành công") || n.includes("delivered successfully")) {
    return "Delivered successfully";
  }
  if (n.includes("đã hủy") || n.includes("đã huỷ") || n.includes("order cancelled")) {
    return "Order cancelled";
  }
  if (n.includes("hoàn hàng") || n.includes("hoàn về kho") || n.includes("return to warehouse")) {
    return "Return to warehouse";
  }
  if (n.includes("return in progress")) return "Return in progress";
  if (n.includes("goods received at warehouse") || n.includes("đã về kho")) {
    return "Returned to warehouse";
  }
  if (n.includes("order completed")) return "Order completed";
  return note;
}

/** Normalize API/history status text to English for timeline display. */
export function toEnglishStatusDescription(statusOrNote?: string | null): string {
  if (!statusOrNote?.trim()) return "";
  const raw = statusOrNote.trim();
  const normalized = raw.toLowerCase();

  if (ENGLISH_DISPLAY_LABELS[normalized]) {
    return ENGLISH_DISPLAY_LABELS[normalized]
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  if (VIETNAMESE_DISPLAY_STATUS_TO_UI[normalized]) {
    const ui = VIETNAMESE_DISPLAY_STATUS_TO_UI[normalized];
    if (ui === "cancelled") return "Cancelled";
    if (ui === "refunded") return "Refunded";
    if (normalized.includes("hoàn hàng")) return "Returning to warehouse";
    if (normalized.includes("về kho") && !normalized.includes("hoàn hàng")) {
      return "Returned to warehouse";
    }
    if (normalized.includes("hoàn tiền")) return "Refund processing";
    return "Delivering";
  }

  if (INTERNAL_STATUS_NAMES.has(normalized)) {
    return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
  }

  return translateLegacyHistoryNote(raw);
}

export function isCustomerOrderCancelled(
  statusName?: string | null,
  cancelledAt?: string | null,
): boolean {
  return (
    !!cancelledAt?.trim() || mapCustomerStatusNameToUi(statusName) === "cancelled"
  );
}

function parseTimelineTime(time: string): number {
  let dateStr = time;
  if (time.includes("T") && !time.endsWith("Z") && !time.includes("+")) {
    dateStr = time + "Z";
  }
  const ms = new Date(dateStr).getTime();
  return Number.isNaN(ms) ? 0 : ms;
}

/** Cutoff instant: no customer timeline events after this time. */
export function resolveCancellationCutoffMs(
  cancelledAt?: string | null,
  statusHistory?: CustomerOrderStatusHistory[],
  currentStatusName?: string | null,
): number | null {
  if (!isCustomerOrderCancelled(currentStatusName, cancelledAt)) return null;

  let cutoff: number | null = cancelledAt ? parseTimelineTime(cancelledAt) : null;

  statusHistory?.forEach((h) => {
    const note = h.note?.toLowerCase() ?? "";
    const isCancelEntry =
      mapCustomerStatusNameToUi(h.statusName) === "cancelled" ||
      note.includes("order cancelled") ||
      note.includes("cancelled");

    if (isCancelEntry) {
      const t = parseTimelineTime(h.createdAt);
      if (cutoff === null || t < cutoff) cutoff = t;
    }
  });

  return cutoff;
}

export function filterTimelineAfterCancellation(
  events: OrderTimelineEvent[],
  cutoffMs: number | null,
): OrderTimelineEvent[] {
  if (cutoffMs === null) return events;
  return events.filter((ev) => parseTimelineTime(ev.time) <= cutoffMs);
}

export interface BuildOrderTimelineOptions {
  cancelledAt?: string | null;
  currentStatusName?: string | null;
}

export function buildOrderTimelineEvents(
  trackingEvents: OrderTrackingEvent[],
  statusHistory: CustomerOrderStatusHistory[],
  options?: BuildOrderTimelineOptions,
): OrderTimelineEvent[] {
  const all: OrderTimelineEvent[] = [];

  trackingEvents.forEach((e) => {
    all.push({
      time: e.time,
      status: mapCustomerStatusNameToUi(e.status),
      description: toEnglishStatusDescription(e.description) || toEnglishStatusDescription(e.status),
    });
  });

  statusHistory.forEach((h) => {
    if (h.note && shouldHideOrderHistoryNote(h.note)) return;

    const note = h.note?.trim();
    const statusText = toEnglishStatusDescription(h.statusName);
    let description = statusText;

    if (note && note !== h.statusName) {
      const translatedNote = translateLegacyHistoryNote(note);
      description = description
        ? `${description} — ${translatedNote}`
        : translatedNote;
    }
    if (!description && note) {
      description = translateLegacyHistoryNote(note);
    }
    if (!description) return;

    all.push({
      time: h.createdAt,
      status: mapCustomerStatusNameToUi(h.statusName),
      description,
    });
  });

  const sorted = all
    .filter((ev) => ev.time)
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .filter(
      (ev, idx, self) =>
        idx ===
        self.findIndex(
          (t) => t.description === ev.description && t.time === ev.time,
        ),
    );

  const cutoff = resolveCancellationCutoffMs(
    options?.cancelledAt,
    statusHistory,
    options?.currentStatusName,
  );

  return filterTimelineAfterCancellation(sorted, cutoff);
}
