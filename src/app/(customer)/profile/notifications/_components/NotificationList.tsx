"use client";

import { useState } from "react";
import Image from "next/image";
import { Notification, NotificationCategory } from "./types";

interface NotificationListProps {
  notifications: Notification[];
  activeTab: NotificationCategory;
  onMarkAllRead: () => void;
  onMarkRead: (id: string) => void;
  onDelete: (id: string, type: string) => void;
}

const PAGE_SIZE = 4;

export default function NotificationList({
  notifications,
  activeTab,
  onMarkAllRead,
  onMarkRead,
  onDelete,
}: NotificationListProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filtered =
    activeTab === "all"
      ? notifications
      : notifications.filter((n) => n.category === activeTab);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const handleLoadMore = () => setVisibleCount((prev) => prev + PAGE_SIZE);

  return (
    <div className="flex flex-col">
      {/* Notification items */}
      {visible.length === 0 ? (
        <EmptyState />
      ) : (
        <ul>
          {visible.map((notif) => (
            <NotificationItem
              key={notif.id}
              notification={notif}
              onRead={() => onMarkRead(notif.id)}
              onDelete={() => onDelete(notif.id, notif.category.toUpperCase())}
            />
          ))}
        </ul>
      )}

      {/* Load more */}
      {hasMore && (
        <div className="p-6 flex justify-center bg-white">
          <button
            onClick={handleLoadMore}
            className="px-6 py-2 border border-[#8e7164] text-[#a14000] text-sm font-semibold rounded-lg hover:bg-[#fff1eb] transition-colors"
          >
            Load more
          </button>
        </div>
      )}

      {!hasMore && filtered.length > 0 && (
        <p className="text-center text-xs text-[#5a4136] py-6">
          All notifications are displayed
        </p>
      )}
    </div>
  );
}

/* ─── Single Item ─────────────────────────────────────────────────────────── */
function NotificationItem({
  notification: n,
  onRead,
  onDelete,
}: {
  notification: Notification;
  onRead: () => void;
  onDelete: () => void;
}) {
  return (
    <li
      onClick={onRead}
      className={`
        flex gap-4 p-6 cursor-pointer border-b border-[#e2bfb0]/20
        relative group transition-colors duration-150
        ${n.read ? "bg-white hover:bg-[#fff1eb]" : "bg-[#fff1eb] hover:bg-[#ffeae1]"}
      `}
    >
      {/* Unread dot */}
      {!n.read && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#ff6a00] rounded-full" />
      )}

      {/* Icon */}
      <div
        className={`
          w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0
          ${n.iconBg} ${n.iconColor}
        `}
      >
        <span
          className="material-symbols-outlined"
          style={
            n.icon === "sell"
              ? ({ fontVariationSettings: "'FILL' 1" } as React.CSSProperties)
              : undefined
          }
        >
          {n.icon}
        </span>
      </div>

      {/* Content */}
      <div className="flex-grow pl-2 min-w-0">
        <h3
          className={`
            text-sm font-semibold mb-1 group-hover:text-[#a14000] transition-colors truncate
            ${n.read ? "text-[#261812]/70" : "text-[#261812]"}
          `}
        >
          {n.title}
        </h3>
        <p
          className={`
            text-sm leading-relaxed mb-2 line-clamp-2
            ${n.read ? "text-[#5a4136]/70" : "text-[#5a4136]"}
          `}
        >
          {n.description}
        </p>
        <time className="text-xs text-[#565e74]">{n.timestamp}</time>
      </div>

      {/* Optional product image */}
      {n.image && (
        <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden hidden sm:block">
          <Image
            src={n.image}
            alt="Product thumbnail"
            width={64}
            height={64}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Delete Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="absolute top-4 right-4 p-2 text-[#8e7164] hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
        title="Delete notification"
      >
        <span className="material-symbols-outlined text-[20px]">delete</span>
      </button>
    </li>
  );
}

/* ─── Empty State ─────────────────────────────────────────────────────────── */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-[#5a4136]">
      <span className="material-symbols-outlined text-6xl text-[#e2bfb0]">
        notifications_off
      </span>
      <p className="text-sm font-semibold">No notifications</p>
      <p className="text-xs text-[#8e7164]">
        New notifications will appear here
      </p>
    </div>
  );
}
