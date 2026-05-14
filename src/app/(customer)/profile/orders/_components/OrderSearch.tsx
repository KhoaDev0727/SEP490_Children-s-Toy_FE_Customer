"use client";

interface OrderSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export default function OrderSearch({ value, onChange }: OrderSearchProps) {
  return (
    <div className="px-6 py-4 bg-slate-50/50 border-b border-[#e2bfb0]/20">
      <div className="relative max-w-2xl">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
          search
        </span>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl bg-white text-[#261812] focus:border-[#ff6a00] focus:ring-1 focus:ring-[#ff6a00] outline-none transition-all text-sm"
          placeholder="Search orders by ID or product name"
        />
      </div>
    </div>
  );
}
