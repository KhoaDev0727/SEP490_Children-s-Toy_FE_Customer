import axiosClient from "@/configs/axios-client";

export interface FollowResponse {
  success: boolean;
  message: string;
  data?: any;
  errors?: string[];
}

export const followApi = {
  followProduct: async (productId: number): Promise<void> => {
    await axiosClient.post(`/product-followers/follow/${productId}`);
  },

  unfollowProduct: async (productId: number): Promise<void> => {
    await axiosClient.delete(`/product-followers/unfollow/${productId}`);
  },

  isFollowing: async (productId: number): Promise<boolean> => {
    const response = await axiosClient.get<{ data: boolean }>(`/product-followers/is-following/${productId}`);
    return response.data;
  },

  getMyFollows: async (): Promise<number[]> => {
    const response = await axiosClient.get<{ data: number[] }>("/product-followers/my-follows");
    return response.data;
  },
};
