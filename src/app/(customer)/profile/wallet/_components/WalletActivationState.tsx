import {
  BENEFITS,
  formatBalance,
  formatVnd,
  getTransactionIconStyles,
  type UiTransaction,
} from "./wallet-shared";

type WalletActivationStateProps = {
  onActivate: () => void;
  pendingBalance?: number;
  pendingTransactions?: UiTransaction[];
  isTransactionsLoading?: boolean;
};

export default function WalletActivationState({
  onActivate,
  pendingBalance = 0,
  pendingTransactions = [],
  isTransactionsLoading = false,
}: WalletActivationStateProps) {
  const hasPendingBalance = pendingBalance > 0;
  const refundTransactions = pendingTransactions.filter(
    (transaction) => transaction.kind === "refund" || transaction.amount > 0,
  );

  return (
    <div className="px-6 py-12 md:py-16 flex flex-col items-center text-center">
      <div className="w-32 h-32 rounded-full bg-[#ff4f00]/10 flex items-center justify-center mb-6">
        <span className="material-symbols-outlined text-[64px] text-[#ff4f00]">
          account_balance_wallet
        </span>
      </div>

      {hasPendingBalance ? (
        <>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Set Up Wallet PIN</h2>
          <p className="text-sm text-gray-500 max-w-[560px] mb-6">
            You have a refund balance waiting in your wallet. Set up a 6-digit PIN to use it.
          </p>
          <div className="w-full max-w-xl mb-8 rounded-xl border border-[#ff4f00]/30 bg-[#ff4f00]/5 px-5 py-4 text-left">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#ff4f00] mb-1">
              Pending balance
            </p>
            <p className="text-2xl font-bold text-gray-900">{formatBalance(pendingBalance)}</p>
            <p className="text-xs text-gray-500 mt-2">
              Funds have been credited to your wallet. After setting up your PIN, you can view your balance and pay with wallet.
            </p>
          </div>
        </>
      ) : (
        <>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Activate Toy Store Wallet</h2>
          <p className="text-sm text-gray-500 max-w-[560px] mb-8">
            Experience lightning-fast, secure payments and manage your refunds with Toy Store Wallet.
          </p>
        </>
      )}

      {!hasPendingBalance && (
        <div className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5 mb-8 text-left">
          {BENEFITS.map((benefit) => (
            <div
              key={benefit.title}
              className="bg-gray-50/50 border border-gray-200/80 rounded-xl p-4 min-h-[148px] shadow-sm"
            >
              <span className="material-symbols-outlined text-[#ff4f00] mb-2">{benefit.icon}</span>
              <h3 className="text-base font-semibold text-gray-900 mb-1">{benefit.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{benefit.description}</p>
            </div>
          ))}
        </div>
      )}

      {hasPendingBalance && (
        <div className="w-full max-w-xl mb-8 text-left">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Refund history</h3>
          {isTransactionsLoading ? (
            <p className="text-sm text-gray-500 py-4 text-center">Loading transactions...</p>
          ) : refundTransactions.length === 0 ? (
            <p className="text-sm text-gray-500 py-4 text-center">No refund transactions yet.</p>
          ) : (
            <div className="space-y-3">
              {refundTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${getTransactionIconStyles(transaction.kind)}`}
                  >
                    <span className="material-symbols-outlined text-[20px]">{transaction.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{transaction.title}</p>
                    <p className="text-xs text-gray-500">{transaction.time}</p>
                  </div>
                  <p className="text-sm font-semibold text-green-600 shrink-0">
                    {formatVnd(transaction.amount)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={onActivate}
        className="bg-[#ff4f00] hover:bg-[#ff5f1a] text-white px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-sm transition-colors flex items-center gap-2"
      >
        <span className="material-symbols-outlined text-[20px]">
          {hasPendingBalance ? "lock_open" : "add_circle"}
        </span>
        {hasPendingBalance ? "Set Up PIN" : "Activate Wallet Now"}
      </button>
    </div>
  );
}
