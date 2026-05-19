export const formatCurrency = (value?: number | null): string => {
  if (value === null || value === undefined) return "Contact";
  return `${value.toLocaleString("vi-VN")} VND`;
};

export const formatMysteryPrice = (value?: number | null): string => {
  if (value === null || value === undefined) return "??? VND";
  const formatted = value.toLocaleString("vi-VN");
  const parts = formatted.split(".");
  if (parts.length > 1) {
    const lastPart = parts[parts.length - 1];
    const maskedParts = parts.slice(0, parts.length - 1).map(p => "?".repeat(p.length));
    return `${maskedParts.join(".")}.${lastPart} VND`;
  }
  return `${"?".repeat(formatted.length)} VND`;
};

export const formatDateTime = (value?: string | null): string => {
  if (!value) return "Updating";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Updating";
  return date.toLocaleString("vi-VN");
};
