"use client";
import { useAuthContext } from "@/context/AuthContext";
import { authApi } from "@/features/auth/services/auth-api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

const categories = [
  { label: "Thời trang", sub: "Quần áo & phụ kiện", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDSvXBgjASMQbwm3AKatnkqRNRqY4pXNgJm7qcYzvJS8Sf0hPwpytSO8T8inw055KH3lHzVQYcTHhAqCazvz0e2tZBVfcHE-fmcjvrlnajV0BkY-VyTxzLTZgfqZ3_qTVnnPMNlSTBCtDD3OJdJZcK69QgD6x9C_YMkc2-Hqmr9skQxbdkOy5hv7-w-nZxATBKAOSyBnGiaqdkv7o5isCJvsLFitjgW8He3JmX_PRYmTb2o4FQqEeG8NjwZAQyZkkUcrQO6J9w5Kwo" },
  { label: "Điện tử", sub: "Smartphones & Laptops", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAX4cksixDYIG1ynxHVMo66aqdOGgcztuon4_GSxcFmcwq51bozRc6o5NCQQ4Ot6Gu4eJGi2aPMdvykkDmMzaFHq6CnJ9vncuNFONsTFFP5UA3mEivn7YsnsIHaqUEfkOjB19F7xj2-AphOh6PxID1rD6mOsyT1Jg2ls9n6HTCBAleC-XCfyA7lInFOeM4gBW2t4ccEOcx7LWQVibpZ0EP3mJxx9-gQw4NdetTZjV68EH8S1XORSELcfDPxB0uZue2DJYlvTLJz00Q" },
  { label: "Đồ gia dụng", sub: "Thiết bị nhà bếp", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAX4cksixDYIG1ynxHVMo66aqdOGgcztuon4_GSxcFmcwq51bozRc6o5NCQQ4Ot6Gu4eJGi2aPMdvykkDmMzaFHq6CnJ9vncuNFONsTFFP5UA3mEivn7YsnsIHaqUEfkOjB19F7xj2-AphOh6PxID1rD6mOsyT1Jg2ls9n6HTCBAleC-XCfyA7lInFOeM4gBW2t4ccEOcx7LWQVibpZ0EP3mJxx9-gQw4NdetTZjV68EH8S1XORSELcfDPxB0uZue2DJYlvTLJz00Q" },
  { label: "Làm đẹp", sub: "Mỹ phẩm & Chăm sóc", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDAZXcJsZlfDu3I5P34AlnI8tEBaCIrtLZcKMo0TFCmnv-65kxmcESqKFte7crFmX8aFxdZJohfl0aqKB9GyJB9An9aCyQeT27qpqwNBwxshLd44hMD6Drf7bLrZ5nsYehdWQe-wP7k4tAoE4wh8YmDvQBfAikcgsfT0zaeM5HVlw1FtL9OzNWV_9B6lmGRt2NsH1iTrCQEf99fjaSEpItlDlV2PetiN7h3thTcWrijmxoAHyfLyxlRuVkwldN7atM7wA9-vVSyEoU" },
  { label: "Sách", sub: "Kiến thức & Giải trí", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAX4cksixDYIG1ynxHVMo66aqdOGgcztuon4_GSxcFmcwq51bozRc6o5NCQQ4Ot6Gu4eJGi2aPMdvykkDmMzaFHq6CnJ9vncuNFONsTFFP5UA3mEivn7YsnsIHaqUEfkOjB19F7xj2-AphOh6PxID1rD6mOsyT1Jg2ls9n6HTCBAleC-XCfyA7lInFOeM4gBW2t4ccEOcx7LWQVibpZ0EP3mJxx9-gQw4NdetTZjV68EH8S1XORSELcfDPxB0uZue2DJYlvTLJz00Q" },
];

function UserDropdown() {
  const { account, isAuthenticated, clearAuth } = useAuthContext();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore logout API errors — always clear local state
    }
    clearAuth();
    setOpen(false);
    toast.success("Đã đăng xuất.");
    router.push("/");
  };

  if (!isAuthenticated || !account) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className="hidden sm:block px-4 py-2 text-sm font-medium text-slate-700 hover:text-[#ff6a00] transition-colors"
        >
          Đăng nhập
        </Link>
        <Link
          href="/register"
          className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-opacity hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #ff6a00, #ff9a3c)" }}
        >
          Đăng ký
        </Link>
      </div>
    );
  }

  const initials = account.accountName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full hover:bg-slate-100 transition-colors"
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #ff6a00, #ff9a3c)" }}
        >
          {account.imageUrl ? (
            <img
              src={account.imageUrl}
              alt={account.accountName}
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            initials
          )}
        </div>
        <span className="hidden sm:block text-sm font-medium text-slate-700 max-w-[120px] truncate">
          {account.accountName}
        </span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-50">
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="text-sm font-semibold text-slate-800 truncate">{account.accountName}</p>
            <p className="text-xs text-slate-500 truncate mt-0.5">{account.email}</p>
          </div>

          <div className="py-1">
            <button
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors text-left"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Tài khoản của tôi
            </button>
            <button
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors text-left"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              Đơn hàng của tôi
            </button>
          </div>

          <div className="border-t border-slate-100 py-1">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors text-left"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Đăng xuất
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [cartCount] = useState(3);

  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-slate-200"
      style={{
        backgroundColor: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div
              className="p-1.5 rounded-lg text-white"
              style={{ backgroundColor: "#ff6a00" }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 24 }}>
                shopping_bag
              </span>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">ToyStore</span>
          </Link>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <div
              className="relative"
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <button className="text-sm font-medium text-slate-600 hover:text-[#ff6a00] transition-colors flex items-center gap-1 py-4 cursor-pointer">
                Sản phẩm
                <span
                  className="material-symbols-outlined transition-transform duration-200"
                  style={{
                    fontSize: 16,
                    transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                >
                  expand_more
                </span>
              </button>

              {dropdownOpen && (
                <div className="absolute top-full left-0 w-56 bg-white shadow-xl rounded-xl border border-slate-100 py-2 z-50">
                  <div className="grid grid-cols-1 gap-1 p-2">
                    {categories.map((cat) => (
                      <a
                        key={cat.label}
                        href="#"
                        className="flex items-center gap-4 px-4 py-3 text-sm text-slate-700 hover:bg-orange-50 hover:text-[#ff6a00] transition-all rounded-lg"
                      >
                        <div className="w-10 h-10 rounded-md overflow-hidden bg-slate-100 flex-shrink-0">
                          <img src={cat.img} alt={cat.label} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold">{cat.label}</span>
                          <span className="text-[10px] text-slate-400">{cat.sub}</span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <a href="#" className="text-sm font-medium text-slate-600 hover:text-[#ff6a00] transition-colors">Danh mục</a>
            <a href="#" className="text-sm font-medium text-slate-600 hover:text-[#ff6a00] transition-colors">Khuyến mãi</a>
            <a href="#" className="text-sm font-medium text-slate-600 hover:text-[#ff6a00] transition-colors">Tin tức</a>
          </nav>

          {/* Search */}
          <div className="flex-1 max-w-md hidden sm:block">
            <div className="relative">
              <span
                className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                style={{ fontSize: 20 }}
              >
                search
              </span>
              <input
                className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg focus:ring-2 text-sm outline-none transition-all"
                style={{ "--tw-ring-color": "#ff6a00" } as React.CSSProperties}
                placeholder="Tìm kiếm sản phẩm..."
                type="text"
              />
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1">
            <button className="p-2 hover:bg-slate-100 rounded-lg relative text-slate-600">
              <span className="material-symbols-outlined" style={{ fontSize: 24 }}>shopping_cart</span>
              {cartCount > 0 && (
                <span
                  className="absolute top-1 right-1 w-4 h-4 text-white text-[10px] flex items-center justify-center rounded-full font-bold"
                  style={{ backgroundColor: "#ff6a00" }}
                >
                  {cartCount}
                </span>
              )}
            </button>

            <UserDropdown />
          </div>
        </div>
      </div>
    </header>
  );
}
