import React, { useState } from "react";
import type { IVoucher } from "../types/voucher";

interface VoucherCardProps {
  voucher: IVoucher;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const getDaysUntilExpiry = (endDateString: string) => {
  const endDate = new Date(endDateString);
  const today = new Date();
  const diffTime = endDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export default function VoucherCard({ voucher }: VoucherCardProps) {
  const remainingUsage = voucher.maxUsagePerUser !== null
    ? Math.max(0, voucher.maxUsagePerUser - (voucher.currentUserUsageCount ?? 0))
    : null;

  const daysUntilExpiry = getDaysUntilExpiry(voucher.endDate);
  const isExpiringSoon = daysUntilExpiry <= 3 && daysUntilExpiry >= 0;

  const [isCopied, setIsCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(voucher.voucherCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1500);
  };

  return (
    <div className={`relative group flex flex-row h-[116px] w-full transition-all hover:-translate-y-1 z-0 hover:z-30 filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.06)] ${
      voucher.discountTarget === "ORDER_TOTAL"
        ? "hover:drop-shadow-[0_8px_20px_rgba(249,115,22,0.15)]"
        : "hover:drop-shadow-[0_8px_20px_rgba(16,185,129,0.15)]"
    }`}>
      {/* Left side: Image/Ticket Edge with Shopee-style perforations */}
      <div
        className="relative w-[116px] shrink-0 bg-slate-100 flex items-center justify-center overflow-hidden"
        style={{
          maskImage:
            "radial-gradient(circle at 0px 6px, transparent 3px, black 3.5px)",
          WebkitMaskImage:
            "radial-gradient(circle at 0px 6px, transparent 3px, black 3.5px)",
          maskSize: "100% 12px",
          WebkitMaskSize: "100% 12px",
          maskRepeat: "repeat-y",
          WebkitMaskRepeat: "repeat-y",
        }}
      >
        <div className={`w-full h-full flex flex-col items-center justify-center text-white px-2 ${
          voucher.discountTarget === "ORDER_TOTAL" ? "bg-orange-500" : "bg-emerald-500"
        }`}>
          <span className="material-symbols-outlined text-4xl">
            {voucher.discountTarget === "ORDER_TOTAL" ? "confirmation_number" : "local_shipping"}
          </span>
          <span className="text-[10px] font-bold tracking-widest mt-1 text-center uppercase">
            {voucher.discountTarget === "ORDER_TOTAL" ? "Voucher" : "Shipping"}
          </span>
        </div>
      </div>

      {/* Right side: Content */}
      <div className="grow bg-white p-3 flex flex-row relative min-w-0 border border-slate-200 rounded-r-md">
        {/* Info Column */}
        <div className="grow flex flex-col justify-between min-w-0">
          <div>
            <h3
              className="text-slate-900 text-sm leading-tight line-clamp-2"
              title={voucher.voucherName}
            >
              {voucher.voucherName}
            </h3>
            <p className="text-xs text-slate-500 mt-1 truncate">
              Minimum Order{" "}
              {voucher.minOrderAmount
                ? formatCurrency(voucher.minOrderAmount)
                : "0 VND"}
            </p>
          </div>

          <div className="flex items-center gap-1">
            <span
              className="material-symbols-outlined text-slate-400"
              style={{
                fontSize: "22px",
                fontVariationSettings:
                  '"FILL" 0, "wght" 300, "GRAD" 0, "opsz" 20',
              }}
            >
              schedule
            </span>
            <p className="text-xs text-slate-500">
              HSD: {formatDate(voucher.endDate)}
            </p>
          </div>
        </div>

        {/* Max Usage Ribbon - Shopee Style at Top Right */}
        {remainingUsage !== null && (
          <div className="absolute top-1 -right-1 z-20 flex flex-col items-end">
            <div className="bg-red-50 text-red-600 text-[11px] px-3 rounded-l-full border border-red-100 shadow-sm whitespace-nowrap font-bold">
              x{remainingUsage}
            </div>
            {/* The Fold - Below for top-right position */}
            <div className="w-1 h-1 bg-red-700 [clip-path:polygon(0_0,100%_0,0_100%)]"></div>
          </div>
        )}

        {/* Info Icon & Tooltip - Positioned Bottom Right */}
        <div className="absolute bottom-2 right-2">
          <button className="text-blue-500 hover:text-blue-600 transition-colors peer cursor-help flex items-center">
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: "20px",
                fontVariationSettings:
                  '"FILL" 0, "wght" 300, "GRAD" 0, "opsz" 20',
              }}
            >
              info
            </span>
          </button>

          {/* Tooltip content - Upward pointing */}
          <div className="absolute right-0 bottom-full mb-2 w-72 px-5 py-4 bg-white border border-slate-200 text-slate-900 text-sm rounded-2xl opacity-0 invisible peer-hover:opacity-100 peer-hover:visible transition-all duration-300 shadow-[0_20px_50px_rgba(0,0,0,0.12)] pointer-events-none z-[100]">
            <div className="absolute -bottom-1.5 right-2 w-3 h-3 bg-white border-b border-r border-slate-200 rotate-45"></div>
            <div className="relative flex flex-col gap-3 pointer-events-auto">
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">
                  Voucher code
                </span>
                <div className="flex items-center justify-between mt-1.5 bg-slate-50 border border-slate-200 px-3 py-2 rounded-md">
                  <span className="font-mono font-bold text-orange-600 text-base">
                    {voucher.voucherCode}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">
                  Validity period
                </span>
                <p className="mt-1 font-semibold text-slate-700 text-[13px]">
                  {formatDate(voucher.startDate)} -{" "}
                  {formatDate(voucher.endDate)}
                </p>
              </div>
              {voucher.voucherDescription && (
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">
                    Description
                  </span>
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed italic">
                    {voucher.voucherDescription}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Column */}
        <div className="flex flex-col items-center justify-center w-18 shrink-0 pl-3">
          <button
            onClick={copyCode}
            className={`w-full py-1.5 border text-[11px] font-semibold rounded transition-all duration-300 hover:cursor-pointer ${isCopied
              ? "border-green-700 text-green-700 bg-green-50"
              : voucher.discountTarget === "ORDER_TOTAL"
              ? "border-orange-500 text-orange-500 hover:bg-orange-50"
              : "border-emerald-500 text-emerald-500 hover:bg-emerald-50"
              }`}
          >
            {isCopied ? "Saved" : "Copy"}
          </button>
          {isExpiringSoon && (
            <span className="mt-2 text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full border border-red-100 text-center w-full leading-tight">
              Expiring soon
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
