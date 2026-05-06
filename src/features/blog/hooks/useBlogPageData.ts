"use client";

import { useEffect, useMemo, useState } from "react";
import { customerBlogApi } from "../services/blog-api";
import { BlogListItem } from "../types/blog";

const CATEGORY_OPTIONS = [
  { key: "all", label: "All Blog", categoryId: null },
  { key: "news", label: "Tin tức & Khuyến mãi", categoryId: 1 },
  { key: "parenting", label: "Kiến thức nuôi dạy trẻ", categoryId: 2 },
  { key: "review", label: "Review sản phẩm", categoryId: 3 },
] as const;

const PAGE_SIZE = 9;

const getPublishedDateValue = (blog: BlogListItem) => {
  const dateString = blog.updatedAt ?? blog.blogAt ?? blog.createdAt;
  const time = new Date(dateString).getTime();
  return Number.isNaN(time) ? 0 : time;
};

const fetchAllPublishedBlogs = async (searchTerm?: string) => {
  const firstPage = await customerBlogApi.getPublishedBlogs({
    pageNumber: 1,
    pageSize: 100,
    sortBy: "interaction",
    sortDesc: true,
    searchTerm: searchTerm?.trim() || undefined,
  });

  const totalPages = firstPage.totalPages;
  if (totalPages <= 1) {
    return firstPage.items;
  }

  const pageRequests: Promise<{ items: BlogListItem[] }>[] = [];
  for (let currentPage = 2; currentPage <= totalPages; currentPage += 1) {
    pageRequests.push(
      customerBlogApi.getPublishedBlogs({
        pageNumber: currentPage,
        pageSize: 100,
        sortBy: "interaction",
        sortDesc: true,
        searchTerm: searchTerm?.trim() || undefined,
      }),
    );
  }

  const nextPages = await Promise.all(pageRequests);
  const collected = [...firstPage.items];
  for (const pageResponse of nextPages) {
    collected.push(...pageResponse.items);
  }

  return collected;
};

export const useBlogPageData = () => {
  const [allBlogs, setAllBlogs] = useState<BlogListItem[]>([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [submittedKeyword, setSubmittedKeyword] = useState("");
  const [searchedBlogs, setSearchedBlogs] = useState<BlogListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeCategoryKey, setActiveCategoryKey] = useState<(typeof CATEGORY_OPTIONS)[number]["key"]>("all");
  const [pageNumber, setPageNumber] = useState(1);

  useEffect(() => {
    let isCancelled = false;

    const fetchInitialBlogs = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const collected = await fetchAllPublishedBlogs();

        if (!isCancelled) {
          setAllBlogs(collected);
          setSearchedBlogs(collected);
        }
      } catch {
        if (!isCancelled) {
          setError("Unable to load blog data.");
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void fetchInitialBlogs();

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const runSearch = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const collected = submittedKeyword.trim()
          ? await fetchAllPublishedBlogs(submittedKeyword)
          : allBlogs;

        if (!isCancelled) {
          setSearchedBlogs(collected);
        }
      } catch {
        if (!isCancelled) {
          setError("Unable to search blogs.");
          setSearchedBlogs([]);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void runSearch();

    return () => {
      isCancelled = true;
    };
  }, [submittedKeyword, allBlogs]);

  const compareByInteractionAndCreatedAt = (a: BlogListItem, b: BlogListItem) => {
    if (b.totalInteraction !== a.totalInteraction) {
      return b.totalInteraction - a.totalInteraction;
    }
    return getPublishedDateValue(b) - getPublishedDateValue(a);
  };

  const featuredBlog = useMemo(() => {
    return [...allBlogs].sort(compareByInteractionAndCreatedAt)[0] ?? null;
  }, [allBlogs]);

  const featuredBlogs = useMemo(() => {
    const ranked = [...allBlogs].sort(compareByInteractionAndCreatedAt);
    return ranked.slice(1, 5);
  }, [allBlogs]);

  const categoryCounts = useMemo(() => {
    const total = allBlogs.length;
    const byCategory = new Map<number, number>();

    for (const blog of allBlogs) {
      byCategory.set(blog.blogCategoryId, (byCategory.get(blog.blogCategoryId) ?? 0) + 1);
    }

    return CATEGORY_OPTIONS.map((option) => ({
      key: option.key,
      label: option.label,
      count: option.categoryId === null ? total : byCategory.get(option.categoryId) ?? 0,
      categoryId: option.categoryId,
    }));
  }, [allBlogs]);

  const filteredBlogs = useMemo(() => {
    const sourceBlogs = submittedKeyword.trim() ? searchedBlogs : allBlogs;
    const activeCategory = CATEGORY_OPTIONS.find((item) => item.key === activeCategoryKey);
    if (!activeCategory || activeCategory.categoryId === null) {
      return [...sourceBlogs].sort((a, b) => getPublishedDateValue(b) - getPublishedDateValue(a));
    }

    return sourceBlogs
      .filter((item) => item.blogCategoryId === activeCategory.categoryId)
      .sort((a, b) => getPublishedDateValue(b) - getPublishedDateValue(a));
  }, [activeCategoryKey, allBlogs, searchedBlogs, submittedKeyword]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filteredBlogs.length / PAGE_SIZE));
  }, [filteredBlogs.length]);

  const paginatedBlogs = useMemo(() => {
    const startIndex = (pageNumber - 1) * PAGE_SIZE;
    return filteredBlogs.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredBlogs, pageNumber]);

  const handleSelectCategory = (key: (typeof CATEGORY_OPTIONS)[number]["key"]) => {
    setActiveCategoryKey(key);
    setPageNumber(1);
  };

  const handleSearchSubmit = () => {
    setSubmittedKeyword(searchKeyword.trim());
    setPageNumber(1);
  };

  return {
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
  };
};
