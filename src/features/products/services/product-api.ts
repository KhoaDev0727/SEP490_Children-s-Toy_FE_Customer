import axiosClient from "@/configs/axios-client";
import {
  PaginatedResponse,
  ProductDetail,
  ProductList,
  ProductLookups,
} from "@/features/products/types/product";

export interface ProductQuery {
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortDesc?: boolean;
  searchTerm?: string;
  superCategoryId?: number;
  categoryId?: number;
  categoryIds?: number[];
  brandIds?: number[];
  priceRangeIds?: number[];
  materialIds?: number[];
  ageIds?: number[];
  sexIds?: number[];
  originIds?: number[];
  rating?: number;
  status?: string;
}

const buildQueryString = (params: ProductQuery): string => {
  const query = new URLSearchParams();

  if (params.pageNumber) query.append("pageNumber", params.pageNumber.toString());
  if (params.pageSize) query.append("pageSize", params.pageSize.toString());
  if (params.sortBy) query.append("sortBy", params.sortBy);
  if (params.sortDesc !== undefined) query.append("sortDesc", String(params.sortDesc));
  if (params.searchTerm) query.append("searchTerm", params.searchTerm);
  if (params.superCategoryId) query.append("superCategoryId", params.superCategoryId.toString());
  if (params.categoryId) query.append("categoryId", params.categoryId.toString());
  params.categoryIds?.forEach((value) => query.append("categoryIds", value.toString()));
  params.brandIds?.forEach((value) => query.append("brandIds", value.toString()));
  params.priceRangeIds?.forEach((value) => query.append("priceRangeIds", value.toString()));
  params.materialIds?.forEach((value) => query.append("materialIds", value.toString()));
  params.ageIds?.forEach((value) => query.append("ageIds", value.toString()));
  params.sexIds?.forEach((value) => query.append("sexIds", value.toString()));
  params.originIds?.forEach((value) => query.append("originIds", value.toString()));
  if (params.rating) query.append("rating", params.rating.toString());
  if (params.status) query.append("status", params.status);

  const queryString = query.toString();
  return queryString ? `?${queryString}` : "";
};

export const productApi = {
  getProducts: async (params: ProductQuery): Promise<PaginatedResponse<ProductList>> => {
    const queryString = buildQueryString(params);
    return axiosClient.get<PaginatedResponse<ProductList>>(`/products${queryString}`);
  },
  getProductById: async (productId: number): Promise<ProductDetail> => {
    return axiosClient.get<ProductDetail>(`/products/${productId}`);
  },
  getLookups: async (): Promise<ProductLookups> => {
    return axiosClient.get<ProductLookups>("/products/lookups");
  },
};
