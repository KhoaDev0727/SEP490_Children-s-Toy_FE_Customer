"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface Notification {
  id: number;
  type: "shipping" | "voucher" | "flash" | "system";
  title: string;
  highlight?: string;
  time: string;
  read: boolean;
}

const iconMap = {
  shipping: { icon: "local_shipping", bg: "bg-blue-100 dark:bg-blue-900/30", color: "text-blue-600 dark:text-blue-400" },
  voucher:  { icon: "sell",           bg: "bg-orange-100 dark:bg-orange-900/30", color: "text-orange-500" },
  flash:    { icon: "bolt",           bg: "bg-red-100 dark:bg-red-900/30",    color: "text-red-600" },
  system:   { icon: "info",           bg: "bg-slate-100 dark:bg-slate-800",   color: "text-slate-500" },
};

const INITIAL: Notification[] = [
  { id: 1, type: "shipping", title: "Đơn hàng", highlight: "#SX789012", time: "Vừa xong", read: false },
  { id: 2, type: "voucher",  title: "Voucher mới: Giảm 20% cho đơn LEGO", highlight: "Giảm 20%", time: "2 giờ trước", read: false },
  { id: 3, type: "flash",    title: "Flash Sale bắt đầu trong 15 phút!", time: "5 giờ trước", read: false },
  { id: 4, type: "system",   title: "Tài khoản của bạn đã được xác minh thành công.", time: "1 ngày trước", read: true },
];

export default function NotificationPopup() {
  const [open, setOpen]               = useState(false);
  const [items, setItems]             = useState<Notification[]>(INITIAL);
  const [visible, setVisible]         = useState(false);
  const ref                           = useRef<HTMLDivElement>(null);

  const unread = items.filter((n) => !n.read).length;

  // animate in/out
  useEffect(() => {
    if (open) { setVisible(true); }
    else       { const t = setTimeout(() => setVisible(false), 200); return () => clearTimeout(t); }
  }, [open]);

  // close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markAll = () => setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  const markOne = (id: number) => setItems((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));

  return (
    <div className="relative" ref={ref}>
      {/* Bell button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full relative text-slate-600 dark:text-slate-300 transition-colors"
        aria-label="Thông báo"
      >
        <span className="material-symbols-outlined">notifications</span>
        {unread > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-950 animate-ping" />
        )}
        {unread > 0 && (
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
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Thông báo</h4>
              {unread > 0 && (
                <span className="bg-primary text-white text-[10px] font-black px-1.5 py-0.5 rounded-full leading-none">
                  {unread}
                </span>
              )}
            </div>
            <button
              onClick={markAll}
              className="text-[11px] font-bold text-primary hover:underline disabled:opacity-40"
              disabled={unread === 0}
            >
              Đánh dấu đã đọc
            </button>
          </div>

          {/* List */}
          <ul className="max-h-[340px] overflow-y-auto divide-y divide-slate-50 dark:divide-slate-800 no-scrollbar">
            {items.map((n) => {
              const meta = iconMap[n.type];
              return (
                <li
                  key={n.id}
                  onClick={() => markOne(n.id)}
                  className={`flex gap-3 px-4 py-3.5 cursor-pointer transition-colors
                    ${n.read ? "opacity-60 hover:opacity-80" : "bg-primary/[0.03] hover:bg-primary/[0.06]"}
                  `}
                >
                  {/* Icon */}
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${meta.bg} ${meta.color}`}>
                    <span className="material-symbols-outlined text-[18px]">{meta.icon}</span>
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-slate-800 dark:text-slate-200 leading-snug">
                      {n.type === "shipping" ? (
                        <>Đơn hàng <span className="font-bold text-primary">#{n.highlight?.replace("#", "")}</span> đang được giao đến bạn</>
                      ) : n.type === "voucher" ? (
                        <>Voucher mới: <span className="font-bold text-primary">{n.highlight}</span> cho đơn hàng LEGO</>
                      ) : (
                        n.title
                      )}
                    </p>
                    <span className="text-[10px] text-slate-400 mt-1 block">{n.time}</span>
                  </div>

                  {/* Unread dot */}
                  {!n.read && (
                    <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                  )}
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
            Xem tất cả thông báo
          </Link>
        </div>
      )}
    </div>
  );
}
