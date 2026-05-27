"use client";

import React, { useState } from "react";
import UnreviewedList from "./UnreviewedList";
import ReviewedList from "./ReviewedList";

export default function ReviewTabs() {
  const [activeTab, setActiveTab] = useState<"unreviewed" | "reviewed">(
    "unreviewed",
  );

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
              onClick={() =>
                setActiveTab(tab.value as "unreviewed" | "reviewed")
              }
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
