"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import toast from "react-hot-toast";
import RefundStatusBadge from "./RefundStatusBadge";
import { refundsApi } from "@/features/refunds/services/refunds-api";
import type { RefundDetail } from "@/features/refunds/types/refunds";

interface RefundDetailModalProps {
  isOpen: boolean;
  refundId: number | null;
  onClose: () => void;
  onCancelSuccess: () => void;
}

function formatPrice(amount: number): string {
  return amount.toLocaleString("vi-VN") + " ₫";
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr.endsWith("Z") ? dateStr : dateStr + "Z");
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function RefundDetailModal({
  isOpen,
  refundId,
  onClose,
  onCancelSuccess,
}: RefundDetailModalProps) {
  const [refund, setRefund] = useState<RefundDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  const rejectReason = useMemo(() => {
    if (!refund || !refund.reasonDetails) return null;
    const parts = refund.reasonDetails.split("Reject Reason:");
    if (parts.length > 1) {
      return parts[parts.length - 1].trim();
    }
    return null;
  }, [refund]);

  useEffect(() => {
    if (!isOpen || !refundId) return;
    setIsLoading(true);
    setRefund(null);
    refundsApi
      .getRefundById(refundId)
      .then(setRefund)
      .catch(() => toast.error("Unable to load refund details."))
      .finally(() => setIsLoading(false));
  }, [isOpen, refundId]);

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

  const handleCancel = async () => {
    if (!refundId) return;
    setIsCancelling(true);
    try {
      await refundsApi.cancelRefund(refundId);
      toast.success("Refund request cancelled.");
      onCancelSuccess();
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to cancel refund.",
      );
    } finally {
      setIsCancelling(false);
    }
  };

  if (!isOpen) return null;

  const modal = (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#0f172a]/50"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div
        className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col"
        style={{ maxHeight: "92vh" }}
      >
        {/* Header */}
        <div
          className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex-shrink-0"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "#ff4f00" }}
              >
                <span className="material-symbols-outlined text-white text-[20px]">
                  assignment_return
                </span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#0f172a]">
                  Refund Details
                </h2>
                {refund && (
                  <p className="text-xs text-[#475569]">
                    Order #{refund.orderCode}
                  </p>
                )}
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

        {/* Scrollable Body */}
        <div className="px-6 py-5 space-y-5 overflow-y-auto flex-1">
          {isLoading ? (
            <div className="space-y-3 animate-pulse">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-10 rounded-xl bg-slate-100" />
              ))}
            </div>
          ) : refund ? (
            <>
              {/* Status Banner */}
              <div
                className="rounded-xl p-4 flex items-center justify-between"
                style={{ background: "linear-gradient(135deg, #f8fafc, #fff)" }}
              >
                <div>
                  <p className="text-xs text-slate-500 mb-1">Current Status</p>
                  <RefundStatusBadge status={refund.refundStatus} />
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500 mb-1">Refund Amount</p>
                  <p className="text-xl font-black text-[#ff4f00]">
                    {formatPrice(refund.approvedAmount)}
                  </p>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-3">
                <InfoRow
                  icon="receipt_long"
                  label="Order Code"
                  value={`#${refund.orderCode}`}
                />
                <InfoRow
                  icon="calendar_today"
                  label="Requested On"
                  value={formatDate(refund.createdAt)}
                />
                <InfoRow
                  icon="flag"
                  label="Reason"
                  value={refund.refundReasonContent ?? "—"}
                />
                <InfoRow
                  icon="account_balance_wallet"
                  label="Payment Status"
                  value={refund.paymentStatus}
                />
              </div>

              {/* Details */}
              {refund.reasonDetails && (
                <div className="rounded-xl border border-slate-100 p-4">
                  <p className="text-xs font-bold text-[#475569] mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-[#ff4f00]">
                      notes
                    </span>
                    Additional Details
                  </p>
                  <p className="text-sm text-[#0f172a] leading-relaxed">
                    {refund.reasonDetails}
                  </p>
                </div>
              )}

              {/* Returned Items */}
              {refund.details && refund.details.length > 0 && (
                <div className="rounded-xl border border-slate-100 p-4">
                  <p className="text-xs font-bold text-[#475569] mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-[#ff4f00]">
                      inventory_2
                    </span>
                    Returned Products
                  </p>
                  <div className="space-y-2">
                    {refund.details.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-xs py-2 border-b border-dashed border-slate-100 last:border-0">
                        <div className="relative w-10 h-10 shrink-0 bg-slate-50 rounded-lg overflow-hidden border border-slate-100">
                          {item.productImage ? (
                            <Image
                              src={item.productImage}
                              alt={item.productName}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <span className="material-symbols-outlined text-lg">image</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-700 truncate">{item.productName}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Qty: <strong className="text-slate-600">{item.quantity}</strong></p>
                        </div>
                        <span className="font-bold text-[#ff4f00] shrink-0 ml-4">{formatPrice(item.refundAmount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Shipping Order Code (Courier Tracking) */}
              {refund.shippingOrderCode && (
                <div className="rounded-xl border border-orange-100 bg-orange-50/15 p-4 flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#ff4f00] text-[20px] mt-0.5">
                    local_shipping
                  </span>
                  <div className="flex-grow">
                    <p className="text-xs font-bold text-slate-700 mb-0.5">Return Waybill (Courier Tracking)</p>
                    <p className="text-xs text-slate-500 mb-2 leading-relaxed">A return shipment has been manually initiated by staff. You can track the return journey using this waybill code:</p>
                    <div className="flex items-center gap-2">
                      <span className="bg-slate-100 px-3 py-1 rounded font-mono text-xs font-bold text-slate-800 tracking-wider">
                        {refund.shippingOrderCode}
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(refund.shippingOrderCode || "");
                          toast.success("Waybill code copied!");
                        }}
                        className="text-[11px] font-bold text-[#ff4f00] hover:underline"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Admin note (Quality Inspection) */}
              {refund.adminNote && (
                <div className="rounded-xl border border-blue-100 bg-blue-50/15 p-4">
                  <p className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-blue-500">
                      fact_check
                    </span>
                    Warehouse Receipt / Quality Inspection Result
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed bg-white/60 p-3 rounded-lg border border-slate-50 italic">
                    {refund.adminNote}
                  </p>
                </div>
              )}

              {/* Evidence Images */}
              {refund.images && refund.images.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-[#475569] mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-[#ff4f00]">
                      image
                    </span>
                    Evidence Photos ({refund.images.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {refund.images.map((url, idx) => (
                      <a
                        key={idx}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <div className="w-20 h-20 rounded-xl overflow-hidden border border-slate-200 relative hover:opacity-80 transition-opacity">
                          <Image
                            src={url}
                            alt={`Evidence ${idx + 1}`}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Timeline */}
              {refund.updatedAt && (
                <div className="rounded-xl border border-slate-100 p-4 flex items-center gap-3">
                  <span className="material-symbols-outlined text-slate-400 text-[18px]">
                    update
                  </span>
                  <div>
                    <p className="text-xs text-slate-400">Last Updated</p>
                    <p className="text-sm font-semibold text-[#0f172a]">
                      {formatDate(refund.updatedAt)}
                    </p>
                  </div>
                </div>
              )}
              {/* Actions removed from scrollable body to prevent duplicates. Kept only in the fixed footer. */}
            </>
          ) : (
            <div className="py-12 flex flex-col items-center gap-3 text-slate-400">
              <span className="material-symbols-outlined text-5xl opacity-40">
                error
              </span>
              <p className="text-sm">Failed to load refund details.</p>
            </div>
          )}
        </div>

        {/* Fixed Footer */}
        {!isLoading && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex gap-3 flex-shrink-0">
            <button
              onClick={onClose}
              disabled={isCancelling}
              className="flex-grow h-11 rounded-xl border border-slate-200 text-[#0f172a] text-sm font-bold hover:bg-slate-50 transition-colors bg-white"
            >
              Close
            </button>
            {refund && (refund.refundStatus === "RefundRequested" || refund.refundStatus === "Requested") && (
              <button
                onClick={handleCancel}
                disabled={isCancelling}
                className="flex-grow h-11 rounded-xl border-2 border-red-200 text-red-600 text-sm font-bold hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white"
              >
                {isCancelling ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                    Cancelling...
                  </span>
                ) : (
                  "Cancel Request"
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(modal, document.body)
    : null;
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-100 p-3">
      <div className="flex items-center gap-2 mb-1">
        <span className="material-symbols-outlined text-[14px] text-[#ff4f00]">
          {icon}
        </span>
        <p className="text-xs text-slate-400 font-medium">{label}</p>
      </div>
      <p className="text-sm font-semibold text-[#0f172a] truncate">{value}</p>
    </div>
  );
}
