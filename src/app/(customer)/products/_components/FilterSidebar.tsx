"use client";
import { useState } from "react";

const sidebarCategories = [
  { label: "Thời trang", icon: "checkroom", active: false },
  { label: "Điện tử", icon: "devices", active: true },
  { label: "Nhà cửa & Đời sống", icon: "home", active: false },
  { label: "Làm đẹp", icon: "content_cut", active: false },
  { label: "Sách", icon: "book", active: false },
];

const brands = ["Samsung", "Apple", "Xiaomi", "Sony"];

export default function FilterSidebar() {
  const [activeCategory, setActiveCategory] = useState("Điện tử");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const toggleRating = (rating: number) => {
    setSelectedRatings((prev) =>
      prev.includes(rating) ? prev.filter((r) => r !== rating) : [...prev, rating]
    );
  };

  return (
    <aside className="w-full lg:w-64 flex-shrink-0 space-y-8">
      {/* Categories */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4">
          Danh mục
        </h3>
        <ul className="space-y-3">
          {sidebarCategories.map((cat) => (
            <li key={cat.label}>
              <button
                onClick={() => setActiveCategory(cat.label)}
                className={`flex items-center gap-3 text-sm w-full text-left transition-colors group ${
                  activeCategory === cat.label
                    ? "text-[#ff6a00] font-medium"
                    : "text-slate-600 hover:text-[#ff6a00]"
                }`}
              >
                <span
                  className="material-symbols-outlined transition-colors"
                  style={{ fontSize: 20 }}
                >
                  {cat.icon}
                </span>
                {cat.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Price Range */}
      <div className="pt-6 border-t border-slate-200">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4">
          Khoảng giá (VNĐ)
        </h3>
        <div className="px-2">
          <div className="h-1 bg-slate-200 rounded-full relative mb-6">
            <div
              className="absolute left-0 right-1/4 h-full rounded-full"
              style={{ backgroundColor: "#ff6a00" }}
            />
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 rounded-full cursor-pointer shadow"
              style={{ borderColor: "#ff6a00" }}
            />
            <div
              className="absolute right-1/4 top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 rounded-full cursor-pointer shadow"
              style={{ borderColor: "#ff6a00" }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>0đ</span>
            <span>10.000.000đ</span>
          </div>
        </div>
      </div>

      {/* Ratings */}
      <div className="pt-6 border-t border-slate-200">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4">
          Đánh giá
        </h3>
        <div className="space-y-2">
          {/* 5 stars */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="rounded border-slate-300 focus:ring-[#ff6a00]"
              style={{ accentColor: "#ff6a00" }}
              checked={selectedRatings.includes(5)}
              onChange={() => toggleRating(5)}
            />
            <div className="flex text-orange-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className="material-symbols-outlined"
                  style={{
                    fontSize: 14,
                    fontVariationSettings: "'FILL' 1",
                  }}
                >
                  star
                </span>
              ))}
            </div>
          </label>
          {/* 4 stars+ */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="rounded border-slate-300 focus:ring-[#ff6a00]"
              style={{ accentColor: "#ff6a00" }}
              checked={selectedRatings.includes(4)}
              onChange={() => toggleRating(4)}
            />
            <div className="flex items-center text-orange-400">
              {Array.from({ length: 4 }).map((_, i) => (
                <span
                  key={i}
                  className="material-symbols-outlined"
                  style={{ fontSize: 14, fontVariationSettings: "'FILL' 1" }}
                >
                  star
                </span>
              ))}
              <span
                className="material-symbols-outlined text-slate-300"
                style={{ fontSize: 14 }}
              >
                star
              </span>
              <span className="ml-1 text-xs text-slate-500">trở lên</span>
            </div>
          </label>
        </div>
      </div>

      {/* Brand */}
      <div className="pt-6 border-t border-slate-200">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4">
          Thương hiệu
        </h3>
        <div className="space-y-2">
          {brands.map((brand) => (
            <label key={brand} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="rounded border-slate-300"
                style={{ accentColor: "#ff6a00" }}
                checked={selectedBrands.includes(brand)}
                onChange={() => toggleBrand(brand)}
              />
              <span className="text-sm text-slate-600">{brand}</span>
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
}
