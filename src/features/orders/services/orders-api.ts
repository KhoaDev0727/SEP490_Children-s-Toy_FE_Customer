import axiosClient from "@/configs/axios-client";
import type {
  ApiResponse,
  CustomerOrderDetail,
  CustomerOrderListItem,
  CustomerOrderListQuery,
  PaginatedResponse,
} from "@/features/orders/types/orders";

const unwrap = <T>(response: ApiResponse<T> | T): T => {
  if (response && typeof response === "object" && "success" in response) {
    const apiResponse = response as ApiResponse<T>;
    if (apiResponse.success && apiResponse.data) {
      return apiResponse.data;
    }

    const message = apiResponse.errors?.[0] ?? apiResponse.message ?? "Request failed.";
    throw new Error(message);
  }

  return response as T;
};

const extractOrderErrorMessage = (error: unknown, fallbackMessage: string): string => {
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

export const ordersApi = {
  getOrderList: async (
    query: CustomerOrderListQuery,
  ): Promise<PaginatedResponse<CustomerOrderListItem>> => {
    try {
      const response = await axiosClient.get<
        PaginatedResponse<CustomerOrderListItem> | ApiResponse<PaginatedResponse<CustomerOrderListItem>>
      >("/orders", { params: query });
      return unwrap(response);
    } catch (error) {
      throw new Error(
        extractOrderErrorMessage(error, "Không thể tải danh sách đơn hàng."),
      );
    }
  },
  getOrderDetail: async (orderId: number): Promise<CustomerOrderDetail> => {
    try {
      const response = await axiosClient.get<
        CustomerOrderDetail | ApiResponse<CustomerOrderDetail>
      >(`/orders/${orderId}`);
      return unwrap(response);
    } catch (error) {
      throw new Error(
        extractOrderErrorMessage(error, "Không thể tải chi tiết đơn hàng."),
      );
    }
  },
};
