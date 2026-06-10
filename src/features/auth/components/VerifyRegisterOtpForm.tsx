"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthContext } from "@/context/AuthContext";
import { authApi } from "@/features/auth/services/auth-api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

const verifyRegisterOtpSchema = z.object({
  otpCode: z
    .string()
    .min(1, "OTP code is required")
    .length(6, "OTP code must be 6 digits")
    .regex(/^\d{6}$/, "OTP code must contain only digits"),
});

type VerifyRegisterOtpValues = z.infer<typeof verifyRegisterOtpSchema>;

const CUSTOMER_ROLE_ID = 1;

interface VerifyRegisterOtpFormProps {
  email: string;
}

export default function VerifyRegisterOtpForm({ email }: VerifyRegisterOtpFormProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isResendingOtp, setIsResendingOtp] = useState(false);
  const { setAuth } = useAuthContext();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyRegisterOtpValues>({ resolver: zodResolver(verifyRegisterOtpSchema) });

  useEffect(() => {
    if (!email) {
      toast.error("Please complete the registration form first.");
      router.replace("/register");
    }
  }, [email, router]);

  const handleResendOtp = async () => {
    if (!email) return;

    setIsResendingOtp(true);
    try {
      await authApi.resendRegisterOtp({ email });
      toast.success("OTP has been sent to your email.");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { code?: string; message?: string } } };
      if (err?.response?.data?.code === "OTP_EXPIRED") {
        toast.error("Registration session expired. Please sign up again.");
        router.replace("/register");
      } else {
        toast.error(err?.response?.data?.message ?? "Unable to send OTP. Please try again.");
      }
    } finally {
      setIsResendingOtp(false);
    }
  };

  const onSubmit = async (data: VerifyRegisterOtpValues) => {
    if (!email) return;

    setIsRegistering(true);
    try {
      const loginResponse = await authApi.verifyRegisterOtp({
        email,
        otpCode: data.otpCode,
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
        toast.error("OTP has expired. Please sign up again.");
        router.replace("/register");
      } else if (code === "OTP_INVALID") {
        toast.error("Invalid OTP. Please check your email.");
      } else if (code === "CONFLICT") {
        toast.error("This email is already registered. Please use another email.");
        router.replace("/register");
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
          href="/register"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-1">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Back to register
        </Link>
      </div>

      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto lg:mx-0 px-6 lg:px-10 pb-10">
        <div>
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-2xl font-bold" style={{ color: "#ff6a00" }}>ToyStore</span>
            </div>
            <h1 className="mb-2 font-semibold text-gray-800 text-3xl">
              Verify email
            </h1>
            <p className="text-sm text-gray-500">
              Enter the 6-digit OTP sent to {email || "your email"}.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="space-y-5">
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

              <button
                type="submit"
                disabled={isRegistering || !email}
                className="flex w-full items-center justify-center rounded-lg px-4 py-3 text-sm font-medium text-white transition disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, #ff6a00, #ff9a3c)" }}
              >
                {isRegistering ? "Creating account..." : "Verify and sign up"}
              </button>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isResendingOtp || !email}
                className="flex w-full items-center justify-center rounded-lg border px-4 py-3 text-sm font-medium transition disabled:opacity-60"
                style={{ borderColor: "#ff6a00", color: "#ff6a00" }}
              >
                {isResendingOtp ? "Sending..." : "Resend OTP"}
              </button>
            </div>
          </form>

          <div className="mt-6 pb-6">
            <p className="text-sm text-center text-gray-600">
              Need to change email?{" "}
              <Link href="/register" className="font-medium hover:underline" style={{ color: "#ff6a00" }}>
                Edit registration
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
