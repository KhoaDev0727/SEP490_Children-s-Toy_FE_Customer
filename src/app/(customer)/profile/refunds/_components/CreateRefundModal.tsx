"use client";

import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
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

  // Calculate dynamic refund amount estimation based on checked items
  const estimatedRefundAmount = useMemo(() => {
    if (!orderDetail || !orderDetail.items) return 0;

    const subTotal = orderDetail.subTotal || 0;
    const voucherDiscountAmount = orderDetail.voucherDiscountAmount || 0;
    const discountRatio = subTotal > 0 ? voucherDiscountAmount / subTotal : 0;

    let sum = 0;
    let checkedCount = 0;
    let isFullReturn = true;

    orderDetail.items.forEach((item) => {
      const state = selectedItems[item.productId];
      if (state && state.checked) {
        checkedCount++;
        // Apply voucher discount ratio (same as backend)
        const itemRefundAmount = Math.round(state.quantity * item.unitPrice * (1 - discountRatio));
        sum += itemRefundAmount;

        if (state.quantity < item.quantity) {
          isFullReturn = false;
        }
      } else {
        isFullReturn = false;
      }
    });

    if (checkedCount === 0) return 0;

    // If all items are returned with full quantities, add shipping fee
    if (isFullReturn) {
      const shippingFee = orderDetail.actualShippingFee !== undefined && orderDetail.actualShippingFee !== null
        ? orderDetail.actualShippingFee
        : orderDetail.estimatedShippingFee || 0;
      sum += shippingFee;
    }

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

  const modal = (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/60"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div
        className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col"
        style={{ maxHeight: "90vh" }}
      >
        {/* Header */}
        <div
          className="px-6 py-5 border-b border-slate-100 bg-slate-100 flex-shrink-0"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <h3 className="text-lg font-bold text-[#261812]">
                  Create Return/Refund Request
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Order Code: <span className="font-semibold text-slate-700">#{orderCode}</span>
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-grow flex flex-col overflow-hidden">
          {/* Scrollable Body */}
          <div className="p-6 space-y-6 overflow-y-auto flex-grow">
            {/* Wallet Status Warning */}
            {walletStatus === "none" && (
              <div className="rounded-xl border border-red-100 bg-red-50/50 p-4 flex gap-3">
                <span className="material-symbols-outlined text-red-500 text-[20px] flex-shrink-0 mt-0.5">
                  warning
                </span>
                <div>
                  <h4 className="text-xs font-bold text-red-800 uppercase tracking-wider mb-1">
                    Active Wallet Required
                  </h4>
                  <p className="text-xs text-red-700 leading-relaxed">
                    You must set up and activate your wallet inside profile management first to receive refunds.
                  </p>
                </div>
              </div>
            )}

            {walletStatus === "active" && (
              <div className="rounded-xl border border-green-100 bg-green-50/50 p-4 flex gap-3">
                <span className="material-symbols-outlined text-green-500 text-[20px] flex-shrink-0 mt-0.5">
                  check_circle
                </span>
                <div>
                  <h4 className="text-xs font-bold text-green-800 uppercase tracking-wider mb-1">
                    Refund Method: E-Wallet
                  </h4>
                  <p className="text-xs text-green-700 leading-relaxed">
                    Refunds are credited directly to your connected, secure store e-wallet.
                  </p>
                </div>
              </div>
            )}

            {/* Refund Items List */}
            <div>
              <label className="block text-sm font-bold text-[#261812] mb-3">
                Select Products to Return <span className="text-red-500">*</span>
              </label>

              {isLoadingOrder ? (
                <div className="py-8 flex flex-col items-center justify-center gap-2">
                  <div className="w-6 h-6 border-2 border-[#ff6a00]/30 border-t-[#ff6a00] rounded-full animate-spin" />
                  <span className="text-xs text-slate-500">Loading order items...</span>
                </div>
              ) : orderDetail && orderDetail.items && orderDetail.items.length > 0 ? (
                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                  {orderDetail.items.map((item) => {
                    const state = selectedItems[item.productId] || { checked: false, quantity: 1 };
                    return (
                      <div
                        key={item.productId}
                        className={`flex items-start gap-4 p-3.5 rounded-xl border transition-all ${state.checked
                          ? "border-[#ff6a00]/30 bg-[#ff6a00]/5"
                          : "border-slate-100 hover:border-slate-200"
                          }`}
                      >
                        {/* Checkbox */}
                        <div className="pt-0.5">
                          <input
                            type="checkbox"
                            checked={state.checked}
                            onChange={(e) => {
                              setSelectedItems((prev) => ({
                                ...prev,
                                [item.productId]: {
                                  ...state,
                                  checked: e.target.checked,
                                },
                              }));
                            }}
                            className="w-4 h-4 rounded text-[#ff6a00] border-slate-300 focus:ring-[#ff6a00] cursor-pointer"
                          />
                        </div>

                        {/* Product Image */}
                        <div className="relative w-12 h-12 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 flex-shrink-0 overflow-hidden">
                          {item.productImage ? (
                            <Image
                              src={item.productImage}
                              alt={item.productName}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <span className="material-symbols-outlined text-[20px]">
                              toys
                            </span>
                          )}
                        </div>

                        {/* Info & Quantity controls */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-slate-800 truncate">
                            {item.productName}
                          </h4>
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs font-semibold text-[#ff6a00]">
                              {formatPrice(item.unitPrice)}
                            </p>

                            {state.checked && (
                              <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden">
                                <button
                                  type="button"
                                  disabled={state.quantity <= 1}
                                  onClick={() => {
                                    setSelectedItems((prev) => ({
                                      ...prev,
                                      [item.productId]: {
                                        ...state,
                                        quantity: state.quantity - 1,
                                      },
                                    }));
                                  }}
                                  className="w-7 h-7 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-30 transition-colors"
                                >
                                  <span className="material-symbols-outlined text-[16px]">
                                    remove
                                  </span>
                                </button>
                                <span className="w-8 text-center text-xs font-bold text-slate-700">
                                  {state.quantity}
                                </span>
                                <button
                                  type="button"
                                  disabled={state.quantity >= item.quantity}
                                  onClick={() => {
                                    setSelectedItems((prev) => ({
                                      ...prev,
                                      [item.productId]: {
                                        ...state,
                                        quantity: state.quantity + 1,
                                      },
                                    }));
                                  }}
                                  className="w-7 h-7 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-30 transition-colors"
                                >
                                  <span className="material-symbols-outlined text-[16px]">
                                    add
                                  </span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-500 text-center py-4">
                  No items available to return in this order.
                </p>
              )}
            </div>

            {/* Dynamic Refund Estimate Display */}
            {estimatedRefundAmount > 0 && (
              <div className="p-3.5 rounded-xl bg-orange-50/50 border border-orange-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">
                  Estimated Refund Amount:
                </span>
                <span className="text-sm font-black text-[#ff6a00]">
                  {formatPrice(estimatedRefundAmount)}
                </span>
              </div>
            )}

            {/* Refund Reason Selection */}
            <div>
              <label className="block text-sm font-bold text-[#261812] mb-2">
                Reason for Return/Refund <span className="text-red-500">*</span>
              </label>
              {isLoadingReasons ? (
                <div className="h-11 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-slate-300 border-t-[#ff6a00] rounded-full animate-spin" />
                </div>
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

          </div>

          {/* Fixed Footer */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex gap-3 flex-shrink-0 w-full">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-grow h-11 rounded-xl border border-slate-200 text-[#261812] text-sm font-bold hover:bg-slate-50 transition-colors disabled:opacity-50 bg-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || walletStatus !== "active" || !reasonId || estimatedRefundAmount === 0}
              className="flex-grow h-11 rounded-xl text-white text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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

  return typeof document !== "undefined"
    ? createPortal(modal, document.body)
    : null;
}
