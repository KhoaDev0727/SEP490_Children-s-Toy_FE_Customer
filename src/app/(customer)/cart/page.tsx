"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAuthContext } from "@/context/AuthContext";
import { useCart } from "@/features/cart/context/CartContext";

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
  const { isAuthenticated, isHydrated } = useAuthContext();
  const { cart, isLoading, updateQuantity, removeItem } = useCart();
  const [pendingItemId, setPendingItemId] = useState<number | null>(null);

  const items = cart?.items ?? [];

  const canCheckout = useMemo(() => {
    if (!cart || items.length === 0) return false;
    return items.every(
      (item) => !isReadOnlyItemStatus(item.productStatus) && item.quantity > 0 && item.quantity <= item.stockQuantity,
    );
  }, [cart, items]);

  const handleRemoveItem = async (cartItemId: number) => {
    try {
      setPendingItemId(cartItemId);
      await removeItem(cartItemId);
      toast.success("Item removed from cart.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to remove item.";
      toast.error(message);
    } finally {
      setPendingItemId(null);
    }
  };

  const handleUpdateQuantity = async (cartItemId: number, nextQuantity: number, stock: number) => {
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
            Dang nhap
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Shopping Cart</h1>
      </div>

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
            {items.map((item) => {
              const busy = pendingItemId === item.cartItemId;
              const isReadOnlyItem = isReadOnlyItemStatus(item.productStatus);
              return (
                <div
                  key={item.cartItemId}
                  className={`rounded-2xl border bg-white p-4 shadow-sm ${
                    isReadOnlyItem
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
                            Stock: {item.stockQuantity} | Status: {item.productStatus}
                          </p>
                          {isReadOnlyItem ? (
                            <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-amber-700">
                              Read only: this item can only be removed from cart
                            </p>
                          ) : null}
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
                              onClick={() => handleUpdateQuantity(item.cartItemId, item.quantity - 1, item.stockQuantity)}
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
                              onClick={() => handleUpdateQuantity(item.cartItemId, item.quantity + 1, item.stockQuantity)}
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
            })}
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
              disabled={!canCheckout}
              className="mt-6 w-full rounded-xl bg-[#ff6a00] py-3 text-sm font-bold text-white hover:bg-[#e05e00] disabled:opacity-60"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
