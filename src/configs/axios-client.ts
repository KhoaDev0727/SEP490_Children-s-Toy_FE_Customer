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

type UnauthorizedResponse = {
  code?: string;
  errorCode?: string;
  message?: string;
};

let isHandlingUnauthorized = false;

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
      if (isHandlingUnauthorized) {
        return Promise.reject(error);
      }

      isHandlingUnauthorized = true;

      const responseData = error.response.data as UnauthorizedResponse | undefined;
      const isAccountLocked =
        responseData?.code === "ACCOUNT_LOCKED" || responseData?.errorCode === "ACCOUNT_LOCKED";

      if (typeof window !== "undefined") {
        window.localStorage.removeItem("access_token");
        window.localStorage.removeItem("account_info");
        window.dispatchEvent(new Event("auth:logout"));

        if (window.location.pathname !== "/login") {
          window.location.assign("/login");
        }
      }
      toast.error(
        isAccountLocked
          ? "Your account has been locked. Please contact support for assistance."
          : "Session expired. Please login again.",
      );
    }
    return Promise.reject(error);
  },
);

type RequestConfig = Omit<AxiosRequestConfig, "url" | "method" | "data">;

const activeGetRequests = new Map<string, Promise<any>>();

const axiosClient = {
  get: async <TResponse>(url: string, config?: RequestConfig): Promise<TResponse> => {
    const key = JSON.stringify({ url, params: config?.params });

    if (activeGetRequests.has(key)) {
      return activeGetRequests.get(key) as Promise<TResponse>;
    }

    const promise = (async () => {
      const response = await axiosInstance.get<TResponse>(url, config);
      return response.data;
    })();

    activeGetRequests.set(key, promise);

    try {
      return await promise;
    } finally {
      activeGetRequests.delete(key);
    }
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
