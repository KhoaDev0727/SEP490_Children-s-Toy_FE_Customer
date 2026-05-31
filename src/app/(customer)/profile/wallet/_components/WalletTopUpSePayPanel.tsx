"use client";

import { useMemo, useState } from "react";
import QRCodeCard from "@/app/(customer)/checkout/payment/components/QRCodeCard";

type WalletTopUpSePayPanelProps = {
  quickAmounts: number[];
  selectedAmount: number;
  attemptCode: string;
  qrImageUrl: string;
  status: string;
  isCreatingQr: boolean;
  isCheckingStatus: boolean;
  bankName: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  onSelectAmount: (amount: number) => void;
  onCheckStatus: () => void;
  onBack: () => void;
};

function formatCurrency(value: number) {
  return `${new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(value)} VND`;
}

function StatusChip({ status }: { status: string }) {
  const normalized = status.trim().toUpperCase();
  if (normalized === "PAID") {
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
        Paid
      </span>
    );
  }

  if (normalized === "FAILED") {
    return (
      <span className="inline-flex items-center rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
        Failed
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
      Pending
    </span>
  );
}

export default function WalletTopUpSePayPanel({
  quickAmounts,
  selectedAmount,
  attemptCode,
  qrImageUrl,
  status,
  isCreatingQr,
  isCheckingStatus,
  bankName,
  bankCode,
  accountNumber,
  accountName,
  onSelectAmount,
  onCheckStatus,
  onBack,
}: WalletTopUpSePayPanelProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const transferContent = useMemo(() => attemptCode || "-", [attemptCode]);

  const handleCopy = async (field: string, value: string) => {
    if (!value || value === "-") return;
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      window.setTimeout(() => setCopiedField(null), 1200);
    } catch {
      setCopiedField(null);
    }
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#0f172a]">Top Up via SePay QR</h2>
          <p className="text-sm text-[#475569]">Verify payment and wallet balance will update after webhook confirmation.</p>
        </div>
        <StatusChip status={status} />
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#ff4f00]">Quick Amount</p>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {quickAmounts.map((amount) => {
            const isActive = amount === selectedAmount;
            return (
              <button
                key={amount}
                type="button"
                disabled={isCreatingQr}
                onClick={() => onSelectAmount(amount)}
                className={[
                  "rounded-xl border px-3 py-2 text-sm font-semibold transition-colors",
                  isActive
                    ? "border-[#ff4f00] bg-[#ff4f00] text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-[#ff4f00] hover:text-[#ff4f00]",
                  isCreatingQr ? "cursor-not-allowed opacity-70" : "",
                ].join(" ")}
              >
                {formatCurrency(amount)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {qrImageUrl ? (
          <QRCodeCard qrUrl={qrImageUrl} />
        ) : (
          <div className="flex min-h-[460px] items-center justify-center rounded-xl border border-slate-200 bg-white p-8 text-sm text-slate-500">
            Creating your SePay QR...
          </div>
        )}

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-[#0f172a]">Transfer Information</p>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-start justify-between gap-3">
              <span className="text-slate-500">Bank</span>
              <span className="text-right font-semibold text-slate-900">{bankName} ({bankCode})</span>
            </div>
            <div className="flex items-start justify-between gap-3">
              <span className="text-slate-500">Account Number</span>
              <button
                type="button"
                onClick={() => handleCopy("account", accountNumber)}
                className="text-right font-semibold text-slate-900 hover:text-[#ff4f00]"
              >
                {accountNumber} {copiedField === "account" ? "✓" : ""}
              </button>
            </div>
            <div className="flex items-start justify-between gap-3">
              <span className="text-slate-500">Account Name</span>
              <span className="text-right font-semibold text-slate-900">{accountName}</span>
            </div>
            <div className="flex items-start justify-between gap-3">
              <span className="text-slate-500">Amount</span>
              <span className="text-right text-base font-bold text-[#ff4f00]">{formatCurrency(selectedAmount)}</span>
            </div>
            <div className="flex items-start justify-between gap-3">
              <span className="text-slate-500">Transfer Content</span>
              <button
                type="button"
                onClick={() => handleCopy("content", transferContent)}
                className="rounded bg-slate-50 px-2 py-1 text-right font-mono text-xs font-semibold text-slate-900 hover:bg-slate-100"
              >
                {transferContent} {copiedField === "content" ? "✓" : ""}
              </button>
            </div>
          </div>

          <div className="mt-5 space-y-2">
            <button
              type="button"
              onClick={onCheckStatus}
              disabled={isCheckingStatus || isCreatingQr || !attemptCode}
              className="w-full rounded-xl bg-[#ff4f00] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#ff4f00]/95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isCheckingStatus ? "Checking..." : "I have transferred"}
            </button>
            <button
              type="button"
              onClick={onBack}
              disabled={isCreatingQr || isCheckingStatus}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Back to wallet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
