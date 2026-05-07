export const formatCurrency = (value?: number | null): string => {
  if (value === null || value === undefined) return "Liên hệ";
  return `${value.toLocaleString("vi-VN")}đ`;
};

export const formatDateTime = (value?: string | null): string => {
  if (!value) return "Đang cập nhật";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Đang cập nhật";
  return date.toLocaleString("vi-VN");
};
