import axiosClient from "@/configs/axios-client";
import { FlashSalePromotion } from "@/features/home/types/flash-sale";

export const flashSaleApi = {
  /**
   * Lấy danh sách Flash Sale promotions đang Active/Scheduled.
   * Public endpoint — không cần auth.
   */
  getFlashSalePromotions: async (): Promise<FlashSalePromotion[]> => {
    return axiosClient.get<FlashSalePromotion[]>("/promotions/flash-sale");
  },
};
