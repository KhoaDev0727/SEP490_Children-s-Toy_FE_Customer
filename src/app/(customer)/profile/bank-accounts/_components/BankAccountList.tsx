"use client";

import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import BankAccountCard from "./BankAccountCard";
import BankAccountModal from "./BankAccountModal";
import { bankAccountApi } from "@/features/profile/services/bank-account-api";
import type { SavedBankAccount, BankLookupItem } from "@/features/profile/types/bank-account";

export default function BankAccountList() {
  const [accounts, setAccounts] = useState<SavedBankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const [banks, setBanks] = useState<BankLookupItem[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(false);

  // Fetch supported banks list once on mount
  useEffect(() => {
    setLoadingBanks(true);
    bankAccountApi
      .getBanksList()
      .then((list) => {
        // Filter lookup_supported = 1
        const filtered = list.filter((b) => b.lookup_supported === 1);
        setBanks(filtered);
      })
      .catch((err) => {
        console.error("Failed to load banks list:", err);
        setBanks([]);
      })
      .finally(() => setLoadingBanks(false));
  }, []);

  const loadAccounts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await bankAccountApi.getMyBankAccounts();
      setAccounts(data);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to load saved bank accounts.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAccounts();
  }, [loadAccounts]);

  // Prevent scrolling when delete confirmation is open
  useEffect(() => {
    if (deleteConfirmId) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [deleteConfirmId]);

  const handleSave = async (payload: {
    bankBin: string;
    bankName: string;
    bankShortName: string;
    bankCode: string;
    accountNumber: string;
    accountName: string;
    isDefault: boolean;
  }) => {
    try {
      await bankAccountApi.createBankAccount(payload);
      toast.success("Bank account linked successfully.");
      await loadAccounts();
    } catch (err: any) {
      console.error(err);
      const message = err.response?.data?.message || "Failed to link bank account.";
      toast.error(message);
      throw err; // rethrow for modal to show error
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;

    try {
      await bankAccountApi.deleteBankAccount(deleteConfirmId);
      toast.success("Bank account removed successfully.");
      setDeleteConfirmId(null);
      await loadAccounts();
    } catch (err: any) {
      console.error(err);
      const message = err.response?.data?.message || "Failed to delete bank account.";
      toast.error(message);
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      setLoading(true);
      await bankAccountApi.setDefaultBankAccount(id);
      toast.success("Default bank account updated successfully.");
      await loadAccounts();
    } catch (err: any) {
      console.error(err);
      const message = err.response?.data?.message || "Failed to update default bank account.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-white">
        <div>
          <h1 className="text-2xl font-bold text-[#0f172a]">Bank Accounts</h1>
          <p className="mt-1 text-sm text-[#475569]">Manage your linked bank accounts for secure withdrawals.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#ff4f00] hover:bg-[#e04500] hover:-translate-y-0.5 transition-all shadow-md shadow-[#ff4f00]/10 flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Link Bank Account
        </button>
      </div>

      <div className="flex flex-col p-6 gap-4 min-h-[250px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-400">
            <div className="w-8 h-8 border-2 border-[#ff4f00] border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium">Loading bank accounts...</span>
          </div>
        ) : accounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center bg-white rounded-xl border border-dashed border-slate-200">
            <div className="w-16 h-16 bg-[#ff4f00]/5 rounded-full flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[#ff4f00] text-3xl">account_balance</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">No bank accounts linked</h3>
            <p className="text-sm text-slate-500 max-w-[280px]">
              Link your first bank account today to withdraw funds to your bank.
            </p>
          </div>
        ) : (
          accounts.map((acc) => {
            const matchedBank = banks.find((b) => b.bin === acc.bankBin || b.code === acc.bankCode);
            return (
              <BankAccountCard
                key={acc.savedBankAccountId}
                account={acc}
                logoUrl={matchedBank?.logo_url}
                onDelete={setDeleteConfirmId}
                onSetDefault={handleSetDefault}
              />
            );
          })
        )}
      </div>

      {/* Linking Modal */}
      <BankAccountModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        banks={banks}
        loadingBanks={loadingBanks}
      />

      {/* Delete Confirmation Dialogue */}
      {deleteConfirmId && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div className="absolute inset-0 bg-[#0f172a]/50" onClick={() => setDeleteConfirmId(null)} />
          <div className="relative z-10 bg-white w-full max-w-sm mx-4 rounded-2xl p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="mb-5">
              <h3 className="font-bold text-slate-800 text-lg">Remove Bank Account</h3>
              <p className="text-sm text-slate-500 mt-1.5">Are you sure you want to delete this bank account?</p>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-bold shadow-md shadow-red-600/10 hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
