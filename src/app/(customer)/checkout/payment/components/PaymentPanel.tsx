"use client";

import { useState } from "react";

interface PaymentField {
  label: string;
  value: string;
  copyable?: boolean;
  accent?: boolean;
  mono?: boolean;
}

const formatCurrency = (value: number) => `${value.toLocaleString("vi-VN")} ₫`;

const steps = [
  "Open your banking app on your phone.",
  <>Choose <strong>Scan QR Code</strong> or transfer using the details above.</>,
  <>Enter the exact <strong>amount</strong> and <strong>transfer note</strong> if entering manually.</>,
  "Confirm payment and wait for system updates.",
];

interface PaymentPanelProps {
  bankName: string;
  accountNumber: string;
  accountName: string;
  amount: number;
  content: string;
  onConfirm?: () => Promise<void>;
  onCancel?: () => Promise<void>;
}

export default function PaymentPanel({
  bankName,
  accountNumber,
  accountName,
  amount,
  content,
  onConfirm,
  onCancel,
}: PaymentPanelProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [hasConfirmed, setHasConfirmed] = useState(false);

  const paymentFields: PaymentField[] = [
    { label: "Bank", value: bankName },
    { label: "Account number", value: accountNumber, copyable: true },
    { label: "Account holder", value: accountName },
    { label: "Amount", value: formatCurrency(amount), accent: true },
    { label: "Transfer note", value: content, copyable: true, mono: true },
  ];

  const handleCopy = (value: string) => {
    navigator.clipboard.writeText(value).catch(() => {});
    setCopied(value);
    setTimeout(() => setCopied(null), 1800);
  };

  const handleInternalConfirm = async () => {
    if (!onConfirm) {
      setHasConfirmed(true);
      return;
    }
    setIsConfirming(true);
    try {
      await onConfirm();
    } finally {
      setIsConfirming(false);
    }
  };

  const handleInternalCancel = async () => {
    if (!onCancel) return;
    setIsCancelling(true);
    try {
      await onCancel();
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-lg p-8 w-full">
      {/* Header */}
      <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
        <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight">
          Transfer details
        </h2>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
          Order will be confirmed once the system receives payment.
        </p>
      </div>

      {/* Fields */}
      <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
        {paymentFields.map((field) => (
          <div
            key={field.label}
            className="flex justify-between items-center py-3 gap-4"
          >
            <span className="text-sm text-slate-500 dark:text-slate-400 shrink-0">
              {field.label}
            </span>
            <div className="flex items-center gap-2 min-w-0">
              <span
                className={[
                  "text-sm font-semibold truncate",
                  field.accent
                    ? "text-orange-600 dark:text-orange-400 text-base font-bold"
                    : "text-slate-800 dark:text-slate-100",
                  field.mono
                    ? "font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-xs"
                    : "",
                ].join(" ")}
              >
                {field.value}
              </span>
              {field.copyable && (
                <button
                  onClick={() => handleCopy(field.value)}
                  className="shrink-0 text-slate-400 hover:text-orange-500 transition-colors"
                  title="Copy"
                >
                  {copied === field.value ? (
                    <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-4 12h6a2 2 0 002-2v-8a2 2 0 00-2-2h-6a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Instructions */}
      <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-100 dark:border-orange-900/50 rounded-xl p-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-orange-400 mb-3">
          Payment guide
        </p>
        <ol className="space-y-2">
          {steps.map((step, i) => (
            <li key={i} className="flex gap-3 items-start text-sm text-slate-600 dark:text-slate-300">
              <span className="shrink-0 w-5 h-5 rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center mt-0.5">
                {i + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          onClick={handleInternalConfirm}
          disabled={isConfirming || isCancelling || hasConfirmed}
          className={[
            "flex-1 py-3 px-6 rounded-xl text-sm font-bold transition-all active:scale-95 flex items-center justify-center gap-2",
            hasConfirmed
              ? "bg-green-500 text-white cursor-default"
              : "bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-200 dark:shadow-orange-900/30",
            isConfirming ? "opacity-80" : "",
          ].join(" ")}
        >
          {isConfirming ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Checking...
            </>
          ) : hasConfirmed ? (
            "✓ Payment confirmed"
          ) : (
            "I have transferred"
          )}
        </button>
        <button
          onClick={handleInternalCancel}
          disabled={isConfirming || isCancelling || hasConfirmed}
          className="flex-1 py-3 px-6 rounded-xl text-sm font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isCancelling ? (
            <>
              <svg className="animate-spin h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Cancelling...
            </>
          ) : (
            "Cancel transaction"
          )}
        </button>
      </div>
    </div>
  );
}
