export type NotificationCategory = "all" | "promotion" | "order" | "system";

export interface Notification {
  id: string;
  category: NotificationCategory;
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
  { key: "system", label: "System" },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    category: "order",
    read: false,
    title: "Order #SX789012 is being delivered",
    description: "The driver is on the way with your LEGO Technic Ferrari order. Please keep your phone available.",
    timestamp: "10:30 - 09/05/2024",
    icon: "local_shipping",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    id: "2",
    category: "promotion",
    read: false,
    title: "Voucher 50K is expiring soon!",
    description: "Don't forget to use your 50K voucher for orders from 500K. Valid until today.",
    timestamp: "08:15 - 09/05/2024",
    icon: "sell",
    iconBg: "bg-orange-100",
    iconColor: "text-orange-500",
  },
  {
    id: "3",
    category: "system",
    read: true,
    title: "Account verification successful",
    description: "Your account is now secured with two-factor authentication. Thank you for trusting Toy Store.",
    timestamp: "21:00 - 08/05/2024",
    icon: "security",
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
  },
  {
    id: "4",
    category: "order",
    read: true,
    title: "Delivered successfully",
    description: "Order #SX789001 has been delivered successfully. Leave a review now to receive 200 Coins!",
    timestamp: "15:45 - 07/05/2024",
    icon: "check_circle",
    iconBg: "bg-slate-100",
    iconColor: "text-slate-600",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAX4cksixDYIG1ynxHVMo66aqdOGgcztuon4_GSxcFmcwq51bozRc6o5NCQQ4Ot6Gu4eJGi2aPMdvykkDmMzaFHq6CnJ9vncuNFONsTFFP5UA3mEivn7YsnsIHaqUEfkOjB19F7xj2-AphOh6PxID1rD6mOsyT1Jg2ls9n6HTCBAleC-XCfyA7lInFOeM4gBW2t4ccEOcx7LWQVibpZ0EP3mJxx9-gQw4NdetTZjV68EH8S1XORSELcfDPxB0uZue2DJYlvTLJz00Q",
  },
];
