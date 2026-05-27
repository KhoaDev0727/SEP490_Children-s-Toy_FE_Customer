import type { RefundStatus } from "@/features/refunds/types/refunds";

interface RefundStatusBadgeProps {
  status: string;
  size?: "sm" | "md";
}

const STATUS_CONFIG: Record<
  RefundStatus,
  { label: string; bg: string; text: string; dot: string }
> = {
  RefundRequested: {
    label: "Chờ phê duyệt",
    bg: "#fffbeb",
    text: "#b45309",
    dot: "#f59e0b",
  },
  RefundApproved: {
    label: "Đã duyệt",
    bg: "#f0fdf4",
    text: "#15803d",
    dot: "#22c55e",
  },
  RefundPickupCreated: {
    label: "Đã tạo đơn thu hồi",
    bg: "#eff6ff",
    text: "#1d4ed8",
    dot: "#3b82f6",
  },
  RefundShipping: {
    label: "Đang vận chuyển thu hồi",
    bg: "#eff6ff",
    text: "#1d4ed8",
    dot: "#3b82f6",
  },
  RefundReceived: {
    label: "Đã nhận hàng trả",
    bg: "#eff6ff",
    text: "#1d4ed8",
    dot: "#3b82f6",
  },
  RefundInspectionPending: {
    label: "Đang kiểm tra chất lượng",
    bg: "#fffbeb",
    text: "#b45309",
    dot: "#f59e0b",
  },
  RefundCompleted: {
    label: "Đã hoàn tiền",
    bg: "#f0fdf4",
    text: "#15803d",
    dot: "#22c55e",
  },
  RefundRejected: {
    label: "Bị từ chối",
    bg: "#fef2f2",
    text: "#b91c1c",
    dot: "#ef4444",
  },
  RefundCancelled: {
    label: "Đã hủy",
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
