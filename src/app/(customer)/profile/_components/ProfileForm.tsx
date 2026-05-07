"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useAuthContext } from "@/context/AuthContext";
import { productApi } from "@/features/products/services/product-api";
import { profileApi } from "@/features/profile/services/profile-api";
import type { CustomerProfile } from "@/features/profile/types/profile";
import toast from "react-hot-toast";

const formatDob = (value: string | null | undefined) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const toDateInput = (value: string | null | undefined) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
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
  const [sexes, setSexes] = useState<Array<{ id: number; label: string }>>([]);

  const [accountName, setAccountName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dobInput, setDobInput] = useState("");
  const [sexId, setSexId] = useState<string>("");
  const [provider, setProvider] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
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
        const [profile, lookups] = await Promise.all([
          profileApi.getMyProfile(),
          productApi.getLookups().catch(() => null),
        ]);

        if (lookups?.sexes && !cancelled) {
          setSexes(lookups.sexes);
        }

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
  }, [account, updateAccount]);

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
      updateAccount({ imageUrl: uploaded.url });
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
      const payload = {
        accountName: normalizeNullable(accountName),
        phoneNumber: normalizeNullable(phoneNumber),
        imageUrl: normalizeNullable(avatarUrl),
        dob: dobInput ? new Date(dobInput).toISOString() : null,
        sexId: sexId ? Number(sexId) : null,
      };

      const updated = await profileApi.updateMyProfile(payload);

      setAccountName(updated.accountName ?? accountName);
      setEmail(updated.email ?? email);
      setPhoneNumber(updated.phoneNumber ?? "");
      setAvatarUrl(updated.imageUrl ?? "");
      setDobInput(toDateInput(updated.dob));
      setProvider((updated.provider ?? provider).trim() || "Email");
      setSexId(updated.sexId != null ? String(updated.sexId) : "");

      updateAccount({
        accountName: updated.accountName ?? accountName,
        email: updated.email ?? email,
        imageUrl: updated.imageUrl ?? null,
        phoneNumber: updated.phoneNumber ?? null,
        dob: updated.dob ?? null,
        sexId: updated.sexId ?? null,
        sexName: updated.sexName ?? null,
        provider: updated.provider ?? provider,
      });

      toast.success("Profile updated successfully.");
    } catch {
      toast.error("Unable to save profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="col-span-1 md:col-span-3 bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200/60 bg-white">
        <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
      </div>

      <div className="p-6">
        {isLoading ? (
          <div className="text-sm text-slate-500">Loading profile...</div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row gap-6 md:items-center">
              <div className="w-28 h-28 rounded-full overflow-hidden border border-slate-200">
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="text-sm text-slate-700">
                Account Name
                <input
                  type="text"
                  value={accountName}
                  onChange={(event) => setAccountName(event.target.value)}
                  className="mt-1 w-full p-3 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2"
                  style={{ "--tw-ring-color": "#ff6a00" } as React.CSSProperties}
                />
              </label>

              <label className="text-sm text-slate-700">
                Email
                <input
                  type="email"
                  value={email}
                  readOnly
                  className="mt-1 w-full p-3 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-700"
                />
              </label>

              <label className="text-sm text-slate-700">
                Phone Number
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(event) => setPhoneNumber(event.target.value)}
                  placeholder="Enter phone number"
                  className="mt-1 w-full p-3 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2"
                  style={{ "--tw-ring-color": "#ff6a00" } as React.CSSProperties}
                />
              </label>

              <label className="text-sm text-slate-700">
                Sex
                <select
                  value={sexId}
                  onChange={(event) => setSexId(event.target.value)}
                  className="mt-1 w-full p-3 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:ring-2"
                  style={{ "--tw-ring-color": "#ff6a00" } as React.CSSProperties}
                >
                  <option value="">Select sex</option>
                  {sexes.map((sex) => (
                    <option key={sex.id} value={sex.id}>
                      {sex.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm text-slate-700">
                DOB
                <input
                  type="date"
                  value={dobInput}
                  onChange={(event) => setDobInput(event.target.value)}
                  className="mt-1 w-full p-3 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2"
                  style={{ "--tw-ring-color": "#ff6a00" } as React.CSSProperties}
                />
                <span className="mt-1 block text-xs text-slate-500">
                  Display: {formatDob(dobInput || null) || "--/--/----"} (dd/MM/yyyy)
                </span>
              </label>

              <label className="text-sm text-slate-700">
                Provider
                <input
                  type="text"
                  value={provider || "Email"}
                  readOnly
                  className="mt-1 w-full p-3 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-700"
                />
              </label>
            </div>

            <div>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="px-8 py-3 text-white text-sm font-bold rounded-lg disabled:opacity-60"
                style={{ backgroundColor: "#ff6a00" }}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
