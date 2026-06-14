import axiosClient from "@/configs/axios-client";
import type {
  CreateWithdrawalRequest,
  PaginatedWithdrawalsResponse,
  WithdrawalDto,
} from "../types/withdrawal";

export const withdrawalApi = {
  createWithdrawal: async (payload: CreateWithdrawalRequest): Promise<WithdrawalDto> => {
    return axiosClient.post<WithdrawalDto, CreateWithdrawalRequest>("/withdrawals", payload);
  },

  getWithdrawal: async (withdrawalId: number): Promise<WithdrawalDto> => {
    return axiosClient.get<WithdrawalDto>(`/withdrawals/${withdrawalId}`);
  },

  getMyWithdrawals: async (
    page = 1,
    pageSize = 10,
  ): Promise<PaginatedWithdrawalsResponse> => {
    return axiosClient.get<PaginatedWithdrawalsResponse>(
      `/withdrawals?page=${page}&pageSize=${pageSize}`,
    );
  },

  cancelWithdrawal: async (withdrawalId: number): Promise<void> => {
    await axiosClient.post<void>(`/withdrawals/${withdrawalId}/cancel`);
  },
};
