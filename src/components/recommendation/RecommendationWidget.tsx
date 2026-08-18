"use client";

import { useRecommendations } from "@/hooks/useRecommendations";
import type { WidgetCode } from "@/features/recommendation/types/recommendation";
import ProductCard from "@/components/recommendation/ProductCard";
import RecommendationSkeleton from "@/components/recommendation/RecommendationSkeleton";
import { useAuthContext } from "@/context/AuthContext";

interface RecommendationWidgetProps {
  /** Mã widget — quy định bởi backend (SQL.Recommendation.Widgets). */
  widgetCode: WidgetCode;
  /** Bắt buộc với pdp_similar / pdp_also_bought. */
  productId?: number;
  /** Dùng cho after_purchase để recommend theo toàn bộ sản phẩm trong đơn. */
  orderId?: number;
  /** Title hiển thị. Nếu không truyền sẽ dùng widgetName từ API. */
  title?: string;
  /** Subtitle/description nhỏ phía dưới title. */
  subtitle?: string;
  /** Source page (gắn vào tracking khi click vào sản phẩm). */
  source?: string;
  /** Tự ẩn nếu không có dữ liệu (mặc định true). */
  hideOnEmpty?: boolean;
  /** Số card skeleton lúc loading. */
  skeletonCount?: number;
  /** Class wrap section. */
  className?: string;
}

/**
 * Container widget gợi ý — tự fetch theo widgetCode.
 *
 * Behavior (theo spec):
 *  - Loading → render skeleton, không layout shift.
 *  - API lỗi → ẨN widget hoàn toàn (không show error).
 *  - Trả về 0 item → ẨN widget nếu hideOnEmpty = true.
 *  - Widget homepage_personal (Recommended for You) chỉ hiển thị cho authenticated user.
 */
export default function RecommendationWidget({
  widgetCode,
  productId,
  orderId,
  title,
  subtitle,
  source,
  hideOnEmpty = true,
  skeletonCount = 8,
  className,
}: RecommendationWidgetProps) {
  const { isAuthenticated, isHydrated } = useAuthContext();

  if (widgetCode === "homepage_personal" && isHydrated && !isAuthenticated) {
    return null;
  }

  const { items, isLoading, hasError, data } = useRecommendations({
    widgetCode,
    productId,
    orderId,
    enabled:
      widgetCode === "pdp_similar" || widgetCode === "pdp_also_bought"
        ? Boolean(productId && productId > 0)
        : widgetCode === "after_purchase"
          ? Boolean(orderId && orderId > 0)
          : true,
  });

  if (isLoading) {
    return (
      <section className={className}>
        <RecommendationSkeleton count={skeletonCount} title={title ?? "Đang tải gợi ý..."} />
      </section>
    );
  }

  if (hasError) return null;
  if (hideOnEmpty && (!items || items.length === 0)) return null;

  const displayTitle = title ?? data?.widgetName ?? "Gợi ý cho bạn";

  return (
    <section className={className}>
      <div className="flex items-end justify-between mb-6 gap-4">
        <div>
          <h3 className="text-2xl font-bold text-slate-900">{displayTitle}</h3>
          {subtitle && (
            <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 lg:gap-6">
        {items.map((item) => (
          <ProductCard
            key={item.productId}
            item={item}
            source={source ?? `widget:${widgetCode}`}
          />
        ))}
      </div>
    </section>
  );
}
