"use client";

import Image from "next/image";
import Link from "next/link";
import { memo, useCallback } from "react";
import { useFlashSale } from "@/features/home/hooks/useFlashSale";
import {
  FlashSaleTimeSlot,
  FlashSaleProduct,
} from "@/features/home/types/flash-sale";

// ============================================================
// Helpers
// ============================================================

const toLocal = (utcStr: string) => {
  if (!utcStr) return new Date();
  if (!utcStr.endsWith("Z") && !utcStr.includes("+") && utcStr.includes("T")) {
    return new Date(utcStr + "Z");
  }
  return new Date(utcStr);
};

const formatShortTimeRange = (startAt: string, endAt: string) => {
  const start = toLocal(startAt);
  const end = toLocal(endAt);
  const startH = start.getHours();
  const endH = end.getHours();
  // const dd = String(start.getDate()).padStart(2, "0");
  // const mm = String(start.getMonth() + 1).padStart(2, "0");
  return `${startH}-${endH}h`;
};

const formatShortDate = (dateKey: string) => {
  const parts = dateKey.split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}`;
  }
  return dateKey;
};

// ============================================================
// Sub-components
// ============================================================

const TimeBlock = memo(function TimeBlock({
  value,
  isLive,
}: {
  value: number;
  isLive?: boolean;
}) {
  return (
    <div
      className={`px-1.5 sm:px-2 py-1 rounded-lg text-white font-bold text-sm sm:text-base min-w-8 sm:min-w-10 text-center shadow-sm tracking-widest transition-colors ${
        isLive ? "bg-rose-600" : "bg-[#0f172a]"
      }`}
    >
      {String(value).padStart(2, "0")}
    </div>
  );
});

function TabSkeleton() {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-9 w-24 sm:w-32 rounded-lg animate-pulse bg-gray-200 flex-shrink-0"
        />
      ))}
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="bg-white rounded-xl p-3 flex flex-col gap-3 h-full border border-gray-100 shadow-sm">
      <div className="aspect-square rounded-lg animate-pulse bg-gray-200" />
      <div className="h-4 w-3/4 rounded animate-pulse bg-gray-200" />
      <div className="h-4 w-1/2 rounded animate-pulse bg-gray-200" />
      <div className="mt-auto pt-3">
        <div className="h-4 w-full rounded-full animate-pulse bg-gray-200 mb-3" />
        <div className="h-9 w-full rounded-lg animate-pulse bg-gray-200" />
      </div>
    </div>
  );
}

// ── Product Card ─────────────────────────────────────────────

const ProductCard = memo(function ProductCard({
  product,
  index,
  isUpcoming,
}: {
  product: FlashSaleProduct;
  index: number;
  isUpcoming: boolean;
}) {
  const soldPct =
    product.saleQuantity > 0
      ? Math.round((product.soldQuantity / product.saleQuantity) * 100)
      : 0;
  const almostOut = soldPct >= 80;

  const formatVND = (price: number) => price.toLocaleString("vi-VN") + "đ";

  const maskVND = (price: number) => {
    const s = price.toLocaleString("vi-VN");
    let res = "";
    let digitCount = 0;
    for (let i = 0; i < s.length; i++) {
      if (/[0-9]/.test(s[i])) {
        digitCount++;
        // Mask the 2nd digit (and 3rd if price is large)
        if (digitCount === 2 || (s.length >= 7 && digitCount === 3)) {
          res += "?";
        } else {
          res += s[i];
        }
      } else {
        res += s[i];
      }
    }
    return res + "đ";
  };

  return (
    <Link
      href={isUpcoming ? "#" : `/products/${product.productId}`}
      className={`bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm transition-all p-3 flex flex-col relative h-full group ${
        index === 4 ? "hidden lg:flex" : ""
      } ${
        isUpcoming
          ? "cursor-default opacity-90"
          : "hover:border-[#ff6a00]/30 hover:shadow-md cursor-pointer"
      }`}
      onClick={(e) => isUpcoming && e.preventDefault()}
    >
      {/* Image */}
      <div className="relative aspect-square rounded-lg overflow-hidden mb-3">
        {product.mainImageUrl ? (
          <Image
            src={product.mainImageUrl}
            alt={product.productName}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 20vw"
            className={`object-cover transition-transform duration-300 ${
              !isUpcoming && "group-hover:scale-105"
            }`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-50">
            <span className="material-symbols-outlined text-[48px] text-slate-300">
              image_not_supported
            </span>
          </div>
        )}
      </div>

      {/* Name */}
      <h4 className="font-semibold text-gray-800 text-xs sm:text-sm mb-2 line-clamp-2 leading-tight">
        {product.productName}
      </h4>

      {/* Price */}
      <div className="flex items-end gap-2 mb-2">
        <span className="font-bold text-base sm:text-lg text-[#ff6a00] leading-none">
          {isUpcoming
            ? maskVND(product.salePrice)
            : formatVND(product.salePrice)}
        </span>
        {product.originalPrice > product.salePrice && (
          <span className="text-gray-400 text-sm line-through">
            {formatVND(product.originalPrice)}
          </span>
        )}
      </div>

      {/* Progress & Button */}
      <div className="mt-auto pt-2">
        {!isUpcoming && (
          <div className="w-full bg-[#ffeddb] h-4 rounded-full relative overflow-hidden flex items-center mb-3">
            <div
              className="absolute inset-y-0 left-0 bg-[#ff6a00] rounded-full transition-all duration-500 ease-out"
              style={{ width: `${Math.min(soldPct, 100)}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-[9px] sm:text-[10px] font-bold text-white z-10 drop-shadow-sm">
              {almostOut
                ? `SẮP HẾT (${product.soldQuantity}/${product.saleQuantity})`
                : `ĐÃ BÁN ${product.soldQuantity}/${product.saleQuantity}`}
            </div>
          </div>
        )}
        <div
          className={`w-full py-2 rounded-lg font-bold text-xs sm:text-sm uppercase text-center border transition-colors ${
            isUpcoming
              ? "bg-gray-100 text-gray-400 border-gray-100"
              : "border-[#ff6a00] text-[#ff6a00] hover:bg-[#fff7ed]"
          }`}
        >
          {isUpcoming ? "Sắp diễn ra" : "Mua Ngay"}
        </div>
      </div>
    </Link>
  );
});

// ── Time Slot Pill ───────────────────────────────────────────

const TimeSlotPill = memo(function TimeSlotPill({
  slot,
  isSelected,
  status,
  timeRange,
  onSelect,
}: {
  slot: FlashSaleTimeSlot;
  isSelected: boolean;
  status: "active" | "upcoming" | "expired";
  timeRange: string;
  onSelect: (id: number) => void;
}) {
  const handleClick = useCallback(() => {
    if (status !== "expired") onSelect(slot.timeSlotId);
  }, [slot.timeSlotId, status, onSelect]);

  const isDisabled = status === "expired";

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      title={isDisabled ? "Khung giờ đã kết thúc" : undefined}
      className={`flex-shrink-0 px-4 py-1.5 rounded-full font-bold text-xs sm:text-sm whitespace-nowrap transition-all border relative
        ${
          isSelected
            ? "bg-[#ff6a00] text-white border-[#ff6a00] shadow-md -translate-y-0.5"
            : isDisabled
              ? "bg-gray-100 text-gray-400 border-gray-100 cursor-not-allowed opacity-70"
              : "bg-white text-gray-600 border-gray-200 hover:border-[#ff6a00] hover:text-[#ff6a00]"
        }
      `}
    >
      {status === "active" && (
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 border-2 border-white bg-rose-500 animate-breath"></span>
        </span>
      )}
      {timeRange}
    </button>
  );
});

// ============================================================
// Main Component
// ============================================================

export default function FlashSale() {
  const {
    promotions,
    isLoading,
    error,
    selectedPromotionId,
    selectedDate,
    selectedSlotId,
    availableDates,
    timeSlotsForDate,
    productsForSlot,
    countdown,
    countdownLabel,
    selectPromotion,
    selectDate,
    selectSlot,
    getSlotRuntimeStatus,
    selectedSlot,
  } = useFlashSale();

  const isLive =
    !!selectedSlot && getSlotRuntimeStatus(selectedSlot) === "active";

  if (error) return null;
  if (!isLoading && promotions.length === 0) return null;

  return (
    <section className="py-8 sm:py-12">
      <div className="bg-white rounded-2xl shadow-[0_2px_20px_rgba(0,0,0,0.06)] border border-gray-200 p-4 sm:p-6 lg:p-8">
        {/* ── Header Row ────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 pb-4 gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="material-symbols-outlined text-[#ff6a00] text-[32px] sm:text-[40px] drop-shadow-sm">
              bolt
            </span>
            <h2 className="text-xl sm:text-3xl font-black uppercase tracking-tight text-gray-900">
              Flash Sale
            </h2>

            {countdown && (
              <>
                <div className="w-px h-6 bg-gray-200 mx-2 hidden sm:block"></div>
                <span className="text-gray-500 font-bold text-xs sm:text-sm uppercase hidden sm:block">
                  {countdownLabel}
                </span>

                <div className="flex items-center gap-1 sm:gap-1.5 ml-0 sm:ml-2">
                  {isLive && (
                    <div className="relative flex h-3 w-3 mr-1">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500 animate-breath"></span>
                    </div>
                  )}
                  {countdown.d > 0 && (
                    <>
                      <TimeBlock value={countdown.d} isLive={isLive} />
                      <span className="text-gray-800 font-bold">:</span>
                    </>
                  )}
                  <TimeBlock value={countdown.h} isLive={isLive} />
                  <span className="text-gray-800 font-bold">:</span>
                  <TimeBlock value={countdown.m} isLive={isLive} />
                  <span className="text-gray-800 font-bold">:</span>
                  <TimeBlock value={countdown.s} isLive={isLive} />
                </div>
              </>
            )}

            {!countdown && isLoading && (
              <div className="flex gap-1 ml-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 sm:w-10 sm:h-9 bg-gray-200 rounded-lg animate-pulse"
                  />
                ))}
              </div>
            )}
            {!countdown && !isLoading && (
              <>
                <div className="w-px h-6 bg-gray-200 mx-2 hidden sm:block"></div>
                <span className="text-gray-500 font-bold text-xs sm:text-sm uppercase hidden sm:block">
                  {countdownLabel}
                </span>
              </>
            )}
          </div>
        </div>

        {/* ── Promotion Tabs (Shopee Style) ─────────────────── */}
        {isLoading ? (
          <TabSkeleton />
        ) : promotions.length > 0 ? (
          <div className="flex items-center gap-3 border-b border-gray-100 pb-3 mb-6 overflow-x-auto no-scrollbar">
            {promotions.map((promo) => {
              const isActive = promo.promotionId === selectedPromotionId;
              return (
                <button
                  key={promo.promotionId}
                  onClick={() => selectPromotion(promo.promotionId)}
                  className={`relative py-1.5 px-4 rounded-full text-sm sm:text-base font-bold whitespace-nowrap transition-all border ${
                    isActive
                      ? "bg-rose-50 border-rose-200 text-rose-600 shadow-sm"
                      : "bg-white border-gray-200 text-gray-500 hover:text-rose-500 hover:border-rose-200"
                  }`}
                >
                  {promo.promotionName}
                </button>
              );
            })}
          </div>
        ) : null}

        {/* ── Dates & Time Slots ────────────────────────────── */}
        <div className="flex flex-col lg:flex-row gap-3 lg:gap-4 mb-6 items-start lg:items-center px-1">
          {/* Dates */}
          {!isLoading && availableDates.length > 0 && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 lg:pb-0 w-full lg:w-auto">
              {availableDates.map((dateKey) => {
                const isSelected = dateKey === selectedDate;
                return (
                  <button
                    key={dateKey}
                    onClick={() => selectDate(dateKey)}
                    className={`flex-shrink-0 px-4 py-1.5 rounded-full font-bold text-sm whitespace-nowrap transition-all border
                      ${
                        isSelected
                          ? "border-[#ff6a00] text-[#ff6a00] bg-orange-50 shadow-sm"
                          : "border-gray-200 text-gray-500 hover:border-[#ff6a00]/50 hover:text-[#ff6a00]"
                      }
                    `}
                  >
                    {formatShortDate(dateKey)}
                  </button>
                );
              })}
            </div>
          )}

          {!isLoading &&
            availableDates.length > 0 &&
            timeSlotsForDate.length > 0 && (
              <div className="hidden lg:block w-px h-6 bg-gray-200"></div>
            )}

          {/* Time Slots */}
          {!isLoading && timeSlotsForDate.length > 0 && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar py-2.5 w-full lg:w-auto pr-2">
              {timeSlotsForDate.map((slot) => {
                const status = getSlotRuntimeStatus(slot);
                return (
                  <TimeSlotPill
                    key={slot.timeSlotId}
                    slot={slot}
                    isSelected={slot.timeSlotId === selectedSlotId}
                    status={status}
                    timeRange={formatShortTimeRange(slot.startAt, slot.endAt)}
                    onSelect={selectSlot}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* ── Product Grid ──────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className={i === 4 ? "hidden lg:block" : ""}>
                  <ProductSkeleton />
                </div>
              ))
            : productsForSlot.length > 0
              ? productsForSlot
                  .slice(0, 5)
                  .map((product, i) => (
                    <ProductCard
                      key={product.slotProductId}
                      product={product}
                      index={i}
                      isUpcoming={
                        selectedSlot
                          ? getSlotRuntimeStatus(selectedSlot) === "upcoming"
                          : false
                      }
                    />
                  ))
              : !isLoading && (
                  <div className="col-span-full flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <div className="w-20 h-20 mb-4 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100">
                      <span className="material-symbols-outlined text-4xl text-gray-300">
                        inventory_2
                      </span>
                    </div>
                    <p className="text-gray-500 font-medium text-base">
                      Chưa có sản phẩm nào cho khung giờ này
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      Vui lòng chọn khung giờ khác hoặc quay lại sau.
                    </p>
                  </div>
                )}
        </div>
      </div>
    </section>
  );
}
