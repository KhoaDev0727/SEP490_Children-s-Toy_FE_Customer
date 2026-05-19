"use client";

import { useEffect, useState } from "react";

interface CancelOrderModalProps {
  isOpen: boolean;
  orderCode: string;
  onConfirm: (reason: string) => void | Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export default function CancelOrderModal({
  isOpen,
  orderCode,
  onConfirm,
  onCancel,
  isSubmitting = false,
}: CancelOrderModalProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      // Reset state when opened
      setReason("");
      setError(null);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedReason = reason.trim();

    if (!trimmedReason) {
      setError("Please enter a reason for cancelling the order.");
      return;
    }

    if (trimmedReason.length < 5) {
      setError("The cancellation reason must be at least 5 characters.");
      return;
    }

    setError(null);
    void onConfirm(trimmedReason);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop with elegant blur */}
      <div
        className="absolute inset-0 bg-slate-950/60 transition-opacity duration-300"
        onClick={isSubmitting ? undefined : onCancel}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 sm:p-8 text-left align-middle shadow-2xl transition-all animate-in fade-in zoom-in duration-200 border border-[#e2bfb0]/30">

        {/* Close Button */}
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100 disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-50 border border-red-100">
            <span className="material-symbols-outlined text-red-500 text-2xl animate-pulse">
              heart_broken
            </span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#261812]">
              Cancel Order #{orderCode}
            </h3>
            <p className="text-sm text-slate-500 mt-1 leading-relaxed">
              Are you sure you want to cancel this order? This action cannot be undone.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Text Area */}
          <div className="relative">
            <label
              htmlFor="cancel-reason"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2"
            >
              Your Detailed Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              id="cancel-reason"
              rows={4}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError(null);
              }}
              disabled={isSubmitting}
              placeholder="Please enter a specific reason why you want to cancel this order..."
              maxLength={200}
              className={`w-full px-4 py-3 rounded-xl border bg-slate-50/50 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ff6a00] focus:border-[#ff6a00] transition-all resize-none ${error
                ? "border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50/10"
                : "border-slate-200"
                }`}
            />
            {/* Character count */}
            <div className="absolute right-3 bottom-3 text-[10px] font-semibold text-slate-400">
              {reason.length}/200
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 text-xs font-medium text-red-500 bg-red-50 border border-red-100 px-3 py-2.5 rounded-xl animate-shake">
              <span className="material-symbols-outlined text-base">error</span>
              <span>{error}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="w-full sm:w-auto inline-flex justify-center items-center rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all disabled:opacity-50"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto inline-flex justify-center items-center rounded-xl bg-red-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-red-600/10 hover:bg-red-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed hover:scale-[1.02]"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Processing...
                </>
              ) : (
                "Confirm Cancellation"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
