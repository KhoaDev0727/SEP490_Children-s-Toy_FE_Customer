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
  loveCount: number;
  hahaCount: number;
  commentCount: number;
  totalInteraction: number;
  currentUserReaction?: string | null;
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
  likeCount: number;
  loveCount: number;
  hahaCount: number;
  currentUserReaction?: string | null;
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
  likeCount: number;
  loveCount: number;
  hahaCount: number;
  currentUserReaction?: string | null;
  createdAt: string;
  updatedAt: string | null;
  replies: BlogReviewReply[];
}

export interface ReactionSummary {
  likeCount: number;
  loveCount: number;
  hahaCount: number;
  totalCount: number;
  currentUserReaction?: string | null;
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
