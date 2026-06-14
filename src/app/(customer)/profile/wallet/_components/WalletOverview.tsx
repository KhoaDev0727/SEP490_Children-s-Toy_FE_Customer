import { useMemo, useState } from "react";
import {
  formatBalance,
  formatVnd,
  getTransactionIconStyles,
  type UiTransaction,
} from "./wallet-shared";
import type { WithdrawalDto } from "@/features/withdrawal/types/withdrawal";

type WalletOverviewProps = {
  isBalanceVisible: boolean;
  currentBalance: number;
  totalCredit: number;
  transactions: UiTransaction[];
  isTransactionsLoading: boolean;
  transactionPageNumber: number;
  transactionTotalPages: number;
  transactionTotalCount: number;
  hasPreviousTransactionPage: boolean;
  hasNextTransactionPage: boolean;
  withdrawals: WithdrawalDto[];
  isWithdrawalsLoading: boolean;
  withdrawalPageNumber: number;
  withdrawalTotalPages: number;
  withdrawalTotalCount: number;
  hasPreviousWithdrawalPage: boolean;
  hasNextWithdrawalPage: boolean;
  onTopUp: () => void;
  onWithdraw: () => void;
  onToggleBalanceVisibility: () => void;
  onChangePin: () => void;
  onTransactionPageChange: (pageNumber: number) => void;
  onWithdrawalPageChange: (pageNumber: number) => void;
};

export default function WalletOverview({
  isBalanceVisible,
  currentBalance,
  totalCredit,
  transactions,
  isTransactionsLoading,
  transactionPageNumber,
  transactionTotalPages,
  transactionTotalCount,
  hasPreviousTransactionPage,
  hasNextTransactionPage,
  withdrawals,
  isWithdrawalsLoading,
  withdrawalPageNumber,
  withdrawalTotalPages,
  withdrawalTotalCount,
  hasPreviousWithdrawalPage,
  hasNextWithdrawalPage,
  onTopUp,
  onWithdraw,
  onToggleBalanceVisibility,
  onChangePin,
  onTransactionPageChange,
  onWithdrawalPageChange,
}: WalletOverviewProps) {
  const [activeTab, setActiveTab] = useState<"transactions" | "withdrawals">("transactions");
  const [historyFilter, setHistoryFilter] = useState<"latest" | "topup" | "payment" | "refund">("latest");
  const [expandedTransactionId, setExpandedTransactionId] = useState<number | null>(null);

  const sortedTransactions = useMemo(
    () => [...transactions].sort((a, b) => b.createdAtTimestamp - a.createdAtTimestamp),
    [transactions],
  );

  const filteredTransactions = useMemo(() => {
    if (historyFilter === "latest") {
      return sortedTransactions;
    }

    if (historyFilter === "topup") {
      return sortedTransactions.filter((transaction) => transaction.rawTxnType.trim().toLowerCase() === "topup");
    }

    if (historyFilter === "payment") {
      return sortedTransactions.filter((transaction) => transaction.rawTxnType.trim().toLowerCase() === "payment");
    }

    return sortedTransactions.filter((transaction) => transaction.rawTxnType.trim().toLowerCase() === "refund");
  }, [historyFilter, sortedTransactions]);

  const visiblePageNumbers = useMemo(() => {
    if (transactionTotalPages <= 1) return [1];

    const start = Math.max(1, transactionPageNumber - 1);
    const end = Math.min(transactionTotalPages, transactionPageNumber + 1);
    const pages: number[] = [];
    for (let page = start; page <= end; page += 1) {
      pages.push(page);
    }
    return pages;
  }, [transactionPageNumber, transactionTotalPages]);

  const visibleWithdrawalPageNumbers = useMemo(() => {
    if (withdrawalTotalPages <= 1) return [1];
    const start = Math.max(1, withdrawalPageNumber - 1);
    const end = Math.min(withdrawalTotalPages, withdrawalPageNumber + 1);
    const pages: number[] = [];
    for (let page = start; page <= end; page += 1) pages.push(page);
    return pages;
  }, [withdrawalPageNumber, withdrawalTotalPages]);

  const toggleTransactionExpansion = (transactionId: number) => {
    setExpandedTransactionId((prev) => (prev === transactionId ? null : transactionId));
  };

  return (
    <div>
      <div className="p-6">
        <div className="bg-gradient-to-r from-[#ff4f00] to-[#ff6c24] rounded-xl p-6 text-white shadow-md relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-sm text-white/85 mb-1">Available Balance</p>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-5 tracking-tight">
              {isBalanceVisible ? formatBalance(currentBalance) : "************"}
            </h2>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onTopUp}
                className="bg-white text-[#ff4f00] px-5 py-2 rounded-xl text-sm font-semibold hover:bg-[#fff5f0] transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                Top Up
              </button>
              <button
                type="button"
                onClick={onWithdraw}
                className="bg-white text-[#ff4f00] px-5 py-2 rounded-xl text-sm font-semibold hover:bg-[#fff5f0] transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">payments</span>
                Withdraw
              </button>
              <button
                type="button"
                onClick={onToggleBalanceVisibility}
                className="bg-white/15 border border-white/30 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-white/20 transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isBalanceVisible ? "visibility_off" : "visibility"}
                </span>
                {isBalanceVisible ? "Hide" : "View"}
              </button>
              <button
                type="button"
                onClick={onChangePin}
                className="bg-white/15 border border-white/30 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-white/20 transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">pin</span>
                Change PIN
              </button>
            </div>
          </div>
          <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-[160px] text-white/10 select-none pointer-events-none">
            account_balance_wallet
          </span>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Total incoming transactions:{" "}
          <span className="font-semibold text-emerald-700">{formatVnd(totalCredit)}</span>
        </p>
      </div>

      <div className="px-6 py-4 border-t border-b border-slate-200 flex flex-wrap justify-between items-center gap-3 bg-white">
        <div className="flex gap-1 border border-slate-200 rounded-xl p-1 bg-slate-50">
          <button
            type="button"
            onClick={() => setActiveTab("transactions")}
            className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-colors ${activeTab === "transactions" ? "bg-white text-[#ff4f00] shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
          >
            Transaction History
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("withdrawals")}
            className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-colors ${activeTab === "withdrawals" ? "bg-white text-[#ff4f00] shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
          >
            Withdrawals
          </button>
        </div>

        {activeTab === "transactions" && (
          <div className="flex items-center gap-2">
            <label htmlFor="wallet-history-filter" className="text-xs font-semibold text-slate-500">
              Filter
            </label>
            <select
              id="wallet-history-filter"
              value={historyFilter}
              onChange={(event) =>
                setHistoryFilter(event.target.value as "latest" | "topup" | "payment" | "refund")
              }
              className="text-sm rounded-md border border-slate-200 px-2.5 py-1.5 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#ff4f00]/10 focus:border-[#ff4f00]"
            >
              <option value="latest">Latest</option>
              <option value="topup">Top Up</option>
              <option value="payment">Payment</option>
              <option value="refund">Refund</option>
            </select>
          </div>
        )}
      </div>

      <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 text-xs text-slate-500 flex items-center justify-between gap-2">
        {activeTab === "transactions" ? (
          <>
            <span>Page {transactionPageNumber}/{transactionTotalPages} • Total transactions: {transactionTotalCount}</span>
            <span>Latest transactions are shown first.</span>
          </>
        ) : (
          <>
            <span>Page {withdrawalPageNumber}/{withdrawalTotalPages} • Total withdrawals: {withdrawalTotalCount}</span>
            <span>Latest withdrawal requests are shown first.</span>
          </>
        )}
      </div>

      {activeTab === "transactions" ? (
        <>
          <div className="flex flex-col relative">
            {isTransactionsLoading && transactions.length === 0 ? (
              <div className="p-6 text-sm text-slate-500">Loading transaction history...</div>
            ) : filteredTransactions.length === 0 ? (
              <div className="p-6 text-sm text-slate-500">No wallet transactions yet.</div>
            ) : (
              filteredTransactions.map((transaction) => {
                const isExpanded = expandedTransactionId === transaction.id;
                return (
                  <div key={transaction.id} className="bg-white border-b border-slate-100 last:border-b-0">
                    <button
                      type="button"
                      onClick={() => toggleTransactionExpansion(transaction.id)}
                      className="w-full text-left flex items-center gap-4 p-6 hover:bg-slate-50/50 transition-colors"
                    >
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${getTransactionIconStyles(transaction.kind)}`}
                      >
                        <span className="material-symbols-outlined">{transaction.icon}</span>
                      </div>
                      <div className="flex-grow pl-2 min-w-0">
                        <h4 className="text-sm md:text-base font-semibold text-[#0f172a] mb-1 truncate">
                          {transaction.title}
                        </h4>
                        <span className="text-xs text-slate-500">{transaction.time}</span>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p
                          className={`text-lg font-bold mb-1 ${transaction.amount >= 0 ? "text-emerald-600" : "text-red-500"
                            }`}
                        >
                          {formatVnd(transaction.amount)}
                        </p>
                        <span className={`text-[12px] font-bold px-2 py-0.5 rounded ${transaction.statusClassName}`}>
                          {transaction.statusLabel}
                        </span>
                      </div>
                      <span className="material-symbols-outlined text-slate-400 text-[20px]">
                        {isExpanded ? "expand_less" : "expand_more"}
                      </span>
                    </button>

                    {isExpanded && (
                      <div className="px-6 pb-5 pl-[88px] text-sm text-slate-600 space-y-1">
                        <p>
                          <span className="font-semibold text-slate-900">Type:</span> {transaction.rawTxnType}
                        </p>
                        <p>
                          <span className="font-semibold text-slate-900">Method:</span> {transaction.method}
                        </p>
                        {transaction.relatedOrderCode && (
                          <p>
                            <span className="font-semibold text-slate-900">Order:</span> #{transaction.relatedOrderCode}
                          </p>
                        )}
                        {transaction.reason && (
                          <p>
                            <span className="font-semibold text-slate-900">Note:</span> {transaction.reason}
                          </p>
                        )}
                        <p>
                          <span className="font-semibold text-slate-900">Created:</span> {transaction.time}
                        </p>
                        {transaction.completedTime && (
                          <p>
                            <span className="font-semibold text-slate-900">Completed:</span> {transaction.completedTime}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {isTransactionsLoading && transactions.length > 0 && (
              <div className="absolute inset-0 bg-white/70 flex items-center justify-center pointer-events-none">
                <div className="px-3 py-1.5 rounded-md border border-slate-200 bg-white text-xs font-semibold text-slate-600">
                  Loading...
                </div>
              </div>
            )}
          </div>

          {!isTransactionsLoading && transactionTotalPages > 1 && (
            <div className="px-6 py-4 border-t border-slate-100 bg-white flex items-center justify-center gap-2">
              <button
                type="button"
                disabled={!hasPreviousTransactionPage || isTransactionsLoading}
                onClick={() => onTransactionPageChange(transactionPageNumber - 1)}
                className="px-3 py-1.5 text-sm rounded-md border border-slate-200 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                Previous
              </button>

              {visiblePageNumbers.map((page) => (
                <button
                  key={page}
                  type="button"
                  disabled={isTransactionsLoading}
                  onClick={() => onTransactionPageChange(page)}
                  className={`px-3 py-1.5 text-sm rounded-md border ${page === transactionPageNumber
                      ? "border-[#ff4f00] bg-[#ff4f00] text-white"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                disabled={!hasNextTransactionPage || isTransactionsLoading}
                onClick={() => onTransactionPageChange(transactionPageNumber + 1)}
                className="px-3 py-1.5 text-sm rounded-md border border-slate-200 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <>
          <WithdrawalsTab
            withdrawals={withdrawals}
            isLoading={isWithdrawalsLoading}
            pageNumber={withdrawalPageNumber}
            totalPages={withdrawalTotalPages}
            hasPrevious={hasPreviousWithdrawalPage}
            hasNext={hasNextWithdrawalPage}
            visiblePageNumbers={visibleWithdrawalPageNumbers}
            onPageChange={onWithdrawalPageChange}
          />
        </>
      )}
    </div>
  );
}

function getWithdrawalStatusBadge(status: string): { label: string; className: string } {
  switch (status.toUpperCase()) {
    case "SUCCESS":
      return { label: "Success", className: "text-green-700 bg-green-100" };
    case "PROCESSING":
      return { label: "Processing", className: "text-amber-700 bg-amber-100" };
    case "PENDING":
      return { label: "Pending", className: "text-blue-700 bg-blue-100" };
    case "FAILED":
      return { label: "Failed", className: "text-red-700 bg-red-100" };
    case "CANCELLED":
      return { label: "Cancelled", className: "text-slate-600 bg-slate-100" };
    default:
      return { label: status, className: "text-slate-600 bg-slate-100" };
  }
}

function formatWithdrawalDate(iso: string) {
  const raw = iso.trim();
  const hasZone = /(?:Z|[+-]\d{2}:\d{2})$/i.test(raw);
  const date = new Date(hasZone ? raw : `${raw}Z`);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Ho_Chi_Minh",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date).replace(",", "");
}

function WithdrawalsTab({
  withdrawals,
  isLoading,
  pageNumber,
  totalPages,
  hasPrevious,
  hasNext,
  visiblePageNumbers,
  onPageChange,
}: {
  withdrawals: WithdrawalDto[];
  isLoading: boolean;
  pageNumber: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
  visiblePageNumbers: number[];
  onPageChange: (page: number) => void;
}) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  return (
    <>
      <div className="flex flex-col relative">
        {isLoading && withdrawals.length === 0 ? (
          <div className="p-6 text-sm text-slate-500">Loading withdrawal history...</div>
        ) : withdrawals.length === 0 ? (
          <div className="p-6 text-sm text-slate-500">No withdrawal requests yet.</div>
        ) : (
          withdrawals.map((w) => {
            const badge = getWithdrawalStatusBadge(w.status);
            const isExpanded = expandedId === w.withdrawalId;
            return (
              <div key={w.withdrawalId} className="bg-white border-b border-slate-100 last:border-b-0">
                <button
                  type="button"
                  onClick={() => setExpandedId((prev) => (prev === w.withdrawalId ? null : w.withdrawalId))}
                  className="w-full text-left flex items-center gap-4 p-6 hover:bg-slate-50/50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 bg-orange-100 text-orange-600">
                    <span className="material-symbols-outlined">payments</span>
                  </div>
                  <div className="flex-grow pl-2 min-w-0">
                    <h4 className="text-sm md:text-base font-semibold text-[#0f172a] mb-1 truncate">
                      Withdrawal to {w.toBankName}
                    </h4>
                    <span className="text-xs text-slate-500">{formatWithdrawalDate(w.createdAt)}</span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-lg font-bold text-red-500 mb-1">
                      -{new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(w.amount)} VND
                    </p>
                    <span className={`text-[12px] font-bold px-2 py-0.5 rounded ${badge.className}`}>
                      {badge.label}
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-slate-400 text-[20px]">
                    {isExpanded ? "expand_less" : "expand_more"}
                  </span>
                </button>

                {isExpanded && (
                  <div className="px-6 pb-5 pl-[88px] text-sm text-slate-600 space-y-1">
                    <p><span className="font-semibold text-slate-900">Reference ID:</span> <span className="font-mono">{w.referenceId}</span></p>
                    <p><span className="font-semibold text-slate-900">Bank:</span> {w.toBankName}</p>
                    <p><span className="font-semibold text-slate-900">Account:</span> {w.toAccountNumber}</p>
                    <p><span className="font-semibold text-slate-900">Account name:</span> {w.toAccountName}</p>
                    {w.failReason && (
                      <p><span className="font-semibold text-red-600">Reason:</span> {w.failReason}</p>
                    )}
                    {w.processingAt && (
                      <p><span className="font-semibold text-slate-900">Sent to bank:</span> {formatWithdrawalDate(w.processingAt)}</p>
                    )}
                    {w.completedAt && (
                      <p><span className="font-semibold text-slate-900">Completed:</span> {formatWithdrawalDate(w.completedAt)}</p>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}

        {isLoading && withdrawals.length > 0 && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center pointer-events-none">
            <div className="px-3 py-1.5 rounded-md border border-slate-200 bg-white text-xs font-semibold text-slate-600">
              Loading...
            </div>
          </div>
        )}
      </div>

      {!isLoading && totalPages > 1 && (
        <div className="px-6 py-4 border-t border-slate-100 bg-white flex items-center justify-center gap-2">
          <button
            type="button"
            disabled={!hasPrevious || isLoading}
            onClick={() => onPageChange(pageNumber - 1)}
            className="px-3 py-1.5 text-sm rounded-md border border-slate-200 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
          >
            Previous
          </button>
          {visiblePageNumbers.map((page) => (
            <button
              key={page}
              type="button"
              disabled={isLoading}
              onClick={() => onPageChange(page)}
              className={`px-3 py-1.5 text-sm rounded-md border ${page === pageNumber ? "border-[#ff4f00] bg-[#ff4f00] text-white" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
            >
              {page}
            </button>
          ))}
          <button
            type="button"
            disabled={!hasNext || isLoading}
            onClick={() => onPageChange(pageNumber + 1)}
            className="px-3 py-1.5 text-sm rounded-md border border-slate-200 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
          >
            Next
          </button>
        </div>
      )}
    </>
  );
}
