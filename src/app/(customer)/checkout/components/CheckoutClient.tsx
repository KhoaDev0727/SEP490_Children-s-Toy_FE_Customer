"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CheckoutForm, { CheckoutFormData } from "@/app/(customer)/checkout/components/CheckoutForm";
import OrderSummary from "@/app/(customer)/checkout/components/OrderSummary";
import { addressApi } from "@/features/address/services/address-api";
import type { AddressItem } from "@/features/address/types/address";
import { useAuthContext } from "@/context/AuthContext";
import { checkoutApi } from "@/features/checkout/services/checkout-api";
import type { CheckoutPaymentOptions } from "@/features/checkout/types/checkout";
import { walletApi } from "@/features/wallet/services/wallet-api";
import type { WalletDto } from "@/features/wallet/types/wallet";

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
  const [pendingSepay, setPendingSepay] = useState<{ orderId: number; orderCode: string } | null>(null);
  const [paymentOptions, setPaymentOptions] = useState<CheckoutPaymentOptions | null>(null);
  const [wallet, setWallet] = useState<WalletDto | null>(null);
  const [isWalletLoading, setIsWalletLoading] = useState(true);

  useEffect(() => {
    if (!isHydrated || !isAuthenticated) return;

    const load = async () => {
      setIsLoadingAddresses(true);
      setIsWalletLoading(true);
      try {
        const [addressData, pending, options, walletData] = await Promise.all([
          addressApi.getMyAddresses(),
          checkoutApi.getPendingSepayOrder(),
          checkoutApi.getPaymentOptions(),
          walletApi.getMyWallet().catch(() => null),
        ]);
        setAddresses(addressData ?? []);
        setPendingSepay(pending);
        setPaymentOptions(options);
        setWallet(walletData);
      } catch (err) {
        console.error("Failed to load checkout data", err);
      } finally {
        setIsLoadingAddresses(false);
        setIsWalletLoading(false);
      }
    };
    void load();
  }, [isAuthenticated, isHydrated]);

  const isWalletActivated = wallet !== null && wallet.hasPin;

  return (
    <>
      {pendingSepay && (
        <div className="lg:col-span-12 mb-2">
          <div className="flex items-center justify-between gap-4 rounded-xl border border-orange-200 bg-orange-50 px-5 py-3.5">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-xl text-orange-500">pending</span>
              <p className="text-sm font-semibold text-orange-800">
                You have a pending QR payment for order <span className="font-black">#{pendingSepay.orderCode}</span>. Placing a new SE_PAY order will redirect you to it.
              </p>
            </div>
            <Link
              href={`/checkout/payment?orderId=${pendingSepay.orderId}`}
              className="shrink-0 rounded-lg bg-orange-500 px-4 py-1.5 text-xs font-bold text-white hover:bg-orange-600"
            >
              Continue payment
            </Link>
          </div>
        </div>
      )}
      <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6 xl:gap-8">
        <CheckoutForm 
          onFormChange={setFormData} 
          externalAddresses={addresses}
          externalLoading={isLoadingAddresses}
          orderTotal={orderTotal}
          paymentOptions={paymentOptions}
          isWalletActivated={isWalletActivated}
          isWalletLoading={isWalletLoading}
        />
      </div>

      <aside className="lg:col-span-5 xl:col-span-4 relative">
        <OrderSummary 
          formData={formData} 
          externalAddresses={addresses}
          externalLoading={isLoadingAddresses}
          onTotalChange={setOrderTotal}
          isWalletActivated={isWalletActivated}
          isWalletLoading={isWalletLoading}
        />
      </aside>
    </>
  );
}
