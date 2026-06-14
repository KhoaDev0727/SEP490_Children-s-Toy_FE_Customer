"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { bankAccountApi } from "@/features/profile/services/bank-account-api";
import type { SavedBankAccount } from "@/features/profile/types/bank-account";

interface BankAccountSheetProps {
  selectedId: number | null;
  onSelect: (account: SavedBankAccount) => void;
  onClose: () => void;
}

const BANK_COLORS: Record<string, string> = {
  VCB: "#007b40",
  TCB: "#e31837",
  MB: "#6f1c7a",
  BIDV: "#005f99",
  ACB: "#004b97",
  TPB: "#df0024",
  VPB: "#ed1c24",
  SHB: "#bc1e22",
  OCB: "#f60",
  default: "#94a3b8",
};

function getBankColor(shortName: string): string {
  return BANK_COLORS[shortName?.toUpperCase()] ?? BANK_COLORS.default;
}

export default function BankAccountSheet({ selectedId, onSelect, onClose }: BankAccountSheetProps) {
  const [accounts, setAccounts] = useState<SavedBankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    bankAccountApi.getMyBankAccounts()
      .then(setAccounts)
      .catch(() => setError("Unable to load bank accounts."))
      .finally(() => setLoading(false));
  }, []);

  const sheet = (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-[#0f172a]/50" onClick={onClose} />

      <div className="relative bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-xl shadow-2xl z-10 overflow-hidden border border-slate-200">
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-slate-200 rounded-full" />
        </div>

        <div className="px-6 py-5">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
            <h2 className="text-lg font-bold text-[#0f172a]">Select recipient account</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors text-slate-500 hover:text-slate-800"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {loading && (
            <div className="py-8 text-center text-sm text-slate-500">Loading...</div>
          )}
          {error && (
            <div className="py-8 text-center text-sm text-red-500">{error}</div>
          )}
          {!loading && !error && accounts.length === 0 && (
            <div className="py-8 text-center text-sm text-slate-400">
              You do not have any saved bank accounts.{" "}
              <a href="/profile/bank-accounts" className="text-[#ff4f00] font-medium hover:underline">
                Add one now
              </a>
            </div>
          )}

          <div className="space-y-3 mb-5">
            {accounts.map((account) => {
              const isSelected = selectedId === account.savedBankAccountId;
              const color = getBankColor(account.bankShortName);
              const last4 = account.accountNumber.slice(-4);
              return (
                <button
                  key={account.savedBankAccountId}
                  onClick={() => { onSelect(account); onClose(); }}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                    isSelected
                      ? "border-[#ff4f00] bg-orange-50/50"
                      : "border-slate-200 hover:border-[#ff4f00]/50 bg-white hover:bg-slate-50"
                  }`}
                >
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0"
                    style={{ backgroundColor: color }}
                  >
                    {account.bankShortName?.slice(0, 3)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 text-sm">{account.bankName}</p>
                    <p className="text-xs text-slate-500 truncate">
                      {account.accountName} — ****{last4}
                    </p>
                  </div>
                  <span
                    className={`material-symbols-outlined text-[20px] shrink-0 transition-colors ${
                      isSelected ? "text-[#ff4f00]" : "text-slate-300"
                    }`}
                    style={{ fontVariationSettings: isSelected ? "'FILL' 1" : undefined }}
                  >
                    {isSelected ? "radio_button_checked" : "radio_button_unchecked"}
                  </span>
                </button>
              );
            })}
          </div>

          <a
            href="/profile/bank-accounts"
            className="w-full flex items-center gap-3 p-4 rounded-xl border border-dashed border-slate-200 hover:border-[#ff4f00]/50 hover:bg-orange-50/50 transition-all group"
          >
            <div className="w-11 h-11 rounded-full border border-dashed border-slate-300 group-hover:border-[#ff4f00]/50 flex items-center justify-center shrink-0 transition-colors">
              <span className="material-symbols-outlined text-slate-400 group-hover:text-[#ff4f00] transition-colors" style={{ fontSize: "20px" }}>
                add
              </span>
            </div>
            <span className="text-sm font-medium text-slate-500 group-hover:text-[#ff4f00] transition-colors">
              Add bank account
            </span>
          </a>
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(sheet, document.body) : null;
}
