export type WalletStatus = "Active" | "Frozen" | "Closed" | string;

export type WalletActionType = "PAYMENT" | "VIEW_BALANCE" | "TOP_UP";

export interface WalletDto {
  walletId: number;
  currency: string;
  balance: number;
  status: WalletStatus;
}

export interface WalletTransactionDto {
  walletTransactionId: number;
  relatedOrderId: number | null;
  txnType: string;
  direction: string;
  amount: number;
  signedAmount: number;
  method: string;
  status: string;
  reason: string | null;
  createdAt: string;
  completedAt: string | null;
}

export interface PaginatedResponse<TItem> {
  items: TItem[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface CreateWalletRequest {
  pin: string;
  confirmPin: string;
}

export interface VerifyWalletPinRequest {
  pin: string;
  actionType: WalletActionType;
}

export interface VerifyWalletPinResponse {
  walletId: number;
  actionType: WalletActionType;
  isVerified: boolean;
  remainingAttempts: number;
  lockedUntil: string | null;
  walletStatus: WalletStatus;
  topUpToken?: string | null;
}

export interface ChangeWalletPinRequest {
  oldPin: string;
  newPin: string;
  confirmNewPin: string;
}

export interface VerifyForgotWalletPinOtpRequest {
  otpCode: string;
}

export interface ResetForgotWalletPinRequest {
  newPin: string;
  confirmNewPin: string;
}

export interface CreateSePayTopUpQrRequest {
  amount: number;
  topUpToken: string;
}

export interface SePayTopUpQrResponse {
  attemptCode: string;
  qrImageUrl: string;
  amount: number;
  expiresAt: string;
}

export interface SePayTopUpStatusResponse {
  attemptCode: string;
  amount: number;
  status: "PENDING" | "PAID" | "FAILED" | string;
  walletTransactionId: number | null;
  createdAt: string;
  completedAt: string | null;
}

export interface ApiErrorResponse {
  code?: string;
  message?: string;
  errors?: Record<string, string[]>;
  Code?: string;
  Message?: string;
  Errors?: Record<string, string[]>;
}
