export interface PaginatedResponse<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface BlogListItem {
  blogPostId: number;
  blogCategoryId: number;
  blogCategoryName: string;
  blogTitle: string;
  blogContent?: string;
  blogThumbnail: string | null;
  status: string;
  isHidden: boolean;
  isFeatured: boolean;
  likeCount: number;
  commentCount: number;
  totalInteraction: number;
  blogAt: string | null;
  author: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface BlogDetail extends BlogListItem {
  blogContent: string;
  reason: string | null;
}

export interface BlogReviewReply {
  replyBlogId: number;
  reviewBlogId: number;
  accountId: number;
  accountName: string;
  accountImageUrl: string | null;
  parentReplyId: number | null;
  replyToAccountId: number | null;
  replyToAccountName: string | null;
  comment: string;
  status: "Visible" | "Hidden";
  createdAt: string;
  updatedAt: string | null;
  replies: BlogReviewReply[];
}

export interface BlogReview {
  reviewBlogId: number;
  blogPostId: number;
  blogTitle: string;
  accountId: number;
  accountName: string;
  accountImageUrl: string | null;
  comment: string;
  status: "Visible" | "Hidden";
  createdAt: string;
  updatedAt: string | null;
  replies: BlogReviewReply[];
}

export interface BlogQueryParams {
  pageNumber: number;
  pageSize: number;
  sortBy?: "blogtitle" | "status" | "blogat" | "createdat" | "updatedat" | "interaction";
  sortDesc?: boolean;
  searchTerm?: string;
}

export interface BrandListItem {
  brandId: number;
  brandName: string;
  status: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface BrandQueryParams {
  pageNumber: number;
  pageSize: number;
  sortBy?: string;
  sortDesc?: boolean;
  searchTerm?: string;
}
