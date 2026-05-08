import axiosClient from "@/configs/axios-client";
import type {
  CustomerProfile,
  UpdateCustomerProfilePayload,
  UploadAvatarResponse,
} from "../types/profile";

const PROFILE_ENDPOINTS = ["/customer/profiles/me", "/profiles/me"] as const;
const AVATAR_ENDPOINTS = ["/customer/profiles/me/avatar", "/profiles/me/avatar"] as const;

const requestWithFallback = async <TResponse>(
  endpoints: readonly string[],
  request: (endpoint: string) => Promise<TResponse>,
): Promise<TResponse> => {
  let lastError: unknown;

  for (const endpoint of endpoints) {
    try {
      return await request(endpoint);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
};

export const profileApi = {
  getMyProfile: async (): Promise<CustomerProfile> => {
    return requestWithFallback(PROFILE_ENDPOINTS, (endpoint) =>
      axiosClient.get<CustomerProfile>(endpoint),
    );
  },

  updateMyProfile: async (payload: UpdateCustomerProfilePayload): Promise<CustomerProfile> => {
    return requestWithFallback(PROFILE_ENDPOINTS, (endpoint) =>
      axiosClient.put<CustomerProfile, UpdateCustomerProfilePayload>(endpoint, payload),
    );
  },

  uploadAvatar: async (file: File): Promise<UploadAvatarResponse> => {
    const formData = new FormData();
    formData.append("file", file);

    return requestWithFallback(AVATAR_ENDPOINTS, (endpoint) =>
      axiosClient.post<UploadAvatarResponse, FormData>(endpoint, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }),
    );
  },
};
