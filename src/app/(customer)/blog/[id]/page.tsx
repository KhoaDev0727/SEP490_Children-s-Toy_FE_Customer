"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import ArticleHeader from "./_components/ArticleHeader";
import ArticleBody from "./_components/ArticleBody";
import CommentSection from "./_components/CommentSection";
import BlogSidebar from "./_components/BlogSidebar";
import Breadcrumb from "./_components/Breadcrumb";
import ReactionPicker from "./_components/ReactionPicker";
import { useBlogDetailData } from "@/features/blog/hooks/useBlogDetailData";
import { useAuthContext } from "@/context/AuthContext";
import { customerBlogApi } from "@/features/blog/services/blog-api";

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
  const { post, reviews, reloadPost, reloadReviews, featuredBlogs, newBlogs, isLoading, error } = useBlogDetailData(blogPostId);
  const { isAuthenticated } = useAuthContext();
  const [isReacting, setIsReacting] = useState(false);

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

  const handleReactBlog = async (reactionCode: "like" | "love" | "haha") => {
    if (!isAuthenticated) {
      toast.error("Please login before reacting.");
      return;
    }

    if (isReacting) return;
    setIsReacting(true);
    try {
      await customerBlogApi.reactToBlog(blogPostId, reactionCode);
      await reloadPost();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to react.";
      toast.error(message);
    } finally {
      setIsReacting(false);
    }
  };

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
            { label: "Home", href: "/" },
            { label: "Blog", href: "/blog" },
            { label: viewModel.title },
          ]}
        />
      </div>

      <main className="max-w-[1280px] mx-auto px-4 sm:px-8 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <article className="lg:col-span-8 flex flex-col gap-10">
          <h1 className="font-extrabold text-[32px] sm:text-[44px] leading-[1.15] text-[#261812] tracking-tight">
            {viewModel.title}
          </h1>
          <div className="rounded-2xl border border-[#f1ddd2] bg-white p-4 sm:p-5 lg:p-6 shadow-sm">
            <ArticleHeader post={viewModel} showTitle={false} />
            <div className="mt-5">
              <ArticleBody content={viewModel.content} />
            </div>
            <div className="mt-6 flex items-center">
              <ReactionPicker
                currentReaction={post?.currentUserReaction}
                likeCount={post?.likeCount ?? 0}
                loveCount={post?.loveCount ?? 0}
                hahaCount={post?.hahaCount ?? 0}
                disabled={isReacting}
                onSelect={handleReactBlog}
              />
            </div>
          </div>
          <CommentSection blogPostId={blogPostId} comments={reviews} onReload={reloadReviews} />
        </article>

        <aside className="lg:col-span-4">
          <BlogSidebar featuredBlogs={featuredBlogs} newBlogs={newBlogs} />
        </aside>
      </main>
    </div>
  );
}
