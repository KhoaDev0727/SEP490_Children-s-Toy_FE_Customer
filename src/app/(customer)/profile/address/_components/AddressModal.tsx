"use client";

import { useEffect, useState } from "react";
import type { Address } from "./AddressCard";
import type { DistrictOption, ProvinceOption, WardOption } from "@/features/address/types/address";

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (address: {
    id?: number;
    recipientName: string;
    phoneNumber: string;
    addressLine: string;
    provinceId: number;
    districtId: number;
    wardCode: string;
    isDefault: boolean;
  }) => void;
  editingAddress?: Address | null;
  provinces: ProvinceOption[];
  districts: DistrictOption[];
  wards: WardOption[];
  onProvinceChange: (provinceId: number) => void;
  onDistrictChange: (districtId: number) => void;
}

export default function AddressModal({
  isOpen,
  onClose,
  onSave,
  editingAddress,
  provinces,
  districts,
  wards,
  onProvinceChange,
  onDistrictChange,
}: AddressModalProps) {
  const PHONE_REGEX = /^0\d{9}$/;
  const [form, setForm] = useState({
    name: "",
    phone: "",
    provinceId: 0,
    districtId: 0,
    wardCode: "",
    street: "",
    isDefault: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen) return;

    if (editingAddress) {
      const provinceId = editingAddress.provinceId ?? 0;
      const districtId = editingAddress.districtId ?? 0;
      const wardCode = editingAddress.wardCode ?? "";

      setForm({
        name: editingAddress.name ?? "",
        phone: editingAddress.phone ?? "",
        provinceId,
        districtId,
        wardCode,
        street: editingAddress.street,
        isDefault: editingAddress.isDefault ?? false,
      });

      if (provinceId) void onProvinceChange(provinceId);
      if (districtId) void onDistrictChange(districtId);
      return;
    }

    setForm({
      name: "",
      phone: "",
      provinceId: 0,
      districtId: 0,
      wardCode: "",
      street: "",
      isDefault: false,
    });
    setErrors({});
  }, [isOpen, editingAddress, onProvinceChange, onDistrictChange]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    const nextErrors: Record<string, string> = {};
    const trimmedName = form.name.trim();
    const trimmedPhone = form.phone.trim();
    const trimmedStreet = form.street.trim();

    if (!trimmedName) nextErrors.name = "Full name is required.";
    else if (trimmedName.length < 2) nextErrors.name = "Full name must be at least 2 characters.";
    else if (trimmedName.length > 100) nextErrors.name = "Full name must not exceed 100 characters.";

    if (!trimmedPhone) nextErrors.phone = "Phone number is required.";
    else if (!PHONE_REGEX.test(trimmedPhone)) nextErrors.phone = "Phone number must be a valid 10-digit Vietnamese number.";

    if (!form.provinceId) nextErrors.provinceId = "Province/City is required.";
    if (!form.districtId) nextErrors.districtId = "District is required.";
    if (!form.wardCode) nextErrors.wardCode = "Ward is required.";

    if (!trimmedStreet) nextErrors.street = "Street address is required.";
    else if (trimmedStreet.length < 5) nextErrors.street = "Street address must be at least 5 characters.";
    else if (trimmedStreet.length > 500) nextErrors.street = "Street address must not exceed 500 characters.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSave({
      ...(editingAddress?.id ? { id: editingAddress.id } : {}),
      recipientName: trimmedName,
      phoneNumber: trimmedPhone,
      addressLine: trimmedStreet,
      provinceId: form.provinceId,
      districtId: form.districtId,
      wardCode: form.wardCode,
      isDefault: form.isDefault,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-lg mx-4 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">{editingAddress ? "Edit address" : "Add new address"}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <input
                value={form.name}
                onChange={(e) => {
                  const value = e.target.value;
                  setForm((prev) => ({ ...prev, name: value }));
                  setErrors((prev) => ({ ...prev, name: "" }));
                }}
                placeholder="Full name"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
              {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
            </div>
            <div>
              <input
                value={form.phone}
                onChange={(e) => {
                  const value = e.target.value;
                  setForm((prev) => ({ ...prev, phone: value }));
                  setErrors((prev) => ({ ...prev, phone: "" }));
                }}
                placeholder="Phone number"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
              {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
            </div>
          </div>

          <div>
            <select
              value={form.provinceId || ""}
              onChange={(e) => {
                const provinceId = Number(e.target.value);
                setForm((prev) => ({ ...prev, provinceId, districtId: 0, wardCode: "" }));
                setErrors((prev) => ({ ...prev, provinceId: "", districtId: "", wardCode: "" }));
                void onProvinceChange(provinceId);
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            >
              <option value="">Select Province/City</option>
              {provinces.map((p) => (
                <option key={p.provinceId} value={p.provinceId}>
                  {p.provinceName}
                </option>
              ))}
            </select>
            {errors.provinceId && <p className="text-xs text-red-600 mt-1">{errors.provinceId}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <select
                value={form.districtId || ""}
                onChange={(e) => {
                  const districtId = Number(e.target.value);
                  setForm((prev) => ({ ...prev, districtId, wardCode: "" }));
                  setErrors((prev) => ({ ...prev, districtId: "", wardCode: "" }));
                  void onDistrictChange(districtId);
                }}
                disabled={!form.provinceId}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              >
                <option value="">Select District</option>
                {districts.map((d) => (
                  <option key={d.districtId} value={d.districtId}>
                    {d.districtName}
                  </option>
                ))}
              </select>
              {errors.districtId && <p className="text-xs text-red-600 mt-1">{errors.districtId}</p>}
            </div>
            <div>
              <select
                value={form.wardCode}
                onChange={(e) => {
                  const value = e.target.value;
                  setForm((prev) => ({ ...prev, wardCode: value }));
                  setErrors((prev) => ({ ...prev, wardCode: "" }));
                }}
                disabled={!form.districtId}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              >
                <option value="">Select Ward</option>
                {wards.map((w) => (
                  <option key={w.wardCode} value={w.wardCode}>
                    {w.wardName}
                  </option>
                ))}
              </select>
              {errors.wardCode && <p className="text-xs text-red-600 mt-1">{errors.wardCode}</p>}
            </div>
          </div>

          <div>
            <textarea
              value={form.street}
              onChange={(e) => {
                const value = e.target.value;
                setForm((prev) => ({ ...prev, street: value }));
                setErrors((prev) => ({ ...prev, street: "" }));
              }}
              placeholder="Street address"
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm resize-none"
            />
            {errors.street && <p className="text-xs text-red-600 mt-1">{errors.street}</p>}
          </div>

          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm((prev) => ({ ...prev, isDefault: e.target.checked }))} />
            <span className="text-sm text-slate-600">Set as default address</span>
          </label>
        </div>

        <div className="px-6 py-4 bg-slate-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm">
            Cancel
          </button>
          <button onClick={handleSubmit} className="px-6 py-2 rounded-lg bg-[#ff6a00] text-white text-sm">
            Save address
          </button>
        </div>
      </div>
    </div>
  );
}
