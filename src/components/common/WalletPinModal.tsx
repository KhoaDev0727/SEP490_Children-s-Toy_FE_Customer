"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface WalletPinModalProps {
  isOpen: boolean;
  isVerifying: boolean;
  errorMessage?: string | null;
  remainingAttempts?: number | null;
  /** null = không bị khoá; string ISO = khoá đến lúc đó */
  lockedUntil?: string | null;
  onConfirm: (pin: string) => void;
  onCancel: () => void;
}

const PIN_LENGTH = 6;

export default function WalletPinModal({
  isOpen,
  isVerifying,
  errorMessage,
  remainingAttempts,
  lockedUntil,
  onConfirm,
  onCancel,
}: WalletPinModalProps) {
  const [digits, setDigits] = useState<string[]>(Array(PIN_LENGTH).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Reset + focus khi mở
  useEffect(() => {
    if (isOpen) {
      setDigits(Array(PIN_LENGTH).fill(""));
      setTimeout(() => inputRefs.current[0]?.focus(), 80);
    }
  }, [isOpen]);

  // Làm rỗng và focus lại ô đầu tiên khi có thông báo lỗi (PIN sai)
  useEffect(() => {
    if (errorMessage) {
      setDigits(Array(PIN_LENGTH).fill(""));
      setTimeout(() => inputRefs.current[0]?.focus(), 80);
    }
  }, [errorMessage]);

  // Prevent scroll
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  if (!isOpen) return null;

  const isLocked = !!lockedUntil;

  const handleChange = (index: number, value: string) => {
    if (isVerifying || isLocked) return;
    // Cho phép paste toàn bộ PIN
    if (value.length > 1) {
      const pasted = value.replace(/\D/g, "").slice(0, PIN_LENGTH);
      const newDigits = [...digits];
      for (let i = 0; i < pasted.length; i++) newDigits[i] = pasted[i];
      setDigits(newDigits);
      const nextIdx = Math.min(pasted.length, PIN_LENGTH - 1);
      inputRefs.current[nextIdx]?.focus();
      if (pasted.length === PIN_LENGTH) {
        setTimeout(() => onConfirm(pasted), 50);
      }
      return;
    }

    const char = value.replace(/\D/g, "").slice(-1);
    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);

    if (char && index < PIN_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit khi đủ
    const filled = newDigits.join("");
    if (filled.length === PIN_LENGTH && newDigits.every((d) => d !== "")) {
      setTimeout(() => onConfirm(filled), 50);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (digits[index]) {
        const newDigits = [...digits];
        newDigits[index] = "";
        setDigits(newDigits);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
        const newDigits = [...digits];
        newDigits[index - 1] = "";
        setDigits(newDigits);
      }
    }
    if (e.key === "Enter") {
      const pin = digits.join("");
      if (pin.length === PIN_LENGTH) onConfirm(pin);
    }
  };

  const formatLockedUntil = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  };

  const modal = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/60"
        onClick={isVerifying ? undefined : onCancel}
      />

      {/* Card */}
      <div className="relative w-full max-w-sm rounded-3xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header gradient */}
        <div className="bg-gradient-to-br from-[#ff6a00] to-[#ff4500] px-6 py-5 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-white text-[22px]">
                account_balance_wallet
              </span>
            </div>
            <div>
              <h3 className="text-lg font-extrabold leading-tight">Wallet Payment</h3>
              <p className="text-xs text-white/75 font-medium mt-0.5">
                Enter your 6-digit wallet PIN to confirm
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          {/* PIN inputs */}
          <div className="flex items-center justify-center gap-2.5 mb-5">
            {Array.from({ length: PIN_LENGTH }).map((_, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="password"
                inputMode="numeric"
                maxLength={6}
                autoComplete="one-time-code"
                value={digits[i]}
                disabled={isVerifying || isLocked}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onFocus={(e) => e.target.select()}
                className={[
                  "w-11 h-13 text-center text-xl font-black rounded-2xl border-2 outline-none transition-all duration-200",
                  "disabled:cursor-not-allowed disabled:opacity-60",
                  digits[i]
                    ? "border-[#ff6a00] bg-[#ff6a00]/5 text-[#ff6a00] shadow-sm shadow-[#ff6a00]/20"
                    : "border-gray-200 bg-gray-50 text-gray-900",
                  isLocked ? "border-red-200 bg-red-50" : "",
                  "focus:border-[#ff6a00] focus:bg-white focus:ring-4 focus:ring-[#ff6a00]/10",
                ].join(" ")}
              />
            ))}
          </div>

          {/* Status messages */}
          {isLocked && lockedUntil && (
            <div className="flex items-start gap-2 p-3 bg-red-50 rounded-2xl border border-red-200 mb-4">
              <span className="material-symbols-outlined text-red-500 text-[18px] flex-shrink-0 mt-0.5">lock</span>
              <div>
                <p className="text-xs font-bold text-red-700">Wallet temporarily locked</p>
                <p className="text-[11px] text-red-500 mt-0.5">
                  Too many failed attempts. Try again after {formatLockedUntil(lockedUntil)}.
                </p>
              </div>
            </div>
          )}

          {errorMessage && !isLocked && (
            <div className="flex items-center gap-2 p-3 bg-red-50 rounded-2xl border border-red-200 mb-4">
              <span className="material-symbols-outlined text-red-500 text-[18px] flex-shrink-0">error</span>
              <div className="flex-1">
                <p className="text-xs font-semibold text-red-700">{errorMessage}</p>
                {typeof remainingAttempts === "number" && remainingAttempts > 0 && (
                  <p className="text-[11px] text-red-400 mt-0.5">
                    {remainingAttempts} attempt{remainingAttempts !== 1 ? "s" : ""} remaining before lockout.
                  </p>
                )}
              </div>
            </div>
          )}

          {!errorMessage && !isLocked && (
            <p className="text-center text-[11px] text-gray-400 font-medium mb-4">
              🔒 Your PIN is encrypted and never stored in plain text.
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={isVerifying}
              className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onConfirm(digits.join(""))}
              disabled={isVerifying || isLocked || digits.join("").length < PIN_LENGTH}
              className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-[#ff6a00] to-[#ff4500] text-sm font-extrabold text-white shadow-lg shadow-[#ff6a00]/30 hover:-translate-y-0.5 hover:shadow-[#ff6a00]/40 active:translate-y-0 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0 flex items-center justify-center gap-2"
            >
              {isVerifying ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Verifying...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  Confirm
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Dùng Portal để mount ra document.body — tránh bị clip bởi overflow:hidden của parent
  return typeof document !== "undefined"
    ? createPortal(modal, document.body)
    : null;
}

