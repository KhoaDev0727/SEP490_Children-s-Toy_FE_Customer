export interface SendRegisterOtpRequest {
  email: string;
}

export interface RegisterRequest {
  accountName: string;
  email: string;
  password: string;
  confirmPassword: string;
  otpCode: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  otpCode: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AccountInfo {
  accountId: number;
  accountName: string;
  email: string;
  imageUrl?: string;
  phoneNumber?: string | null;
  dob?: string | null;
  sexId?: number | null;
  sexName?: string | null;
  provider?: string | null;
  roleId: number;
  roleName: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  account: AccountInfo;
}

export interface GoogleLoginRequest {
  idToken: string;
  roleId?: number;
}

export interface GoogleRegisterRequest {
  idToken: string;
}
