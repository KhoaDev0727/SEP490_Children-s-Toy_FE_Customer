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

interface SelectedImage {
  file: File;
  preview: string;
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg", "image/gif"];

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
  // Derive selected reason object for responsibleParty check
  const selectedReason = reasons.find((r) => r.refundReasonId === reasonId);
  const [details, setDetails] = useState("");
  const [refundType, setRefundType] = useState<"ReturnAndRefund" | "RefundOnly">("ReturnAndRefund");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingReasons, setIsLoadingReasons] = useState(false);
  const [walletStatus, setWalletStatus] = useState<"checking" | "active" | "frozen" | "none">("checking");
  const [orderDetail, setOrderDetail] = useState<CustomerOrderDetail | null>(null);
  const [isLoadingOrder, setIsLoadingOrder] = useState(false);
  const [selectedItems, setSelectedItems] = useState<{ [productId: number]: ItemSelection }>({});
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Clean up object URLs
  useEffect(() => {
    if (!isOpen) {
      selectedImages.forEach((img) => URL.revokeObjectURL(img.preview));
      setSelectedImages([]);
    }
    return () => {
      selectedImages.forEach((img) => URL.revokeObjectURL(img.preview));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const totalImages = selectedImages.length + filesArray.length;
      if (totalImages > 5) {
        toast.error("Maximum 5 evidence images");
        e.target.value = "";
        return;
      }

      for (const file of filesArray) {
        if (!ALLOWED_IMAGE_TYPES.includes(file.type.toLowerCase())) {
          toast.error("Only .jpg, .jpeg, .png, .gif, and .webp formats are allowed.");
          e.target.value = "";
          return;
        }

        if (file.size > MAX_IMAGE_SIZE) {
          toast.error("Each image must not exceed 5MB.");
          e.target.value = "";
          return;
        }
      }

      const newImages = filesArray.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));

      setSelectedImages((prev) => [...prev, ...newImages]);
      e.target.value = "";
    }
  };

  const removeImage = (index: number) => {
    const imgObj = selectedImages[index];
    if (imgObj) {
      URL.revokeObjectURL(imgObj.preview);
    }
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const hasActiveWallet = walletStatus === "active";

  const checkWallet = useCallback(async () => {
    setWalletStatus("checking");
    try {
      const res = await axiosClient.get<{ status?: string } | null>("/wallets/me");
      if (!res) {
        setWalletStatus("none");
        return;
      }
      const status = res.status ?? "";
      const lowerStatus = status.toLowerCase();

      if (lowerStatus === "active") {
        setWalletStatus("active");
      } else if (lowerStatus === "frozen") {
        setWalletStatus("frozen");
      } else {
        setWalletStatus("none");
      }
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
      setRefundType("ReturnAndRefund");
      setOrderDetail(null);
      setSelectedItems({});
      setSelectedImages([]);
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

    // If all items are returned with full quantities, use exact product total (subTotal - voucherDiscountAmount) + shipping fee
    if (isFullReturn) {
      const targetProductSum = subTotal - voucherDiscountAmount;
      const shippingFee = orderDetail.actualShippingFee !== undefined && orderDetail.actualShippingFee !== null
        ? orderDetail.actualShippingFee
        : orderDetail.estimatedShippingFee || 0;
      return targetProductSum + shippingFee;
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

    if (selectedImages.length === 0) {
      toast.error("Please upload at least one evidence image.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Upload evidence images first to get Cloudinary URLs
      const uploadedUrls: string[] = [];
      for (const img of selectedImages) {
        const uploadResult = await refundsApi.uploadEvidenceImage(img.file);
        uploadedUrls.push(uploadResult.url);
      }

      await refundsApi.createRefund({
        orderId,
        refundReasonId: reasonId as number,
        refundType,
        reasonDetails: details.trim() || undefined,
        images: uploadedUrls,
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
                  Create Refund Request
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

            {walletStatus === "frozen" && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 flex gap-3">
                <span className="material-symbols-outlined text-amber-500 text-[20px] flex-shrink-0 mt-0.5">
                  info
                </span>
                <div>
                  <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">
                    Wallet is Frozen
                  </h4>
                  <p className="text-xs text-amber-700 leading-relaxed">
                    Your e-wallet is currently frozen. You can still submit this refund request, and refunds can be credited to your wallet. However, you will need to contact support to unfreeze it before making withdrawals.
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

            {/* Refund Type Selection */}
            <div>
              <label className="block text-sm font-bold text-[#261812] mb-3">
                Refund Type <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRefundType("ReturnAndRefund")}
                  className={`p-4 rounded-xl border text-left transition-all ${refundType === "ReturnAndRefund"
                      ? "border-[#ff6a00] bg-[#ff6a00]/5 ring-1 ring-[#ff6a00]"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`material-symbols-outlined text-[18px] ${refundType === "ReturnAndRefund" ? "text-[#ff6a00]" : "text-slate-400"}`}>
                      keyboard_return
                    </span>
                    <span className="text-xs font-bold text-slate-800">Return & Refund</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    Return items to the store to get a refund.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setRefundType("RefundOnly")}
                  className={`p-4 rounded-xl border text-left transition-all ${refundType === "RefundOnly"
                      ? "border-[#ff6a00] bg-[#ff6a00]/5 ring-1 ring-[#ff6a00]"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`material-symbols-outlined text-[18px] ${refundType === "RefundOnly" ? "text-[#ff6a00]" : "text-slate-400"}`}>
                      account_balance_wallet
                    </span>
                    <span className="text-xs font-bold text-slate-800">Refund Only</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    Get a refund without returning items (missing/broken).
                  </p>
                </button>
              </div>
            </div>

            {/* Refund Items List */}
            <div>
              <label className="block text-sm font-bold text-[#261812] mb-3">
                {refundType === "ReturnAndRefund" ? "Select Products to Return" : "Select Products for Refund"} <span className="text-red-500">*</span>
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
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-semibold text-[#ff6a00]">
                                {formatPrice(item.unitPrice)}
                              </span>
                              <span className="text-[10px] text-slate-400 font-normal">
                                (Ordered: {item.quantity})
                              </span>
                            </div>

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
              <div className="space-y-2">
                <div className="p-3.5 rounded-xl bg-orange-50/50 border border-orange-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600">
                    Estimated Refund Amount:
                  </span>
                  <span className="text-sm font-black text-[#ff6a00]">
                    {formatPrice(estimatedRefundAmount)}
                  </span>
                </div>
                {orderDetail && orderDetail.voucherDiscountAmount > 0 && (
                  <p className="text-[10px] text-slate-400 bg-slate-50 border border-slate-100 rounded-lg p-2.5 leading-relaxed">
                    Note: The refund amount has been adjusted proportionally to account for the voucher discount applied to this order.
                  </p>
                )}
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

            {/* Evidence Image Upload */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-bold text-[#261812]">
                  Evidence Images <span className="text-red-500">*</span>
                </label>
                <span className="text-[10px] font-bold text-slate-400 tracking-wider">
                  {selectedImages.length} / 5
                </span>
              </div>

              <div className="flex flex-wrap gap-3">
                {selectedImages.map((imgObj, idx) => (
                  <div
                    key={idx}
                    className="relative group/img w-20 h-20 rounded-xl overflow-hidden border border-slate-200 shadow-sm animate-in zoom-in duration-200 flex-shrink-0"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imgObj.preview}
                      alt="preview"
                      className="w-full h-full object-cover transition-transform group-hover/img:scale-110"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 w-6 h-6 bg-slate-900/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover/img:opacity-100 hover:bg-red-500 transition-all duration-200"
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        close
                      </span>
                    </button>
                  </div>
                ))}

                {selectedImages.length < 5 && (
                  <label className="w-20 h-20 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#ff6a00]/40 hover:bg-[#ff6a00]/5 hover:text-[#ff6a00] transition-all text-slate-400 flex-shrink-0 bg-white">
                    <span className="material-symbols-outlined text-[24px]">
                      add_photo_alternate
                    </span>
                    <span className="text-[9px] font-bold mt-1 uppercase tracking-tighter">
                      Add Image
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/jpg,image/gif"
                      multiple
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                )}
              </div>

              {/* Warning nếu khách chịu phí ship hoàn trả */}
              {selectedReason?.responsibleParty === "Customer" && (
                <div className="flex gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3.5">
                  <span className="material-symbols-outlined text-amber-500 text-[18px] shrink-0 mt-0.5">info</span>
                  <div>
                    <p className="text-xs font-bold text-amber-800 mb-0.5">Return shipping fee notice</p>
                    <p className="text-xs text-amber-700 leading-relaxed">
                      For this reason, <strong>you are responsible</strong> for the return shipping cost.
                      The fee will be deducted from your refund amount when the shop approves your request.
                    </p>
                  </div>
                </div>
              )}
              <p className="text-[10px] text-slate-400">
                Please upload at least 1 image of the toy showing the defect or issue. Max 5 images.
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
              disabled={isSubmitting || (walletStatus !== "active" && walletStatus !== "frozen") || !reasonId || estimatedRefundAmount === 0 || selectedImages.length === 0}
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
