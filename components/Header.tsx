"use client";
import { useState } from "react";

const categories = [
  { label: "Thời trang", sub: "Quần áo & phụ kiện", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDSvXBgjASMQbwm3AKatnkqRNRqY4pXNgJm7qcYzvJS8Sf0hPwpytSO8T8inw055KH3lHzVQYcTHhAqCazvz0e2tZBVfcHE-fmcjvrlnajV0BkY-VyTxzLTZgfqZ3_qTVnnPMNlSTBCtDD3OJdJZcK69QgD6x9C_YMkc2-Hqmr9skQxbdkOy5hv7-w-nZxATBKAOSyBnGiaqdkv7o5isCJvsLFitjgW8He3JmX_PRYmTb2o4FQqEeG8NjwZAQyZkkUcrQO6J9w5Kwo" },
  { label: "Điện tử", sub: "Smartphones & Laptops", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAX4cksixDYIG1ynxHVMo66aqdOGgcztuon4_GSxcFmcwq51bozRc6o5NCQQ4Ot6Gu4eJGi2aPMdvykkDmMzaFHq6CnJ9vncuNFONsTFFP5UA3mEivn7YsnsIHaqUEfkOjB19F7xj2-AphOh6PxID1rD6mOsyT1Jg2ls9n6HTCBAleC-XCfyA7lInFOeM4gBW2t4ccEOcx7LWQVibpZ0EP3mJxx9-gQw4NdetTZjV68EH8S1XORSELcfDPxB0uZue2DJYlvTLJz00Q" },
  { label: "Đồ gia dụng", sub: "Thiết bị nhà bếp", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAX4cksixDYIG1ynxHVMo66aqdOGgcztuon4_GSxcFmcwq51bozRc6o5NCQQ4Ot6Gu4eJGi2aPMdvykkDmMzaFHq6CnJ9vncuNFONsTFFP5UA3mEivn7YsnsIHaqUEfkOjB19F7xj2-AphOh6PxID1rD6mOsyT1Jg2ls9n6HTCBAleC-XCfyA7lInFOeM4gBW2t4ccEOcx7LWQVibpZ0EP3mJxx9-gQw4NdetTZjV68EH8S1XORSELcfDPxB0uZue2DJYlvTLJz00Q" },
  { label: "Làm đẹp", sub: "Mỹ phẩm & Chăm sóc", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDAZXcJsZlfDu3I5P34AlnI8tEBaCIrtLZcKMo0TFCmnv-65kxmcESqKFte7crFmX8aFxdZJohfl0aqKB9GyJB9An9aCyQeT27qpqwNBwxshLd44hMD6Drf7bLrZ5nsYehdWQe-wP7k4tAoE4wh8YmDvQBfAikcgsfT0zaeM5HVlw1FtL9OzNWV_9B6lmGRt2NsH1iTrCQEf99fjaSEpItlDlV2PetiN7h3thTcWrijmxoAHyfLyxlRuVkwldN7atM7wA9-vVSyEoU" },
  { label: "Sách", sub: "Kiến thức & Giải trí", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAX4cksixDYIG1ynxHVMo66aqdOGgcztuon4_GSxcFmcwq51bozRc6o5NCQQ4Ot6Gu4eJGi2aPMdvykkDmMzaFHq6CnJ9vncuNFONsTFFP5UA3mEivn7YsnsIHaqUEfkOjB19F7xj2-AphOh6PxID1rD6mOsyT1Jg2ls9n6HTCBAleC-XCfyA7lInFOeM4gBW2t4ccEOcx7LWQVibpZ0EP3mJxx9-gQw4NdetTZjV68EH8S1XORSELcfDPxB0uZue2DJYlvTLJz00Q" },
];

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
          <div className="flex items-center gap-2 flex-shrink-0">
            <div
              className="p-1.5 rounded-lg text-white"
              style={{ backgroundColor: "#ff6a00" }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 24 }}>
                shopping_bag
              </span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">ShopX</h1>
          </div>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {/* Dropdown */}
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
                          <img
                            src={cat.img}
                            alt={cat.label}
                            className="w-full h-full object-cover"
                          />
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

            <a href="#" className="text-sm font-medium text-slate-600 hover:text-[#ff6a00] transition-colors">Sản phẩm</a>
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
                style={{"--tw-ring-color": "#ff6a00"} as React.CSSProperties}
                placeholder="Tìm kiếm sản phẩm..."
                type="text"
              />
            </div>
          </div>

          {/* Icons */}
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-slate-100 rounded-lg relative text-slate-600">
              <span className="material-symbols-outlined" style={{ fontSize: 24 }}>shopping_cart</span>
              <span
                className="absolute top-1 right-1 w-4 h-4 text-white text-[10px] flex items-center justify-center rounded-full font-bold"
                style={{ backgroundColor: "#ff6a00" }}
              >
                {cartCount}
              </span>
            </button>
            <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-600">
              <span className="material-symbols-outlined" style={{ fontSize: 24 }}>person</span>
            </button>
            <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-slate-200 ml-2">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCtJ-mixdGMtStldx_Tf_KBRh8HwTD870j7d9Nfl0RQjULDooM0U2PvdWvxLrZf9vsT-Ohx0Rk50gZLPeyzAL3wZ9VOnP_DB12BOhDAxCnY6c1_L61jM0Z0A1nZ3EC2cqKYd-gGvAXFVIG0y83jSq44PtVcq9OL_Rm1R5wCErfoiP1xZnLFDDYErQgxLlRTng6NMuNWiuK1ZHVC5VSZbBtEbwlc49AATIlQNkMYnbRvoAw91gDpR0Cz_oB9PKCneoSYgR8jIzf22N4"
                alt="User"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
