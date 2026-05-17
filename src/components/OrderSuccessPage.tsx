"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ordersApi } from "@/features/orders/services/orders-api";
import type { CustomerOrderDetail } from "@/features/orders/types/orders";
import { useCart } from "@/features/cart/context/CartContext";

const fmt = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

// ─── Animated Check Icon ───────────────────────────────────────────────────────
function CheckIcon() {
  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      aria-hidden="true"
    >
      <circle
        cx="40"
        cy="40"
        r="36"
        stroke="#f97316"
        strokeWidth="3"
        strokeDasharray="226"
        strokeDashoffset="226"
        className="animate-ring"
        style={{ animationFillMode: "forwards" }}
      />
      <polyline
        points="22,40 34,52 58,28"
        stroke="#f97316"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="60"
        strokeDashoffset="60"
        className="animate-check"
        style={{ animationFillMode: "forwards", animationDelay: "0.45s" }}
      />
    </svg>
  );
}

// ─── Progress Steps ────────────────────────────────────────────────────────────
const STEPS = [
  { label: "Received", icon: "📋" },
  { label: "Processing", icon: "⚙️" },
  { label: "Delivering", icon: "🚚" },
  { label: "Completed", icon: "🎉" },
];

function ProgressBar({ active }: { active: number }) {
  return (
    <div className="flex items-center justify-between w-full max-w-md mx-auto mb-10">
      {STEPS.map((step, i) => (
        <div key={i} className="flex-1 flex flex-col items-center relative">
          {i < STEPS.length - 1 && (
            <div className="absolute top-4 left-1/2 w-full h-0.5 bg-zinc-200 z-0">
              <div
                className="h-full bg-orange-500 transition-all duration-700"
                style={{ width: i < active ? "100%" : "0%" }}
              />
            </div>
          )}
          <div
            className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-sm
              border-2 transition-all duration-500
              ${
                i < active
                  ? "bg-orange-500 border-orange-500 text-white"
                  : i === active
                  ? "bg-white border-orange-500 text-orange-500 shadow-md shadow-orange-100"
                  : "bg-white border-zinc-200 text-zinc-300"
              }`}
          >
            {i < active ? "✓" : step.icon}
          </div>
          <span
            className={`mt-1.5 text-[10px] font-semibold tracking-wide text-center leading-tight
              ${i <= active ? "text-orange-600" : "text-zinc-400"}`}
          >
            {step.label}
          </span>
        </div>
      ))}
    </div>
  );
}

const FALLBACK_IMAGE = "https://placehold.co/64x64/png?text=Toy";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const orderCode = searchParams.get("orderCode") || "N/A";

  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [order, setOrder] = useState<CustomerOrderDetail | null>(null);
  const { cart, refreshCart, removeItem, updateQuantity } = useCart();
  const syncedOrderIdRef = useRef<number | null>(null);
  const isSyncingCartRef = useRef(false);

  useEffect(() => {
    setMounted(true);
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!orderId) return;
    ordersApi.getOrderDetail(Number(orderId)).then(setOrder).catch(() => {
      // Fallback to no order — page still shows success message
    });
  }, [orderId]);

  useEffect(() => {
    void refreshCart().catch(() => {
      // Ignore cart refresh errors on success page.
    });
  }, [refreshCart]);

  useEffect(() => {
    const parsedOrderId = Number(orderId);
    if (!Number.isFinite(parsedOrderId) || parsedOrderId <= 0) return;
    if (!order || !cart) return;
    if (syncedOrderIdRef.current === parsedOrderId || isSyncingCartRef.current) return;

    const purchasedQtyByProductId = order.items.reduce((acc, item) => {
      acc.set(item.productId, (acc.get(item.productId) ?? 0) + item.quantity);
      return acc;
    }, new Map<number, number>());

    const cartTargets = cart.items.filter((item) => purchasedQtyByProductId.has(item.productId));
    if (cartTargets.length === 0) {
      syncedOrderIdRef.current = parsedOrderId;
      return;
    }

    isSyncingCartRef.current = true;
    let cancelled = false;

    const syncPurchasedItems = async () => {
      try {
        for (const cartItem of cartTargets) {
          if (cancelled) return;

          const purchasedQty = purchasedQtyByProductId.get(cartItem.productId) ?? 0;
          if (purchasedQty <= 0) continue;

          try {
            if (cartItem.quantity > purchasedQty) {
              await updateQuantity(cartItem.cartItemId, cartItem.quantity - purchasedQty);
            } else {
              await removeItem(cartItem.cartItemId);
            }
          } catch {
            // Ignore per-item errors and continue syncing remaining items.
          }
        }
      } finally {
        if (!cancelled) {
          await refreshCart();
          syncedOrderIdRef.current = parsedOrderId;
        }
      }
    };

    void syncPurchasedItems()
      .catch(() => {
        // Ignore reconciliation errors on success page.
      })
      .finally(() => {
        isSyncingCartRef.current = false;
      });

    return () => {
      cancelled = true;
    };
  }, [cart, order, orderId, refreshCart, removeItem, updateQuantity]);

  if (!mounted) return null;

  return (
    <>
      <style>{`
        @keyframes ring { to { stroke-dashoffset: 0; } }
        @keyframes check { to { stroke-dashoffset: 0; } }
        .animate-ring { animation: ring 0.55s cubic-bezier(.65,0,.45,1) forwards; }
        .animate-check { animation: check 0.35s ease forwards; }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .slide-up { animation: slideUp 0.5s ease both; }
        @keyframes confetti-fall {
          0%   { transform: translateY(-10px) rotate(0deg);   opacity: 1; }
          100% { transform: translateY(180px) rotate(720deg); opacity: 0; }
        }
        .confetti-piece {
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 2px;
          animation: confetti-fall 1.4s ease forwards;
        }
      `}</style>

      <main className="flex-1 bg-[#fff8f6] flex items-center justify-center px-4 py-12 md:py-20">
        <div
          className={`w-full max-w-2xl transition-all duration-700 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <div className="bg-white rounded-2xl shadow-xl shadow-orange-100 border border-orange-100 overflow-hidden">
            <div className="h-1.5 w-full bg-gradient-to-r from-orange-400 via-orange-500 to-amber-400" />

            <div className="px-6 md:px-12 py-10 text-center">
              <div
                className="relative mx-auto mb-6 w-20 h-20 slide-up"
                style={{ animationDelay: "0.05s" }}
              >
                {["#f97316","#facc15","#34d399","#60a5fa","#f472b6"].map((c, i) => (
                  <span
                    key={i}
                    className="confetti-piece"
                    style={{
                      background: c,
                      top: "50%",
                      left: "50%",
                      marginLeft: `${Math.cos((i / 5) * Math.PI * 2) * 28}px`,
                      marginTop: `${Math.sin((i / 5) * Math.PI * 2) * 28}px`,
                      animationDelay: `${0.5 + i * 0.06}s`,
                    }}
                  />
                ))}
                <CheckIcon />
              </div>

              <h1
                className="slide-up text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 mb-2"
                style={{ animationDelay: "0.12s" }}
              >
                Order placed successfully!
              </h1>

              <p
                className="slide-up text-zinc-500 text-sm md:text-base mb-1 leading-relaxed"
                style={{ animationDelay: "0.18s" }}
              >
                Thank you for shopping at{" "}
                <span className="font-bold text-orange-500">ShopX</span>. Order{" "}
                <span className="font-bold text-zinc-800">#{orderCode}</span> has been received
                and is being processed.
              </p>

              <div
                className="slide-up inline-flex items-center gap-1.5 mt-3 mb-8 px-4 py-2 rounded-full
                  bg-orange-50 border border-orange-200 text-sm text-orange-700 font-medium"
                style={{ animationDelay: "0.24s" }}
              >
                <span>🚚</span>
                <span>
                  Estimated delivery: <strong className="text-orange-800">3-5 business days</strong>
                </span>
              </div>

              <div className="slide-up" style={{ animationDelay: "0.3s" }}>
                <ProgressBar active={1} />
              </div>

              <div
                className="slide-up bg-orange-50/60 border border-orange-100 rounded-xl p-5 mb-8 text-left"
                style={{ animationDelay: "0.36s" }}
              >
                <h2 className="font-bold text-zinc-800 text-sm uppercase tracking-widest mb-4 pb-2 border-b border-orange-100">
                  Order summary
                </h2>

                {!order ? (
                  <p className="text-sm text-zinc-400 text-center py-3">Loading order details...</p>
                ) : (
                  <>
                    <ul className="divide-y divide-orange-100">
                      {order.items.map((item) => (
                        <li key={item.orderDetailId} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                          <img
                            src={item.productImage ?? FALLBACK_IMAGE}
                            alt={item.productName}
                            className="w-16 h-16 object-cover rounded-lg border border-orange-100 shadow-sm flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-zinc-800 text-sm line-clamp-2">{item.productName}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-bold text-orange-500 text-sm whitespace-nowrap">{fmt(item.unitPrice)}</p>
                            <p className="text-xs text-zinc-400 mt-0.5">×{item.quantity}</p>
                          </div>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-4 pt-3 border-t border-orange-200 space-y-1.5">
                      {order.voucherDiscountAmount > 0 && (
                        <div className="flex justify-between items-center text-sm text-zinc-500">
                          <span>Voucher Discount</span>
                          <span className="text-emerald-600 font-semibold">-{fmt(order.voucherDiscountAmount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-zinc-600">Total</span>
                        <span className="text-lg font-extrabold text-orange-500">{fmt(order.totalAmount)}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div
                className="slide-up flex flex-col sm:flex-row items-center justify-center gap-3"
                style={{ animationDelay: "0.42s" }}
              >
                <Link
                  href="/"
                  className="w-full sm:w-auto px-7 py-3 rounded-xl border-2 border-orange-400
                    text-orange-500 font-bold text-sm hover:bg-orange-50
                    transition-colors duration-200 text-center"
                >
                  Continue shopping
                </Link>
                <Link
                  href={orderId ? `/profile/orders/${orderId}` : "/profile/orders"}
                  className="w-full sm:w-auto px-7 py-3 rounded-xl bg-orange-500 text-white
                    font-bold text-sm shadow-md shadow-orange-200
                    hover:bg-orange-600 active:scale-95 transition-all duration-200 text-center"
                >
                  View orders →
                </Link>
              </div>
            </div>
          </div>

          <p
            className="slide-up text-center text-xs text-zinc-400 mt-5"
            style={{ animationDelay: "0.5s" }}
          >
            Need help?{" "}
            <a href="/contact" className="text-orange-500 hover:underline font-medium">
              Contact us
            </a>
          </p>
        </div>
      </main>
    </>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}
