import axiosClient from "@/configs/axios-client";
import type {
  BankLookupItem,
  CreateSavedBankAccountRequest,
  SavedBankAccount,
} from "../types/bank-account";

export const bankAccountApi = {
  getMyBankAccounts: async (): Promise<SavedBankAccount[]> => {
    return axiosClient.get<SavedBankAccount[]>("/bank-accounts");
  },
  createBankAccount: async (payload: CreateSavedBankAccountRequest): Promise<SavedBankAccount> => {
    return axiosClient.post<SavedBankAccount, CreateSavedBankAccountRequest>("/bank-accounts", payload);
  },
  deleteBankAccount: async (id: number): Promise<void> => {
    return axiosClient.put<void>(`/bank-accounts/${id}/delete`);
  },
  setDefaultBankAccount: async (id: number): Promise<void> => {
    return axiosClient.put<void>(`/bank-accounts/${id}/default`);
  },
  getBanksList: async (): Promise<BankLookupItem[]> => {
    return axiosClient.get<BankLookupItem[]>("/bank-accounts/banks");
  },
  lookupOwnerName: async (bankCode: string, accountNumber: string): Promise<string> => {
    return axiosClient.get<string>(`/bank-accounts/lookup?bankCode=${bankCode}&accountNumber=${accountNumber}`);
  },
};
