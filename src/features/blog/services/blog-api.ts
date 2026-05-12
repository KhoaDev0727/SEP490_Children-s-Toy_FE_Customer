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
    return axiosClient.get<PaginatedResponse<BlogListItem>>("/blogs/search", { params });
  },

  getBlogById: async (blogPostId: number): Promise<BlogDetail> => {
    return axiosClient.get<BlogDetail>(`/blogs/${blogPostId}`);
  },

  getBlogCategories: async (): Promise<BlogCategoryItem[]> => {
    return axiosClient.get<BlogCategoryItem[]>("/blogs/categories");
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

  reactToBlog: async (blogPostId: number, reactionCode: "like" | "love" | "haha"): Promise<ReactionSummary> => {
    return axiosClient.post<ReactionSummary, { reactionCode: string }>(`/blogs/${blogPostId}/reactions`, { reactionCode });
  },

  removeBlogReaction: async (blogPostId: number): Promise<boolean> => {
    return axiosClient.delete<boolean>(`/blogs/${blogPostId}/reactions`);
  },

  getBlogReactionSummary: async (blogPostId: number): Promise<ReactionSummary> => {
    return axiosClient.get<ReactionSummary>(`/blogs/${blogPostId}/reactions/summary`);
  },

  reactToReview: async (reviewBlogId: number, reactionCode: "like" | "love" | "haha"): Promise<ReactionSummary> => {
    return axiosClient.post<ReactionSummary, { reactionCode: string }>(`/blogs/reviews/${reviewBlogId}/reactions`, { reactionCode });
  },

  removeReviewReaction: async (reviewBlogId: number): Promise<boolean> => {
    return axiosClient.delete<boolean>(`/blogs/reviews/${reviewBlogId}/reactions`);
  },

  reactToReply: async (replyBlogId: number, reactionCode: "like" | "love" | "haha"): Promise<ReactionSummary> => {
    return axiosClient.post<ReactionSummary, { reactionCode: string }>(`/blogs/reviews/replies/${replyBlogId}/reactions`, { reactionCode });
  },

  removeReplyReaction: async (replyBlogId: number): Promise<boolean> => {
    return axiosClient.delete<boolean>(`/blogs/reviews/replies/${replyBlogId}/reactions`);
  },

  searchBrands: async (
    params: BrandQueryParams,
  ): Promise<PaginatedResponse<BrandListItem>> => {
    return axiosClient.get<PaginatedResponse<BrandListItem>>("/brands", { params });
  },
};
