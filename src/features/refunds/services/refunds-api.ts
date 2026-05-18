import axiosClient from "@/configs/axios-client";
import type {
  ApiResponse,
  CreateRefundRequest,
  PaginatedResponse,
  RefundDetail,
  RefundFilterQuery,
  RefundListItem,
  RefundReason,
} from "@/features/refunds/types/refunds";

const extractErrorMessage = (error: unknown, fallback: string): string => {
  if (!error || typeof error !== "object") return fallback;

  const maybeError = error as {
    message?: string;
    response?: { data?: { message?: string; errors?: string[] | null } };
  };

  const data = maybeError.response?.data;
  const apiError = data?.errors?.[0];
  const apiMessage = data?.message;

  if (typeof apiError === "string" && apiError.trim()) return apiError;
  if (typeof apiMessage === "string" && apiMessage.trim()) return apiMessage;
  if (typeof maybeError.message === "string" && maybeError.message.trim())
    return maybeError.message;

  return fallback;
};

const unwrap = <T>(response: ApiResponse<T> | T): T => {
  if (response && typeof response === "object" && "success" in response) {
    const api = response as ApiResponse<T>;
    if (api.success && api.data !== null && api.data !== undefined)
      return api.data;
    const message = api.errors?.[0] ?? api.message ?? "Request failed.";
    throw new Error(message);
  }
  return response as T;
};

export const refundsApi = {
  getRefundReasons: async (): Promise<RefundReason[]> => {
    try {
      const response = await axiosClient.get<
        RefundReason[] | ApiResponse<RefundReason[]>
      >("/refunds/reasons");
      return unwrap(response);
    } catch (error) {
      throw new Error(
        extractErrorMessage(error, "Unable to load refund reasons."),
      );
    }
  },

  getRefundList: async (
    query: RefundFilterQuery,
  ): Promise<PaginatedResponse<RefundListItem>> => {
    try {
      const response = await axiosClient.get<
        | PaginatedResponse<RefundListItem>
        | ApiResponse<PaginatedResponse<RefundListItem>>
      >("/refunds", { params: query });
      return unwrap(response);
    } catch (error) {
      throw new Error(
        extractErrorMessage(error, "Unable to load refund list."),
      );
    }
  },

  getRefundById: async (refundId: number): Promise<RefundDetail> => {
    try {
      const response = await axiosClient.get<
        RefundDetail | ApiResponse<RefundDetail>
      >(`/refunds/${refundId}`);
      return unwrap(response);
    } catch (error) {
      throw new Error(
        extractErrorMessage(error, "Unable to load refund details."),
      );
    }
  },

  createRefund: async (dto: CreateRefundRequest): Promise<RefundDetail> => {
    try {
      const response = await axiosClient.post<
        RefundDetail | ApiResponse<RefundDetail>
      >("/refunds", dto);
      return unwrap(response);
    } catch (error) {
      throw new Error(
        extractErrorMessage(error, "Unable to submit refund request."),
      );
    }
  },

  cancelRefund: async (refundId: number): Promise<RefundDetail> => {
    try {
      const response = await axiosClient.post<
        RefundDetail | ApiResponse<RefundDetail>
      >(`/refunds/${refundId}/cancel`);
      return unwrap(response);
    } catch (error) {
      throw new Error(
        extractErrorMessage(error, "Unable to cancel refund request."),
      );
    }
  },
};
