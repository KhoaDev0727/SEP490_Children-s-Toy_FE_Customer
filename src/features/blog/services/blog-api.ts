import axiosClient from "@/configs/axios-client";
import {
  BlogDetail,
  BlogCategoryItem,
  BlogReview,
  BlogReviewReply,
  BlogListItem,
  BlogQueryParams,
  ReactionSummary,
  BrandListItem,
  BrandQueryParams,
  PaginatedResponse,
} from "../types/blog";

export const customerBlogApi = {
  getPublishedBlogs: async (
    params: BlogQueryParams,
  ): Promise<PaginatedResponse<BlogListItem>> => {
    return axiosClient.get<PaginatedResponse<BlogListItem>>("/customer/blogs", { params });
  },

  getBlogById: async (blogPostId: number): Promise<BlogDetail> => {
    return axiosClient.get<BlogDetail>(`/customer/blogs/${blogPostId}`);
  },

  getBlogCategories: async (): Promise<BlogCategoryItem[]> => {
    return axiosClient.get<BlogCategoryItem[]>("/customer/blog-categories");
  },

  getBlogReviews: async (blogPostId: number): Promise<BlogReview[]> => {
    return axiosClient.get<BlogReview[]>(`/customer/blogs/${blogPostId}/reviews`);
  },

  createBlogReview: async (blogPostId: number, comment: string): Promise<BlogReview> => {
    return axiosClient.post<BlogReview, { comment: string }>(`/customer/blogs/${blogPostId}/reviews`, { comment });
  },

  removeBlogReview: async (reviewBlogId: number): Promise<boolean> => {
    return axiosClient.delete<boolean>(`/customer/blog-reviews/${reviewBlogId}`);
  },

  createBlogReviewReply: async (
    reviewBlogId: number,
    payload: { comment: string; parentReplyId?: number | null; replyToAccountId?: number | null },
  ): Promise<BlogReviewReply> => {
    return axiosClient.post<BlogReviewReply, { comment: string; parentReplyId?: number | null; replyToAccountId?: number | null }>(
      `/customer/blog-reviews/${reviewBlogId}/replies`,
      payload,
    );
  },

  reactToBlog: async (blogPostId: number, reactionCode: "like" | "love" | "haha"): Promise<ReactionSummary> => {
    return axiosClient.post<ReactionSummary, { reactionCode: string }>(`/customer/blogs/${blogPostId}/reactions`, { reactionCode });
  },

  removeBlogReaction: async (blogPostId: number): Promise<boolean> => {
    return axiosClient.delete<boolean>(`/customer/blogs/${blogPostId}/reactions`);
  },

  getBlogReactionSummary: async (blogPostId: number): Promise<ReactionSummary> => {
    return axiosClient.get<ReactionSummary>(`/customer/blogs/${blogPostId}/reactions/summary`);
  },

  reactToReview: async (reviewBlogId: number, reactionCode: "like" | "love" | "haha"): Promise<ReactionSummary> => {
    return axiosClient.post<ReactionSummary, { reactionCode: string }>(`/customer/blog-reviews/${reviewBlogId}/reactions`, { reactionCode });
  },

  removeReviewReaction: async (reviewBlogId: number): Promise<boolean> => {
    return axiosClient.delete<boolean>(`/customer/blog-reviews/${reviewBlogId}/reactions`);
  },

  reactToReply: async (replyBlogId: number, reactionCode: "like" | "love" | "haha"): Promise<ReactionSummary> => {
    return axiosClient.post<ReactionSummary, { reactionCode: string }>(`/customer/blog-review-replies/${replyBlogId}/reactions`, { reactionCode });
  },

  removeReplyReaction: async (replyBlogId: number): Promise<boolean> => {
    return axiosClient.delete<boolean>(`/customer/blog-review-replies/${replyBlogId}/reactions`);
  },

  searchBrands: async (
    params: BrandQueryParams,
  ): Promise<PaginatedResponse<BrandListItem>> => {
    return axiosClient.get<PaginatedResponse<BrandListItem>>("/brands", { params });
  },
};
