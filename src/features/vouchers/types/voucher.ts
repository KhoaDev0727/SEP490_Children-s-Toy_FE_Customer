export interface IVoucher {
  voucherId: number;
  voucherCode: string;
  voucherName: string;
  discountType: string;
  discountValue: number;
  discountTarget: string;
  startDate: string;
  endDate: string;
  status: string;
  imageUrl: string | null;
  totalQuantity: number | null;
  usedQuantity: number;
  minOrderAmount: number | null;
  voucherDescription: string;
  maxUsagePerUser: number | null;
}

export interface IVoucherResponse {
  items: IVoucher[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}


