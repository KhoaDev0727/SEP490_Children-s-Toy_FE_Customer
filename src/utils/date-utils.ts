/**
 * Đảm bảo chuỗi ngày tháng từ API được chuẩn hóa sang ISO 8601
 * Hỗ trợ các trường hợp server trả về thiếu Z hoặc dùng khoảng trắng thay vì T
 */
const normalizeDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "";
  let formatted = dateString.replace(" ", "T");
  // Nếu thiếu múi giờ (Z hoặc +), tạm thời coi là UTC nhưng sẽ kiểm tra lại khi parse
  if (!formatted.includes("Z") && !formatted.includes("+") && formatted.includes("T")) {
    // Không ép Z ở đây, để hàm parse quyết định dựa trên so sánh thời gian
  }
  return formatted;
};

/**
 * Hàm parse date thông minh: 
 * Ưu tiên UTC (nếu thiếu Z thì thêm Z), nhưng nếu kết quả ở tương lai (do server thực chất gửi Local)
 * thì sẽ fallback lại parse Local.
 */
export const smartParseDate = (dateString: string | null | undefined): Date => {
  if (!dateString) return new Date(NaN);
  
  const normalized = normalizeDate(dateString);
  const now = new Date();
  
  // 1. Thử parse coi như UTC (thêm Z nếu thiếu)
  const utcCandidate = new Date(normalized.includes("Z") || normalized.includes("+") ? normalized : normalized + "Z");
  
  // 2. Nếu parse lỗi hoặc ở tương lai quá 1 phút -> khả năng cao là chuỗi Local
  if (isNaN(utcCandidate.getTime()) || utcCandidate.getTime() > now.getTime() + 60000) {
    return new Date(normalized);
  }
  
  return utcCandidate;
};

/**
 * Hiển thị thời gian kiểu "X phút trước", "Y giờ trước"
 */
export const formatTimeAgo = (dateString: string | null | undefined): string => {
  const date = smartParseDate(dateString);
  if (isNaN(date.getTime())) return "---";

  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const min = Math.floor(diff / 60000);

  if (min < 1) return "Vừa xong";
  if (min < 60) return `${min} phút trước`;

  const hours = Math.floor(min / 60);
  if (hours < 24) return `${hours} giờ trước`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} ngày trước`;

  return date.toLocaleDateString("vi-VN");
};

/**
 * Định dạng ngày giờ đầy đủ (HH:mm - dd/MM/yyyy)
 */
export const formatFullDateTime = (dateString: string | null | undefined, fallback = "---"): string => {
  const date = smartParseDate(dateString);
  if (isNaN(date.getTime())) return fallback;

  const time = date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  const day = date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  
  return `${time} - ${day}`;
};

/**
 * UTC (API) -> Local (Input datetime-local)
 * Dùng cho các form input trong tương lai nếu có
 */
export const formatUTCtoLocal = (dateString: string | null | undefined): string => {
  const date = smartParseDate(dateString);
  if (isNaN(date.getTime())) return "";
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

/**
 * Local (Input) -> UTC String (API)
 */
export const formatLocalToUTC = (dateString: string | null | undefined): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return !isNaN(date.getTime()) ? date.toISOString() : "";
};
