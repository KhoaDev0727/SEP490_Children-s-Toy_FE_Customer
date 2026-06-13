import axiosClient from "@/configs/axios-client";
import type {
  AccountInfo,
  AuthResponse,
  ForgotPasswordRequest,
  GoogleLoginRequest,
  GoogleRegisterRequest,
  LoginRequest,
  RequestRegisterOtpRequest,
  RegisterRequest,
  ResetPasswordRequest,
  SendRegisterOtpRequest,
  VerifyRegisterOtpRequest,
} from "../types/auth";

export const authApi = {
  sendRegisterOtp: async (payload: SendRegisterOtpRequest): Promise<void> => {
    return axiosClient.post<void, SendRegisterOtpRequest>("/auth/send-register-otp", payload);
  },

  requestRegisterOtp: async (payload: RequestRegisterOtpRequest): Promise<void> => {
    return axiosClient.post<void, RequestRegisterOtpRequest>("/auth/register/request-otp", payload);
  },

  resendRegisterOtp: async (payload: SendRegisterOtpRequest): Promise<void> => {
    return axiosClient.post<void, SendRegisterOtpRequest>("/auth/register/resend-otp", payload);
  },

  verifyRegisterOtp: async (payload: VerifyRegisterOtpRequest): Promise<AuthResponse> => {
    return axiosClient.post<AuthResponse, VerifyRegisterOtpRequest>("/auth/register/verify-otp", payload);
  },

  register: async (payload: RegisterRequest): Promise<AccountInfo> => {
    return axiosClient.post<AccountInfo, RegisterRequest>("/auth/register", payload);
  },

  login: async (payload: LoginRequest): Promise<AuthResponse> => {
    return axiosClient.post<AuthResponse, LoginRequest>("/auth/login", {
      ...payload,
      roleId: 1,
    });
  },

  forgotPassword: async (payload: ForgotPasswordRequest): Promise<void> => {
    return axiosClient.post<void, ForgotPasswordRequest>("/auth/forgot-password", payload);
  },

  resetPassword: async (payload: ResetPasswordRequest): Promise<void> => {
    return axiosClient.post<void, ResetPasswordRequest>("/auth/reset-password", payload);
  },

  logout: async (): Promise<void> => {
    return axiosClient.post<void>("/auth/logout");
  },

  googleLogin: async (payload: GoogleLoginRequest): Promise<AuthResponse> => {
    return axiosClient.post<AuthResponse, GoogleLoginRequest>("/auth/google-login", payload);
  },

  googleRegister: async (payload: GoogleRegisterRequest): Promise<AuthResponse> => {
    return axiosClient.post<AuthResponse, GoogleRegisterRequest>("/auth/google-register", payload);
  },
};
