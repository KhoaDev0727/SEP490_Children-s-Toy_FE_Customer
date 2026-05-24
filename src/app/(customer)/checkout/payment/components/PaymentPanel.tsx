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
    { label: "Account number", value: accountNumber },
    { label: "Account holder", value: accountName },
    { label: "Amount", value: formatCurrency(amount), accent: true },
    { label: "Transfer note", value: content, mono: true },
  ];

  const handleCopy = (value: string) => {
    navigator.clipboard.writeText(value).catch(() => { });
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
    <div className="flex flex-col gap-6 bg-white border border-gray-200/80 rounded-xl p-8 w-full shadow-sm">
      {/* Header */}
      <div className="border-b border-gray-100 pb-4">
        <h2 className="text-xs font-black uppercase tracking-wider text-gray-900">
          Transfer details
        </h2>
        <p className="text-xs text-gray-400 font-semibold mt-1">
          Order will be confirmed once the system receives payment.
        </p>
      </div>

      {/* Fields */}
      <div className="flex flex-col divide-y divide-gray-100">
        {paymentFields.map((field) => (
          <div
            key={field.label}
            className="flex justify-between items-center py-3.5 gap-4"
          >
            <span className="text-xs font-black uppercase tracking-wider text-gray-500 shrink-0">
              {field.label}
            </span>
            <div className="flex items-center gap-2 min-w-0">
              <span
                className={[
                  "text-sm font-extrabold truncate",
                  field.accent
                    ? "text-[#ff4f00] text-base font-black"
                    : "text-gray-900",
                  field.mono
                    ? "font-mono bg-gray-55 border border-gray-200 px-2 py-0.5 rounded text-xs"
                    : "",
                ].join(" ")}
              >
                {field.value}
              </span>
              {field.copyable && (
                <button
                  onClick={() => handleCopy(field.value)}
                  className="shrink-0 text-gray-400 hover:text-[#ff4f00] transition-colors"
                  title="Copy"
                >
                  {copied === field.value ? (
                    <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
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
      <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-5 relative overflow-hidden">
        <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-3">
          Payment guide
        </p>
        <ol className="space-y-3">
          {steps.map((step, i) => (
            <li key={i} className="flex gap-3 items-start text-xs text-gray-600 font-semibold">
              <span className="shrink-0 w-5 h-5 rounded-xl bg-gray-900 text-white text-[10px] font-black flex items-center justify-center mt-0.5">
                {i + 1}
              </span>
              <span className="pt-0.5">{step}</span>
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
            "flex-1 py-3.5 px-6 rounded-xl text-xs uppercase tracking-wider font-black transition-all active:scale-95 flex items-center justify-center gap-2",
            hasConfirmed
              ? "bg-green-600 text-white cursor-default"
              : "bg-[#ff4f00] hover:bg-[#ff5f1a] text-white shadow-sm",
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
          className="flex-1 py-3.5 px-6 rounded-xl text-xs uppercase tracking-wider font-black border border-gray-300 text-gray-700 bg-transparent hover:bg-gray-50 hover:border-gray-400 transition-all active:scale-95 disabled:opacity-45 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isCancelling ? (
            <>
              <svg className="animate-spin h-4 w-4 text-gray-700" fill="none" viewBox="0 0 24 24">
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
