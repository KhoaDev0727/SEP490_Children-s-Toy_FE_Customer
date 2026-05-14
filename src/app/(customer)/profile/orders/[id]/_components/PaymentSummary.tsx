"use client";

export interface PaymentSummaryData {
  subtotal: number;
  shippingFee: number;
  discount: number;
  paymentMethod: string;
}

function formatPrice(p: number) {
  return p.toLocaleString("vi-VN") + " ₫";
}

export default function PaymentSummary({
  subtotal,
  shippingFee,
  discount,
  paymentMethod,
}: PaymentSummaryData) {
  const total = subtotal + shippingFee - discount;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-[#e2bfb0]/30">
      <h2 className="text-base font-bold text-[#261812] mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-[#ff6a00]">
          payments
        </span>
        Payment information
      </h2>

      <div className="flex flex-col gap-3 pb-4 border-b border-[#e2bfb0]/10">
        <div className="flex justify-between items-center">
          <span className="text-sm text-[#5a4136]">Item total</span>
          <span className="text-sm font-bold text-[#261812]">
            {formatPrice(subtotal)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-[#5a4136]">Shipping fee</span>
          <span className="text-sm font-bold text-[#261812]">
            {formatPrice(shippingFee)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-[#5a4136]">Discount code</span>
          <span className="text-sm font-bold text-green-600">
            -{formatPrice(discount)}
          </span>
        </div>
      </div>

      <div className="pt-4 flex justify-between items-center mb-4">
        <span className="text-base font-bold text-[#261812]">Total</span>
        <span className="text-xl font-black text-[#ff6a00]">
          {formatPrice(total)}
        </span>
      </div>

      <div className="flex items-center gap-2 text-sm text-[#5a4136] bg-slate-50/50 p-4 rounded-xl border border-[#e2bfb0]/20">
        <span className="material-symbols-outlined text-[#ff6a00] text-[20px]">
          credit_card
        </span>
        {paymentMethod}
      </div>
    </div>
  );
}
