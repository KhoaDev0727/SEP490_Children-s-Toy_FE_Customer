"use client";

import React, { useEffect, useState, useMemo } from "react";
import { voucherApi } from "../services/voucher-api";
import type { IVoucher } from "../types/voucher";
import VoucherCard from "./VoucherCard";

type TabValue = "ALL" | "ORDER_TOTAL" | "SHIPPING_FEE";

export default function VoucherList() {
  const [vouchers, setVouchers] = useState<IVoucher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabValue>("ALL");

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
            return endDate > now;
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

  const filteredVouchers = useMemo(() => {
    if (activeTab === "ALL") return vouchers;
    return vouchers.filter((v) => v.discountTarget === activeTab);
  }, [vouchers, activeTab]);

  const counts = useMemo(() => {
    return {
      ALL: vouchers.length,
      ORDER_TOTAL: vouchers.filter((v) => v.discountTarget === "ORDER_TOTAL").length,
      SHIPPING_FEE: vouchers.filter((v) => v.discountTarget === "SHIPPING_FEE").length,
    };
  }, [vouchers]);

  const tabs = [
    { value: "ALL", label: "Tất cả" },
    { value: "ORDER_TOTAL", label: "Mã giảm giá" },
    { value: "SHIPPING_FEE", label: "Mã vận chuyển" },
  ];

  return (
    <section className="col-span-1 md:col-span-3 bg-white rounded-3xl shadow-[0_14px_40px_rgba(15,23,42,0.08)] border border-slate-200/80 flex flex-col min-h-[500px]">
      <div className="px-6 md:px-8 py-6 border-b border-slate-200/70 bg-linear-to-r from-orange-50/80 via-white to-amber-50/70">
        <h1 className="text-2xl md:text-[28px] font-semibold tracking-tight text-slate-900">
          Kho Voucher
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Quản lý và sử dụng các mã giảm giá của bạn.
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
                className={`relative py-4 text-sm font-medium transition-all ${
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
              {filteredVouchers.map((voucher) => (
                <VoucherCard key={voucher.voucherId} voucher={voucher} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center">
              <div className="w-24 h-24 mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-4xl text-slate-300">
                  confirmation_number
                </span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900">
                Không có voucher nào
              </h3>
              <p className="text-sm text-slate-500 mt-1 max-w-[250px]">
                Bạn hiện chưa có voucher nào trong danh mục này.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
