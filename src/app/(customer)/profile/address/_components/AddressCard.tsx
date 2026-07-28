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
    <div className={`border rounded-xl p-6 flex flex-col sm:flex-row justify-between items-start gap-4 transition-all ${address.isDefault ? "border-[#ff4f00] bg-[#ff4f00]/5" : "border-slate-200 bg-white"}`}>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-4 mb-2">
          {address.name && (
            <span className="font-bold text-[#0f172a] border-r border-slate-200 pr-4 break-words">
              {address.name}
            </span>
          )}
          <span className="text-[#475569] text-sm">{address.phone || "No phone number"}</span>
        </div>
        <p className="text-[#475569] text-sm mb-1 break-words whitespace-pre-wrap">{address.street}</p>
        <p className="text-[#475569] text-sm mb-2 break-words">
          {address.ward}, {address.district}, {address.city}
        </p>

        <div className="flex flex-wrap items-center gap-2 mt-2">
          {address.isDefault && <span className="inline-block border border-[#ff4f00]/20 text-[#ff4f00] bg-[#ff4f00]/5 text-xs px-2 py-0.5 rounded-md">DEFAULT</span>}
          {!address.isDefault && onSetDefault && (
            <button onClick={() => onSetDefault(address.id)} className="text-xs border border-slate-200 text-[#475569] px-2 py-1 rounded-md hover:border-slate-300 hover:text-slate-900 bg-white hover:bg-slate-50 transition-colors">
              Set default
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-row sm:flex-col gap-2 sm:items-end shrink-0">
        <button
          onClick={() => onEdit(address)}
          className="text-slate-500 hover:text-[#ff4f00] transition-colors"
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
