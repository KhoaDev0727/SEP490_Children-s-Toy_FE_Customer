import axiosClient from "@/configs/axios-client";
import type { AxiosError } from "axios";
import type {
  CustomerNotificationPreferences,
  UpdateCustomerNotificationPreferencesPayload,
} from "../types/notification-preferences";

const NOTIFICATION_PREFERENCES_ENDPOINTS = [
  "/customer/profiles/me/notification-preferences",
  "/profiles/me/notification-preferences",
] as const;

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
      if (status !== 404 && status !== 405) {
        throw error;
      }
    }
  }

  throw lastError;
};

export const notificationPreferencesApi = {
  getMy: async (): Promise<CustomerNotificationPreferences> => {
    return requestWithFallback(NOTIFICATION_PREFERENCES_ENDPOINTS, (endpoint) =>
      axiosClient.get<CustomerNotificationPreferences>(endpoint),
    );
  },

  updateMy: async (
    payload: UpdateCustomerNotificationPreferencesPayload,
  ): Promise<CustomerNotificationPreferences> => {
    return requestWithFallback(NOTIFICATION_PREFERENCES_ENDPOINTS, (endpoint) =>
      axiosClient.put<CustomerNotificationPreferences, UpdateCustomerNotificationPreferencesPayload>(
        endpoint,
        payload,
      ),
    );
  },
};
