"use client";
import { useState } from "react";

const PRODUCTS = [
  {
    id: 1,
    name: "Đồng hồ thông minh SmartWatch Series 8 - Bản giới hạn",
    price: 4_250_000,
    originalPrice: 5_000_000,
    discount: 15,
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAeX8of0gRUO2q6GHXBkfXHRD-Zp5UfnMSPxwGvL7V0YtcM0dJq9j7EI6Ikx9RT42ScPmYaBkv69QXIe8_9HpKTUnlkc3BZ2mQrlDsTkq_y_o8Sn-loHEDh058twUkmJjcY3OX1lLt2cC0wbQvvGDUa4L_-Gqze_Nab3SDlGmHRq1tDHHEYqLfTL6mKhXOSpj__GoqLMXLw8naxrZw5Co_O5xcNCHsRGEncOco484bY6XgvFiA-T3U8lOFFwUntdaFVgqM-KRkuPj4",
  },
  {
    id: 2,
    name: "Tai nghe Bluetooth Wireless Over-ear Bass Pro",
    price: 1_600_000,
    originalPrice: 2_000_000,
    discount: 20,
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAOZPnVplER_Nyjjs_81tnZMXoM_OOZpPJ5ZtfIODtZu8Z-d2sL_xIfnXaw4txh5WkTaVZgKZy49wPN0ITQ7h77_LOV0vzqOMoSYK-rLLlJJi-JZzOo1tKJ6m4XVnBbgYTnpFnhvfUplp_hcDO_nWcGMGguhb1T2gyHt1gSNhaMx5MTNUNQOXuiYb5GrcKjg143IT3z5cflsX9ub1FTBk1iBtNc89Gxwehvhg2fOIX1VghlVTdcUP-3JNgwuvO529JbQ2QttC9AOYo",
  },
  {
    id: 3,
    name: "Giày Thể Thao Sneaker Air Max Elite - Red Edition",
    price: 1_350_000,
    originalPrice: 1_500_000,
    discount: 10,
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCFY0EZFGh_iyP2FphoO9EUZkwSrvHxQSU8h0GmaqU6zUMHkKcIS83Whr8o3MRAMXjUNbyv8oFzZ0SxHJL7PU-nnrfN7FngClqhlZwK7puRA7uHap8qBsJbAEd3iCDQw_rq9nIbQ0O4EiOsMXuIMc1f8AhlQCUWIByMtZtxQSZhG1WOdHOTjESIMf5iLUdKZ3c_sNRDDKadA04eE7SHYoGDZLihrpsLHPn4zZgnNrE9Ly2YOwAGWJwzgK0sdPfx6nWW8SiUk5n86UQ",
  },
  {
    id: 4,
    name: "Loa Bluetooth Mini Speaker Go - Âm thanh 360 độ",
    price: 700_000,
    originalPrice: 1_000_000,
    discount: 30,
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuD-f32Wgj5XWdFn0r0FP8ownRSeCG4NC2px-47TbFfbn4pTVSX7SKTXnWKXO_wfVbtzxL3gQYWjFdP8iuGeUVonL2NlzZ8zXYtEUPRAE65Mc2bJyffLUW8YNOufg925NBVYK8WwmETg8SgnuugWlNnsKtaJHl4TfQ4uMD09544MoUhZszQ6PEtgDAXrWyHxXAwwqgYcBLZC3IY5fn3MTR4IAx4_yUZH7vfEWY2Bp73p4b66Gq4omQ5-LFOY_bg9h9bGY4sAym-AJpA",
  },
  {
    id: 5,
    name: "Chuột Gaming Pro G-Pro Wireless - Siêu nhạy",
    price: 2_850_000,
    originalPrice: 3_000_000,
    discount: 5,
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCc_s0OtCaBK7j_OnhKsK_ljGqiZ6_UAPvO6BzCKlnA22joEpuAfF_EcBBjlDo1qy_3dhYPPFuNhNzO3xH3vR6gyEAAEULR7VqVv0UDAsGgTCcePutVIhqtBUXA59eQesqKH_gAFvuPq3a7sVln3Xc8TgXIWasf-XDpGEnBOsAGNJWqFuoJaorHF9Tdi30oE57VNyNrTNgM2VOMvUkdTbKVxGcOOo2OxJghfW9BPAcsM60ta-g5pJ-LWUPQHIZpKYh8NdQVFowP7WM",
  },
];

const SORT_OPTIONS = [
  "Phổ biến nhất",
  "Mới nhất",
  "Giá: Thấp đến Cao",
  "Giá: Cao đến Thấp",
];

const TOTAL = 124;
const TOTAL_PAGES = 10;

function formatPrice(n: number) {
  return n.toLocaleString("vi-VN") + "đ";
}

function ProductCard({ product }: { product: (typeof PRODUCTS)[0] }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="group bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col transition-all duration-300"
      style={{ boxShadow: hovered ? "0 8px 30px rgba(0,0,0,0.10)" : undefined }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <div className="relative aspect-square bg-slate-100 overflow-hidden">
        <img
          src={product.img}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500"
          style={{ transform: hovered ? "scale(1.1)" : "scale(1)" }}
        />
        {/* Discount badge */}
        <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded">
          -{product.discount}%
        </div>
        {/* Quick view */}
        <button
          className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-slate-700 hover:text-[#ff6a00] transition-all duration-200"
          style={{ opacity: hovered ? 1 : 0 }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
            visibility
          </span>
        </button>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <h4 className="text-sm font-medium text-slate-900 mb-1 line-clamp-2 hover:text-[#ff6a00] transition-colors cursor-pointer">
          {product.name}
        </h4>
        <div className="mt-auto pt-4">
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-lg font-bold" style={{ color: "#ff6a00" }}>
              {formatPrice(product.price)}
            </span>
            <span className="text-xs text-slate-400 line-through">
              {formatPrice(product.originalPrice)}
            </span>
          </div>
          <button
            className="w-full py-2 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors"
            style={{ backgroundColor: "#ff6a00" }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.backgroundColor = "#e05e00")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.backgroundColor = "#ff6a00")
            }
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              add_shopping_cart
            </span>
            Thêm vào giỏ
          </button>
        </div>
      </div>
    </div>
  );
}

function Pagination({
  current,
  total,
  onChange,
}: {
  current: number;
  total: number;
  onChange: (p: number) => void;
}) {
  return (
    <nav className="flex items-center gap-2">
      <button
        onClick={() => onChange(Math.max(1, current - 1))}
        className="w-10 h-10 flex items-center justify-center border border-slate-200 rounded-lg hover:bg-[#ff6a00] hover:text-white hover:border-[#ff6a00] transition-colors"
      >
        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
          chevron_left
        </span>
      </button>

      {[1, 2, 3].map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className="w-10 h-10 flex items-center justify-center rounded-lg font-bold text-sm transition-colors border"
          style={
            current === p
              ? { backgroundColor: "#ff6a00", color: "#fff", borderColor: "#ff6a00" }
              : { borderColor: "#e2e8f0", color: "#334155" }
          }
          onMouseEnter={(e) => {
            if (current !== p) {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#ff6a00";
              (e.currentTarget as HTMLButtonElement).style.color = "#ff6a00";
            }
          }}
          onMouseLeave={(e) => {
            if (current !== p) {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#e2e8f0";
              (e.currentTarget as HTMLButtonElement).style.color = "#334155";
            }
          }}
        >
          {p}
        </button>
      ))}

      <span className="px-2 text-slate-400">...</span>

      <button
        onClick={() => onChange(total)}
        className="w-10 h-10 flex items-center justify-center border border-slate-200 rounded-lg font-bold text-sm hover:border-[#ff6a00] hover:text-[#ff6a00] transition-colors"
      >
        {total}
      </button>

      <button
        onClick={() => onChange(Math.min(total, current + 1))}
        className="w-10 h-10 flex items-center justify-center border border-slate-200 rounded-lg hover:bg-[#ff6a00] hover:text-white hover:border-[#ff6a00] transition-colors"
      >
        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
          chevron_right
        </span>
      </button>
    </nav>
  );
}

export default function ProductGrid() {
  const [sort, setSort] = useState(SORT_OPTIONS[0]);
  const [page, setPage] = useState(1);

  return (
    <div className="flex-1">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 mb-6">
        <p className="text-slate-600 text-sm">
          Hiển thị{" "}
          <span className="font-bold text-slate-900">{TOTAL}</span> sản phẩm
        </p>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-500">Sắp xếp theo:</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="text-sm border-none bg-slate-100 rounded-lg py-1.5 pl-3 pr-8 outline-none focus:ring-2 focus:ring-[#ff6a00]/20 cursor-pointer"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {PRODUCTS.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-12 flex justify-center">
        <Pagination current={page} total={TOTAL_PAGES} onChange={setPage} />
      </div>
    </div>
  );
}
