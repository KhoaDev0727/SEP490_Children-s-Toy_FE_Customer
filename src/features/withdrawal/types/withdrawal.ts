export type WithdrawalStatus = "PENDING" | "PROCESSING" | "SUCCESS" | "FAILED" | "CANCELLED" | string;

export interface WithdrawalDto {
  withdrawalId: number;
  referenceId: string;
  amount: number;
  toBankBin: string;
  toBankName: string;
  toAccountNumber: string;
  toAccountName: string;
  payosPayoutId: string | null;
  status: WithdrawalStatus;
  failReason: string | null;
  processingAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
}

export interface CreateWithdrawalRequest {
  amount: number;
  savedBankAccountId?: number;
  toBankBin?: string;
  toBankName?: string;
  toAccountNumber?: string;
  toAccountName?: string;
  pin: string;
}

export interface PaginatedWithdrawalsResponse {
  items: WithdrawalDto[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
