"use client";

import { useEffect, useMemo, useState } from "react";
import { customerBlogApi } from "../services/blog-api";
import { BlogListItem } from "../types/blog";

const PAGE_SIZE = 6;

export const useBlogList = () => {
  const [items, setItems] = useState<BlogListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageNumber, setPageNumber] = useState(1);

  useEffect(() => {
    let isCancelled = false;

    const fetchBlogs = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await customerBlogApi.getPublishedBlogs({
          pageNumber,
          pageSize: PAGE_SIZE,
          sortBy: "createdat",
          sortDesc: true,
        });

        if (!isCancelled) {
          setItems(response.items);
        }
      } catch {
        if (!isCancelled) {
          setError("Unable to load blog list.");
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchBlogs();

    return () => {
      isCancelled = true;
    };
  }, [pageNumber]);

  const featuredBlog = useMemo(() => {
    return items.find((item) => item.isFeatured) ?? items[0] ?? null;
  }, [items]);

  return {
    items,
    featuredBlog,
    isLoading,
    error,
    pageNumber,
    setPageNumber,
  };
};
