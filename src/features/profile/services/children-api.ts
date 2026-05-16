import axiosClient from "@/configs/axios-client";
import type { Child, CreateChildPayload, UpdateChildPayload } from "../types/children";

const CHILDREN_ENDPOINT = "/customer/children";

export const childrenApi = {
  getMyChildren: async (): Promise<Child[]> => {
    return axiosClient.get<Child[]>(CHILDREN_ENDPOINT);
  },

  createChild: async (payload: CreateChildPayload): Promise<Child> => {
    return axiosClient.post<Child, CreateChildPayload>(CHILDREN_ENDPOINT, payload);
  },

  updateChild: async (id: number, payload: UpdateChildPayload): Promise<Child> => {
    return axiosClient.put<Child, UpdateChildPayload>(`${CHILDREN_ENDPOINT}/${id}`, payload);
  },

  deleteChild: async (id: number): Promise<void> => {
    return axiosClient.delete<void>(`${CHILDREN_ENDPOINT}/${id}`);
  },
};
