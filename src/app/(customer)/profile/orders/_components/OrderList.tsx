"use client";

import OrderCard, { Order } from "./OrderCard";

interface OrderListProps {
  orders: Order[];
}

export default function OrderList({ orders }: OrderListProps) {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-[#5a4136]/50 gap-4 bg-slate-50/30 rounded-2xl border border-dashed border-[#e2bfb0]/30">
        <span className="material-symbols-outlined text-7xl opacity-40">
          package_2
        </span>
        <p className="text-base font-bold">
          Không tìm thấy đơn hàng nào
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {orders.map((order) => (
        <OrderCard key={order.orderId} order={order} />
      ))}
    </div>
  );
}
