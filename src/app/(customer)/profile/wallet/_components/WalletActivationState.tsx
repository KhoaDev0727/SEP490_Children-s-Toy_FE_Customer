import { BENEFITS } from "./wallet-shared";

type WalletActivationStateProps = {
  onActivate: () => void;
};

export default function WalletActivationState({ onActivate }: WalletActivationStateProps) {
  return (
    <div className="px-6 py-12 md:py-16 flex flex-col items-center text-center">
      <div className="w-32 h-32 rounded-full bg-[#a14000]/10 flex items-center justify-center mb-6">
        <span className="material-symbols-outlined text-[64px] text-[#a14000]">
          account_balance_wallet
        </span>
      </div>
      <h2 className="text-3xl font-bold text-[#261812] mb-3">Activate Toy Store Wallet</h2>
      <p className="text-sm text-[#5a4136] max-w-[560px] mb-8">
        Experience lightning-fast, secure payments and unlock exclusive rewards with Toy Store Wallet.
      </p>

      <div className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5 mb-8 text-left">
        {BENEFITS.map((benefit) => (
          <div
            key={benefit.title}
            className="bg-[#fff8f6] border border-[#e2bfb0]/40 rounded-xl p-4 min-h-[148px]"
          >
            <span className="material-symbols-outlined text-[#a14000] mb-2">{benefit.icon}</span>
            <h3 className="text-base font-semibold text-[#261812] mb-1">{benefit.title}</h3>
            <p className="text-xs text-[#5a4136] leading-relaxed">{benefit.description}</p>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onActivate}
        className="bg-[#a14000] hover:bg-[#8a3600] text-white px-8 py-3 rounded-xl font-semibold text-lg transition-colors flex items-center gap-2"
      >
        <span className="material-symbols-outlined text-[20px]">add_circle</span>
        Activate Wallet Now
      </button>
    </div>
  );
}
