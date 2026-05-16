"use client";

export interface Address {
  id: number;
  name: string | null;
  phone: string | null;
  street: string;
  ward: string;
  district: string;
  city: string;
  wardCode?: string | null;
  districtId?: number | null;
  provinceId?: number | null;
  isDefault?: boolean;
}

interface AddressCardProps {
  address: Address;
  onEdit: (address: Address) => void;
  onDelete?: (id: number) => void;
  onSetDefault?: (id: number) => void;
}

export default function AddressCard({ address, onEdit, onDelete, onSetDefault }: AddressCardProps) {
  return (
    <div className={`border rounded-lg p-6 flex flex-col sm:flex-row justify-between items-start gap-4 transition-all ${address.isDefault ? "border-[#e2bfb0]" : "border-[#e2bfb0]/50"}`}>
      <div className="flex-1">
        <div className="flex items-center gap-4 mb-2">
          {address.name && (
            <span className="font-bold text-[#261812] border-r border-[#e2bfb0] pr-4">
              {address.name}
            </span>
          )}
          <span className="text-[#5a4136] text-sm">{address.phone || "No phone number"}</span>
        </div>
        <p className="text-[#5a4136] text-sm mb-1">{address.street}</p>
        <p className="text-[#5a4136] text-sm mb-2">
          {address.ward}, {address.district}, {address.city}
        </p>

        <div className="flex flex-wrap items-center gap-2 mt-2">
          {address.isDefault && <span className="inline-block border border-[#ff6a00] text-[#ff6a00] text-xs px-2 py-1 rounded">DEFAULT</span>}
          {!address.isDefault && onSetDefault && (
            <button onClick={() => onSetDefault(address.id)} className="text-xs border border-[#e2bfb0] text-[#5a4136] px-2 py-1 rounded hover:border-[#a14000] hover:text-[#a14000] transition-colors">
              Set default
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-row sm:flex-col gap-2 sm:items-end shrink-0">
        <button
          onClick={() => onEdit(address)}
          className="text-[#a14000] hover:text-[#ff6a00] transition-colors"
          title="Edit address"
          aria-label="Edit address"
        >
          <span className="material-symbols-outlined text-[20px]">edit</span>
        </button>
        {!address.isDefault && onDelete && (
          <button
            onClick={() => onDelete(address.id)}
            className="text-[#ba1a1a] hover:text-red-700 transition-colors"
            title="Delete address"
            aria-label="Delete address"
          >
            <span className="material-symbols-outlined text-[20px]">delete</span>
          </button>
        )}
      </div>
    </div>
  );
}
