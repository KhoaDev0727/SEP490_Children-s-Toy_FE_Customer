"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { authApi } from "@/features/auth/services/auth-api";
import {
  AUTH_ERROR_ACCOUNT_INACTIVE,
  resolveAuthOperationErrorMessage,
} from "@/features/auth/utils/auth-api-error";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

const forgotSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
});

const resetSchema = z.object({
  otpCode: z
    .string()
    .min(1, "OTP code is required")
    .length(6, "OTP code must be 6 digits")
    .regex(/^\d{6}$/, "OTP code must contain only digits"),
  newPassword: z
    .string()
    .min(8, "At least 8 characters")
    .regex(/[A-Z]/, "Must include at least one uppercase letter")
    .regex(/[a-z]/, "Must include at least one lowercase letter")
    .regex(/[0-9]/, "Must include at least one number")
    .regex(/[^a-zA-Z0-9]/, "Must include at least one special character"),
  confirmPassword: z.string().min(1, "Confirm password is required"),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type ForgotFormValues = z.infer<typeof forgotSchema>;
type ResetFormValues = z.infer<typeof resetSchema>;

type Step = "email" | "reset";

export default function ForgotPasswordForm() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  const forgotForm = useForm<ForgotFormValues>({ resolver: zodResolver(forgotSchema) });
  const resetForm = useForm<ResetFormValues>({ resolver: zodResolver(resetSchema) });

  const onSendOtp = async (data: ForgotFormValues) => {
    setIsSending(true);
    forgotForm.clearErrors("email");
    try {
      await authApi.forgotPassword(data);
      setEmail(data.email);
      setStep("reset");
      toast.success("OTP has been sent to your email.");
    } catch (error: unknown) {
      const { message, code } = resolveAuthOperationErrorMessage(
        error,
        "Unable to send OTP. Please try again.",
      );
      if (code === AUTH_ERROR_ACCOUNT_INACTIVE) {
        forgotForm.setError("email", { type: "server", message });
      }
      toast.error(message);
    } finally {
      setIsSending(false);
    }
  };

  const onResetPassword = async (data: ResetFormValues) => {
    setIsResetting(true);
    try {
      await authApi.resetPassword({
        email,
        ...data,
        newPassword: data.newPassword.trim(),
        confirmPassword: data.confirmPassword.trim(),
      });
      toast.success("Password reset successful! Please sign in.");
      router.push("/login");
    } catch (error: unknown) {
      const { message } = resolveAuthOperationErrorMessage(
        error,
        "Password reset failed. Please try again.",
      );
      toast.error(message);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="w-full max-w-lg sm:pt-10 mx-auto mb-6 px-6 lg:px-0">
        <Link
          href="/login"
          className="inline-flex items-center text-base text-gray-500 transition-colors hover:text-gray-700"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-1.5">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Back to sign in
        </Link>
      </div>

      <div className="flex flex-col justify-center flex-1 w-full max-w-lg mx-auto px-6 lg:px-0">
        <div>
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-7">
              <span className="text-3xl font-bold" style={{ color: "#ff6a00" }}>ToyStore</span>
            </div>
            <h1 className="mb-3 font-semibold text-gray-800 text-4xl tracking-tight">
              Forgot password
            </h1>
            <p className="text-base text-gray-500 leading-relaxed max-w-prose">
              {step === "email"
                ? "Enter your email to receive an OTP to reset your password."
                : `Enter the OTP sent to ${email} and your new password.`}
            </p>
          </div>

          {step === "email" && (
            <form onSubmit={forgotForm.handleSubmit(onSendOtp)} noValidate>
              <div className="space-y-6">
                <div>
                  <label className="block mb-2 text-base font-medium text-gray-700" htmlFor="fp-email">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="fp-email"
                    type="email"
                    placeholder="example@email.com"
                    className="h-12 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-base text-gray-800 placeholder-gray-400 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                    {...forgotForm.register("email")}
                  />
                  {forgotForm.formState.errors.email && (
                    <p className="mt-2 text-sm text-red-500">
                      {forgotForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSending}
                  className="flex w-full items-center justify-center rounded-lg px-4 py-3.5 text-base font-medium text-white transition disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg, #ff6a00, #ff9a3c)" }}
                >
                    {isSending ? "Sending..." : "Send OTP"}
                </button>
              </div>
            </form>
          )}

          {step === "reset" && (
            <form onSubmit={resetForm.handleSubmit(onResetPassword)} noValidate>
              <div className="space-y-6">
                <div>
                  <label className="block mb-2 text-base font-medium text-gray-700" htmlFor="otp-code">
                    OTP code <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="otp-code"
                    type="text"
                    placeholder="Enter the 6-digit code"
                    maxLength={6}
                    className="h-12 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-base text-gray-800 placeholder-gray-400 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                    {...resetForm.register("otpCode")}
                  />
                  {resetForm.formState.errors.otpCode && (
                    <p className="mt-2 text-sm text-red-500">
                      {resetForm.formState.errors.otpCode.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block mb-2 text-base font-medium text-gray-700" htmlFor="new-pass">
                    New password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="new-pass"
                      type={showPassword ? "text" : "password"}
                      placeholder="At least 8 characters"
                      className="h-12 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pr-12 text-base text-gray-800 placeholder-gray-400 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                      {...resetForm.register("newPassword")}
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
                  {resetForm.formState.errors.newPassword && (
                    <p className="mt-2 text-sm text-red-500">
                      {resetForm.formState.errors.newPassword.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block mb-2 text-base font-medium text-gray-700" htmlFor="confirm-pass">
                    Confirm new password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="confirm-pass"
                      type={showConfirm ? "text" : "password"}
                      placeholder="Re-enter new password"
                      className="h-12 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 pr-12 text-base text-gray-800 placeholder-gray-400 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                      {...resetForm.register("confirmPassword")}
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
                  {resetForm.formState.errors.confirmPassword && (
                    <p className="mt-2 text-sm text-red-500">
                      {resetForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isResetting}
                  className="flex w-full items-center justify-center rounded-lg px-4 py-3.5 text-base font-medium text-white transition disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg, #ff6a00, #ff9a3c)" }}
                >
                  {isResetting ? "Processing..." : "Reset password"}
                </button>

                <button
                  type="button"
                  onClick={() => setStep("email")}
                  className="w-full text-base text-gray-500 hover:text-gray-700 transition-colors py-1.5"
                >
                  Resend OTP
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
