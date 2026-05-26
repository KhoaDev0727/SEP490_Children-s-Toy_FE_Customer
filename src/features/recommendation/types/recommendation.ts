/** Mã widget theo cấu hình SQL Server.Recommendation.Widgets */
export const WIDGET_CODES = {
  HOMEPAGE_TRENDING: "homepage_trending",
  HOMEPAGE_PERSONAL: "homepage_personal",
  PDP_SIMILAR: "pdp_similar",
  PDP_ALSO_BOUGHT: "pdp_also_bought",
  AFTER_PURCHASE: "after_purchase",
} as const;

export type WidgetCode = (typeof WIDGET_CODES)[keyof typeof WIDGET_CODES];

/** 1 sản phẩm gợi ý — khớp với RecommendationItemDto bên backend (camelCase). */
export interface RecommendationItem {
  productId: number;
  productName: string;
  price: number;
  discountedPrice?: number | null;
  discountPercent?: number | null;
  promotionType?: string | null;
  quantity: number;
  productStatus: string;
  categoryId: number;
  categoryName?: string | null;
  brandId?: number | null;
  brandName?: string | null;
  mainImageUrl?: string | null;
  averageRating?: number | null;
  reviewCount: number;
  soldQuantity: number;
  score: number;
  reason: string;
  reasonCode: string;
}

/** Response chuẩn của GET /api/recommendations. */
export interface RecommendationWidgetResponse {
  widgetCode: string;
  widgetName: string;
  algorithm: string;
  items: RecommendationItem[];
}
