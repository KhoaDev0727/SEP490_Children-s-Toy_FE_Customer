"use client";
import React, { createContext, useCallback, useContext, useEffect, useState, useSyncExternalStore } from "react";
import type { AccountInfo } from "@/features/auth/types/auth";

interface AuthContextValue {
  account: AccountInfo | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  setAuth: (account: AccountInfo, token: string) => void;
  updateAccount: (partial: Partial<AccountInfo>) => void;
  clearAuth: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<AccountInfo | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    const stored = localStorage.getItem("account_info");
    if (!stored) {
      return null;
    }

    try {
      return JSON.parse(stored) as AccountInfo;
    } catch {
      localStorage.removeItem("account_info");
      return null;
    }
  });
  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  useEffect(() => {
    if (!account) {
      return;
    }

    localStorage.setItem("account_info", JSON.stringify(account));
  }, [account]);

  const setAuth = useCallback((accountInfo: AccountInfo, token: string) => {
    localStorage.setItem("access_token", token);
    localStorage.setItem("account_info", JSON.stringify(accountInfo));
    setAccount(accountInfo);
  }, []);

  const clearAuth = useCallback(() => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("account_info");
    setAccount(null);
  }, []);

  useEffect(() => {
    const handleLogout = () => {
      clearAuth();
    };
    window.addEventListener("auth:logout", handleLogout);
    return () => {
      window.removeEventListener("auth:logout", handleLogout);
    };
  }, [clearAuth]);

  const updateAccount = useCallback((partial: Partial<AccountInfo>) => {
    setAccount((current) => {
      if (!current) {
        return current;
      }
      let hasChange = false;
      for (const [key, value] of Object.entries(partial)) {
        if (current[key as keyof AccountInfo] !== value) {
          hasChange = true;
          break;
        }
      }

      if (!hasChange) {
        return current;
      }

      return { ...current, ...partial };
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{ account, isAuthenticated: !!account, isHydrated, setAuth, updateAccount, clearAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
}
