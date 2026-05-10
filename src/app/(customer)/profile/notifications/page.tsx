"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import ProfileSidebar from "../_components/ProfileSidebar";
import NotificationTabs from "./_components/NotificationTabs";
import NotificationList from "./_components/NotificationList";
import { NotificationCategory, Notification } from "./_components/types";
import { notificationApi } from "@/features/notifications/services/notification-api";
import { useNotificationRealtime } from "@/features/notifications/context/NotificationRealtimeContext";

const mapCategory = (type: string): NotificationCategory => {
  if (type === "ORDER") return "order";
  if (type === "PROMOTION" || type === "SALE" || type === "VOUCHER") return "promotion";
  return "system";
};

const getIconMeta = (type: string) => {
  switch (type) {
    case "ORDER": return { icon: "local_shipping", iconBg: "bg-blue-100", iconColor: "text-blue-600" };
    case "PROMOTION": return { icon: "sell", iconBg: "bg-orange-100", iconColor: "text-orange-500" };
    case "STOCK": return { icon: "bolt", iconBg: "bg-red-100", iconColor: "text-red-600" };
    case "BLOG": return { icon: "article", iconBg: "bg-green-100", iconColor: "text-green-600" };
    default: return { icon: "info", iconBg: "bg-slate-100", iconColor: "text-slate-500" };
  }
};

function formatDate(dateStr: string) {
  const date = new Date(dateStr + "Z");
  return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")} - ${date.toLocaleDateString("vi-VN")}`;
}

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<NotificationCategory>("all");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { unreadCount, refreshUnread } = useNotificationRealtime();
  const router = useRouter();

  const loadItems = useCallback(async () => {
    try {
      const res = await notificationApi.getNotifications(1, 100);
      const mapped: Notification[] = res.items.map((n) => {
        const meta = getIconMeta(n.notificationType);
        return {
          id: n.deliveryId.toString(),
          category: mapCategory(n.notificationType),
          read: n.status !== "Unread",
          title: n.title,
          description: n.message,
          timestamp: formatDate(n.createdAt),
          icon: meta.icon,
          iconBg: meta.iconBg,
          iconColor: meta.iconColor,
          image: n.imageUrl,
          actionType: n.actionType,
          actionTarget: n.actionTarget,
        };
      });
      setNotifications(mapped);
    } catch (e) {
      console.error("Failed to load notifications", e);
    }
  }, []);

  useEffect(() => {
    void loadItems();
  }, [loadItems, unreadCount]);

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
  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      void loadItems();
      void refreshUnread();
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkRead = async (id: string) => {
    const notif = notifications.find((n) => n.id === id);
    if (!notif) return;

    if (!notif.read) {
      try {
        await notificationApi.markAsRead(Number(id));
        void loadItems();
        void refreshUnread();
      } catch (e) {
        console.error(e);
      }
    }
    
    // Always record click for analytics
    try {
      await notificationApi.recordClick(Number(id));
    } catch (e) {
      console.error("Failed to record click", e);
    }

    if (notif.actionTarget) {
      const target = notif.actionTarget;
      if (target.startsWith("http")) {
        window.open(target, "_blank");
      } else if (target.startsWith("/")) {
        router.push(target);
      } else {
        // If it's just an ID
        if (notif.actionType === "PRODUCT") {
          router.push(`/products/${target}`);
        } else if (notif.actionType === "BLOG") {
          router.push(`/blog/${target}`);
        } else if (notif.actionType === "VOUCHER") {
          router.push(`/profile/wallet`);
        } else {
          router.push(target);
        }
      }
    }
  };

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
            disabled={counts.all === 0}
            className="text-sm text-[#a14000] hover:text-[#ff6a00] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

