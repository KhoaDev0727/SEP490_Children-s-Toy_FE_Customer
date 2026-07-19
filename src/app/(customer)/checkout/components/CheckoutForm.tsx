"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { addressApi } from "@/features/address/services/address-api";
import type { AddressItem, DistrictOption, ProvinceOption, WardOption } from "@/features/address/types/address";
import { useCart } from "@/features/cart/context/CartContext";
import type { CheckoutPaymentOptions } from "@/features/checkout/types/checkout";

const paymentOptions = [
  {
    id: "cod",
    label: "Cash on Delivery (COD)",
    icon: (
      <CODIcon className="w-9 h-9 text-gray-900 transition-colors group-hover:text-[#ff6a00]" />
    ),
    desc: "Pay cash when your order is delivered",
  },
  {
    id: "sepay",
    label: "QR Bank Transfer (Auto-confirm)",
    icon: (
      <QRIcon className="w-9 h-9 text-gray-900 transition-colors group-hover:text-[#ff6a00]" />
    ),
    desc: "Open your banking app to scan the QR code; auto-confirmed in 5s",
  },
  {
    id: "shopwallet",
    label: "Pay with Internal Wallet",
    icon: (
      <WalletIcon className="w-9 h-9 text-gray-900 transition-colors group-hover:text-[#ff6a00]" />
    ),
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
  orderTotal?: number | null;
  paymentOptions?: CheckoutPaymentOptions | null;
  isWalletActivated?: boolean;
  isWalletLoading?: boolean;
}

export default function CheckoutForm({
  onFormChange,
  externalAddresses,
  externalLoading,
  orderTotal,
  paymentOptions: checkoutPaymentOptions,
  isWalletActivated,
  isWalletLoading,
}: CheckoutFormProps) {
  const { isAuthenticated, isHydrated } = useAuthContext();
  const { cart } = useCart();

  const selectedSubtotal = useMemo(
    () => cart?.items?.filter((i) => i.isSelected).reduce((sum, i) => sum + i.lineTotal, 0) ?? 0,
    [cart]
  );

  const currentTotal = orderTotal !== null && orderTotal !== undefined ? orderTotal : selectedSubtotal;
  const isCodDisabledByTotal = currentTotal > 50000000;
  const isCodRestrictedByAccount = checkoutPaymentOptions?.isCodRestricted ?? false;
  const isCodDisabled = isCodDisabledByTotal || isCodRestrictedByAccount;
  const codDisabledMessage = isCodRestrictedByAccount
    ? checkoutPaymentOptions?.codRestrictionReason ?? "COD is temporarily unavailable for your account."
    : "COD is not available for orders over 50,000,000 VND";

  const [form, setForm] = useState<CheckoutFormData>({
    addressId: 0,
    fullname: "",
    phone: "",
    address: "",
    provinceId: 0,
    districtId: 0,
    wardCode: "",
    payment: isCodDisabled ? "sepay" : "cod",
    note: "",
  });

  useEffect(() => {
    if (isCodDisabled && form.payment === "cod") {
      const updated = { ...form, payment: "sepay" };
      setForm(updated);
      onFormChange?.(updated);
    }
  }, [isCodDisabled, form.payment, form, onFormChange]);
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
    "w-full rounded-xl border border-gray-200 bg-white focus:border-[#ff4f00] focus:ring-2 focus:ring-[#ff4f00]/10 text-gray-900 text-sm p-4 outline-none transition-all placeholder:text-gray-400 font-semibold disabled:opacity-75 disabled:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-900 disabled:border-gray-200/50";
  const labelBase = "block text-xs font-black uppercase tracking-wider text-gray-500 mb-2 ml-1";

  return (
    <div className="flex flex-col gap-6 xl:gap-8">
      {/* ── Step 1: Shipping Info ─────────────────────────── */}
      <section className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-6 md:p-8 xl:p-10 relative">
        <div className="flex items-start sm:items-center justify-between mb-8 flex-col sm:flex-row gap-4 relative">
          <h2 className="flex items-center gap-4 text-xl font-extrabold text-gray-900 tracking-tight">
            <span className="w-10 h-10 rounded-xl bg-[#ff4f00] text-white flex items-center justify-center font-black text-lg">
              1
            </span>
            Shipping Information
          </h2>
          <div className="flex flex-col items-start sm:items-end gap-1.5 w-full sm:w-auto">
            {externalLoading ? (
              <div className="h-10 w-full sm:w-56 bg-gray-200/50 animate-pulse rounded-xl" />
            ) : (
              <div className="flex items-center gap-3 w-full">
                <label className="text-xs font-black uppercase tracking-wider text-gray-400 whitespace-nowrap">Address Book</label>
                <div className="relative flex-1 sm:w-56">
                  <select
                    className="w-full appearance-none rounded-xl border border-gray-200 bg-white hover:border-[#ff4f00] text-sm font-bold text-gray-900 px-4 py-2.5 pr-10 cursor-pointer outline-none transition-all"
                    value={selectedAddressId}
                    onChange={handleSelectAddress}
                    disabled={!isHydrated || !isAuthenticated || addresses.length === 0}
                  >
                    <option value={0}>{(!isHydrated || !isAuthenticated) ? "Login required" : "Select address"}</option>
                    {addresses.map((a) => (
                      <option key={a.addressId} value={a.addressId}>
                        {(a.recipientName ?? "").trim() || "Unnamed"} - {a.addressLine.length > 60 ? `${a.addressLine.slice(0, 60)}...` : a.addressLine}
                      </option>
                    ))}
                  </select>
                  <ChevronIcon className="text-gray-900" />
                </div>
              </div>
            )}
            {isHydrated && isAuthenticated && !externalLoading && (
              <a href="/profile/address" className="text-xs font-black text-gray-500 hover:text-[#ff4f00] transition-colors ml-auto sm:ml-0 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
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
            </div>
          </div>
        </div>
      </section>

      {/* ── Step 2: Payment Method ────────────────────────── */}
      <section className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-6 md:p-8 xl:p-10 relative overflow-hidden">
        <h2 className="flex items-center gap-4 text-xl font-extrabold text-gray-900 tracking-tight mb-8">
          <span className="w-10 h-10 rounded-xl bg-[#ff4f00] text-white flex items-center justify-center font-black text-lg">
            2
          </span>
          Payment Method
        </h2>

        <div className="space-y-4">
          {paymentOptions.map((opt) => {
            const disabled = opt.id === "cod" && isCodDisabled;
            const checked = form.payment === opt.id;
            return (
              <label
                key={opt.id}
                className={`group flex items-center gap-5 p-5 rounded-xl border-2 transition-all duration-200 ${disabled
                  ? "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed"
                  : checked
                    ? "border-[#ff4f00] bg-white shadow-sm cursor-pointer"
                    : "border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-400 cursor-pointer"
                  }`}
              >
                <div className="relative flex items-center justify-center w-5 h-5 flex-shrink-0">
                  <input
                    type="radio"
                    name="payment"
                    value={opt.id}
                    checked={checked}
                    onChange={handleFieldChange}
                    disabled={disabled}
                    className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded-full checked:border-[#ff4f00] disabled:border-gray-200 disabled:bg-gray-100 transition-colors cursor-pointer disabled:cursor-not-allowed"
                  />
                  {checked && (
                    <span className="absolute w-2.5 h-2.5 bg-[#ff4f00] rounded-full pointer-events-none animate-in zoom-in duration-200" />
                  )}
                </div>

                <span className={`text-2xl lg:text-3xl filter drop-shadow-sm transition-transform duration-200 ${!disabled && 'group-hover:scale-105'}`}>{opt.icon}</span>
                <div className="flex-1">
                  <p className={`text-base font-extrabold transition-colors ${checked ? 'text-[#ff4f00]' : 'text-gray-900'}`}>{opt.label}</p>
                  <p className="text-xs text-gray-500 mt-1 font-semibold flex flex-col items-start gap-1">
                    {disabled ? (
                      <span className="text-red-500">{codDisabledMessage}</span>
                    ) : (
                      opt.desc
                    )}
                    {opt.id === "shopwallet" && !isWalletLoading && !isWalletActivated && (
                      <span className="inline-flex items-center gap-1 mt-1 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-md">
                        Wallet not activated yet. <a href="/profile/wallet" target="_blank" rel="noopener noreferrer" className="underline font-black text-amber-900 hover:text-amber-950 ml-0.5">Activate now</a>
                      </span>
                    )}
                  </p>
                </div>
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

function QRIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 5120 5120"
      fill="currentColor"
      aria-hidden="true"
    >
      <g transform="translate(0 5120) scale(1 -1)">
        <path d="M765 5101 c-48 -22 -69 -44 -90 -94 -13 -32 -15 -144 -15 -885 0 -844 0 -849 21 -876 23 -30 72 -35 105 -12 18 14 19 38 24 873 l5 858 1024 3 c813 2 1026 0 1033 -10 4 -7 8 -59 8 -115 l0 -103 -212 0 c-329 0 -400 -19 -521 -142 l-67 -68 -489 0 c-480 0 -489 0 -515 -21 -58 -46 -56 -14 -56 -799 0 -796 -3 -760 63 -800 31 -19 53 -20 490 -20 l457 0 0 -90 0 -90 -269 0 c-248 0 -271 -1 -292 -19 -32 -26 -32 -86 0 -112 21 -18 44 -19 292 -19 l269 0 0 -65 0 -65 -464 0 c-297 0 -474 -4 -493 -10 -28 -10 -53 -45 -53 -74 0 -7 9 -25 21 -40 l20 -26 482 -2 482 -3 3 -122 3 -123 -611 0 -610 0 0 470 c0 457 -1 471 -20 490 -30 30 -83 27 -109 -6 -21 -26 -21 -36 -21 -490 l0 -464 -28 0 c-57 0 -127 -29 -164 -67 -67 -71 -73 -90 -73 -260 0 -170 7 -190 76 -225 31 -17 90 -18 796 -18 l762 0 3 -572 3 -573 33 -68 c44 -90 116 -160 211 -206 l76 -36 994 -3 c874 -2 1001 -1 1055 13 167 43 290 183 316 360 13 92 13 3881 0 3983 -13 102 -55 185 -129 256 -112 106 -202 129 -494 124 -165 -3 -187 -5 -206 -22 -26 -24 -29 -87 -5 -107 13 -11 72 -15 243 -19 209 -5 230 -7 278 -29 64 -29 124 -91 149 -157 18 -48 19 -103 19 -1859 l0 -1810 -863 -5 c-840 -5 -864 -6 -878 -24 -23 -33 -18 -82 12 -105 27 -21 32 -21 882 -21 l855 0 -6 -102 c-8 -147 -39 -219 -117 -273 -81 -56 -37 -54 -1082 -55 -942 0 -969 1 -1020 20 -63 23 -128 85 -157 150 -17 36 -21 66 -21 153 l0 107 189 0 c175 0 190 1 215 21 33 26 36 79 6 109 -19 19 -33 20 -215 20 l-195 0 2 1833 3 1832 27 46 c33 56 76 94 138 123 44 20 62 21 661 26 502 4 619 8 632 19 25 20 22 83 -4 107 -20 18 -42 19 -315 22 l-294 3 0 112 c-1 159 -23 210 -105 248 -38 18 -92 19 -1080 19 -988 0 -1042 -1 -1080 -19z m1263 -1148 l-3 -428 -105 -3 c-154 -4 -150 1 -150 -219 0 -160 2 -175 20 -193 30 -30 83 -27 109 6 18 23 21 41 21 140 l0 114 55 0 55 0 0 -165 0 -165 -430 0 -430 0 0 670 0 670 430 0 430 0 -2 -427z m-3 -2208 l0 -130 -740 0 -740 0 0 108 c0 107 1 109 28 133 l28 24 712 -2 712 -3 0 -130z" />
        <path d="M1813 4330 c-40 -16 -43 -39 -43 -294 l0 -244 -121 -4 c-113 -3 -122 -5 -140 -27 -25 -30 -24 -76 1 -101 18 -18 33 -20 194 -20 l175 0 20 26 c20 26 21 38 21 320 0 161 -3 300 -6 309 -6 15 -54 46 -71 44 -4 0 -18 -4 -30 -9z" />
        <path d="M1294 4310 c-47 -19 -54 -45 -54 -196 0 -139 0 -142 26 -168 26 -26 29 -26 170 -26 137 0 144 1 171 24 28 24 28 26 31 156 6 208 -6 220 -200 219 -68 0 -133 -4 -144 -9z m196 -190 l0 -50 -50 0 -50 0 0 50 0 50 50 0 50 0 0 -50z" />
        <path d="M1263 3780 c-44 -18 -57 -86 -23 -120 16 -16 33 -20 88 -20 59 0 72 3 90 23 36 38 28 88 -19 112 -31 16 -101 19 -136 5z" />
        <path d="M1303 3499 c-56 -17 -63 -37 -63 -194 0 -201 8 -209 215 -203 l127 3 29 33 c29 32 29 32 29 167 0 135 0 135 -29 167 l-29 33 -124 2 c-68 1 -137 -2 -155 -8z m185 -196 l3 -53 -50 0 -51 0 0 56 0 55 48 -3 47 -3 3 -52z" />
        <path d="M2402 4427 c-31 -33 -29 -80 4 -106 24 -19 40 -21 149 -21 109 0 125 2 149 21 34 27 36 77 3 107 -21 20 -34 22 -153 22 -123 0 -132 -1 -152 -23z" />
        <path d="M3999 4431 c-49 -40 -18 -131 46 -131 38 0 75 37 75 75 0 62 -72 96 -121 56z" />
        <path d="M4252 4427 c-31 -33 -29 -80 4 -106 44 -34 86 -26 110 21 39 75 -57 146 -114 85z" />
        <path d="M2544 3764 c-68 -33 -64 16 -64 -884 0 -747 1 -814 17 -841 36 -61 4 -59 877 -59 867 0 842 -2 881 56 19 28 20 52 20 844 0 792 -1 816 -20 844 -39 58 -14 56 -882 56 -690 0 -802 -2 -829 -16z m1586 -884 l0 -750 -750 0 -750 0 0 750 0 750 750 0 750 0 0 -750z" />
        <path d="M2758 3534 c-15 -8 -32 -23 -38 -34 -6 -10 -10 -91 -10 -185 l0 -167 29 -29 29 -29 171 0 c165 0 171 1 198 24 l28 24 3 164 c4 179 -4 214 -54 237 -39 17 -322 14 -356 -5z m262 -214 l0 -80 -80 0 -80 0 0 80 0 80 80 0 80 0 0 -80z" />
        <path d="M3343 3540 c-12 -5 -26 -18 -32 -29 -7 -12 -11 -118 -11 -290 l0 -271 -130 0 c-117 0 -132 -2 -150 -20 -22 -22 -26 -60 -10 -90 16 -30 67 -40 215 -40 148 0 199 10 215 40 6 11 10 149 10 340 l0 321 -25 24 c-25 26 -45 30 -82 15z" />
        <path d="M3645 3541 c-11 -5 -29 -19 -40 -31 -18 -19 -20 -39 -23 -163 -4 -165 1 -201 33 -233 24 -23 28 -24 198 -24 l174 0 27 26 26 27 0 173 c0 168 -1 174 -24 201 l-24 28 -164 2 c-89 1 -172 -1 -183 -6z m245 -221 l0 -80 -80 0 -80 0 0 80 0 80 80 0 80 0 0 -80z" />
        <path d="M2730 2930 c-22 -22 -26 -60 -10 -90 23 -42 150 -51 192 -13 24 22 24 84 0 106 -29 26 -155 24 -182 -3z" />
        <path d="M3605 2930 c-25 -28 -23 -76 4 -103 18 -19 33 -22 97 -22 71 0 77 2 100 28 29 34 30 56 3 91 -19 24 -26 26 -103 26 -70 0 -86 -3 -101 -20z" />
        <path d="M3897 2932 c-24 -26 -22 -85 3 -107 29 -27 99 -24 122 5 22 27 23 68 2 98 -20 29 -102 32 -127 4z" />
        <path d="M2739 2641 l-29 -29 0 -167 c0 -95 4 -175 10 -186 22 -40 61 -49 219 -49 166 0 190 6 216 54 14 26 16 56 13 194 l-3 164 -28 24 c-27 23 -33 24 -198 24 l-171 0 -29 -29z m281 -201 l0 -80 -80 0 -80 0 0 80 0 80 80 0 80 0 0 -80z" />
        <path d="M3321 2644 c-19 -25 -21 -40 -21 -204 0 -198 5 -214 67 -226 26 -5 37 -1 57 19 25 25 26 30 26 157 l0 130 155 0 c93 0 164 4 179 11 51 23 55 103 7 128 -12 7 -102 11 -235 11 l-215 0 -20 -26z" />
        <path d="M3919 2651 c-23 -18 -24 -26 -27 -155 l-4 -136 -124 0 c-69 0 -134 -5 -145 -11 -48 -25 -44 -105 7 -128 15 -7 89 -11 193 -11 155 0 170 2 195 21 l26 20 0 190 c0 176 -1 190 -20 209 -25 25 -71 26 -101 1z" />
        <path d="M1045 2685 c-14 -13 -25 -36 -25 -50 0 -14 11 -37 25 -50 23 -24 30 -25 140 -25 110 0 117 1 140 25 14 13 25 36 25 50 0 14 -11 37 -25 50 -23 24 -30 25 -140 25 -110 0 -117 -1 -140 -25z" />
        <path d="M2675 1701 c-49 -22 -98 -76 -116 -128 -10 -26 -14 -90 -14 -208 0 -158 2 -173 23 -218 28 -55 78 -100 131 -116 49 -14 1299 -16 1351 -1 47 13 106 63 133 113 20 39 22 55 22 227 0 171 -2 188 -22 225 -11 22 -34 52 -50 67 -62 60 -42 58 -760 58 -615 0 -661 -2 -698 -19z m1361 -152 c17 -19 19 -38 19 -181 0 -156 -1 -160 -24 -179 -22 -18 -48 -19 -657 -19 -615 0 -635 1 -653 19 -28 28 -34 71 -30 216 4 119 5 128 28 146 22 18 48 19 661 19 635 0 637 0 656 -21z" />
        <path d="M2920 1443 c-52 -19 -68 -85 -30 -123 19 -19 33 -20 488 -20 448 0 470 1 486 19 25 27 24 78 -3 104 -21 22 -24 22 -474 24 -248 1 -459 -1 -467 -4z" />
        <path d="M3055 435 c-32 -31 -33 -74 -2 -103 23 -22 29 -22 325 -22 289 0 303 1 322 20 30 30 27 83 -6 109 -26 20 -38 21 -321 21 l-294 0 -24 -25z" />
      </g>
    </svg>
  );
}

function CODIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 5120 5120"
      fill="currentColor"
      aria-hidden="true"
    >
      <g transform="translate(0 5120) scale(1 -1)">
        <path d="M2745 5105 c-79 -17 -169 -54 -236 -97 -44 -29 -265 -218 -394 -339 -28 -26 -74 -38 -625 -159 -327 -72 -605 -137 -618 -146 -12 -8 -30 -30 -39 -48 -15 -33 -12 -50 125 -667 138 -620 141 -635 172 -661 18 -17 42 -28 60 -28 29 0 421 84 1540 330 327 72 647 142 710 156 129 28 151 39 169 83 l13 30 94 0 c109 -1 174 16 286 72 l78 39 0 -93 c0 -78 3 -97 18 -110 17 -15 66 -17 504 -17 457 0 486 1 501 18 16 17 17 82 17 736 0 475 -3 724 -10 737 -10 18 -27 19 -510 19 -575 0 -520 12 -520 -109 l0 -71 -64 0 c-58 0 -103 15 -473 151 -224 83 -441 160 -482 170 -87 22 -225 24 -316 4z m277 -106 c29 -7 246 -83 482 -170 410 -152 432 -159 503 -159 l73 0 0 -439 0 -440 -93 -50 c-142 -77 -260 -97 -379 -66 -106 27 -989 372 -1014 396 -82 77 -34 224 78 236 36 4 116 -17 453 -121 226 -69 414 -126 419 -126 18 0 46 33 46 55 0 28 -26 51 -66 59 l-31 7 -67 307 c-37 169 -72 320 -78 336 -13 32 -62 66 -96 66 -12 0 -227 -45 -478 -100 -251 -55 -460 -100 -465 -100 -6 0 43 47 108 105 128 114 229 175 330 199 72 18 204 20 275 5z m1988 -794 l0 -655 -410 0 -410 0 0 655 0 655 410 0 410 0 0 -655z m-1728 445 c20 -94 24 -126 15 -133 -18 -12 -115 1 -162 22 -73 32 -174 139 -163 173 5 13 219 67 258 64 24 -1 26 -8 52 -126z m-400 -8 c36 -77 112 -153 194 -193 56 -28 80 -34 162 -38 l97 -6 17 -75 c9 -41 17 -82 17 -91 1 -13 -63 4 -319 82 -177 55 -338 99 -359 99 -134 0 -245 -115 -244 -253 l1 -57 -34 30 c-53 46 -93 63 -166 68 -86 6 -142 -10 -204 -57 -134 -101 -148 -302 -28 -425 54 -55 108 -79 194 -84 70 -4 79 -2 140 30 109 56 169 166 157 285 l-6 53 37 -29 c23 -18 148 -72 327 -141 159 -61 292 -113 294 -116 2 -2 -2 -23 -9 -46 -7 -24 -15 -76 -19 -117 l-6 -75 -735 -162 c-404 -90 -754 -167 -778 -172 l-42 -10 -31 59 c-39 73 -122 152 -193 185 -60 27 -167 48 -202 40 -16 -4 -24 -1 -28 11 -12 39 -96 428 -96 443 0 10 20 26 50 40 65 31 154 124 187 197 21 46 28 78 31 149 l4 90 107 23 c58 12 407 89 776 171 369 81 672 148 675 149 3 0 17 -25 32 -57z m-1696 -373 c-3 -33 -14 -80 -25 -104 -24 -55 -85 -121 -133 -146 l-38 -19 -5 22 c-26 112 -55 251 -53 253 4 4 229 53 247 54 11 1 13 -11 7 -60z m1128 -193 c61 -35 89 -92 84 -166 -11 -149 -175 -219 -289 -123 -36 31 -68 94 -69 136 0 36 25 95 53 126 52 56 151 68 221 27z m1073 -437 c100 -39 138 -57 131 -65 -2 -1 -55 -14 -118 -28 -63 -14 -125 -28 -137 -31 -22 -5 -23 -2 -23 45 0 46 21 120 34 120 3 0 54 -19 113 -41z m-2082 -354 c55 -27 113 -82 139 -134 19 -35 30 -30 -132 -65 -82 -17 -115 -21 -118 -13 -4 13 -54 237 -54 245 0 13 119 -10 165 -33z" />
        <path d="M2510 2909 c-56 -25 -86 -53 -113 -104 -27 -51 -29 -155 -4 -202 l17 -31 -248 -4 c-269 -3 -278 -5 -334 -65 -44 -47 -48 -85 -48 -439 l0 -330 -72 25 c-64 23 -89 26 -208 26 -106 0 -147 -4 -190 -19 -56 -19 -218 -97 -253 -121 -16 -11 -24 -11 -51 6 -29 18 -56 19 -502 19 -444 0 -472 -1 -487 -18 -16 -17 -17 -83 -17 -746 0 -482 3 -734 10 -747 10 -18 26 -19 494 -19 481 0 483 0 511 22 38 30 55 76 55 153 l0 65 74 0 c90 0 115 -8 631 -200 204 -76 406 -146 450 -156 169 -39 392 -21 560 46 138 55 214 107 405 281 63 58 282 255 485 438 550 497 542 488 552 600 17 190 -157 345 -336 299 -31 -8 -64 -18 -73 -23 -17 -7 -18 14 -18 361 0 223 -4 384 -10 406 -13 45 -51 93 -94 116 -26 14 -68 17 -278 20 -137 2 -248 5 -248 7 0 1 7 19 15 38 34 82 13 187 -51 251 -85 84 -227 87 -315 5 l-31 -29 -39 33 c-68 59 -159 73 -239 36z m180 -126 c35 -31 49 -79 50 -160 l0 -53 -80 0 c-53 0 -91 5 -110 15 -55 28 -76 105 -45 165 33 64 131 81 185 33z m330 12 c55 -28 76 -105 45 -165 -25 -49 -51 -60 -142 -60 l-83 0 0 65 c0 36 6 80 14 99 28 68 101 95 166 61z m-538 -737 l3 -402 26 -15 c25 -14 31 -11 152 62 l127 76 127 -76 c121 -73 127 -76 152 -62 l26 15 3 402 2 402 271 0 270 0 24 -25 25 -24 0 -418 -1 -418 -346 -230 c-190 -126 -350 -230 -355 -230 -5 0 -17 23 -27 52 -22 64 -59 114 -108 144 -20 13 -244 103 -498 200 l-460 177 -3 365 -2 365 26 21 c26 20 38 21 295 21 l269 0 2 -402z m508 67 c0 -184 -3 -335 -7 -335 -5 0 -44 23 -88 50 -44 28 -90 50 -103 50 -14 0 -61 -22 -107 -50 -46 -27 -86 -50 -89 -50 -3 0 -6 151 -6 335 l0 335 200 0 200 0 0 -335z m-1345 -459 c47 -12 1021 -383 1118 -426 114 -50 147 -179 71 -270 -35 -41 -74 -60 -126 -60 -26 0 -225 56 -520 145 -262 80 -481 145 -487 145 -37 0 -56 -81 -23 -98 49 -26 954 -296 1004 -300 98 -8 213 50 253 127 9 19 164 127 494 346 458 302 483 317 529 318 125 2 211 -115 168 -227 -15 -38 -93 -113 -568 -542 -303 -275 -577 -519 -607 -542 -66 -52 -212 -124 -296 -147 -91 -25 -293 -31 -387 -11 -43 8 -252 80 -465 160 -531 197 -532 197 -640 204 l-93 5 0 518 0 518 103 55 c57 31 123 63 148 71 97 35 214 39 324 11z m-977 -763 l-3 -658 -277 -3 -278 -2 0 660 0 660 280 0 280 0 -2 -657z m292 237 l0 -420 -95 0 -95 0 0 420 0 420 95 0 95 0 0 -420z m-5 -710 l0 -185 -92 -3 -93 -3 0 184 c0 101 3 187 7 191 4 4 46 5 93 4 l85 -3 0 -185z" />
      </g>
    </svg>
  );
}

function WalletIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 5120 5120"
      fill="currentColor"
      aria-hidden="true"
    >
      <g transform="translate(0 5120) scale(1 -1)">
        <path d="M2454 4760 c-99 -20 -124 -42 -764 -659 l-621 -599 -222 -4 -222 -3 -67 -32 c-93 -44 -151 -100 -196 -191 l-37 -76 -3 -1235 c-2 -922 0 -1250 9 -1291 33 -157 159 -280 318 -310 78 -15 3342 -14 3413 1 163 34 291 169 318 336 6 32 10 214 10 404 l0 347 128 3 c123 4 131 5 177 34 36 22 57 45 77 84 l28 53 0 310 c0 351 -3 371 -65 433 -52 52 -97 65 -233 65 l-111 0 -3 373 c-3 353 -4 375 -25 430 -31 81 -84 149 -154 196 -67 45 -108 59 -190 68 l-55 5 -205 341 c-112 187 -220 361 -240 387 -84 108 -254 166 -379 130 l-34 -10 -176 173 c-96 96 -191 183 -211 195 -72 43 -175 60 -265 42z m172 -178 c18 -9 99 -81 180 -160 126 -121 146 -145 133 -156 -8 -7 -287 -183 -622 -390 l-608 -376 -203 2 -204 3 550 530 c302 292 557 534 566 539 68 39 147 42 208 8z m665 -382 c70 -19 111 -73 303 -392 l186 -308 -882 0 c-485 0 -879 2 -877 4 16 14 1097 681 1122 691 38 17 98 19 148 5z m809 -890 c58 -33 105 -96 119 -160 7 -31 11 -181 11 -385 l0 -335 -357 0 c-390 0 -447 -6 -543 -55 -64 -32 -153 -114 -186 -171 -110 -188 -89 -436 51 -592 55 -61 120 -103 205 -133 63 -22 79 -23 448 -27 l383 -4 -3 -376 c-3 -422 -2 -416 -77 -491 -76 -76 53 -71 -1796 -71 -1824 0 -1716 -4 -1792 63 -20 17 -47 54 -59 82 l-24 50 0 1214 c0 924 3 1224 12 1255 15 51 99 137 148 153 25 8 511 11 1725 10 l1690 -2 45 -25z m522 -1057 c17 -15 18 -38 18 -310 0 -282 -1 -294 -20 -313 -21 -21 -29 -21 -578 -18 l-557 3 -55 26 c-80 37 -125 81 -162 157 -29 59 -33 76 -33 147 1 59 6 92 22 126 25 55 81 120 130 150 75 47 86 48 667 48 498 1 551 -1 568 -16z" />
        <path d="M3733 1988 c-12 -6 -27 -23 -34 -39 -32 -78 67 -144 126 -84 65 64 -8 163 -92 123z" />
      </g>
    </svg>
  );
}
