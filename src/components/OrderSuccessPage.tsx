"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { ordersApi } from "@/features/orders/services/orders-api";
import type { CustomerOrderDetail } from "@/features/orders/types/orders";
import { useCart } from "@/features/cart/context/CartContext";
import { useTracking } from "@/hooks/useTracking";
import RecommendationWidget from "@/components/recommendation/RecommendationWidget";
import { WIDGET_CODES } from "@/features/recommendation/types/recommendation";

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
        stroke="#ff4f00"
        strokeWidth="3"
        strokeDasharray="226"
        strokeDashoffset="226"
        className="animate-ring"
        style={{ animationFillMode: "forwards" }}
      />
      <polyline
        points="22,40 34,52 58,28"
        stroke="#ff4f00"
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

// ─── Fallback image ────────────────────────────────────────────────────────────

const FALLBACK_IMAGE = "https://placehold.co/64x64/png?text=Toy";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");
  const orderCode = searchParams.get("orderCode") || "N/A";

  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [order, setOrder] = useState<CustomerOrderDetail | null>(null);
  const { cart, refreshCart, removeItem, updateQuantity } = useCart();
  const { trackPurchase } = useTracking();
  const syncedOrderIdRef = useRef<number | null>(null);
  const isSyncingCartRef = useRef(false);
  const purchasedTrackedOrderIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!order) return;
    if (purchasedTrackedOrderIdRef.current === order.orderId) return;
    purchasedTrackedOrderIdRef.current = order.orderId;

    const productIds = order.items.map((item) => item.productId);
    if (productIds.length > 0) {
      trackPurchase(productIds, order.orderId);
    }
  }, [order, trackPurchase]);

  useEffect(() => {
    setMounted(true);
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!orderId) return;
    ordersApi.getOrderDetail(Number(orderId)).then((data) => {
      setOrder(data);
      if (data && data.paymentMethod === "SE_PAY" && data.paymentStatus !== "PAID") {
        router.replace(`/checkout/payment?orderId=${orderId}`);
      }
    }).catch(() => {
      // Fallback to no order — page still shows success message
    });
  }, [orderId, router]);

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

      <main className="flex-1 bg-[#fafafa] flex items-center justify-center px-4 py-12 md:py-20">
        <div
          className={`w-full max-w-2xl transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
        >
          <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
            <div className="h-1.5 w-full bg-[#ff4f00]" />

            <div className="px-6 md:px-12 py-10 text-center">
              <div
                className="relative mx-auto mb-6 w-20 h-20 slide-up"
                style={{ animationDelay: "0.05s" }}
              >
                {["#f97316", "#facc15", "#34d399", "#60a5fa", "#f472b6"].map((c, i) => (
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
                className="slide-up text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-2"
                style={{ animationDelay: "0.12s" }}
              >
                Order placed successfully!
              </h1>

              <p
                className="slide-up text-gray-600 text-sm md:text-base mb-1 leading-relaxed"
                style={{ animationDelay: "0.18s" }}
              >
                Thank you for shopping at{" "}
                <span className="font-bold text-[#ff4f00]">Toy Store</span>. Order{" "}
                <span className="font-bold text-gray-900">#{orderCode}</span> has been received
                and is being processed.
              </p>

              <div
                className="slide-up inline-flex items-center gap-1.5 mt-3 mb-8 px-4 py-2 rounded-full
                  bg-orange-50 border border-orange-100 text-sm text-[#ff4f00] font-medium"
                style={{ animationDelay: "0.24s" }}
              >
                <span className="material-symbols-outlined text-[18px]">local_shipping</span>
                <span>
                  Estimated delivery: <strong className="text-[#ff4f00]">3-5 business days</strong>
                </span>
              </div>


              <div
                className="slide-up bg-gray-50 border border-gray-200 rounded-xl p-5 mb-8 text-left"
                style={{ animationDelay: "0.36s" }}
              >
                <h2 className="font-bold text-gray-900 text-sm uppercase tracking-widest mb-4 pb-2 border-b border-gray-400">
                  Order summary
                </h2>

                {!order ? (
                  <p className="text-sm text-gray-500 text-center py-3">Loading order details...</p>
                ) : (
                  <>
                    <ul className="">
                      {order.items.map((item) => (
                        <li key={item.orderDetailId} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                          <img
                            src={item.productImage ?? FALLBACK_IMAGE}
                            alt={item.productName}
                            className="w-16 h-16 object-cover rounded-lg border border-gray-200 shadow-sm flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 text-sm line-clamp-2">{item.productName}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-bold text-gray-900 text-sm whitespace-nowrap">{fmt(item.unitPrice)}</p>
                            <p className="text-xs text-gray-400 mt-0.5">×{item.quantity}</p>
                          </div>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-4 pt-3 border-t border-gray-400 space-y-2">
                      <div className="flex justify-between items-center text-sm text-gray-600">
                        <span>Subtotal</span>
                        <span className="font-semibold">{fmt(order.subTotal)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm text-gray-600">
                        <span>Shipping Fee</span>
                        <span className="font-semibold">{fmt(order.estimatedShippingFee)}</span>
                      </div>
                      {order.voucherDiscountAmount > 0 && (
                        <div className="flex justify-between items-center text-sm text-gray-600">
                          <span>Voucher Discount</span>
                          <span className="text-emerald-600 font-semibold">-{fmt(order.voucherDiscountAmount)}</span>
                        </div>
                      )}
                      <div className="pt-2 mt-2 border-t border-gray-400 flex justify-between items-center">
                        <span className="text-sm font-semibold text-gray-600">Total</span>
                        <span className="text-lg font-extrabold text-[#ff4f00]">{fmt(order.totalAmount)}</span>
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
                  className="w-full sm:w-auto px-7 py-3 rounded-xl border border-gray-300
                    text-gray-700 font-black text-xs uppercase tracking-wider hover:bg-gray-50 hover:border-gray-400
                    transition-all duration-200 text-center"
                >
                  Continue shopping
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    if (orderId) {
                      router.replace(`/profile/orders/${orderId}?from=checkout-success`);
                    } else {
                      router.replace("/profile/orders");
                    }
                  }}
                  className="w-full sm:w-auto px-7 py-3 rounded-xl bg-[#ff4f00] hover:bg-[#ff5f1a] text-white
                    font-black text-xs uppercase tracking-wider shadow-sm
                    active:scale-95 transition-all duration-200 text-center"
                >
                  View orders →
                </button>
              </div>
            </div>
          </div>

          {order && order.items.length > 0 && (
            <div className="mt-12 slide-up" style={{ animationDelay: "0.55s" }}>
              <RecommendationWidget
                widgetCode={WIDGET_CODES.AFTER_PURCHASE}
                productId={order.items[0]?.productId}
                title="Next purchase"
                subtitle="Customers who bought this product often purchase the following products as well"
                source={`after_purchase:${order.orderId}`}
              />
            </div>
          )}
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
