"use client";

import React, { useEffect, useState } from "react";
import { reviewApi } from "../services/review-api";
import { UnreviewedProductDto } from "../types/review.types";
import ReviewModal from "./ReviewModal";
import Link from "next/link";
import Image from "next/image";

export default function UnreviewedList() {
  const [products, setProducts] = useState<UnreviewedProductDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedProduct, setSelectedProduct] = useState<{
    productId: number;
    productName: string;
    orderId: number;
    productImage?: string;
  } | null>(null);

  const fetchProducts = async (currentPage: number) => {
    setLoading(true);
    try {
      const res = await reviewApi.getUnreviewedProducts(currentPage, 10);
      setProducts(res.items);
      setTotalPages(res.totalPages);
    } catch (error) {
      console.error("Failed to fetch unreviewed products", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(page);
  }, [page]);

  const handleReviewSuccess = () => {
    fetchProducts(page);
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-20 space-y-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
          <div className="absolute inset-0 rounded-full border-4 border-[#ff4f00] border-t-transparent animate-spin"></div>
        </div>
        <p className="text-sm text-slate-500 animate-pulse font-medium">
          Loading products...
        </p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-24 h-24 mb-6 rounded-full bg-slate-50 flex items-center justify-center">
          <span className="material-symbols-outlined text-5xl text-slate-200">
            star_half
          </span>
        </div>
        <h3 className="text-lg font-semibold text-slate-900">
          Great! You have reviewed all products
        </h3>
        <p className="text-sm text-slate-500 mt-2 max-w-[300px] mx-auto">
          Thank you for sharing your shopping experience at ToyStore.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        {products.map((product) => (
          <div
            key={`${product.orderId}-${product.productId}`}
            className="group bg-white border border-slate-200/80 rounded-xl p-5 flex flex-col md:flex-row gap-5 items-start md:items-center hover:shadow-xl hover:shadow-[#ff4f00]/5 hover:border-[#ff4f00]/30 transition-all duration-300"
          >
            <Link href={`/products/${product.productId}`} className="shrink-0">
              <div className="relative w-24 h-24 bg-slate-50 rounded-xl overflow-hidden border border-slate-100 group-hover:scale-105 transition-transform duration-300">
                {product.productImage ? (
                  <Image
                    src={product.productImage}
                    alt={product.productName}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-300">
                    <span className="material-symbols-outlined text-4xl">
                      image
                    </span>
                  </div>
                )}
              </div>
            </Link>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-bold tracking-wider uppercase">
                  #{product.orderCode}
                </span>
                {product.remainingDays > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${product.remainingDays <= 3
                      ? "bg-red-50 text-red-600"
                      : "bg-emerald-50 text-emerald-600"
                      }`}
                  >
                    <span className="material-symbols-outlined text-[12px]">
                      schedule
                    </span>
                    {product.remainingDays} days left
                  </span>
                )}
              </div>

              <Link href={`/products/${product.productId}`}>
                <h4 className="text-lg font-bold text-slate-900 group-hover:text-[#ff4f00] truncate transition-colors leading-tight mb-1">
                  {product.productName}
                </h4>
              </Link>

              <p className="text-sm text-slate-500 line-clamp-1">
                Take a moment to share your thoughts on this product!
              </p>
            </div>

            <div className="shrink-0 w-full md:w-auto">
              <button
                disabled={product.remainingDays <= 0}
                onClick={() =>
                  setSelectedProduct({
                    productId: product.productId,
                    productName: product.productName,
                    orderId: product.orderId,
                    productImage: product.productImage || undefined,
                  })
                }
                className={`w-full md:w-auto px-4 py-2 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 hover:cursor-pointer ${product.remainingDays > 0
                  ? "bg-[#ff4f00] text-white hover:bg-[#ff4f00]/95 shadow-md shadow-[#ff4f00]/10 active:scale-95"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
                  }`}
              >
                <span className="material-symbols-outlined text-[18px]">
                  edit_note
                </span>
                Write review
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-10">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center disabled:opacity-40 hover:bg-slate-50 hover:border-[#ff4f00]/30 transition-all text-slate-600 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>

          <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-sm font-bold text-[#ff4f00]">{page}</span>
            <span className="text-xs text-slate-400 font-medium">/</span>
            <span className="text-sm font-bold text-slate-600">
              {totalPages}
            </span>
          </div>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center disabled:opacity-40 hover:bg-slate-50 hover:border-[#ff4f00]/30 transition-all text-slate-600 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      )}

      {selectedProduct && (
        <ReviewModal
          isOpen={true}
          onClose={() => setSelectedProduct(null)}
          productId={selectedProduct.productId}
          productName={selectedProduct.productName}
          orderId={selectedProduct.orderId}
          productImage={selectedProduct.productImage}
          onSuccess={handleReviewSuccess}
        />
      )}
    </div>
  );
}
