"use client";

import type { SavedBankAccount } from "@/features/profile/types/bank-account";

interface BankAccountCardProps {
  account: SavedBankAccount;
  logoUrl?: string;
  onDelete: (id: number) => void;
  onSetDefault: (id: number) => void;
}

const maskAccountNumber = (num: string) => {
  if (num.length <= 4) return num;
  return `•••• •••• ${num.slice(-4)}`;
};

export default function BankAccountCard({ account, logoUrl, onDelete, onSetDefault }: BankAccountCardProps) {
  return (
    <div
      className={`border rounded-xl p-6 flex flex-col sm:flex-row justify-between items-start gap-4 transition-all ${
        account.isDefault ? "border-[#ff4f00] bg-[#ff4f00]/5" : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex-grow">
        <div className="flex items-center gap-3 mb-2 flex-wrap">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={account.bankShortName}
              className="h-10 w-24 object-contain rounded-lg bg-white border border-slate-200 p-1 shrink-0"
            />
          ) : (
            <span className="font-bold text-lg text-slate-800">{account.bankShortName}</span>
          )}
          <span className="text-sm text-slate-400">|</span>
          <span className="font-medium text-slate-600 tracking-wider">
            {maskAccountNumber(account.accountNumber)}
          </span>
          {account.isDefault && (
            <span className="text-[10px] font-bold border border-[#ff4f00]/20 text-[#ff4f00] bg-[#ff4f00]/5 px-2 py-0.5 rounded-md uppercase">
              Default
            </span>
          )}
        </div>
        <div className="text-slate-500 text-sm font-semibold uppercase">{account.accountName}</div>
        <div className="text-slate-400 text-xs mt-1">Added on {new Date(account.createdAt).toLocaleDateString()}</div>
      </div>
      <div className="shrink-0 flex items-center justify-end w-full sm:w-auto gap-2">
        {!account.isDefault && (
          <button
            onClick={() => onSetDefault(account.savedBankAccountId)}
            className="text-xs font-bold text-slate-500 hover:text-[#ff4f00] hover:bg-[#ff4f00]/5 px-3 py-2 border border-slate-200 hover:border-[#ff4f00]/30 rounded-xl transition-all"
            title="Set as default bank account"
          >
            Set Default
          </button>
        )}
        <button
          onClick={() => onDelete(account.savedBankAccountId)}
          className="text-[#ba1a1a] hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors flex items-center justify-center"
          title="Delete bank account"
          aria-label="Delete bank account"
        >
          <span className="material-symbols-outlined text-[22px]">delete</span>
        </button>
      </div>
    </div>
  );
}
