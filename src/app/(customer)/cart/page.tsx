"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuthContext } from "@/context/AuthContext";
import { useCart } from "@/features/cart/context/CartContext";
import { useTracking } from "@/hooks/useTracking";
import { checkoutApi } from "@/features/checkout/services/checkout-api";
import ConfirmModal from "@/components/common/ConfirmModal";
import {
  CART_MAX_SUBTOTAL,
  CART_MAX_SUBTOTAL_ERROR_MESSAGE,
} from "@/features/cart/types/cart";

const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const formatPrice = (value: number) => currency.format(value);

const isReadOnlyItemStatus = (status: string): boolean => {
  const normalized = status.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  return normalized === "INACTIVE" || normalized === "OUTOFSTOCK" || normalized === "DISCONTINUED";
};

export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useAuthContext();
  const { cart, isLoading, updateQuantity, removeItem, refreshCart } = useCart();
  const { trackRemoveFromCart } = useTracking();
  const [pendingItemId, setPendingItemId] = useState<number | null>(null);
  const [pendingSepay, setPendingSepay] = useState<{ orderId: number; orderCode: string } | null>(null);
  const [isCancelQRModalOpen, setIsCancelQRModalOpen] = useState(false);
  const [isCancellingQR, setIsCancellingQR] = useState(false);

  // Fetch once on mount to detect any pending QR order.
  // Optimisation: if the user just came from an expired QR page, sessionStorage holds the
  // orderId that just expired.  We skip showing that order in the banner immediately and
  // let the background API call confirm the state — zero visible delay.
  useEffect(() => {
    if (!isHydrated || !isAuthenticated) return;

    // Read & consume the "just expired" signal written by QRPaymentContent
    let justExpiredId: number | null = null;
    try {
      const raw = sessionStorage.getItem("sepay_just_expired");
      if (raw) {
        justExpiredId = Number(raw);
        sessionStorage.removeItem("sepay_just_expired");
      }
    } catch { /* sessionStorage unavailable (SSR/private mode) — ignore */ }

    checkoutApi.getPendingSepayOrder()
      .then((result) => {
        // If the order that just expired is the one still returned as PENDING
        // (backend worker hasn't run yet), optimistically suppress the banner.
        if (result && justExpiredId && result.orderId === justExpiredId) {
          setPendingSepay(null);
        } else {
          setPendingSepay(result);
        }
      })
      .catch(() => null);
  }, [isAuthenticated, isHydrated]);

  // Poll every 20s ONLY while there is an active pending QR order,
  // so we detect expiry/cancellation from the server side promptly.
  useEffect(() => {
    if (!isHydrated || !isAuthenticated || !pendingSepay) return;
    const interval = setInterval(() => {
      checkoutApi.getPendingSepayOrder()
        .then(setPendingSepay)   // resolves to null → clears banner
        .catch(() => null);
    }, 20_000);
    return () => clearInterval(interval);
  }, [isAuthenticated, isHydrated, pendingSepay]);

  const items = useMemo(() => cart?.items ?? [], [cart]);

  const { availableItems, unavailableItems } = useMemo(() => {
    const available = items.filter(
      (item) => !isReadOnlyItemStatus(item.productStatus) && item.stockQuantity > 0
    );
    const unavailable = items.filter(
      (item) => isReadOnlyItemStatus(item.productStatus) || item.stockQuantity <= 0
    );
    return { availableItems: available, unavailableItems: unavailable };
  }, [items]);

  const canCheckout = useMemo(() => {
    if (!cart || items.length === 0) return false;
    return items.every(
      (item) => !isReadOnlyItemStatus(item.productStatus) && item.quantity > 0 && item.quantity <= item.stockQuantity,
    );
  }, [cart, items]);

  const handleRemoveItem = async (cartItemId: number) => {
    const removedItem = items.find((item) => item.cartItemId === cartItemId);
    try {
      setPendingItemId(cartItemId);
      await removeItem(cartItemId);
      if (removedItem?.productId) {
        trackRemoveFromCart(removedItem.productId);
      }
      toast.success("Item removed from cart.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to remove item.";
      toast.error(message);
    } finally {
      setPendingItemId(null);
    }
  };

  const handleUpdateQuantity = async (
    cartItemId: number,
    nextQuantity: number,
    stock: number,
    unitPrice: number,
    currentLineTotal: number,
  ) => {
    if (nextQuantity <= 0) {
      await handleRemoveItem(cartItemId);
      return;
    }
    if (stock <= 0) {
      toast.error("Product is out of stock.");
      return;
    }
    if (nextQuantity > stock) {
      toast.error("Cart quantity has reached the maximum available stock.");
      return;
    }

    const projectedSubTotal = (cart?.subTotal ?? 0) - currentLineTotal + unitPrice * nextQuantity;
    if (projectedSubTotal > CART_MAX_SUBTOTAL) {
      toast.error(CART_MAX_SUBTOTAL_ERROR_MESSAGE);
      return;
    }

    try {
      setPendingItemId(cartItemId);
      await updateQuantity(cartItemId, nextQuantity);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to update quantity.";
      toast.error(message);
    } finally {
      setPendingItemId(null);
    }
  };

  const handleCancelQROrder = async () => {
    if (!pendingSepay) return;
    setIsCancellingQR(true);
    try {
      await checkoutApi.cancelOrder(pendingSepay.orderId, "Customer cancelled pending QR from cart", true);
      toast.success("QR order cancelled. Products restored to cart.");
      await refreshCart();
      setPendingSepay(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unable to cancel QR order.";
      toast.error(msg);
    } finally {
      setIsCancellingQR(false);
      setIsCancelQRModalOpen(false);
    }
  };

  const handleProceedToCheckout = () => {
    if (pendingSepay) {
      toast.error("You have a pending QR payment. Please complete or cancel it before placing a new order.");
      return;
    }
    if (!canCheckout) {
      toast.error("Please remove unavailable items before checkout.");
      return;
    }

    const cartTotal = cart?.subTotal ?? 0;
    if (cartTotal >= CART_MAX_SUBTOTAL) {
      toast.error("Cart total must be below 100,000,000 VND to proceed to checkout.");
      return;
    }

    router.push("/checkout");
  };

  if (!isHydrated || isLoading) {
    return <div className="mx-auto max-w-6xl px-4 py-10 text-center text-slate-500">Loading cart...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Please sign in to view your cart</h1>
          <p className="mt-2 text-slate-500">Sign in to sync and manage your cart.</p>
          <Link
            href="/login"
            className="mt-6 inline-flex rounded-lg bg-[#ff6a00] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#e05e00]"
          >
            Log in
          </Link>
        </div>
      </div>
    );
  }

  const renderCartItem = (item: typeof items[0], isReadOnlyItem: boolean) => {
    const busy = pendingItemId === item.cartItemId;
    return (
      <div
        key={item.cartItemId}
        className={`rounded-2xl border bg-white p-4 shadow-sm ${isReadOnlyItem
            ? "border-amber-300 bg-amber-50/50 opacity-55 saturate-50"
            : "border-slate-200"
          }`}
      >
        <div className="flex flex-col gap-4 md:flex-row">
          <img
            src={item.mainImageUrl || "https://placehold.co/140x140/png?text=Toy"}
            alt={item.productName}
            className="h-24 w-24 rounded-xl bg-slate-100 object-cover md:h-28 md:w-28"
          />

          <div className="flex flex-1 flex-col justify-between gap-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{item.productName}</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Stock: {item.stockQuantity} | Status: {
                    item.productStatus === "OutOfStock" && pendingSepay
                      ? "Reserved for QR Payment"
                      : item.productStatus
                  }
                </p>
                {!isReadOnlyItem && item.warningMessage && (
                  <div className="mt-2 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50/50 p-3 text-xs font-semibold text-red-600">
                    <span className="material-symbols-outlined text-sm leading-none mt-0.5 flex-shrink-0">warning</span>
                    <span>{item.warningMessage}</span>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleRemoveItem(item.cartItemId)}
                disabled={busy}
                className="text-slate-400 hover:text-red-500 disabled:opacity-60"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs text-slate-400">Unit price</p>
                {item.currentPrice !== item.priceAtThatTime ? (
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-semibold text-slate-400 line-through">
                      {formatPrice(item.priceAtThatTime)}
                    </span>
                    <span className="text-2xl font-extrabold text-[#ff6a00]">
                      {formatPrice(item.currentPrice)}
                    </span>
                  </div>
                ) : (
                  <p className="text-2xl font-extrabold text-[#ff6a00]">
                    {formatPrice(item.priceAtThatTime)}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-32 items-center rounded-xl border border-slate-300 bg-white">
                  <button
                    type="button"
                    onClick={() =>
                      handleUpdateQuantity(
                        item.cartItemId,
                        item.quantity - 1,
                        item.stockQuantity,
                        item.currentPrice > 0 ? item.currentPrice : item.priceAtThatTime,
                        item.lineTotal,
                      )
                    }
                    disabled={busy || isReadOnlyItem || item.quantity <= 0}
                    className="flex h-full w-10 items-center justify-center rounded-l-xl text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-sm">remove</span>
                  </button>
                  <input
                    readOnly
                    value={item.quantity}
                    className="h-full w-12 border-none bg-transparent p-0 text-center text-xs font-bold text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      handleUpdateQuantity(
                        item.cartItemId,
                        item.quantity + 1,
                        item.stockQuantity,
                        item.currentPrice > 0 ? item.currentPrice : item.priceAtThatTime,
                        item.lineTotal,
                      )
                    }
                    disabled={busy || isReadOnlyItem || item.quantity >= item.stockQuantity}
                    className="flex h-full w-10 items-center justify-center rounded-r-xl text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-sm">add</span>
                  </button>
                </div>
                <div className="min-w-28 text-right">
                  <p className="text-xs text-slate-400">Line total</p>
                  <p className="text-lg font-extrabold text-slate-900">{formatPrice(item.lineTotal)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Shopping Cart</h1>
      </div>

      {pendingSepay && (
        <div className="mb-5 rounded-xl border border-orange-200 bg-orange-50 px-5 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <span className="material-symbols-outlined text-xl text-orange-500 shrink-0">pending</span>
              <p className="text-sm font-semibold text-orange-800">
                You have a pending QR payment for order{" "}
                <span className="font-black">#{pendingSepay.orderCode}</span>.{" "}
                Complete or cancel it before placing a new order.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsCancelQRModalOpen(true)}
                disabled={isCancellingQR}
                className="rounded-lg border border-orange-300 bg-white px-4 py-1.5 text-xs font-bold text-orange-700 hover:bg-orange-100 disabled:opacity-60"
              >
                {isCancellingQR ? "Cancelling..." : "Cancel QR"}
              </button>
              <Link
                href={`/checkout/payment?orderId=${pendingSepay.orderId}`}
                className="rounded-lg bg-orange-500 px-4 py-1.5 text-xs font-bold text-white hover:bg-orange-600"
              >
                Continue payment
              </Link>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={isCancelQRModalOpen}
        title="Cancel QR Order"
        message={`Are you sure you want to cancel the QR payment for order #${pendingSepay?.orderCode ?? ""}? Your items will be restored to your cart.`}
        onConfirm={handleCancelQROrder}
        onCancel={() => setIsCancelQRModalOpen(false)}
        confirmText={isCancellingQR ? "Cancelling..." : "Yes, Cancel"}
        cancelText="Keep Paying"
        type="danger"
      />

      {items.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center">
          <span className="material-symbols-outlined text-5xl text-slate-300">shopping_cart</span>
          <p className="mt-4 text-xl font-bold text-slate-800">Your cart is empty</p>
          <Link
            href="/products"
            className="mt-5 inline-flex rounded-lg bg-[#ff6a00] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#e05e00]"
          >
            Continue shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {availableItems.length > 0 && (
              <div className="space-y-4">
                {availableItems.map((item) => renderCartItem(item, false))}
              </div>
            )}

            {unavailableItems.length > 0 && (
              <div className="mt-8 border-t border-slate-200 pt-6">
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-400">report</span>
                    Unavailable Items ({unavailableItems.length})
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    These items cannot be purchased due to out-of-stock or restricted status. Please remove them to proceed with checkout.
                  </p>
                </div>
                <div className="space-y-4">
                  {unavailableItems.map((item) => renderCartItem(item, true))}
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-24 lg:h-fit">
            <h2 className="text-2xl font-extrabold text-slate-900">Order Summary</h2>

            <div className="mt-5 space-y-3 rounded-xl bg-slate-50 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Total item</span>
                <span className="font-bold text-slate-900">{cart?.totalItem ?? 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Total quantity</span>
                <span className="font-bold text-slate-900">{cart?.totalQuantity ?? 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Sub total</span>
                <span className="font-bold text-slate-900">{formatPrice(cart?.subTotal ?? 0)}</span>
              </div>
            </div>

            <div className="mt-4 border-t border-dashed border-slate-200 pt-4">
              <div className="flex items-end justify-between">
                <span className="text-slate-500">Total</span>
                <span className="text-3xl font-black text-[#ff6a00]">{formatPrice(cart?.subTotal ?? 0)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleProceedToCheckout}
              disabled={!canCheckout || !!pendingSepay}
              title={pendingSepay ? "Cancel your pending QR payment first" : undefined}
              className="mt-6 block w-full rounded-xl bg-[#ff6a00] py-3 text-center text-sm font-bold text-white hover:bg-[#e05e00] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pendingSepay ? "Pending QR payment…" : "Proceed to Checkout"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
