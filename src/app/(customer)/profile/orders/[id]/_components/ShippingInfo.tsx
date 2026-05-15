"use client";

export interface ShippingInfoData {
  recipientName: string;
  phone: string;
  address: string;
  method: string;
  estimatedDate: string;
}

export default function ShippingInfo({
  recipientName,
  phone,
  address,
  method,
  estimatedDate,
}: ShippingInfoData) {
  return (
    <div className="flex flex-col gap-6">
      {/* Recipient */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-[#e2bfb0]/30">
        <h2 className="text-base font-bold text-[#261812] mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#ff6a00]">
            location_on
          </span>
          Shipping Address
        </h2>
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-sm font-bold text-[#261812]">
              {recipientName}
            </p>
            <p className="text-sm text-[#5a4136] mt-1">{phone}</p>
          </div>
          <p className="text-sm text-[#5a4136] leading-relaxed whitespace-pre-line">
            {address}
          </p>
        </div>
      </div>

      {/* Shipping method */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-[#e2bfb0]/30">
        <h2 className="text-base font-bold text-[#261812] mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#ff6a00]">
            local_shipping
          </span>
          Shipping Method
        </h2>
        <div className="flex flex-col gap-2">
          <p className="text-sm font-bold text-[#261812]">{method}</p>
          <p className="text-sm text-[#5a4136]">
            Estimated Delivery: {estimatedDate}
          </p>
        </div>
      </div>
    </div>
  );
}
