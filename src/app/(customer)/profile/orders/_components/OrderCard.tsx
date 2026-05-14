"use client";

import Image from "next/image";
import Link from "next/link";

export type OrderStatus =
  | "delivering"
  | "completed"
  | "pending"
  | "shipping"
  | "cancelled";

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
  item: OrderItem;
  total: number;
}

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; className: string }
> = {
  delivering: {
    label: "DELIVERING",
    className: "text-primary-container",
  },
  completed: {
    label: "COMPLETED",
    className: "text-secondary",
  },
  pending: {
    label: "PENDING PAYMENT",
    className: "text-yellow-600",
  },
  shipping: {
    label: "SHIPPING",
    className: "text-blue-600",
  },
  cancelled: {
    label: "CANCELLED",
    className: "text-error",
  },
};

const ACTION_BUTTONS: Record<
  OrderStatus,
  { secondary: string; primary: string }
> = {
  delivering: { secondary: "Contact seller", primary: "Track order" },
  completed: { secondary: "Review", primary: "Buy again" },
  pending: { secondary: "Cancel order", primary: "Pay now" },
  shipping: { secondary: "Contact seller", primary: "Track order" },
  cancelled: { secondary: "View details", primary: "Buy again" },
};

function formatPrice(price: number): string {
  return price.toLocaleString("vi-VN") + " ₫";
}

interface OrderCardProps {
  order: Order;
}

export default function OrderCard({ order }: OrderCardProps) {
  const { label, className } = STATUS_CONFIG[order.status];
  const actions = ACTION_BUTTONS[order.status];
  const classification = order.item.categoryName || order.item.variant || "Updating";

  return (
    <div className="border border-[#e2bfb0]/30 rounded-xl bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <Link href={`/profile/orders/${order.orderId}`} className="block group">
        {/* Card Header */}
        <div className="px-6 py-3 border-b border-[#e2bfb0]/20 flex justify-between items-center bg-slate-50/50 group-hover:bg-[#ff6a00]/5 transition-colors">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#ff6a00] text-[20px]">
              receipt_long
            </span>
            <span className="text-sm font-bold text-[#261812]">
              Orders
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-[#5a4136]">
              Order code: #{order.orderCode}
            </span>
            <span className={`text-xs font-bold uppercase ${className}`}>
              {label}
            </span>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-6 flex flex-col md:flex-row gap-6 border-b border-[#e2bfb0]/10 group-hover:bg-[#ff6a00]/5 transition-colors">
          <div className="w-24 h-24 rounded-xl border border-slate-100 overflow-hidden flex-shrink-0 relative shadow-sm">
            <Image
              src={order.item.image}
              alt={order.item.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-grow flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-[#261812] mb-1 line-clamp-1 group-hover:text-[#ff6a00] transition-colors">
                {order.item.name}
              </h3>
              <p className="text-xs text-[#5a4136] mb-2">
                Variant: {classification}
              </p>
              <p className="text-xs font-semibold text-[#5a4136]">
                Quantity: x{order.item.quantity}
              </p>
            </div>
          </div>
          <div className="flex items-end justify-end flex-shrink-0">
            <span className="text-lg font-bold text-[#ff6a00]">
              {formatPrice(order.item.price)}
            </span>
          </div>
        </div>
      </Link>

      {/* Footer */}
      <div className="px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white">
        <div className="flex items-center gap-2">
          <span className="text-sm text-[#5a4136]">
            Total:
          </span>
          <span className="text-xl text-[#ff6a00] font-black">
            {formatPrice(order.total)}
          </span>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          {order.status === "cancelled" ? (
            <Link
              href={`/profile/orders/${order.orderId}`}
              className="flex-1 sm:flex-none px-6 py-2.5 border border-slate-200 text-[#261812] text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors text-center"
            >
              {actions.secondary}
            </Link>
          ) : (
            <button className="flex-1 sm:flex-none px-6 py-2.5 border border-slate-200 text-[#261812] text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors">
              {actions.secondary}
            </button>
          )}
          <button
            className="flex-1 sm:flex-none px-6 py-2.5 text-white text-sm font-bold rounded-xl shadow-[0_8px_20px_rgba(249,115,22,0.25)] transition hover:-translate-y-0.5 active:translate-y-0"
            style={{ background: "linear-gradient(135deg, #ff6a00, #ff8a1f)" }}
          >
            {actions.primary}
          </button>
        </div>
      </div>
    </div>
  );
}
