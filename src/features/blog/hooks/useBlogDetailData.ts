"use client";

import { useEffect, useState } from "react";
import { customerBlogApi } from "../services/blog-api";
import { BlogDetail, BlogListItem } from "../types/blog";
import { buildBlogPreview } from "../utils/blog-preview";

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

const toFeaturedCard = (item: BlogListItem) => ({
  id: item.blogPostId,
  title: item.blogTitle,
  date: item.blogAt ?? item.createdAt,
  image: resolveBlogImage(item.blogThumbnail),
  isFeatured: item.isFeatured,
});

const fetchAllPublishedBlogs = async () => {
  const firstPage = await customerBlogApi.getPublishedBlogs({
    pageNumber: 1,
    pageSize: 100,
    sortBy: "updatedat",
    sortDesc: true,
  });

  if (firstPage.totalPages <= 1) {
    return firstPage.items;
  }

  const requests: Promise<{ items: BlogListItem[] }>[] = [];
  for (let page = 2; page <= firstPage.totalPages; page += 1) {
    requests.push(
      customerBlogApi.getPublishedBlogs({
        pageNumber: page,
        pageSize: 100,
        sortBy: "updatedat",
        sortDesc: true,
      }),
    );
  }

  const responses = await Promise.all(requests);
  const items = [...firstPage.items];
  for (const response of responses) {
    items.push(...response.items);
  }

  return items;
};

export const useBlogDetailData = (blogPostId: number) => {
  const [post, setPost] = useState<BlogDetail | null>(null);
  const [blogs, setBlogs] = useState<BlogListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [detail, allPublishedBlogs] = await Promise.all([
          customerBlogApi.getBlogById(blogPostId),
          fetchAllPublishedBlogs(),
        ]);

        if (!isCancelled) {
          setPost(detail);
          setBlogs(allPublishedBlogs);
        }
      } catch {
        if (!isCancelled) {
          setError("Unable to load blog detail.");
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    if (blogPostId > 0) {
      void fetchData();
    }

    return () => {
      isCancelled = true;
    };
  }, [blogPostId]);

  const topFeatured = blogs.filter((item) => item.isFeatured).slice(0, 5);
  const currentInFeatured = topFeatured.some((item) => item.blogPostId === blogPostId);
  const featuredBlogs = currentInFeatured
    ? blogs
        .filter((item) => item.isFeatured && item.blogPostId !== blogPostId)
        .slice(0, 4)
        .map(toFeaturedCard)
    : topFeatured.map(toFeaturedCard);

  const newBlogs = blogs
    .filter((item) => item.blogPostId !== blogPostId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3)
    .map((item) => ({
      id: item.blogPostId,
      title: item.blogTitle,
      date: item.blogAt ?? item.createdAt,
      image: resolveBlogImage(item.blogThumbnail),
      description: buildBlogPreview(item.blogContent, 95),
    }));

  return {
    post,
    featuredBlogs,
    newBlogs,
    isLoading,
    error,
  };
};
