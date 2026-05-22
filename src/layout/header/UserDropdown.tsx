"use client";

import { useAuthContext } from "@/context/AuthContext";
import { authApi } from "@/features/auth/services/auth-api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

export default function UserDropdown() {
  const { account, isAuthenticated, isHydrated, clearAuth } = useAuthContext();
  const [open, setOpen] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    setAvatarFailed(false);
  }, [account?.imageUrl]);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore logout API errors — always clear local state
    }
    clearAuth();
    setOpen(false);
    toast.success("Logged out.");
    router.push("/");
  };

  if (!isHydrated) {
    return <div className="h-10 w-[110px]" aria-hidden="true" />;
  }

  if (!isAuthenticated || !account) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className="hidden sm:block px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-[#ff6a00] transition-colors"
        >
          Log in
        </Link>
        <Link
          href="/register"
          className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-opacity hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #ff6a00, #ff9a3c)" }}
        >
          Sign up
        </Link>
      </div>
    );
  }

  const initials = account.accountName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const normalizedImageUrl = account.imageUrl?.trim();

  return (
    <div className="relative" ref={ref}>
      {/* Trigger: avatar + name + chevron — matches HTML's group pattern */}
      <div
        className="relative group flex items-center gap-2 h-full py-4 cursor-pointer"
        onClick={() => setOpen((prev) => !prev)}
      >
        <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-700 flex-shrink-0">
          {!avatarFailed && normalizedImageUrl ? (
            <img
              src={normalizedImageUrl}
              alt={account.accountName}
              onError={() => setAvatarFailed(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-white text-xs font-bold"
              style={{ background: "linear-gradient(135deg, #ff6a00, #ff9a3c)" }}
            >
              {initials}
            </div>
          )}
        </div>
        <span className="hidden sm:block text-sm font-medium text-slate-700 dark:text-slate-300 max-w-[120px] truncate">
          {account.accountName}
        </span>
        <span
          className="material-symbols-outlined text-slate-400 transition-transform duration-200"
          style={{
            fontSize: 16,
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          expand_more
        </span>
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full w-48 bg-white dark:bg-slate-900 shadow-xl rounded-xl border border-slate-100 dark:border-slate-800 py-2 z-50">
          {/* User info header */}
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
              {account.accountName}
            </p>
            <p className="text-xs text-slate-500 truncate mt-0.5">{account.email}</p>
          </div>

          <div className="py-1">
            <Link
              href="/profile/orders"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-orange-50 dark:hover:bg-orange-950/20 hover:text-[#ff6a00] transition-colors"
            >
              <span className="material-symbols-outlined opacity-70" style={{ fontSize: 20 }}>
                package_2
              </span>
              Orders
            </Link>
            <Link
              href="/profile/wallet"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-orange-50 dark:hover:bg-orange-950/20 hover:text-[#ff6a00] transition-colors"
            >
              <span className="material-symbols-outlined opacity-70" style={{ fontSize: 20 }}>
                account_balance_wallet
              </span>
              Wallet
            </Link>
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-orange-50 dark:hover:bg-orange-950/20 hover:text-[#ff6a00] transition-colors"
            >
              <span className="material-symbols-outlined opacity-70" style={{ fontSize: 20 }}>
                manage_accounts
              </span>
              Account
            </Link>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 py-1">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-left"
            >
              <span className="material-symbols-outlined opacity-70" style={{ fontSize: 20 }}>
                logout
              </span>
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
