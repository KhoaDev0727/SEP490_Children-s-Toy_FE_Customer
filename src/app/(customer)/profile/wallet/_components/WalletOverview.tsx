import { useMemo, useState } from "react";
import {
  formatBalance,
  formatVnd,
  getTransactionIconStyles,
  type UiTransaction,
} from "./wallet-shared";

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
  onTopUp: () => void;
  onToggleBalanceVisibility: () => void;
  onChangePin: () => void;
  onTransactionPageChange: (pageNumber: number) => void;
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
  onTopUp,
  onToggleBalanceVisibility,
  onChangePin,
  onTransactionPageChange,
}: WalletOverviewProps) {
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

  const toggleTransactionExpansion = (transactionId: number) => {
    setExpandedTransactionId((prev) => (prev === transactionId ? null : transactionId));
  };

  return (
    <div>
      <div className="p-6">
        <div className="bg-gradient-to-r from-[#a14000] to-[#ff6a00] rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-sm text-white/85 mb-1">Available Balance</p>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-5 tracking-tight">
              {isBalanceVisible ? formatBalance(currentBalance) : "************"}
            </h2>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onTopUp}
                className="bg-white text-[#a14000] px-5 py-2 rounded-lg text-sm font-semibold hover:bg-[#fff3eb] transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                Top Up
              </button>
              <button
                type="button"
                onClick={onToggleBalanceVisibility}
                className="bg-white/15 border border-white/30 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-white/20 transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isBalanceVisible ? "visibility_off" : "visibility"}
                </span>
                {isBalanceVisible ? "Hide" : "View"}
              </button>
              <button
                type="button"
                onClick={onChangePin}
                className="bg-white/15 border border-white/30 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-white/20 transition-colors flex items-center gap-2"
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
        <p className="mt-3 text-xs text-[#5a4136]">
          Total incoming transactions:{" "}
          <span className="font-semibold text-emerald-700">{formatVnd(totalCredit)}</span>
        </p>
      </div>

      <div className="px-6 py-4 border-t border-b border-[#e2bfb0]/30 flex flex-wrap justify-between items-center gap-3 bg-white">
        <h3 className="text-xl font-bold text-[#261812]">Transaction History</h3>
        <div className="flex items-center gap-2">
          <label htmlFor="wallet-history-filter" className="text-xs font-semibold text-[#5a4136]">
            Filter
          </label>
          <select
            id="wallet-history-filter"
            value={historyFilter}
            onChange={(event) =>
              setHistoryFilter(event.target.value as "latest" | "topup" | "payment" | "refund")
            }
            className="text-sm rounded-md border border-[#e2bfb0] px-2.5 py-1.5 text-[#261812] bg-white focus:outline-none focus:ring-2 focus:ring-[#ff6a00]/30"
          >
            <option value="latest">Latest</option>
            <option value="topup">Top Up</option>
            <option value="payment">Payment</option>
            <option value="refund">Refund</option>
          </select>
        </div>
      </div>

      <div className="px-6 py-3 bg-[#fff8f6] border-b border-[#e2bfb0]/20 text-xs text-[#5a4136] flex items-center justify-between gap-2">
        <span>
          Page {transactionPageNumber}/{transactionTotalPages} • Total transactions: {transactionTotalCount}
        </span>
        <span>Latest transactions are shown first.</span>
      </div>

      <div className="flex flex-col relative">
        {isTransactionsLoading && transactions.length === 0 ? (
          <div className="p-6 text-sm text-[#5a4136]">Loading transaction history...</div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-6 text-sm text-[#5a4136]">No wallet transactions yet.</div>
        ) : (
          filteredTransactions.map((transaction) => {
            const isExpanded = expandedTransactionId === transaction.id;
            return (
              <div key={transaction.id} className="bg-white border-b border-[#e2bfb0]/20 last:border-b-0">
                <button
                  type="button"
                  onClick={() => toggleTransactionExpansion(transaction.id)}
                  className="w-full text-left flex items-center gap-4 p-6 hover:bg-[#fff8f6] transition-colors"
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${getTransactionIconStyles(transaction.kind)}`}
                  >
                    <span className="material-symbols-outlined">{transaction.icon}</span>
                  </div>
                  <div className="flex-grow pl-2 min-w-0">
                    <h4 className="text-sm md:text-base font-semibold text-[#261812] mb-1 truncate">
                      {transaction.title}
                    </h4>
                    <span className="text-xs text-[#565e74]">{transaction.time}</span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p
                      className={`text-lg font-bold mb-1 ${
                        transaction.amount >= 0 ? "text-emerald-600" : "text-red-500"
                      }`}
                    >
                      {formatVnd(transaction.amount)}
                    </p>
                    <span className={`text-[12px] font-bold px-2 py-0.5 rounded ${transaction.statusClassName}`}>
                      {transaction.statusLabel}
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-[#a14000] text-[20px]">
                    {isExpanded ? "expand_less" : "expand_more"}
                  </span>
                </button>

                {isExpanded && (
                  <div className="px-6 pb-5 pl-[88px] text-sm text-[#5a4136] space-y-1">
                    <p>
                      <span className="font-semibold text-[#261812]">Type:</span> {transaction.rawTxnType}
                    </p>
                    <p>
                      <span className="font-semibold text-[#261812]">Method:</span> {transaction.method}
                    </p>
                    {transaction.relatedOrderCode && (
                      <p>
                        <span className="font-semibold text-[#261812]">Order:</span> #{transaction.relatedOrderCode}
                      </p>
                    )}
                    {transaction.reason && (
                      <p>
                        <span className="font-semibold text-[#261812]">Note:</span> {transaction.reason}
                      </p>
                    )}
                    <p>
                      <span className="font-semibold text-[#261812]">Created:</span> {transaction.time}
                    </p>
                    {transaction.completedTime && (
                      <p>
                        <span className="font-semibold text-[#261812]">Completed:</span> {transaction.completedTime}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}

        {isTransactionsLoading && transactions.length > 0 && (
          <div className="absolute inset-0 bg-white/55 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
            <div className="px-3 py-1.5 rounded-md border border-[#e2bfb0] bg-white text-xs font-semibold text-[#5a4136]">
              Loading...
            </div>
          </div>
        )}
      </div>

      {!isTransactionsLoading && transactionTotalPages > 1 && (
        <div className="px-6 py-4 border-t border-[#e2bfb0]/20 bg-white flex items-center justify-center gap-2">
          <button
            type="button"
            disabled={!hasPreviousTransactionPage || isTransactionsLoading}
            onClick={() => onTransactionPageChange(transactionPageNumber - 1)}
            className="px-3 py-1.5 text-sm rounded-md border border-[#e2bfb0] text-[#5a4136] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#fff8f6]"
          >
            Previous
          </button>

          {visiblePageNumbers.map((page) => (
            <button
              key={page}
              type="button"
              disabled={isTransactionsLoading}
              onClick={() => onTransactionPageChange(page)}
              className={`px-3 py-1.5 text-sm rounded-md border ${
                page === transactionPageNumber
                  ? "border-[#a14000] bg-[#a14000] text-white"
                  : "border-[#e2bfb0] text-[#5a4136] hover:bg-[#fff8f6]"
              }`}
            >
              {page}
            </button>
          ))}

          <button
            type="button"
            disabled={!hasNextTransactionPage || isTransactionsLoading}
            onClick={() => onTransactionPageChange(transactionPageNumber + 1)}
            className="px-3 py-1.5 text-sm rounded-md border border-[#e2bfb0] text-[#5a4136] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#fff8f6]"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
