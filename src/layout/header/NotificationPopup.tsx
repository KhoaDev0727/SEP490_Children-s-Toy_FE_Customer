"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useNotificationRealtime } from "@/features/notifications/context/NotificationRealtimeContext";
import { notificationApi, Delivery } from "@/features/notifications/services/notification-api";
import { formatTimeAgo } from "@/utils/date-utils";
import ConfirmModal from "@/components/common/ConfirmModal";

const getIconMeta = (type: string) => {
  switch (type) {
    case "ORDER": return { icon: "local_shipping", bg: "bg-blue-100 dark:bg-blue-900/30", color: "text-blue-600 dark:text-blue-400" };
    case "PROMOTION": return { icon: "sell", bg: "bg-orange-100 dark:bg-orange-900/30", color: "text-orange-500" };
    case "STOCK": return { icon: "bolt", bg: "bg-red-100 dark:bg-red-900/30", color: "text-red-600" };
    case "BLOG": return { icon: "article", bg: "bg-green-100 dark:bg-green-900/30", color: "text-green-600 dark:text-green-400" };
    default: return { icon: "info", bg: "bg-slate-100 dark:bg-slate-800", color: "text-slate-500" };
  }
};

export default function NotificationPopup() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Delivery[]>([]);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
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
      const res = await notificationApi.getNotifications(1, 10);
      setItems(res.items);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    let t: NodeJS.Timeout;
    if (open) {
      t = setTimeout(() => setVisible(true), 0);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void loadItems();
    } else {
      t = setTimeout(() => setVisible(false), 200);
    }
    return () => clearTimeout(t);
  }, [open, loadItems, unreadCount]); // reload items when unreadCount changes while open

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const markAll = async () => {
    await notificationApi.markAllAsRead();
    void loadItems();
    void refreshUnread();
  };

  const markOne = async (id: number) => {
    const notif = items.find((n) => n.deliveryId === id);
    if (notif && notif.status === "Unread") {
      await notificationApi.markAsRead(id);
      void loadItems();
      void refreshUnread();
    }
    // Always record click for analytics
    await notificationApi.recordClick(id);

    if (notif?.actionTarget) {
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
      setOpen(false);
    }
  };

  const handleDelete = (id: number, type: string) => {
    const doDelete = async () => {
      try {
        await notificationApi.deleteNotification(id);
        setItems((prev) => prev.filter((n) => n.deliveryId !== id));
        void refreshUnread();
      } catch (e) {
        console.error(e);
      }
      setConfirmModal((prev) => ({ ...prev, show: false }));
    };

    if (type === "SYSTEM") {
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

  return (
    <div className="relative" ref={ref}>
      {/* Bell button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full relative text-slate-600 dark:text-slate-300 transition-colors"
        aria-label="Notifications"
      >
        <span className="material-symbols-outlined">notifications</span>
        {mounted && unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-950 animate-ping" />
        )}
        {mounted && unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-950" />
        )}
      </button>

      {/* Popup */}
      {visible && (
        <div
          className={`absolute top-full right-0 mt-2 w-80 bg-white dark:bg-slate-900 shadow-2xl rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-[60]
            transition-all duration-200
            ${open ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-2 scale-95 pointer-events-none"}
          `}
          style={{ transformOrigin: "top right" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Notifications</h4>
              {unreadCount > 0 && (
                <span className="bg-primary text-white text-[10px] font-black px-1.5 py-0.5 rounded-full leading-none">
                  {unreadCount}
                </span>
              )}
            </div>
            <button
              onClick={markAll}
              className="text-[11px] font-bold text-primary hover:underline disabled:opacity-40"
              disabled={unreadCount === 0}
            >
              Mark as read
            </button>
          </div>

          {/* List */}
          <ul className="max-h-[340px] overflow-y-auto divide-y divide-slate-50 dark:divide-slate-800 no-scrollbar">
            {items.length === 0 ? (
              <li className="py-6 text-center text-sm text-slate-400">No notifications yet</li>
            ) : items.map((n) => {
              const meta = getIconMeta(n.notificationType);
              const isUnread = n.status === "Unread";
              return (
                <li
                  key={n.deliveryId}
                  onClick={() => markOne(n.deliveryId)}
                  className={`flex gap-3 px-4 py-3.5 cursor-pointer transition-colors group
                    ${!isUnread ? "opacity-60 hover:opacity-80" : "bg-primary/[0.03] hover:bg-primary/[0.06]"}
                  `}
                >
                  {/* Icon */}
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${meta.bg} ${meta.color}`}>
                    <span className="material-symbols-outlined text-[18px]">{meta.icon}</span>
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-slate-800 dark:text-slate-200 leading-snug">
                      <span className="font-bold block">{n.title}</span>
                      <span className="opacity-90">{n.message}</span>
                    </p>
                    <span className="text-[10px] text-slate-400 mt-1 block">{formatTimeAgo(n.createdAt)}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col items-end gap-2 shrink-0 self-start mt-1">
                    {isUnread && (
                      <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        void handleDelete(n.deliveryId, n.notificationType);
                      }}
                      className="p-1 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete notification"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Footer */}
          <Link
            href="/profile/notifications"
            onClick={() => setOpen(false)}
            className="block w-full py-3 text-center text-xs font-bold text-slate-500 hover:text-primary border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors"
          >
            View all notifications
          </Link>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmModal.show}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, show: false }))}
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
}
