export type WithdrawalStatus = "PENDING" | "PROCESSING" | "SUCCESS" | "FAILED";

export interface WithdrawalDetail {
  withdrawalId: string;
  amount: number;
  toBankName: string;
  toAccountNumber: string;
  status: WithdrawalStatus;
}

export function formatVND(value: number): string {
  return value.toLocaleString("vi-VN") + " ₫";
}

export function maskAccountNumber(accountNumber: string): string {
  if (!accountNumber) return "";
  const cleaned = accountNumber.trim();
  if (cleaned.length <= 4) return cleaned;
  return cleaned.slice(-4);
}
