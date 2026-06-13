"use client";

import { useRouter } from "next/navigation";
import { useWithdrawalPolling } from "./useWithdrawalPolling";
import {
  formatVND,
  maskAccountNumber,
  type WithdrawalDetail,
  type WithdrawalStatus,
} from "./types";

interface ProcessingCardProps {
  withdrawalId: string;
  initialAmount?: number;
  initialBankName?: string;
  initialAccountNumber?: string;
}

export default function ProcessingCard({
  withdrawalId,
  initialAmount,
  initialBankName,
  initialAccountNumber,
}: ProcessingCardProps) {
  const router = useRouter();

  const { data, isTimedOut, error } = useWithdrawalPolling(
    withdrawalId,
    (status: WithdrawalStatus, finished: WithdrawalDetail) => {
      // Propagate the initial query params to results screen as well for demo UI rendering
      const searchParams = typeof window !== "undefined" ? window.location.search : "";
      if (status === "SUCCESS") {
        router.push(`/withdrawals/result/${finished.withdrawalId}${searchParams}${searchParams ? "&" : "?"}status=success`);
      } else if (status === "FAILED") {
        router.push(`/withdrawals/result/${finished.withdrawalId}${searchParams}${searchParams ? "&" : "?"}status=failed`);
      }
    }
  );

  const amount = data?.amount ?? initialAmount ?? 0;
  const bankName = data?.toBankName ?? initialBankName ?? "";
  const accountNumber = data?.toAccountNumber ?? initialAccountNumber ?? "";
  const last4 = maskAccountNumber(accountNumber);

  return (
    <div className="bg-white w-full max-w-xl rounded-xl p-8 shadow-sm border border-slate-200 text-center flex flex-col items-center mx-auto animate-in fade-in duration-200">
      {/* Animated Icon Container */}
      <div className="mb-6 flex justify-center items-center">
        <div className="bg-orange-50 rounded-full p-5 border border-orange-100 flex items-center justify-center">
          <span
            className="material-symbols-outlined text-[#ff4f00] text-[48px]"
            style={{ animation: "spin 2s linear infinite" }}
            aria-hidden="true"
          >
            autorenew
          </span>
        </div>
      </div>

      {/* Typography */}
      <h1 className="text-2xl font-bold text-slate-900 mb-2">
        Processing Transaction
      </h1>
      <p className="text-sm text-slate-500 mb-8 max-w-sm mx-auto leading-relaxed">
        {isTimedOut
          ? "Your transaction is still being processed. You can monitor the result in your transaction history."
          : "Your withdrawal request is being processed. Please wait a moment..."}
      </p>

      {error && (
        <p className="text-sm text-red-500 mb-6 max-w-md mx-auto flex items-center gap-1.5 justify-center font-medium" role="alert">
          <span className="material-symbols-outlined text-[16px]">warning</span>
          Unable to load transaction status.
        </p>
      )}

      {/* Summary Box */}
      <div className="bg-slate-50 rounded-xl p-5 mb-6 border border-slate-200 text-center w-full max-w-md flex flex-col items-center">
        <span className="text-3xl font-extrabold text-[#ff4f00] tracking-tight mb-1">
          {formatVND(amount)}
        </span>
        <div className="flex items-center justify-center text-slate-500 text-xs gap-1.5">
          <span>to {bankName}</span>
          {last4 && (
            <>
              <span className="flex gap-0.5 items-center">
                <span className="w-1 h-1 rounded-full bg-slate-400"></span>
                <span className="w-1 h-1 rounded-full bg-slate-400"></span>
                <span className="w-1 h-1 rounded-full bg-slate-400"></span>
                <span className="w-1 h-1 rounded-full bg-slate-400"></span>
              </span>
              <span>{last4}</span>
            </>
          )}
        </div>
      </div>

      {/* Action Button */}
      <a
        className="inline-flex items-center justify-center font-semibold text-[#ff4f00] hover:text-[#e64700] transition-colors duration-200 text-sm"
        href="/profile/wallet"
      >
        View Wallet History
      </a>
    </div>
  );
}
