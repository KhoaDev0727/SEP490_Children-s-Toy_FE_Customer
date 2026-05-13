"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { authApi } from "@/features/auth/services/auth-api";
import { useAuthContext } from "@/context/AuthContext";
import GoogleAuthButton from "./GoogleAuthButton";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

const registerSchema = z.object({
  accountName: z.string().min(1, "Account name is required").max(100, "Max 100 characters"),
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z
    .string()
    .min(8, "At least 8 characters")
    .regex(/[A-Z]/, "Must include at least one uppercase letter")
    .regex(/[a-z]/, "Must include at least one lowercase letter")
    .regex(/[0-9]/, "Must include at least one number")
    .regex(/[^a-zA-Z0-9]/, "Must include at least one special character"),
  confirmPassword: z.string().min(1, "Confirm password is required"),
  otpCode: z
    .string()
    .min(1, "OTP code is required")
    .length(6, "OTP code must be 6 digits")
    .regex(/^\d{6}$/, "OTP code must contain only digits"),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const CUSTOMER_ROLE_ID = 1;

export default function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const { setAuth } = useAuthContext();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  const emailValue = watch("email");

  const handleSendOtp = async () => {
    if (!emailValue || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
      toast.error("Please enter a valid email first.");
      return;
    }
    setIsSendingOtp(true);
    try {
      await authApi.sendRegisterOtp({ email: emailValue });
      setOtpSent(true);
      toast.success("OTP has been sent to your email.");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message ?? "Unable to send OTP. Please try again.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const onSubmit = async (data: RegisterFormValues) => {
    setIsRegistering(true);
    try {
      await authApi.register(data);
      const loginResponse = await authApi.login({
        email: data.email,
        password: data.password,
      });
      if (loginResponse.account.roleId === CUSTOMER_ROLE_ID) {
        setAuth(loginResponse.account, loginResponse.accessToken);
        toast.success(`Welcome, ${loginResponse.account.accountName}! Registration successful.`);
        router.push("/");
      } else {
        toast.success("Registration successful! Please sign in.");
        router.push("/login");
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { code?: string; message?: string } } };
      const code = err?.response?.data?.code;
      if (code === "OTP_EXPIRED") {
        setOtpSent(false);
        toast.error("OTP has expired. Please click 'Send OTP' to get a new code.");
      } else if (code === "OTP_INVALID") {
        toast.error("Invalid OTP. Please check your email.");
      } else if (code === "CONFLICT") {
        toast.error("This email is already registered. Please use another email.");
      } else {
        toast.error(err?.response?.data?.message ?? "Registration failed. Please try again.");
      }
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 w-full overflow-y-auto">
      <div className="w-full max-w-md sm:pt-10 mx-auto lg:mx-0 mb-5 px-6 lg:px-10">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-1">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Back to home
        </Link>
      </div>

      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto lg:mx-0 px-6 lg:px-10 pb-10">
        <div>
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-2xl font-bold" style={{ color: "#ff6a00" }}>ToyStore</span>
            </div>
            <h1 className="mb-2 font-semibold text-gray-800 text-3xl">
              Create account
            </h1>
            <p className="text-sm text-gray-500">
              Fill in the details below to create a new account.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="space-y-5">
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700" htmlFor="accountName">
                  Account name <span className="text-red-500">*</span>
                </label>
                <input
                  id="accountName"
                  type="text"
                  placeholder="John Doe"
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  {...register("accountName")}
                />
                {errors.accountName && (
                  <p className="mt-1.5 text-xs text-red-500">{errors.accountName.message}</p>
                )}
              </div>

              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700" htmlFor="reg-email">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    id="reg-email"
                    type="email"
                    placeholder="example@email.com"
                    className="h-11 flex-1 min-w-0 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                    {...register("email")}
                  />
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={isSendingOtp}
                    className="h-11 shrink-0 rounded-lg border px-4 text-sm font-medium transition disabled:opacity-50"
                    style={{
                      borderColor: "#ff6a00",
                      color: otpSent ? "#fff" : "#ff6a00",
                      background: otpSent ? "#ff6a00" : "transparent",
                    }}
                  >
                    {isSendingOtp ? "Sending..." : otpSent ? "Resend" : "Send OTP"}
                  </button>
                </div>
                {errors.email && (
                  <p className="mt-1.5 text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700" htmlFor="otpCode">
                  OTP code <span className="text-red-500">*</span>
                </label>
                <input
                  id="otpCode"
                  type="text"
                  placeholder="Enter the 6-digit code from your email"
                  maxLength={6}
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  {...register("otpCode")}
                />
                {errors.otpCode && (
                  <p className="mt-1.5 text-xs text-red-500">{errors.otpCode.message}</p>
                )}
              </div>

              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700" htmlFor="reg-password">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="reg-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 8 characters"
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-12 text-sm text-gray-800 placeholder-gray-400 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-xs text-red-500">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700" htmlFor="confirmPassword">
                  Confirm password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Re-enter password"
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-12 text-sm text-gray-800 placeholder-gray-400 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                    {...register("confirmPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirm ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1.5 text-xs text-red-500">{errors.confirmPassword.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isRegistering}
                className="flex w-full items-center justify-center rounded-lg px-4 py-3 text-sm font-medium text-white transition disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, #ff6a00, #ff9a3c)" }}
              >
                {isRegistering ? "Creating account..." : "Sign up"}
              </button>

              <div className="relative flex items-center justify-center my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative bg-white px-4 text-xs text-gray-500">
                  Or sign up with
                </div>
              </div>

              <GoogleAuthButton mode="register" />
            </div>
          </form>

          <div className="mt-6 pb-6">
            <p className="text-sm text-center text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="font-medium hover:underline" style={{ color: "#ff6a00" }}>
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
