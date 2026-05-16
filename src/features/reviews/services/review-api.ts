import axiosClient from "@/configs/axios-client";
import {
  MyReviewDto,
  MyReviewQueryDto,
  PaginatedResponse,
  ReviewProductListDto,
  ReviewQueryDto,
  UnreviewedProductDto,
} from "../types/review.types";

export const reviewApi = {
  getUnreviewedProducts: async (
    pageNumber = 1,
    pageSize = 10
  ): Promise<PaginatedResponse<UnreviewedProductDto>> => {
    return axiosClient.get<PaginatedResponse<UnreviewedProductDto>>(
      "/reviews/unreviewed",
      { params: { pageNumber, pageSize } }
    );
  },

  getMyReviews: async (
    params: MyReviewQueryDto
  ): Promise<PaginatedResponse<MyReviewDto>> => {
    return axiosClient.get<PaginatedResponse<MyReviewDto>>("/reviews/me", {
      params,
    });
  },

  getPublicReviews: async (
    params: ReviewQueryDto
  ): Promise<PaginatedResponse<ReviewProductListDto>> => {
    return axiosClient.get<PaginatedResponse<ReviewProductListDto>>(
      "/reviews",
      { params }
    );
  },

  createReview: async (formData: FormData): Promise<any> => {
    return axiosClient.post("/reviews", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  updateReview: async (id: number, formData: FormData): Promise<any> => {
    return axiosClient.put(`/reviews/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};
