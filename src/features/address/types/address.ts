export interface AddressItem {
  addressId: number;
  recipientName: string | null;
  phoneNumber: string | null;
  addressLine: string;
  wardCode: string | null;
  wardName: string | null;
  districtId: number | null;
  districtName: string | null;
  provinceId: number | null;
  provinceName: string | null;
  isDefault: boolean;
  createdAt: string;
}

export interface CreateAddressRequest {
  recipientName: string;
  phoneNumber: string;
  addressLine: string;
  wardCode: string;
  districtId: number;
  provinceId: number;
  isDefault: boolean;
}

export interface UpdateAddressRequest {
  recipientName?: string;
  phoneNumber?: string;
  addressLine?: string;
  wardCode?: string;
  districtId?: number;
  provinceId?: number;
  isDefault?: boolean;
}

export interface ProvinceOption {
  provinceId: number;
  provinceName: string;
}

export interface DistrictOption {
  districtId: number;
  provinceId: number;
  districtName: string;
}

export interface WardOption {
  wardCode: string;
  districtId: number;
  wardName: string;
}
