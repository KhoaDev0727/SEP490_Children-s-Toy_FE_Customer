"use client";

const TABS = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Shipping", value: "shipping" },
  { label: "Delivering", value: "delivering" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

interface OrderTabsProps {
  activeTab: string;
  onChange: (value: string) => void;
}

export default function OrderTabs({ activeTab, onChange }: OrderTabsProps) {
  return (
    <div className="flex overflow-x-auto border-b border-[#e2bfb0]/30 px-6 no-scrollbar bg-white">
      {TABS.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`px-6 py-4 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === tab.value
              ? "text-[#ff6a00] border-[#ff6a00]"
              : "text-[#5a4136] hover:text-[#ff6a00] border-transparent"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
