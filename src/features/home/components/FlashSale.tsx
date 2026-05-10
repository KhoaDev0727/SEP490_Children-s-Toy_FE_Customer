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

const TimeBlock = memo(function TimeBlock({ value }: { value: number }) {
  return (
    <div className="px-1.5 sm:px-2 py-1 rounded-md bg-[#0f172a] text-white font-bold text-sm sm:text-base min-w-[2rem] sm:min-w-[2.5rem] text-center shadow-sm tracking-widest">
      {String(value).padStart(2, "0")}
    </div>
  );
});

function TabSkeleton() {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-4">
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
}: {
  product: FlashSaleProduct;
  index: number;
}) {
  const soldPct =
    product.saleQuantity > 0
      ? Math.round((product.soldQuantity / product.saleQuantity) * 100)
      : 0;
  const almostOut = soldPct >= 80;

  const formatVND = (price: number) => price.toLocaleString("vi-VN") + "đ";

  return (
    <Link
      href={`/products/${product.productId}`}
      className={`bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-[#ff6a00]/30 shadow-sm hover:shadow-md transition-all p-3 flex flex-col relative h-full group ${index === 4 ? "hidden lg:flex" : ""}`}
    >
      {/* Image */}
      <div className="relative aspect-square rounded-lg overflow-hidden mb-3">
        {product.mainImageUrl ? (
          <Image
            src={product.mainImageUrl}
            alt={product.productName}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 20vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
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
          {formatVND(product.salePrice)}
        </span>
        {product.originalPrice > product.salePrice && (
          <span className="text-gray-400 text-xs line-through">
            {formatVND(product.originalPrice)}
          </span>
        )}
      </div>

      {/* Progress & Button */}
      <div className="mt-auto pt-2">
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
        <div className="w-full py-2 rounded-lg border border-[#ff6a00] text-[#ff6a00] font-bold text-xs sm:text-sm hover:bg-[#fff7ed] transition-colors uppercase text-center">
          Mua Ngay
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
              ? "bg-gray-100 text-gray-400 border-gray-100 cursor-not-allowed"
              : "bg-white text-gray-600 border-gray-200 hover:border-[#ff6a00] hover:text-[#ff6a00]"
        }
      `}
    >
      {status === "active" && !isSelected && (
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-white bg-[#22c55e]" />
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
  } = useFlashSale();

  if (error) return null;
  if (!isLoading && promotions.length === 0) return null;

  return (
    <section className="py-8 sm:py-12">
      <div className="bg-white rounded-2xl shadow-[0_2px_20px_rgba(0,0,0,0.06)] border border-gray-200 p-4 sm:p-6 lg:p-8">
        {/* ── Header Row ────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 pb-4 gap-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#ff6a00] text-[32px] sm:text-[40px] drop-shadow-sm">
              bolt
            </span>
            <h2 className="text-xl sm:text-3xl font-black uppercase tracking-tight text-gray-900">
              Flash Sale
            </h2>

            <div className="w-px h-6 bg-gray-200 mx-2 hidden sm:block"></div>

            <span className="text-gray-500 font-bold text-xs sm:text-sm uppercase hidden sm:block">
              {countdownLabel}
            </span>

            {countdown ? (
              <div className="flex items-center gap-1 sm:gap-1.5 ml-0 sm:ml-2">
                <TimeBlock value={countdown.d} />
                <span className="text-gray-800 font-bold">:</span>
                <TimeBlock value={countdown.h} />
                <span className="text-gray-800 font-bold">:</span>
                <TimeBlock value={countdown.m} />
                <span className="text-gray-800 font-bold">:</span>
                <TimeBlock value={countdown.s} />
              </div>
            ) : isLoading ? (
              <div className="flex gap-1 ml-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 sm:w-10 sm:h-9 bg-gray-200 rounded animate-pulse"
                  />
                ))}
              </div>
            ) : null}
          </div>
        </div>

        {/* ── Promotion Tabs ────────────────────────────────── */}
        {isLoading ? (
          <TabSkeleton />
        ) : promotions.length > 1 ? (
          <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-4 pb-1">
            {promotions.map((promo) => {
              const isActive = promo.promotionId === selectedPromotionId;
              return (
                <button
                  key={promo.promotionId}
                  onClick={() => selectPromotion(promo.promotionId)}
                  className={`flex-shrink-0 px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-colors
                    ${
                      isActive
                        ? "bg-[#ff6a00] text-white shadow-sm"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }
                  `}
                >
                  {promo.promotionName}
                </button>
              );
            })}
          </div>
        ) : null}

        {/* ── Dates & Time Slots ────────────────────────────── */}
        <div className="flex flex-col lg:flex-row gap-3 lg:gap-4 mb-6 items-start lg:items-center">
          {/* Dates */}
          {!isLoading && availableDates.length > 0 && (
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 lg:pb-0 w-full lg:w-auto">
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
            <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1 w-full lg:w-auto">
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
                    />
                  ))
              : !isLoading && (
                  <div className="col-span-full text-center py-12 bg-gray-50 rounded-xl border border-gray-100 border-dashed">
                    <span className="material-symbols-outlined text-5xl text-gray-300 mb-2 block">
                      inventory_2
                    </span>
                    <p className="text-gray-500 font-medium">
                      Chưa có sản phẩm nào cho khung giờ này
                    </p>
                  </div>
                )}
        </div>
      </div>
    </section>
  );
}
