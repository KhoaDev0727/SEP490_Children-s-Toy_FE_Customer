import axiosClient from "@/configs/axios-client";
import type { IVoucherResponse } from "../types/voucher";

interface GetVouchersParams {
  pageNumber?: number;
  pageSize?: number;
  status?: string;
  sortBy?: string;
  sortDesc?: boolean;
}

export const voucherApi = {
  getVouchers: async (params: GetVouchersParams): Promise<IVoucherResponse> => {
    return axiosClient.get<IVoucherResponse>("vouchers", { params });
  },
};
