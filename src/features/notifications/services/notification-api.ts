import axiosClient from "@/configs/axios-client";

export interface Delivery {
  deliveryId: number;
  notificationType: string;
  title: string;
  message: string;
  status: string;
  imageUrl?: string;
  actionType?: string;
  actionTarget?: string;
  createdAt: string;
  readAt?: string;
}

export interface PaginatedDeliveries {
  items: Delivery[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const notificationApi = {
  getNotifications: async (page = 1, pageSize = 10, status?: string) => {
    const res = await axiosClient.get<ApiResponse<PaginatedDeliveries>>("/notifications", {
      params: { page, pageSize, status },
    });
    return res.data;
  },
  getUnreadCount: async () => {
    const res = await axiosClient.get<ApiResponse<number>>("/notifications/unread-count");
    return res.data;
  },
  markAsRead: async (deliveryId: number) => {
    return await axiosClient.patch<void>(`/notifications/${deliveryId}/read`);
  },
  markAllAsRead: async () => {
    return await axiosClient.patch<void>("/notifications/mark-all-read");
  },
  recordClick: async (deliveryId: number) => {
    return await axiosClient.post<void>(`/notifications/${deliveryId}/click`);
  },
};
