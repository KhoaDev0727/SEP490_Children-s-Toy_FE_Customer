"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuthContext } from "@/context/AuthContext";
import type { AddressItem } from "@/features/address/types/address";
import { checkoutApi } from "@/features/checkout/services/checkout-api";
import type { CheckoutConfirmItem, CheckoutPreviewResponse } from "@/features/checkout/types/checkout";
import { useCart } from "@/features/cart/context/CartContext";
import type { CheckoutFormData } from "@/app/(customer)/checkout/components/CheckoutForm";
import { voucherApi } from "@/features/vouchers/services/voucher-api";
import type { IVoucher } from "@/features/vouchers/types/voucher";
import { walletApi } from "@/features/wallet/services/wallet-api";
import WalletPinModal from "@/components/common/WalletPinModal";
import { smartParseDate } from "@/utils/date-utils";

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
  onTotalChange,
  isWalletActivated,
  isWalletLoading,
}: {
  formData: CheckoutFormData;
  externalAddresses?: AddressItem[];
  externalLoading?: boolean;
  onTotalChange?: (total: number) => void;
  isWalletActivated?: boolean;
  isWalletLoading?: boolean;
}) {
  const [orderVoucherCode, setOrderVoucherCode] = useState("");
  const [shippingVoucherCode, setShippingVoucherCode] = useState("");
  const [appliedOrderVoucherCode, setAppliedOrderVoucherCode] = useState<string | undefined>(undefined);
  const [appliedShippingVoucherCode, setAppliedShippingVoucherCode] = useState<string | undefined>(undefined);
  const [appliedOrderVoucher, setAppliedOrderVoucher] = useState<IVoucher | null>(null);
  const [appliedShippingVoucher, setAppliedShippingVoucher] = useState<IVoucher | null>(null);
  const [orderVoucherError, setOrderVoucherError] = useState<string | null>(null);
  const [shippingVoucherError, setShippingVoucherError] = useState<string | null>(null);
  const [isOrdering, setIsOrdering] = useState(false);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [voucherList, setVoucherList] = useState<IVoucher[]>([]);
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [hasLoadedVouchers, setHasLoadedVouchers] = useState(false);
  const [bestApplyingTarget, setBestApplyingTarget] = useState<"ORDER_TOTAL" | "SHIPPING_FEE" | null>(null);

  // Wallet PIN modal state
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isPinVerifying, setIsPinVerifying] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);
  const [pinRemainingAttempts, setPinRemainingAttempts] = useState<number | null>(null);
  const [pinLockedUntil, setPinLockedUntil] = useState<string | null>(null);
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
  const paymentMethod = PAYMENT_METHOD_MAP[formData.payment] ?? "SHIP_COD";
  const subtotal = preview?.subTotal ?? selectedSubtotal;
  const shipping = preview?.shippingFee ?? 0;

  // Tính toán discount với fallback cực mạnh
  const getDiscount = (target: "ORDER_TOTAL" | "SHIPPING_FEE") => {
    const fromPreview = target === "ORDER_TOTAL" ? preview?.orderDiscountAmount : preview?.shippingDiscountAmount;
    if (fromPreview && fromPreview > 0) return fromPreview;

    // Fallback: Tự tính nếu preview trả về 0 nhưng đã áp voucher
    const v = target === "ORDER_TOTAL" ? appliedOrderVoucher : appliedShippingVoucher;
    if (!v) return 0;

    if (v.discountTarget === "FINAL_PRICE") {
      const base = subtotal + shipping;
      let discountAmount = base > v.discountValue ? base - v.discountValue : 0;
      if (v.maxDiscountCap) {
        discountAmount = Math.min(discountAmount, v.maxDiscountCap);
      }
      return discountAmount;
    }

    const base = target === "ORDER_TOTAL" ? subtotal : shipping;

    if (v.discountType === "PERCENTAGE") {
      const val = (base * v.discountValue) / 100;
      return v.maxDiscountCap ? Math.min(val, v.maxDiscountCap) : val;
    }
    return Math.min(v.discountValue, base);
  };

  const orderDiscount = getDiscount("ORDER_TOTAL");
  const shippingDiscount = getDiscount("SHIPPING_FEE");
  const discount = preview?.discountAmount || (orderDiscount + shippingDiscount);
  // Ưu tiên preview.totalAmount (số BE tính chính xác) để đảm bảo khớp với payment QR
  const total = preview?.totalAmount ?? Math.max(subtotal + shipping - discount, 0);
  const hasEligibleVoucher = useMemo(
    () => voucherList.some((v) => !v.minOrderAmount || subtotal >= v.minOrderAmount),
    [voucherList, subtotal],
  );

  useEffect(() => {
    onTotalChange?.(total);
  }, [total, onTotalChange]);

  const activeAddress = useMemo(() => {
    // Ưu tiên địa chỉ người dùng đang chọn trong form
    if (formData.addressId > 0) {
      return addresses.find((a) => a.addressId === formData.addressId) ?? null;
    }
    // Nếu chưa chọn thì lấy địa chỉ mặc định
    return addresses.find((a) => a.isDefault) ?? addresses[0] ?? null;
  }, [addresses, formData.addressId]);

  // Preview theo đúng dòng đã chọn (khớp POST /checkout)
  // KHÔNG reset appliedXxxVoucherCode ở đây — sẽ gây vòng lặp vô tận
  const fetchPreview = useCallback(
    async (
      addressId: number,
      orderCode: string | undefined,
      shippingCode: string | undefined,
      lines: CheckoutConfirmItem[],
      clearErrors = true,
    ) => {
      setIsPreviewLoading(true);
      if (clearErrors) {
        setOrderVoucherError(null);
        setShippingVoucherError(null);
      }
      try {
        const data = await checkoutApi.previewCheckout({
          addressId,
          paymentMethod,
          orderVoucherCode: orderCode,
          shippingVoucherCode: shippingCode,
          items: lines.length > 0 ? lines : undefined,
        });
        setPreview(data);
        if (data.itemErrors.length > 0) {
          data.itemErrors.forEach((e) => toast.error(e.error));
        }
      } catch (err) {
        setPreview(null);
        const msg = err instanceof Error ? err.message : "Unable to calculate shipping fee.";
        // Only show inline error — DO NOT reset applied code here
        if (orderCode) setOrderVoucherError(msg);
        if (shippingCode) setShippingVoucherError(msg);
        if (!orderCode && !shippingCode) toast.error(msg);
      } finally {
        setIsPreviewLoading(false);
      }
    },
    [paymentMethod],
  );

  useEffect(() => {
    if (!mounted || !isHydrated || !isAuthenticated || formData.addressId <= 0 || checkoutLines.length === 0) return;

    void fetchPreview(
      formData.addressId,
      appliedOrderVoucherCode,
      appliedShippingVoucherCode,
      checkoutLines,
      false,
    );
  }, [
    formData.addressId,
    appliedOrderVoucherCode,
    appliedShippingVoucherCode,
    checkoutLines,
    fetchPreview,
    mounted,
    isHydrated,
    isAuthenticated,
  ]);

  // applyVoucher: validate phía FE, rồi preview thử để kiểm tra backend.
  // Chỉ commit applied code khi preview thành công và có discount > 0.
  // explicitCode: truyền thẳng code (dùng khi gọi từ modal, bỏ qua input state).
  const applyVoucher = useCallback(
    async (target: "ORDER_TOTAL" | "SHIPPING_FEE", explicitVoucher?: IVoucher | string) => {
      const code = typeof explicitVoucher === "string"
        ? explicitVoucher
        : explicitVoucher?.voucherCode
        ?? (target === "ORDER_TOTAL" ? orderVoucherCode : shippingVoucherCode).trim();

      if (!code) {
        toast.error("Please enter a voucher code.");
        return;
      }
      // ... (giữ nguyên validation FE)
      if (target === "ORDER_TOTAL" && code === appliedShippingVoucherCode) {
        setOrderVoucherError("Cannot apply the same voucher code for both order and shipping.");
        return;
      }
      if (target === "SHIPPING_FEE" && code === appliedOrderVoucherCode) {
        setShippingVoucherError("Cannot apply the same voucher code for both order and shipping.");
        return;
      }
      if (target === "SHIPPING_FEE" && shipping <= 0) {
        setShippingVoucherError("Shipping fee not calculated yet. Please select a valid address.");
        return;
      }
      if (formData.addressId <= 0 || checkoutLines.length === 0) {
        toast.error("Please select a shipping address.");
        return;
      }

      if (target === "ORDER_TOTAL") setOrderVoucherError(null);
      else setShippingVoucherError(null);
      setIsPreviewLoading(true);

      try {
        const data = await checkoutApi.previewCheckout({
          addressId: formData.addressId,
          paymentMethod,
          orderVoucherCode: target === "ORDER_TOTAL" ? code : appliedOrderVoucherCode,
          shippingVoucherCode: target === "SHIPPING_FEE" ? code : appliedShippingVoucherCode,
          items: checkoutLines.length > 0 ? checkoutLines : undefined,
        });

        setPreview(data);
        const vObj = typeof explicitVoucher === "object" ? explicitVoucher : voucherList.find(v => v.voucherCode === code) || null;

        if (target === "ORDER_TOTAL") {
          setOrderVoucherCode(code);
          setAppliedOrderVoucherCode(code);
          setAppliedOrderVoucher(vObj);
          setOrderVoucherError(null);
        } else {
          setShippingVoucherCode(code);
          setAppliedShippingVoucherCode(code);
          setAppliedShippingVoucher(vObj);
          setShippingVoucherError(null);
        }

        if (data.itemErrors.length > 0) {
          data.itemErrors.forEach((e) => toast.error(e.error));
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Invalid voucher.";
        if (target === "ORDER_TOTAL") setOrderVoucherError(msg);
        else setShippingVoucherError(msg);
      } finally {
        setIsPreviewLoading(false);
      }
    },
    [
      appliedOrderVoucherCode,
      appliedShippingVoucherCode,
      shipping,
      formData.addressId,
      checkoutLines,
      voucherList,
    ],
  );

  const applyMultipleVouchers = useCallback(
    async (newOrderCode?: string, newShippingCode?: string) => {
      if (formData.addressId <= 0 || checkoutLines.length === 0) {
        toast.error("Please select a shipping address.");
        return;
      }

      setIsPreviewLoading(true);
      setOrderVoucherError(null);
      setShippingVoucherError(null);

      try {
        const orderV = voucherList.find((v) => v.voucherCode === newOrderCode) || null;
        const isCompensation = orderV?.discountTarget === "FINAL_PRICE";

        const finalOrderCode = newOrderCode;
        const finalShippingCode = isCompensation ? undefined : newShippingCode;

        const data = await checkoutApi.previewCheckout({
          addressId: formData.addressId,
          paymentMethod,
          orderVoucherCode: finalOrderCode,
          shippingVoucherCode: finalShippingCode,
          items: checkoutLines.length > 0 ? checkoutLines : undefined,
        });

        setPreview(data);

        if (finalOrderCode) {
          setOrderVoucherCode(finalOrderCode);
          setAppliedOrderVoucherCode(finalOrderCode);
          setAppliedOrderVoucher(orderV);
        } else {
          setOrderVoucherCode("");
          setAppliedOrderVoucherCode(undefined);
          setAppliedOrderVoucher(null);
        }

        if (finalShippingCode) {
          const vObj = voucherList.find((v) => v.voucherCode === finalShippingCode) || null;
          setShippingVoucherCode(finalShippingCode);
          setAppliedShippingVoucherCode(finalShippingCode);
          setAppliedShippingVoucher(vObj);
        } else {
          setShippingVoucherCode("");
          setAppliedShippingVoucherCode(undefined);
          setAppliedShippingVoucher(null);
        }

        if (data.itemErrors.length > 0) {
          data.itemErrors.forEach((e) => toast.error(e.error));
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Invalid voucher.";
        toast.error(msg);
      } finally {
        setIsPreviewLoading(false);
      }
    },
    [formData.addressId, checkoutLines, voucherList, paymentMethod],
  );

  const clearVoucher = useCallback(
    (target: "ORDER_TOTAL" | "SHIPPING_FEE") => {
      if (target === "ORDER_TOTAL") {
        setAppliedOrderVoucherCode(undefined);
        setAppliedOrderVoucher(null);
        setOrderVoucherCode("");
        setOrderVoucherError(null);
      } else {
        setAppliedShippingVoucherCode(undefined);
        setAppliedShippingVoucher(null);
        setShippingVoucherCode("");
        setShippingVoucherError(null);
      }
    },
    [setAppliedOrderVoucher, setAppliedShippingVoucher],
  );

  const addVoucherToList = useCallback((voucher: IVoucher) => {
    setVoucherList((prev) => {
      if (prev.some((v) => v.voucherId === voucher.voucherId)) return prev;
      return [...prev, voucher];
    });
  }, []);

  const loadVouchers = useCallback(async () => {
    setVoucherLoading(true);
    setVoucherError(null);
    try {
      const res = await voucherApi.getVouchers({ status: "Active", pageSize: 100 });
      const now = Date.now();
      const activeVouchers = res.items.filter((v) => {
        if (smartParseDate(v.endDate).getTime() <= now) return false;
        if (v.maxUsagePerUser && v.currentUserUsageCount !== null && v.currentUserUsageCount >= v.maxUsagePerUser) return false;
        return true;
      });
      setVoucherList(activeVouchers);
      setHasLoadedVouchers(true);
    } catch (err) {
      setVoucherError("Unable to load vouchers. Please try again.");
    } finally {
      setVoucherLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isVoucherModalOpen) return;
    const run = async () => {
      await loadVouchers();
    };
    void run();
  }, [isVoucherModalOpen, loadVouchers]);

  useEffect(() => {
    if (!mounted || !isHydrated || !isAuthenticated) return;
    if (formData.addressId <= 0 || checkoutLines.length === 0) return;
    if (hasLoadedVouchers || voucherLoading) return;
    void loadVouchers();
  }, [
    mounted,
    isHydrated,
    isAuthenticated,
    formData.addressId,
    checkoutLines.length,
    hasLoadedVouchers,
    voucherLoading,
    loadVouchers,
  ]);

  const applyBestVoucherForTarget = useCallback(
    async (target: "ORDER_TOTAL" | "SHIPPING_FEE") => {
      if (formData.addressId <= 0 || checkoutLines.length === 0) return;
      if (target === "SHIPPING_FEE" && shipping <= 0) return;

      // If a compensation voucher (FINAL_PRICE) is applied, do not auto-apply shipping voucher
      if (target === "SHIPPING_FEE" && appliedOrderVoucher?.discountTarget === "FINAL_PRICE") {
        return;
      }

      // Code already applied to the other target — exclude it to prevent same-code on both
      const otherApplied =
        target === "ORDER_TOTAL" ? appliedShippingVoucherCode : appliedOrderVoucherCode;

      const hasAppliedShipping = !!appliedShippingVoucherCode;

      const eligible = voucherList
        .filter((v) => v.discountTarget === target || (target === "ORDER_TOTAL" && v.discountTarget === "FINAL_PRICE"))
        .filter((v) => !(v.discountTarget === "FINAL_PRICE" && hasAppliedShipping))
        .filter((v) => (v.minOrderAmount ? subtotal >= v.minOrderAmount : true))
        .filter((v) => v.voucherCode !== otherApplied); // ← same-code cross-target guard
      if (eligible.length === 0) return;

      // Cap at top-5 by face value to limit the number of preview API calls
      const candidates = [...eligible]
        .sort((a, b) => b.discountValue - a.discountValue)
        .slice(0, 5);

      setBestApplyingTarget(target);
      try {
        const previewResults = await Promise.all(
          candidates.map(async (voucher) => {
            try {
              const res = await checkoutApi.previewCheckout({
                addressId: formData.addressId,
                paymentMethod,
                orderVoucherCode: target === "ORDER_TOTAL" ? voucher.voucherCode : undefined,
                shippingVoucherCode: target === "SHIPPING_FEE" ? voucher.voucherCode : undefined,
                items: checkoutLines.length > 0 ? checkoutLines : undefined,
              });
              const discountAmount =
                target === "ORDER_TOTAL"
                  ? (res.orderDiscountAmount ?? res.discountAmount ?? 0)
                  : (res.shippingDiscountAmount ?? res.discountAmount ?? 0);
              return { voucher, discountAmount };
            } catch {
              return { voucher, discountAmount: 0 };
            }
          }),
        );

        const best = previewResults.reduce(
          (acc, cur) => (cur.discountAmount > acc.discountAmount ? cur : acc),
          { voucher: candidates[0], discountAmount: 0 },
        );

        if (best.discountAmount > 0) {
          // Final race-condition same-code guard
          if (best.voucher.voucherCode === otherApplied) return;
          if (target === "ORDER_TOTAL") {
            setOrderVoucherCode(best.voucher.voucherCode);
            setAppliedOrderVoucherCode(best.voucher.voucherCode);
            setAppliedOrderVoucher(best.voucher);
            setOrderVoucherError(null);
          } else {
            setShippingVoucherCode(best.voucher.voucherCode);
            setAppliedShippingVoucherCode(best.voucher.voucherCode);
            setAppliedShippingVoucher(best.voucher);
            setShippingVoucherError(null);
          }
        } else {
          // No eligible voucher produced a non-zero discount — show brief info
          if (target === "ORDER_TOTAL") {
            setOrderVoucherError("No matching order vouchers for this order.");
          } else {
            setShippingVoucherError("No matching shipping vouchers for this order.");
          }
        }
      } finally {
        setBestApplyingTarget(null);
      }
    },
    [
      formData.addressId,
      checkoutLines,
      voucherList,
      subtotal,
      shipping,
      paymentMethod,
      appliedOrderVoucherCode,
      appliedShippingVoucherCode,
      appliedOrderVoucher,
    ],
  );

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

    // Wallet payment requires PIN verification first
    if (paymentMethod === "WALLET") {
      if (isWalletLoading) {
        toast.error("Loading wallet info, please try again in a moment.");
        return;
      }
      if (!isWalletActivated) {
        toast.error("Your wallet is not activated yet. Please activate your wallet in profile settings before placing an order.");
        return;
      }
      setPinError(null);
      setPinRemainingAttempts(null);
      setPinLockedUntil(null);
      setIsPinModalOpen(true);
      return;
    }

    await placeOrder(paymentMethod);
  };

  const handlePinConfirm = async (pin: string) => {
    if (pin.length < 6) return;
    setIsPinVerifying(true);
    setPinError(null);
    try {
      const res = await walletApi.verifyPin({ pin, actionType: "PAYMENT" });

      if (res.lockedUntil) {
        setPinLockedUntil(res.lockedUntil);
        setPinError(null);
        return;
      }

      if (!res.isVerified) {
        setPinRemainingAttempts(res.remainingAttempts);
        setPinError("Incorrect PIN. Please try again.");
        return;
      }

      // PIN correct — proceed to place order
      setIsPinModalOpen(false);
      await placeOrder("WALLET");
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.response?.data?.Message ?? err?.message ?? "PIN verification failed. Please try again.";
      setPinError(msg);
    } finally {
      setIsPinVerifying(false);
    }
  };

  const placeOrder = async (paymentMethod: string) => {
    if (!activeAddress) return;
    setIsOrdering(true);
    try {
      const response = await checkoutApi.confirmCheckout({
        addressId: activeAddress.addressId,
        paymentMethod,
        orderVoucherCode: appliedOrderVoucherCode,
        shippingVoucherCode: appliedShippingVoucherCode,
        // Use the authoritative backend preview value; backend recomputes anyway
        voucherDiscountAmount: preview?.discountAmount ?? 0,
        note: formData.note?.trim() || undefined,
        items: checkoutLines,
      });

      if (paymentMethod === "SE_PAY") {
        if (response.hasExistingPendingOrder) {
          toast("You already have a pending QR payment. Redirecting to it now.", { icon: "⏳" });
        }
        // Navigate with only orderId — sensitive data (QR URL, amount, attemptCode)
        // is fetched client-side via GET /orders/:orderId/payment-info
        router.push(`/checkout/payment?orderId=${response.orderId}`);
      } else {
        // COD / WALLET — trang thành công
        router.push(`/checkout/success?orderId=${response.orderId}&orderCode=${encodeURIComponent(response.orderCode ?? "")}`);
      }
    } catch (error: any) {
      const message = error?.response?.data?.message ?? error?.response?.data?.Message ?? error?.message ?? "Unable to create the order.";
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
    <div className="bg-white rounded-xl border border-gray-200/80 p-5 md:p-6 sticky top-24 overflow-hidden shadow-sm">
      <h2 className="text-xl font-extrabold text-gray-900 tracking-tight pb-4 border-b border-gray-100 mb-5 relative">
        Order Summary
      </h2>

      {/* Product list — chỉ hiển thị sản phẩm đang checkout */}
      <div className="space-y-2 mb-6 max-h-[42vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
        {checkoutLines.length === 0 && (
          <p className="text-sm text-gray-400 font-semibold italic text-center py-4">No items selected for checkout.</p>
        )}
        {items.filter((i) => i.isSelected).map((item) => (
          <div key={item.cartItemId} className="group flex gap-3.5 items-center p-3 rounded-xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100">
            <div className="relative flex-shrink-0">
              <Image
                src={item.mainImageUrl ?? FALLBACK_IMAGE}
                alt={item.productName}
                width={68}
                height={68}
                className="w-[68px] h-[68px] object-cover rounded-lg border border-gray-200/60 shadow-sm transition-transform duration-200 group-hover:scale-102 bg-white"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-gray-850 leading-snug line-clamp-2 mb-2 group-hover:text-[#ff4f00] transition-colors">
                {item.productName}
              </p>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs sm:text-sm font-extrabold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md shrink-0">
                  QTY: {item.quantity}
                </span>
                <span className="text-sm sm:text-base font-black text-[#ff4f00] truncate">
                  {fmt(item.lineTotal)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Unified Voucher Section */}
      <div className="space-y-3 mb-6">
        <button
          type="button"
          onClick={() => setIsVoucherModalOpen(true)}
          className="w-full flex items-center justify-between p-4 bg-white border border-dashed border-gray-300 hover:border-[#ff4f00] rounded-xl transition-all duration-300 relative group overflow-hidden"
        >
          {/* Perforated side cuts */}
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#fafafa] border-r border-gray-200 group-hover:border-[#ff4f00]/50 transition-colors" />
          <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#fafafa] border-l border-gray-200 group-hover:border-[#ff4f00]/50 transition-colors" />

          <div className="flex items-center gap-3.5 pl-2">
            <div className="w-8 h-8 rounded-xl bg-[#ff4f00] flex items-center justify-center text-white shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-[18px] font-bold">confirmation_number</span>
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 leading-none mb-1">Store Offers</p>
              <p className="text-sm font-extrabold text-gray-900 leading-tight">Platform Vouchers</p>
            </div>
          </div>
          <div className="flex items-center gap-2 pr-2">
            {(appliedOrderVoucherCode || appliedShippingVoucherCode) ? (
              <span className="text-[10px] font-black uppercase tracking-wider text-[#ff4f00] bg-[#ff4f00]/10 px-2.5 py-1 rounded-md border border-[#ff4f00]/10">
                Applied
              </span>
            ) : (
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 group-hover:text-[#ff4f00] transition-colors">
                Select Code
              </span>
            )}
            <span className="material-symbols-outlined text-gray-400 group-hover:text-[#ff4f00] group-hover:translate-x-0.5 transition-all text-lg font-bold">
              chevron_right
            </span>
          </div>
        </button>

        {/* Selected Vouchers Display */}
        {appliedOrderVoucherCode && (
          <div className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-gray-200 shadow-sm">
            <span className="material-symbols-outlined text-[#ff4f00] text-[18px] font-bold">check_circle</span>
            <span className="text-xs font-bold text-gray-800 flex-1 truncate">Order: {appliedOrderVoucherCode}</span>
            <span className="text-xs font-black text-[#ff4f00]">-{fmt(orderDiscount)}</span>
            <button onClick={() => clearVoucher("ORDER_TOTAL")} className="ml-2 text-gray-400 hover:text-[#ff4f00]">
              <span className="material-symbols-outlined text-[18px] font-bold">close</span>
            </button>
          </div>
        )}
        {appliedShippingVoucherCode && (
          <div className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-gray-200 shadow-sm">
            <span className="material-symbols-outlined text-[#ff4f00] text-[18px] font-bold">local_shipping</span>
            <span className="text-xs font-bold text-gray-800 flex-1 truncate">Shipping: {appliedShippingVoucherCode}</span>
            <span className="text-xs font-black text-[#ff4f00]">-{fmt(shippingDiscount)}</span>
            <button onClick={() => clearVoucher("SHIPPING_FEE")} className="ml-2 text-gray-400 hover:text-[#ff4f00]">
              <span className="material-symbols-outlined text-[18px] font-bold">close</span>
            </button>
          </div>
        )}
      </div>

      {/* Price breakdown */}
      <div className="space-y-3 border-t border-gray-100 pt-5 mb-5 text-sm">
        <Row label="Subtotal" value={fmt(subtotal)} />
        <Row
          label={isPreviewLoading ? "Est. Shipping Fee (calculating...)" : "Est. Shipping Fee"}
          value={
            shipping > 0
              ? fmt(shipping)
              : (isPreviewLoading || isAddressLoading)
                ? "Loading..."
                : "Select address"
          }
          valueClass={(isPreviewLoading || isAddressLoading) ? "text-gray-400 animate-pulse font-bold" : "text-gray-900 font-black"}
        />
        {(orderDiscount > 0 || shippingDiscount > 0) ? (
          <>
            {orderDiscount > 0 && (
              <Row label="Order Discount" value={`-${fmt(orderDiscount)}`} valueClass="text-emerald-600 font-extrabold bg-emerald-50 border border-emerald-100/50 px-2.5 py-0.5 rounded-md" />
            )}
            {shippingDiscount > 0 && (
              <Row label="Shipping Discount" value={`-${fmt(shippingDiscount)}`} valueClass="text-emerald-600 font-extrabold bg-emerald-50 border border-emerald-100/50 px-2.5 py-0.5 rounded-md" />
            )}
          </>
        ) : discount > 0 ? (
          <Row label="Voucher Discount" value={`-${fmt(discount)}`} valueClass="text-emerald-600 font-extrabold bg-emerald-50 border border-emerald-100/50 px-2.5 py-0.5 rounded-md" />
        ) : null}
      </div>

      {/* Total */}
      <div className="flex items-end justify-between border-t border-gray-200 pt-5 mb-8 relative">
        <span className="text-xs font-black text-gray-500 uppercase tracking-wider mb-1">Total</span>
        <div className="text-right">
          <span className="text-3xl font-black text-[#ff4f00] tracking-tight">
            {fmt(total)}
          </span>
          <p className="text-[9px] text-gray-400 font-black mt-1 uppercase tracking-widest">(VAT included)</p>
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={handleOrder}
        disabled={isOrdering || isAddressLoading || items.length === 0 || checkoutLines.length === 0 || (preview?.itemErrors?.length ?? 0) > 0}
        className="group relative overflow-hidden w-full bg-[#ff4f00] hover:bg-[#ff5f1a] disabled:bg-gray-300 text-white font-black text-sm uppercase tracking-wider py-4 rounded-xl shadow-sm hover:shadow active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
      >
        {isOrdering ? (
          <>
            <svg className="w-5 h-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Processing...
          </>
        ) : (
          <>
            <span>Place Order Now</span>
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </>
        )}
      </button>

      {(preview?.itemErrors?.length ?? 0) > 0 && (
        <p className="text-xs text-center text-red-600 font-bold mt-3">
          Please check your items — some products are unavailable.
        </p>
      )}
      {isVoucherModalOpen && (
        <UnifiedVoucherModal
          subtotal={subtotal}
          vouchers={voucherList}
          loading={voucherLoading}
          error={voucherError}
          initialOrderCode={appliedOrderVoucherCode}
          initialShippingCode={appliedShippingVoucherCode}
          onClose={() => setIsVoucherModalOpen(false)}
          onApply={async (oCode, sCode) => {
            setIsVoucherModalOpen(false);
            if (oCode !== appliedOrderVoucherCode || sCode !== appliedShippingVoucherCode) {
              await applyMultipleVouchers(oCode, sCode);
            }
          }}
          onAddVoucher={addVoucherToList}
        />
      )}

      {/* Wallet PIN Modal */}
      <WalletPinModal
        isOpen={isPinModalOpen}
        isVerifying={isPinVerifying}
        errorMessage={pinError}
        remainingAttempts={pinRemainingAttempts}
        lockedUntil={pinLockedUntil}
        onConfirm={(pin) => void handlePinConfirm(pin)}
        onCancel={() => {
          if (!isPinVerifying) {
            setIsPinModalOpen(false);
            setPinError(null);
          }
        }}
      />
    </div>
  );
}

function Row({
  label,
  value,
  valueClass = "text-[#201515] font-black",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex justify-between items-center text-[#605d52] font-semibold text-xs">
      <span>{label}</span>
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
  onClear,
  applied,
  appliedLabel,
  disabled,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  onApply: () => void;
  onClear: () => void;
  applied: boolean;
  appliedLabel: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">{label}</p>
      {applied ? (
        <div className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-green-200">
          <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-xs font-bold text-green-700">{appliedLabel}</span>
          <button
            type="button"
            onClick={onClear}
            className="ml-auto text-xs font-black text-green-700 hover:text-green-800"
          >
            Remove
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className="flex-1 text-sm rounded-xl border border-gray-200 bg-white focus:border-[#ff4f00] focus:ring-2 focus:ring-[#ff4f00]/10 px-3 py-2.5 outline-none transition-all font-semibold placeholder:text-gray-400 disabled:opacity-60 disabled:cursor-not-allowed text-gray-900"
          />
          <button
            type="button"
            onClick={onApply}
            disabled={disabled}
            className="px-4 py-2.5 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-black rounded-xl transition-colors whitespace-nowrap uppercase tracking-wider"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
}

function UnifiedVoucherModal({
  subtotal,
  vouchers,
  loading,
  error,
  initialOrderCode,
  initialShippingCode,
  onClose,
  onApply,
  onAddVoucher,
}: {
  subtotal: number;
  vouchers: IVoucher[];
  loading: boolean;
  error: string | null;
  initialOrderCode?: string;
  initialShippingCode?: string;
  onClose: () => void;
  onApply: (orderCode?: string, shippingCode?: string) => void;
  onAddVoucher: (voucher: IVoucher) => void;
}) {
  const [selectedOrderCode, setSelectedOrderCode] = useState<string | undefined>(initialOrderCode);
  const [selectedShippingCode, setSelectedShippingCode] = useState<string | undefined>(initialShippingCode);
  const [typedCode, setTypedCode] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);
  const [isSearchingCode, setIsSearchingCode] = useState(false);
  const [now] = useState(() => Date.now());

  const selectedOrderVoucher = vouchers.find((v) => v.voucherCode === selectedOrderCode);
  const isCompensationSelected = selectedOrderVoucher?.discountTarget === "FINAL_PRICE";

  const formatCurrency = (value: number) => value.toLocaleString("vi-VN") + " ₫";
  const formatDate = (dateString: string) => {
    const date = smartParseDate(dateString);
    if (isNaN(date.getTime())) return "---";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const isEligible = (voucher: IVoucher) => {
    if (smartParseDate(voucher.startDate).getTime() > now) return false;
    if (voucher.minOrderAmount && subtotal < voucher.minOrderAmount) return false;
    return true;
  };

  const orderVouchers = vouchers.filter((v) => v.discountTarget === "ORDER_TOTAL" || v.discountTarget === "FINAL_PRICE");
  const shippingVouchers = vouchers.filter((v) => v.discountTarget === "SHIPPING_FEE");

  const handleApplyTypedCode = async () => {
    const code = typedCode.trim().toUpperCase();
    if (!code) {
      setInputError("Please enter a voucher code.");
      return;
    }

    setIsSearchingCode(true);
    setInputError(null);

    try {
      let matchedVoucher = vouchers.find(
        (v) => v.voucherCode.trim().toUpperCase() === code
      );

      if (!matchedVoucher) {
        const res = await voucherApi.getVouchers({ searchTerm: code, status: "Active", pageSize: 5 });
        const backendVoucher = res.items.find(
          (v) => v.voucherCode.trim().toUpperCase() === code
        );
        if (backendVoucher) {
          matchedVoucher = backendVoucher;
          onAddVoucher(backendVoucher);
        }
      }

      if (!matchedVoucher) {
        setInputError("Voucher code not found or expired.");
        return;
      }

      // Check eligibility
      if (!isEligible(matchedVoucher)) {
        if (matchedVoucher.minOrderAmount && subtotal < matchedVoucher.minOrderAmount) {
          setInputError(`This voucher requires a minimum spend of ${formatCurrency(matchedVoucher.minOrderAmount)}.`);
        } else {
          setInputError("This voucher is not eligible for your order.");
        }
        return;
      }

      // Check if trying to apply a regular voucher when compensation voucher is selected
      if (isCompensationSelected && matchedVoucher.discountTarget !== "FINAL_PRICE") {
        setInputError("Remove the compensation voucher to apply a regular voucher.");
        return;
      }

      // Select it
      if (matchedVoucher.discountTarget === "ORDER_TOTAL" || matchedVoucher.discountTarget === "FINAL_PRICE") {
        if (matchedVoucher.discountTarget === "FINAL_PRICE") {
          setSelectedShippingCode(undefined);
          toast.success(`Applied Compensation Voucher: ${matchedVoucher.voucherCode}. Shipping discount cleared.`);
        } else {
          toast.success(`Applied Discount Voucher: ${matchedVoucher.voucherCode}`);
        }
        setSelectedOrderCode(matchedVoucher.voucherCode);
      } else {
        setSelectedShippingCode(matchedVoucher.voucherCode);
        toast.success(`Applied Free Shipping Voucher: ${matchedVoucher.voucherCode}`);
      }
      setTypedCode("");
      setInputError(null);
    } catch (err) {
      setInputError("Unable to verify voucher. Please try again.");
    } finally {
      setIsSearchingCode(false);
    }
  };

  const renderVoucherCard = (voucher: IVoucher) => {
    const eligible = isEligible(voucher);
    const isOrderTarget = voucher.discountTarget === "ORDER_TOTAL" || voucher.discountTarget === "FINAL_PRICE";
    const selectedCode = isOrderTarget ? selectedOrderCode : selectedShippingCode;
    const isSelected = voucher.voucherCode === selectedCode;
    const remainingUsage = voucher.maxUsagePerUser !== null
      ? Math.max(0, voucher.maxUsagePerUser - (voucher.currentUserUsageCount ?? 0))
      : null;

    const isLocked = isCompensationSelected && !isSelected;

    const toggleSelect = () => {
      if (!eligible) return;
      if (isOrderTarget) {
        if (voucher.discountTarget === "FINAL_PRICE") {
          if (!isSelected) {
            setSelectedShippingCode(undefined);
            setSelectedOrderCode(voucher.voucherCode);
            toast.success(`Applied Compensation Voucher: ${voucher.voucherCode}. Shipping discount cleared.`);
          } else {
            setSelectedOrderCode(undefined);
          }
        } else {
          if (isCompensationSelected) {
            toast.error("Remove the compensation voucher to select a regular voucher.");
            return;
          }
          setSelectedOrderCode(isSelected ? undefined : voucher.voucherCode);
        }
      } else {
        if (isCompensationSelected) {
          toast.error("Remove the compensation voucher to apply a shipping voucher.");
          return;
        }
        setSelectedShippingCode(isSelected ? undefined : voucher.voucherCode);
      }
    };

    return (
      <div
        key={voucher.voucherId}
        onClick={toggleSelect}
        className={`relative flex flex-row h-[116px] w-full transition-all border rounded-xl overflow-hidden filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.06)] ${(!eligible || isLocked)
          ? "opacity-60 grayscale cursor-not-allowed border-gray-200 bg-gray-50"
          : isSelected
            ? isOrderTarget
              ? "border-[#ff4f00] ring-1 ring-[#ff4f00] cursor-pointer bg-white"
              : "border-emerald-500 ring-1 ring-emerald-500 cursor-pointer bg-white"
            : "border-gray-200 hover:border-gray-400 cursor-pointer hover:shadow-sm bg-white"
          }`}
      >
        {/* Left side: Image/Ticket Edge with Shopee-style perforations */}
        <div
          className="relative w-[116px] shrink-0 bg-slate-100 flex items-center justify-center overflow-hidden"
          style={{
            maskImage:
              "radial-gradient(circle at 0px 6px, transparent 3px, black 3.5px)",
            WebkitMaskImage:
              "radial-gradient(circle at 0px 6px, transparent 3px, black 3.5px)",
            maskSize: "100% 12px",
            WebkitMaskSize: "100% 12px",
            maskRepeat: "repeat-y",
            WebkitMaskRepeat: "repeat-y",
          }}
        >
          <div className={`w-full h-full flex flex-col items-center justify-center text-white px-2 ${isOrderTarget ? "bg-orange-500" : "bg-emerald-500"
            }`}>
            <span className="material-symbols-outlined text-4xl">
              {isOrderTarget ? "confirmation_number" : "local_shipping"}
            </span>
            <span className="text-[10px] font-bold tracking-widest mt-1 text-center uppercase">
              {isOrderTarget ? "Voucher" : "Shipping"}
            </span>
          </div>
        </div>

        {/* Right side: Content */}
        <div className="grow bg-white p-3 flex flex-row relative min-w-0">
          {/* Info Column */}
          <div className="grow flex flex-col justify-between min-w-0 pr-8">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border uppercase tracking-wider shrink-0 font-mono ${isOrderTarget
                  ? "bg-[#ff4f00]/10 text-[#ff4f00] border-[#ff4f00]/15"
                  : "bg-emerald-50 text-emerald-600 border-emerald-100"
                  }`}>
                  {voucher.voucherCode}
                </span>
              </div>
              <h3
                className="text-slate-900 text-xs font-bold leading-tight line-clamp-2"
                title={voucher.voucherName}
              >
                {voucher.voucherName}
              </h3>
              <p className="text-[10px] text-slate-500 mt-1 truncate">
                Minimum spend{" "}
                {voucher.minOrderAmount
                  ? formatCurrency(voucher.minOrderAmount)
                  : "0 ₫"}
              </p>
            </div>

            <div className="flex items-center gap-1">
              <span
                className="material-symbols-outlined text-slate-400"
                style={{
                  fontSize: "16px",
                  fontVariationSettings:
                    '"FILL" 0, "wght" 300, "GRAD" 0, "opsz" 20',
                }}
              >
                schedule
              </span>
              <p className="text-[10px] text-slate-500">
                {new Date(voucher.startDate).getTime() > Date.now()
                  ? `Starts: ${formatDate(voucher.startDate)}`
                  : `HSD: ${formatDate(voucher.endDate)}`}
              </p>
            </div>
          </div>

          {/* Max Usage Ribbon - Shopee Style at Top Right */}
          {remainingUsage !== null && (
            <div className="absolute top-1 -right-1 z-20 flex flex-col items-end">
              <div className="bg-red-50 text-red-600 text-[10px] px-2.5 rounded-l-full border border-red-100 shadow-sm whitespace-nowrap font-bold">
                x{remainingUsage}
              </div>
              {/* The Fold */}
              <div className="w-1 h-1 bg-red-700 [clip-path:polygon(0_0,100%_0,0_100%)]"></div>
            </div>
          )}

          {/* Selection indicator inside card */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected
              ? isOrderTarget
                ? "border-[#ff4f00] bg-[#ff4f00]"
                : "border-emerald-500 bg-emerald-500"
              : "border-gray-300"
              }`}>
              {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/50" onClick={onClose} />

      {/* Card */}
      <div className="relative w-full max-w-lg rounded-xl bg-white border border-gray-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150 flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="bg-gray-900 px-6 py-5 text-white border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-white text-[20px]">
                  confirmation_number
                </span>
              </div>
              <div>
                <h3 className="text-base font-black leading-tight tracking-tight uppercase">Platform Vouchers</h3>
                <p className="text-xs text-gray-400 font-semibold mt-0.5">
                  Select up to 1 voucher per category
                </p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors">
              <span className="material-symbols-outlined text-white text-[18px] font-bold">close</span>
            </button>
          </div>
        </div>

        {/* Voucher Code Input */}
        <div className="px-6 py-4 bg-white border-b border-gray-100 flex flex-col gap-2">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder={isSearchingCode ? "Verifying..." : "Enter voucher code (e.g. TOY100K)"}
              value={typedCode}
              disabled={isSearchingCode}
              onChange={(e) => {
                setTypedCode(e.target.value);
                setInputError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isSearchingCode) void handleApplyTypedCode();
              }}
              className="flex-1 px-4 py-2.5 border border-gray-200 bg-white rounded-xl text-sm font-semibold placeholder:text-gray-400 focus:outline-none focus:border-[#ff4f00] focus:ring-1 focus:ring-[#ff4f00] uppercase text-gray-900 disabled:opacity-60"
            />
            <button
              type="button"
              disabled={isSearchingCode}
              onClick={() => void handleApplyTypedCode()}
              className="px-5 py-2.5 bg-gray-900 hover:bg-gray-855 disabled:opacity-50 text-white rounded-xl text-xs font-black shadow transition-colors shrink-0 uppercase tracking-wider"
            >
              {isSearchingCode ? "Verifying..." : "Apply"}
            </button>
          </div>
          {inputError && (
            <div className="flex items-center gap-1.5 text-red-500 pl-1 text-[11.5px] font-bold animate-in fade-in duration-200">
              <span className="material-symbols-outlined text-[15px]">error</span>
              {inputError}
            </div>
          )}
        </div>

        <div className="px-6 py-5 overflow-y-auto grow bg-gray-50/80 space-y-6">
          {loading && <p className="text-sm text-center text-gray-400 py-10 font-semibold animate-pulse">Loading vouchers...</p>}
          {error && <p className="text-sm text-center text-red-500 py-10 font-semibold">{error}</p>}
          {!loading && !error && vouchers.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center opacity-60">
              <span className="material-symbols-outlined text-4xl mb-3 text-gray-300">confirmation_number</span>
              <p className="text-sm font-black text-gray-400">No vouchers available</p>
            </div>
          )}

          {!loading && !error && vouchers.length > 0 && (
            <>
              {/* Group 1: Order Vouchers */}
              {orderVouchers.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5 pl-1">
                    <span className="material-symbols-outlined text-[15px] text-[#ff4f00] font-bold">sell</span>
                    Order Discount Vouchers ({orderVouchers.length})
                  </h4>
                  <div className="space-y-4">
                    {orderVouchers.map((voucher) => renderVoucherCard(voucher))}
                  </div>
                </div>
              )}

              {/* Group 2: Shipping Vouchers */}
              {shippingVouchers.length > 0 && (
                <div className={orderVouchers.length > 0 ? "pt-4 border-t border-gray-200/60" : ""}>
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5 pl-1">
                    <span className="material-symbols-outlined text-[15px] text-[#ff4f00] font-bold">local_shipping</span>
                    Free Shipping Vouchers ({shippingVouchers.length})
                  </h4>
                  <div className="space-y-4">
                    {shippingVouchers.map((voucher) => renderVoucherCard(voucher))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="p-4 border-t border-gray-100 bg-white">
          <button
            onClick={() => onApply(selectedOrderCode, selectedShippingCode)}
            className="w-full bg-[#ff4f00] hover:bg-[#ff5f1a] text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-wider shadow-sm transition-all"
          >
            Confirm Selection
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(modalContent, document.body)
    : null;
}
