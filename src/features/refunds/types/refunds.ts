export interface PaginatedResponse<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  errors?: string[] | null;
}

export interface RefundReason {
  refundReasonId: number;
  content: string;
  description?: string | null;
}

export interface RefundListItem {
  refundId: number;
  orderId: number;
  orderCode: string;
  orderStatus: string;
  paymentStatus: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  refundReasonContent?: string | null;
  requestedByName?: string | null;
  approvedAmount: number;
  refundStatus: string;
  createdAt: string;
}

export interface RefundDetail {
  refundId: number;
  orderId: number;
  orderCode: string;
  orderStatus: string;
  paymentStatus: string;
  refundReasonId?: number | null;
  refundReasonContent?: string | null;
  customerId: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  requestedByName?: string | null;
  requestedBy?: number | null;
  approvedBy?: number | null;
  reasonDetails?: string | null;
  approvedAmount: number;
  refundStatus: string;
  createdAt: string;
  updatedAt?: string | null;
  images: string[];
}

export interface CreateRefundRequest {
  orderId: number;
  refundReasonId: number;
  reasonDetails?: string;
  images?: string[];
}

export interface RefundFilterQuery {
  refundStatus?: string;
  orderId?: number;
  fromDate?: string;
  toDate?: string;
  page?: number;
  pageSize?: number;
}

export type RefundStatus =
  | "Requested"
  | "Approved"
  | "Rejected"
  | "Completed"
  | "Cancelled";
