export interface CheckoutConfirmItem {
  productId: number;
  quantity: number;
}

export interface CheckoutConfirmRequest {
  addressId: number;
  paymentMethod: string;
  orderVoucherCode?: string;
  shippingVoucherCode?: string;
  voucherCode?: string;
  voucherDiscountAmount: number;
  note?: string;
  items: CheckoutConfirmItem[];
}

export interface CheckoutConfirmResponse {
  orderId: number;
  orderCode: string;
  totalAmount: number;
  shippingFee?: number;
  shippingOrderCode?: string;
  estimatedDeliveryTime?: string;
  paymentMethod: string;
  paymentStatus: string;
  /** SE_PAY: mã nhúng vào nội dung chuyển khoản */
  paymentAttemptCode?: string;
  /** SE_PAY: URL ảnh QR */
  qrImageUrl?: string;
}

export interface CheckoutPreviewRequest {
  addressId: number;
  orderVoucherCode?: string;
  shippingVoucherCode?: string;
  voucherCode?: string;
  /** Dòng đã chọn (khớp confirm). Không gửi = preview toàn bộ giỏ trên server. */
  items?: CheckoutConfirmItem[];
}

export interface CheckoutPreviewItemError {
  productId: number;
  productName: string;
  error: string;
}

export interface CheckoutPreviewResponse {
  subTotal: number;
  shippingFee: number;
  discountAmount: number;
  orderDiscountAmount?: number;
  shippingDiscountAmount?: number;
  totalAmount: number;
  totalWeightGrams: number;
  estimatedDeliveryTime?: string;
  itemErrors: CheckoutPreviewItemError[];
}

export interface RetryPaymentResponse {
  paymentAttemptCode: string;
  qrImageUrl: string;
  totalAmount: number;
}

export interface PaymentStatusResponse {
  orderId: number;
  orderCode: string;
  paymentStatus: string;
  paidAt?: string | null;
  expiresAt?: string | null;
}

export interface OrderTrackingEvent {
  time: string;
  status: string;
  location?: string;
  description?: string;
}

export interface OrderTrackingResponse {
  orderId: number;
  orderCode: string;
  shippingOrderCode?: string;
  currentStatus?: string;
  statusDescription?: string;
  estimatedDelivery?: string;
  events: OrderTrackingEvent[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  errors?: string[] | null;
}

/** Thông tin thanh toán nhạy cảm — fetch từ API thay vì lấy từ URL */
export interface OrderPaymentInfo {
  orderId: number;
  orderCode: string;
  amount: number;
  paymentAttemptCode: string;
  qrImageUrl: string;
  expiresAt?: string | null;
}
