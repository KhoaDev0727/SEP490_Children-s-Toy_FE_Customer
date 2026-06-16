export interface CustomerProfile {
  accountId?: number;
  accountName: string;
  email: string;
  phoneNumber: string | null;
  imageUrl: string | null;
  dob: string | null;
  sexId: number | null;
  sexName: string | null;
  provider: string | null;
  hasPassword: boolean;
}

export interface UpdateCustomerProfilePayload {
  accountName?: string | null;
  phoneNumber?: string | null;
  imageUrl?: string | null;
  dob?: string | null;
  sexId?: number | null;
}

export interface UploadAvatarResponse {
  url: string;
}

export interface ChangeCustomerPasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}
