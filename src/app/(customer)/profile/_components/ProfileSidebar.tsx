"use client";
import { useAuthContext } from "@/context/AuthContext";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { label: "Hồ sơ", icon: "person", href: "/profile" },
  { label: "Quản lý Ví", icon: "account_balance_wallet", href: "/profile/wallet" },
  { label: "Quản lý Đơn hàng", icon: "package_2", href: "/profile/orders" },
  { label: "Ngân hàng", icon: "account_balance", href: "/profile/bank" },
  { label: "Địa chỉ", icon: "location_on", href: "/profile/address" },
  { label: "Đổi mật khẩu", icon: "lock", href: "/profile/password" },
  { label: "Thông báo", icon: "notifications", href: "/profile/notifications" },
  { label: "Kho Voucher", icon: "confirmation_number", href: "/profile/vouchers" },
];

export default function ProfileSidebar() {
  const { account } = useAuthContext();
  const pathname = usePathname();

  const avatarUrl = account?.imageUrl;
  const name = account?.accountName ?? "Người dùng";

  const initials = name
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <aside className="hidden md:flex flex-col gap-2">
      {/* User info */}
      <div className="flex items-center gap-3 mb-6 px-4">
        <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-200 flex-shrink-0">
          {avatarUrl ? (
            <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-white text-sm font-bold"
              style={{ background: "linear-gradient(135deg, #ff6a00, #ff9a3c)" }}
            >
              {initials}
            </div>
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">{name}</p>
          <Link
            href="/profile/edit"
            className="text-xs text-slate-500 flex items-center gap-1 hover:text-[#ff6a00] transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 13 }}>
              edit
            </span>
            Sửa hồ sơ
          </Link>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex flex-col">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors"
              style={
                isActive
                  ? { color: "#ff6a00", backgroundColor: "#ffeae1" }
                  : { color: "#5a4136" }
              }
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLAnchorElement).style.color = "#ff6a00";
                  (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#fff1eb";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLAnchorElement).style.color = "#5a4136";
                  (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "transparent";
                }
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 20, color: isActive ? "#ff6a00" : "#565e74" }}
              >
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
