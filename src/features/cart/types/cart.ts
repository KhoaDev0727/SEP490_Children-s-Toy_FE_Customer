export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  errors?: string[] | null;
}

export const CART_MAX_SUBTOTAL = 100_000_000;
export const CART_MAX_SUBTOTAL_ERROR_MESSAGE = "Cart total cannot exceed 100,000,000 VND.";

export interface CartItem {
  cartItemId: number;
  productId: number;
  productName: string;
  productStatus: string;
  mainImageUrl?: string | null;
  quantity: number;
  stockQuantity: number;
  priceAtThatTime: number;
  currentPrice: number;
  lineTotal: number;
  isSelected: boolean;
  addedAt: string;
  updatedAt?: string | null;
  warningMessage?: string | null;
}

export interface CartData {
  cartId: number;
  accountId: number;
  totalItem: number;
  totalQuantity: number;
  subTotal: number;
  items: CartItem[];
}

export interface AddToCartRequest {
  productId: number;
  quantity: number;
}

export interface UpdateQuantityRequest {
  quantity: number;
}

export interface CartRealtimeEnvelope {
  success: boolean;
  message: string;
  data: CartData | null;
  errors?: string[] | null;
  eventName?: string;
  payload?: unknown;
  serverTime?: string;
}
