import axiosClient from "@/configs/axios-client";
import type {
  AddressItem,
  CreateAddressRequest,
  DistrictOption,
  ProvinceOption,
  UpdateAddressRequest,
  WardOption,
} from "../types/address";

export const addressApi = {
  getMyAddresses: async (): Promise<AddressItem[]> => {
    return axiosClient.get<AddressItem[]>("/addresses");
  },
  createAddress: async (payload: CreateAddressRequest): Promise<AddressItem> => {
    return axiosClient.post<AddressItem, CreateAddressRequest>("/addresses", payload);
  },
  updateAddress: async (addressId: number, payload: UpdateAddressRequest): Promise<AddressItem> => {
    return axiosClient.put<AddressItem, UpdateAddressRequest>(`/addresses/${addressId}`, payload);
  },
  deleteAddress: async (addressId: number): Promise<void> => {
    return axiosClient.delete<void>(`/addresses/${addressId}`);
  },
  getProvinces: async (): Promise<ProvinceOption[]> => {
    return axiosClient.get<ProvinceOption[]>("/locations/provinces");
  },
  getDistricts: async (provinceId: number): Promise<DistrictOption[]> => {
    return axiosClient.get<DistrictOption[]>(`/locations/districts?provinceId=${provinceId}`);
  },
  getWards: async (districtId: number): Promise<WardOption[]> => {
    return axiosClient.get<WardOption[]>(`/locations/wards?districtId=${districtId}`);
  },
};
