import { useState } from "react";

export interface ShippingEvent {
  time: string;
  status: string;
  description?: string | null;
}

interface ShippingTrackerProps {
  currentStatus?: string | null;
  events?: ShippingEvent[];
  hasActiveRefund?: boolean;
}

const STEPS = [
  { icon: "receipt_long", label: "Placed" },
  { icon: "inventory_2", label: "Processing" },
  { icon: "local_shipping", label: "Delivering" },
  { icon: "package_2", label: "Delivered" },
  { icon: "check_circle", label: "Completed" },
];

const getActiveStep = (status?: string | null): number => {
  if (!status) return 0;

  switch (status.toLowerCase()) {
    case "pending":
    case "confirmed":
      return 0;
    case "processing":
      return 1;
    case "shipped":
    case "delivering":
      return 2;
    case "delivered":
      return 3;
    case "completed":
      return 4;
    case "cancelled":
      return 0;
    default:
      return 0;
  }
};

/** Returns the status label shown in the badge — matches OrderCard labels in the order list. */
const getStatusBadgeLabel = (status?: string | null, activeStep?: number): string => {
  switch (status?.toLowerCase()) {
    case "pending":    return "Pending";
    case "confirmed":  return "Confirmed";
    case "processing": return "Processing";
    case "shipped":    return "Shipped";
    case "delivering": return "Delivering";
    case "delivered":  return "Delivered";
    case "completed":  return "Completed";
    default: return STEPS[activeStep ?? 0]?.label ?? "Pending";
  }
};

const formatEventTimeShort = (value?: string | null): string => {
  if (!value) return "";
  let dateStr = value;
  if (value.includes("T") && !value.endsWith("Z") && !value.includes("+")) {
    dateStr = value + "Z";
  }
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
  }).replace(",", "");
};

const formatEventTime = (value: string): string => {
  let dateStr = value;
  if (value.includes("T") && !value.endsWith("Z") && !value.includes("+")) {
    dateStr = value + "Z";
  }
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
  }).replace(",", " -") + " (GMT+7)";
};

export default function ShippingTracker({ currentStatus, events = [], hasActiveRefund = false }: ShippingTrackerProps) {
  const activeStep = getActiveStep(currentStatus);
  const statusLower = currentStatus?.toLowerCase() || "";
  const isCancelled = statusLower === "cancelled";
  const isRefunded = statusLower === "refunded" || hasActiveRefund;
  const isFinalStatus = isCancelled || isRefunded;
  const [showAll, setShowAll] = useState(false);

  // Helper to find time for each step from events
  const getStepTime = (stepIndex: number) => {
    if (events.length === 0) return "";

    // Map step indices to status keywords
    const statusMap: Record<number, string[]> = {
      0: ["pending", "confirmed"],
      1: ["processing"],
      2: ["shipped", "delivering"],
      3: ["delivered"],
      4: ["completed"],
    };

    const keywords = statusMap[stepIndex] || [];
    const event = events.find(e => keywords.includes(e.status.toLowerCase()));
    return event ? formatEventTimeShort(event.time) : "";
  };

  const sortedEvents = [...events]
    .filter((event) => event.time)
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  const historyItems = sortedEvents.length
    ? sortedEvents.map((event, index) => ({
      highlight: index === 0,
      title: event.description || `Status: ${event.status}`,
      time: formatEventTime(event.time),
      desc: event.description ? null : undefined,
    }))
    : [
      {
        highlight: true,
        title: isCancelled ? "Order has been cancelled" : isRefunded ? "Order has been refunded" : "Updating status...",
        time: "",
        desc: "",
      },
    ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-[#e2bfb0]/30">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#e2bfb0]/20">
        <h2 className="text-lg font-bold text-[#261812]">
          Order Status
        </h2>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${isCancelled ? "bg-red-50 border-red-100" : isRefunded ? "bg-blue-50 border-blue-100" : "bg-emerald-50 border-emerald-100"}`}>
          <div className={`w-2 h-2 rounded-full ${isCancelled ? "bg-red-500" : isRefunded ? "bg-blue-500" : "bg-emerald-500"}`} />
          <span className={`text-xs font-bold uppercase tracking-wider ${isCancelled ? "text-red-600" : isRefunded ? "text-blue-600" : "text-emerald-600"}`}>
            {isCancelled ? "Cancelled" : isRefunded ? (hasActiveRefund ? "Refund Requested" : "Refunded") : getStatusBadgeLabel(currentStatus, activeStep)}
          </span>
        </div>
      </div>

      {/* Step Tracker - Hidden for Cancelled/Refunded */}
      {!isFinalStatus ? (
        <div className="flex justify-between items-start relative mb-12 px-2">
          {STEPS.map((step, i) => {
            const isDone = i < activeStep;
            const isCurrent = i === activeStep;
            const isFuture = i > activeStep;

            const stepTime = getStepTime(i);

            return (
              <div key={step.label} className="flex-1 flex flex-col items-center relative">
                {/* Connector line to the left */}
                {i > 0 && (
                  <div
                    className={`absolute right-1/2 top-6 w-full h-[3px] transition-all duration-700 ${i <= activeStep
                      ? "bg-emerald-500"
                      : "bg-slate-100"
                      }`}
                  />
                )}

                <div
                  className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 border-2 ${isCurrent
                    ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-100 scale-110"
                    : isDone
                      ? "bg-white border-emerald-500 text-emerald-500 shadow-md shadow-emerald-50"
                      : "bg-white border-slate-200 text-slate-300"
                    }`}
                >
                  <span className={`material-symbols-outlined text-[24px]`}>
                    {step.icon}
                  </span>
                </div>

                <div className="absolute top-14 flex flex-col items-center w-max">
                  <span
                    className={`text-[10px] sm:text-[11px] font-bold transition-colors duration-500 text-center leading-tight ${isCurrent || isDone
                      ? "text-[#261812]"
                      : "text-slate-400"
                      }`}
                  >
                    {step.label}
                  </span>
                  {stepTime && (
                    <span className="text-[9px] text-slate-400 mt-0.5 whitespace-nowrap">
                      {stepTime}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center mb-10 py-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <span className={`material-symbols-outlined text-4xl mb-2 ${isCancelled ? "text-red-400" : "text-blue-400"}`}>
            {isCancelled ? "cancel" : "currency_exchange"}
          </span>
          <p className="text-sm font-bold text-slate-600">
            {isCancelled ? "This order has been cancelled" : hasActiveRefund ? "Refund has been requested" : "Order has been refunded"}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {isCancelled ? "If you have questions, please contact support" : hasActiveRefund ? "Our staff is reviewing your refund request" : "Refund has been returned to your wallet"}
          </p>
        </div>
      )}

      {/* Delivery History */}
      <div className="bg-[#fff1eb] rounded-xl p-4 border border-[#ffdbcc] flex flex-col">
        {historyItems.slice(0, showAll ? historyItems.length : 4).map((item, i) => {
          const isLast = i === (showAll ? historyItems.length : 4) - 1 || i === historyItems.length - 1;

          return (
            <div key={i} className="flex gap-4">
              <div className="relative flex flex-col items-center mt-1 flex-shrink-0 w-3">
                <div
                  className={`rounded-full relative z-10 ${item.highlight
                    ? "w-2.5 h-2.5 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                    : "w-2 h-2 bg-slate-300"
                    }`}
                />
                {!isLast && (
                  <div className={`absolute top-2 -bottom-1 left-1/2 -translate-x-1/2 w-px ${item.highlight ? "bg-emerald-200" : "bg-slate-200"}`} />
                )}
              </div>
              <div className={isLast ? "pb-1" : "pb-5"}>
                <p
                  className={`text-sm font-semibold ${item.highlight ? "text-[#261812]" : "text-slate-400"
                    }`}
                >
                  {item.title}
                </p>
                {item.time && (
                  <p className={`text-xs mt-0.5 ${item.highlight ? "text-slate-600" : "text-slate-400"}`}>{item.time}</p>
                )}
                {item.desc ? (
                  <p className={`text-xs mt-1 ${item.highlight ? "text-[#5a4136]" : "text-slate-300"}`}>{item.desc}</p>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>

      {historyItems.length > 4 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-sm text-emerald-600 font-semibold hover:underline w-full text-center mt-3"
        >
          {showAll ? "Show less" : "View full history"}
        </button>
      )}
    </div>
  );
}
