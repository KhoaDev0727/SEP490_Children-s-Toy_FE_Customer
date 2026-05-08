import axiosClient from "@/configs/axios-client";
import type { AxiosError } from "axios";
import type {
  ChangeCustomerPasswordPayload,
  CustomerProfile,
  UpdateCustomerProfilePayload,
  UploadAvatarResponse,
} from "../types/profile";

const PROFILE_ENDPOINTS = ["/customer/profiles/me", "/profiles/me"] as const;
const AVATAR_ENDPOINTS = ["/customer/profiles/me/avatar", "/profiles/me/avatar"] as const;
const PASSWORD_ENDPOINTS = ["/customer/profiles/me/password", "/profiles/me/password"] as const;

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

       const status = (error as AxiosError)?.response?.status;
       // Only fallback when endpoint is not available; keep business/auth errors from the primary endpoint.
       if (status !== 404 && status !== 405) {
         throw error;
       }
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
    await requestWithFallback(PROFILE_ENDPOINTS, (endpoint) =>
      axiosClient.put<unknown, UpdateCustomerProfilePayload>(endpoint, payload),
    );
    return requestWithFallback(PROFILE_ENDPOINTS, (endpoint) =>
      axiosClient.get<CustomerProfile>(endpoint),
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

  changeMyPassword: async (payload: ChangeCustomerPasswordPayload): Promise<void> => {
    await requestWithFallback(PASSWORD_ENDPOINTS, (endpoint) =>
      axiosClient.put<unknown, ChangeCustomerPasswordPayload>(endpoint, payload),
    );
  },
};
