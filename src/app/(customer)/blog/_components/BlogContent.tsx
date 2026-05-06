"use client";

import Link from "next/link";
import Image from "next/image";
import { useBlogPageData } from "@/features/blog/hooks/useBlogPageData";
import BlogGrid from "./BlogGrid";
import FilterSidebar from "./FilterSidebar";

export default function BlogContent() {
  const {
    searchKeyword,
    setSearchKeyword,
    isLoading,
    error,
    featuredBlog,
    featuredBlogs,
    categoryCounts,
    activeCategoryKey,
    paginatedBlogs,
    pageNumber,
    totalPages,
    setPageNumber,
    handleSelectCategory,
    handleSearchSubmit,
  } = useBlogPageData();

  return (
    <>
      <section className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 lg:gap-5 items-start">
        <div className="space-y-10">
          <Link
            href={featuredBlog ? `/blog/${featuredBlog.blogPostId}` : "#"}
            className={`block rounded-2xl overflow-hidden shadow-md relative group ${featuredBlog ? "cursor-pointer" : "cursor-default"}`}
          >
            <div className="w-full h-[320px] md:h-[430px] bg-slate-100">
              <Image
                src={featuredBlog?.blogThumbnail ?? "/assets/images/d.jpg"}
                alt={featuredBlog?.blogTitle ?? "Featured post"}
                fill
                unoptimized
                className="object-contain group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent flex flex-col justify-end p-6 md:p-8">
              <span className="bg-[#ff6a00] text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-max mb-4">
                Featured
              </span>
              <h1 className="text-white text-3xl md:text-5xl font-black tracking-tight leading-[0.95] mb-3 max-w-3xl line-clamp-2">
                {featuredBlog?.blogTitle ?? "No featured blog available"}
              </h1>
              <p className="text-slate-200 text-sm max-w-2xl mb-5 leading-relaxed line-clamp-2">
                {featuredBlog
                  ? `Explore key highlights and practical takeaways from this featured blog update today.`
                  : "Please check back later for featured content."}
              </p>
              <span className="text-[#ff6a00] font-bold text-base hover:underline underline-offset-4 w-max">
                Read Full Story
              </span>
            </div>
          </Link>

          <BlogGrid
            items={paginatedBlogs}
            isLoading={isLoading}
            error={error}
            pageNumber={pageNumber}
            totalPages={totalPages}
            onPageChange={setPageNumber}
          />
        </div>

        <FilterSidebar
          keyword={searchKeyword}
          onKeywordChange={setSearchKeyword}
          onSearchSubmit={handleSearchSubmit}
          categories={categoryCounts}
          activeCategoryKey={activeCategoryKey}
          onSelectCategory={handleSelectCategory}
          featuredBlogs={featuredBlogs}
        />
      </section>
    </>
  );
}
