import type { RefundStatus } from "@/features/refunds/types/refunds";

interface RefundStatusBadgeProps {
  status: string;
  size?: "sm" | "md";
}

const STATUS_CONFIG: Record<
  RefundStatus,
  { label: string; bg: string; text: string; dot: string }
> = {
  Requested: {
    label: "Requested",
    bg: "#fffbeb",
    text: "#b45309",
    dot: "#f59e0b",
  },
  Approved: {
    label: "Approved",
    bg: "#eff6ff",
    text: "#1d4ed8",
    dot: "#3b82f6",
  },
  Completed: {
    label: "Completed",
    bg: "#f0fdf4",
    text: "#15803d",
    dot: "#22c55e",
  },
  Rejected: {
    label: "Rejected",
    bg: "#fef2f2",
    text: "#b91c1c",
    dot: "#ef4444",
  },
  Cancelled: {
    label: "Cancelled",
    bg: "#f8fafc",
    text: "#64748b",
    dot: "#94a3b8",
  },
};

const FALLBACK = {
  label: "Unknown",
  bg: "#f8fafc",
  text: "#64748b",
  dot: "#94a3b8",
};

export default function RefundStatusBadge({
  status,
  size = "md",
}: RefundStatusBadgeProps) {
  const config =
    STATUS_CONFIG[status as RefundStatus] ?? { ...FALLBACK, label: status };

  const textSize = size === "sm" ? "text-xs" : "text-sm";

  return (
    <span className={`${textSize} font-bold uppercase`} style={{ color: config.text }}>
      {config.label}
    </span>
  );
}
