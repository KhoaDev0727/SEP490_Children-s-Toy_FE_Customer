"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { voucherApi } from "../services/voucher-api";
import type { IVoucher } from "../types/voucher";
import VoucherCard from "./VoucherCard";

type TabValue = "ALL" | "ORDER_TOTAL" | "SHIPPING_FEE";

export default function VoucherList() {
  const [vouchers, setVouchers] = useState<IVoucher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabValue>("ALL");
  const [highlightedCode, setHighlightedCode] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const highlightRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchVouchers = async () => {
      setIsLoading(true);
      try {
        const res = await voucherApi.getVouchers({
          status: "Active",
          pageSize: 100,
        });
        if (isMounted) {
          // Filter out expired vouchers just in case
          const now = new Date().getTime();
          const activeVouchers = res.items.filter((v) => {
            const endDate = new Date(v.endDate).getTime();
            if (endDate <= now) return false;
            if (v.discountTarget === "FINAL_PRICE") return false;
            if (v.maxUsagePerUser && v.currentUserUsageCount !== null && v.currentUserUsageCount >= v.maxUsagePerUser) return false;
            return true;
          });
          setVouchers(activeVouchers);
        }
      } catch (error) {
        console.error("Failed to fetch vouchers:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchVouchers();

    return () => {
      isMounted = false;
    };
  }, []);

  // Highlight voucher from notification deep-link (?code=XYZ)
  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) return;
    setHighlightedCode(code.toUpperCase());
  }, [searchParams]);

  // After vouchers load + highlight set, scroll to highlighted card
  useEffect(() => {
    if (!highlightedCode || isLoading) return;
    const matched = vouchers.find(
      (v) => v.voucherCode.toUpperCase() === highlightedCode,
    );
    if (!matched) {
      toast("Mã voucher từ thông báo không còn khả dụng.", { icon: "ℹ️" });
      return;
    }
    // Switch to the right tab so the voucher is visible
    if (matched.discountTarget !== "ALL") {
      setActiveTab(matched.discountTarget as TabValue);
    } else {
      setActiveTab("ALL");
    }
    toast.success("Đây là mã voucher từ thông báo của bạn.");
    // Scroll after render
    const timer = setTimeout(() => {
      if (highlightRef.current) {
        highlightRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [highlightedCode, vouchers, isLoading]);

  const filteredVouchers = useMemo(() => {
    if (activeTab === "ALL") return vouchers;
    return vouchers.filter((v) => v.discountTarget === activeTab);
  }, [vouchers, activeTab]);

  const counts = useMemo(() => {
    return {
      ALL: vouchers.length,
      ORDER_TOTAL: vouchers.filter((v) => v.discountTarget === "ORDER_TOTAL")
        .length,
      SHIPPING_FEE: vouchers.filter((v) => v.discountTarget === "SHIPPING_FEE")
        .length,
    };
  }, [vouchers]);

  const tabs = [
    { value: "ALL", label: "All" },
    { value: "ORDER_TOTAL", label: "Discount code" },
    { value: "SHIPPING_FEE", label: "Shipping voucher" },
  ];

  return (
    <section className="col-span-1 md:col-span-3 bg-white rounded-xl shadow-sm border border-[#e2bfb0]/30 overflow-hidden flex flex-col min-h-[500px]">
      <div className="px-6 py-4 border-b border-[#e2bfb0]/30 bg-white">
        <h1 className="text-2xl font-bold text-[#261812]">My Vouchers</h1>
        <p className="mt-1 text-sm text-[#5a4136]">
          Manage and use your discount vouchers.
        </p>
      </div>

      <div className="flex flex-col grow">
        {/* Tabs */}
        <div className="flex items-center gap-8 px-6 md:px-8 border-b border-slate-100 bg-white">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.value;
            const count = counts[tab.value as keyof typeof counts];
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value as TabValue)}
                className={`relative py-4 text-sm font-medium transition-all hover:cursor-pointer ${
                  isActive
                    ? "text-orange-500 font-semibold"
                    : "text-slate-600 hover:text-orange-500"
                }`}
              >
                {tab.label} ({count})
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" />
                )}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 grow">
          {isLoading ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-32 bg-slate-100 animate-pulse rounded-2xl"
                ></div>
              ))}
            </div>
          ) : filteredVouchers.length > 0 ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
              {filteredVouchers.map((voucher) => {
                const isHighlighted =
                  highlightedCode !== null &&
                  voucher.voucherCode.toUpperCase() === highlightedCode;
                return (
                  <div
                    key={voucher.voucherId}
                    ref={isHighlighted ? highlightRef : null}
                    className={
                      isHighlighted
                        ? "ring-2 ring-orange-400 rounded-2xl transition-shadow"
                        : undefined
                    }
                  >
                    <VoucherCard voucher={voucher} />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center">
              <div className="w-24 h-24 mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-4xl text-slate-300">
                  confirmation_number
                </span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900">
                No vouchers
              </h3>
              <p className="text-sm text-slate-500 mt-1 max-w-[250px]">
                You currently have no vouchers in this category.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
