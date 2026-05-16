"use client";

import { NOTIFICATION_TABS, NotificationCategory } from "./types";

interface NotificationTabsProps {
  active: NotificationCategory;
  onChange: (tab: NotificationCategory) => void;
  counts: Record<NotificationCategory, number>;
}

export default function NotificationTabs({
  active,
  onChange,
  counts,
}: NotificationTabsProps) {
  return (
    <div className="flex overflow-x-auto border-b border-[#e2bfb0]/30 px-6 bg-white scrollbar-none">
      {NOTIFICATION_TABS.map((tab) => {
        const isActive = tab.key === active;
        const count = counts[tab.key];

        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`
              relative px-5 py-4 text-sm font-semibold whitespace-nowrap
              border-b-2 transition-colors duration-200 flex items-center gap-2
              ${
                isActive
                  ? "text-[#ff6a00] border-[#ff6a00]"
                  : "text-[#5a4136] border-transparent hover:text-[#a14000]"
              }
            `}
          >
            {tab.label}
            {count > 0 && (
              <span
                className={`
                  inline-flex items-center justify-center min-w-[18px] h-[18px] px-1
                  text-[10px] font-bold rounded-full leading-none
                  ${
                    isActive
                      ? "bg-[#ff6a00] text-white"
                      : "bg-[#ffeae1] text-[#a14000]"
                  }
                `}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
