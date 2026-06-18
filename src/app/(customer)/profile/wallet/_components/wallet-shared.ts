import type { WalletTransactionDto } from "@/features/wallet/types/wallet";

export const BENEFITS = [
  {
    icon: "touch_app",
    title: "One-tap payment",
    description: "Fast, seamless checkout without entering your PIN repeatedly.",
  },
  {
    icon: "payments",
    title: "Refund & Withdrawal",
    description: "Refunds are returned to your internal wallet, which you can withdraw to your bank account.",
  },
  {
    icon: "security",
    title: "Full protection",
    description: "International security standards for every transaction.",
  },
];

export type TransactionKind = "credit" | "debit" | "refund";

export type UiTransaction = {
  id: number;
  icon: string;
  title: string;
  time: string;
  completedTime: string | null;
  createdAtTimestamp: number;
  amount: number;
  method: string;
  reason: string | null;
  relatedOrderCode: string | null;
  rawTxnType: string;
  statusLabel: string;
  statusClassName: string;
  kind: TransactionKind;
};

export type PinModalMode = "activate" | "topup" | "viewBalance" | "changePin" | "withdraw";

export type PinVisibilityField =
  | "pin"
  | "confirmPin"
  | "oldPin"
  | "newChangePin"
  | "confirmChangePin"
  | "newPin"
  | "confirmNewPin";

export const DEFAULT_PIN_VISIBILITY: Record<PinVisibilityField, boolean> = {
  pin: false,
  confirmPin: false,
  oldPin: false,
  newChangePin: false,
  confirmChangePin: false,
  newPin: false,
  confirmNewPin: false,
};

export function formatVnd(value: number) {
  const absValue = Math.abs(value);
  const formatted = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(absValue);
  return `${value < 0 ? "-" : "+"}${formatted} VND`;
}

export function formatBalance(value: number) {
  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value)} VND`;
}

const VIETNAM_TIMEZONE = "Asia/Ho_Chi_Minh";

function parseApiDateAsUtc(rawDate: string) {
  const raw = rawDate.trim();
  if (!raw) return null;

  const hasTimezoneInfo = /(?:Z|[+-]\d{2}:\d{2})$/i.test(raw);
  const normalized = hasTimezoneInfo ? raw : `${raw}Z`;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function formatTransactionTime(isoDate: string) {
  const date = parseApiDateAsUtc(isoDate);
  if (!date) {
    return "-";
  }

  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: VIETNAM_TIMEZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const partMap = parts.reduce<Record<string, string>>((acc, part) => {
    if (part.type !== "literal") {
      acc[part.type] = part.value;
    }
    return acc;
  }, {});

  return `${partMap.day ?? "--"}/${partMap.month ?? "--"}/${partMap.year ?? "----"} ${partMap.hour ?? "--"}:${partMap.minute ?? "--"}`;
}

export function getTransactionIconStyles(kind: TransactionKind) {
  if (kind === "debit") return "bg-red-100 text-red-600";
  if (kind === "refund") return "bg-blue-100 text-blue-600";
  return "bg-green-100 text-green-600";
}

export function mapWalletTransactionToUi(txn: WalletTransactionDto): UiTransaction {
  const normalizedType = txn.txnType.trim().toLowerCase();
  const normalizedDirection = txn.direction.trim().toUpperCase();
  const signedAmount = txn.signedAmount;
  const createdAt = parseApiDateAsUtc(txn.createdAt);

  const kind: TransactionKind =
    normalizedType === "refund" ? "refund" : normalizedDirection === "DR" ? "debit" : "credit";

  let icon = "account_balance_wallet";
  let title = `Wallet ${txn.txnType}`;

  if (normalizedType === "payment") {
    icon = "shopping_bag";
    title = txn.reason || (txn.relatedOrderCode ? `Order payment #${txn.relatedOrderCode}` : "Order payment");
  }

  if (normalizedType === "topup") {
    icon = "savings";
    title = "Top up from bank account";
  }

  if (normalizedType === "withdrawal") {
    icon = "payments";
    title = "Withdrawal to bank account";
  }

  if (normalizedType === "refund") {
    icon = "currency_exchange";
    title = txn.reason || (txn.relatedOrderCode ? `Order refund #${txn.relatedOrderCode}` : "Order refund");
  }

  const normalizedStatus = txn.status.trim().toLowerCase();
  let statusLabel = txn.status;
  let statusClassName = "text-green-600 bg-green-100";

  if (normalizedStatus === "completed" || normalizedStatus === "success") {
    statusLabel = "Successful";
    statusClassName = "text-green-600 bg-green-100";
  } else if (normalizedStatus === "pending" || normalizedStatus === "processing") {
    statusLabel = normalizedStatus === "processing" ? "Processing" : "Pending";
    statusClassName = "text-amber-700 bg-amber-100";
  } else if (normalizedStatus === "failed" || normalizedStatus === "cancelled") {
    statusLabel = "Failed";
    statusClassName = "text-red-600 bg-red-100";
  }

  return {
    id: txn.walletTransactionId,
    icon,
    title,
    time: formatTransactionTime(txn.createdAt),
    completedTime: txn.completedAt ? formatTransactionTime(txn.completedAt) : null,
    createdAtTimestamp: createdAt?.getTime() ?? 0,
    amount: signedAmount,
    method: txn.method,
    reason: txn.reason,
    relatedOrderCode: txn.relatedOrderCode,
    rawTxnType: txn.txnType,
    statusLabel,
    statusClassName,
    kind,
  };
}

export function getPinModalTitle(mode: PinModalMode, hasPendingWallet = false) {
  if (mode === "activate") {
    return hasPendingWallet ? "Set Up Wallet PIN" : "Activate Wallet";
  }
  if (mode === "topup") return "Verify PIN for Top Up";
  if (mode === "withdraw") return "Verify PIN for Withdrawal";
  if (mode === "changePin") return "Change Wallet PIN";
  return "Verify PIN for Balance";
}

export function getPinModalDescription(mode: PinModalMode, hasPendingWallet = false) {
  if (mode === "activate") {
    return hasPendingWallet
      ? "Create a 6-digit PIN to access your refund balance."
      : "Create your 6-digit wallet PIN to activate the wallet.";
  }
  if (mode === "topup") {
    return "Enter your 6-digit PIN to verify TOP_UP action.";
  }
  if (mode === "withdraw") {
    return "Enter your 6-digit PIN to verify WITHDRAW action.";
  }
  if (mode === "changePin") {
    return "Enter old PIN and set your new 6-digit wallet PIN.";
  }
  return "Enter your 6-digit PIN to verify VIEW_BALANCE action.";
}

export function getValidationErrorMessage(error: { issues?: Array<{ message?: string }> }) {
  return error.issues?.[0]?.message ?? "Invalid input. Please check and try again.";
}
