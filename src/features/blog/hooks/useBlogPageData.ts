"use client";

import { useEffect, useMemo, useState } from "react";
import { customerBlogApi } from "../services/blog-api";
import { BlogCategoryItem, BlogListItem } from "../types/blog";

interface CategoryOption {
  key: string;
  label: string;
  categoryId: number | null;
}

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

const enrichBlogsWithContent = async (blogs: BlogListItem[]) => {
  const missingContentIds = blogs
    .filter((blog) => !blog.blogContent?.trim())
    .map((blog) => blog.blogPostId);

  if (missingContentIds.length === 0) {
    return blogs;
  }

  const detailResponses = await Promise.all(
    missingContentIds.map(async (blogPostId) => {
      try {
        const detail = await customerBlogApi.getBlogById(blogPostId);
        return { blogPostId, blogContent: detail.blogContent };
      } catch {
        return { blogPostId, blogContent: "" };
      }
    }),
  );

  const contentById = new Map<number, string>(
    detailResponses.map((item) => [item.blogPostId, item.blogContent]),
  );

  return blogs.map((blog) => ({
    ...blog,
    blogContent: blog.blogContent ?? contentById.get(blog.blogPostId) ?? "",
  }));
};

export const useBlogPageData = () => {
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([
    { key: "all", label: "All Blog", categoryId: null },
  ]);
  const [allBlogs, setAllBlogs] = useState<BlogListItem[]>([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [submittedKeyword, setSubmittedKeyword] = useState("");
  const [searchedBlogs, setSearchedBlogs] = useState<BlogListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeCategoryKey, setActiveCategoryKey] = useState<string>("all");
  const [pageNumber, setPageNumber] = useState(1);

  useEffect(() => {
    let isCancelled = false;

    const fetchCategories = async () => {
      try {
        const categories: BlogCategoryItem[] = await customerBlogApi.getBlogCategories();
        if (isCancelled) {
          return;
        }

        const nextOptions: CategoryOption[] = [
          { key: "all", label: "All Blog", categoryId: null },
          ...categories.map((category) => ({
            key: `category-${category.blogCategoryId}`,
            label: category.blogCategoryName,
            categoryId: category.blogCategoryId,
          })),
        ];

        setCategoryOptions(nextOptions);
      } catch {
        if (!isCancelled) {
          setCategoryOptions([{ key: "all", label: "All Blog", categoryId: null }]);
        }
      }
    };

    void fetchCategories();
    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const fetchInitialBlogs = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const collected = await fetchAllPublishedBlogs();
        const enriched = await enrichBlogsWithContent(collected);

        if (!isCancelled) {
          setAllBlogs(enriched);
          setSearchedBlogs(enriched);
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
        const collected = submittedKeyword.trim() ? await fetchAllPublishedBlogs(submittedKeyword) : allBlogs;
        const enriched = submittedKeyword.trim() ? await enrichBlogsWithContent(collected) : collected;

        if (!isCancelled) {
          setSearchedBlogs(enriched);
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

  const featuredItems = useMemo(() => {
    return allBlogs
      .filter((blog) => blog.isFeatured)
      .sort(compareByInteractionAndCreatedAt)
      .slice(0, 5);
  }, [allBlogs]);

  const featuredBlog = useMemo(() => {
    return featuredItems[0] ?? null;
  }, [featuredItems]);

  const featuredBlogs = useMemo(() => {
    return featuredItems.slice(1);
  }, [featuredItems]);

  const categoryCounts = useMemo(() => {
    const total = allBlogs.length;
    const byCategory = new Map<number, number>();

    for (const blog of allBlogs) {
      byCategory.set(blog.blogCategoryId, (byCategory.get(blog.blogCategoryId) ?? 0) + 1);
    }

    return categoryOptions.map((option) => ({
      key: option.key,
      label: option.label,
      count: option.categoryId === null ? total : byCategory.get(option.categoryId) ?? 0,
      categoryId: option.categoryId,
    }));
  }, [allBlogs, categoryOptions]);

  const filteredBlogs = useMemo(() => {
    const sourceBlogs = submittedKeyword.trim() ? searchedBlogs : allBlogs;
    const activeCategory = categoryOptions.find((item) => item.key === activeCategoryKey);
    if (!activeCategory || activeCategory.categoryId === null) {
      return [...sourceBlogs].sort((a, b) => getPublishedDateValue(b) - getPublishedDateValue(a));
    }

    return sourceBlogs
      .filter((item) => item.blogCategoryId === activeCategory.categoryId)
      .sort((a, b) => getPublishedDateValue(b) - getPublishedDateValue(a));
  }, [activeCategoryKey, allBlogs, categoryOptions, searchedBlogs, submittedKeyword]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filteredBlogs.length / PAGE_SIZE));
  }, [filteredBlogs.length]);

  const paginatedBlogs = useMemo(() => {
    const startIndex = (pageNumber - 1) * PAGE_SIZE;
    return filteredBlogs.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredBlogs, pageNumber]);

  const handleSelectCategory = (key: string) => {
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
