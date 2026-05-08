import axiosClient from "@/configs/axios-client";
import {
  BlogDetail,
  BlogReview,
  BlogReviewReply,
  BlogListItem,
  BlogQueryParams,
  BrandListItem,
  BrandQueryParams,
  PaginatedResponse,
} from "../types/blog";

export const customerBlogApi = {
  getPublishedBlogs: async (
    params: BlogQueryParams,
  ): Promise<PaginatedResponse<BlogListItem>> => {
    return axiosClient.get<PaginatedResponse<BlogListItem>>("/blogs/search", { params });
  },

  getBlogById: async (blogPostId: number): Promise<BlogDetail> => {
    return axiosClient.get<BlogDetail>(`/blogs/${blogPostId}`);
  },

  getBlogReviews: async (blogPostId: number): Promise<BlogReview[]> => {
    return axiosClient.get<BlogReview[]>(`/blogs/${blogPostId}/reviews`);
  },

  createBlogReview: async (blogPostId: number, comment: string): Promise<BlogReview> => {
    return axiosClient.post<BlogReview, { comment: string }>(`/blogs/${blogPostId}/reviews`, { comment });
  },

  removeBlogReview: async (reviewBlogId: number): Promise<boolean> => {
    return axiosClient.delete<boolean>(`/blogs/reviews/${reviewBlogId}`);
  },

  createBlogReviewReply: async (
    reviewBlogId: number,
    payload: { comment: string; parentReplyId?: number | null; replyToAccountId?: number | null },
  ): Promise<BlogReviewReply> => {
    return axiosClient.post<BlogReviewReply, { comment: string; parentReplyId?: number | null; replyToAccountId?: number | null }>(
      `/blogs/reviews/${reviewBlogId}/replies`,
      payload,
    );
  },

  searchBrands: async (
    params: BrandQueryParams,
  ): Promise<PaginatedResponse<BrandListItem>> => {
    return axiosClient.get<PaginatedResponse<BrandListItem>>("/brands", { params });
  },
};
