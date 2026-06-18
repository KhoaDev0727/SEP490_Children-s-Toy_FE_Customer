"use client";

import React, { useState, useEffect } from "react";
import UnreviewedList from "./UnreviewedList";
import ReviewedList from "./ReviewedList";
import { useSearchParams } from "next/navigation";

export default function ReviewTabs() {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") === "reviewed" ? "reviewed" : "unreviewed";
  
  const [activeTab, setActiveTab] = useState<"unreviewed" | "reviewed">(defaultTab);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "reviewed" || tabParam === "unreviewed") {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const tabs = [
    { value: "unreviewed", label: "Not reviewed yet" },
    { value: "reviewed", label: "Reviewed" },
  ];

  return (
    <div className="flex flex-col grow">
      {/* Tabs */}
      <div className="flex items-center gap-8 px-6 md:px-8 border-b border-slate-100 bg-white">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => {
                setActiveTab(tab.value as "unreviewed" | "reviewed");
                const params = new URLSearchParams(window.location.search);
                params.set("tab", tab.value);
                window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
              }}
              className={`relative py-4 text-sm font-medium transition-all hover:cursor-pointer ${
                isActive
                  ? "text-[#ff4f00] font-semibold"
                  : "text-slate-600 hover:text-[#ff4f00]"
              }`}
            >
              {tab.label}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ff4f00]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="p-6 md:p-8 grow">
        {activeTab === "unreviewed" && <UnreviewedList />}
        {activeTab === "reviewed" && <ReviewedList />}
      </div>
    </div>
  );
}
