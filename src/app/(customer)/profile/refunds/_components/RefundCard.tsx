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
    <div className="border border-[#e2bfb0]/30 rounded-xl bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Card Header */}
      <div className="px-6 py-3 border-b border-[#e2bfb0]/20 flex justify-between items-center bg-slate-50/50">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#ff6a00] text-[20px]">
            assignment_return
          </span>
          <span className="text-sm font-bold text-[#261812]">
            Refund Request
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#5a4136]">
            Order #{refund.orderCode}
          </span>
          <RefundStatusBadge status={refund.refundStatus} size="sm" />
        </div>
      </div>

      {/* Card Body */}
      <div className="p-6 flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-col gap-2 flex-grow">
          {/* Reason */}
          <div className="flex items-start gap-2">
            <span className="material-symbols-outlined text-slate-400 text-[16px] mt-0.5 flex-shrink-0">
              flag
            </span>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Reason</p>
              <p className="text-sm font-semibold text-[#261812]">
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
              <p className="text-sm font-semibold text-[#261812]">
                {formatDate(refund.createdAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Amount + Action */}
        <div className="flex flex-col items-end justify-between gap-4">
          <div className="text-right">
            <p className="text-xs text-slate-400 mb-0.5">Refund Amount</p>
            <p className="text-xl font-black text-[#ff6a00]">
              {formatPrice(refund.approvedAmount)}
            </p>
          </div>
          <button
            onClick={() => onViewDetail(refund.refundId)}
            className="px-5 py-2 text-sm font-bold rounded-xl text-white transition hover:-translate-y-0.5 active:translate-y-0"
            style={{
              background: "linear-gradient(135deg, #ff6a00, #ff8a1f)",
              boxShadow: "0 8px 20px rgba(249,115,22,0.2)",
            }}
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}
