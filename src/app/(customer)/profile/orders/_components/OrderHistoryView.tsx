"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import OrderTabs from "./OrderTabs";
import OrderSearch from "./OrderSearch";
import OrderList from "./OrderList";
import OrderPagination from "./OrderPagination";
import CancelOrderModal from "@/components/common/CancelOrderModal";
import ConfirmModal from "@/components/common/ConfirmModal";
import CreateRefundModal from "@/app/(customer)/profile/refunds/_components/CreateRefundModal";
import { Order, OrderStatus } from "./OrderCard";
import { ordersApi } from "@/features/orders/services/orders-api";
import { checkoutApi } from "@/features/checkout/services/checkout-api";
import axiosClient from "@/configs/axios-client";
import type { CustomerOrderListItem } from "@/features/orders/types/orders";
import { toast } from "react-hot-toast";
import { mapCustomerStatusNameToUi } from "@/features/orders/utils/map-customer-order-status";
import { reviewApi } from "@/features/reviews/services/review-api";
import { useCart } from "@/features/cart/context/CartContext";

const ORDERS_PER_PAGE = 3;

export default function OrderHistoryView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshCart } = useCart();
  
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "all");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get("page")) || 1);
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasWallet, setHasWallet] = useState(false);

  // Sync state to URL silently so that "Back" button restores it
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let changed = false;

    if (activeTab !== "all") { params.set("tab", activeTab); changed = true; }
    else if (params.has("tab")) { params.delete("tab"); changed = true; }

    if (searchQuery) { params.set("q", searchQuery); changed = true; }
    else if (params.has("q")) { params.delete("q"); changed = true; }

    if (currentPage > 1) { params.set("page", currentPage.toString()); changed = true; }
    else if (params.has("page")) { params.delete("page"); changed = true; }

    if (changed) {
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState(null, "", newUrl);
    } else if (!activeTab && !searchQuery && currentPage === 1 && window.location.search) {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, [activeTab, searchQuery, currentPage]);

  // Cancel modal state
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCancelQRModalOpen, setIsCancelQRModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Refund modal state
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [orderToRefund, setOrderToRefund] = useState<Order | null>(null);

  // Complete order state
  const [isCompletingId, setIsCompletingId] = useState<number | null>(null);

  const mapStatusNameToUi = useCallback(
    (item: CustomerOrderListItem): OrderStatus => {
      if (item.statusBucket) {
        return item.statusBucket as OrderStatus;
      }
      return mapCustomerStatusNameToUi(item.statusCode ?? item.statusName);
    },
    [],
  );

  const mapOrderItem = useCallback(
    (item: CustomerOrderListItem): Order => {
      const fallbackImage = "/assets/images/tinitoy.png";

      return {
        orderId: item.orderId,
        orderCode: item.orderCode,
        status: mapStatusNameToUi(item),
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
        rawStatusName: item.statusCode ?? item.statusName,
        displayLabel: item.displayLabel,
        hasActiveRefund: item.hasActiveRefund,
        canCancel: item.canCancel,
        canRefund: item.canRefund,
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

  // Check wallet status once on mount
  useEffect(() => {
    axiosClient
      .get<{ success?: boolean; data?: { status?: string } | null } | null>("/wallets/me")
      .then((res) => {
        const anyRes = res as { success?: boolean; data?: { status?: string } | null } | null;
        const walletStatus = anyRes?.data?.status;
        setHasWallet(
          typeof walletStatus === "string" && walletStatus.toLowerCase() === "active",
        );
      })
      .catch(() => setHasWallet(false));
  }, []);

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
    async (order: Order) => {
      if (order.status === "pending") {
        setOrderToCancel(order);
        if (order.paymentMethod === "SE_PAY") {
          setIsCancelQRModalOpen(true);
        } else {
          setIsCancelModalOpen(true);
        }
      } else if (order.status === "completed") {
        const loadingToast = toast.loading("Checking review status...");
        const startTime = Date.now();
        try {
          const res = await reviewApi.getUnreviewedProducts(1, 100);
          const hasUnreviewedProduct = res.items.some(
            (item) => item.orderId === order.orderId
          );
          
          const elapsed = Date.now() - startTime;
          if (elapsed < 500) {
            await new Promise((resolve) => setTimeout(resolve, 500 - elapsed));
          }
          
          toast.dismiss(loadingToast);
          if (hasUnreviewedProduct) {
            router.push("/profile/reviews?tab=unreviewed");
          } else {
            router.push("/profile/reviews?tab=reviewed");
          }
        } catch (error) {
          toast.dismiss(loadingToast);
          console.error("Failed to check unreviewed products", error);
          router.push("/profile/reviews");
        }
      } else {
        router.push(`/profile/orders/${order.orderId}`);
      }
    },
    [router],
  );

  const handleRequestRefund = useCallback((order: Order) => {
    setOrderToRefund(order);
    setIsRefundModalOpen(true);
  }, []);

  const confirmCancel = async (reason: string) => {
    if (!orderToCancel) return;
    setIsCancelling(true);
    try {
      await checkoutApi.cancelOrder(orderToCancel.orderId, reason);
      toast.success("Order cancelled successfully.");
      await loadOrders();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to cancel order.",
      );
    } finally {
      setIsCancelling(false);
      setIsCancelModalOpen(false);
      setOrderToCancel(null);
    }
  };

  const confirmCancelQR = async () => {
    if (!orderToCancel) return;
    setIsCancelling(true);
    try {
      await checkoutApi.cancelOrder(
        orderToCancel.orderId,
        "Customer cancelled pending QR from order history",
        true
      );
      toast.success("Transaction cancelled. Products restored to cart.");
      await refreshCart();
      await loadOrders();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to cancel order.",
      );
    } finally {
      setIsCancelling(false);
      setIsCancelQRModalOpen(false);
      setOrderToCancel(null);
    }
  };

  const handleCompleteOrder = useCallback(async (order: Order) => {
    if (isCompletingId) return;
    setIsCompletingId(order.orderId);
    try {
      await ordersApi.completeOrder(order.orderId);
      toast.success("Order received successfully.");
      await loadOrders();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to complete order.",
      );
    } finally {
      setIsCompletingId(null);
    }
  }, [isCompletingId, loadOrders]);

  return (
    <section className="col-span-1 md:col-span-3 bg-white rounded-xl shadow-sm border border-gray-200/80 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200/60 bg-white">
        <h1 className="text-2xl font-bold text-gray-900">Order history</h1>
        <p className="mt-1 text-sm text-gray-500">
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
          <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3 bg-slate-50/30 rounded-xl border border-dashed border-gray-200/80">
            <span className="material-symbols-outlined text-6xl opacity-40">
              error
            </span>
            <p className="text-base font-bold text-red-600">{errorMessage}</p>
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3 bg-slate-50/30 rounded-xl border border-dashed border-gray-200/80">
            <span className="material-symbols-outlined text-6xl opacity-40 animate-pulse">
              hourglass_top
            </span>
            <p className="text-base font-bold">Loading orders...</p>
          </div>
        ) : (
          <OrderList
            orders={orders}
            onPrimaryAction={handlePrimaryAction}
            onSecondaryAction={handleSecondaryAction}
            onRequestRefund={handleRequestRefund}
            onCompleteAction={handleCompleteOrder}
          />
        )}
      </div>

      <CancelOrderModal
        isOpen={isCancelModalOpen}
        orderCode={orderToCancel?.orderCode ?? ""}
        onConfirm={confirmCancel}
        onCancel={() => {
          setIsCancelModalOpen(false);
          setOrderToCancel(null);
        }}
        isSubmitting={isCancelling}
      />

      <ConfirmModal
        isOpen={isCancelQRModalOpen}
        title="Cancel QR Order"
        message={`Are you sure you want to cancel the QR payment for order #${orderToCancel?.orderCode ?? ""}? Your items will be restored to your cart.`}
        onConfirm={confirmCancelQR}
        onCancel={() => {
          setIsCancelQRModalOpen(false);
          setOrderToCancel(null);
        }}
        confirmText={isCancelling ? "Cancelling..." : "Yes, Cancel"}
        cancelText="Keep Paying"
        type="danger"
      />

      {orderToRefund && (
        <CreateRefundModal
          isOpen={isRefundModalOpen}
          orderId={orderToRefund.orderId}
          orderCode={orderToRefund.orderCode}
          orderTotal={orderToRefund.total}
          hasWallet={hasWallet}
          onClose={() => {
            setIsRefundModalOpen(false);
            setOrderToRefund(null);
          }}
          onSuccess={() => void loadOrders()}
        />
      )}

      {/* Pagination */}
      <OrderPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onChange={setCurrentPage}
      />
    </section>
  );
}
