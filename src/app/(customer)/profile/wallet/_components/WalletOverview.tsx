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
  onTopUp: () => void;
  onToggleBalanceVisibility: () => void;
  onChangePin: () => void;
};

export default function WalletOverview({
  isBalanceVisible,
  currentBalance,
  totalCredit,
  transactions,
  isTransactionsLoading,
  onTopUp,
  onToggleBalanceVisibility,
  onChangePin,
}: WalletOverviewProps) {
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

      <div className="px-6 py-4 border-t border-b border-[#e2bfb0]/30 flex justify-between items-center bg-white">
        <h3 className="text-xl font-bold text-[#261812]">Transaction History</h3>
        <button
          type="button"
          className="text-[#a14000] hover:text-[#ff6a00] text-sm font-semibold transition-colors flex items-center gap-1"
        >
          View all
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        </button>
      </div>

      <div className="flex flex-col">
        {isTransactionsLoading ? (
          <div className="p-6 text-sm text-[#5a4136]">Loading transaction history...</div>
        ) : transactions.length === 0 ? (
          <div className="p-6 text-sm text-[#5a4136]">No wallet transactions yet.</div>
        ) : (
          transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center gap-4 p-6 bg-white hover:bg-[#fff8f6] transition-colors border-b border-[#e2bfb0]/20 last:border-b-0"
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
            </div>
          ))
        )}
      </div>
    </div>
  );
}
