"use client";

import { useEffect, useState } from "react";
import { customerBlogApi } from "../services/blog-api";
import { BrandListItem } from "../types/blog";

export const useBrandSearch = () => {
  const [keyword, setKeyword] = useState("");
  const [brands, setBrands] = useState<BrandListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setIsLoading(true);

      try {
        const response = await customerBlogApi.searchBrands({
          pageNumber: 1,
          pageSize: 6,
          sortBy: "createdat",
          sortDesc: true,
          searchTerm: keyword.trim() || undefined,
        });
        setBrands(response.items);
      } catch {
        setBrands([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [keyword]);

  return {
    keyword,
    setKeyword,
    brands,
    isLoading,
  };
};
