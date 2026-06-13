"use client";

import { useState } from "react";
import { createPortal } from "react-dom";

interface BankAccount {
  id: string;
  bankName: string;
  bankCode: string;
  ownerName: string;
  maskedNumber: string;
  color: string;
}

const BANK_ACCOUNTS: BankAccount[] = [
  {
    id: "1",
    bankName: "Vietcombank",
    bankCode: "VCB",
    ownerName: "NGUYEN VAN A",
    maskedNumber: "•••• 6789",
    color: "#007b40",
  },
  {
    id: "2",
    bankName: "Techcombank",
    bankCode: "TCB",
    ownerName: "NGUYEN VAN A",
    maskedNumber: "•••• 3412",
    color: "#e31837",
  },
  {
    id: "3",
    bankName: "MB Bank",
    bankCode: "MB",
    ownerName: "NGUYEN VAN A",
    maskedNumber: "•••• 0056",
    color: "#6f1c7a",
  },
];

interface BankAccountSheetProps {
  selectedId: string;
  onSelect: (account: BankAccount) => void;
  onClose: () => void;
}

export default function BankAccountSheet({ selectedId, onSelect, onClose }: BankAccountSheetProps) {
  const sheet = (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#0f172a]/50" onClick={onClose} />

      {/* Sheet */}
      <div className="relative bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-xl shadow-2xl z-10 overflow-hidden border border-slate-200">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-slate-200 rounded-full" />
        </div>

        <div className="px-6 py-5">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
            <h2 className="text-lg font-bold text-[#0f172a]">Select Recipient Account</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors text-slate-500 hover:text-slate-800"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <div className="space-y-3 mb-5">
            {BANK_ACCOUNTS.map((account) => {
              const isSelected = selectedId === account.id;
              return (
                <button
                  key={account.id}
                  onClick={() => { onSelect(account); onClose(); }}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                    isSelected
                      ? "border-[#ff4f00] bg-orange-50/50"
                      : "border-slate-200 hover:border-[#ff4f00]/50 bg-white hover:bg-slate-50"
                  }`}
                >
                  {/* Bank icon */}
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                    style={{ backgroundColor: account.color }}
                  >
                    {account.bankCode}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 text-sm">{account.bankName}</p>
                    <p className="text-xs text-slate-500 truncate">
                      {account.ownerName} — {account.maskedNumber}
                    </p>
                  </div>

                  {/* Check icon (Radio style) */}
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

          {/* Add new account */}
          <button className="w-full flex items-center gap-3 p-4 rounded-xl border border-dashed border-slate-200 hover:border-[#ff4f00]/50 hover:bg-orange-50/50 transition-all group">
            <div className="w-11 h-11 rounded-full border border-dashed border-slate-300 group-hover:border-[#ff4f00]/50 flex items-center justify-center shrink-0 transition-colors">
              <span className="material-symbols-outlined text-slate-400 group-hover:text-[#ff4f00] transition-colors" style={{ fontSize: "20px" }}>
                add
              </span>
            </div>
            <span className="text-sm font-medium text-slate-500 group-hover:text-[#ff4f00] transition-colors">
              Add bank account
            </span>
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(sheet, document.body)
    : null;
}

export type { BankAccount };
export { BANK_ACCOUNTS };
