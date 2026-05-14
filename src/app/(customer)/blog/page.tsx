import type { Metadata } from "next";
import Link from "next/link";
import BlogContent from "./_components/BlogContent";

export const metadata: Metadata = {
  title: "Blog - ShopX Kids",
  description: "News, guides, and style tips from the ShopX Kids team.",
};

export default function BlogPage() {
  return (
    <div className="bg-[#f5f5f5]">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-10">
        <nav className="flex items-center gap-2 text-sm text-slate-500 font-medium mb-6">
          <Link href="/" className="hover:text-[#ff6a00] transition-colors">
            Home
          </Link>
          <span className="material-symbols-outlined text-slate-300" style={{ fontSize: 16 }}>
            chevron_right
          </span>
          <span className="text-[#ff6a00] font-bold">Blog</span>
        </nav>

        <BlogContent />
      </div>
    </div>
  );
}

