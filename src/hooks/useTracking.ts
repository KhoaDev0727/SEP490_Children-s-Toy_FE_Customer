"use client";
import { useCallback, useEffect, useRef } from "react";
import tracking, {
  ENTITY_TYPES,
  EVENT_TYPES,
  type TrackEntityType,
  type TrackEventInput,
  type TrackEventType,
} from "@/lib/tracking";

/**
 * Hook tiện ích để components gửi event vào batch collector.
 *
 * Cách dùng:
 *   const { track, trackProductView, trackProductViewLong } = useTracking();
 *   track({ eventType: "add_to_cart", entityId: productId, entityType: "product" });
 */
export function useTracking() {
  // Đảm bảo collector lifecycle (timer + unload hook) đã khởi động
  useEffect(() => {
    tracking.start();
  }, []);

  const track = useCallback((input: TrackEventInput) => {
    tracking.enqueue(input);
  }, []);

  const trackProductView = useCallback((productId: number, source?: string) => {
    tracking.enqueue({
      eventType: EVENT_TYPES.PRODUCT_VIEW,
      entityId: productId,
      entityType: ENTITY_TYPES.PRODUCT,
      source,
    });
  }, []);

  const trackProductViewLong = useCallback(
    (productId: number, durationMs: number, source?: string) => {
      // Theo spec: nếu xem > 30s thì gửi product_view_long
      if (durationMs < 30_000) return;
      tracking.enqueue({
        eventType: EVENT_TYPES.PRODUCT_VIEW_LONG,
        entityId: productId,
        entityType: ENTITY_TYPES.PRODUCT,
        durationMs,
        source,
      });
    },
    [],
  );

  const trackAddToCart = useCallback(
    (productId: number, metadata?: Record<string, unknown>) => {
      tracking.enqueue({
        eventType: EVENT_TYPES.ADD_TO_CART,
        entityId: productId,
        entityType: ENTITY_TYPES.PRODUCT,
        metadata,
      });
    },
    [],
  );

  const trackRemoveFromCart = useCallback((productId: number) => {
    tracking.enqueue({
      eventType: EVENT_TYPES.REMOVE_FROM_CART,
      entityId: productId,
      entityType: ENTITY_TYPES.PRODUCT,
    });
  }, []);

  const trackAddToWishlist = useCallback((productId: number) => {
    tracking.enqueue({
      eventType: EVENT_TYPES.ADD_TO_WISHLIST,
      entityId: productId,
      entityType: ENTITY_TYPES.PRODUCT,
    });
  }, []);

  const trackPurchase = useCallback(
    (productIds: number[], orderId?: number) => {
      // Mỗi product 1 event purchase, share metadata orderId
      productIds.forEach((pid) => {
        tracking.enqueue({
          eventType: EVENT_TYPES.PURCHASE,
          entityId: pid,
          entityType: ENTITY_TYPES.PRODUCT,
          metadata: orderId ? { orderId } : undefined,
        });
      });
      // Đảm bảo flush ngay — purchase là event quan trọng
      tracking.flushNow();
    },
    [],
  );

  const trackSearch = useCallback((keyword: string) => {
    if (!keyword.trim()) return;
    tracking.enqueue({
      eventType: EVENT_TYPES.SEARCH,
      entityId: keyword.trim().slice(0, 100),
      entityType: ENTITY_TYPES.SEARCH,
    });
  }, []);

  const trackCategoryBrowse = useCallback((categoryId: number, categoryName?: string) => {
    tracking.enqueue({
      eventType: EVENT_TYPES.CATEGORY_BROWSE,
      entityId: categoryId,
      entityType: ENTITY_TYPES.CATEGORY,
      metadata: categoryName ? { categoryName } : undefined,
    });
  }, []);

  const trackReviewSubmit = useCallback((productId: number, rating: number) => {
    tracking.enqueue({
      eventType: EVENT_TYPES.REVIEW_SUBMIT,
      entityId: productId,
      entityType: ENTITY_TYPES.PRODUCT,
      metadata: { rating },
    });
  }, []);

  return {
    track,
    trackProductView,
    trackProductViewLong,
    trackAddToCart,
    trackRemoveFromCart,
    trackAddToWishlist,
    trackPurchase,
    trackSearch,
    trackCategoryBrowse,
    trackReviewSubmit,
  };
}

/**
 * Hook đo "view long" cho 1 product detail page.
 * Tự gửi event product_view khi mount, và product_view_long khi user xem > 30s.
 */
export function useProductDetailViewTracking(productId: number | null) {
  const startTimeRef = useRef<number>(0);
  const sentLongRef = useRef(false);
  const sentViewRef = useRef(false);

  useEffect(() => {
    if (!productId || productId <= 0) return;
    tracking.start();
    sentViewRef.current = false;
    sentLongRef.current = false;
    startTimeRef.current = Date.now();

    // Gửi product_view ngay khi vào trang
    tracking.enqueue({
      eventType: EVENT_TYPES.PRODUCT_VIEW,
      entityId: productId,
      entityType: ENTITY_TYPES.PRODUCT,
    });
    sentViewRef.current = true;

    // Sau 30s, nếu vẫn còn trên trang thì gửi product_view_long
    const timer = setTimeout(() => {
      if (sentLongRef.current) return;
      const durationMs = Date.now() - startTimeRef.current;
      tracking.enqueue({
        eventType: EVENT_TYPES.PRODUCT_VIEW_LONG,
        entityId: productId,
        entityType: ENTITY_TYPES.PRODUCT,
        durationMs,
      });
      sentLongRef.current = true;
    }, 30_000);

    return () => {
      clearTimeout(timer);
    };
  }, [productId]);
}

/** Re-export const để dùng linh hoạt. */
export { EVENT_TYPES, ENTITY_TYPES };
export type { TrackEventInput, TrackEventType, TrackEntityType };
