"use client";

import { useCallback, useEffect, useState } from "react";
import RefundCard from "./RefundCard";
import RefundDetailModal from "./RefundDetailModal";
import { refundsApi } from "@/features/refunds/services/refunds-api";
import type { RefundListItem } from "@/features/refunds/types/refunds";

const TABS = [
  { key: "", label: "All" },
  { key: "Requested", label: "Requested" },
  { key: "Processing", label: "Processing" },
  { key: "Completed", label: "Completed" },
  { key: "Rejected", label: "Rejected" },
  { key: "Cancelled", label: "Cancelled" },
];

const PAGE_SIZE = 5;

export default function RefundHistoryView() {
  const [activeTab, setActiveTab] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [refunds, setRefunds] = useState<RefundListItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [detailRefundId, setDetailRefundId] = useState<number | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const loadRefunds = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await refundsApi.getRefundList({
        refundStatus: activeTab || undefined,
        page,
        pageSize: PAGE_SIZE,
      });
      setRefunds(response.items);
      setTotalPages(Math.max(1, response.totalPages));
      setTotalCount(response.totalCount);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Could not load refunds.",
      );
      setRefunds([]);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, page]);

  useEffect(() => {
    void loadRefunds();
  }, [loadRefunds]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setPage(1);
  };

  const handleViewDetail = (refundId: number) => {
    setDetailRefundId(refundId);
    setIsDetailOpen(true);
  };

  const filteredRefunds = searchQuery.trim()
    ? refunds.filter((r) =>
      r.orderCode.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    : refunds;

  return (
    <section className="col-span-1 md:col-span-3 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-xl font-bold text-[#0f172a]">My Refunds</h1>
            <p className="text-sm text-[#475569] mt-0.5">
              Track and manage your refund requests.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 pt-4 border-b border-slate-200 overflow-x-auto">
        <div className="flex gap-1 min-w-max pb-0">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className="px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-colors border-b-2"
                style={{
                  color: isActive ? "#ff4f00" : "#475569",
                  borderBottomColor: isActive ? "#ff4f00" : "transparent",
                  backgroundColor: isActive ? "#fff5f0" : "transparent",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search */}
      <div className="px-6 py-4">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[20px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order code..."
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 text-sm text-slate-900 outline-none transition-all focus:bg-white"
            onFocus={(e) =>
            (e.currentTarget.style.boxShadow =
              "0 0 0 3px rgba(255,79,0,0.12)")
            }
            onBlur={(e) =>
              (e.currentTarget.style.boxShadow = "0 0 0 0 transparent")
            }
          />
        </div>
      </div>

      {/* List */}
      <div className="px-6 pb-6 space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-500 gap-3 bg-slate-50/30 rounded-2xl border border-dashed border-slate-200">
            <span className="material-symbols-outlined text-6xl opacity-40">
              hourglass_top
            </span>
            <p className="text-base font-bold">Loading refunds...</p>
          </div>
        ) : errorMessage ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-500 gap-3 bg-slate-50/30 rounded-2xl border border-dashed border-slate-200">
            <span className="material-symbols-outlined text-6xl opacity-40">
              error
            </span>
            <p className="text-base font-bold">{errorMessage}</p>
          </div>
        ) : filteredRefunds.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-500 gap-3 bg-slate-50/30 rounded-2xl border border-dashed border-slate-200">
            <span className="material-symbols-outlined text-6xl opacity-40">
              inbox
            </span>
            <p className="text-base font-bold">No refund requests found.</p>
            <p className="text-sm text-center text-slate-400 max-w-xs">
              Refund requests for completed orders will appear here.
            </p>
          </div>
        ) : (
          <>
            <p className="text-xs text-slate-400 mb-2">
              {totalCount} request{totalCount !== 1 ? "s" : ""} found
            </p>
            {filteredRefunds.map((refund) => (
              <RefundCard
                key={refund.refundId}
                refund={refund}
                onViewDetail={handleViewDetail}
              />
            ))}
          </>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 pb-6 flex justify-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">
              chevron_left
            </span>
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className="w-9 h-9 rounded-lg text-sm font-bold transition-colors"
              style={
                p === page
                  ? {
                    background: "#ff4f00",
                    color: "#fff",
                    boxShadow: "0 4px 12px rgba(255,79,0,0.15)",
                  }
                  : { border: "1px solid #e2e8f0", color: "#475569" }
              }
            >
              {p}
            </button>
          ))}
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">
              chevron_right
            </span>
          </button>
        </div>
      )}

      {/* Detail Modal */}
      <RefundDetailModal
        isOpen={isDetailOpen}
        refundId={detailRefundId}
        onClose={() => {
          setIsDetailOpen(false);
          setDetailRefundId(null);
        }}
        onCancelSuccess={loadRefunds}
      />
    </section>
  );
}
