"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback } from "react";
import type { RecommendationItem } from "@/features/recommendation/types/recommendation";
import { useTracking } from "@/hooks/useTracking";

interface ProductCardProps {
  item: RecommendationItem;
  /** Source page để gắn vào event tracking. */
  source?: string;
}

const FALLBACK_IMAGE =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><rect width='200' height='200' fill='%23f1f5f9'/><text x='50%25' y='50%25' fill='%2394a3b8' font-family='Inter,sans-serif' font-size='14' text-anchor='middle' dominant-baseline='middle'>No image</text></svg>";

function formatVnd(value: number): string {
  if (!Number.isFinite(value)) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(value) + " ₫";
}

/**
 * 1 card sản phẩm gợi ý — click vào sẽ điều hướng tới trang chi tiết.
 * Tự gửi event product_view khi user click (source = recommendation widget).
 */
export default function ProductCard({ item, source }: ProductCardProps) {
  const { trackProductView } = useTracking();

  const handleClick = useCallback(() => {
    trackProductView(item.productId, source ?? `recommendation:${item.reasonCode}`);
  }, [item.productId, item.reasonCode, source, trackProductView]);

  const ratingValue = Number(item.averageRating ?? 0);
  const hasDiscount = item.discountedPrice != null && item.discountedPrice < item.price;
  const displayPrice = hasDiscount ? item.discountedPrice! : item.price;

  return (
    <Link
      href={`/products/${item.productId}`}
      onClick={handleClick}
      className="group bg-white rounded-xl overflow-hidden border border-slate-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#ff6a00]"
      aria-label={`Xem chi tiết ${item.productName}`}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-slate-50">
        <Image
          src={item.mainImageUrl || FALLBACK_IMAGE}
          alt={item.productName}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
        />
        {hasDiscount && item.discountPercent && (
          <span className="absolute top-2 left-2 text-white text-[11px] font-bold px-2 py-0.5 rounded bg-[#ff6a00]">
            -{item.discountPercent}%
          </span>
        )}
      </div>

      <div className="p-4">
        {item.brandName && (
          <p className="text-[11px] text-slate-400 mb-1 uppercase tracking-wider truncate">
            {item.brandName}
          </p>
        )}
        <h4
          className="font-semibold text-slate-900 mb-2 text-sm leading-snug overflow-hidden"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {item.productName}
        </h4>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="font-bold text-lg text-[#ff6a00]">
            {formatVnd(displayPrice)}
          </span>
          {hasDiscount && (
            <span className="text-slate-400 text-xs line-through">
              {formatVnd(item.price)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px] text-amber-400" style={{ fontVariationSettings: "'FILL' 1" }}>
              star
            </span>
            <span className="font-medium text-slate-700">
              {ratingValue > 0 ? ratingValue.toFixed(1) : "Chưa có"}
            </span>
            {item.reviewCount > 0 && <span>({item.reviewCount})</span>}
          </div>
          {item.soldQuantity > 0 && (
            <span>Đã bán {item.soldQuantity}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
