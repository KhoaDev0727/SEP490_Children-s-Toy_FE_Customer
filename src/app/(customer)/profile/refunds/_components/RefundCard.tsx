"use client";

import RefundStatusBadge from "./RefundStatusBadge";
import type { RefundListItem } from "@/features/refunds/types/refunds";

interface RefundCardProps {
  refund: RefundListItem;
  onViewDetail: (refundId: number) => void;
}

function formatPrice(amount: number): string {
  return amount.toLocaleString("vi-VN") + " ₫";
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr.endsWith("Z") ? dateStr : dateStr + "Z");
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function RefundCard({ refund, onViewDetail }: RefundCardProps) {
  return (
    <div className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Card Header */}
      <div className="px-6 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#ff4f00] text-[20px]">
            assignment_return
          </span>
          <span className="text-sm font-bold text-[#0f172a]">
            Refund Request
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">
            Order #{refund.orderCode}
          </span>
          <RefundStatusBadge status={refund.returnToCustomerFeePaid && (refund.returnToCustomerFee ?? 0) > 0 && !["Cancelled", "Rejected"].includes(refund.refundStatus) ? "FeePaidAwaitingShipment" : refund.refundStatus} size="sm" />
        </div>
      </div>

      {/* Card Body */}
      <div className="p-6 flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-col gap-2 flex-grow min-w-0">
          {/* Reason */}
          <div className="flex items-start gap-2">
            <span className="material-symbols-outlined text-slate-400 text-[16px] mt-0.5 flex-shrink-0">
              flag
            </span>
            <div className="min-w-0">
              <p className="text-xs text-slate-400 mb-0.5">Reason</p>
              <p className="text-sm font-semibold text-[#0f172a] break-words line-clamp-2">
                {refund.refundReasonContent ?? "—"}
              </p>
            </div>
          </div>

          {/* Date */}
          <div className="flex items-start gap-2">
            <span className="material-symbols-outlined text-slate-400 text-[16px] mt-0.5 flex-shrink-0">
              calendar_today
            </span>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Requested On</p>
              <p className="text-sm font-semibold text-[#0f172a]">
                {formatDate(refund.createdAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Amount + Action */}
        <div className="flex flex-col items-end justify-between gap-4">
          <div className="text-right">
            {(() => {
              const isCancelled = refund.refundStatus === "Cancelled";
              const isRejected = refund.refundStatus === "Rejected";
              const isPreApproval = refund.refundStatus === "Requested";
              const hasDeduction = !isPreApproval && !isCancelled && !isRejected
                && refund.finalRefundAmount != null
                && refund.finalRefundAmount !== refund.approvedAmount
                && refund.finalRefundAmount >= 0;
              const displayAmount = isCancelled || isRejected
                ? 0
                : isPreApproval
                ? refund.approvedAmount
                : (refund.finalRefundAmount ?? refund.approvedAmount);

              return (
                <>
                  <p className="text-xs text-slate-400 mb-0.5">
                    {isCancelled || isRejected ? "Refund Amount" : hasDeduction ? "You will receive" : isPreApproval ? "Expected Refund" : "Refund Amount"}
                  </p>
                  <p className={`text-xl font-black ${isCancelled || isRejected ? "text-slate-400" : "text-[#ff4f00]"}`}>
                    {formatPrice(displayAmount)}
                  </p>
                  {hasDeduction && (
                    <p className="text-[10px] text-slate-400 line-through mt-0.5">
                      Approved: {formatPrice(refund.approvedAmount)}
                    </p>
                  )}
                </>
              );
            })()}
          </div>
          <button
            onClick={() => onViewDetail(refund.refundId)}
            className="px-5 py-2 text-sm font-bold rounded-xl text-white transition hover:-translate-y-0.5 active:translate-y-0"
            style={{
              background: "#ff4f00",
              boxShadow: "0 4px 12px rgba(255,79,0,0.15)",
            }}
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}
