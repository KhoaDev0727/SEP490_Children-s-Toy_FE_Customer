import axiosClient from "@/configs/axios-client";
import type {
  ApiResponse,
  CheckoutConfirmRequest,
  CheckoutConfirmResponse,
  CheckoutPreviewRequest,
  CheckoutPreviewResponse,
  PaymentStatusResponse,
  RetryPaymentResponse,
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

  /** Sinh QR mới cho đơn SE_PAY chưa thanh toán. */
  retryPayment: async (orderId: number): Promise<RetryPaymentResponse> => {
    try {
      const response = await axiosClient.post<
        RetryPaymentResponse | ApiResponse<RetryPaymentResponse>
      >(`/checkout/retry-payment/${orderId}`);
      return unwrap(response);
    } catch (error) {
      throw new Error(
        extractCheckoutErrorMessage(error, "Unable to generate a new QR code. Please try again."),
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
  /** Cancel đơn hàng. */
  cancelOrder: async (orderId: number, reason?: string): Promise<void> => {
    try {
      await axiosClient.post(`/orders/${orderId}/cancel`, { reason });
    } catch (error) {
      throw new Error(
        extractCheckoutErrorMessage(error, "Unable to cancel order. Please contact support."),
      );
    }
  },
};
