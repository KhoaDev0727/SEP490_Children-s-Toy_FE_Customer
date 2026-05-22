import axios, { AxiosError, AxiosRequestConfig } from "axios";
import toast from "react-hot-toast";

const normalizeApiBaseUrl = (url?: string): string => {
  const fallback = "http://localhost:5216/api";
  if (!url || !url.trim()) return fallback;

  const trimmedUrl = url.trim().replace(/\/+$/, "");
  return trimmedUrl.endsWith("/api") ? trimmedUrl : `${trimmedUrl}/api`;
};

const API_BASE_URL = normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_URL);

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use((config) => {
  if (typeof window === "undefined") return config;

  const token = window.localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && !error.config?.url?.includes("/auth/login")) {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("access_token");
        window.localStorage.removeItem("account_info");
        window.dispatchEvent(new Event("auth:logout"));
      }
      toast.error("Session expired. Please log in again.");
    }
    return Promise.reject(error);
  },
);

type RequestConfig = Omit<AxiosRequestConfig, "url" | "method" | "data">;

const axiosClient = {
  get: async <TResponse>(url: string, config?: RequestConfig): Promise<TResponse> => {
    const response = await axiosInstance.get<TResponse>(url, config);
    return response.data;
  },
  post: async <TResponse, TPayload = unknown>(
    url: string,
    payload?: TPayload,
    config?: RequestConfig,
  ): Promise<TResponse> => {
    const response = await axiosInstance.post<TResponse>(url, payload, config);
    return response.data;
  },
  put: async <TResponse, TPayload = unknown>(
    url: string,
    payload?: TPayload,
    config?: RequestConfig,
  ): Promise<TResponse> => {
    const response = await axiosInstance.put<TResponse>(url, payload, config);
    return response.data;
  },
  patch: async <TResponse, TPayload = unknown>(
    url: string,
    payload?: TPayload,
    config?: RequestConfig,
  ): Promise<TResponse> => {
    const response = await axiosInstance.patch<TResponse>(url, payload, config);
    return response.data;
  },
  delete: async <TResponse>(url: string, config?: RequestConfig): Promise<TResponse> => {
    const response = await axiosInstance.delete<TResponse>(url, config);
    return response.data;
  },
};

export default axiosClient;
