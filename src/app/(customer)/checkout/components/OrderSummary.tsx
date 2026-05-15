"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
  const [voucherModalTarget, setVoucherModalTarget] = useState<"ORDER_TOTAL" | "SHIPPING_FEE">("ORDER_TOTAL");
  const [voucherList, setVoucherList] = useState<IVoucher[]>([]);
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [hasLoadedVouchers, setHasLoadedVouchers] = useState(false);
  const [bestApplyingTarget, setBestApplyingTarget] = useState<"ORDER_TOTAL" | "SHIPPING_FEE" | null>(null);
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
  const subtotal = preview?.subTotal ?? selectedSubtotal;
  const shipping = preview?.shippingFee ?? 0;

  // Tính toán discount với fallback cực mạnh
  const getDiscount = (target: "ORDER_TOTAL" | "SHIPPING_FEE") => {
    const fromPreview = target === "ORDER_TOTAL" ? preview?.orderDiscountAmount : preview?.shippingDiscountAmount;
    if (fromPreview && fromPreview > 0) return fromPreview;

    // Fallback: Tự tính nếu preview trả về 0 nhưng đã áp voucher
    const v = target === "ORDER_TOTAL" ? appliedOrderVoucher : appliedShippingVoucher;
    if (!v) return 0;

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
        const msg = err instanceof Error ? err.message : "Không thể tính phí ship.";
        // Chỉ hiển thị lỗi inline — KHÔNG reset applied code ở đây
        if (orderCode) setOrderVoucherError(msg);
        if (shippingCode) setShippingVoucherError(msg);
        if (!orderCode && !shippingCode) toast.error(msg);
      } finally {
        setIsPreviewLoading(false);
      }
    },
    [],
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
        toast.error("Vui lòng nhập mã voucher.");
        return;
      }
      // ... (giữ nguyên validation FE)
      if (target === "ORDER_TOTAL" && code === appliedShippingVoucherCode) {
        setOrderVoucherError("Không thể áp dụng cùng một mã cho đơn hàng và vận chuyển.");
        return;
      }
      if (target === "SHIPPING_FEE" && code === appliedOrderVoucherCode) {
        setShippingVoucherError("Không thể áp dụng cùng một mã cho đơn hàng và vận chuyển.");
        return;
      }
      if (target === "SHIPPING_FEE" && shipping <= 0) {
        setShippingVoucherError("Chưa tính được phí vận chuyển. Vui lòng chọn địa chỉ hợp lệ.");
        return;
      }
      if (formData.addressId <= 0 || checkoutLines.length === 0) {
        toast.error("Vui lòng chọn địa chỉ giao hàng.");
        return;
      }

      if (target === "ORDER_TOTAL") setOrderVoucherError(null);
      else setShippingVoucherError(null);
      setIsPreviewLoading(true);

      try {
        const data = await checkoutApi.previewCheckout({
          addressId: formData.addressId,
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
        const msg = err instanceof Error ? err.message : "Voucher không hợp lệ.";
        if (target === "ORDER_TOTAL") setOrderVoucherError(msg);
        else setShippingVoucherError(msg);
      } finally {
        setIsPreviewLoading(false);
      }
    },
    [
      orderVoucherCode,
      shippingVoucherCode,
      appliedOrderVoucherCode,
      appliedShippingVoucherCode,
      shipping,
      formData.addressId,
      checkoutLines,
      voucherList,
      setAppliedOrderVoucher,
      setAppliedShippingVoucher,
    ],
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

  const loadVouchers = useCallback(async () => {
    setVoucherLoading(true);
    setVoucherError(null);
    try {
      const res = await voucherApi.getVouchers({ status: "Active", pageSize: 100 });
      const now = Date.now();
      const activeVouchers = res.items.filter((v) => new Date(v.endDate).getTime() > now);
      setVoucherList(activeVouchers);
      setHasLoadedVouchers(true);
    } catch (err) {
      setVoucherError("Không thể tải voucher. Vui lòng thử lại.");
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

      // Code already applied to the other target — exclude it to prevent same-code on both
      const otherApplied =
        target === "ORDER_TOTAL" ? appliedShippingVoucherCode : appliedOrderVoucherCode;

      const eligible = voucherList
        .filter((v) => v.discountTarget === target)
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
            setOrderVoucherError(null);
          } else {
            setShippingVoucherCode(best.voucher.voucherCode);
            setAppliedShippingVoucherCode(best.voucher.voucherCode);
            setShippingVoucherError(null);
          }
        } else {
          // No eligible voucher produced a non-zero discount — show brief info
          if (target === "ORDER_TOTAL") {
            setOrderVoucherError("Không có voucher đơn hàng nào phù hợp với đơn hiện tại.");
          } else {
            setShippingVoucherError("Không có voucher vận chuyển nào phù hợp với đơn hiện tại.");
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
      appliedOrderVoucherCode,
      appliedShippingVoucherCode,
    ],
  );

  const handleOrder = async () => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để đặt hàng.");
      return;
    }

    if (!cart || items.length === 0) {
      toast.error("Giỏ hàng trống.");
      return;
    }

    if (checkoutLines.length === 0) {
      toast.error("Vui lòng chọn ít nhất một sản phẩm để thanh toán.");
      return;
    }

    if (!activeAddress) {
      toast.error("Vui lòng chọn địa chỉ giao hàng.");
      return;
    }

    const paymentMethod = PAYMENT_METHOD_MAP[formData.payment] ?? "SHIP_COD";

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
      const message = error instanceof Error ? error.message : "Không thể tạo đơn hàng.";
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
        <p className="text-sm font-bold text-gray-400 animate-pulse">Đang chuẩn bị đơn hàng...</p>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-2xl rounded-[2rem] border border-white/60 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)] p-5 md:p-6 lg:p-7 sticky top-24 overflow-hidden">
      {/* Decorative top blur */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#ff6a00]/10 rounded-full blur-3xl pointer-events-none" />

      <h2 className="text-xl font-extrabold text-gray-900 tracking-tight pb-4 border-b border-gray-100/80 mb-5 relative">
        Tóm tắt đơn hàng
      </h2>

      {/* Product list — chỉ hiển thị sản phẩm đang checkout */}
      <div className="space-y-2 mb-6 max-h-[42vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
        {checkoutLines.length === 0 && (
          <p className="text-sm text-gray-400 font-medium italic text-center py-4">Chưa có sản phẩm nào được chọn.</p>
        )}
        {items.filter((i) => i.isSelected).map((item) => (
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
                  {fmt(item.lineTotal)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Voucher input */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Voucher đơn hàng
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={bestApplyingTarget === "ORDER_TOTAL" || !hasLoadedVouchers || isPreviewLoading}
              onClick={() => void applyBestVoucherForTarget("ORDER_TOTAL")}
              className="text-[11px] font-bold text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-60"
            >
              Tự chọn tốt nhất
            </button>
            <button
              type="button"
              onClick={() => {
                setVoucherModalTarget("ORDER_TOTAL");
                setIsVoucherModalOpen(true);
              }}
              className="text-[11px] font-bold text-[#ff6a00] hover:text-[#ff4500] transition-colors"
            >
              Chọn voucher
            </button>
          </div>
        </div>
        <CouponInput
          label="Mã giảm giá đơn hàng"
          placeholder="Nhập mã voucher..."
          value={orderVoucherCode}
          onChange={setOrderVoucherCode}
          onApply={() => void applyVoucher("ORDER_TOTAL")}
          onClear={() => clearVoucher("ORDER_TOTAL")}
          applied={!!appliedOrderVoucherCode}
          appliedLabel={orderDiscount > 0 ? `-${fmt(orderDiscount)}` : isPreviewLoading ? "Đang tính..." : "Đã áp dụng"}
          disabled={isPreviewLoading}
        />
        {orderVoucherError && (
          <p className="text-xs text-red-600 font-semibold">
            {orderVoucherError}
          </p>
        )}

        <div className="flex items-center justify-between pt-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Voucher vận chuyển
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={bestApplyingTarget === "SHIPPING_FEE" || !hasLoadedVouchers || isPreviewLoading}
              onClick={() => void applyBestVoucherForTarget("SHIPPING_FEE")}
              className="text-[11px] font-bold text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-60"
            >
              Tự chọn tốt nhất
            </button>
            <button
              type="button"
              onClick={() => {
                setVoucherModalTarget("SHIPPING_FEE");
                setIsVoucherModalOpen(true);
              }}
              className="text-[11px] font-bold text-[#ff6a00] hover:text-[#ff4500] transition-colors"
            >
              Chọn voucher
            </button>
          </div>
        </div>
        <CouponInput
          label="Mã giảm phí vận chuyển"
          placeholder="Nhập mã voucher..."
          value={shippingVoucherCode}
          onChange={setShippingVoucherCode}
          onApply={() => void applyVoucher("SHIPPING_FEE")}
          onClear={() => clearVoucher("SHIPPING_FEE")}
          applied={!!appliedShippingVoucherCode}
          appliedLabel={shippingDiscount > 0 ? `-${fmt(shippingDiscount)}` : isPreviewLoading ? "Đang tính..." : "Đã áp dụng"}
          disabled={isPreviewLoading}
        />
        {shippingVoucherError && (
          <p className="text-xs text-red-600 font-semibold">
            {shippingVoucherError}
          </p>
        )}
      </div>

      {/* Price breakdown */}
      <div className="space-y-3 border-t border-gray-100/80 pt-5 mb-5 text-sm">
        <Row label="Tạm tính" value={fmt(subtotal)} />
        <Row
          label={isPreviewLoading ? "Phí vận chuyển (đang tính...)" : "Phí vận chuyển"}
          value={
            shipping > 0
              ? fmt(shipping)
              : (isPreviewLoading || isAddressLoading)
                ? "Đang tải..."
                : "Chọn địa chỉ"
          }
          valueClass={(isPreviewLoading || isAddressLoading) ? "text-gray-400 animate-pulse font-medium" : "text-gray-900 font-bold"}
        />
        {(orderDiscount > 0 || shippingDiscount > 0) ? (
          <>
            {orderDiscount > 0 && (
              <Row label="Giảm đơn hàng" value={`-${fmt(orderDiscount)}`} valueClass="text-emerald-500 font-bold bg-emerald-50 px-2 py-0.5 rounded-md" />
            )}
            {shippingDiscount > 0 && (
              <Row label="Giảm vận chuyển" value={`-${fmt(shippingDiscount)}`} valueClass="text-emerald-500 font-bold bg-emerald-50 px-2 py-0.5 rounded-md" />
            )}
          </>
        ) : discount > 0 ? (
          <Row label="Giảm giá voucher" value={`-${fmt(discount)}`} valueClass="text-emerald-500 font-bold bg-emerald-50 px-2 py-0.5 rounded-md" />
        ) : null}
      </div>

      {/* Total */}
      <div className="flex items-end justify-between border-t border-gray-200 pt-5 mb-8 relative">
        <span className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Tổng cộng</span>
        <div className="text-right">
          <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#ff6a00] to-[#ff4500] tracking-tight">
            {fmt(total)}
          </span>
          <p className="text-[10px] text-gray-400 font-medium mt-1 uppercase tracking-widest">(Đã bao gồm VAT)</p>
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={handleOrder}
        disabled={isOrdering || isAddressLoading || items.length === 0 || checkoutLines.length === 0 || (preview?.itemErrors?.length ?? 0) > 0}
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
            Đang xử lý...
          </>
        ) : (
          <>
            <span className="text-lg">Đặt hàng ngay</span>
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </>
        )}
      </button>

      {(preview?.itemErrors?.length ?? 0) > 0 && (
        <p className="text-xs text-center text-red-600 font-semibold mt-3">
          Vui lòng kiểm tra lại sản phẩm — có mặt hàng không khả dụng.
        </p>
      )}

      <p className="text-[11px] text-center text-gray-400 mt-4 font-medium">
        Bằng việc đặt hàng, bạn đồng ý với{" "}
        <a href="#" className="text-[#ff6a00] hover:text-[#ff4500] hover:underline transition-colors font-bold">Điều khoản dịch vụ</a> của ShopX.
      </p>

      {isVoucherModalOpen && (
        <VoucherModal
          subtotal={subtotal}
          target={voucherModalTarget}
          vouchers={voucherList}
          loading={voucherLoading}
          error={voucherError}
          selectedCode={
            voucherModalTarget === "ORDER_TOTAL"
              ? appliedOrderVoucherCode
              : appliedShippingVoucherCode
          }
          onClose={() => setIsVoucherModalOpen(false)}
          onSelect={(voucher) => {
            // Đóng modal rồi apply đúng luồng (preview → validate → commit giá)
            setIsVoucherModalOpen(false);
            void applyVoucher(voucherModalTarget, voucher);
          }}
        />
      )}
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
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">{label}</p>
      {applied ? (
        <div className="flex items-center gap-2 p-2.5 bg-green-50 rounded-xl border border-green-200">
          <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-xs font-bold text-green-700">{appliedLabel}</span>
          <button
            type="button"
            onClick={onClear}
            className="ml-auto text-[11px] font-bold text-green-700 hover:text-green-800"
          >
            Bỏ voucher
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
            className="flex-1 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#ff6a00] focus:ring-2 focus:ring-[#ff6a00]/20 px-3 py-2.5 outline-none transition-all font-medium placeholder:text-gray-300 disabled:opacity-60 disabled:cursor-not-allowed"
          />
          <button
            type="button"
            onClick={onApply}
            disabled={disabled}
            className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 text-xs font-bold rounded-xl transition-colors whitespace-nowrap"
          >
            Áp dụng
          </button>
        </div>
      )}
    </div>
  );
}

function VoucherModal({
  subtotal,
  target,
  vouchers,
  loading,
  error,
  selectedCode,
  onClose,
  onSelect,
}: {
  subtotal: number;
  target: "ORDER_TOTAL" | "SHIPPING_FEE";
  vouchers: IVoucher[];
  loading: boolean;
  error: string | null;
  selectedCode?: string;
  onClose: () => void;
  onSelect: (voucher: IVoucher) => void;
}) {
  const formatCurrency = (value: number) => value.toLocaleString("vi-VN") + " ₫";
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  const isEligible = (voucher: IVoucher) => {
    if (voucher.minOrderAmount && subtotal < voucher.minOrderAmount) return false;
    return true;
  };

  const filteredVouchers = vouchers.filter((v) => v.discountTarget === target);
  const targetLabel = target === "ORDER_TOTAL" ? "Đơn hàng" : "Vận chuyển";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-extrabold text-gray-900">Chọn voucher</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Chỉ hiển thị voucher đang hoạt động cho {targetLabel.toLowerCase()}.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
          >
            <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-5 py-4 max-h-[70vh] overflow-y-auto">
          {loading && (
            <p className="text-sm text-gray-400">Đang tải voucher...</p>
          )}
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
          {!loading && !error && filteredVouchers.length === 0 && (
            <p className="text-sm text-gray-400">Không có voucher khả dụng.</p>
          )}
          <div className="space-y-3">
            {filteredVouchers.map((voucher) => {
              const eligible = isEligible(voucher);
              const isSelected = voucher.voucherCode === selectedCode;
              const discountLabel =
                voucher.discountType === "PERCENTAGE"
                  ? `${voucher.discountValue}%`
                  : formatCurrency(voucher.discountValue);
              return (
                <div
                  key={voucher.voucherId}
                  className="flex items-center justify-between gap-4 border border-gray-100 rounded-xl p-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {voucher.voucherName}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Mã: <span className="font-mono font-bold text-orange-600">{voucher.voucherCode}</span>
                    </p>
                    <p className="text-xs text-gray-500">
                      Giảm: <span className="font-semibold">{discountLabel}</span>
                      {voucher.minOrderAmount
                        ? ` · Đơn tối thiểu ${formatCurrency(voucher.minOrderAmount)}`
                        : ""}
                    </p>
                    <p className="text-[11px] text-gray-400">HSD: {formatDate(voucher.endDate)}</p>
                  </div>
                  <button
                    disabled={!eligible || isSelected}
                    onClick={() => onSelect(voucher)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                      isSelected
                        ? "bg-emerald-100 text-emerald-700 cursor-default"
                        : eligible
                          ? "bg-orange-500 hover:bg-orange-600 text-white"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {isSelected ? "Đã chọn" : eligible ? "Áp dụng" : "Chưa đủ điều kiện"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
