import FilterSidebar from "./_components/FilterSidebar";
import ProductGrid from "./_components/ProductGrid";
import Link from "next/link";

export default function ProductsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link href="/" className="hover:text-[#ff6a00] transition-colors">
          Trang chủ
        </Link>
        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
          chevron_right
        </span>
        <span className="text-slate-900 font-medium">Danh sách sản phẩm</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-8">
        <FilterSidebar />
        <ProductGrid />
      </div>
    </div>
  );
}
