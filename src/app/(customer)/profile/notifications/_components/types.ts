export type NotificationCategory = "all" | "promotion" | "order" | "news" | "system";

export interface Notification {
  id: string;
  category: NotificationCategory;
  notificationType: string;
  read: boolean;
  title: string;
  description: string;
  timestamp: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  image?: string;
  actionType?: string;
  actionTarget?: string;
}

export const NOTIFICATION_TABS: { key: NotificationCategory; label: string }[] = [
  { key: "all", label: "All" },
  { key: "promotion", label: "Promotions" },
  { key: "order", label: "Orders" },
  { key: "news", label: "News & Updates" },
  { key: "system", label: "System" },
];

