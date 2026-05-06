"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { productApi } from "@/features/products/services/product-api";
import { PaginatedResponse, ProductFilters, ProductList } from "@/features/products/types/product";
import { formatCurrency } from "@/features/products/utils/format";

const PAGE_SIZE = 20;

const SORT_OPTIONS = [
  { label: "Phổ biến nhất", value: "popular" },
  { label: "Mới nhất", value: "createdAt_desc" },
  { label: "Giá: Thấp đến Cao", value: "price_asc" },
  { label: "Giá: Cao đến Thấp", value: "price_desc" },
];

const FALLBACK_IMAGE = "https://placehold.co/600x600/png?text=Toy";

const getSortConfig = (value: string) => {
  switch (value) {
    case "createdAt_desc":
      return { sortBy: "createdAt", sortDesc: true };
    case "price_asc":
      return { sortBy: "price", sortDesc: false };
    case "price_desc":
      return { sortBy: "price", sortDesc: true };
    default:
      return {};
  }
};

const buildPages = (current: number, total: number) => {
  if (total <= 6) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set<number>();
  pages.add(1);
  pages.add(total);
  for (let i = current - 1; i <= current + 1; i += 1) {
    if (i > 1 && i < total) pages.add(i);
  }
  return Array.from(pages).sort((a, b) => a - b);
};

function ProductCard({ product }: { product: ProductList }) {
  const inStock = product.quantity > 0 && product.productStatus === "Active";
  const statusLabel = inStock ? "Còn hàng" : "Hết hàng";

  return (
    <div className="group bg-white rounded-xl border border-slate-200 hover:border-[#ff6a00] overflow-hidden flex flex-col transition-shadow hover:shadow-lg">
      <Link href={`/products/${product.productId}`} className="relative aspect-square bg-slate-100 overflow-hidden">
        <img
          src={product.mainImageUrl || FALLBACK_IMAGE}
          alt={product.productName}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <span
          className={`absolute top-3 left-3 text-[10px] font-bold px-2 py-1 rounded ${
            inStock ? "bg-emerald-500 text-white" : "bg-slate-400 text-white"
          }`}
        >
          {statusLabel}
        </span>
      </Link>

      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-slate-400 mb-1">{product.categoryName}</p>
        <Link
          href={`/products/${product.productId}`}
          className="text-sm font-medium text-slate-900 mb-2 line-clamp-2 hover:text-[#ff6a00] transition-colors"
        >
          {product.productName}
        </Link>
        <div className="mt-auto pt-3">
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-lg font-bold text-[#ff6a00]">
              {formatCurrency(product.price)}
            </span>
            {product.brandName && (
              <span className="text-xs text-slate-400">{product.brandName}</span>
            )}
          </div>
          <button className="w-full py-2 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 bg-[#ff6a00] hover:bg-[#e05e00] transition-colors">
            <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
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
  const pages = useMemo(() => buildPages(current, total), [current, total]);

  return (
    <nav className="flex items-center gap-2">
      <button
        onClick={() => onChange(Math.max(1, current - 1))}
        className="w-10 h-10 flex items-center justify-center border border-slate-200 rounded-lg hover:bg-[#ff6a00] hover:text-white hover:border-[#ff6a00] transition-colors"
        disabled={current === 1}
      >
        <span className="material-symbols-outlined text-[20px]">chevron_left</span>
      </button>

      {pages.map((p, index) => (
        <div key={p}>
          {index > 0 && p - pages[index - 1] > 1 && (
            <span className="px-2 text-slate-400">...</span>
          )}
          <button
            onClick={() => onChange(p)}
            className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold text-sm transition-colors border ${
              current === p
                ? "bg-[#ff6a00] text-white border-[#ff6a00]"
                : "border-slate-200 text-slate-700 hover:border-[#ff6a00] hover:text-[#ff6a00]"
            }`}
          >
            {p}
          </button>
        </div>
      ))}

      <button
        onClick={() => onChange(Math.min(total, current + 1))}
        className="w-10 h-10 flex items-center justify-center border border-slate-200 rounded-lg hover:bg-[#ff6a00] hover:text-white hover:border-[#ff6a00] transition-colors"
        disabled={current === total}
      >
        <span className="material-symbols-outlined text-[20px]">chevron_right</span>
      </button>
    </nav>
  );
}

export default function ProductGrid({ filters }: { filters: ProductFilters }) {
  const [sort, setSort] = useState(SORT_OPTIONS[0].value);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<PaginatedResponse<ProductList> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPage(1);
  }, [filters, sort]);

  useEffect(() => {
    let active = true;

    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await productApi.getProducts({
          pageNumber: page,
          pageSize: PAGE_SIZE,
          ...getSortConfig(sort),
          ...filters,
        });
        if (!active) return;
        setData(result);
      } catch {
        if (!active) return;
        setError("Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.");
      } finally {
        if (active) setIsLoading(false);
      }
    };

    fetchProducts();
    return () => {
      active = false;
    };
  }, [page, sort, filters]);

  const totalCount = data?.totalCount ?? 0;
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="flex-1">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 mb-6">
        <p className="text-slate-600 text-sm">
          Hiển thị{" "}
          <span className="font-bold text-slate-900">{totalCount}</span> sản phẩm
        </p>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-500">Sắp xếp theo:</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="text-sm border-none bg-slate-100 rounded-lg py-1.5 pl-3 pr-8 outline-none focus:ring-2 focus:ring-[#ff6a00]/20 cursor-pointer"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading && (
        <div className="py-16 text-center text-slate-500">Đang tải sản phẩm...</div>
      )}

      {!isLoading && error && (
        <div className="py-16 text-center text-red-500">{error}</div>
      )}

      {!isLoading && !error && data && data.items.length === 0 && (
        <div className="py-16 text-center text-slate-500">Chưa có sản phẩm phù hợp.</div>
      )}

      {!isLoading && !error && data && data.items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {data.items.map((product) => (
            <ProductCard key={product.productId} product={product} />
          ))}
        </div>
      )}

      {!isLoading && !error && totalPages > 1 && (
        <div className="mt-12 flex justify-center">
          <Pagination current={page} total={totalPages} onChange={setPage} />
        </div>
      )}
    </div>
  );
}
