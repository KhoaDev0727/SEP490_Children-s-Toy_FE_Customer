"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ShippingTracker from "./ShippingTracker";
import OrderProductList, { type OrderProduct } from "./OrderProductList";
import ShippingInfo from "./ShippingInfo";
import PaymentSummary from "./PaymentSummary";
import CancelOrderModal from "@/components/common/CancelOrderModal";
import ConfirmModal from "@/components/common/ConfirmModal";
import DeliveryImageModal from "./DeliveryImageModal";
import { useCart } from "@/features/cart/context/CartContext";
import { checkoutApi } from "@/features/checkout/services/checkout-api";
import { ordersApi } from "@/features/orders/services/orders-api";
import type { CustomerOrderDetail } from "@/features/orders/types/orders";
import { toast } from "react-hot-toast";
import {
  buildOrderTimelineEvents,
  isCustomerOrderCancellable,
  isCustomerOrderDelivered,
  type OrderTimelineEvent,
} from "@/features/orders/utils/map-customer-order-status";

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
  const searchParams = useSearchParams();
  const fromCheckoutSuccess = searchParams.get("from") === "checkout-success";
  const [order, setOrder] = useState<CustomerOrderDetail | null>(null);
  const [trackingEvents, setTrackingEvents] = useState<OrderTimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCancelQRModalOpen, setIsCancelQRModalOpen] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const { refreshCart } = useCart();


  const handleBack = () => {
    if (fromCheckoutSuccess) {
      router.replace("/profile/orders");
      return;
    }

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

      setTrackingEvents(
        buildOrderTimelineEvents(tracking?.events ?? [], detail.statusHistory ?? [], {
          cancelledAt: detail.cancelledAt,
          currentStatusName: detail.statusName,
          paymentMethod: detail.paymentMethod,
        }),
      );
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

  const isCancellable = useMemo(
    () =>
      order?.canCancel ??
      isCustomerOrderCancellable(order?.statusCode ?? order?.statusName, order?.paymentMethod),
    [order],
  );

  const isCompletable = useMemo(
    () =>
      order?.canComplete ??
      isCustomerOrderDelivered(order?.statusCode ?? order?.statusName),
    [order],
  );

  const handleCancel = useCallback(async (reason: string) => {
    if (!order) return;

    setIsCancelling(true);
    try {
      await checkoutApi.cancelOrder(order.orderId, reason);
      toast.success("Order cancelled successfully.");
      await loadOrder();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to cancel order.");
    } finally {
      setIsCancelling(false);
      setIsCancelModalOpen(false);
    }
  }, [loadOrder, order]);

  const handleCancelQR = useCallback(async () => {
    if (!order) return;

    setIsCancelling(true);
    try {
      await checkoutApi.cancelOrder(order.orderId, "Customer cancelled pending QR from order details", true);
      toast.success("Transaction cancelled. Products restored to cart.");
      await refreshCart();
      await loadOrder();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to cancel order.");
    } finally {
      setIsCancelling(false);
      setIsCancelQRModalOpen(false);
    }
  }, [loadOrder, order, refreshCart]);

  const handleComplete = useCallback(async () => {
    if (!order) return;
    setIsCompleting(true);
    try {
      await ordersApi.completeOrder(order.orderId);
      toast.success("Order received successfully.");
      await loadOrder();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to complete order.");
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
                onClick={() => {
                  if (order?.paymentMethod === "SE_PAY") {
                    setIsCancelQRModalOpen(true);
                  } else {
                    setIsCancelModalOpen(true);
                  }
                }}
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

      <ConfirmModal
        isOpen={isCancelQRModalOpen}
        title="Cancel QR Order"
        message={`Are you sure you want to cancel the QR payment for order #${order.orderCode}? Your items will be restored to your cart.`}
        onConfirm={handleCancelQR}
        onCancel={() => setIsCancelQRModalOpen(false)}
        confirmText={isCancelling ? "Cancelling..." : "Yes, Cancel"}
        cancelText="Keep Paying"
        type="danger"
      />

      {/* Two-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: tracker + products */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <ShippingTracker
            statusName={order.statusName}
            paymentMethod={order.paymentMethod}
            events={trackingEvents}
            hasActiveRefund={order.hasActiveRefund}
            cancelReason={order.cancelReason}
            statusBucket={order.statusBucket as any}
            apiDisplayLabel={order.displayLabel}
            deliveryImageUrl={order.deliveryImageUrl}
            onViewDeliveryImage={() => setIsImageModalOpen(true)}
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
            paymentStatus={order.paymentStatus}
          />
        </div>
      </div>

      <DeliveryImageModal
        isOpen={isImageModalOpen}
        imageUrl={order.deliveryImageUrl}
        onClose={() => setIsImageModalOpen(false)}
      />
    </section>
  );

}
