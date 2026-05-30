"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { flashSaleApi } from "@/features/home/services/flash-sale-api";
import {
  FlashSalePromotion,
  FlashSaleTimeSlot,
  FlashSaleProduct,
  FlashSaleDate,
  SlotRuntimeStatus,
} from "@/features/home/types/flash-sale";

// ============================================================
// Helpers
// ============================================================

/** Chuyển UTC ISO string sang Date object local */
function toLocal(utcStr: string): Date {
  if (!utcStr) return new Date();
  // Nếu chuỗi không có 'Z' hoặc offset '+/-', ép nó về UTC bằng cách thêm 'Z'
  if (!utcStr.endsWith("Z") && !utcStr.includes("+") && utcStr.includes("T")) {
    return new Date(utcStr + "Z");
  }
  return new Date(utcStr);
}

/** Format ngày local → "YYYY-MM-DD" (dùng làm key) */
function toDateKey(date: Date): FlashSaleDate {
  return date.toISOString().slice(0, 10);
}

/** Format ngày hiển thị: "Thứ N, dd/mm" */
function formatDateLabel(dateKey: FlashSaleDate): string {
  const date = new Date(dateKey + "T00:00:00");
  const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  const dayName = dayNames[date.getDay()];
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  return `${dayName}, ${dd}/${mm}`;
}

/** Format khung giờ: "HH:mm – HH:mm" */
function formatTimeRange(startAt: string, endAt: string): string {
  const start = toLocal(startAt);
  const end = toLocal(endAt);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(start.getHours())}:${pad(start.getMinutes())} – ${pad(end.getHours())}:${pad(end.getMinutes())}`;
}

/** Tính trạng thái real-time của slot */
function getSlotStatus(slot: FlashSaleTimeSlot, now: Date): SlotRuntimeStatus {
  const start = toLocal(slot.startAt);
  const end = toLocal(slot.endAt);
  if (now >= start && now < end) return "active";
  if (now < start) return "upcoming";
  return "expired";
}

/** Tìm ngày mặc định: ngày gần nhất có slot active hoặc upcoming */
function findDefaultDate(
  slots: FlashSaleTimeSlot[],
  now: Date,
): FlashSaleDate | null {
  // Group slots by date
  const dateSet = new Set<FlashSaleDate>();
  slots.forEach((s) => {
    const localStart = toLocal(s.startAt);
    dateSet.add(toDateKey(localStart));
  });

  const dates = Array.from(dateSet).sort();

  // Ưu tiên ngày có active/upcoming slot
  for (const dateKey of dates) {
    const daySlots = slots.filter(
      (s) => toDateKey(toLocal(s.startAt)) === dateKey,
    );
    const hasRelevant = daySlots.some((s) => {
      const st = getSlotStatus(s, now);
      return st === "active" || st === "upcoming";
    });
    if (hasRelevant) return dateKey;
  }

  // Fallback: ngày đầu tiên trong list
  return dates[0] ?? null;
}

/** Tìm slot mặc định trong ngày: active → upcoming gần nhất → null */
function findDefaultSlot(
  slots: FlashSaleTimeSlot[],
  dateKey: FlashSaleDate,
  now: Date,
): FlashSaleTimeSlot | null {
  const daySlots = slots
    .filter((s) => toDateKey(toLocal(s.startAt)) === dateKey)
    .sort(
      (a, b) => toLocal(a.startAt).getTime() - toLocal(b.startAt).getTime(),
    );

  // Active slot
  const active = daySlots.find((s) => getSlotStatus(s, now) === "active");
  if (active) return active;

  // Upcoming gần nhất
  const upcoming = daySlots.find((s) => getSlotStatus(s, now) === "upcoming");
  if (upcoming) return upcoming;

  return null;
}

// ============================================================
// Hook Return Type
// ============================================================

export interface UseFlashSaleReturn {
  // Data
  promotions: FlashSalePromotion[];
  isLoading: boolean;
  error: string | null;

  // Selection state
  selectedPromotionId: number | null;
  selectedDate: FlashSaleDate | null;
  selectedSlotId: number | null;

  // Derived data
  availableDates: FlashSaleDate[];
  timeSlotsForDate: FlashSaleTimeSlot[];
  productsForSlot: FlashSaleProduct[];
  selectedSlot: FlashSaleTimeSlot | null;
  selectedPromotion: FlashSalePromotion | null;

  // Countdown
  countdown: { d: number; h: number; m: number; s: number } | null;
  countdownLabel: string;

  // Actions
  selectPromotion: (id: number) => void;
  selectDate: (dateKey: FlashSaleDate) => void;
  selectSlot: (slotId: number) => void;

  // Helpers
  getSlotRuntimeStatus: (slot: FlashSaleTimeSlot) => SlotRuntimeStatus;
  formatTimeRange: (startAt: string, endAt: string) => string;
  formatDateLabel: (dateKey: FlashSaleDate) => string;
  isToday: (dateKey: FlashSaleDate) => boolean;
}

// ============================================================
// Hook Implementation
// ============================================================

// ============================================================
// Hook Implementation
// ============================================================

export function useFlashSale(): UseFlashSaleReturn {
  const [promotions, setPromotions] = useState<FlashSalePromotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  const [selectedPromotionId, setSelectedPromotionId] = useState<number | null>(
    null,
  );
  const [selectedDate, setSelectedDate] = useState<FlashSaleDate | null>(null);

  // Đổi tên thành manualSlotId: Chỉ lưu giá trị khi USER TỰ CLICK
  const [manualSlotId, setManualSlotId] = useState<number | null>(null);

  // Countdown state
  const [now, setNow] = useState(() => new Date());
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Fetch data ──────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await flashSaleApi.getFlashSalePromotions();
        if (cancelled) return;

        const nowTs = new Date();
        const validData = data
          .map((p) => ({
            ...p,
            // Loại bỏ hẳn những slot trống khỏi mảng time slots
            promotionTimeSlots:
              p.promotionTimeSlots?.filter(
                (ts) =>
                  ts.promotionProductSlots &&
                  ts.promotionProductSlots.length > 0
              ) || [],
          }))
          .filter((p) => {
            if (toLocal(p.endDate) < nowTs) return false;
            // Giữ lại promotion nếu sau khi lọc, nó vẫn còn ít nhất 1 slot
            return p.promotionTimeSlots.length > 0;
          });

        setPromotions(validData);

        if (validData.length > 0) {
          const firstPromo = validData[0];
          setSelectedPromotionId(firstPromo.promotionId);

          const defaultDate = findDefaultDate(
            firstPromo.promotionTimeSlots,
            nowTs,
          );
          setSelectedDate(defaultDate);

          if (defaultDate) {
            const defaultSlot = findDefaultSlot(
              firstPromo.promotionTimeSlots,
              defaultDate,
              nowTs,
            );
            setManualSlotId(defaultSlot?.timeSlotId ?? null);
          }
        }
      } catch {
        if (!cancelled) setError("Unable to load Flash Sale. Please try again.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // ── Real-time ticker (mỗi giây) ────────────────────────────
  useEffect(() => {
    tickRef.current = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, []);

  // ── Deep-link: ?flashSale={promotionId} ─────────────────────
  useEffect(() => {
    const paramId = searchParams.get("flashSale");
    if (!paramId || isLoading) return;
    const id = parseInt(paramId, 10);
    if (isNaN(id)) return;

    const promo = promotions.find((p) => p.promotionId === id);
    if (!promo) {
      toast("This flash sale has ended or is no longer available.");
      return;
    }
    selectPromotion(id);
    // Scroll to the flash sale section
    const el = document.getElementById("flash-sale");
    if (el) {
      setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 200);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, searchParams]);

  // ── Derived: active promotions ─────────────────────────────
  const activePromotions = promotions.filter((p) => toLocal(p.endDate) >= now);

  const selectedPromotion =
    activePromotions.find((p) => p.promotionId === selectedPromotionId) ?? null;

  const availableDates: FlashSaleDate[] = selectedPromotion
    ? Array.from(
      new Set(
        selectedPromotion.promotionTimeSlots.map((s) =>
          toDateKey(toLocal(s.startAt)),
        ),
      ),
    ).sort()
    : [];

  const timeSlotsForDate: FlashSaleTimeSlot[] = selectedPromotion
    ? selectedPromotion.promotionTimeSlots
      .filter(
        (s) =>
          selectedDate !== null &&
          toDateKey(toLocal(s.startAt)) === selectedDate,
      )
      .sort(
        (a, b) => toLocal(a.startAt).getTime() - toLocal(b.startAt).getTime(),
      )
    : [];

  // ── Tự động tính toán Slot (Khắc phục lỗi cascading renders) ──
  let selectedSlot: FlashSaleTimeSlot | null = null;
  let selectedSlotId: number | null = manualSlotId;

  if (manualSlotId !== null) {
    const manualSlot = timeSlotsForDate.find(
      (s) => s.timeSlotId === manualSlotId,
    );

    // Nếu slot người dùng chọn vẫn còn Active hoặc Upcoming thì giữ nguyên
    if (manualSlot && getSlotStatus(manualSlot, now) !== "expired") {
      selectedSlot = manualSlot;
    } else {
      // Nếu slot đã hết hạn (expired), tự động tìm slot tiếp theo
      const currentIndex = timeSlotsForDate.findIndex(
        (s) => s.timeSlotId === manualSlotId,
      );
      const nextSlot =
        currentIndex >= 0 ? timeSlotsForDate[currentIndex + 1] : undefined;

      if (nextSlot) {
        selectedSlot = nextSlot;
        selectedSlotId = nextSlot.timeSlotId;
      } else {
        // Fallback về logic mặc định nếu không có slot tiếp theo
        const fallbackSlot = findDefaultSlot(
          selectedPromotion?.promotionTimeSlots ?? [],
          selectedDate ?? "",
          now,
        );
        selectedSlot = fallbackSlot;
        selectedSlotId = fallbackSlot?.timeSlotId ?? null;
      }
    }
  } else if (selectedPromotion && selectedDate) {
    // Nếu chưa có slot nào được chọn, lấy slot mặc định
    const defaultSlot = findDefaultSlot(
      selectedPromotion.promotionTimeSlots,
      selectedDate,
      now,
    );
    selectedSlot = defaultSlot;
    selectedSlotId = defaultSlot?.timeSlotId ?? null;
  }

  const productsForSlot: FlashSaleProduct[] =
    selectedSlot?.promotionProductSlots ?? [];

  // ── Countdown ──────────────────────────────────────────────
  let countdown: { d: number; h: number; m: number; s: number } | null = null;
  let countdownLabel = "Ends in:";

  if (selectedSlot) {
    const status = getSlotStatus(selectedSlot, now);
    let target: Date | null = null;

    if (status === "active") {
      target = toLocal(selectedSlot.endAt);
      countdownLabel = "Ends in:";
    } else if (status === "upcoming") {
      target = toLocal(selectedSlot.startAt);
      countdownLabel = "Starts in:";
    } else {
      countdownLabel = "Ended";
    }

    if (target) {
      const diffMs = Math.max(0, target.getTime() - now.getTime());
      const totalSec = Math.floor(diffMs / 1000);
      countdown = {
        d: Math.floor(totalSec / 86400),
        h: Math.floor((totalSec % 86400) / 3600),
        m: Math.floor((totalSec % 3600) / 60),
        s: totalSec % 60,
      };
    }
  }

  // ── Actions ────────────────────────────────────────────────
  const selectPromotion = useCallback(
    (id: number) => {
      if (id === selectedPromotionId) return;
      setSelectedPromotionId(id);

      const promo = promotions.find((p) => p.promotionId === id);
      if (!promo) return;

      const nowTs = new Date();
      const defaultDate = findDefaultDate(promo.promotionTimeSlots, nowTs);
      setSelectedDate(defaultDate);

      if (defaultDate) {
        const defaultSlot = findDefaultSlot(
          promo.promotionTimeSlots,
          defaultDate,
          nowTs,
        );
        setManualSlotId(defaultSlot?.timeSlotId ?? null); // Đổi thành setManualSlotId
      } else {
        setManualSlotId(null);
      }
    },
    [promotions, selectedPromotionId],
  );

  const selectDate = useCallback(
    (dateKey: FlashSaleDate) => {
      if (dateKey === selectedDate) return;
      setSelectedDate(dateKey);

      const promo = promotions.find(
        (p) => p.promotionId === selectedPromotionId,
      );
      if (!promo) return;

      const nowTs = new Date();
      const defaultSlot = findDefaultSlot(
        promo.promotionTimeSlots,
        dateKey,
        nowTs,
      );
      setManualSlotId(defaultSlot?.timeSlotId ?? null); // Đổi thành setManualSlotId
    },
    [promotions, selectedPromotionId, selectedDate],
  );

  const selectSlot = useCallback((slotId: number) => {
    setManualSlotId(slotId); // Đổi thành setManualSlotId
  }, []);

  // ── Helpers exposed ────────────────────────────────────────
  const getSlotRuntimeStatus = useCallback(
    (slot: FlashSaleTimeSlot): SlotRuntimeStatus => getSlotStatus(slot, now),
    [now],
  );

  const isToday = useCallback((dateKey: FlashSaleDate): boolean => {
    return toDateKey(new Date()) === dateKey;
  }, []);

  return {
    promotions: activePromotions,
    isLoading,
    error,
    selectedPromotionId,
    selectedDate,
    selectedSlotId, // Đây là derived value, luôn trả về ID đang thực sự hiển thị
    availableDates,
    timeSlotsForDate,
    productsForSlot,
    selectedSlot,
    selectedPromotion,
    countdown,
    countdownLabel,
    selectPromotion,
    selectDate,
    selectSlot,
    getSlotRuntimeStatus,
    formatTimeRange,
    formatDateLabel,
    isToday,
  };
}
