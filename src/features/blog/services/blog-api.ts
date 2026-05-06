import axiosClient from "@/configs/axios-client";
import {
  BlogDetail,
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

  searchBrands: async (
    params: BrandQueryParams,
  ): Promise<PaginatedResponse<BrandListItem>> => {
    return axiosClient.get<PaginatedResponse<BrandListItem>>("/brands", { params });
  },
};
