import { useEffect } from "react";
import { createPortal } from "react-dom";
import {
  getPinModalDescription,
  getPinModalTitle,
  type PinModalMode,
  type PinVisibilityField,
} from "./wallet-shared";

type WalletPinModalProps = {
  isOpen: boolean;
  pinModalMode: PinModalMode;
  isForgotPinFlow: boolean;
  pin: string;
  confirmPin: string;
  oldPin: string;
  newChangePin: string;
  confirmChangePin: string;
  otpCode: string;
  newPin: string;
  confirmNewPin: string;
  pinVisibility: Record<PinVisibilityField, boolean>;
  isSubmittingPin: boolean;
  isSendingForgotOtp: boolean;
  isResettingPin: boolean;
  onClose: () => void;
  onSubmitPinModal: () => void;
  onSendForgotPinOtp: () => void;
  onResetPinWithOtp: () => void;
  onTogglePinVisibility: (field: PinVisibilityField) => void;
  onPinChange: (value: string) => void;
  onConfirmPinChange: (value: string) => void;
  onOldPinChange: (value: string) => void;
  onNewChangePinChange: (value: string) => void;
  onConfirmChangePinChange: (value: string) => void;
  onOtpCodeChange: (value: string) => void;
  onNewPinChange: (value: string) => void;
  onConfirmNewPinChange: (value: string) => void;
};

type PinInputProps = {
  label: string;
  value: string;
  visibilityField: PinVisibilityField;
  isVisible: boolean;
  onValueChange: (value: string) => void;
  onToggleVisibility: (field: PinVisibilityField) => void;
};

function PinInput({
  label,
  value,
  visibilityField,
  isVisible,
  onValueChange,
  onToggleVisibility,
}: PinInputProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={isVisible ? "text" : "password"}
          maxLength={6}
          autoComplete="new-password"
          value={value}
          onChange={(event) => onValueChange(event.target.value.replace(/\D/g, "").slice(0, 6))}
          className="w-full h-11 rounded-xl border border-slate-200 px-3 pr-10 text-sm outline-none focus:ring-2 focus:ring-[#ff4f00]/10 focus:border-[#ff4f00]"
        />
        <button
          type="button"
          onClick={() => onToggleVisibility(visibilityField)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
          aria-label={isVisible ? "Hide PIN" : "Show PIN"}
        >
          <span className="material-symbols-outlined text-[18px]">
            {isVisible ? "visibility_off" : "visibility"}
          </span>
        </button>
      </div>
    </div>
  );
}

export default function WalletPinModal({
  isOpen,
  pinModalMode,
  isForgotPinFlow,
  pin,
  confirmPin,
  oldPin,
  newChangePin,
  confirmChangePin,
  otpCode,
  newPin,
  confirmNewPin,
  pinVisibility,
  isSubmittingPin,
  isSendingForgotOtp,
  isResettingPin,
  onClose,
  onSubmitPinModal,
  onSendForgotPinOtp,
  onResetPinWithOtp,
  onTogglePinVisibility,
  onPinChange,
  onConfirmPinChange,
  onOldPinChange,
  onNewChangePinChange,
  onConfirmChangePinChange,
  onOtpCodeChange,
  onNewPinChange,
  onConfirmNewPinChange,
}: WalletPinModalProps) {
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const isActionLocked = isSubmittingPin || isSendingForgotOtp || isResettingPin;

  const modal = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#0f172a]/50" 
        onClick={isActionLocked ? undefined : onClose} 
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 p-5 animate-in fade-in zoom-in duration-200"
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            {isForgotPinFlow ? (
              <h3 className="text-lg font-bold text-slate-900">Reset Wallet PIN</h3>
            ) : (
              <h3 className="text-lg font-bold text-slate-900">{getPinModalTitle(pinModalMode)}</h3>
            )}
            <p className="text-sm text-slate-500 mt-1">
              {isForgotPinFlow
                ? "Enter the 6-digit OTP from email and set a new wallet PIN."
                : getPinModalDescription(pinModalMode)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
            disabled={isActionLocked}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {isForgotPinFlow ? (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">OTP (6 digits)</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                autoComplete="one-time-code"
                value={otpCode}
                onChange={(event) => onOtpCodeChange(event.target.value.replace(/\D/g, "").slice(0, 6))}
                className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:ring-2 focus:ring-[#ff4f00]/10 focus:border-[#ff4f00]"
              />
            </div>
            <PinInput
              label="New PIN (6 digits)"
              value={newPin}
              visibilityField="newPin"
              isVisible={pinVisibility.newPin}
              onValueChange={onNewPinChange}
              onToggleVisibility={onTogglePinVisibility}
            />
            <PinInput
              label="Confirm new PIN"
              value={confirmNewPin}
              visibilityField="confirmNewPin"
              isVisible={pinVisibility.confirmNewPin}
              onValueChange={onConfirmNewPinChange}
              onToggleVisibility={onTogglePinVisibility}
            />
            <button
              type="button"
              onClick={onSendForgotPinOtp}
              disabled={isSendingForgotOtp || isResettingPin}
              className="text-xs font-semibold text-[#ff4f00] hover:text-[#ff4f00]/80 hover:underline transition-colors disabled:opacity-60"
            >
              {isSendingForgotOtp ? "Sending OTP..." : "Resend OTP"}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {pinModalMode !== "changePin" ? (
              <PinInput
                label="PIN (6 digits)"
                value={pin}
                visibilityField="pin"
                isVisible={pinVisibility.pin}
                onValueChange={onPinChange}
                onToggleVisibility={onTogglePinVisibility}
              />
            ) : null}

            {pinModalMode === "activate" ? (
              <PinInput
                label="Confirm PIN"
                value={confirmPin}
                visibilityField="confirmPin"
                isVisible={pinVisibility.confirmPin}
                onValueChange={onConfirmPinChange}
                onToggleVisibility={onTogglePinVisibility}
              />
            ) : pinModalMode === "changePin" ? (
              <>
                <PinInput
                  label="Old PIN (6 digits)"
                  value={oldPin}
                  visibilityField="oldPin"
                  isVisible={pinVisibility.oldPin}
                  onValueChange={onOldPinChange}
                  onToggleVisibility={onTogglePinVisibility}
                />
                <PinInput
                  label="New PIN (6 digits)"
                  value={newChangePin}
                  visibilityField="newChangePin"
                  isVisible={pinVisibility.newChangePin}
                  onValueChange={onNewChangePinChange}
                  onToggleVisibility={onTogglePinVisibility}
                />
                <PinInput
                  label="Confirm new PIN"
                  value={confirmChangePin}
                  visibilityField="confirmChangePin"
                  isVisible={pinVisibility.confirmChangePin}
                  onValueChange={onConfirmChangePinChange}
                  onToggleVisibility={onTogglePinVisibility}
                />
              </>
            ) : (
              <button
                type="button"
                onClick={onSendForgotPinOtp}
                disabled={isSendingForgotOtp || isSubmittingPin}
                className="text-xs font-semibold text-[#ff4f00] hover:text-[#ff4f00]/80 hover:underline transition-colors disabled:opacity-60"
              >
                {isSendingForgotOtp ? "Sending OTP..." : "Forgot PIN?"}
              </button>
            )}
          </div>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isActionLocked}
            className="h-10 px-4 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={isForgotPinFlow ? onResetPinWithOtp : onSubmitPinModal}
            disabled={isActionLocked}
            className="h-10 px-4 rounded-xl text-white text-sm font-semibold bg-[#ff4f00] hover:bg-[#ff4f00]/95 transition-all disabled:opacity-60"
          >
            {isForgotPinFlow
              ? isResettingPin
                ? "Resetting..."
                : "Reset PIN"
              : isSubmittingPin
                ? "Processing..."
                : "OK"}
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(modal, document.body)
    : null;
}
