"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { refundsApi } from "@/features/refunds/services/refunds-api";
import axiosClient from "@/configs/axios-client";
import type { RefundReason } from "@/features/refunds/types/refunds";

interface CreateRefundModalProps {
  isOpen: boolean;
  orderId: number;
  orderCode: string;
  orderTotal: number;
  hasWallet: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function formatPrice(amount: number): string {
  return amount.toLocaleString("vi-VN") + " ₫";
}

export default function CreateRefundModal({
  isOpen,
  orderId,
  orderCode,
  orderTotal,
  onClose,
  onSuccess,
}: CreateRefundModalProps) {
  const [reasons, setReasons] = useState<RefundReason[]>([]);
  const [reasonId, setReasonId] = useState<number | "">("");
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingReasons, setIsLoadingReasons] = useState(false);
  const [walletStatus, setWalletStatus] = useState<"checking" | "active" | "none">("checking");
  const overlayRef = useRef<HTMLDivElement>(null);

  const hasActiveWallet = walletStatus === "active";

  const checkWallet = useCallback(async () => {
    setWalletStatus("checking");
    try {
      const res = await axiosClient.get<{ status?: string } | null>("/wallets/me");
      const status = res?.status ?? "";
      
      setWalletStatus(
        status.toLowerCase() === "active" ? "active" : "none",
      );
    } catch {
      setWalletStatus("none");
    }
  }, []);

  const loadReasons = useCallback(async () => {
    setIsLoadingReasons(true);
    try {
      const data = await refundsApi.getRefundReasons();
      setReasons(data);
    } catch {
      toast.error("Unable to load refund reasons. Please try again.");
    } finally {
      setIsLoadingReasons(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setReasonId("");
      setDetails("");
      void checkWallet();
      void loadReasons();
    }
  }, [isOpen, checkWallet, loadReasons]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reasonId) {
      toast.error("Please select a refund reason.");
      return;
    }
    setIsSubmitting(true);
    try {
      await refundsApi.createRefund({
        orderId,
        refundReasonId: reasonId as number,
        reasonDetails: details.trim() || undefined,
        images: [],
      });
      toast.success("Refund request submitted successfully!");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to submit refund request.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden"
        style={{ maxHeight: "90vh", overflowY: "auto" }}
      >
        {/* Header */}
        <div
          className="px-6 py-5 border-b border-slate-100"
          style={{ background: "linear-gradient(135deg, #fff7f3 0%, #fff 100%)" }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #ff6a00, #ff8a1f)" }}
              >
                <span className="material-symbols-outlined text-white text-[20px]">
                  assignment_return
                </span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#261812]">
                  Request Refund
                </h2>
                <p className="text-xs text-[#5a4136]">Order #{orderCode}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Wallet Status Banner */}
        {walletStatus === "checking" && (
          <div className="mx-6 mt-5 h-14 rounded-xl bg-slate-100 animate-pulse" />
        )}

        {walletStatus === "none" && (
          <div className="mx-6 mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 flex gap-3">
            <span className="material-symbols-outlined text-amber-500 text-[22px] flex-shrink-0 mt-0.5">
              warning
            </span>
            <div>
              <p className="text-sm font-bold text-amber-800 mb-1">
                Wallet Required
              </p>
              <p className="text-xs text-amber-700 leading-relaxed">
                You need an active wallet to receive your refund. The refunded
                amount will be credited to your wallet once approved.
              </p>
              <a
                href="/profile/wallet"
                className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-amber-700 underline underline-offset-2 hover:text-amber-900 transition-colors"
              >
                <span className="material-symbols-outlined text-[14px]">
                  account_balance_wallet
                </span>
                Set up my wallet
              </a>
            </div>
          </div>
        )}

        {walletStatus === "active" && (
          <div className="mx-6 mt-5 rounded-xl border border-green-200 bg-green-50 p-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-green-500 text-[18px]">
              check_circle
            </span>
            <p className="text-xs font-semibold text-green-700">
              Wallet active — refund will be credited automatically upon approval.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="px-6 pb-6 pt-5 space-y-5">
          {/* Order Summary */}
          <div
            className="rounded-xl p-4 border border-slate-100"
            style={{ backgroundColor: "#f8fafc" }}
          >
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#5a4136]">Refund amount</span>
              <span className="text-lg font-black text-[#ff6a00]">
                {formatPrice(orderTotal)}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Full order amount will be refunded to your wallet upon approval.
            </p>
          </div>

          {/* Reason Select */}
          <div>
            <label className="block text-sm font-bold text-[#261812] mb-2">
              Reason for Refund{" "}
              <span className="text-red-500">*</span>
            </label>
            {isLoadingReasons ? (
              <div className="h-11 rounded-xl bg-slate-100 animate-pulse" />
            ) : (
              <select
                value={reasonId}
                onChange={(e) =>
                  setReasonId(e.target.value ? Number(e.target.value) : "")
                }
                required
                className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm text-[#261812] outline-none transition-all"
                style={{ boxShadow: "0 0 0 0 transparent" }}
                onFocus={(e) =>
                  (e.currentTarget.style.boxShadow =
                    "0 0 0 3px rgba(255,106,0,0.15)")
                }
                onBlur={(e) =>
                  (e.currentTarget.style.boxShadow = "0 0 0 0 transparent")
                }
              >
                <option value="">Select a reason...</option>
                {reasons.map((r) => (
                  <option key={r.refundReasonId} value={r.refundReasonId}>
                    {r.content}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Additional Details */}
          <div>
            <label className="block text-sm font-bold text-[#261812] mb-2">
              Additional Details{" "}
              <span className="text-xs font-normal text-slate-400">
                (optional)
              </span>
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="Provide more context about your refund request..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-[#261812] resize-none outline-none transition-all"
              onFocus={(e) =>
                (e.currentTarget.style.boxShadow =
                  "0 0 0 3px rgba(255,106,0,0.15)")
              }
              onBlur={(e) =>
                (e.currentTarget.style.boxShadow = "0 0 0 0 transparent")
              }
            />
            <p className="text-right text-xs text-slate-400 mt-1">
              {details.length}/500
            </p>
          </div>

          {/* Policy Note */}
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-3 flex gap-2">
            <span className="material-symbols-outlined text-blue-400 text-[18px] flex-shrink-0 mt-0.5">
              info
            </span>
            <p className="text-xs text-blue-700 leading-relaxed">
              Refund requests must be submitted within{" "}
              <strong>3 days</strong> of order completion. Once approved, the
              refund will be credited to your wallet automatically.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 h-11 rounded-xl border border-slate-200 text-[#261812] text-sm font-bold hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !hasActiveWallet || !reasonId}
              className="flex-1 h-11 rounded-xl text-white text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: "linear-gradient(135deg, #ff6a00, #ff8a1f)",
                boxShadow: "0 8px 20px rgba(249,115,22,0.25)",
              }}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </span>
              ) : (
                "Submit Request"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
