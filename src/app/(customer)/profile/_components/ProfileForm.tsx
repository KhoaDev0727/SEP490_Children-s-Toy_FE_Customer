"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useAuthContext } from "@/context/AuthContext";
import { profileApi } from "@/features/profile/services/profile-api";
import type { CustomerProfile } from "@/features/profile/types/profile";
import toast from "react-hot-toast";

const SEX_OPTIONS = [
  { id: 1, label: "Nam" },
  { id: 2, label: "Nữ" },
  { id: 3, label: "Khác" },
] as const;

const getSexLabelById = (id: number | null | undefined) => {
  if (id == null) return "";
  return SEX_OPTIONS.find((option) => option.id === id)?.label ?? "";
};

const formatDob = (value: string | null | undefined) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();
  return `${day}/${month}/${year}`;
};

const formatDobForDateInput = (value: string | null | undefined) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
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
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();
  return `${year}-${month}-${day}`;
};

const normalizeNullable = (value: string) => {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
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
        toast.error("Date of birth is invalid.");
        return;
      }

      const payload = {
        accountName: normalizeNullable(accountName),
        phoneNumber: normalizeNullable(phoneNumber),
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
    } catch {
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
    setIsEditing(false);
  };

  return (
    <section className="col-span-1 md:col-span-3 bg-white rounded-3xl shadow-[0_14px_40px_rgba(15,23,42,0.08)] border border-slate-200/80 overflow-hidden">
      <div className="px-6 md:px-8 py-6 border-b border-slate-200/70 bg-gradient-to-r from-orange-50/80 via-white to-amber-50/70">
        <h1 className="text-2xl md:text-[28px] font-semibold tracking-tight text-slate-900">My Profile</h1>
        <p className="mt-1 text-sm text-slate-500">Manage your personal information and avatar.</p>
      </div>

      <div className="p-6 md:p-8">
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
                    className="w-full h-full flex items-center justify-center text-white text-2xl font-bold"
                    style={{ background: "linear-gradient(135deg, #ff6a00, #ff9a3c)" }}
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
                    className="block text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-orange-50 file:px-3 file:py-2 file:font-semibold file:text-orange-600 hover:file:bg-orange-100"
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
                  className="mt-1.5 w-full h-12 px-4 border border-slate-200 rounded-2xl text-[15px] outline-none focus:ring-2 focus:border-orange-300 transition bg-white read-only:bg-slate-50/90 read-only:text-slate-700"
                  style={{ "--tw-ring-color": "#ff6a00" } as React.CSSProperties}
                />
              </label>

              <label className="text-sm text-slate-700">
                <span className="font-semibold tracking-[0.01em]">Email</span>
                <input
                  type="email"
                  value={email}
                  readOnly
                  className="mt-1.5 w-full h-12 px-4 border border-slate-200 rounded-2xl text-[15px] bg-slate-50/90 text-slate-700"
                />
              </label>

              <label className="text-sm text-slate-700">
                <span className="font-semibold tracking-[0.01em]">Phone Number</span>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(event) => setPhoneNumber(event.target.value)}
                  placeholder="Enter phone number"
                  readOnly={!isEditing}
                  className="mt-1.5 w-full h-12 px-4 border border-slate-200 rounded-2xl text-[15px] outline-none focus:ring-2 focus:border-orange-300 transition bg-white read-only:bg-slate-50/90 read-only:text-slate-700"
                  style={{ "--tw-ring-color": "#ff6a00" } as React.CSSProperties}
                />
              </label>

              <div className="text-sm text-slate-700">
                <span className="font-semibold tracking-[0.01em]">Sex</span>
                {isEditing ? (
                  <div className="mt-1.5 min-h-12 px-4 py-2 border border-slate-200 rounded-2xl bg-white flex items-center gap-5">
                    {SEX_OPTIONS.map((option) => (
                      <label key={option.id} className="inline-flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="radio"
                          name="sex"
                          value={String(option.id)}
                          checked={sexId === String(option.id)}
                          onChange={(event) => setSexId(event.target.value)}
                          className="h-4 w-4 text-orange-500 border-slate-300 focus:ring-orange-500"
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
                    className="mt-1.5 w-full h-12 px-4 border border-slate-200 rounded-2xl text-[15px] bg-slate-50/90 text-slate-700"
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
                      onChange={(event) => setDobInput(event.target.value)}
                      max={new Date().toISOString().split("T")[0]}
                      className="w-full h-12 pl-12 pr-4 border border-slate-200 rounded-2xl text-[15px] outline-none focus:ring-2 focus:border-orange-300 transition bg-white"
                      style={{ "--tw-ring-color": "#ff6a00" } as React.CSSProperties}
                    />
                  ) : (
                    <input
                      type="text"
                      readOnly
                      value={formatDob(parseDobDateInputToIso(dobInput))}
                      className="w-full h-12 pl-12 pr-4 border border-slate-200 rounded-2xl text-[15px] bg-slate-50/90 text-slate-700"
                      placeholder="dd/MM/yyyy"
                    />
                  )}
                </div>
              </label>
            </div>

            <div className="pt-2">
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="h-12 px-7 text-white text-sm font-semibold rounded-2xl shadow-[0_8px_20px_rgba(249,115,22,0.35)] transition hover:-translate-y-0.5 hover:brightness-95 active:translate-y-0"
                  style={{ background: "linear-gradient(135deg, #ff6a00, #ff8a1f)" }}
                >
                  Edit Profile
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="h-12 px-7 text-white text-sm font-semibold rounded-2xl shadow-[0_8px_20px_rgba(249,115,22,0.35)] disabled:opacity-60 transition hover:-translate-y-0.5 hover:brightness-95 active:translate-y-0"
                    style={{ background: "linear-gradient(135deg, #ff6a00, #ff8a1f)" }}
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="h-12 px-7 text-slate-700 text-sm font-semibold rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition"
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
