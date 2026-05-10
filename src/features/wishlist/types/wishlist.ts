export interface WishlistItem {
  productId: number;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[] | null;
}
