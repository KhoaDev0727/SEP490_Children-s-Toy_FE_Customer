"use client";

import Link from "next/link";
import Image from "next/image";
import { BlogListItem } from "@/features/blog/types/blog";

const formatDate = (dateValue: string | null) => {
  if (!dateValue) {
    return "--";
  }

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date);
};

const getShortDescription = (title: string) => {
  const words = title.trim().split(/\s+/).filter(Boolean);
  if (words.length >= 10) {
    return `${words.slice(0, 15).join(" ")}${words.length > 15 ? "..." : ""}`;
  }
  return "Discover practical insights and highlights in this concise blog update for readers.";
};

interface BlogGridProps {
  items: BlogListItem[];
  isLoading: boolean;
  error: string | null;
  pageNumber: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function BlogGrid({
  items,
  isLoading,
  error,
  pageNumber,
  totalPages,
  onPageChange,
}: BlogGridProps) {

  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-[42px] font-bold text-[#101828] leading-none">Latest News</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {isLoading && (
          <div className="col-span-full rounded-xl border border-[#e8ebf0] bg-white p-6 text-sm text-slate-500">
            Loading blog list...
          </div>
        )}

        {!isLoading && error && (
          <div className="col-span-full rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">
            {error}
          </div>
        )}

        {!isLoading && !error && items.length === 0 && (
          <div className="col-span-full rounded-xl border border-[#e8ebf0] bg-white p-6 text-sm text-slate-500">
            No published blogs found.
          </div>
        )}

        {!isLoading &&
          !error &&
          items.map((article) => (
          <Link
            key={article.blogPostId}
            href={`/blog/${article.blogPostId}`}
            className="group cursor-pointer flex flex-col bg-white rounded-2xl overflow-hidden border border-[#e8ebf0]"
          >
            <div className="aspect-[16/10] overflow-hidden relative rounded-b-none bg-slate-100">
              <Image
                src={article.blogThumbnail ?? "/assets/images/d.jpg"}
                alt={article.blogTitle}
                fill
                unoptimized
                className="object-contain group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            <div className="p-4 flex flex-col flex-grow">
              <span className="text-xs text-[#667085] font-medium mb-2">{formatDate(article.createdAt)}</span>
              <h3 className="font-semibold text-[#101828] text-[18px] leading-tight mb-2 group-hover:text-[#ff6a00] transition-colors line-clamp-2">
                {article.blogTitle}
              </h3>
              <p className="text-slate-600 text-[13px] leading-relaxed line-clamp-2 mb-3 flex-grow">
                {getShortDescription(article.blogTitle)}
              </p>
              <div className="mt-auto text-[#ff6a00] font-bold text-sm hover:underline underline-offset-4 inline-flex items-center gap-1">
                  Read More
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                    arrow_forward
                  </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {!isLoading && !error && totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            type="button"
            disabled={pageNumber === 1}
            onClick={() => onPageChange(Math.max(1, pageNumber - 1))}
            className="p-2 rounded-xl bg-orange-50 text-orange-600 font-bold disabled:opacity-30 hover:bg-orange-100 transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
              chevron_left
            </span>
          </button>

          {Array.from({ length: totalPages }).map((_, index) => {
            const page = index + 1;
            return (
              <button
                key={page}
                type="button"
                onClick={() => onPageChange(page)}
                className={`w-9 h-9 rounded-xl text-sm font-bold transition-all duration-200 ${
                  pageNumber === page
                    ? "bg-[#ff6a00] text-white shadow-md shadow-orange-200"
                    : "bg-orange-50 text-orange-700 hover:bg-orange-100"
                }`}
              >
                {page}
              </button>
            );
          })}

          <button
            type="button"
            disabled={pageNumber === totalPages}
            onClick={() => onPageChange(Math.min(totalPages, pageNumber + 1))}
            className="p-2 rounded-xl bg-orange-50 text-orange-600 font-bold disabled:opacity-30 hover:bg-orange-100 transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
              chevron_right
            </span>
          </button>
        </div>
      )}
    </section>
  );
}


