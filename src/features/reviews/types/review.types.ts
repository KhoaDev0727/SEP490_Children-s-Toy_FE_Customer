export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface ReviewImageDto {
  reviewProductImageId: number;
  imageUrl: string;
}

export interface StaffReplyDto {
  replyProductId: number;
  staffId: number;
  staffName: string;
  content: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface MyReviewDto {
  reviewId: number;
  productId: number;
  productName: string;
  productImage: string | null;
  orderId: number;
  orderCode: string;
  rating: number;
  comment: string | null;
  moderationStatus: string;
  isEdited: boolean;
  createdAt: string;
  moderatedAt: string | null;
  images: ReviewImageDto[];
  replies: StaffReplyDto[];
}

export interface UnreviewedProductDto {
  productId: number;
  productName: string;
  productImage: string | null;
  orderId: number;
  orderCode: string;
  completedAt: string | null;
  remainingDays: number;
}

export interface ReviewProductListDto {
  reviewId: number;
  accountId: number;
  accountName: string;
  rating: number;
  comment: string | null;
  isEdited: boolean;
  createdAt: string;
  images: ReviewImageDto[];
  replies: StaffReplyDto[];
}

export interface ReviewQueryDto {
  productId: number;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortDesc?: boolean;
  rating?: number;
  hasImage?: boolean;
  searchTerm?: string;
}

export interface MyReviewQueryDto {
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortDesc?: boolean;
  moderationStatus?: string;
}
