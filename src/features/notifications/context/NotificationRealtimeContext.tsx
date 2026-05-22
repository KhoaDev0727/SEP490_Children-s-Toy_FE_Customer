"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { HubConnection, HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import toast from "react-hot-toast";
import { notificationApi } from "../services/notification-api";
import { useAuthContext } from "@/context/AuthContext";

interface BellNotificationDto {
  deliveryId: number;
  notificationType: string;
  title: string;
  message: string;
  imageUrl?: string;
  actionType?: string;
  actionTarget?: string;
  unreadCount: number;
}

const isErrorNotification = (notification: BellNotificationDto) => {
  const text = `${notification.title} ${notification.message}`.toLowerCase();
  return text.includes("rejected") || text.includes("blocked") || text.includes("locked");
};

interface NotificationRealtimeContextType {
  unreadCount: number;
  refreshUnread: () => Promise<void>;
  connection: HubConnection | null;
  isConnected: boolean;
}

const NotificationRealtimeContext = createContext<NotificationRealtimeContextType | undefined>(undefined);

export const NotificationRealtimeProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuthContext();
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  const refreshUnread = useCallback(async () => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }
    try {
      const res = await notificationApi.getUnreadCount();
      setUnreadCount(res);
    } catch (error) {
      console.error("Failed to fetch unread count", error);
    }
  }, [isAuthenticated]);

  // Initial fetch
  useEffect(() => {
    if (isAuthenticated) {
      void refreshUnread();
    } else {
      setUnreadCount(0);
    }
  }, [isAuthenticated, refreshUnread]);

  useEffect(() => {
    if (!isAuthenticated) {
      if (connection) {
        connection.stop();
        setConnection(null);
        setIsConnected(false);
      }
      return;
    }

    const token = window.localStorage.getItem("access_token");
    if (!token) return;

    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") || "http://localhost:5216";

    const newConnection = new HubConnectionBuilder()
      .withUrl(`${baseUrl}/hubs/notifications`, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();

    newConnection
      .start()
      .then(() => {
        setIsConnected(true);
        console.log("Connected to Notification Hub");

        newConnection.on("ReceiveNotification", (n: BellNotificationDto) => {
          setUnreadCount(n.unreadCount);
          const showToast = isErrorNotification(n) ? toast.error : toast.success;
          showToast(
            <div>
              <p className="font-semibold">{n.title}</p>
              <p className="text-sm opacity-90">{n.message}</p>
            </div>,
            { duration: 4000, id: `notif-${n.deliveryId}` },
          );
        });
      })
      .catch((e) => {
        console.error("SignalR Connection Error: ", e);
      });

    setConnection(newConnection);

    return () => {
      newConnection.stop();
      setConnection(null);
      setIsConnected(false);
    };
  }, [isAuthenticated]); // Only re-run if auth state changes

  return (
    <NotificationRealtimeContext.Provider value={{ unreadCount, refreshUnread, connection, isConnected }}>
      {children}
    </NotificationRealtimeContext.Provider>
  );
};

export const useNotificationRealtime = () => {
  const context = useContext(NotificationRealtimeContext);
  if (context === undefined) {
    throw new Error("useNotificationRealtime must be used within a NotificationRealtimeProvider");
  }
  return context;
};
