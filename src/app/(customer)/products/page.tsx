"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import FilterSidebar from "./_components/FilterSidebar";
import ProductGrid from "./_components/ProductGrid";
import { productApi } from "@/features/products/services/product-api";
import { ProductFilters, ProductLookups } from "@/features/products/types/product";

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<ProductFilters>({});
  const [lookups, setLookups] = useState<ProductLookups | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [lookupLoading, setLookupLoading] = useState(true);
  const searchTerm = searchParams.get("searchTerm")?.trim() ?? "";

  useEffect(() => {
    setFilters((prev) => {
      const nextTerm = searchTerm || undefined;
      if (prev.searchTerm === nextTerm) {
        return prev;
      }
      return {
        ...prev,
        searchTerm: nextTerm,
      };
    });
  }, [searchTerm]);

  useEffect(() => {
    let active = true;

    const fetchLookups = async () => {
      setLookupLoading(true);
      setLookupError(null);
      try {
        const result = await productApi.getLookups();
        if (!active) return;
        setLookups(result);
      } catch {
        if (!active) return;
        setLookupError("Unable to load product filters.");
      } finally {
        if (active) setLookupLoading(false);
      }
    };

    fetchLookups();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link href="/" className="hover:text-[#ff6a00] transition-colors">
          Home
        </Link>
        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
          chevron_right
        </span>
        <span className="text-slate-900 font-medium">Products</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-8">
        <FilterSidebar
          lookups={lookups}
          filters={filters}
          onChange={setFilters}
          onRefresh={() => setFilters({})}
          isLoading={lookupLoading}
          error={lookupError}
        />
        <ProductGrid filters={filters} />
      </div>
    </div>
  );
}
