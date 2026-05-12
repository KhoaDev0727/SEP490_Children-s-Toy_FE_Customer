import type { WalletTransactionDto } from "@/features/wallet/types/wallet";

export const BENEFITS = [
  {
    icon: "touch_app",
    title: "One-tap payment",
    description: "Fast, seamless checkout without entering your PIN repeatedly.",
  },
  {
    icon: "savings",
    title: "10% cashback",
    description: "Earn rewards and receive wallet cashback on every order.",
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
  amount: number;
  statusLabel: string;
  statusClassName: string;
  kind: TransactionKind;
};

export type PinModalMode = "activate" | "topup" | "viewBalance" | "changePin";

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
  return `${value < 0 ? "-" : "+"}${formatted} \u20ab`;
}

export function formatBalance(value: number) {
  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value)} \u20ab`;
}

function formatTransactionTime(isoDate: string) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  const timeText = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);

  const dateText = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);

  return `${timeText}, ${dateText}`;
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

  const kind: TransactionKind =
    normalizedType === "refund" ? "refund" : normalizedDirection === "DR" ? "debit" : "credit";

  let icon = "account_balance_wallet";
  let title = `Wallet ${txn.txnType}`;

  if (normalizedType === "payment") {
    icon = "shopping_bag";
    title = txn.relatedOrderId ? `Order payment #ORD-${txn.relatedOrderId}` : "Order payment";
  }

  if (normalizedType === "topup") {
    icon = "savings";
    title = "Top up from bank account";
  }

  if (normalizedType === "refund") {
    icon = "currency_exchange";
    title = txn.relatedOrderId ? `Order refund #ORD-${txn.relatedOrderId}` : "Order refund";
  }

  const normalizedStatus = txn.status.trim().toLowerCase();
  let statusLabel = txn.status;
  let statusClassName = "text-green-600 bg-green-100";

  if (normalizedStatus === "completed") {
    statusLabel = "Successful";
    statusClassName = "text-green-600 bg-green-100";
  } else if (normalizedStatus === "pending") {
    statusLabel = "Pending";
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
    amount: signedAmount,
    statusLabel,
    statusClassName,
    kind,
  };
}

export function getPinModalTitle(mode: PinModalMode) {
  if (mode === "activate") return "Activate Wallet";
  if (mode === "topup") return "Verify PIN for Top Up";
  if (mode === "changePin") return "Change Wallet PIN";
  return "Verify PIN for Balance";
}

export function getPinModalDescription(mode: PinModalMode) {
  if (mode === "activate") {
    return "Create your 6-digit wallet PIN to activate the wallet.";
  }
  if (mode === "topup") {
    return "Enter your 6-digit PIN to verify TOP_UP action.";
  }
  if (mode === "changePin") {
    return "Enter old PIN and set your new 6-digit wallet PIN.";
  }
  return "Enter your 6-digit PIN to verify VIEW_BALANCE action.";
}

export function getValidationErrorMessage(error: { issues?: Array<{ message?: string }> }) {
  return error.issues?.[0]?.message ?? "Invalid input. Please check and try again.";
}
