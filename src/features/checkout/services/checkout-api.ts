import axiosClient from "@/configs/axios-client";
import type {
  ApiResponse,
  CheckoutConfirmRequest,
  CheckoutConfirmResponse,
  CheckoutPaymentOptions,
  CheckoutPreviewRequest,
  CheckoutPreviewResponse,
  OrderPaymentInfo,
  PaymentStatusResponse,
  OrderTrackingResponse,
} from "@/features/checkout/types/checkout";

const unwrap = <T>(response: ApiResponse<T> | T): T => {
  if (response && typeof response === "object" && "success" in response) {
    const apiResponse = response as ApiResponse<T>;
    if (apiResponse.success && apiResponse.data) {
      return apiResponse.data;
    }

    const message = apiResponse.errors?.[0] ?? apiResponse.message ?? "Checkout failed.";
    throw new Error(message);
  }

  return response as T;
};

const extractCheckoutErrorMessage = (error: unknown, fallbackMessage: string): string => {
  if (!error || typeof error !== "object") {
    return fallbackMessage;
  }

  const maybeError = error as {
    message?: string;
    response?: {
      data?: {
        message?: string;
        errors?: string[] | null;
      };
    };
  };

  const data = maybeError.response?.data as
    | { message?: string; errors?: string[] | null; code?: string }
    | undefined;
  const apiError = data?.errors?.[0];
  const apiMessage = data?.message;

  if (typeof apiError === "string" && apiError.trim()) {
    return apiError;
  }

  if (typeof apiMessage === "string" && apiMessage.trim()) {
    return apiMessage;
  }

  if (typeof maybeError.message === "string" && maybeError.message.trim()) {
    return maybeError.message;
  }

  return fallbackMessage;
};

export const checkoutApi = {
  /** Tính phí ship + tổng đơn trước khi đặt. */
  previewCheckout: async (
    payload: CheckoutPreviewRequest,
  ): Promise<CheckoutPreviewResponse> => {
    try {
      const response = await axiosClient.post<
        CheckoutPreviewResponse | ApiResponse<CheckoutPreviewResponse>,
        CheckoutPreviewRequest
      >("/checkout/preview", payload);
      return unwrap(response);
    } catch (error) {
      throw new Error(
        extractCheckoutErrorMessage(error, "Unable to calculate shipping fee. Please try again."),
      );
    }
  },

  /** Đặt hàng. */
  confirmCheckout: async (
    payload: CheckoutConfirmRequest,
  ): Promise<CheckoutConfirmResponse> => {
    try {
      const response = await axiosClient.post<
        CheckoutConfirmResponse | ApiResponse<CheckoutConfirmResponse>,
        CheckoutConfirmRequest
      >("/checkout", payload);
      return unwrap(response);
    } catch (error) {
      throw new Error(
        extractCheckoutErrorMessage(error, "Unable to create order. Please try again."),
      );
    }
  },

  /** Lấy trạng thái thanh toán của đơn. */
  getPaymentStatus: async (orderId: number): Promise<PaymentStatusResponse> => {
    try {
      const response = await axiosClient.get<
        PaymentStatusResponse | ApiResponse<PaymentStatusResponse>
      >(`/orders/${orderId}/payment-status`);
      return unwrap(response);
    } catch (error) {
      throw new Error(
        extractCheckoutErrorMessage(error, "Unable to get payment status."),
      );
    }
  },

  /** Lấy trạng thái giao hàng. */
  getOrderTracking: async (orderId: number): Promise<OrderTrackingResponse> => {
    try {
      const response = await axiosClient.get<
        OrderTrackingResponse | ApiResponse<OrderTrackingResponse>
      >(`/orders/${orderId}/tracking`);
      return unwrap(response);
    } catch (error) {
      throw new Error(
        extractCheckoutErrorMessage(error, "Unable to get shipping information."),
      );
    }
  },
  /** Cancel đơn hàng.
   * @param restoreCart true = khôi phục giỏ hàng sau cancel (dùng cho luồng Payment QR).
   *                    false (mặc định) = KHÔNG khôi phục giỏ hàng (Order Detail / History).
   */
  cancelOrder: async (orderId: number, reason?: string, restoreCart = false): Promise<void> => {
    try {
      await axiosClient.post(`/orders/${orderId}/cancel`, { reason, restoreCart });
    } catch (error) {
      throw new Error(
        extractCheckoutErrorMessage(error, "Unable to cancel order. Please contact support."),
      );
    }
  },

  getPaymentOptions: async (): Promise<CheckoutPaymentOptions> => {
    try {
      const response = await axiosClient.get<
        CheckoutPaymentOptions | ApiResponse<CheckoutPaymentOptions>
      >("/checkout/payment-options");
      return unwrap(response);
    } catch {
      return {
        isCodRestricted: false,
        suspiciousDeliveryFailOrderCount: 0,
        codRestrictionReason: null,
      };
    }
  },

  /**
   * Kiểm tra xem user có đơn SE_PAY PENDING nào không.
   * Trả về orderId nếu có (và chưa hết hạn), null nếu không.
   * Khi tìm thấy đơn, validate thêm expiresAt từ payment-status để tránh
   * hiện banner stale khi backend expiry job chưa kịp chạy.
   */
  getPendingSepayOrder: async (): Promise<{ orderId: number; orderCode: string } | null> => {
    try {
      const response = await axiosClient.get<
        { items?: Array<{ orderId: number; orderCode: string; paymentMethod: string; paymentStatus: string }> } | null
      >("/orders", { params: { status: "pending", pageSize: 10 } });
      const data = response as { items?: Array<{ orderId: number; orderCode: string; paymentMethod: string; paymentStatus: string }> } | null;
      const items = data?.items ?? [];
      const pending = items.find(
        (o) => o.paymentMethod === "SE_PAY" && o.paymentStatus === "PENDING",
      );
      if (!pending) return null;

      // Double-check expiry client-side: backend job runs every ~1 min so the order
      // may already be past its TTL but not yet cancelled in the DB.
      try {
        const statusResponse = await axiosClient.get<
          { paymentStatus?: string; expiresAt?: string | null } | null
        >(`/orders/${pending.orderId}/payment-status`);
        const status = statusResponse as { paymentStatus?: string; expiresAt?: string | null } | null;
        // If server already flipped the status, or TTL has passed client-side → treat as gone
        const isNoLongerPending = status?.paymentStatus && status.paymentStatus !== "PENDING";
        const isExpiredByTime = status?.expiresAt ? new Date(status.expiresAt) < new Date() : false;
        if (isNoLongerPending || isExpiredByTime) return null;
      } catch {
        // payment-status call failed — fall through and show the banner (safe default)
      }

      return { orderId: pending.orderId, orderCode: pending.orderCode };
    } catch {
      return null;
    }
  },


  /** Lấy thông tin thanh toán nhạy cảm (QR, amount, attemptCode) từ API thay vì URL. */
  getPaymentInfo: async (orderId: number): Promise<OrderPaymentInfo> => {
    try {
      const response = await axiosClient.get<
        OrderPaymentInfo | ApiResponse<OrderPaymentInfo>
      >(`/orders/${orderId}/payment-info`);
      return unwrap(response);
    } catch (error) {
      throw new Error(
        extractCheckoutErrorMessage(error, "Unable to retrieve payment information."),
      );
    }
  },
};
