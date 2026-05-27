"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  getCustomerOrderDisplay,
  isCustomerOrderDelivered,
} from "@/features/orders/utils/map-customer-order-status";

export type OrderStatus =
  | "delivering"
  | "completed"
  | "pending"
  | "shipping"
  | "cancelled"
  | "refunded";

export interface OrderItem {
  name: string;
  variant: string;
  categoryName?: string;
  quantity: number;
  price: number;
  image: string;
}

export interface Order {
  orderId: number;
  orderCode: string;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
  paymentMethod?: string;
  rawStatusName?: string;
  hasActiveRefund?: boolean;
}

const ACTION_BUTTONS: Record<
  OrderStatus,
  { secondary?: string; primary: string }
> = {
  delivering: { primary: "View Details" },
  completed: { secondary: "Review", primary: "View Details" },
  pending: { secondary: "Cancel Order", primary: "View Details" },
  shipping: { primary: "View Details" },
  cancelled: { primary: "View Details" },
  refunded: { primary: "View Details" },
};

function formatPrice(price: number): string {
  return price.toLocaleString("vi-VN") + " ₫";
}

interface OrderCardProps {
  order: Order;
  onPrimaryAction?: (order: Order) => void;
  onSecondaryAction?: (order: Order) => void;
  onViewDetails?: (order: Order) => void;
  onRequestRefund?: (order: Order) => void;
  onCompleteAction?: (order: Order) => void;
}

export default function OrderCard({ order, onPrimaryAction, onSecondaryAction, onRequestRefund, onCompleteAction }: OrderCardProps) {
  const { label, className, primaryLabel } = useMemo(() => {
    const display = getCustomerOrderDisplay({
      statusName: order.rawStatusName,
      paymentMethod: order.paymentMethod,
      hasActiveRefund: order.hasActiveRefund,
    });
    const actions = ACTION_BUTTONS[order.status];
    let finalPrimaryLabel = actions.primary;
    if (order.status === "pending" && order.paymentMethod === "SHIP_COD") {
      finalPrimaryLabel = "View Details";
    }
    return {
      label: display.label,
      className: display.className,
      primaryLabel: finalPrimaryLabel,
    };
  }, [order]);

  const actions = ACTION_BUTTONS[order.status];

  // SHIP_COD: cancel only before confirmed
  const canCancel = order.status === "pending" &&
    !(order.paymentMethod === "SHIP_COD" && order.rawStatusName?.toLowerCase() === "confirmed");

  const [isExpanded, setIsExpanded] = useState(false);
  const items = order.items || [];
  const displayedItems = isExpanded ? items : items.slice(0, 2);
  const hasMore = items.length > 2;

  return (
    <div className="border border-gray-200/80 rounded-xl bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <Link href={`/profile/orders/${order.orderId}`} className="block group">
        {/* Card Header */}
        <div className="px-6 py-3 border-b border-gray-100 flex justify-between items-center bg-slate-50/50 group-hover:bg-gray-50/30 transition-colors">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#ff4f00] text-[20px]">
              receipt_long
            </span>
            <span className="text-sm font-bold text-gray-900">
              Order
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-500">
              Order ID: #{order.orderCode}
            </span>
            <span className={`text-xs font-bold uppercase ${className}`}>
              {label}
            </span>
          </div>
        </div>

        {/* Product Info - Render items */}
        {displayedItems.map((item, idx) => {
          const classification = item.categoryName || item.variant || "N/A";
          const isLastDisplayed = idx === displayedItems.length - 1;
          const showBorder = !isLastDisplayed;
          return (
            <div
              key={idx}
              className={`p-6 flex flex-col md:flex-row gap-6 ${
                showBorder ? "border-b border-gray-100" : ""
              } group-hover:bg-gray-50/30 transition-colors`}
            >
              <div className="w-24 h-24 rounded-xl border border-slate-100 overflow-hidden flex-shrink-0 relative shadow-sm">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-grow flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-[#ff4f00] transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-xs text-gray-500 mb-2">
                    Variant: {classification}
                  </p>
                  <p className="text-xs font-semibold text-gray-500">
                    Quantity: x{item.quantity}
                  </p>
                </div>
              </div>
              <div className="flex items-end justify-end flex-shrink-0">
                <span className="text-lg font-bold text-gray-900">
                  {formatPrice(item.price)}
                </span>
              </div>
            </div>
          );
        })}
      </Link>

      {/* Toggle button */}
      {hasMore && (
        <div className="px-6 py-4 border-t border-gray-100 bg-white">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center justify-center gap-1.5 mx-auto px-6 py-2 rounded-full border border-orange-100 text-[#ff4f00] font-bold text-sm hover:bg-orange-50 transition-all duration-300 shadow-sm"
          >
            {isExpanded ? (
              <>
                Show less
                <span className="material-symbols-outlined text-[18px]">expand_less</span>
              </>
            ) : (
              <>
                See {items.length - 2} more products
                <span className="material-symbols-outlined text-[18px]">expand_more</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            Total:
          </span>
          <span className="text-xl text-[#ff4f00] font-black">
            {formatPrice(order.total)}
          </span>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          {actions.secondary && (
            order.status === "cancelled" ? (
              <Link
                href={`/profile/orders/${order.orderId}`}
                className="flex-1 sm:flex-none px-6 py-2.5 border border-gray-300 text-gray-700 text-xs font-black uppercase tracking-wider rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all text-center"
              >
                {actions.secondary}
              </Link>
            ) : (order.status === "pending" && !canCancel) ? (
              <Link
                href={`/profile/orders/${order.orderId}`}
                className="flex-1 sm:flex-none px-6 py-2.5 border border-gray-300 text-gray-700 text-xs font-black uppercase tracking-wider rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all text-center"
              >
                View Details
              </Link>
            ) : (
              <button
                onClick={() => onSecondaryAction?.(order)}
                className="flex-1 sm:flex-none px-6 py-2.5 border border-gray-300 text-gray-700 text-xs font-black uppercase tracking-wider rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all"
              >
                {actions.secondary}
              </button>
            )
          )}
          <button
            onClick={() => onPrimaryAction?.(order)}
            className="flex-1 sm:flex-none px-6 py-2.5 bg-[#ff4f00] hover:bg-[#ff5f1a] text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-sm transition-all"
          >
            {primaryLabel}
          </button>
          {isCustomerOrderDelivered(order.rawStatusName) && onCompleteAction && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onCompleteAction(order);
              }}
              className="flex-1 sm:flex-none px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-sm transition-all"
            >
              Order Received
            </button>
          )}
          {order.rawStatusName?.toLowerCase() === "completed" && onRequestRefund && (
            <button
              onClick={() => !order.hasActiveRefund && onRequestRefund(order)}
              disabled={order.hasActiveRefund}
              title={order.hasActiveRefund ? "Each order is only allowed to have exactly 1 refund request." : undefined}
              className={`flex-1 sm:flex-none px-6 py-2.5 border text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
                order.hasActiveRefund
                  ? "border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {order.hasActiveRefund ? "Refund Requested" : "Request Refund"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
