"use client";

export interface Address {
  id: string;
  name: string;
  phone: string;
  street: string;
  ward: string;
  district: string;
  city: string;
  isDefault?: boolean;
}

interface AddressCardProps {
  address: Address;
  onEdit: (address: Address) => void;
  onDelete?: (id: string) => void;
  onSetDefault?: (id: string) => void;
}

export default function AddressCard({ address, onEdit, onDelete, onSetDefault }: AddressCardProps) {
  return (
    <div
      className={`border rounded-lg p-6 flex flex-col sm:flex-row justify-between items-start gap-4 transition-all ${
        address.isDefault ? "border-[#e2bfb0]" : "border-[#e2bfb0]/50"
      }`}
    >
      <div className="flex-1">
        <div className="flex items-center gap-4 mb-2">
          <span className="font-bold text-[#261812] border-r border-[#e2bfb0] pr-4">{address.name}</span>
          <span className="text-[#5a4136] text-sm">{address.phone}</span>
        </div>
        <p className="text-[#5a4136] text-sm mb-1">{address.street}</p>
        <p className="text-[#5a4136] text-sm mb-2">
          {address.ward}, {address.district}, {address.city}
        </p>

        <div className="flex flex-wrap items-center gap-2 mt-2">
          {address.isDefault && (
            <span className="inline-block border border-[#ff6a00] text-[#ff6a00] text-xs px-2 py-1 rounded">
              MẶC ĐỊNH
            </span>
          )}
          {!address.isDefault && onSetDefault && (
            <button
              onClick={() => onSetDefault(address.id)}
              className="text-xs border border-[#e2bfb0] text-[#5a4136] px-2 py-1 rounded hover:border-[#a14000] hover:text-[#a14000] transition-colors"
            >
              Đặt mặc định
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-row sm:flex-col gap-2 sm:items-end shrink-0">
        <button
          onClick={() => onEdit(address)}
          className="text-[#a14000] hover:text-[#ff6a00] text-sm font-medium transition-colors"
        >
          Chỉnh sửa
        </button>
        {!address.isDefault && onDelete && (
          <button
            onClick={() => onDelete(address.id)}
            className="text-[#ba1a1a] hover:text-red-700 text-sm font-medium transition-colors"
          >
            Xóa
          </button>
        )}
      </div>
    </div>
  );
}
