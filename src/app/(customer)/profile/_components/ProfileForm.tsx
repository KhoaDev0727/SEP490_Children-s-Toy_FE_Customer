"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import type { AxiosError } from "axios";
import { useAuthContext } from "@/context/AuthContext";
import { profileApi } from "@/features/profile/services/profile-api";
import type { CustomerProfile } from "@/features/profile/types/profile";
import toast from "react-hot-toast";

const SEX_OPTIONS = [
  { id: 1, label: "Nam" },
  { id: 2, label: "Female" },
  { id: 3, label: "Other" },
] as const;

const getSexLabelById = (id: number | null | undefined) => {
  if (id == null) return "";
  return SEX_OPTIONS.find((option) => option.id === id)?.label ?? "";
};

const extractDateInputValue = (value: string | null | undefined) => {
  if (!value) return "";
  const trimmed = value.trim();
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(trimmed);
  if (!match) return "";

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    Number.isNaN(date.getTime()) ||
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() + 1 !== month ||
    date.getUTCDate() !== day
  ) {
    return "";
  }

  return `${match[1]}-${match[2]}-${match[3]}`;
};

const formatDob = (value: string | null | undefined) => {
  const dateInput = extractDateInputValue(value);
  if (!dateInput) return "";
  const [year, month, day] = dateInput.split("-");
  return `${day}/${month}/${year}`;
};

const formatDobForDateInput = (value: string | null | undefined) => {
  return extractDateInputValue(value);
};

const parseDobDateInputToIso = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    Number.isNaN(date.getTime()) ||
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() + 1 !== month ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date.toISOString();
};
const toDateInput = (value: string | null | undefined) => {
  return extractDateInputValue(value);
};

const getTodayLocalDateInput = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const normalizeNullable = (value: string) => {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
};
const PHONE_NUMBER_REGEX = /^\d{10}$/;
const MINIMUM_AGE = 15;
const AGE_VALIDATION_MESSAGE = "You must be at least 15 years old.";

type ApiErrorResponse = {
  code?: string;
  message?: string;
  errors?: Record<string, string[]>;
  Code?: string;
  Message?: string;
  Errors?: Record<string, string[]>;
};

const isPhoneAlreadyExistsError = (error: AxiosError<ApiErrorResponse>) => {
  const code = (error.response?.data?.code ?? error.response?.data?.Code ?? "").toUpperCase();
  const message = (error.response?.data?.message ?? error.response?.data?.Message ?? "").toLowerCase();
  const errors = error.response?.data?.errors ?? error.response?.data?.Errors;
  const errorKeys = errors ? Object.keys(errors).map((key) => key.toLowerCase()) : [];

  if (
    code.includes("PHONE") ||
    code.includes("DUPLICATE") ||
    code.includes("ALREADY_EXISTS") ||
    code.includes("CONFLICT")
  ) {
    return true;
  }

  if (
    message.includes("phone") && (message.includes("exist") || message.includes("already")) ||
    message.includes("so dien thoai") && message.includes("ton tai")
  ) {
    return true;
  }

  return errorKeys.some((key) => key.includes("phone"));
};

const isAtLeastMinimumAge = (dobIso: string, minimumAge: number) => {
  const dobDate = new Date(dobIso);
  if (Number.isNaN(dobDate.getTime())) {
    return false;
  }

  const now = new Date();
  const latestAllowedDob = new Date(Date.UTC(
    now.getUTCFullYear() - minimumAge,
    now.getUTCMonth(),
    now.getUTCDate(),
  ));

  return dobDate.getTime() <= latestAllowedDob.getTime();
};

export default function ProfileForm() {
  const { account, updateAccount } = useAuthContext();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [sexes, setSexes] = useState<Array<{ id: number; label: string }>>([]);

  const [accountName, setAccountName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dobInput, setDobInput] = useState("");
  const [sexId, setSexId] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [savedProfile, setSavedProfile] = useState<Partial<CustomerProfile>>({});
  const [provider, setProvider] = useState("");
  const [phoneNumberError, setPhoneNumberError] = useState<string | null>(null);
  const [dobError, setDobError] = useState<string | null>(null);
  const hasShownLoadErrorRef = useRef(false);

  const initials = useMemo(() => {
    const source = accountName || account?.accountName || "U";
    return source
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, [account?.accountName, accountName]);

  useEffect(() => {
    let cancelled = false;

    const applyProfile = (profile: Partial<CustomerProfile>) => {
      if (cancelled) return;

      setAccountName(profile.accountName ?? account?.accountName ?? "");
      setEmail(profile.email ?? account?.email ?? "");
      setPhoneNumber(profile.phoneNumber ?? account?.phoneNumber ?? "");
      setAvatarUrl(profile.imageUrl ?? account?.imageUrl ?? "");
      setDobInput(toDateInput(profile.dob ?? account?.dob ?? null));
      setProvider((profile.provider ?? account?.provider ?? "Email").trim() || "Email");
      setSexId(
        profile.sexId != null
          ? String(profile.sexId)
          : account?.sexId != null
            ? String(account.sexId)
            : "",
      );
      setSavedProfile({
        accountName: profile.accountName ?? account?.accountName ?? "",
        email: profile.email ?? account?.email ?? "",
        imageUrl: profile.imageUrl ?? account?.imageUrl ?? "",
        phoneNumber: profile.phoneNumber ?? account?.phoneNumber ?? null,
        dob: profile.dob ?? account?.dob ?? null,
        sexId: profile.sexId ?? account?.sexId ?? null,
      });

      updateAccount({
        accountName: profile.accountName ?? account?.accountName ?? "",
        email: profile.email ?? account?.email ?? "",
        imageUrl: profile.imageUrl ?? account?.imageUrl ?? "",
        phoneNumber: profile.phoneNumber ?? account?.phoneNumber ?? null,
        dob: profile.dob ?? account?.dob ?? null,
        sexId: profile.sexId ?? account?.sexId ?? null,
        sexName: profile.sexName ?? account?.sexName ?? null,
        provider: profile.provider ?? account?.provider ?? null,
      });
    };

    const loadData = async () => {
      setIsLoading(true);
      try {
        const profile = await profileApi.getMyProfile();

        applyProfile(profile);
      } catch {
        applyProfile({
          accountName: account?.accountName ?? "",
          email: account?.email ?? "",
          imageUrl: account?.imageUrl ?? null,
          phoneNumber: account?.phoneNumber ?? null,
          dob: account?.dob ?? null,
          sexId: account?.sexId ?? null,
          provider: account?.provider ?? null,
        });
        if (!hasShownLoadErrorRef.current) {
          toast.error("Unable to load profile from server.");
          hasShownLoadErrorRef.current = true;
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isEditing) return;
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      toast.error("File exceeds 1 MB.");
      return;
    }

    try {
      setIsUploading(true);
      const uploaded = await profileApi.uploadAvatar(file);
      setAvatarUrl(uploaded.url);
      toast.success("Avatar uploaded successfully.");
    } catch {
      toast.error("Unable to upload avatar.");
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const dobIso = parseDobDateInputToIso(dobInput);
      if (dobInput.trim() && !dobIso) {
        setDobError("Date of birth is invalid.");
        toast.error("Date of birth is invalid.");
        return;
      }
      if (dobIso && !isAtLeastMinimumAge(dobIso, MINIMUM_AGE)) {
        setDobError(AGE_VALIDATION_MESSAGE);
        return;
      }
      setDobError(null);
      const normalizedPhoneNumber = normalizeNullable(phoneNumber);
      if (normalizedPhoneNumber && !PHONE_NUMBER_REGEX.test(normalizedPhoneNumber)) {
        setPhoneNumberError("Phone number must contain exactly 10 digits.");
        return;
      }
      setPhoneNumberError(null);

      const payload = {
        accountName: normalizeNullable(accountName),
        phoneNumber: normalizedPhoneNumber,
        imageUrl: normalizeNullable(avatarUrl),
        dob: dobIso,
        sexId: sexId ? Number(sexId) : null,
      };

      const updated = await profileApi.updateMyProfile(payload);

      setAccountName(updated.accountName ?? accountName);
      setEmail(updated.email ?? email);
      setPhoneNumber(updated.phoneNumber ?? "");
      setAvatarUrl(updated.imageUrl ?? "");
      setDobInput(formatDobForDateInput(updated.dob));
      setSexId(updated.sexId != null ? String(updated.sexId) : "");
      setIsEditing(false);
      setSavedProfile(updated);

      updateAccount({
        accountName: updated.accountName ?? accountName,
        email: updated.email ?? email,
        imageUrl: updated.imageUrl ?? undefined,
        phoneNumber: updated.phoneNumber ?? null,
        dob: updated.dob ?? null,
        sexId: updated.sexId ?? null,
        sexName: updated.sexName ?? null,
        provider: updated.provider ?? account?.provider ?? null,
      });

      toast.success("Profile updated successfully.");
    } catch (rawError) {
      const error = rawError as AxiosError<ApiErrorResponse>;
      if (isPhoneAlreadyExistsError(error)) {
        setPhoneNumberError("This phone number is already used by another account.");
        return;
      }
      const errors = error.response?.data?.errors ?? error.response?.data?.Errors;
      const dobValidationErrors = errors?.Dob ?? errors?.dob;
      if (Array.isArray(dobValidationErrors) && dobValidationErrors.length > 0) {
        setDobError(dobValidationErrors[0] ?? AGE_VALIDATION_MESSAGE);
        return;
      }
      toast.error("Unable to save profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setAccountName(savedProfile.accountName ?? "");
    setEmail(savedProfile.email ?? "");
    setPhoneNumber(savedProfile.phoneNumber ?? "");
    setAvatarUrl(savedProfile.imageUrl ?? "");
    setDobInput(formatDobForDateInput(savedProfile.dob ?? null));
    setSexId(savedProfile.sexId != null ? String(savedProfile.sexId) : "");
    setPhoneNumberError(null);
    setDobError(null);
    setIsEditing(false);
  };

  return (
    <section className="col-span-1 md:col-span-3 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 bg-white">
        <h1 className="text-2xl font-bold text-[#0f172a]">My Profile</h1>
        <p className="mt-1 text-sm text-[#475569]">Manage your personal information and avatar.</p>
      </div>

      <div className="p-6">
        {isLoading ? (
          <div className="text-sm text-slate-500">Loading profile...</div>
        ) : (
          <div className="flex flex-col gap-8">
            <div className="relative flex flex-col md:flex-row gap-5 md:gap-7 md:items-center p-5 md:p-6 rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50 to-white overflow-hidden">
              <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-orange-100/40 blur-2xl pointer-events-none" />
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-[3px] border-white shadow-[0_10px_24px_rgba(15,23,42,0.16)] z-10">
                {avatarUrl ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={avatarUrl}
                      alt={accountName || "Avatar"}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center text-white text-2xl font-bold animate-fade-in"
                    style={{ background: "#ff4f00" }}
                  >
                    {initials}
                  </div>
                )}
              </div>
              {isEditing ? (
                <div className="flex flex-col gap-2">
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    onChange={handleAvatarChange}
                    disabled={isUploading}
                    className="block text-sm text-slate-600 file:mr-3 file:rounded-xl file:border file:border-slate-200 file:bg-slate-50 file:px-3 file:py-2 file:font-semibold file:text-[#ff4f00] hover:file:bg-slate-100"
                  />
                  <p className="text-xs text-slate-400">Max size 1MB, format JPG/PNG.</p>
                </div>
              ) : null}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
              <label className="text-sm text-slate-700">
                <span className="font-semibold tracking-[0.01em]">Account Name</span>
                <input
                  type="text"
                  value={accountName}
                  onChange={(event) => setAccountName(event.target.value)}
                  readOnly={!isEditing}
                  className="mt-1.5 w-full h-12 px-4 border border-slate-200 rounded-md text-[15px] outline-none focus:ring-2 focus:border-[#ff4f00] transition bg-white read-only:bg-slate-50/90 read-only:text-slate-700"
                  style={{ "--tw-ring-color": "#ff4f00" } as React.CSSProperties}
                />
              </label>

              <label className="text-sm text-slate-700">
                <span className="font-semibold tracking-[0.01em]">Email</span>
                <input
                  type="email"
                  value={email}
                  readOnly
                  className="mt-1.5 w-full h-12 px-4 border border-slate-200 rounded-md text-[15px] bg-slate-50/90 text-slate-700"
                />
              </label>

              <label className="text-sm text-slate-700">
                <span className="font-semibold tracking-[0.01em]">Phone Number</span>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(event) => {
                    setPhoneNumber(event.target.value);
                    setPhoneNumberError(null);
                  }}
                  placeholder="Enter phone number"
                  readOnly={!isEditing}
                  className="mt-1.5 w-full h-12 px-4 border border-slate-200 rounded-md text-[15px] outline-none focus:ring-2 focus:border-[#ff4f00] transition bg-white read-only:bg-slate-50/90 read-only:text-slate-700"
                  style={{ "--tw-ring-color": "#ff4f00" } as React.CSSProperties}
                />
                {phoneNumberError && isEditing ? (
                  <p className="mt-1.5 text-sm text-red-600">{phoneNumberError}</p>
                ) : null}
              </label>

              <div className="text-sm text-slate-700">
                <span className="font-semibold tracking-[0.01em]">Sex</span>
                {isEditing ? (
                  <div className="mt-1.5 min-h-12 px-4 py-2 border border-slate-200 rounded-md bg-white flex items-center gap-5">
                    {SEX_OPTIONS.map((option) => (
                      <label key={option.id} className="inline-flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="radio"
                          name="sex"
                          value={String(option.id)}
                          checked={sexId === String(option.id)}
                          onChange={(event) => setSexId(event.target.value)}
                          className="h-4 w-4 text-[#ff4f00] border-slate-300 focus:ring-[#ff4f00]"
                        />
                        <span className="text-sm text-slate-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <input
                    type="text"
                    readOnly
                    value={getSexLabelById(sexId ? Number(sexId) : null)}
                    className="mt-1.5 w-full h-12 px-4 border border-slate-200 rounded-md text-[15px] bg-slate-50/90 text-slate-700"
                  />
                )}
              </div>

              <label className="text-sm text-slate-700">
                <span className="font-semibold tracking-[0.01em]">Date of birth</span>
                <div className="relative mt-1.5">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <span className="material-symbols-outlined text-[20px] leading-none">calendar_month</span>
                  </span>
                  {isEditing ? (
                    <input
                      type="date"
                      value={dobInput}
                      onChange={(event) => {
                        setDobInput(event.target.value);
                        setDobError(null);
                      }}
                      max={getTodayLocalDateInput()}
                      className="w-full h-12 pl-12 pr-4 border border-slate-200 rounded-md text-[15px] outline-none focus:ring-2 focus:border-[#ff4f00] transition bg-white"
                      style={{ "--tw-ring-color": "#ff4f00" } as React.CSSProperties}
                    />
                  ) : (
                    <input
                      type="text"
                      readOnly
                      value={formatDob(parseDobDateInputToIso(dobInput))}
                      className="w-full h-12 pl-12 pr-4 border border-slate-200 rounded-md text-[15px] bg-slate-50/90 text-slate-700"
                      placeholder="dd/MM/yyyy"
                    />
                  )}
                </div>
                {dobError && isEditing ? (
                  <p className="mt-1.5 text-sm text-red-600">{dobError}</p>
                ) : null}
              </label>
            </div>

            <div className="pt-2">
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="h-12 px-7 text-white text-sm font-semibold rounded-xl shadow-[0_4px_12px_rgba(255,79,0,0.2)] hover:shadow-[0_6px_20px_rgba(255,79,0,0.3)] transition hover:-translate-y-0.5 hover:brightness-95 active:translate-y-0"
                  style={{ background: "#ff4f00" }}
                >
                  Edit Profile
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="h-12 px-7 text-white text-sm font-semibold rounded-xl shadow-[0_4px_12px_rgba(255,79,0,0.2)] hover:shadow-[0_6px_20px_rgba(255,79,0,0.3)] disabled:opacity-60 transition hover:-translate-y-0.5 hover:brightness-95 active:translate-y-0"
                    style={{ background: "#ff4f00" }}
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="h-12 px-7 text-slate-700 text-sm font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

    </section>
  );
}

