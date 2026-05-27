"use client";

import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import toast from "react-hot-toast";
import { refundsApi } from "@/features/refunds/services/refunds-api";
import { ordersApi } from "@/features/orders/services/orders-api";
import axiosClient from "@/configs/axios-client";
import type { RefundReason } from "@/features/refunds/types/refunds";
import type { CustomerOrderDetail } from "@/features/orders/types/orders";

interface CreateRefundModalProps {
  isOpen: boolean;
  orderId: number;
  orderCode: string;
  orderTotal: number;
  hasWallet: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ItemSelection {
  checked: boolean;
  quantity: number;
}

function formatPrice(amount: number): string {
  return amount.toLocaleString("vi-VN") + " ₫";
}

export default function CreateRefundModal({
  isOpen,
  orderId,
  orderCode,
  onClose,
  onSuccess,
}: CreateRefundModalProps) {
  const [reasons, setReasons] = useState<RefundReason[]>([]);
  const [reasonId, setReasonId] = useState<number | "">("");
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingReasons, setIsLoadingReasons] = useState(false);
  const [walletStatus, setWalletStatus] = useState<"checking" | "active" | "none">("checking");
  const [orderDetail, setOrderDetail] = useState<CustomerOrderDetail | null>(null);
  const [isLoadingOrder, setIsLoadingOrder] = useState(false);
  const [selectedItems, setSelectedItems] = useState<{ [productId: number]: ItemSelection }>({});
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
      toast.error("Unable to load return reasons.");
    } finally {
      setIsLoadingReasons(false);
    }
  }, []);

  const loadOrderDetail = useCallback(async () => {
    setIsLoadingOrder(true);
    try {
      const data = await ordersApi.getOrderDetail(orderId);
      setOrderDetail(data);
      
      // Initialize selected items state
      const initial: { [productId: number]: ItemSelection } = {};
      if (data && data.items) {
        data.items.forEach(item => {
          initial[item.productId] = { checked: false, quantity: 1 };
        });
      }
      setSelectedItems(initial);
    } catch {
      toast.error("Unable to load order details.");
    } finally {
      setIsLoadingOrder(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (isOpen) {
      setReasonId("");
      setDetails("");
      setOrderDetail(null);
      setSelectedItems({});
      void checkWallet();
      void loadReasons();
      void loadOrderDetail();
    }
  }, [isOpen, checkWallet, loadReasons, loadOrderDetail]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  // Calculate dynamic refund amount estimation based on checked items
  const estimatedRefundAmount = useMemo(() => {
    if (!orderDetail || !orderDetail.items) return 0;
    let sum = 0;
    orderDetail.items.forEach((item) => {
      const state = selectedItems[item.productId];
      if (state && state.checked) {
        sum += item.unitPrice * state.quantity;
      }
    });
    return sum;
  }, [orderDetail, selectedItems]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reasonId) {
      toast.error("Please select a return reason.");
      return;
    }

    const returnItems = Object.entries(selectedItems)
      .filter(([_, value]) => value.checked)
      .map(([productId, value]) => ({
        productId: Number(productId),
        quantity: value.quantity,
      }));

    if (returnItems.length === 0) {
      toast.error("Please select at least one product to return.");
      return;
    }

    setIsSubmitting(true);
    try {
      await refundsApi.createRefund({
        orderId,
        refundReasonId: reasonId as number,
        reasonDetails: details.trim() || undefined,
        images: [],
        items: returnItems,
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
                  Refund Request
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
                Wallet Activation Required
              </p>
              <p className="text-xs text-amber-700 leading-relaxed">
                You need to activate your wallet to receive refunds. The refunded amount will be credited directly to your wallet once the request is approved.
              </p>
              <a
                href="/profile/wallet"
                className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-amber-700 underline underline-offset-2 hover:text-amber-900 transition-colors"
              >
                <span className="material-symbols-outlined text-[14px]">
                  account_balance_wallet
                </span>
                Set Up My Wallet
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
              Wallet is active — refunds will be automatically credited upon approval.
            </p>
          </div>
        )}

        {/* Caution Single Request Banner */}
        <div className="mx-6 mt-5 rounded-xl border border-orange-200 bg-orange-50 p-4 flex gap-3">
          <span className="material-symbols-outlined text-orange-500 text-[22px] flex-shrink-0 mt-0.5">
            warning
          </span>
          <div>
            <p className="text-sm font-bold text-orange-800 mb-1">
              Important Notice
            </p>
            <p className="text-xs text-orange-700 leading-relaxed">
              Each order is only allowed to have <strong>exactly 1 refund request</strong> in its entire lifecycle. Please ensure you select <strong>all products</strong> you wish to return in this single submission.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 pt-5 space-y-5">
          {/* Product Checklist */}
          <div>
            <label className="block text-sm font-bold text-[#261812] mb-2">
              Products to Return <span className="text-red-500">*</span>
            </label>
            {isLoadingOrder ? (
              <div className="space-y-2 animate-pulse">
                <div className="h-14 bg-slate-100 rounded-xl" />
                <div className="h-14 bg-slate-100 rounded-xl" />
              </div>
            ) : orderDetail && orderDetail.items && orderDetail.items.length > 0 ? (
              <div className="space-y-3 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                {orderDetail.items.map((item) => {
                  const state = selectedItems[item.productId] || { checked: false, quantity: 1 };
                  return (
                    <div
                      key={item.productId}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                        state.checked
                          ? "border-[#ff6a00] bg-orange-50/10"
                          : "border-slate-100 bg-white hover:border-slate-200"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={state.checked}
                        onChange={(e) => {
                          setSelectedItems((prev) => ({
                            ...prev,
                            [item.productId]: {
                              ...prev[item.productId],
                              checked: e.target.checked,
                            },
                          }));
                        }}
                        className="w-4 h-4 rounded text-[#ff6a00] focus:ring-[#ff6a00] border-slate-300 cursor-pointer"
                      />
                      {item.productImage && (
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-100 flex-shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.productImage}
                            alt={item.productName}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      )}
                      <div className="flex-grow min-w-0">
                        <p className="text-xs font-bold text-[#261812] truncate">
                          {item.productName}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {formatPrice(item.unitPrice)} · max {item.quantity} items
                        </p>
                      </div>
                      {state.checked && (
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <button
                            type="button"
                            disabled={state.quantity <= 1}
                            onClick={() => {
                              setSelectedItems((prev) => ({
                                ...prev,
                                [item.productId]: {
                                  ...prev[item.productId],
                                  quantity: Math.max(1, prev[item.productId].quantity - 1),
                                },
                              }));
                            }}
                            className="w-6 h-6 rounded bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs hover:bg-slate-200 disabled:opacity-40 transition-colors"
                          >
                            -
                          </button>
                          <span className="text-xs font-bold w-4 text-center text-[#261812]">
                            {state.quantity}
                          </span>
                          <button
                            type="button"
                            disabled={state.quantity >= item.quantity}
                            onClick={() => {
                              setSelectedItems((prev) => ({
                                ...prev,
                                [item.productId]: {
                                  ...prev[item.productId],
                                  quantity: Math.min(item.quantity, prev[item.productId].quantity + 1),
                                },
                              }));
                            }}
                            className="w-6 h-6 rounded bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs hover:bg-slate-200 disabled:opacity-40 transition-colors"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No eligible products found.</p>
            )}
          </div>

          {/* Order Summary */}
          <div
            className="rounded-xl p-4 border border-slate-100"
            style={{ backgroundColor: "#f8fafc" }}
          >
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#5a4136] font-medium">Estimated Refund Amount</span>
              <span className="text-lg font-black text-[#ff6a00]">
                {formatPrice(estimatedRefundAmount)}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              The final refund amount will be reconciled based on the order's discount terms.
            </p>
          </div>

          {/* Reason Select */}
          <div>
            <label className="block text-sm font-bold text-[#261812] mb-2">
              Refund Reason <span className="text-red-500">*</span>
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
                className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm text-[#261812] outline-none transition-all focus:border-[#ff6a00]"
              >
                <option value="">Select refund reason...</option>
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
              <span className="text-xs font-normal text-slate-400">(optional)</span>
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="Enter more details or describe product quality..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-[#261812] resize-none outline-none transition-all focus:border-[#ff6a00]"
            />
            <p className="text-right text-xs text-slate-400 mt-1">
              {details.length}/500
            </p>
          </div>

          {/* Policy Note */}
          <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3 flex gap-2">
            <span className="material-symbols-outlined text-blue-400 text-[18px] flex-shrink-0 mt-0.5">
              info
            </span>
            <p className="text-[11px] text-blue-700 leading-relaxed">
              Refund requests must be submitted within <strong>3 days</strong> of successful order delivery.
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
              disabled={isSubmitting || !hasActiveWallet || !reasonId || estimatedRefundAmount === 0}
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
