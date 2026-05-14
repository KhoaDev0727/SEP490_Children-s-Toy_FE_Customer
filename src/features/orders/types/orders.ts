export interface PaginatedResponse<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface CustomerOrderListItemProduct {
  productName: string;
  productImage?: string | null;
  categoryName?: string | null;
  quantity: number;
  unitPrice: number;
  variant?: string | null;
}

export interface CustomerOrderListItem {
  orderId: number;
  orderCode: string;
  statusName: string;
  orderDate: string;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  totalItems: number;
  item?: CustomerOrderListItemProduct | null;
}

export interface CustomerOrderDetailItem {
  orderDetailId: number;
  productId: number;
  productName: string;
  productImage?: string | null;
  categoryName?: string | null;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  lineTotal?: number | null;
  variant?: string | null;
}

export interface CustomerOrderStatusHistory {
  statusName: string;
  changedByName?: string | null;
  note?: string | null;
  createdAt: string;
}

export interface CustomerShippingTransaction {
  provider: string;
  trackingNumber?: string | null;
  providerOrderCode?: string | null;
  status?: string | null;
  shippingFee?: number | null;
  estimatedDelivery?: string | null;
}

export interface CustomerOrderDetail {
  orderId: number;
  orderCode: string;
  statusName: string;
  orderDate: string;
  confirmedAt?: string | null;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  completedAt?: string | null;
  cancelledAt?: string | null;
  cancelReason?: string | null;
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingWardName: string;
  shippingDistrictName: string;
  shippingProvinceName: string;
  items: CustomerOrderDetailItem[];
  subTotal: number;
  voucherDiscountAmount: number;
  estimatedShippingFee: number;
  actualShippingFee?: number | null;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  paidAt?: string | null;
  statusHistory: CustomerOrderStatusHistory[];
  shipping?: CustomerShippingTransaction | null;
}

export interface CustomerOrderListQuery {
  status?: string;
  keyword?: string;
  fromDate?: string;
  toDate?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  errors?: string[] | null;
}
