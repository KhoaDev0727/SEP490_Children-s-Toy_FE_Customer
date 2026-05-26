"use client";
import Image from "next/image"; // 1. Import Image từ next/image
import { useAuthContext } from "@/context/AuthContext";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { label: "Profile", icon: "person", href: "/profile" },
  {
    label: "My Wallet",
    icon: "account_balance_wallet",
    href: "/profile/wallet",
  },
  { label: "My Orders", icon: "package_2", href: "/profile/orders" },
  { label: "My Reviews", icon: "reviews", href: "/profile/reviews" },
  {
    label: "My Refund",
    icon: "assignment_return",
    href: "/profile/refunds",
  },
  { label: "My Addresses", icon: "location_on", href: "/profile/address" },
  {
    label: "My Little Ones",
    icon: "cake",
    href: "/profile/birthday-management",
  },
  {
    label: "My Vouchers",
    icon: "confirmation_number",
    href: "/profile/vouchers",
  },
  { label: "Change Password", icon: "lock", href: "/profile/password" },
  {
    label: "Notifications",
    icon: "notifications",
    href: "/profile/notifications",
  },
  {
    label: "Notification Settings",
    icon: "settings",
    href: "/profile/setting-notifications",
  },
];

export default function ProfileSidebar() {
  const { account, isHydrated } = useAuthContext();
  const pathname = usePathname();

  const avatarUrl = isHydrated ? account?.imageUrl : undefined;
  const name = isHydrated ? (account?.accountName ?? "User") : "User";

  const initials = name
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <aside
      className="hidden md:flex flex-col gap-2 z-10"
      style={{
        position: "sticky",
        top: "100px",
        height: "max-content",
        alignSelf: "start",
      }}
    >
      {/* User info */}
      <div className="flex items-center gap-3 mb-6 px-4">
        <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-200 shrink-0">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={name}
              width={48}
              height={48}
              className="w-full h-full object-cover"
              unoptimized={true}
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-white text-sm font-bold animate-fade-in"
              style={{
                background: "#ff4f00",
              }}
            >
              {initials}
            </div>
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">{name}</p>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors"
              style={
                isActive
                  ? { color: "#ff4f00", backgroundColor: "#fff5f0" }
                  : { color: "#475569" }
              }
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLAnchorElement).style.color =
                    "#ff4f00";
                  (e.currentTarget as HTMLAnchorElement).style.backgroundColor =
                    "#fff5f0";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLAnchorElement).style.color =
                    "#475569";
                  (e.currentTarget as HTMLAnchorElement).style.backgroundColor =
                    "transparent";
                }
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: 20,
                  color: isActive ? "#ff4f00" : "#64748b",
                }}
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
