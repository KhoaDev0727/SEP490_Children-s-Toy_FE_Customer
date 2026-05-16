import axiosClient from "@/configs/axios-client";
import type {
  ChangeWalletPinRequest,
  CreateSePayTopUpQrRequest,
  CreateWalletRequest,
  PaginatedResponse,
  ResetForgotWalletPinRequest,
  SePayTopUpQrResponse,
  SePayTopUpStatusResponse,
  VerifyForgotWalletPinOtpRequest,
  VerifyWalletPinRequest,
  VerifyWalletPinResponse,
  WalletDto,
  WalletTransactionDto,
} from "../types/wallet";

export const walletApi = {
  getMyWallet: async (): Promise<WalletDto> => {
    return axiosClient.get<WalletDto>("/wallets/me");
  },

  getTransactions: async (
    pageNumber = 1,
    pageSize = 10,
  ): Promise<PaginatedResponse<WalletTransactionDto>> => {
    return axiosClient.get<PaginatedResponse<WalletTransactionDto>>(
      `/wallets/transactions?pageNumber=${pageNumber}&pageSize=${pageSize}`,
    );
  },

  createWallet: async (payload: CreateWalletRequest): Promise<WalletDto> => {
    return axiosClient.post<WalletDto, CreateWalletRequest>("/wallets/create", payload);
  },

  verifyPin: async (payload: VerifyWalletPinRequest): Promise<VerifyWalletPinResponse> => {
    return axiosClient.post<VerifyWalletPinResponse, VerifyWalletPinRequest>(
      "/wallets/pin/verify",
      payload,
    );
  },

  createSePayTopUpQr: async (payload: CreateSePayTopUpQrRequest): Promise<SePayTopUpQrResponse> => {
    return axiosClient.post<SePayTopUpQrResponse, CreateSePayTopUpQrRequest>(
      "/wallets/topup/sepay/qr",
      payload,
    );
  },

  getSePayTopUpStatus: async (attemptCode: string): Promise<SePayTopUpStatusResponse> => {
    return axiosClient.get<SePayTopUpStatusResponse>(
      `/wallets/topup/sepay/status/${encodeURIComponent(attemptCode)}`,
    );
  },

  changePin: async (payload: ChangeWalletPinRequest): Promise<void> => {
    await axiosClient.put<unknown, ChangeWalletPinRequest>("/wallets/pin/change", payload);
  },

  sendForgotPinOtp: async (): Promise<void> => {
    await axiosClient.post<void>("/wallets/pin/forgot/send-otp");
  },

  verifyForgotPinOtp: async (payload: VerifyForgotWalletPinOtpRequest): Promise<void> => {
    await axiosClient.post<void, VerifyForgotWalletPinOtpRequest>(
      "/wallets/pin/forgot/verify-otp",
      payload,
    );
  },

  resetForgotPin: async (payload: ResetForgotWalletPinRequest): Promise<void> => {
    await axiosClient.put<unknown, ResetForgotWalletPinRequest>("/wallets/pin/forgot/reset", payload);
  },
};
