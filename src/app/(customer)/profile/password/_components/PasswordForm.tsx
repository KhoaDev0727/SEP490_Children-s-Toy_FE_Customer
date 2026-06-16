"use client";

import { useEffect, useState } from "react";
import type { CSSProperties, FormEvent } from "react";
import type { AxiosError } from "axios";
import toast from "react-hot-toast";
import { profileApi } from "@/features/profile/services/profile-api";

type PasswordFormData = {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
};

type PasswordFieldKey = keyof PasswordFormData;

type ApiErrorResponse = {
  code?: string;
  message?: string;
  errors?: Record<string, string[]>;
  Code?: string;
  Message?: string;
  Errors?: Record<string, string[]>;
};

const fieldNameMap: Record<string, PasswordFieldKey> = {
  CurrentPassword: "currentPassword",
  currentPassword: "currentPassword",
  NewPassword: "newPassword",
  newPassword: "newPassword",
  ConfirmNewPassword: "confirmNewPassword",
  confirmNewPassword: "confirmNewPassword",
};

const getErrorMessage = (error: AxiosError<ApiErrorResponse>) =>
  error.response?.data?.message ?? error.response?.data?.Message ?? "";

const getErrorCode = (error: AxiosError<ApiErrorResponse>) =>
  (error.response?.data?.code ?? error.response?.data?.Code ?? "").toUpperCase();

const getValidationErrors = (error: AxiosError<ApiErrorResponse>) =>
  error.response?.data?.errors ?? error.response?.data?.Errors;

export default function PasswordForm() {
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFirstPasswordSetup, setIsFirstPasswordSetup] = useState(false);
  const [form, setForm] = useState<PasswordFormData>({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [show, setShow] = useState<Record<PasswordFieldKey, boolean>>({
    currentPassword: false,
    newPassword: false,
    confirmNewPassword: false,
  });
  const [errors, setErrors] = useState<Partial<Record<PasswordFieldKey, string>>>({});

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      setIsLoadingProfile(true);
      try {
        const profile = await profileApi.getMyProfile();
        if (cancelled) return;
        setIsFirstPasswordSetup(profile.hasPassword === false);
      } catch {
        if (!cancelled) {
          toast.error("Unable to load profile.");
        }
      } finally {
        if (!cancelled) {
          setIsLoadingProfile(false);
        }
      }
    };

    void loadProfile();
    return () => {
      cancelled = true;
    };
  }, []);

  const setField = (field: PasswordFieldKey, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validateClient = () => {
    const nextErrors: Partial<Record<PasswordFieldKey, string>> = {};

    if (!isFirstPasswordSetup && !form.currentPassword.trim()) {
      nextErrors.currentPassword = "Current password is required.";
      setErrors(nextErrors);
      return false;
    }

    if (!form.newPassword.trim()) {
      nextErrors.newPassword = "New password is required.";
      setErrors(nextErrors);
      return false;
    }

    if (!form.confirmNewPassword.trim()) {
      nextErrors.confirmNewPassword = "Confirm new password is required.";
      setErrors(nextErrors);
      return false;
    }

    if (form.newPassword !== form.confirmNewPassword) {
      nextErrors.confirmNewPassword = "Confirm new password does not match new password.";
      setErrors(nextErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const mapServerErrors = (error: AxiosError<ApiErrorResponse>) => {
    const serverErrors = getValidationErrors(error);
    if (!serverErrors) return false;

    const nextErrors: Partial<Record<PasswordFieldKey, string>> = {};
    Object.entries(serverErrors).forEach(([key, messages]) => {
      const mappedField = fieldNameMap[key];
      if (mappedField && messages?.length) {
        nextErrors[mappedField] = messages[0];
      }
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length > 0;
  };

  const mapServerMessageToFieldError = (error: AxiosError<ApiErrorResponse>) => {
    const code = getErrorCode(error);
    const message = getErrorMessage(error).toLowerCase();

    if (code === "INVALID_CREDENTIALS") {
      setErrors((prev) => ({
        ...prev,
        currentPassword: "Current password is incorrect. Please try again.",
      }));
      return true;
    }

    if (!message) return false;

    if (message.includes("current password is incorrect") || message.includes("sai mat khau")) {
      setErrors((prev) => ({
        ...prev,
        currentPassword: "Current password is incorrect. Please try again.",
      }));
      return true;
    }

    if (message.includes("new password must be different") || message.includes("must not be the same")) {
      setErrors((prev) => ({
        ...prev,
        newPassword: "New password must not be the same as current password.",
      }));
      return true;
    }

    return false;
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateClient()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await profileApi.changeMyPassword({
        ...form,
        currentPassword: isFirstPasswordSetup ? "" : form.currentPassword,
      });
      setForm({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
      setErrors({});
      try {
        const profile = await profileApi.getMyProfile();
        setIsFirstPasswordSetup(profile.hasPassword === false);
      } catch {
        setIsFirstPasswordSetup(false);
      }
      toast.success("Password changed successfully.");
    } catch (rawError) {
      const error = rawError as AxiosError<ApiErrorResponse>;
      const hasMapped = mapServerErrors(error);
      const hasMappedFromMessage = mapServerMessageToFieldError(error);
      if (!hasMapped && !hasMappedFromMessage) {
        toast.error(getErrorMessage(error) || "Unable to change password.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="col-span-1 md:col-span-3 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 bg-white">
        <h1 className="text-2xl font-bold text-[#0f172a]">Change Password</h1>
        <p className="mt-1 text-sm text-[#475569]">Update your password to keep your account secure.</p>
      </div>

      <div className="p-6">
        {isLoadingProfile ? (
          <div className="text-sm text-slate-500">Loading...</div>
        ) : (
          <form onSubmit={onSubmit} noValidate className="max-w-xl space-y-5">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-semibold tracking-[0.01em] text-slate-700">
                Current Password
              </label>
              <div className="relative mt-1.5">
                <input
                  id="currentPassword"
                  type={show.currentPassword ? "text" : "password"}
                  value={form.currentPassword}
                  onChange={(event) => setField("currentPassword", event.target.value)}
                  disabled={isFirstPasswordSetup}
                  className="w-full h-12 pl-4 pr-12 border border-slate-200 rounded-md text-[15px] outline-none focus:ring-2 focus:border-[#ff4f00] transition bg-white disabled:bg-slate-50/90 disabled:text-slate-500"
                  style={{ "--tw-ring-color": "#ff4f00" } as CSSProperties}
                />
                <button
                  type="button"
                  aria-label={show.currentPassword ? "Hide current password" : "Show current password"}
                  disabled={isFirstPasswordSetup}
                  onClick={() => setShow((prev) => ({ ...prev, currentPassword: !prev.currentPassword }))}
                  className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-orange-500 disabled:text-slate-300"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {show.currentPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
              {isFirstPasswordSetup ? (
                <p className="mt-2 text-xs leading-5 text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                  This account does not have a personal password yet. Set a new password now; current password is not required for this first setup.
                </p>
              ) : null}
              {errors.currentPassword ? <p className="mt-1.5 text-xs text-red-500">{errors.currentPassword}</p> : null}
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-semibold tracking-[0.01em] text-slate-700">
                New Password
              </label>
              <div className="relative mt-1.5">
                <input
                  id="newPassword"
                  type={show.newPassword ? "text" : "password"}
                  value={form.newPassword}
                  onChange={(event) => setField("newPassword", event.target.value)}
                  className="w-full h-12 pl-4 pr-12 border border-slate-200 rounded-md text-[15px] outline-none focus:ring-2 focus:border-[#ff4f00] transition bg-white"
                  style={{ "--tw-ring-color": "#ff4f00" } as CSSProperties}
                />
                <button
                  type="button"
                  aria-label={show.newPassword ? "Hide new password" : "Show new password"}
                  onClick={() => setShow((prev) => ({ ...prev, newPassword: !prev.newPassword }))}
                  className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-orange-500"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {show.newPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
              {errors.newPassword ? <p className="mt-1.5 text-xs text-red-500">{errors.newPassword}</p> : null}
            </div>

            <div>
              <label htmlFor="confirmNewPassword" className="block text-sm font-semibold tracking-[0.01em] text-slate-700">
                Confirm New Password
              </label>
              <div className="relative mt-1.5">
                <input
                  id="confirmNewPassword"
                  type={show.confirmNewPassword ? "text" : "password"}
                  value={form.confirmNewPassword}
                  onChange={(event) => setField("confirmNewPassword", event.target.value)}
                  className="w-full h-12 pl-4 pr-12 border border-slate-200 rounded-md text-[15px] outline-none focus:ring-2 focus:border-[#ff4f00] transition bg-white"
                  style={{ "--tw-ring-color": "#ff4f00" } as CSSProperties}
                />
                <button
                  type="button"
                  aria-label={show.confirmNewPassword ? "Hide confirm password" : "Show confirm password"}
                  onClick={() => setShow((prev) => ({ ...prev, confirmNewPassword: !prev.confirmNewPassword }))}
                  className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-orange-500"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {show.confirmNewPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
              {errors.confirmNewPassword ? (
                <p className="mt-1.5 text-xs text-red-500">{errors.confirmNewPassword}</p>
              ) : null}
            </div>

            <div className="pt-1">
              <button
                type="submit"
                disabled={isSubmitting}
                className="h-12 px-7 text-white text-sm font-semibold rounded-xl shadow-[0_4px_12px_rgba(255,79,0,0.2)] hover:shadow-[0_6px_20px_rgba(255,79,0,0.3)] disabled:opacity-60 transition hover:-translate-y-0.5 hover:brightness-95 active:translate-y-0"
                style={{ background: "#ff4f00" }}
              >
                {isSubmitting ? "Saving..." : "Update Password"}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
