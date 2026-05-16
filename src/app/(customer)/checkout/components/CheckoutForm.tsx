"use client";

import { useEffect, useRef, useState } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { addressApi } from "@/features/address/services/address-api";
import type { AddressItem, DistrictOption, ProvinceOption, WardOption } from "@/features/address/types/address";

const paymentOptions = [
  {
    id: "cod",
    label: "Cash on Delivery (COD)",
    icon: "🚚",
    desc: "Pay cash when your order is delivered",
  },
  {
    id: "sepay",
    label: "QR Bank Transfer (Auto-confirm)",
    icon: "📱",
    desc: "Open your banking app to scan the QR code; auto-confirmed in 5s",
  },
  {
    id: "shopwallet",
    label: "Pay with Internal Wallet",
    icon: "💳",
    desc: "Ultra-fast payment with your wallet balance",
  },
];

export interface CheckoutFormData {
  addressId: number;
  fullname: string;
  phone: string;
  address: string;
  provinceId: number;
  districtId: number;
  wardCode: string;
  payment: string;
  note: string;
}

interface CheckoutFormProps {
  onFormChange?: (data: CheckoutFormData) => void;
  externalAddresses?: AddressItem[];
  externalLoading?: boolean;
}

export default function CheckoutForm({ 
  onFormChange,
  externalAddresses,
  externalLoading 
}: CheckoutFormProps) {
  const { isAuthenticated, isHydrated } = useAuthContext();
  const [form, setForm] = useState<CheckoutFormData>({
    addressId: 0,
    fullname: "",
    phone: "",
    address: "",
    provinceId: 0,
    districtId: 0,
    wardCode: "",
    payment: "cod",
    note: "",
  });
  const [selectedAddressId, setSelectedAddressId] = useState<number>(0);
  const [provinces, setProvinces] = useState<ProvinceOption[]>([]);
  const [districts, setDistricts] = useState<DistrictOption[]>([]);
  const [wards, setWards] = useState<WardOption[]>([]);

  useEffect(() => {
    let active = true;
    const loadProvinces = async () => {
      try {
        const data = await addressApi.getProvinces();
        if (active) setProvinces(data ?? []);
      } catch {
        if (active) setProvinces([]);
      }
    };

    void loadProvinces();
    return () => { active = false; };
  }, []);

  const isInitialized = useRef(false);
  useEffect(() => {
    if (!isHydrated || !isAuthenticated || isInitialized.current || externalLoading) {
      return;
    }

    const addrs = externalAddresses ?? [];
    if (addrs.length === 0) return;

    // Thêm một chút delay để đảm bảo UI đã sẵn sàng (theo yêu cầu user)
    const timer = setTimeout(() => {
      const defaultAddr = addrs.find((a) => a.isDefault) ?? addrs[0];
      setSelectedAddressId(defaultAddr.addressId);
      
      const updated = {
        ...form,
        addressId: defaultAddr.addressId,
        fullname: defaultAddr.recipientName ?? "",
        phone: defaultAddr.phoneNumber ?? "",
        address: defaultAddr.addressLine ?? "",
        provinceId: defaultAddr.provinceId ?? 0,
        districtId: defaultAddr.districtId ?? 0,
        wardCode: defaultAddr.wardCode ?? "",
      };
      
      setForm(updated);
      onFormChange?.(updated);
      isInitialized.current = true;
      
      // Load districts & wards
      if (defaultAddr.provinceId) {
        addressApi.getDistricts(defaultAddr.provinceId).then(dList => setDistricts(dList ?? []));
      }
      if (defaultAddr.districtId) {
        addressApi.getWards(defaultAddr.districtId).then(wList => setWards(wList ?? []));
      }
    }, 500); // Delay 500ms cho mượt

    return () => clearTimeout(timer);
  }, [isAuthenticated, isHydrated, externalAddresses, externalLoading, onFormChange, form]);

  const addresses = externalAddresses ?? [];

  const handleFieldChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const updated = { ...form, [e.target.name]: e.target.value };
    setForm(updated);
    onFormChange?.(updated);
  };

  const handleProvinceChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provinceId = Number(e.target.value) || 0;
    const updated = { ...form, provinceId, districtId: 0, wardCode: "" };
    setForm(updated);
    onFormChange?.(updated);

    if (!provinceId) {
      setDistricts([]);
      setWards([]);
      return;
    }

    try {
      const data = await addressApi.getDistricts(provinceId);
      setDistricts(data ?? []);
      setWards([]);
    } catch {
      setDistricts([]);
      setWards([]);
    }
  };

  const handleDistrictChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const districtId = Number(e.target.value) || 0;
    const updated = { ...form, districtId, wardCode: "" };
    setForm(updated);
    onFormChange?.(updated);

    if (!districtId) {
      setWards([]);
      return;
    }

    try {
      const data = await addressApi.getWards(districtId);
      setWards(data ?? []);
    } catch {
      setWards([]);
    }
  };

  const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const wardCode = e.target.value;
    const updated = { ...form, wardCode };
    setForm(updated);
    onFormChange?.(updated);
  };

  const handleSelectAddress = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const addressId = Number(e.target.value) || 0;
    setSelectedAddressId(addressId);

    const picked = addresses.find((a) => a.addressId === addressId);
    if (!picked) return;

    const provinceId = picked.provinceId ?? 0;
    const districtId = picked.districtId ?? 0;
    const wardCode = picked.wardCode ?? "";

    const updated = {
      ...form,
      addressId: addressId,
      fullname: picked.recipientName ?? "",
      phone: picked.phoneNumber ?? "",
      address: picked.addressLine ?? "",
      provinceId,
      districtId,
      wardCode,
    };

    setForm(updated);
    onFormChange?.(updated);

    if (!provinceId) {
      setDistricts([]);
      setWards([]);
      return;
    }

    try {
      const districtList = await addressApi.getDistricts(provinceId);
      setDistricts(districtList ?? []);
    } catch {
      setDistricts([]);
    }

    if (!districtId) {
      setWards([]);
      return;
    }

    try {
      const wardList = await addressApi.getWards(districtId);
      setWards(wardList ?? []);
    } catch {
      setWards([]);
    }
  };

  const inputBase =
    "w-full rounded-2xl border border-gray-200/80 bg-gray-50/50 hover:bg-white focus:bg-white focus:border-[#ff6a00] focus:ring-4 focus:ring-[#ff6a00]/10 text-gray-900 text-sm p-4 outline-none transition-all duration-300 placeholder:text-gray-400 font-medium disabled:opacity-60 disabled:bg-gray-100/50 disabled:cursor-not-allowed disabled:text-gray-600 disabled:hover:bg-gray-100/50";
  const labelBase = "block text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-2 ml-1";

  return (
    <div className="flex flex-col gap-6 xl:gap-8">
      {/* ── Step 1: Shipping Info ─────────────────────────── */}
      <section className="bg-white/80 backdrop-blur-xl rounded-[2rem] border border-white/60 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)] p-6 md:p-8 xl:p-10 relative overflow-hidden">
        {/* Subtle decorative gradient background */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#ff6a00]/5 to-transparent pointer-events-none" />

        <div className="flex items-start sm:items-center justify-between mb-8 flex-col sm:flex-row gap-4 relative">
          <h2 className="flex items-center gap-4 text-xl font-extrabold text-gray-900 tracking-tight">
            <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#ff6a00] to-[#ff4500] shadow-lg shadow-[#ff6a00]/20 text-white flex items-center justify-center font-black text-lg">
              1
            </span>
            Shipping Information
          </h2>
          <div className="flex flex-col items-start sm:items-end gap-1.5 w-full sm:w-auto">
            {externalLoading ? (
              <div className="h-10 w-full sm:w-56 bg-gray-200 animate-pulse rounded-xl" />
            ) : (
              <div className="flex items-center gap-3 w-full">
                <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400 whitespace-nowrap">Address Book</label>
                <div className="relative flex-1 sm:w-56">
                  <select
                    className="w-full appearance-none rounded-xl border border-[#ff6a00]/20 bg-[#ff6a00]/5 hover:bg-[#ff6a00]/10 text-sm font-bold text-[#ff6a00] px-4 py-2.5 pr-10 cursor-pointer outline-none transition-colors"
                    value={selectedAddressId}
                    onChange={handleSelectAddress}
                    disabled={!isHydrated || !isAuthenticated || addresses.length === 0}
                  >
                    <option value={0}>{(!isHydrated || !isAuthenticated) ? "Login required" : "Select address"}</option>
                    {addresses.map((a) => (
                      <option key={a.addressId} value={a.addressId}>
                        {(a.recipientName ?? "").trim() || "Unnamed"} - {a.addressLine}
                      </option>
                    ))}
                  </select>
                  <ChevronIcon className="text-[#ff6a00]" />
                </div>
              </div>
            )}
            {isHydrated && isAuthenticated && !externalLoading && (
              <a href="/profile/address" className="text-[11px] font-semibold text-gray-400 hover:text-[#ff6a00] transition-colors ml-auto sm:ml-0 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4"/></svg>
                Add/Edit New Address
              </a>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative">
          {/* Full Name */}
          <div>
            <label className={labelBase} htmlFor="fullname">Full name</label>
            <input
              id="fullname"
              name="fullname"
              type="text"
              placeholder="John Doe"
              className={inputBase}
              value={form.fullname}
              onChange={handleFieldChange}
              disabled
            />
          </div>

          {/* Phone */}
          <div>
            <label className={labelBase} htmlFor="phone">Phone number</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              placeholder="0912 345 678"
              className={inputBase}
              value={form.phone}
              onChange={handleFieldChange}
              disabled
            />
          </div>

          {/* Address - full width */}
          <div className="md:col-span-2">
            <label className={labelBase} htmlFor="address">Street address</label>
            <input
              id="address"
              name="address"
              type="text"
              placeholder="House number, street, building..."
              className={inputBase}
              value={form.address}
              onChange={handleFieldChange}
              disabled
            />
          </div>

          {/* City */}
          <div>
            <label className={labelBase} htmlFor="provinceId">Province / City</label>
            <div className="relative group">
              <select
                id="provinceId"
                name="provinceId"
                className={`${inputBase} appearance-none pr-10`}
                value={form.provinceId}
                onChange={handleProvinceChange}
                disabled
              >
                <option value={0}>Select Province / City</option>
                {provinces.map((p) => (
                  <option key={p.provinceId} value={p.provinceId}>{p.provinceName}</option>
                ))}
              </select>
              <ChevronIcon />
            </div>
          </div>

          {/* District */}
          <div>
            <label className={labelBase} htmlFor="districtId">District</label>
            <div className="relative group">
              <select
                id="districtId"
                name="districtId"
                className={`${inputBase} appearance-none pr-10`}
                value={form.districtId}
                onChange={handleDistrictChange}
                disabled
              >
                <option value={0}>Select District</option>
                {districts.map((d) => (
                  <option key={d.districtId} value={d.districtId}>{d.districtName}</option>
                ))}
              </select>
              <ChevronIcon />
            </div>
          </div>

          {/* Ward */}
          <div className="md:col-span-2">
            <label className={labelBase} htmlFor="wardCode">Ward</label>
            <div className="relative group">
              <select
                id="wardCode"
                name="wardCode"
                className={`${inputBase} appearance-none pr-10`}
                value={form.wardCode}
                onChange={handleWardChange}
                disabled
              >
                <option value="">Select Ward</option>
                {wards.map((w) => (
                  <option key={w.wardCode} value={w.wardCode}>{w.wardName}</option>
                ))}
              </select>
              <ChevronIcon />
            </div>
          </div>

          {/* Note */}
          <div className="md:col-span-2 mt-2">
            <label className={labelBase} htmlFor="note">Order note (optional)</label>
            <textarea
              id="note"
              name="note"
              rows={2}
              placeholder="Extra note for the delivery person..."
              className={`${inputBase} resize-none`}
              value={form.note}
              onChange={handleFieldChange}
            />
          </div>
        </div>
      </section>

      {/* ── Step 2: Payment Method ────────────────────────── */}
      <section className="bg-white/80 backdrop-blur-xl rounded-[2rem] border border-white/60 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)] p-6 md:p-8 xl:p-10 relative overflow-hidden">
        <h2 className="flex items-center gap-4 text-xl font-extrabold text-gray-900 tracking-tight mb-8">
          <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#ff6a00] to-[#ff4500] shadow-lg shadow-[#ff6a00]/20 text-white flex items-center justify-center font-black text-lg">
            2
          </span>
          Payment Method
        </h2>

        <div className="space-y-4">
          {paymentOptions.map((opt) => {
            const checked = form.payment === opt.id;
            return (
              <label
                key={opt.id}
                className={`group flex items-center gap-5 p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                  checked
                    ? "border-[#ff6a00] bg-gradient-to-r from-[#ff6a00]/5 to-transparent shadow-md shadow-[#ff6a00]/10"
                    : "border-gray-100 bg-white hover:border-gray-300 hover:shadow-lg hover:-translate-y-0.5"
                }`}
              >
                <div className="relative flex items-center justify-center w-5 h-5 flex-shrink-0">
                  <input
                    type="radio"
                    name="payment"
                    value={opt.id}
                    checked={checked}
                    onChange={handleFieldChange}
                    className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded-full checked:border-[#ff6a00] transition-colors cursor-pointer"
                  />
                  {checked && (
                    <span className="absolute w-2.5 h-2.5 bg-[#ff6a00] rounded-full pointer-events-none animate-in zoom-in duration-200" />
                  )}
                </div>
                
                <span className="text-2xl lg:text-3xl filter drop-shadow-sm transition-transform duration-300 group-hover:scale-110">{opt.icon}</span>
                <div className="flex-1">
                  <p className={`text-base font-bold transition-colors ${checked ? 'text-[#ff6a00]' : 'text-gray-900'}`}>{opt.label}</p>
                  <p className="text-xs text-gray-500 mt-1 font-medium">{opt.desc}</p>
                </div>
                
                {checked && (
                  <div className="w-8 h-8 rounded-full bg-[#ff6a00]/10 flex items-center justify-center flex-shrink-0 animate-in fade-in duration-300">
                    <svg className="w-4 h-4 text-[#ff6a00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </label>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function ChevronIcon({ className = "text-gray-400" }: { className?: string }) {
  return (
    <svg
      className={`pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 ${className}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
    </svg>
  );
}
