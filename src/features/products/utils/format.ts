export const formatCurrency = (value?: number | null): string => {
  if (value === null || value === undefined) return "Contact";
  return `${value.toLocaleString("vi-VN")} VND`;
};

export const formatDateTime = (value?: string | null): string => {
  if (!value) return "Updating";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Updating";
  return date.toLocaleString("vi-VN");
};
