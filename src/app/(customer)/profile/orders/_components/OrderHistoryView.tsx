"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import OrderTabs from "./OrderTabs";
import OrderSearch from "./OrderSearch";
import OrderList from "./OrderList";
import OrderPagination from "./OrderPagination";
import ConfirmModal from "@/components/common/ConfirmModal";
import { Order, OrderStatus } from "./OrderCard";
import { ordersApi } from "@/features/orders/services/orders-api";
import { checkoutApi } from "@/features/checkout/services/checkout-api";
import type { CustomerOrderListItem } from "@/features/orders/types/orders";

const ORDERS_PER_PAGE = 3;

export default function OrderHistoryView() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modal state
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);

  const mapStatusNameToUi = useCallback(
    (statusName?: string | null): OrderStatus => {
      if (!statusName) return "pending";

      switch (statusName.toLowerCase()) {
        case "pending":
          return "pending";
        case "confirmed":
        case "processing":
        case "shipped":
          return "shipping";
        case "delivering":
          return "delivering";
        case "delivered":
        case "completed":
          return "completed";
        case "cancelled":
          return "cancelled";
        default:
          return "pending";
      }
    },
    [],
  );

  const mapOrderItem = useCallback(
    (item: CustomerOrderListItem): Order => {
      const fallbackImage = "/assets/images/tinitoy.png";

      return {
        orderId: item.orderId,
        orderCode: item.orderCode,
        status: mapStatusNameToUi(item.statusName),
        items: (item.items || []).map((p) => ({
          name: p.productName,
          variant: p.variant ?? "",
          categoryName: p.categoryName ?? "",
          quantity: p.quantity,
          price: p.unitPrice,
          image: p.productImage || fallbackImage,
        })),
        total: item.totalAmount,
        paymentMethod: item.paymentMethod,
        rawStatusName: item.statusName,
      };
    },
    [mapStatusNameToUi],
  );

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await ordersApi.getOrderList({
        status: activeTab === "all" ? undefined : activeTab,
        keyword: searchQuery.trim() || undefined,
        pageNumber: currentPage,
        pageSize: ORDERS_PER_PAGE,
      });

      setOrders(response.items.map(mapOrderItem));
      setTotalPages(Math.max(1, response.totalPages));
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Could not load orders.",
      );
      setOrders([]);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, currentPage, mapOrderItem, searchQuery]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handlePrimaryAction = useCallback(
    (order: Order) => {
      if (order.status === "pending" && order.paymentMethod === "SE_PAY") {
        router.push(`/checkout/payment?orderId=${order.orderId}`);
      } else {
        router.push(`/profile/orders/${order.orderId}`);
      }
    },
    [router],
  );

  const handleSecondaryAction = useCallback(
    (order: Order) => {
      if (order.status === "pending") {
        setOrderToCancel(order);
        setIsCancelModalOpen(true);
      } else {
        router.push(`/profile/orders/${order.orderId}`);
      }
    },
    [router],
  );

  const confirmCancel = async () => {
    if (!orderToCancel) return;
    try {
      await checkoutApi.cancelOrder(orderToCancel.orderId);
      await loadOrders();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to cancel order.",
      );
    } finally {
      setIsCancelModalOpen(false);
      setOrderToCancel(null);
    }
  };

  return (
    <section className="col-span-1 md:col-span-3 bg-white rounded-xl shadow-sm border border-[#e2bfb0]/30 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#e2bfb0]/30 bg-white">
        <h1 className="text-2xl font-bold text-[#261812]">Order history</h1>
        <p className="mt-1 text-sm text-[#5a4136]">
          View and track your order history.
        </p>
      </div>

      {/* Tabs */}
      <OrderTabs activeTab={activeTab} onChange={handleTabChange} />

      {/* Search */}
      <OrderSearch value={searchQuery} onChange={handleSearch} />

      {/* Order List */}
      <div className="p-6 bg-white">
        {errorMessage ? (
          <div className="flex flex-col items-center justify-center py-24 text-[#5a4136]/70 gap-3 bg-slate-50/30 rounded-2xl border border-dashed border-[#e2bfb0]/30">
            <span className="material-symbols-outlined text-6xl opacity-40">
              error
            </span>
            <p className="text-base font-bold">{errorMessage}</p>
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 text-[#5a4136]/70 gap-3 bg-slate-50/30 rounded-2xl border border-dashed border-[#e2bfb0]/30">
            <span className="material-symbols-outlined text-6xl opacity-40">
              hourglass_top
            </span>
            <p className="text-base font-bold">Loading orders...</p>
          </div>
        ) : (
          <OrderList
            orders={orders}
            onPrimaryAction={handlePrimaryAction}
            onSecondaryAction={handleSecondaryAction}
          />
        )}
      </div>

      <ConfirmModal
        isOpen={isCancelModalOpen}
        title="Cancel Order"
        message={`Are you sure you want to cancel order #${orderToCancel?.orderCode}? This action cannot be undone.`}
        onConfirm={confirmCancel}
        onCancel={() => {
          setIsCancelModalOpen(false);
          setOrderToCancel(null);
        }}
        confirmText="Confirm Cancel"
        cancelText="Close"
        type="danger"
      />

      {/* Pagination */}
      <OrderPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onChange={setCurrentPage}
      />
    </section>
  );
}
