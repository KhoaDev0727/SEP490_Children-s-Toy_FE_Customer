"use client";

const TABS = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Shipping", value: "shipping" },
  { label: "Delivering", value: "delivering" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Refunded", value: "refunded" },
];

interface OrderTabsProps {
  activeTab: string;
  onChange: (value: string) => void;
}

export default function OrderTabs({ activeTab, onChange }: OrderTabsProps) {
  return (
    <div className="flex overflow-x-auto border-b border-gray-200/80 px-6 no-scrollbar bg-white">
      {TABS.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`px-6 py-4 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors hover:cursor-pointer ${
            activeTab === tab.value
              ? "text-[#ff4f00] border-[#ff4f00]"
              : "text-gray-500 hover:text-[#ff4f00] border-transparent"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
