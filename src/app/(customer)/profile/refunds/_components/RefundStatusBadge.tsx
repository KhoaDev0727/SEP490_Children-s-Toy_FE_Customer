import type { RefundStatus } from "@/features/refunds/types/refunds";

interface RefundStatusBadgeProps {
  status: string;
  size?: "sm" | "md";
}

const STATUS_CONFIG: Partial<Record<
  RefundStatus,
  { label: string; bg: string; text: string; border: string }
>> = {
  // ── Dạng đầy đủ (Refund* prefix) ─────────────────────────────
  RefundRequested: {
    label: "Pending Approval",
    bg: "#fffbeb",
    text: "#b45309",
    border: "#fde68a",
  },
  RefundApproved: {
    label: "Approved",
    bg: "#f0fdf4",
    text: "#15803d",
    border: "#bbf7d0",
  },
  RefundPickupCreated: {
    label: "Awaiting Pickup",
    bg: "#eff6ff",
    text: "#1d4ed8",
    border: "#bfdbfe",
  },
  RefundShipping: {
    label: "In Transit",
    bg: "#eff6ff",
    text: "#1d4ed8",
    border: "#bfdbfe",
  },
  RefundReceived: {
    label: "Received at Warehouse",
    bg: "#eff6ff",
    text: "#1d4ed8",
    border: "#bfdbfe",
  },
  RefundInspectionPending: {
    label: "Under Review",
    bg: "#fffbeb",
    text: "#b45309",
    border: "#fde68a",
  },
  RefundCompleted: {
    label: "Refunded",
    bg: "#f0fdf4",
    text: "#15803d",
    border: "#bbf7d0",
  },
  RefundRejected: {
    label: "Rejected",
    bg: "#fef2f2",
    text: "#b91c1c",
    border: "#fecaca",
  },
  RefundCancelled: {
    label: "Cancelled",
    bg: "#f8fafc",
    text: "#64748b",
    border: "#e2e8f0",
  },

  // ── Legacy (không có prefix Refund) ──────────────────────────
  Requested: {
    label: "Pending Approval",
    bg: "#fffbeb",
    text: "#b45309",
    border: "#fde68a",
  },
  Approved: {
    label: "Approved",
    bg: "#f0fdf4",
    text: "#15803d",
    border: "#bbf7d0",
  },
  Rejected: {
    label: "Rejected",
    bg: "#fef2f2",
    text: "#b91c1c",
    border: "#fecaca",
  },
  Completed: {
    label: "Refunded",
    bg: "#f0fdf4",
    text: "#15803d",
    border: "#bbf7d0",
  },
  Cancelled: {
    label: "Cancelled",
    bg: "#f8fafc",
    text: "#64748b",
    border: "#e2e8f0",
  },
  Processing: {
    label: "Processing",
    bg: "#eff6ff",
    text: "#1d4ed8",
    border: "#bfdbfe",
  },
};

const FALLBACK = {
  label: "Processing",
  bg: "#f8fafc",
  text: "#64748b",
  border: "#e2e8f0",
};

export default function RefundStatusBadge({
  status,
  size = "md",
}: RefundStatusBadgeProps) {
  const config = STATUS_CONFIG[status as RefundStatus] ?? { ...FALLBACK, label: status };

  const textSize = size === "sm" ? "text-[10px]" : "text-xs";
  const px = size === "sm" ? "px-2 py-0.5" : "px-3 py-1";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-bold uppercase ${textSize} ${px}`}
      style={{ background: config.bg, color: config.text, borderColor: config.border }}
    >
      <span
        className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ background: config.text }}
      />
      {config.label}
    </span>
  );
}

