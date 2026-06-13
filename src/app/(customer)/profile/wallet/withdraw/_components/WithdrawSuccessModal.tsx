"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { formatVND } from "./types";

interface WithdrawSuccessModalProps {
  open: boolean;
  amount: number;
  bankName: string;
  accountName: string;
  accountNumber: string;
  transactionId: string;
  transactionTime: string;
  onGoHome: () => void;
  onViewDetail: () => void;
}

export default function WithdrawSuccessModal({
  open,
  amount,
  bankName,
  accountName,
  accountNumber,
  transactionId,
  transactionTime,
  onGoHome,
  onViewDetail,
}: WithdrawSuccessModalProps) {
  // Prevent page scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#0f172a]/50" />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 flex flex-col items-center text-center animate-in fade-in zoom-in duration-200">
        {/* Success Icon */}
        <div className="w-16 h-16 rounded-full bg-[#dcfce7] flex items-center justify-center mb-4 border border-emerald-100">
          <span className="material-symbols-outlined text-[#16a34a] text-3xl font-semibold" style={{ fontVariationSettings: "'FILL' 1" }}>
            check_circle
          </span>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-slate-900 mb-1">Withdrawal Successful!</h2>
        <p className="text-slate-500 text-sm mb-4">Your transaction has been processed successfully</p>

        {/* Amount */}
        <div className="text-3xl font-extrabold text-[#ff4f00] tracking-tight mb-5">
          {formatVND(amount)}
        </div>

        {/* Information Box */}
        <div className="w-full bg-[#f8f9fa] border border-slate-200 rounded-xl p-4 text-left space-y-3 mb-6 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Transaction ID:</span>
            <span className="font-semibold text-slate-800 font-mono">{transactionId}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Time:</span>
            <span className="font-semibold text-slate-800">{transactionTime}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Recipient Bank:</span>
            <span className="font-semibold text-slate-800">{bankName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Account Number:</span>
            <span className="font-semibold text-slate-800">{accountNumber}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Recipient Name:</span>
            <span className="font-semibold text-slate-800 uppercase">{accountName}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 w-full">
          <button
            onClick={onViewDetail}
            className="w-full py-3 bg-[#ff4f00] text-white font-semibold rounded-xl hover:bg-[#e64700] transition-colors shadow-sm text-sm cursor-pointer"
          >
            View Transaction Details
          </button>
          <button
            onClick={onGoHome}
            className="w-full py-3 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors text-sm cursor-pointer"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(modalContent, document.body)
    : null;
}
