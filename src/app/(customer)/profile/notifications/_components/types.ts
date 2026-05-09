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
}

export const NOTIFICATION_TABS: { key: NotificationCategory; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "promotion", label: "Khuyến mãi" },
  { key: "order", label: "Đơn hàng" },
  { key: "system", label: "Hệ thống" },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    category: "order",
    read: false,
    title: "Đơn hàng #SX789012 đang được giao",
    description: "Tài xế đang trên đường giao đơn hàng LEGO Technic Ferrari của bạn. Vui lòng giữ máy.",
    timestamp: "10:30 - 09/05/2024",
    icon: "local_shipping",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    id: "2",
    category: "promotion",
    read: false,
    title: "Voucher 50K sắp hết hạn!",
    description: "Đừng quên sử dụng Voucher Giảm 50K cho đơn hàng từ 500K. Hạn dùng đến hết hôm nay.",
    timestamp: "08:15 - 09/05/2024",
    icon: "sell",
    iconBg: "bg-orange-100",
    iconColor: "text-orange-500",
  },
  {
    id: "3",
    category: "system",
    read: true,
    title: "Xác thực tài khoản thành công",
    description: "Tài khoản của bạn đã được bảo mật 2 lớp. Cảm ơn bạn đã tin dùng ShopX.",
    timestamp: "21:00 - 08/05/2024",
    icon: "security",
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
  },
  {
    id: "4",
    category: "order",
    read: true,
    title: "Giao hàng thành công",
    description: "Đơn hàng #SX789001 đã được giao thành công. Đánh giá ngay để nhận 200 Xu!",
    timestamp: "15:45 - 07/05/2024",
    icon: "check_circle",
    iconBg: "bg-slate-100",
    iconColor: "text-slate-600",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAX4cksixDYIG1ynxHVMo66aqdOGgcztuon4_GSxcFmcwq51bozRc6o5NCQQ4Ot6Gu4eJGi2aPMdvykkDmMzaFHq6CnJ9vncuNFONsTFFP5UA3mEivn7YsnsIHaqUEfkOjB19F7xj2-AphOh6PxID1rD6mOsyT1Jg2ls9n6HTCBAleC-XCfyA7lInFOeM4gBW2t4ccEOcx7LWQVibpZ0EP3mJxx9-gQw4NdetTZjV68EH8S1XORSELcfDPxB0uZue2DJYlvTLJz00Q",
  },
];
