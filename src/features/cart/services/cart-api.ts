import axiosClient from "@/configs/axios-client";
import type {
  AddToCartRequest,
  ApiResponse,
  CartData,
  UpdateQuantityRequest,
} from "@/features/cart/types/cart";


const unwrap = (response: ApiResponse<CartData>): CartData => {
  if (response.success && response.data) {
    return response.data;
  }


  const errorMessage = response.errors?.[0] ?? response.message ?? "Cart operation failed.";
  throw new Error(errorMessage);
};


const extractCartErrorMessage = (
  error: unknown,
  fallbackMessage: string,
  unauthorizedMessage?: string,
): string => {
  if (!error || typeof error !== "object") {
    return fallbackMessage;
  }


  const maybeError = error as {
    message?: string;
    response?: {
      status?: number;
      data?: {
        message?: string;
        errors?: string[] | null;
      };
    };
  };


  if (maybeError.response?.status === 401 && unauthorizedMessage) {
    return unauthorizedMessage;
  }


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


export const cartApi = {
  getMyCart: async (): Promise<CartData> => {
    try {
      const response = await axiosClient.get<ApiResponse<CartData>>("/cart/my-cart", {
        params: { _ts: Date.now() },
      });
      return unwrap(response);
    } catch (error) {
      throw new Error(extractCartErrorMessage(error, "Unable to load cart."));
    }
  },


  addItem: async (payload: AddToCartRequest): Promise<CartData> => {
    try {
      const response = await axiosClient.post<ApiResponse<CartData>, AddToCartRequest>("/cart/items", payload);
      return unwrap(response);
    } catch (error) {
      throw new Error(
        extractCartErrorMessage(
          error,
          "Unable to add item to cart.",
          "You need to log in to add products to your cart.",
        ),
      );
    }
  },


  updateQuantity: async (cartItemId: number, payload: UpdateQuantityRequest): Promise<CartData> => {
    try {
      const response = await axiosClient.put<ApiResponse<CartData>, UpdateQuantityRequest>(
        `/cart/items/${cartItemId}`,
        payload,
      );
      return unwrap(response);
    } catch (error) {
      throw new Error(extractCartErrorMessage(error, "Unable to update cart item quantity."));
    }
  },


  removeItem: async (cartItemId: number): Promise<CartData> => {
    try {
      const response = await axiosClient.delete<ApiResponse<CartData>>(`/cart/items/${cartItemId}`);
      return unwrap(response);
    } catch (error) {
      throw new Error(extractCartErrorMessage(error, "Unable to remove item from cart."));
    }
  },


  clearCart: async (): Promise<CartData> => {
    try {
      const response = await axiosClient.delete<ApiResponse<CartData>>("/cart/clear");
      return unwrap(response);
    } catch (error) {
      throw new Error(extractCartErrorMessage(error, "Unable to clear cart."));
    }
  },
};



