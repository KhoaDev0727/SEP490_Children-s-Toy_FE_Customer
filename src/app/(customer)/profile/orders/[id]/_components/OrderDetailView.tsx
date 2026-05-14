"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import ShippingTracker, { type ShippingEvent } from "./ShippingTracker";
import OrderProductList, { type OrderProduct } from "./OrderProductList";
import ShippingInfo from "./ShippingInfo";
import PaymentSummary from "./PaymentSummary";
import { checkoutApi } from "@/features/checkout/services/checkout-api";
import { ordersApi } from "@/features/orders/services/orders-api";
import type { CustomerOrderDetail } from "@/features/orders/types/orders";

interface OrderDetailViewProps {
  orderId: number;
}

const formatDateTime = (value?: string | null): string => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).replace(",", " -");
};

const formatDate = (value?: string | null): string => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("vi-VN");
};

export default function OrderDetailView({ orderId }: OrderDetailViewProps) {
  const [order, setOrder] = useState<CustomerOrderDetail | null>(null);
  const [trackingEvents, setTrackingEvents] = useState<ShippingEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const loadOrder = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [detail, tracking] = await Promise.all([
        ordersApi.getOrderDetail(orderId),
        checkoutApi.getOrderTracking(orderId).catch(() => null),
      ]);

      setOrder(detail);

      if (tracking?.events?.length) {
        setTrackingEvents(
          tracking.events.map((event) => ({
            time: event.time,
            status: event.status,
            description: event.description ?? event.location ?? undefined,
          })),
        );
      } else if (detail.statusHistory?.length) {
        setTrackingEvents(
          detail.statusHistory.map((event) => ({
            time: event.createdAt,
            status: event.statusName,
            description: event.note ?? undefined,
          })),
        );
      } else {
        setTrackingEvents([]);
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Không thể tải đơn hàng.");
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
    if (!order?.shipping?.provider) return "Đang cập nhật";
    return `Giao hàng qua ${order.shipping.provider}`;
  }, [order]);

  const estimatedDate = useMemo(() => {
    const value = order?.shipping?.estimatedDelivery;
    return value ? formatDate(value) : "";
  }, [order]);

  const isCancellable = useMemo(() => {
    if (!order?.statusName) return false;
    return ["pending", "confirmed"].includes(order.statusName.toLowerCase());
  }, [order]);

  const handleCancel = useCallback(async () => {
    if (!order) return;

    setIsCancelling(true);
    try {
      await checkoutApi.cancelOrder(order.orderId);
      await loadOrder();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Không thể hủy đơn hàng.");
    } finally {
      setIsCancelling(false);
    }
  }, [loadOrder, order]);

  if (isLoading) {
    return (
      <section className="col-span-1 md:col-span-3 flex flex-col gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-[#e2bfb0]/30 flex items-center gap-3">
          <span className="material-symbols-outlined text-[#ff6a00]">hourglass_top</span>
          <p className="text-sm text-[#5a4136]">Đang tải chi tiết đơn hàng...</p>
        </div>
      </section>
    );
  }

  if (errorMessage || !order) {
    return (
      <section className="col-span-1 md:col-span-3 flex flex-col gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-[#e2bfb0]/30 flex items-center gap-3">
          <span className="material-symbols-outlined text-[#ff6a00]">error</span>
          <p className="text-sm text-[#5a4136]">{errorMessage ?? "Không tìm thấy đơn hàng."}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="col-span-1 md:col-span-3 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-[#e2bfb0]/30">
        <div className="flex items-center gap-4">
          <Link
            href="/profile/orders"
            className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all hover:scale-105"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-[#261812]">
              Chi tiết đơn hàng <span className="text-[#ff6a00]">#{order.orderCode}</span>
            </h1>
            <p className="text-sm text-[#5a4136]">Đặt lúc {formatDateTime(order.orderDate)}</p>
          </div>
        </div>
        {isCancellable ? (
          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={handleCancel}
              disabled={isCancelling}
              className="flex-1 sm:flex-none px-6 py-2.5 bg-[#261812] text-white text-sm font-bold rounded-xl hover:bg-black transition-all hover:scale-105 shadow-lg shadow-black/10 disabled:opacity-60"
            >
              {isCancelling ? "Đang hủy..." : "Hủy đơn hàng"}
            </button>
          </div>
        ) : null}
      </div>

      {/* Two-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: tracker + products */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <ShippingTracker currentStatus={order.statusName} events={trackingEvents} />
          <OrderProductList products={products} />
        </div>

        {/* Right: shipping info + payment */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <ShippingInfo
            recipientName={order.shippingName}
            phone={order.shippingPhone}
            address={shippingAddress}
            method={shippingMethod}
            estimatedDate={estimatedDate || "Đang cập nhật"}
          />
          <PaymentSummary
            subtotal={order.subTotal}
            shippingFee={order.actualShippingFee ?? order.estimatedShippingFee}
            discount={order.voucherDiscountAmount}
            paymentMethod={order.paymentMethod}
          />
        </div>
      </div>
    </section>
  );
}
