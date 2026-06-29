"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export interface OrderProduct {
  id: string;
  productId?: number;
  name: string;
  variant: string;
  categoryName?: string;
  quantity: number;
  price: number;
  image: string;
}

interface OrderProductListProps {
  products: OrderProduct[];
}

function formatPrice(p: number) {
  return p.toLocaleString("vi-VN") + " ₫";
}

export default function OrderProductList({
  products,
}: OrderProductListProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const displayedProducts = isExpanded ? products : products.slice(0, 2);
  const hasMore = products.length > 2;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#e2bfb0]/30 overflow-hidden">
      {/* Product rows */}
      <div className="p-6 flex flex-col gap-6">
        {displayedProducts.map((product, i) => {
          const hasLink = Boolean(product.productId && product.productId > 0);
          const classification = product.categoryName || product.variant;
          const classificationText = classification || "N/A";

          const media = (
            <div className="w-24 h-24 rounded-xl border border-slate-100 overflow-hidden flex-shrink-0 relative shadow-sm">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
          );

          return (
            <div
              key={product.id}
              className={`flex flex-col md:flex-row gap-6 ${i > 0 ? "border-t border-[#e2bfb0]/10 pt-6" : ""
                }`}
            >
              {hasLink ? (
                <Link href={`/products/${product.productId}`} className="group flex flex-col md:flex-row gap-6">
                  {media}
                </Link>
              ) : (
                media
              )}
              <div className="flex-grow flex flex-col justify-between">
                <div>
                  {hasLink ? (
                    <Link
                      href={`/products/${product.productId}`}
                      className="font-bold text-base text-[#261812] mb-1 line-clamp-1 hover:text-[#ff6a00] transition-colors"
                    >
                      {product.name}
                    </Link>
                  ) : (
                    <h3 className="font-bold text-base text-[#261812] mb-1 line-clamp-1">
                      {product.name}
                    </h3>
                  )}
                  <p className="text-sm text-[#5a4136] mb-2">
                    Variant: {classificationText}
                  </p>
                  <div className="mt-1">
                    <span className="inline-block px-2.5 py-1 text-xs sm:text-sm font-extrabold text-slate-700 bg-slate-100 border border-slate-200 rounded-md">
                      QTY: {product.quantity}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-end justify-end flex-shrink-0">
                <span className="text-lg font-bold text-[#ff6a00]">
                  {formatPrice(product.price)}
                </span>
              </div>
            </div>
          );
        })}

        {hasMore && (
          <div className="pt-2 border-t border-[#e2bfb0]/10">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center justify-center gap-1.5 mx-auto px-6 py-2 rounded-full border border-orange-100 text-[#ff6a00] font-bold text-sm hover:bg-orange-50 transition-all duration-300 shadow-sm"
            >
              {isExpanded ? (
                <>
                  Show less
                  <span className="material-symbols-outlined text-[18px]">expand_less</span>
                </>
              ) : (
                <>
                  See {products.length - 2} more products
                  <span className="material-symbols-outlined text-[18px]">expand_more</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
