"use client";

import { useState, useRef } from "react";
import BankAccountSheet, { BankAccount, BANK_ACCOUNTS } from "./BankAccountSheet";
import { useWithdrawalPolling } from "./useWithdrawalPolling";
import { formatVND, maskAccountNumber } from "./types";
import WithdrawSuccessModal from "./WithdrawSuccessModal";
import { useRouter } from "next/navigation";

const MIN_WITHDRAWAL = 10_000;
const QUICK_AMOUNTS = [50_000, 100_000, 200_000, 500_000, 1000000];

function parseAmount(raw: string): number {
  return parseInt(raw.replace(/\D/g, ""), 10) || 0;
}

type Step = "form" | "processing" | "success" | "failed";

interface WithdrawalFormProps {
  availableBalance: number;
  onBack: () => void;
  onSuccessWithdrawal?: () => void;
  onRequestPinVerification?: (onSuccess: () => void) => void;
}

export default function WithdrawalForm({
  availableBalance,
  onBack,
  onSuccessWithdrawal,
  onRequestPinVerification,
}: WithdrawalFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("form");
  const [rawAmount, setRawAmount] = useState("");
  const [selectedAccount, setSelectedAccount] = useState<BankAccount>(BANK_ACCOUNTS[0]);
  const [showSheet, setShowSheet] = useState(false);
  const [error, setError] = useState("");
  const [mockWithdrawalId, setMockWithdrawalId] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState({
    transactionId: "",
    transactionTime: "",
    amount: 0,
    bankName: "",
    accountName: "",
    accountNumber: "",
  });
  const inputRef = useRef<HTMLInputElement>(null);

  const numericAmount = parseAmount(rawAmount);
  const afterBalance = availableBalance - numericAmount;

  function handleAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, "");
    const num = parseInt(digits, 10) || 0;
    setRawAmount(num > 0 ? num.toLocaleString("vi-VN") : "");

    if (num > 0 && num < MIN_WITHDRAWAL) {
      setError(`Minimum amount is ${formatVND(MIN_WITHDRAWAL)}`);
    } else if (num > availableBalance) {
      setError("Amount exceeds available balance");
    } else {
      setError("");
    }
  }

  function handleWithdrawAll() {
    setRawAmount(availableBalance.toLocaleString("vi-VN"));
    setError("");
  }

  function handleQuickAmount(amount: number) {
    setRawAmount(amount.toLocaleString("vi-VN"));
    setError("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (numericAmount < MIN_WITHDRAWAL) {
      setError(`Minimum amount is ${formatVND(MIN_WITHDRAWAL)}`);
      inputRef.current?.focus();
      return;
    }
    if (numericAmount > availableBalance) {
      setError("Amount exceeds available balance");
      inputRef.current?.focus();
      return;
    }
    if (onRequestPinVerification) {
      onRequestPinVerification(() => {
        const newId = "W" + Math.floor(Math.random() * 900000 + 100000);
        setMockWithdrawalId(newId);
        setStep("processing");
      });
    } else {
      const newId = "W" + Math.floor(Math.random() * 900000 + 100000);
      setSuccessData({
        transactionId: newId,
        transactionTime: new Date().toLocaleString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        amount: numericAmount,
        bankName: selectedAccount.bankName,
        accountName: selectedAccount.ownerName,
        accountNumber: selectedAccount.maskedNumber,
      });
      setShowSuccessModal(true);
      setRawAmount("");
      setError("");
      setStep("form");
    }
  }

  function handleReset() {
    setStep("form");
    setRawAmount("");
    setError("");
    setMockWithdrawalId("");
  }

  function handleBackToWallet() {
    if (onSuccessWithdrawal) {
      onSuccessWithdrawal();
    } else {
      onBack();
    }
  }

  // --- RENDERING HANDLERS ---

  if (step === "processing") {
    return (
      <InlineProcessingCard
        withdrawalId={mockWithdrawalId}
        amount={numericAmount}
        bankName={selectedAccount.bankName}
        accountNumber={selectedAccount.maskedNumber}
        onFinished={(status) => {
          if (status === "SUCCESS") {
            setSuccessData({
              transactionId: mockWithdrawalId,
              transactionTime: new Date().toLocaleString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }),
              amount: numericAmount,
              bankName: selectedAccount.bankName,
              accountName: selectedAccount.ownerName,
              accountNumber: selectedAccount.maskedNumber,
            });
            setShowSuccessModal(true);
            setRawAmount("");
            setError("");
            setStep("form");
          } else {
            setStep("failed");
          }
        }}
      />
    );
  }

  if (step === "success" || step === "failed") {
    const isSuccess = step === "success";
    const last4 = maskAccountNumber(selectedAccount.maskedNumber);

    return (
      <div className="p-6 text-center max-w-2xl mx-auto animate-in fade-in duration-200">
        {isSuccess ? (
          <>
            <div className="w-16 h-16 rounded-full bg-[#dcfce7] flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-[#16a34a]" style={{ fontSize: "32px", fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Withdrawal Successful!</h2>
            <p className="text-slate-500 mb-6 leading-relaxed">
              Your withdrawal request has been processed successfully.
            </p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6 border border-red-100">
              <span className="material-symbols-outlined text-red-500" style={{ fontSize: "32px" }}>
                cancel
              </span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Withdrawal Failed</h2>
            <p className="text-slate-500 mb-6 leading-relaxed">
              Your withdrawal transaction was unsuccessful. Please contact support or try again later.
            </p>
          </>
        )}

        {/* Details Card */}
        <div className="bg-slate-50 rounded-xl p-5 mb-8 border border-slate-200 text-left w-full max-w-md space-y-3 mx-auto">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500">Transaction ID:</span>
            <span className="font-semibold text-slate-800 font-mono">{mockWithdrawalId}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500">Withdraw Amount:</span>
            <span className="font-bold text-[#ff4f00]">{formatVND(numericAmount)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500">Recipient Account:</span>
            <span className="font-semibold text-slate-800">
              {selectedAccount.bankName} {last4 ? `(***${last4})` : ""}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500">Status:</span>
            <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${isSuccess ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
              {isSuccess ? "Success" : "Failed"}
            </span>
          </div>
        </div>

        <div className="flex justify-center gap-3 w-full max-w-md mx-auto">
          <button
            onClick={handleReset}
            className="flex-1 px-6 py-2.5 bg-[#ff4f00] hover:bg-[#e64700] text-white font-semibold rounded-xl transition-colors shadow-sm text-sm"
          >
            Withdraw More
          </button>
          <button
            onClick={handleBackToWallet}
            className="flex-1 px-6 py-2.5 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors text-sm"
          >
            Back to Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-6 w-full max-w-2xl mx-auto animate-in fade-in duration-200">
        {/* Back button */}
        <div className="flex items-center mb-6">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to Wallet
          </button>
        </div>

        {/* Balance Card */}
        <div className="bg-slate-50 rounded-xl p-5 mb-6 text-center border border-slate-200">
          <p className="text-xs text-slate-500 mb-1 font-medium">Available Balance</p>
          <p className="text-3xl font-extrabold text-slate-900 tracking-tight">{formatVND(availableBalance)}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Amount field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="amount" className="font-semibold text-slate-800">Withdraw Amount</label>
              <button
                type="button"
                onClick={handleWithdrawAll}
                className="text-sm font-semibold text-[#ff4f00] hover:text-[#e64700] transition-colors"
              >
                Withdraw All
              </button>
            </div>

            <div className={`relative rounded-xl border transition-all ${error ? "border-red-400 bg-red-50/30" : "border-slate-200 focus-within:border-[#ff4f00] focus-within:ring-1 focus-within:ring-[#ff4f00] bg-white"
              }`}>
              <input
                ref={inputRef}
                id="amount"
                type="text"
                inputMode="numeric"
                value={rawAmount}
                onChange={handleAmountChange}
                placeholder="0"
                className="w-full bg-transparent py-3 pl-4 pr-10 text-lg font-bold text-slate-900 outline-none placeholder:font-normal placeholder:text-slate-300"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-md">₫</span>
            </div>

            {error ? (
              <p className="text-sm text-red-500 flex items-center gap-1.5 font-medium">
                <span className="material-symbols-outlined text-[16px]">warning</span>
                {error}
              </p>
            ) : (
              <p className="text-xs text-slate-400">Minimum {formatVND(MIN_WITHDRAWAL)}</p>
            )}

            {/* Progress bar */}
            {numericAmount > 0 && (
              <div className="space-y-1.5 pt-1">
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${numericAmount > availableBalance ? "bg-red-400" : "bg-[#ff4f00]"
                      }`}
                    style={{ width: `${Math.min((numericAmount / availableBalance) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400">
                  Remaining: <span className="font-semibold text-slate-600">{formatVND(Math.max(afterBalance, 0))}</span>
                </p>
              </div>
            )}
          </div>

          {/* Quick amounts */}
          <div className="flex gap-2 flex-wrap">
            {QUICK_AMOUNTS.map((amt) => {
              const isActive = numericAmount === amt;
              return (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleQuickAmount(amt)}
                  className={`px-4 py-1.5 text-sm font-semibold rounded-full border transition-all ${isActive
                      ? "border-[#ff4f00] text-[#ff4f00] bg-orange-50"
                      : "border-slate-200 text-slate-500 hover:border-[#ff4f00] hover:text-[#ff4f00] bg-white"
                    }`}
                >
                  {amt >= 1_000_000 ? `${amt / 1_000_000}M` : `${amt / 1_000}K`}
                </button>
              );
            })}
          </div>

          {/* Bank account selector */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-800">Recipient Account</label>
            <button
              type="button"
              onClick={() => setShowSheet(true)}
              className="w-full flex items-center justify-between bg-white border border-slate-200 hover:border-slate-400 rounded-xl p-4 transition-all text-left focus:outline-none focus:ring-1 focus:ring-[#ff4f00] shadow-sm group"
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 overflow-hidden"
                  style={{ backgroundColor: selectedAccount.color }}
                >
                  {selectedAccount.bankCode}
                </div>
                <div className="overflow-hidden">
                  <p className="font-semibold text-slate-900 truncate">{selectedAccount.bankName}</p>
                  <p className="text-sm text-slate-500 truncate">
                    {selectedAccount.ownerName} — {selectedAccount.maskedNumber}
                  </p>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-400 group-hover:text-slate-600 transition-colors shrink-0">
                expand_more
              </span>
            </button>
          </div>

          {/* Submit */}
          <div className="pt-6 border-t border-slate-200 mt-6">
            <button
              type="submit"
              disabled={!rawAmount}
              className="w-full bg-[#ff4f00] hover:bg-[#e64700] disabled:bg-slate-100 disabled:text-slate-400 text-white font-semibold text-lg rounded-xl h-14 transition-all shadow-sm"
            >
              Continue
            </button>
          </div>
        </form>
      </div>

      {showSheet && (
        <BankAccountSheet
          selectedId={selectedAccount.id}
          onSelect={setSelectedAccount}
          onClose={() => setShowSheet(false)}
        />
      )}

      <WithdrawSuccessModal
        open={showSuccessModal}
        amount={successData.amount}
        bankName={successData.bankName}
        accountName={successData.accountName}
        accountNumber={successData.accountNumber}
        transactionId={successData.transactionId}
        transactionTime={successData.transactionTime}
        onGoHome={() => {
          setShowSuccessModal(false);
          router.push("/");
        }}
        onViewDetail={() => {
          setShowSuccessModal(false);
          if (onSuccessWithdrawal) {
            onSuccessWithdrawal();
          } else {
            router.push("/profile/wallet");
          }
        }}
      />
    </>
  );
}

// --- SUB-COMPONENTS FOR INLINE TRANSACTION WAITING STATE ---

interface InlineProcessingProps {
  withdrawalId: string;
  amount: number;
  bankName: string;
  accountNumber: string;
  onFinished: (status: "SUCCESS" | "FAILED") => void;
}

function InlineProcessingCard({
  withdrawalId,
  amount,
  bankName,
  accountNumber,
  onFinished,
}: InlineProcessingProps) {
  const { data, isTimedOut, error } = useWithdrawalPolling(
    withdrawalId,
    (status) => {
      if (status === "SUCCESS" || status === "FAILED") {
        onFinished(status);
      }
    }
  );

  const displayAmount = data?.amount ?? amount;
  const displayBankName = data?.toBankName ?? bankName;
  const displayAccountNumber = data?.toAccountNumber ?? accountNumber;
  const last4 = maskAccountNumber(displayAccountNumber);

  return (
    <div className="p-6 w-full max-w-2xl text-center flex flex-col items-center mx-auto animate-in fade-in duration-200">
      {/* Animated Icon Container */}
      <div className="mb-6 flex justify-center items-center">
        <div className="bg-orange-50 rounded-full p-5 border border-orange-100 flex items-center justify-center">
          <span
            className="material-symbols-outlined text-[#ff4f00] text-[48px]"
            style={{ animation: "spin 2s linear infinite" }}
          >
            autorenew
          </span>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-slate-900 mb-2">
        Processing Transaction
      </h2>
      <p className="text-sm text-slate-500 mb-8 max-w-sm mx-auto leading-relaxed">
        {isTimedOut
          ? "Your transaction is still being processed. You can monitor the result in your transaction history."
          : "Your withdrawal request is being processed. Please wait a moment..."}
      </p>

      {error && (
        <p className="text-sm text-red-500 mb-6 max-w-md mx-auto flex items-center gap-1.5 justify-center font-medium">
          <span className="material-symbols-outlined text-[16px]">warning</span>
          Unable to load transaction status.
        </p>
      )}

      {/* Summary Box */}
      <div className="bg-slate-50 rounded-xl p-5 mb-6 border border-slate-200 text-center w-full max-w-md flex flex-col items-center">
        <span className="text-3xl font-extrabold text-[#ff4f00] tracking-tight mb-1">
          {formatVND(displayAmount)}
        </span>
        <div className="flex items-center justify-center text-slate-500 text-xs gap-1.5">
          <span>to {displayBankName}</span>
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
    </div>
  );
}
