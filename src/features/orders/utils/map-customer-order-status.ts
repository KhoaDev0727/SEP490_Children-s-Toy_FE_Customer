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
  "deliveryfailed",
  "waitingreturn",
  "returnfailed",
  "lost",
  "damaged",
]);

/**
 * English display labels từ CustomerOrderDisplayStatusMapper (API statusName dạng display).
 * Tất cả các trạng thái vận chuyển, trả hàng và sự cố trung gian đều được gộp về tab "delivering".
 */
const ENGLISH_DISPLAY_STATUS_TO_UI: Record<string, OrderStatus> = {
  delivering: "delivering",
  "returning to shop": "delivering",
  "returning to warehouse": "delivering",
  "returned to shop": "delivering",      // GHN: đã về kho
  "return completed": "delivering",      // Hệ thống: hàng về kho, chờ hoàn tiền
  "delivery failed": "delivering",       // Giao thất bại
  "waiting return": "delivering",        // GHN: đang chờ shipper lấy về
  "return failed": "delivering",         // Hoàn hàng thất bại
  lost: "delivering",
  damaged: "delivering",
  "refund processing": "delivering",     // Đang xử lý hoàn tiền
  "returning to you": "delivering",
  "returned (rejected)": "completed",
  "return to you failed": "cancelled",
  cancelled: "cancelled",
  refunded: "refunded",
};

const ENGLISH_DISPLAY_LABELS: Record<string, string> = {
  delivering: "DELIVERING",
  "returning to shop": "RETURNING TO SHOP",
  "returning to warehouse": "RETURNING TO WAREHOUSE",
  "returned to shop": "RETURNED TO SHOP",
  "return completed": "RETURN COMPLETED",
  "delivery failed": "DELIVERY FAILED",
  "waiting return": "WAITING FOR RETURN",
  "return failed": "RETURN FAILED",
  lost: "LOST",
  damaged: "DAMAGED",
  "refund processing": "REFUND PROCESSING",
  "returning to you": "RETURNING TO YOU",
  "returned (rejected)": "RETURNED (REJECTED)",
  "return to you failed": "RETURN TO YOU FAILED",
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
  returning: "text-amber-600",
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
    case "waitingreturn":
    case "deliveryfailed":
    case "returnfailed":
    case "lost":
    case "damaged":
      return "delivering"; // Tất cả các trạng thái này gộp về tab delivering của khách
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
  apiDisplayLabel?: string | null;
  statusBucket?: OrderStatus;
}): CustomerOrderDisplay {
  const uiStatus = params.statusBucket ?? mapCustomerStatusNameToUi(params.statusName);
  const raw = params.statusName?.toLowerCase().trim() ?? "";

  let label = params.apiDisplayLabel
    ? params.apiDisplayLabel.toUpperCase()
    : resolveCustomerStatusDisplayLabel(params.statusName, uiStatus);
  let className = CUSTOMER_ORDER_STATUS_CLASS[uiStatus];

  if (uiStatus === "pending") {
    if (params.paymentMethod === "SHIP_COD") {
      label = "AWAITING CONFIRMATION";
    } else {
      label = "PENDING PAYMENT";
    }
  } else if (uiStatus === "shipping") {
    if (raw === "confirmed") label = "CONFIRMED";
    else if (raw === "processing") label = "PROCESSING";
    else if (raw === "shipped") label = "SHIPPED";
  } else if (uiStatus === "delivering") {
    if (raw === "delivering") {
      if (params.hasActiveRefund) {
        label = "REFUND REQUESTED";
        className = "text-sky-600";
      } else {
        label = "DELIVERING";
        className = "text-orange-600";
      }
    } else if (raw === "waitingreturn" || raw === "waiting return") {
      label = "WAITING FOR RETURN";
      className = "text-orange-600";
    } else if (raw === "returning" || raw === "returning to shop") {
      label = "RETURNING TO WAREHOUSE";
      className = "text-orange-600";
    } else if (raw === "returncompleted" || raw === "return completed") {
      if (params.hasActiveRefund) {
        label = "REFUND PROCESSING";
        className = "text-sky-600";
      } else {
        label = "RETURN COMPLETED";
        className = "text-amber-600";
      }
    } else if (raw === "refund processing") {
      label = "REFUND PROCESSING";
      className = "text-sky-600";
    } else if (raw === "lost") {
      if (params.hasActiveRefund) {
        label = "REFUND PROCESSING";
        className = "text-sky-600";
      } else {
        label = "LOST";
        className = "text-red-600";
      }
    } else if (raw === "damaged") {
      if (params.hasActiveRefund) {
        label = "REFUND PROCESSING";
        className = "text-sky-600";
      } else {
        label = "DAMAGED";
        className = "text-red-600";
      }
    } else if (raw === "deliveryfailed" || raw === "delivery failed") {
      if (params.hasActiveRefund) {
        label = "REFUND PROCESSING";
        className = "text-sky-600";
      } else {
        label = "DELIVERY FAILED";
        className = "text-red-600";
      }
    } else if (raw === "returnfailed" || raw === "return failed") {
      if (params.hasActiveRefund) {
        label = "REFUND PROCESSING";
        className = "text-sky-600";
      } else {
        label = "RETURN FAILED";
        className = "text-red-600";
      }
    }
  } else if (uiStatus === "cancelled") {
    // GHN failed delivery + system refund in progress → hiển thị trạng thái hoàn tiền thay vì "CANCELLED"
    if (params.hasActiveRefund) {
      label = "REFUND PROCESSING";
      className = "text-sky-600";
    } else {
      label = "CANCELLED";
      className = "text-red-600";
    }
  } else if (uiStatus === "refunded") {
    label = "REFUNDED";
    className = "text-sky-600";
  } else if (uiStatus === "completed") {
    if (raw === "delivered") {
      label = "DELIVERED";
      className = "text-emerald-600";
    } else {
      label = "COMPLETED";
      className = "text-emerald-600";
    }
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
    if (raw === "completed" || raw.includes("returned (rejected)")) return 4;
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
  "deliveryfailed",
  "waitingreturn",
  "returnfailed",
  "lost",
  "damaged",
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
        ? `${description}: (${translatedNote})`
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
