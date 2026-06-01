"use client";
import { useCallback, useEffect, useState } from "react";
import { recommendationApi } from "@/features/recommendation/services/recommendation-api";
import type {
  RecommendationItem,
  RecommendationWidgetResponse,
  WidgetCode,
} from "@/features/recommendation/types/recommendation";

interface UseRecommendationsArgs {
  widgetCode: WidgetCode;
  productId?: number;
  orderId?: number;
  /** Tự fetch lại khi key này thay đổi (vd. user đổi product). */
  enabled?: boolean;
}

interface UseRecommendationsReturn {
  data: RecommendationWidgetResponse | null;
  items: RecommendationItem[];
  isLoading: boolean;
  /** True nếu API trả về lỗi → widget sẽ ẩn (theo spec). */
  hasError: boolean;
  refetch: () => void;
}

/**
 * Hook fetch danh sách gợi ý cho 1 widget.
 *
 * Quy tắc theo spec:
 *  - Loading: render skeleton (KHÔNG layout shift).
 *  - API lỗi: trả hasError = true → component cha ẨN widget (không show error UI).
 *  - Server-render an toàn: chỉ fetch trên client.
 */
export function useRecommendations({
  widgetCode,
  productId,
  orderId,
  enabled = true,
}: UseRecommendationsArgs): UseRecommendationsReturn {
  const [data, setData] = useState<RecommendationWidgetResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(enabled);
  const [hasError, setHasError] = useState(false);

  const fetchData = useCallback(async () => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setHasError(false);
    try {
      const response = await recommendationApi.getRecommendations({
        widgetCode,
        productId,
        orderId,
      });
      setData(response);
    } catch {
      // Theo spec: nếu API lỗi thì ẨN widget — không log/toast ra UI
      setHasError(true);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [enabled, widgetCode, productId, orderId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    items: data?.items ?? [],
    isLoading,
    hasError,
    refetch: fetchData,
  };
}
