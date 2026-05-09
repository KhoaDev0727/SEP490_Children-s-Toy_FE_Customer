"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import ProfileSidebar from "../_components/ProfileSidebar";
import NotificationTabs from "./_components/NotificationTabs";
import NotificationList from "./_components/NotificationList";
import {
  MOCK_NOTIFICATIONS,
  NotificationCategory,
  Notification,
} from "./_components/types";

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<NotificationCategory>("all");
  const [notifications, setNotifications] =
    useState<Notification[]>(MOCK_NOTIFICATIONS);

  /* ── Counts per tab ─────────────────────────────────────────────────────── */
  const counts = useMemo(() => {
    const unread = notifications.filter((n) => !n.read);
    return {
      all: unread.length,
      promotion: unread.filter((n) => n.category === "promotion").length,
      order: unread.filter((n) => n.category === "order").length,
      system: unread.filter((n) => n.category === "system").length,
    } satisfies Record<NotificationCategory, number>;
  }, [notifications]);

  /* ── Handlers ───────────────────────────────────────────────────────────── */
  const handleMarkAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const handleMarkRead = (id: string) =>
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

  return (
    <main className="flex-grow max-w-[1280px] mx-auto w-full px-4 md:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Breadcrumb (full width) */}
      <div className="col-span-full mb-2">
        <Breadcrumbs 
          items={[
            { label: "Tài khoản", href: "/profile" },
            { label: "Thông báo" }
          ]} 
        />
      </div>

      {/* Sidebar */}
      <ProfileSidebar />

      {/* Main panel */}
      <section className="col-span-1 md:col-span-3 bg-white rounded-xl shadow-sm border border-[#e2bfb0]/30 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e2bfb0]/30 flex justify-between items-center bg-white">
          <h1 className="text-xl font-bold text-[#261812]">Thông báo của tôi</h1>
          <button
            onClick={handleMarkAllRead}
            className="text-sm text-[#a14000] hover:text-[#ff6a00] font-semibold transition-colors"
          >
            Đánh dấu tất cả đã đọc
          </button>
        </div>

        {/* Tabs */}
        <NotificationTabs
          active={activeTab}
          onChange={(tab) => setActiveTab(tab)}
          counts={counts}
        />

        {/* List */}
        <NotificationList
          notifications={notifications}
          activeTab={activeTab}
          onMarkAllRead={handleMarkAllRead}
          onMarkRead={handleMarkRead}
        />
      </section>

    </main>
  );
}

