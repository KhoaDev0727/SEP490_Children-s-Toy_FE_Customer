"use client";

import { useCallback, useEffect, useState } from "react";
import OrderTabs from "./OrderTabs";
import OrderSearch from "./OrderSearch";
import OrderList from "./OrderList";
import OrderPagination from "./OrderPagination";
import { Order, OrderStatus } from "./OrderCard";
import { ordersApi } from "@/features/orders/services/orders-api";
import type { CustomerOrderListItem } from "@/features/orders/types/orders";

const ORDERS_PER_PAGE = 3;

export default function OrderHistoryView() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mapStatusNameToUi = useCallback((statusName?: string | null): OrderStatus => {
    if (!statusName) return "pending";

    switch (statusName.toLowerCase()) {
      case "pending":
      case "confirmed":
        return "pending";
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
  }, []);

  const mapOrderItem = useCallback((item: CustomerOrderListItem): Order => {
    const fallbackImage = "/assets/images/tinitoy.png";
    const product = item.item;

    return {
      orderId: item.orderId,
      orderCode: item.orderCode,
      status: mapStatusNameToUi(item.statusName),
      item: {
        name: product?.productName ?? "Sản phẩm",
        variant: product?.variant ?? "",
        categoryName: product?.categoryName ?? "",
        quantity: product?.quantity ?? 0,
        price: product?.unitPrice ?? 0,
        image: product?.productImage || fallbackImage,
      },
      total: item.totalAmount,
    };
  }, [mapStatusNameToUi]);

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
      setErrorMessage(error instanceof Error ? error.message : "Không thể tải đơn hàng.");
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

  return (
    <section className="col-span-1 md:col-span-3 bg-white rounded-xl shadow-sm border border-[#e2bfb0]/30 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#e2bfb0]/30 bg-white">
        <h1 className="text-2xl font-bold text-[#261812]">
          Quản lý Đơn hàng
        </h1>
        <p className="mt-1 text-sm text-[#5a4136]">
          Xem và theo dõi lịch sử đơn hàng của bạn.
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
            <p className="text-base font-bold">Đang tải đơn hàng...</p>
          </div>
        ) : (
          <OrderList orders={orders} />
        )}
      </div>

      {/* Pagination */}
      <OrderPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onChange={setCurrentPage}
      />
    </section>
  );
}
