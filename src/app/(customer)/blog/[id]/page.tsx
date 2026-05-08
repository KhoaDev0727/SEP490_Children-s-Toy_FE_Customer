"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import ArticleHeader from "./_components/ArticleHeader";
import ArticleBody from "./_components/ArticleBody";
import CommentSection from "./_components/CommentSection";
import BlogSidebar from "./_components/BlogSidebar";
import Breadcrumb from "./_components/Breadcrumb";
import { useBlogDetailData } from "@/features/blog/hooks/useBlogDetailData";

const toDisplayDate = (value: string | null) => {
  if (!value) {
    return "--";
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "--";
  }
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsed);
};

const resolveBlogImage = (image: string | null) => {
  const fallbackImage = "/assets/images/d.jpg";
  if (!image) {
    return fallbackImage;
  }

  if (/^https?:\/\//i.test(image) || image.startsWith("data:")) {
    return image;
  }

  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "";
  if (!apiBase) {
    return image;
  }

  const normalizedBase = apiBase.endsWith("/") ? apiBase.slice(0, -1) : apiBase;
  const normalizedPath = image.startsWith("/") ? image : `/${image}`;
  return `${normalizedBase}${normalizedPath}`;
};

export default function BlogDetailPage() {
  const params = useParams<{ id: string }>();
  const blogPostId = Number(params.id);
  const { post, reviews, reloadReviews, featuredBlogs, newBlogs, isLoading, error } = useBlogDetailData(blogPostId);

  const viewModel = useMemo(() => {
    if (!post) {
      return null;
    }

    return {
      date: toDisplayDate(post.blogAt ?? post.createdAt),
      title: post.blogTitle,
      heroImage: resolveBlogImage(post.blogThumbnail),
      isFeatured: post.isFeatured,
      author: {
        name: post.author,
      },
      content: post.blogContent,
    };
  }, [post]);

  if (isLoading) {
    return <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-10 text-sm text-slate-500">Loading blog detail...</div>;
  }

  if (error || !viewModel) {
    return <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-10 text-sm text-red-600">{error ?? "Blog not found."}</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 pt-6 pb-0">
        <Breadcrumb
          items={[
            { label: "Trang chu", href: "/" },
            { label: "Blog", href: "/blog" },
            { label: viewModel.title },
          ]}
        />
      </div>

      <main className="max-w-[1280px] mx-auto px-4 sm:px-8 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <article className="lg:col-span-8 flex flex-col gap-10">
          <ArticleHeader post={viewModel} />
          <ArticleBody content={viewModel.content} />
          <CommentSection blogPostId={blogPostId} comments={reviews} onReload={reloadReviews} />
        </article>

        <aside className="lg:col-span-4">
          <BlogSidebar featuredBlogs={featuredBlogs} newBlogs={newBlogs} />
        </aside>
      </main>
    </div>
  );
}
