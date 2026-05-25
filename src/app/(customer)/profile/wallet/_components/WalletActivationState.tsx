import { BENEFITS } from "./wallet-shared";

type WalletActivationStateProps = {
  onActivate: () => void;
};

export default function WalletActivationState({ onActivate }: WalletActivationStateProps) {
  return (
    <div className="px-6 py-12 md:py-16 flex flex-col items-center text-center">
      <div className="w-32 h-32 rounded-full bg-[#ff4f00]/10 flex items-center justify-center mb-6">
        <span className="material-symbols-outlined text-[64px] text-[#ff4f00]">
          account_balance_wallet
        </span>
      </div>
      <h2 className="text-3xl font-bold text-gray-900 mb-3">Activate Toy Store Wallet</h2>
      <p className="text-sm text-gray-500 max-w-[560px] mb-8">
        Experience lightning-fast, secure payments and unlock exclusive rewards with Toy Store Wallet.
      </p>

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

      <button
        type="button"
        onClick={onActivate}
        className="bg-[#ff4f00] hover:bg-[#ff5f1a] text-white px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-sm transition-colors flex items-center gap-2"
      >
        <span className="material-symbols-outlined text-[20px]">add_circle</span>
        Activate Wallet Now
      </button>
    </div>
  );
}
