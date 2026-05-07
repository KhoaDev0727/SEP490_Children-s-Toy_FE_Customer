"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { BlogListItem } from "@/features/blog/types/blog";

interface CategoryItem {
  key: string;
  label: string;
  count: number;
}

interface FilterSidebarProps {
  keyword: string;
  onKeywordChange: (value: string) => void;
  onSearchSubmit: () => void;
  categories: CategoryItem[];
  activeCategoryKey: string;
  onSelectCategory: (key: string) => void;
  featuredBlogs: BlogListItem[];
}

export default function FilterSidebar({
  keyword,
  onKeywordChange,
  onSearchSubmit,
  categories,
  activeCategoryKey,
  onSelectCategory,
  featuredBlogs,
}: FilterSidebarProps) {
  const router = useRouter();
  const [selectedFeaturedId, setSelectedFeaturedId] = useState<number | null>(null);

  const getShortDescription = (title: string) => {
    const words = title.trim().split(/\s+/).filter(Boolean);
    if (words.length >= 5) {
      const sliced = words.slice(0, 7).join(" ");
      return `${sliced}${words.length > 15 ? "..." : ""}`;
    }
    return "Quick highlights from this featured post.";
  };

  return (
    <aside className="bg-[#f5f5f5] rounded-2xl p-5 border border-[#e8dbd3] sticky top-24 self-start h-max">
      <div className="mb-6">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSearchSubmit();
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={keyword}
            onChange={(event) => onKeywordChange(event.target.value)}
            placeholder="Search blog title..."
            className="w-full rounded-xl border border-[#e8dbd3] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#ff6a00]"
          />
          <button
            type="submit"
            className="rounded-xl bg-[#ff6a00] px-3 py-2.5 text-xs font-semibold text-white hover:brightness-95"
          >
            Search
          </button>
        </form>
      </div>

      <div className="mb-8">
        <h3 className="text-[30px] font-semibold text-slate-900 mb-4 tracking-tight">Categories</h3>
        <div className="flex flex-col gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => onSelectCategory(cat.key)}
              className={`flex justify-between items-center py-2.5 px-3 rounded-xl text-left transition-all duration-200 ${
                activeCategoryKey === cat.key
                  ? "bg-[#eed4c7] text-[#ff6a00]"
                  : "hover:bg-[#f0e1d9] text-slate-700"
              }`}
            >
              <span className="font-semibold text-sm">{cat.label}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  activeCategoryKey === cat.key ? "bg-[#f7e7de] text-[#ff6a00]" : "bg-[#f7e7de] text-[#c28f73]"
                }`}
              >
                {cat.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-[#e8dbd3] mb-4" />

      <div className="mb-2">
        <h3 className="text-[27px] font-semibold text-slate-900 mb-4 tracking-tight">Featured Blogs</h3>
        <div className="p-0">
          <div className="flex flex-col gap-2">
          {featuredBlogs.map((blog) => (
            <button
              key={blog.blogPostId}
              onClick={() => {
                setSelectedFeaturedId(blog.blogPostId);
                router.push(`/blog/${blog.blogPostId}`);
              }}
              className={`w-full text-left rounded-xl border border-[#e8dbd3] transition-all duration-200 p-2 ${
                selectedFeaturedId === blog.blogPostId
                  ? "border-[#ff6a00] bg-orange-50 shadow-sm shadow-orange-200"
                  : "hover:bg-[#fff7f3]"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="relative w-24 min-w-24 aspect-[4/3] rounded-lg overflow-hidden bg-transparent flex-shrink-0 flex items-center justify-center">
                <Image
                  src={blog.blogThumbnail ?? "/assets/images/d.jpg"}
                  alt={blog.blogTitle}
                  fill
                  unoptimized
                  className="object-contain p-1"
                />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-900 line-clamp-2">{blog.blogTitle}</p>
                  <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">{getShortDescription(blog.blogTitle)}</p>
                  <p className="text-xs text-slate-500 mt-2">
                    {new Intl.DateTimeFormat("en-GB", {
                      day: "numeric",
                      month: "numeric",
                      year: "numeric",
                    }).format(new Date(blog.blogAt ?? blog.createdAt))}
                  </p>
                </div>
              </div>
            </button>
          ))}
          {featuredBlogs.length === 0 && (
            <p className="text-xs text-slate-500">No featured blogs available.</p>
          )}
          </div>
        </div>
      </div>
    </aside>
  );
}
