"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuthContext } from "@/context/AuthContext";
import { addressApi } from "@/features/address/services/address-api";
import type { AddressItem } from "@/features/address/types/address";
import { checkoutApi } from "@/features/checkout/services/checkout-api";
import type { CheckoutConfirmItem, CheckoutPreviewResponse } from "@/features/checkout/types/checkout";
import { useCart } from "@/features/cart/context/CartContext";
import type { CheckoutFormData } from "@/app/(customer)/checkout/components/CheckoutForm";

const FALLBACK_IMAGE = "https://placehold.co/80x80/png?text=Toy";

const PAYMENT_METHOD_MAP: Record<string, string> = {
  cod: "SHIP_COD",
  sepay: "SE_PAY",
  shopwallet: "WALLET",
};

const fmt = (n: number) => n.toLocaleString("vi-VN") + " ₫";

export default function OrderSummary({
  formData,
  externalAddresses,
  externalLoading,
}: {
  formData: CheckoutFormData;
  externalAddresses?: AddressItem[];
  externalLoading?: boolean;
}) {
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucherCode, setAppliedVoucherCode] = useState<string | undefined>(undefined);
  const [isOrdering, setIsOrdering] = useState(false);
  const addresses = externalAddresses ?? [];
  const isAddressLoading = externalLoading ?? false;
  const [preview, setPreview] = useState<CheckoutPreviewResponse | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { cart } = useCart();
  const { isAuthenticated, isHydrated } = useAuthContext();

  useEffect(() => {
    setMounted(true);
  }, []);

  const items = useMemo(() => cart?.items ?? [], [cart]);
  const checkoutLines: CheckoutConfirmItem[] = useMemo(
    () => items.filter((i) => i.isSelected).map((i) => ({ productId: i.productId, quantity: i.quantity })),
    [items],
  );
  const selectedSubtotal = useMemo(
    () => items.filter((i) => i.isSelected).reduce((sum, i) => sum + i.lineTotal, 0),
    [items],
  );
  const previewForTotals = checkoutLines.length === 0 ? null : preview;
  const subtotal = previewForTotals?.subTotal ?? selectedSubtotal;
  const shipping = previewForTotals?.shippingFee ?? 0;
  const discount = previewForTotals?.discountAmount ?? 0;
  const total = previewForTotals?.totalAmount ?? subtotal + shipping - discount;

  const activeAddress = useMemo(() => {
    // Ưu tiên địa chỉ người dùng đang chọn trong form
    if (formData.addressId > 0) {
      return addresses.find((a) => a.addressId === formData.addressId) ?? null;
    }
    // Nếu chưa chọn thì lấy địa chỉ mặc định
    return addresses.find((a) => a.isDefault) ?? addresses[0] ?? null;
  }, [addresses, formData.addressId]);

  // Remove local loadAddresses effect


  // Preview theo đúng dòng đã chọn (khớp POST /checkout)
  const fetchPreview = useCallback(
    async (addressId: number, voucher: string | undefined, lines: CheckoutConfirmItem[]) => {
      console.log("[OrderSummary] Fetching preview for address:", addressId);
      setIsPreviewLoading(true);
      try {
        const data = await checkoutApi.previewCheckout({
          addressId,
          voucherCode: voucher,
          items: lines.length > 0 ? lines : undefined,
        });
        setPreview(data);
        if (data.itemErrors.length > 0) {
          data.itemErrors.forEach((e) => toast.error(e.error));
        }
      } catch (err) {
        setPreview(null);
        const msg = err instanceof Error ? err.message : "Unable to calculate shipping fee.";
        toast.error(msg);
      } finally {
        setIsPreviewLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (!mounted || !isHydrated || !isAuthenticated || formData.addressId <= 0 || checkoutLines.length === 0) return;

    void fetchPreview(formData.addressId, appliedVoucherCode, checkoutLines);
  }, [formData.addressId, appliedVoucherCode, checkoutLines, fetchPreview, mounted, isHydrated, isAuthenticated]);

  const applyVoucher = () => {
    setAppliedVoucherCode(voucherCode.trim() || undefined);
  };

  const handleOrder = async () => {
    if (!isAuthenticated) {
      toast.error("Please log in to place an order.");
      return;
    }

    if (!cart || items.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    if (checkoutLines.length === 0) {
      toast.error("Please select at least one product for checkout.");
      return;
    }

    if (!activeAddress) {
      toast.error("Please select a shipping address.");
      return;
    }

    const paymentMethod = PAYMENT_METHOD_MAP[formData.payment] ?? "SHIP_COD";

    setIsOrdering(true);
    try {
      const response = await checkoutApi.confirmCheckout({
        addressId: activeAddress.addressId,
        paymentMethod,
        voucherCode: appliedVoucherCode,
        voucherDiscountAmount: discount,
        note: formData.note?.trim() || undefined,
        items: checkoutLines,
      });

      if (paymentMethod === "SE_PAY") {
        try {
          if (typeof window !== "undefined") {
            window.sessionStorage.setItem(
              `sepay_checkout_${response.orderId}`,
              JSON.stringify({
                attemptCode: response.paymentAttemptCode ?? "",
                qrUrl: response.qrImageUrl ?? "",
              }),
            );
          }
        } catch {
          /* ignore quota */
        }
        const params = new URLSearchParams({
          orderId: String(response.orderId),
          orderCode: response.orderCode ?? "",
          amount: String(Math.round(Number(response.totalAmount))),
          ...(response.paymentAttemptCode ? { attemptCode: response.paymentAttemptCode } : {}),
          ...(response.qrImageUrl ? { qrUrl: encodeURIComponent(response.qrImageUrl) } : {}),
        });
        router.push(`/checkout/payment?${params.toString()}`);
      } else {
        // COD / WALLET — trang thành công
        router.push(`/checkout/success?orderId=${response.orderId}&orderCode=${encodeURIComponent(response.orderCode ?? "")}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to create the order.";
      toast.error(message);
    } finally {
      setIsOrdering(false);
    }
  };

  if (!mounted) {
    return (
      <div className="bg-white/80 backdrop-blur-2xl rounded-[2rem] border border-white/60 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)] p-6 md:p-8 sticky top-24 min-h-[400px] flex flex-col items-center justify-center gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-[#ff6a00]/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-[#ff6a00] border-t-transparent animate-spin"></div>
        </div>
        <p className="text-sm font-bold text-gray-400 animate-pulse">Preparing your order...</p>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-2xl rounded-[2rem] border border-white/60 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)] p-5 md:p-6 lg:p-7 sticky top-24 overflow-hidden">
      {/* Decorative top blur */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#ff6a00]/10 rounded-full blur-3xl pointer-events-none" />

      <h2 className="text-xl font-extrabold text-gray-900 tracking-tight pb-4 border-b border-gray-100/80 mb-5 relative">
        Order Summary
      </h2>

      {/* Product list */}
      <div className="space-y-2 mb-6 max-h-[42vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
        {items.length === 0 && (
          <p className="text-sm text-gray-400 font-medium italic text-center py-4">Your cart is empty.</p>
        )}
        {items.map((item) => (
          <div key={item.cartItemId} className="group flex gap-3.5 items-center p-3 rounded-2xl hover:bg-gray-50/80 transition-colors border border-transparent hover:border-gray-100/80">
            <div className="relative flex-shrink-0">
              <Image
                src={item.mainImageUrl ?? FALLBACK_IMAGE}
                alt={item.productName}
                width={68}
                height={68}
                className="w-[68px] h-[68px] object-cover rounded-xl border border-gray-200/60 shadow-sm transition-transform duration-300 group-hover:scale-105 bg-white"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-gray-800 leading-snug line-clamp-2 mb-2 group-hover:text-[#ff6a00] transition-colors">
                {item.productName}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-500 bg-gray-100/80 px-2 py-0.5 rounded-md border border-gray-200/50">
                  SL: {item.quantity}
                </span>
                <span className="text-sm font-black text-[#ff6a00]">
                  {fmt(item.priceAtThatTime)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Voucher input */}
      <div className="space-y-3 mb-6">
        <CouponInput
          label="Discount code"
          placeholder="Enter voucher code..."
          value={voucherCode}
          onChange={setVoucherCode}
          onApply={applyVoucher}
          applied={!!appliedVoucherCode && discount > 0}
          appliedLabel={`-${fmt(discount)}`}
        />
      </div>

      {/* Price breakdown */}
      <div className="space-y-3 border-t border-gray-100/80 pt-5 mb-5 text-sm">
        <Row label="Subtotal" value={fmt(subtotal)} />
        <Row
          label={isPreviewLoading ? "Shipping fee (calculating...)" : "Shipping fee"}
          value={
            shipping > 0
              ? fmt(shipping)
              : (isPreviewLoading || isAddressLoading)
                ? "Loading..."
                : "Select address"
          }
          valueClass={(isPreviewLoading || isAddressLoading) ? "text-gray-400 animate-pulse font-medium" : "text-gray-900 font-bold"}
        />
        {discount > 0 && (
          <Row label="Voucher discount" value={`-${fmt(discount)}`} valueClass="text-emerald-500 font-bold bg-emerald-50 px-2 py-0.5 rounded-md" />
        )}
      </div>

      {/* Total */}
      <div className="flex items-end justify-between border-t border-gray-200 pt-5 mb-8 relative">
        <span className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Total</span>
        <div className="text-right">
          <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#ff6a00] to-[#ff4500] tracking-tight">
            {fmt(total)}
          </span>
          <p className="text-[10px] text-gray-400 font-medium mt-1 uppercase tracking-widest">(VAT included)</p>
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={handleOrder}
        disabled={isOrdering || isAddressLoading || items.length === 0 || checkoutLines.length === 0}
        className="group relative overflow-hidden w-full bg-gradient-to-r from-[#ff6a00] to-[#ff4500] hover:from-[#ff7a1a] hover:to-[#ff551a] disabled:from-gray-400 disabled:to-gray-500 text-white font-extrabold text-base py-4.5 rounded-2xl shadow-[0_8px_24px_-6px_rgba(255,106,0,0.5)] hover:shadow-[0_12px_32px_-6px_rgba(255,106,0,0.6)] disabled:shadow-none hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2"
      >
        {/* Shine effect */}
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />

        {isOrdering ? (
          <>
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Processing...
          </>
        ) : (
          <>
            <span className="text-lg">Place Order Now</span>
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </>
        )}
      </button>

      <p className="text-[11px] text-center text-gray-400 mt-4 font-medium">
        By placing an order, you agree to{" "}
        <a href="#" className="text-[#ff6a00] hover:text-[#ff4500] hover:underline transition-colors font-bold">Terms of Service</a> of ShopX.
      </p>
    </div>
  );
}

function Row({
  label,
  value,
  valueClass = "text-gray-900 font-bold",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex justify-between items-center text-gray-500">
      <span className="font-medium">{label}</span>
      <span className={valueClass}>{value}</span>
    </div>
  );
}

function CouponInput({
  label,
  placeholder,
  value,
  onChange,
  onApply,
  applied,
  appliedLabel,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  onApply: () => void;
  applied: boolean;
  appliedLabel: string;
}) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">{label}</p>
      {applied ? (
        <div className="flex items-center gap-2 p-2.5 bg-green-50 rounded-xl border border-green-200">
          <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-xs font-bold text-green-700">{appliedLabel}</span>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#ff6a00] focus:ring-2 focus:ring-[#ff6a00]/20 px-3 py-2.5 outline-none transition-all font-medium placeholder:text-gray-300"
          />
          <button
            onClick={onApply}
            className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors whitespace-nowrap"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
}
