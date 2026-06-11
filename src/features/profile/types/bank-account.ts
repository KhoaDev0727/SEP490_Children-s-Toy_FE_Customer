export interface SavedBankAccount {
  savedBankAccountId: number;
  accountId: number;
  bankBin: string;
  bankName: string;
  bankShortName: string;
  bankCode?: string;
  accountNumber: string;
  accountName: string;
  isDefault: boolean;
  lastUsedAt?: string;
  createdAt: string;
}

export interface CreateSavedBankAccountRequest {
  bankBin: string;
  bankName: string;
  bankShortName: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  isDefault: boolean;
}

export interface BankLookupItem {
  code: string;
  bin: string;
  short_name: string;
  name: string;
  logo_url?: string;
  icon_url?: string;
  lookup_supported: number;
}
