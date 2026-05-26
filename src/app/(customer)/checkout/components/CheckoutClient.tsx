"use client";

import { useEffect, useState } from "react";
import CheckoutForm, { CheckoutFormData } from "@/app/(customer)/checkout/components/CheckoutForm";
import OrderSummary from "@/app/(customer)/checkout/components/OrderSummary";
import { addressApi } from "@/features/address/services/address-api";
import type { AddressItem } from "@/features/address/types/address";
import { useAuthContext } from "@/context/AuthContext";

const DEFAULT_FORM: CheckoutFormData = {
  addressId: 0,
  fullname: "",
  phone: "",
  address: "",
  provinceId: 0,

  districtId: 0,
  wardCode: "",
  payment: "cod",
  note: "",
};

export default function CheckoutClient() {
  const { isAuthenticated, isHydrated } = useAuthContext();
  const [formData, setFormData] = useState<CheckoutFormData>(DEFAULT_FORM);
  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [orderTotal, setOrderTotal] = useState<number | null>(null);

  useEffect(() => {
    if (!isHydrated || !isAuthenticated) return;

    const load = async () => {
      setIsLoadingAddresses(true);
      try {
        const data = await addressApi.getMyAddresses();
        setAddresses(data ?? []);
      } catch (err) {
        console.error("Failed to load addresses", err);
      } finally {
        setIsLoadingAddresses(false);
      }
    };
    void load();
  }, [isAuthenticated, isHydrated]);

  return (
    <>
      <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6 xl:gap-8">
        <CheckoutForm 
          onFormChange={setFormData} 
          externalAddresses={addresses}
          externalLoading={isLoadingAddresses}
          orderTotal={orderTotal}
        />
      </div>

      <aside className="lg:col-span-5 xl:col-span-4 relative">
        <OrderSummary 
          formData={formData} 
          externalAddresses={addresses}
          externalLoading={isLoadingAddresses}
          onTotalChange={setOrderTotal}
        />
      </aside>
    </>
  );
}
