"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useCart } from "@/features/cart/context/CartContext";
import { productApi } from "@/features/products/services/product-api";
import {
  PaginatedResponse,
  ProductFilters,
  ProductList,
} from "@/features/products/types/product";
import { formatCurrency } from "@/features/products/utils/format";

const PAGE_SIZE = 20;

const SORT_OPTIONS = [
  { label: "Pho bien nhat", value: "popular" },
  { label: "Moi nhat", value: "createdAt_desc" },
  { label: "Gia: Thap den Cao", value: "price_asc" },
  { label: "Gia: Cao den Thap", value: "price_desc" },
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

function ProductCard({
  product,
  quantityInCart,
  isAdding,
  onAddToCart,
}: {
  product: ProductList;
  quantityInCart: number;
  isAdding: boolean;
  onAddToCart: (product: ProductList) => void;
}) {
  const inStock = product.quantity > 0 && product.productStatus === "Active";
  const remainingStock = inStock ? Math.max(product.quantity - quantityInCart, 0) : 0;
  const canAddToCart = inStock && remainingStock > 0;
  const statusLabel = !inStock ? "Out of stock" : remainingStock > 0 ? "In stock" : "Max in cart";

  return (
    <div className="group bg-white rounded-xl border border-slate-200 hover:border-[#ff6a00] overflow-hidden flex flex-col transition-shadow hover:shadow-lg">
      <Link
        href={`/products/${product.productId}`}
        className="relative block aspect-square bg-slate-100 overflow-hidden"
      >
        <img
          src={product.mainImageUrl || FALLBACK_IMAGE}
          alt={product.productName}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <span
          className={`absolute top-3 left-3 text-[10px] font-bold px-2 py-1 rounded z-10 ${
            !inStock
              ? "bg-slate-400 text-white"
              : canAddToCart
                ? "bg-emerald-500 text-white"
                : "bg-amber-500 text-white"
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
          {product.discountedPrice != null ? (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg font-bold text-[#ff6a00]">
                  {formatCurrency(product.discountedPrice)}
                </span>
                {product.discountPercent != null &&
                  product.discountPercent > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500 text-white">
                      -{product.discountPercent}%
                    </span>
                  )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400 line-through">
                  {formatCurrency(product.price)}
                </span>
                {product.brandName && (
                  <span className="text-xs text-slate-400">
                    {product.brandName}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-baseline justify-between mb-4">
              <span className="text-lg font-bold text-[#ff6a00]">
                {formatCurrency(product.price)}
              </span>
              {product.brandName && (
                <span className="text-xs text-slate-400">
                  {product.brandName}
                </span>
              )}
            </div>
          )}
          <button
            className="w-full py-2 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 bg-[#ff6a00] hover:bg-[#e05e00] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            type="button"
            disabled={!canAddToCart || isAdding}
            onClick={() => onAddToCart(product)}
          >
            <span className="material-symbols-outlined text-[18px]">
              add_shopping_cart
            </span>
            {isAdding ? "Adding..." : "Add to cart"}
          </button>
          <p className="mt-2 text-[11px] text-slate-500">
            In cart: {quantityInCart} | Can add: {remainingStock}
          </p>
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
        <span className="material-symbols-outlined text-[20px]">
          chevron_left
        </span>
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
        <span className="material-symbols-outlined text-[20px]">
          chevron_right
        </span>
      </button>
    </nav>
  );
}

export default function ProductGrid({ filters }: { filters: ProductFilters }) {
  const { addItem, cart } = useCart();
  const [sort, setSort] = useState(SORT_OPTIONS[0].value);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<PaginatedResponse<ProductList> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingProductId, setAddingProductId] = useState<number | null>(null);

  const filterString = JSON.stringify(filters);
  const [prevFilterString, setPrevFilterString] = useState(filterString);

  if (filterString !== prevFilterString) {
    setPage(1);
    setPrevFilterString(filterString);
  }

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
        setError("Khong the tai danh sach san pham. Vui long thu lai sau.");
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
  const cartQuantityByProductId = useMemo(() => {
    const quantityByProductId = new Map<number, number>();
    for (const item of cart?.items ?? []) {
      quantityByProductId.set(item.productId, item.quantity);
    }
    return quantityByProductId;
  }, [cart?.items]);

  const handleAddToCart = async (product: ProductList) => {
    if (product.quantity <= 0 || product.productStatus !== "Active") {
      toast.error("Product is out of stock.");
      return;
    }

    const quantityInCart = cartQuantityByProductId.get(product.productId) ?? 0;
    const remainingStock = Math.max(product.quantity - quantityInCart, 0);
    if (remainingStock <= 0) {
      toast.error("Cart quantity has reached the maximum available stock.");
      return;
    }

    try {
      setAddingProductId(product.productId);
      await addItem(product.productId, 1);
      toast.success("Item added to cart.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to add item to cart.";
      toast.error(message);
    } finally {
      setAddingProductId(null);
    }
  };

  return (
    <div className="flex-1">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 mb-6">
        <p className="text-slate-600 text-sm">
          Hien thi <span className="font-bold text-slate-900">{totalCount}</span> san pham
        </p>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-500">Sap xep theo:</span>
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
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

      {isLoading && <div className="py-16 text-center text-slate-500">Dang tai san pham...</div>}

      {!isLoading && error && <div className="py-16 text-center text-red-500">{error}</div>}

      {!isLoading && !error && data && data.items.length === 0 && (
        <div className="py-16 text-center text-slate-500">Chua co san pham phu hop.</div>
      )}

      {!isLoading && !error && data && data.items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {data.items.map((product) => (
            <ProductCard
              key={product.productId}
              product={product}
              quantityInCart={cartQuantityByProductId.get(product.productId) ?? 0}
              isAdding={addingProductId === product.productId}
              onAddToCart={handleAddToCart}
            />
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
