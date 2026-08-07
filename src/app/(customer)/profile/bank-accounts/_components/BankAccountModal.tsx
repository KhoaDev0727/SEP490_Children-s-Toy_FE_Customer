"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { bankAccountApi } from "@/features/profile/services/bank-account-api";
import type { BankLookupItem } from "@/features/profile/types/bank-account";

interface BankAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: {
    bankBin: string;
    bankName: string;
    bankShortName: string;
    bankCode: string;
    accountNumber: string;
    accountName: string;
    isDefault: boolean;
  }) => Promise<void>;
  banks: BankLookupItem[];
  loadingBanks: boolean;
}

export default function BankAccountModal({
  isOpen,
  onClose,
  onSave,
  banks,
  loadingBanks,
}: BankAccountModalProps) {
  const [selectedBankCode, setSelectedBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState("");
  const [lookupSuccess, setLookupSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Reset form on close
  useEffect(() => {
    if (!isOpen) {
      setSelectedBankCode("");
      setAccountNumber("");
      setAccountName("");
      setIsDefault(false);
      setLookupError("");
      setLookupSuccess(false);
      setLookupLoading(false);
      setSearchTerm("");
      setIsDropdownOpen(false);
    }
  }, [isOpen]);

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const performLookup = useCallback(async (bankCode: string, accNum: string) => {
    if (!bankCode || !accNum) return;

    setLookupLoading(true);
    setLookupError("");
    setLookupSuccess(false);
    setAccountName("");

    try {
      const resolvedName = await bankAccountApi.lookupOwnerName(bankCode, accNum);
      if (resolvedName) {
        setAccountName(resolvedName);
        setLookupSuccess(true);
      } else {
        setLookupError("Unable to verify account holder name.");
      }
    } catch (err: any) {
      console.warn("Lookup failed:", err);
      if (err.response?.status === 422) {
        setLookupError("The account number does not exist, or the bank does not support account lookup.");
      } else {
        setLookupError("Failed to verify account. Please try again.");
      }
    } finally {
      setLookupLoading(false);
    }
  }, []);

  // Handle inputs change
  const handleInputChange = (bankCode: string, accNum: string) => {
    setSelectedBankCode(bankCode);
    setAccountNumber(accNum);
    setLookupSuccess(false);
    setLookupError("");
    setAccountName("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBankCode || !accountNumber || !accountName || !lookupSuccess || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    try {
      const bank = banks.find((b) => b.code === selectedBankCode);
      if (!bank) throw new Error("Selected bank not found");

      await onSave({
        bankBin: bank.bin,
        bankName: bank.short_name,
        bankShortName: bank.short_name,
        bankCode: bank.code,
        accountNumber: accountNumber.trim(),
        accountName: accountName,
        isDefault,
      });
      onClose();
    } catch (err: any) {
      console.error(err);
      setLookupError(err.response?.data?.message || "Failed to save bank account. Please check constraints.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedBank = banks.find((b) => b.code === selectedBankCode);
  const filteredBanks = banks.filter((b) =>
    b.short_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.name && b.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    b.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  const modal = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#0f172a]/50" onClick={onClose} />

      {/* Content */}
      <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-800">Link Bank Account</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 rounded-lg p-1 transition-colors"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          {/* Bank Select */}
          <div className="flex flex-col gap-1.5 relative" ref={dropdownRef}>
            <label className="text-sm font-semibold text-slate-700">Select Bank</label>
            
            <button
              type="button"
              disabled={loadingBanks || isSubmitting}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#ff4f00] focus:border-[#ff4f00] bg-white transition-all disabled:opacity-50 text-slate-800 font-medium flex items-center justify-between shadow-sm cursor-pointer"
            >
              {selectedBank ? (
                <div className="flex items-center gap-3">
                  {selectedBank.icon_url && (
                    <img
                      src={selectedBank.icon_url}
                      alt={selectedBank.short_name}
                      className="w-10 h-10 object-contain rounded-md bg-white border border-slate-200 p-1 shrink-0"
                    />
                  )}
                  <span>{selectedBank.short_name}</span>
                </div>
              ) : (
                <span className="text-slate-400">-- Choose a Bank --</span>
              )}
              <span className="material-symbols-outlined text-slate-400 transition-transform duration-200" style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                expand_more
              </span>
            </button>

            {isDropdownOpen && (
              <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-white border border-slate-200 rounded-xl shadow-xl z-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                {/* Search input */}
                <div className="p-2 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
                  <span className="material-symbols-outlined text-slate-400 text-[18px]">search</span>
                  <input
                    type="text"
                    placeholder="Search bank name or code..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-sm text-slate-800 placeholder:text-slate-400 py-1"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                {/* Banks List */}
                <div className="max-h-60 overflow-y-auto divide-y divide-slate-50">
                  {filteredBanks.length === 0 ? (
                    <div className="p-4 text-center text-sm text-slate-400">No banks found</div>
                  ) : (
                    filteredBanks.map((b) => (
                      <button
                        key={b.code}
                        type="button"
                        onClick={() => {
                          handleInputChange(b.code, accountNumber);
                          setIsDropdownOpen(false);
                          setSearchTerm("");
                        }}
                        className={`w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors flex items-center gap-3 ${
                          selectedBankCode === b.code ? "bg-[#ff4f00]/5 font-semibold text-[#ff4f00]" : "text-slate-700"
                        }`}
                      >
                        {b.icon_url && (
                          <img
                            src={b.icon_url}
                            alt={b.short_name}
                            className="w-10 h-10 object-contain rounded-md bg-white border border-slate-200 p-1 shrink-0"
                          />
                        )}
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{b.short_name}</span>
                          <span className="text-xs text-slate-400">{b.name}</span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
            {loadingBanks && <span className="text-xs text-slate-400 animate-pulse mt-1">Loading banks list...</span>}
          </div>

          {/* Account Number */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700">Account Number</label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                maxLength={20}
                placeholder="e.g. 1903123456789"
                value={accountNumber}
                disabled={isSubmitting || lookupLoading}
                onChange={(e) => handleInputChange(selectedBankCode, e.target.value.replace(/[^A-Za-z0-9]/g, "").slice(0, 20))}
                className="flex-grow px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#ff4f00] focus:border-[#ff4f00] transition-all text-slate-800 font-medium disabled:opacity-60"
              />
              <button
                type="button"
                disabled={!selectedBankCode || !accountNumber || lookupLoading || isSubmitting || lookupSuccess}
                onClick={() => void performLookup(selectedBankCode, accountNumber)}
                className={`px-5 py-3 rounded-xl text-sm font-bold text-white transition-all whitespace-nowrap shadow-sm ${
                  selectedBankCode && accountNumber && !lookupLoading && !isSubmitting && !lookupSuccess
                    ? "bg-[#ff4f00] hover:bg-[#e04500] active:scale-[0.98]"
                    : "bg-slate-300 cursor-not-allowed shadow-none"
                }`}
              >
                {lookupLoading ? "Verifying..." : lookupSuccess ? "Verified" : "Verify"}
              </button>
            </div>
          </div>

          {/* Account Owner Name (Read Only) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700">Account Holder Name</label>
            <div className="relative">
              <input
                type="text"
                readOnly
                placeholder={lookupLoading ? "Looking up owner name..." : "Awaiting account verification..."}
                value={accountName}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-bold uppercase transition-all focus:outline-none placeholder:text-slate-400"
              />
              {lookupLoading && (
                <div className="absolute right-3.5 top-3.5 w-5 h-5 border-2 border-[#ff4f00] border-t-transparent rounded-full animate-spin" />
              )}
            </div>
            {lookupSuccess && (
              <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">check_circle</span> Verified Account
              </span>
            )}
            {lookupError && <span className="text-xs text-red-500 font-semibold">{lookupError}</span>}
          </div>

          {/* Is Default Toggle */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-2">
            <div>
              <div className="text-sm font-semibold text-slate-800">Set as default account</div>
              <div className="text-xs text-slate-400">Use this account by default for faster withdrawals</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isDefault}
                disabled={isSubmitting}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ff4f00]" />
            </label>
          </div>

          {/* Footer actions */}
          <div className="flex gap-3 justify-end border-t border-slate-100 pt-5 mt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-bold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!lookupSuccess || isSubmitting}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-md ${
                lookupSuccess && !isSubmitting
                  ? "bg-[#ff4f00] hover:bg-[#e04500] hover:-translate-y-0.5"
                  : "bg-slate-300 cursor-not-allowed shadow-none"
              }`}
            >
              {isSubmitting ? "Linking..." : "Link Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(modal, document.body)
    : null;
}
