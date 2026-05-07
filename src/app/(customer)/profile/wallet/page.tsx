"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import ProfileSidebar from "../_components/ProfileSidebar";

const benefits = [
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

type Transaction = {
  id: number;
  icon: string;
  title: string;
  time: string;
  amount: number;
  status: "Successful" | "Pending";
  kind: "credit" | "debit" | "refund";
};

const transactions: Transaction[] = [
  {
    id: 1,
    icon: "shopping_bag",
    title: "Order payment #ORD-8921",
    time: "10:30 AM, 15/10/2024",
    amount: -250000,
    status: "Successful",
    kind: "debit",
  },
  {
    id: 2,
    icon: "savings",
    title: "Top up from bank account",
    time: "09:15 AM, 14/10/2024",
    amount: 5000000,
    status: "Successful",
    kind: "credit",
  },
  {
    id: 3,
    icon: "currency_exchange",
    title: "Order refund #ORD-7734",
    time: "04:45 PM, 12/10/2024",
    amount: 125000,
    status: "Successful",
    kind: "refund",
  },
];

const currentBalance = 12450000;

function formatVnd(value: number) {
  const absValue = Math.abs(value);
  const formatted = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(absValue);
  return `${value < 0 ? "-" : "+"}${formatted} ₫`;
}

function formatBalance(value: number) {
  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value)} ₫`;
}

function getTransactionIconStyles(kind: Transaction["kind"]) {
  if (kind === "debit") return "bg-red-100 text-red-600";
  if (kind === "refund") return "bg-blue-100 text-blue-600";
  return "bg-green-100 text-green-600";
}

export default function WalletPage() {
  const [isWalletActivated, setIsWalletActivated] = useState(false);

  const totalCredit = useMemo(
    () =>
      transactions
        .filter((transaction) => transaction.amount > 0)
        .reduce((sum, transaction) => sum + transaction.amount, 0),
    [],
  );

  return (
    <main className="flex-grow max-w-[1280px] mx-auto w-full px-4 md:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="col-span-full mb-2">
        <nav className="flex items-center gap-2 text-sm text-[#5a4136]">
          <Link href="/" className="hover:text-[#a14000] transition-colors">
            Home
          </Link>
          <span className="material-symbols-outlined text-[14px] opacity-50">chevron_right</span>
          <Link href="/profile" className="hover:text-[#a14000] transition-colors">
            Account
          </Link>
          <span className="material-symbols-outlined text-[14px] opacity-50">chevron_right</span>
          <span className="text-[#a14000] font-medium">Wallet</span>
        </nav>
      </div>

      <ProfileSidebar />

      <section className="col-span-1 md:col-span-3 bg-white rounded-xl shadow-sm border border-[#e2bfb0]/30 overflow-hidden">
        <div className="px-6 py-4 border-b border-[#e2bfb0]/30 flex justify-between items-center bg-white">
          <h1 className="text-2xl font-bold text-[#261812]">Wallet Management</h1>
        </div>

        {!isWalletActivated ? (
          <div className="px-6 py-12 md:py-16 flex flex-col items-center text-center">
            <div className="w-32 h-32 rounded-full bg-[#a14000]/10 flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-[64px] text-[#a14000]">
                account_balance_wallet
              </span>
            </div>
            <h2 className="text-3xl font-bold text-[#261812] mb-3">Activate ShopX Wallet</h2>
            <p className="text-sm text-[#5a4136] max-w-[560px] mb-8">
              Experience lightning-fast, secure payments and unlock exclusive rewards with ShopX
              Wallet.
            </p>

            <div className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5 mb-8 text-left">
              {benefits.map((benefit) => (
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
              onClick={() => setIsWalletActivated(true)}
              className="bg-[#a14000] hover:bg-[#8a3600] text-white px-8 py-3 rounded-xl font-semibold text-lg transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">add_circle</span>
              Activate Wallet Now
            </button>
          </div>
        ) : (
          <div>
            <div className="p-6">
              <div className="bg-gradient-to-r from-[#a14000] to-[#ff6a00] rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
                <div className="relative z-10">
                  <p className="text-sm text-white/85 mb-1">Available Balance</p>
                  <h2 className="text-4xl md:text-5xl font-extrabold mb-5 tracking-tight">
                    {formatBalance(currentBalance)}
                  </h2>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      className="bg-white text-[#a14000] px-5 py-2 rounded-lg text-sm font-semibold hover:bg-[#fff3eb] transition-colors flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[18px]">add_circle</span>
                      Top Up
                    </button>
                    <button
                      type="button"
                      className="bg-white/15 border border-white/30 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-white/20 transition-colors flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[18px]">account_balance</span>
                      Withdraw
                    </button>
                  </div>
                </div>
                <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-[160px] text-white/10 select-none pointer-events-none">
                  account_balance_wallet
                </span>
              </div>
              <p className="mt-3 text-xs text-[#5a4136]">
                Total incoming transactions:{" "}
                <span className="font-semibold text-emerald-700">{formatVnd(totalCredit)}</span>
              </p>
            </div>

            <div className="px-6 py-4 border-t border-b border-[#e2bfb0]/30 flex justify-between items-center bg-white">
              <h3 className="text-xl font-bold text-[#261812]">Transaction History</h3>
              <button
                type="button"
                className="text-[#a14000] hover:text-[#ff6a00] text-sm font-semibold transition-colors flex items-center gap-1"
              >
                View all
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            </div>

            <div className="flex flex-col">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center gap-4 p-6 bg-white hover:bg-[#fff8f6] transition-colors border-b border-[#e2bfb0]/20 last:border-b-0"
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${getTransactionIconStyles(transaction.kind)}`}
                  >
                    <span className="material-symbols-outlined">{transaction.icon}</span>
                  </div>
                  <div className="flex-grow pl-2 min-w-0">
                    <h4 className="text-sm md:text-base font-semibold text-[#261812] mb-1 truncate">
                      {transaction.title}
                    </h4>
                    <span className="text-xs text-[#565e74]">{transaction.time}</span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p
                      className={`text-lg font-bold mb-1 ${
                        transaction.amount >= 0 ? "text-emerald-600" : "text-red-500"
                      }`}
                    >
                      {formatVnd(transaction.amount)}
                    </p>
                    <span className="text-[12px] font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded">
                      {transaction.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
