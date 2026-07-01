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
  withdrawals: WithdrawalDto[];
  isWithdrawalsLoading: boolean;
  withdrawalPageNumber: number;
  withdrawalTotalPages: number;
  withdrawalTotalCount: number;
  onTopUp: () => void;
  onWithdraw: () => void;
  onToggleBalanceVisibility: () => void;
  onChangePin: () => void;
  onPageChange: (pageNumber: number) => void;
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
  withdrawals,
  isWithdrawalsLoading,
  withdrawalPageNumber,
  withdrawalTotalPages,
  withdrawalTotalCount,
  onTopUp,
  onWithdraw,
  onToggleBalanceVisibility,
  onChangePin,
  onPageChange,
}: WalletOverviewProps) {
  const [historyFilter, setHistoryFilter] = useState<"latest" | "topup" | "payment" | "refund" | "withdrawal">("latest");
  const [expandedTransactionKey, setExpandedTransactionKey] = useState<string | null>(null);

  const getUniqueKey = (t: any) => (t.isWithdrawalRequest ? `wd-${t.id}` : `txn-${t.id}`);

  const toggleTransactionExpansion = (key: string) => {
    setExpandedTransactionKey((prev) => (prev === key ? null : key));
  };

  const mappedWithdrawals = useMemo(() => {
    return withdrawals.map((w) => {
      const badge = getWithdrawalStatusBadge(w.status);
      const rawDate = w.createdAt.trim();
      const hasZone = /(?:Z|[+-]\d{2}:\d{2})$/i.test(rawDate);
      const date = new Date(hasZone ? rawDate : `${rawDate}Z`);
      const createdAtTimestamp = Number.isNaN(date.getTime()) ? 0 : date.getTime();

      return {
        id: w.withdrawalId,
        icon: "payments",
        title: `Withdrawal to ${w.toBankName}`,
        time: formatWithdrawalDate(w.createdAt),
        completedTime: w.completedAt ? formatWithdrawalDate(w.completedAt) : null,
        createdAtTimestamp,
        amount: -w.amount,
        method: "BankTransfer",
        reason: w.failReason || null,
        relatedOrderCode: null,
        rawTxnType: "withdrawal",
        statusLabel: badge.label,
        statusClassName: badge.className,
        kind: "debit" as const,
        isWithdrawalRequest: true,
        referenceId: w.referenceId,
        toBankName: w.toBankName,
        toAccountNumber: w.toAccountNumber,
        toAccountName: w.toAccountName,
        failReason: w.failReason,
        processingAt: w.processingAt ? formatWithdrawalDate(w.processingAt) : null,
      };
    });
  }, [withdrawals]);

  const mergedHistory = useMemo(() => {
    const nonWithdrawalTxns = transactions.filter(
      (t) => t.rawTxnType.trim().toLowerCase() !== "withdrawal"
    );

    return [...nonWithdrawalTxns, ...mappedWithdrawals].sort(
      (a, b) => b.createdAtTimestamp - a.createdAtTimestamp
    );
  }, [transactions, mappedWithdrawals]);

  const filteredTransactions = useMemo(() => {
    if (historyFilter === "latest") {
      return mergedHistory;
    }
    return mergedHistory.filter((t) => t.rawTxnType.trim().toLowerCase() === historyFilter);
  }, [historyFilter, mergedHistory]);

  const currentPageNumber = Math.max(transactionPageNumber, withdrawalPageNumber);
  const totalPages = Math.max(transactionTotalPages, withdrawalTotalPages);

  const visiblePageNumbers = useMemo(() => {
    if (totalPages <= 1) return [1];

    const start = Math.max(1, currentPageNumber - 1);
    const end = Math.min(totalPages, currentPageNumber + 1);
    const pages: number[] = [];
    for (let page = start; page <= end; page += 1) {
      pages.push(page);
    }
    return pages;
  }, [currentPageNumber, totalPages]);

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
      </div>

      <div className="px-6 py-4 border-t border-b border-slate-200 flex flex-wrap justify-between items-center gap-3 bg-white">
        <h3 className="text-lg font-bold text-[#0f172a]">Transaction History</h3>

        <div className="flex items-center gap-2">
          <label htmlFor="wallet-history-filter" className="text-xs font-semibold text-slate-500">
            Filter
          </label>
          <select
            id="wallet-history-filter"
            value={historyFilter}
            onChange={(event) =>
              setHistoryFilter(event.target.value as "latest" | "topup" | "payment" | "refund" | "withdrawal")
            }
            className="text-sm rounded-md border border-slate-200 px-2.5 py-1.5 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#ff4f00]/10 focus:border-[#ff4f00]"
          >
            <option value="latest">All Transactions</option>
            <option value="topup">Top Up</option>
            <option value="payment">Payment</option>
            <option value="refund">Refund</option>
            <option value="withdrawal">Withdrawal</option>
          </select>
        </div>
      </div>

      <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 text-xs text-slate-500 flex items-center justify-between gap-2">
        <span>Page {currentPageNumber}/{totalPages}</span>
        <span>Latest transactions and withdrawals are shown first.</span>
      </div>

      <div className="flex flex-col relative">
        {(isTransactionsLoading || isWithdrawalsLoading) && filteredTransactions.length === 0 ? (
          <div className="p-6 text-sm text-slate-500">Loading history...</div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-6 text-sm text-slate-500">No transactions or withdrawals yet.</div>
        ) : (
          filteredTransactions.map((transaction) => {
            const uniqueKey = getUniqueKey(transaction);
            const isExpanded = expandedTransactionKey === uniqueKey;
            return (
              <div key={uniqueKey} className="bg-white border-b border-slate-100 last:border-b-0">
                <button
                  type="button"
                  onClick={() => toggleTransactionExpansion(uniqueKey)}
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
                  transaction.isWithdrawalRequest ? (
                    <div className="px-6 pb-5 pl-[88px] text-sm text-slate-600 space-y-1">
                      <p><span className="font-semibold text-slate-900">Reference ID:</span> <span className="font-mono">{transaction.referenceId}</span></p>
                      <p><span className="font-semibold text-slate-900">Bank:</span> {transaction.toBankName}</p>
                      <p><span className="font-semibold text-slate-900">Account:</span> {transaction.toAccountNumber}</p>
                      <p><span className="font-semibold text-slate-900">Account name:</span> {transaction.toAccountName}</p>
                      {transaction.failReason && (
                        <p><span className="font-semibold text-red-600">Reason:</span> {transaction.failReason}</p>
                      )}
                      {transaction.processingAt && (
                        <p><span className="font-semibold text-slate-900">Sent to bank:</span> {transaction.processingAt}</p>
                      )}
                      {transaction.completedTime && (
                        <p><span className="font-semibold text-slate-900">Completed:</span> {transaction.completedTime}</p>
                      )}
                    </div>
                  ) : (
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
                  )
                )}
              </div>
            );
          })
        )}

        {(isTransactionsLoading || isWithdrawalsLoading) && filteredTransactions.length > 0 && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center pointer-events-none">
            <div className="px-3 py-1.5 rounded-md border border-slate-200 bg-white text-xs font-semibold text-slate-600">
              Loading...
            </div>
          </div>
        )}
      </div>

      {!(isTransactionsLoading || isWithdrawalsLoading) && totalPages > 1 && (
        <div className="px-6 py-4 border-t border-slate-100 bg-white flex items-center justify-center gap-2">
          <button
            type="button"
            disabled={currentPageNumber === 1 || isTransactionsLoading || isWithdrawalsLoading}
            onClick={() => onPageChange(currentPageNumber - 1)}
            className="px-3 py-1.5 text-sm rounded-md border border-slate-200 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
          >
            Previous
          </button>

          {visiblePageNumbers.map((page) => (
            <button
              key={page}
              type="button"
              disabled={isTransactionsLoading || isWithdrawalsLoading}
              onClick={() => onPageChange(page)}
              className={`px-3 py-1.5 text-sm rounded-md border ${page === currentPageNumber
                ? "border-[#ff4f00] bg-[#ff4f00] text-white"
                : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
            >
              {page}
            </button>
          ))}

          <button
            type="button"
            disabled={currentPageNumber === totalPages || isTransactionsLoading || isWithdrawalsLoading}
            onClick={() => onPageChange(currentPageNumber + 1)}
            className="px-3 py-1.5 text-sm rounded-md border border-slate-200 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
          >
            Next
          </button>
        </div>
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
