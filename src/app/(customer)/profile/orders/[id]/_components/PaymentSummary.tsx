"use client";

export interface PaymentSummaryData {
  subtotal: number;
  shippingFee: number;
  discount: number;
  paymentMethod: string;
  paymentStatus: string;
}

function formatPrice(p: number) {
  return p.toLocaleString("vi-VN") + " ₫";
}

export default function PaymentSummary({
  subtotal,
  shippingFee,
  discount,
  paymentMethod,
  paymentStatus,
}: PaymentSummaryData) {
  const total = subtotal + shippingFee - discount;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-[#e2bfb0]/30">
      <h2 className="text-base font-bold text-[#261812] mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-[#ff6a00]">
          payments
        </span>
        Payment Summary
      </h2>

      <div className="flex flex-col gap-3 pb-4 border-b border-[#e2bfb0]/10">
        <div className="flex justify-between items-center">
          <span className="text-sm text-[#5a4136]">Subtotal</span>
          <span className="text-sm font-bold text-[#261812]">
            {formatPrice(subtotal)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-[#5a4136]">Shipping Fee</span>
          <span className="text-sm font-bold text-[#261812]">
            {formatPrice(shippingFee)}
          </span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-[#5a4136]">Discount</span>
            <span className="text-sm font-bold text-green-600">
              -{formatPrice(discount)}
            </span>
          </div>
        )}
      </div>

      <div className="pt-4 flex justify-between items-center mb-4">
        <span className="text-base font-bold text-[#261812]">Total</span>
        <span className="text-xl font-black text-[#ff6a00]">
          {formatPrice(total)}
        </span>
      </div>

      <div className="flex flex-col gap-3 bg-slate-50/50 p-4 rounded-xl border border-[#e2bfb0]/20">
        <div className="flex items-center gap-2 text-sm text-[#5a4136]">
          <span className="material-symbols-outlined text-[#ff6a00] text-[20px]">
            credit_card
          </span>
          {paymentMethod}
        </div>
        
        {paymentStatus && (
          <div className="flex items-center gap-2 pt-2 border-t border-[#e2bfb0]/10">
            <span className="text-xs text-gray-500 font-medium">Status:</span>
            {paymentStatus.toUpperCase() === "REFUNDED" ? (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-blue-50 text-blue-600 border border-blue-200">
                REFUNDED
              </span>
            ) : paymentStatus.toUpperCase() === "PARTIALLY_REFUNDED" ? (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-orange-50 text-orange-600 border border-orange-200">
                PARTIALLY REFUNDED
              </span>
            ) : paymentStatus.toUpperCase() === "PAID" ? (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-green-50 text-green-600 border border-green-200">
                PAID
              </span>
            ) : (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-gray-50 text-gray-600 border border-gray-200">
                {paymentStatus}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
