"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProfileSidebar from "../_components/ProfileSidebar";
import NotificationTabs from "./_components/NotificationTabs";
import NotificationList from "./_components/NotificationList";
import { NotificationCategory, Notification } from "./_components/types";
import { notificationApi } from "@/features/notifications/services/notification-api";
import { useNotificationRealtime } from "@/features/notifications/context/NotificationRealtimeContext";
import { formatFullDateTime } from "@/utils/date-utils";
import ConfirmModal from "@/components/common/ConfirmModal";

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

const isBlogRelatedNotification = (notification: Notification) => {
  const actionTarget = notification.actionTarget ?? "";
  const text = `${notification.title} ${notification.description}`.toLowerCase();

  return notification.notificationType === "BLOG"
    || notification.actionType === "BLOG"
    || actionTarget.startsWith("/blog")
    || text.includes("blog comment");
};

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<NotificationCategory>("all");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { unreadCount, refreshUnread } = useNotificationRealtime();
  const router = useRouter();
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const loadItems = useCallback(async () => {
    try {
      const res = await notificationApi.getNotifications(1, 100);
      const mapped: Notification[] = res.items.map((n) => {
        const meta = getIconMeta(n.notificationType);
        return {
          id: n.deliveryId.toString(),
          category: mapCategory(n.notificationType),
          notificationType: n.notificationType,
          read: n.status !== "Unread",
          title: n.title,
          description: n.message,
          timestamp: formatFullDateTime(n.createdAt),
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

  const handleDelete = (notification: Notification) => {
    const doDelete = async () => {
      try {
        await notificationApi.deleteNotification(Number(notification.id));
        setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
        void refreshUnread();
      } catch (e) {
        console.error(e);
      }
      setConfirmModal((prev) => ({ ...prev, show: false }));
    };

    if (notification.notificationType === "SYSTEM" && !isBlogRelatedNotification(notification)) {
      setConfirmModal({
        show: true,
        title: "Confirm deletion",
        message: "This is an important system notification. Are you sure you want to delete it?",
        onConfirm: doDelete,
      });
    } else {
      void doDelete();
    }
  };

  const handleDeleteAllRead = () => {
    setConfirmModal({
      show: true,
      title: "Confirm delete all",
      message: "Are you sure you want to delete all read notifications?",
      onConfirm: async () => {
        try {
          await notificationApi.deleteAllReadNotifications();
          void loadItems();
          void refreshUnread();
        } catch (e) {
          console.error(e);
        }
        setConfirmModal((prev) => ({ ...prev, show: false }));
      },
    });
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
      {/* Sidebar */}
      <ProfileSidebar />

      {/* Main panel */}
      <section className="col-span-1 md:col-span-3 bg-white rounded-xl shadow-sm border border-[#e2bfb0]/30 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e2bfb0]/30 flex justify-between items-center bg-white">
          <div>
            <h1 className="text-2xl font-bold text-[#261812]">My Notifications</h1>
            <p className="mt-1 text-sm text-[#5a4136]">View and manage your account and promotional notifications.</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleMarkAllRead}
              disabled={counts.all === 0}
              className="text-sm text-[#a14000] hover:text-[#ff6a00] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Mark all as read
            </button>
            <div className="w-[1px] h-4 bg-[#e2bfb0]/30" />
            <button
              onClick={handleDeleteAllRead}
              className="text-sm text-red-500 hover:text-red-600 font-semibold transition-colors"
            >
              Delete all read
            </button>
          </div>
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
          onDelete={handleDelete}
        />
      </section>

      <ConfirmModal
        isOpen={confirmModal.show}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, show: false }))}
        confirmText="Confirm"
        type="danger"
      />
    </main>
  );
}

