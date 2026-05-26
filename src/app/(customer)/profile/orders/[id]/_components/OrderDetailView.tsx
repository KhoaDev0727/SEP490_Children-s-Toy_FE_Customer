"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ShippingTracker, { type ShippingEvent } from "./ShippingTracker";
import OrderProductList, { type OrderProduct } from "./OrderProductList";
import ShippingInfo from "./ShippingInfo";
import PaymentSummary from "./PaymentSummary";
import CancelOrderModal from "@/components/common/CancelOrderModal";
import { checkoutApi } from "@/features/checkout/services/checkout-api";
import { ordersApi } from "@/features/orders/services/orders-api";
import type { CustomerOrderDetail } from "@/features/orders/types/orders";

interface OrderDetailViewProps {
  orderId: number;
}

const formatDateTime = (value?: string | null): string => {
  if (!value) return "";
  let dateStr = value;
  if (value.includes("T") && !value.endsWith("Z") && !value.includes("+")) {
    dateStr = value + "Z";
  }
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
  }).replace(",", " -") + " (GMT+7)";
};

const formatDate = (value?: string | null): string => {
  if (!value) return "";
  let dateStr = value;
  if (value.includes("T") && !value.endsWith("Z") && !value.includes("+")) {
    dateStr = value + "Z";
  }
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export default function OrderDetailView({ orderId }: OrderDetailViewProps) {
  const router = useRouter();
  const [order, setOrder] = useState<CustomerOrderDetail | null>(null);
  const [trackingEvents, setTrackingEvents] = useState<ShippingEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const handleBack = () => {
    if (window.history.length > 2) {
      router.back();
    } else {
      router.push("/profile/orders");
    }
  };

  const loadOrder = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [detail, tracking] = await Promise.all([
        ordersApi.getOrderDetail(orderId),
        checkoutApi.getOrderTracking(orderId).catch(() => null),
      ]);

      setOrder(detail);

      // Merge internal status history and external tracking events
      const allEvents: ShippingEvent[] = [];

      // 1. Add GHN tracking events (already translated by backend)
      if (tracking?.events?.length) {
        tracking.events.forEach((e) => {
          allEvents.push({
            time: e.time,
            status: e.status,
            description: e.description,
          });
        });
      }

      // 2. Add internal status history (and translate common legacy Vietnamese notes)
      if (detail.statusHistory?.length) {
        detail.statusHistory.forEach((h) => {
          let note = h.note || h.statusName;

          // Simple inline translation for legacy Vietnamese notes
          const n = note.toLowerCase();
          if (n.includes("chờ lấy hàng")) note = "Ready to pick";
          else if (n.includes("đang lấy hàng")) note = "Picking up";
          else if (n.includes("đã lấy hàng")) note = "Picked up";
          else if (n.includes("đang giao hàng")) note = "Out for delivery";
          else if (n.includes("giao hàng thành công")) note = "Delivered successfully";
          else if (n.includes("đã hủy")) note = "Cancelled";
          else if (n.includes("order completed")) note = "Order completed";

          // Filter out internal noisy webhook messages
          if (n.includes("webhook")) return;
          if (n.includes("marked as delivered")) return;

          allEvents.push({
            time: h.createdAt,
            status: h.statusName,
            description: note,
          });
        });
      }

      // 3. Sort by time descending and remove duplicates
      const uniqueEvents = allEvents
        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
        .filter((ev, idx, self) =>
          idx === self.findIndex((t) => t.description === ev.description)
        );

      setTrackingEvents(uniqueEvents);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to load orders.");
      setOrder(null);
      setTrackingEvents([]);
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    void loadOrder();
  }, [loadOrder]);

  const products = useMemo<OrderProduct[]>(() => {
    if (!order) return [];
    const fallbackImage = "/assets/images/tinitoy.png";

    return order.items.map((item) => ({
      id: item.orderDetailId.toString(),
      productId: item.productId,
      name: item.productName,
      variant: item.variant ?? "",
      categoryName: item.categoryName ?? "",
      quantity: item.quantity,
      price: item.unitPrice,
      image: item.productImage || fallbackImage,
    }));
  }, [order]);

  const shippingAddress = useMemo(() => {
    if (!order) return "";

    const lines = [
      order.shippingAddress,
      [order.shippingWardName, order.shippingDistrictName].filter(Boolean).join(", "),
      order.shippingProvinceName,
    ].filter(Boolean);

    return lines.join("\n");
  }, [order]);

  const shippingMethod = useMemo(() => {
    if (!order?.shipping?.provider) return "Updating";
    return `Shipped via ${order.shipping.provider}`;
  }, [order]);

  const estimatedDate = useMemo(() => {
    const value = order?.shipping?.estimatedDelivery;
    return value ? formatDate(value) : "";
  }, [order]);

  const isCancellable = useMemo(() => {
    if (!order?.statusName) return false;
    const status = order.statusName.toLowerCase();

    // SHIP_COD rule: Chỉ được hủy khi chưa confirmed (tức là chỉ được hủy khi đang Pending)
    if (order.paymentMethod === "SHIP_COD" && status === "confirmed") {
      return false;
    }

    return ["pending", "confirmed"].includes(status);
  }, [order]);

  const isCompletable = useMemo(() => {
    if (!order?.statusName) return false;
    const status = order.statusName.toLowerCase();
    // Match backend: Delivered only
    return status === "delivered";
  }, [order]);

  const handleCancel = useCallback(async (reason: string) => {
    if (!order) return;

    setIsCancelling(true);
    try {
      await checkoutApi.cancelOrder(order.orderId, reason);
      await loadOrder();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to cancel order.");
    } finally {
      setIsCancelling(false);
      setIsCancelModalOpen(false);
    }
  }, [loadOrder, order]);

  const handleComplete = useCallback(async () => {
    if (!order) return;
    setIsCompleting(true);
    try {
      await ordersApi.completeOrder(order.orderId);
      await loadOrder();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to complete order.");
    } finally {
      setIsCompleting(false);
    }
  }, [loadOrder, order]);

  if (isLoading) {
    return (
      <section className="col-span-1 md:col-span-3 flex flex-col gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-[#e2bfb0]/30 flex items-center gap-3">
          <span className="material-symbols-outlined text-[#ff6a00]">hourglass_top</span>
          <p className="text-sm text-[#5a4136]">Loading order details...</p>
        </div>
      </section>
    );
  }

  if (errorMessage || !order) {
    return (
      <section className="col-span-1 md:col-span-3 flex flex-col gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-[#e2bfb0]/30 flex items-center gap-3">
          <span className="material-symbols-outlined text-[#ff6a00]">error</span>
          <p className="text-sm text-[#5a4136]">{errorMessage ?? "Order not found."}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="col-span-1 md:col-span-3 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-[#e2bfb0]/30">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all hover:scale-105"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h1 className="text-xl font-bold text-[#261812]">
              Order Details <span className="text-[#ff6a00]">#{order.orderCode}</span>
            </h1>
            <p className="text-sm text-[#5a4136]">Placed at {formatDateTime(order.orderDate)}</p>
          </div>
        </div>
        {(isCancellable || isCompletable) ? (
          <div className="flex gap-3 w-full sm:w-auto">
            {isCancellable && (
              <button
                onClick={() => setIsCancelModalOpen(true)}
                disabled={isCancelling || isCompleting}
                className="flex-1 sm:flex-none px-6 py-2.5 bg-[#261812] text-white text-sm font-bold rounded-xl hover:bg-black transition-all hover:scale-105 shadow-lg shadow-black/10 disabled:opacity-60"
              >
                {isCancelling ? "Cancelling..." : "Cancel Order"}
              </button>
            )}
            {isCompletable && (
              <button
                onClick={handleComplete}
                disabled={isCompleting || isCancelling}
                className="flex-1 sm:flex-none px-6 py-2.5 bg-[#ff6a00] text-white text-sm font-bold rounded-xl hover:bg-[#e65f00] transition-all hover:scale-105 shadow-lg shadow-[#ff6a00]/10 disabled:opacity-60"
              >
                {isCompleting ? "Processing..." : "Order Received"}
              </button>
            )}
          </div>
        ) : null}
      </div>

      <CancelOrderModal
        isOpen={isCancelModalOpen}
        orderCode={order.orderCode}
        onConfirm={handleCancel}
        onCancel={() => setIsCancelModalOpen(false)}
        isSubmitting={isCancelling}
      />

      {/* Two-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: tracker + products */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <ShippingTracker
            currentStatus={order.statusName}
            events={trackingEvents}
            hasActiveRefund={order.hasActiveRefund}
          />
          <OrderProductList products={products} />
        </div>

        {/* Right: shipping info + payment */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <ShippingInfo
            recipientName={order.shippingName}
            phone={order.shippingPhone}
            address={shippingAddress}
            method={shippingMethod}
            estimatedDate={estimatedDate || "Updating"}
          />
          <PaymentSummary
            subtotal={order.subTotal}
            shippingFee={order.estimatedShippingFee}
            discount={order.voucherDiscountAmount}
            paymentMethod={order.paymentMethod}
          />
        </div>
      </div>
    </section>
  );
}
