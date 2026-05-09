import axiosClient from "@/configs/axios-client";
import type { ApiResponse, WishlistItem } from "@/features/wishlist/types/wishlist";

const unwrapData = <T>(response: ApiResponse<T>, fallbackMessage: string): T => {
  if (response.success && response.data !== undefined) {
    return response.data;
  }

  const errorMessage = response.errors?.[0] ?? response.message ?? fallbackMessage;
  throw new Error(errorMessage);
};

const ensureSuccess = (response: ApiResponse<unknown>, fallbackMessage: string): void => {
  if (response.success) {
    return;
  }

  const errorMessage = response.errors?.[0] ?? response.message ?? fallbackMessage;
  throw new Error(errorMessage);
};

const extractWishlistErrorMessage = (error: unknown, fallbackMessage: string): string => {
  if (!error || typeof error !== "object") {
    return fallbackMessage;
  }

  const maybeError = error as {
    message?: string;
    response?: {
      data?: {
        message?: string;
        errors?: string[] | null;
      };
    };
  };

  const apiError = maybeError.response?.data?.errors?.[0];
  const apiMessage = maybeError.response?.data?.message;

  if (typeof apiError === "string" && apiError.trim()) {
    return apiError;
  }

  if (typeof apiMessage === "string" && apiMessage.trim()) {
    return apiMessage;
  }

  if (typeof maybeError.message === "string" && maybeError.message.trim()) {
    return maybeError.message;
  }

  return fallbackMessage;
};

export const wishlistApi = {
  getMyWishlist: async (): Promise<WishlistItem[]> => {
    try {
      const response = await axiosClient.get<ApiResponse<WishlistItem[]>>("/wishlist/my-wishlist");
      return unwrapData(response, "Unable to load wishlist.");
    } catch (error) {
      throw new Error(extractWishlistErrorMessage(error, "Unable to load wishlist."));
    }
  },

  addItem: async (productId: number): Promise<void> => {
    try {
      const response = await axiosClient.post<ApiResponse<unknown>, { productId: number }>(
        "/wishlist/items",
        { productId },
      );
      ensureSuccess(response, "Unable to add item to wishlist.");
    } catch (error) {
      throw new Error(extractWishlistErrorMessage(error, "Unable to add item to wishlist."));
    }
  },

  removeItem: async (productId: number): Promise<void> => {
    try {
      const response = await axiosClient.delete<ApiResponse<unknown>>(`/wishlist/items/${productId}`);
      ensureSuccess(response, "Unable to remove item from wishlist.");
    } catch (error) {
      throw new Error(extractWishlistErrorMessage(error, "Unable to remove item from wishlist."));
    }
  },
};
