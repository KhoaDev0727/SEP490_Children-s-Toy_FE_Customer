import axiosClient from "@/configs/axios-client";
import type {
  RecommendationWidgetResponse,
  WidgetCode,
} from "@/features/recommendation/types/recommendation";

interface GetRecommendationsParams {
  widgetCode: WidgetCode;
  productId?: number;
  orderId?: number;
  accountId?: number;
}

export const recommendationApi = {
  /**
   * GET /api/recommendations?widgetCode=...&productId=...
   * Public endpoint — không cần auth (cho cả guest), nhưng nếu có Bearer token
   * thì backend sẽ tự resolve AccountId từ claim.
   */
  getRecommendations: async (
    params: GetRecommendationsParams,
  ): Promise<RecommendationWidgetResponse> => {
    const qs = new URLSearchParams();
    qs.set("widgetCode", params.widgetCode);
    if (params.productId && params.productId > 0) {
      qs.set("productId", String(params.productId));
    }
    if (params.orderId && params.orderId > 0) {
      qs.set("orderId", String(params.orderId));
    }
    if (params.accountId && params.accountId > 0) {
      qs.set("accountId", String(params.accountId));
    }
    return axiosClient.get<RecommendationWidgetResponse>(
      `/recommendations?${qs.toString()}`,
    );
  },
};
