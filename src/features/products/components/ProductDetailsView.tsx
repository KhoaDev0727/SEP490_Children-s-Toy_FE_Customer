"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useAuthContext } from "@/context/AuthContext";
import { useCart } from "@/features/cart/context/CartContext";
import { productApi } from "@/features/products/services/product-api";
import { ProductDetail } from "@/features/products/types/product";
import {
  formatCurrency,
  formatMysteryPrice,
  formatDateTime,
} from "@/features/products/utils/format";
import { wishlistApi } from "@/features/wishlist/services/wishlist-api";
import { followApi } from "@/features/products/services/follow-api";
import Image from "next/image";
import { reviewApi } from "@/features/reviews/services/review-api";
import { ReviewProductListDto } from "@/features/reviews/types/review.types";
import RecommendationWidget from "@/components/recommendation/RecommendationWidget";
import { WIDGET_CODES } from "@/features/recommendation/types/recommendation";
import { useProductDetailViewTracking, useTracking } from "@/hooks/useTracking";

const FALLBACK_IMAGE = "https://placehold.co/900x900/png?text=Toy";

const buildImageList = (product: ProductDetail | null) => {
  if (!product) return [];
  const images = [product.mainImageUrl, ...product.additionalImageUrls].filter(
    Boolean,
  ) as string[];
  return Array.from(new Set(images));
};

const renderRatingStars = (rating: number) => {
  const safeRating = Math.max(0, Math.min(5, rating));
  const fullStars = Math.floor(safeRating);
  const hasHalfStar = safeRating - fullStars >= 0.5;

  return Array.from({ length: 5 }).map((_, index) => {
    if (index < fullStars) {
      return (
        <span
          key={index}
          className="material-symbols-outlined text-lg"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          star
        </span>
      );
    }

    if (index === fullStars && hasHalfStar) {
      return (
        <span key={index} className="material-symbols-outlined text-lg">
          star_half
        </span>
      );
    }

    return (
      <span key={index} className="material-symbols-outlined text-lg">
        star
      </span>
    );
  });
};

const sanitizeRichTextHtml = (html: string | null | undefined) => {
  if (!html || !html.trim()) {
    return "";
  }

  const decodeHtmlEntities = (value: string) => {
    const textarea = document.createElement("textarea");
    textarea.innerHTML = value;
    return textarea.value;
  };

  const normalizedInput =
    html.includes("&lt;") && html.includes("&gt;")
      ? decodeHtmlEntities(html)
      : html;

  const parser = new DOMParser();
  const doc = parser.parseFromString(normalizedInput, "text/html");

  doc
    .querySelectorAll("script, style, iframe, object, embed")
    .forEach((node) => node.remove());

  doc.querySelectorAll("*").forEach((el) => {
    for (const attr of Array.from(el.attributes)) {
      if (attr.name.toLowerCase().startsWith("on")) {
        el.removeAttribute(attr.name);
      }
    }

    const style = (el.getAttribute("style") ?? "").toLowerCase();
    const className = (el.getAttribute("class") ?? "").toLowerCase();

    const hasOverlayClass = /(overlay|backdrop|modal)/.test(className);
    const hasFixedOrAbsolute = /position\s*:\s*(fixed|absolute)/.test(style);
    const hasViewportCover =
      /(inset\s*:\s*0|top\s*:\s*0|left\s*:\s*0)/.test(style) &&
      /(width\s*:\s*100(vw|%)|height\s*:\s*100(vh|%))/.test(style);
    const hasDarkBackground =
      /(background(-color)?\s*:\s*(#000|black|rgba\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\.[0-9]+\)))/.test(
        style,
      );

    if (
      hasOverlayClass ||
      (hasFixedOrAbsolute && (hasViewportCover || hasDarkBackground))
    ) {
      el.remove();
      return;
    }

    if (style) {
      const cleaned = style
        .replace(/position\s*:[^;]+;?/g, "")
        .replace(/z-index\s*:[^;]+;?/g, "")
        .replace(/inset\s*:[^;]+;?/g, "")
        .replace(/top\s*:[^;]+;?/g, "")
        .replace(/left\s*:[^;]+;?/g, "")
        .replace(/right\s*:[^;]+;?/g, "")
        .replace(/bottom\s*:[^;]+;?/g, "");

      if (cleaned.trim()) {
        el.setAttribute("style", cleaned);
      } else {
        el.removeAttribute("style");
      }
    }
  });

  return doc.body.innerHTML;
};

export default function ProductDetailsView({
  productId,
}: {
  productId: number;
}) {
  const { addItem, cart } = useCart();
  const { isAuthenticated, isHydrated } = useAuthContext();
  const { trackAddToCart, trackAddToWishlist } = useTracking();
  // Tự gửi event product_view + product_view_long (>30s) khi user xem trang
  useProductDetailViewTracking(productId);
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wishlistProductIds, setWishlistProductIds] = useState<Set<number>>(
    new Set(),
  );
  const [isFollowed, setIsFollowed] = useState(false);
  const [isFollowUpdating, setIsFollowUpdating] = useState(false);
  const [isWishlistUpdating, setIsWishlistUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "description" | "specs" | "reviews"
  >("description");

  // State for reviews
  const [reviews, setReviews] = useState<ReviewProductListDto[]>([]);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewsTotalPages, setReviewsTotalPages] = useState(1);
  const [reviewsFilter, setReviewsFilter] = useState<{
    rating?: number;
    hasImage?: boolean;
  }>({});
  const [isReviewsLoading, setIsReviewsLoading] = useState(false);

  useEffect(() => {
    let active = true;

    const fetchProduct = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await productApi.getProductById(productId);
        if (!active) return;
        setProduct(result);
        const images = buildImageList(result);
        setActiveImage(images[0] ?? result.mainImageUrl ?? FALLBACK_IMAGE);
      } catch {
        if (!active) return;
        setError("Unable to load product details. Please try again later.");
      } finally {
        if (active) setIsLoading(false);
      }
    };

    fetchProduct();
    return () => {
      active = false;
    };
  }, [productId]);

  useEffect(() => {
    let active = true;

    const fetchWishlist = async () => {
      if (!isHydrated) {
        return;
      }

      if (!isAuthenticated) {
        if (active) {
          setWishlistProductIds(new Set());
        }
        return;
      }

      try {
        const items = await wishlistApi.getMyWishlist();
        if (!active) {
          return;
        }
        setWishlistProductIds(new Set(items.map((item) => item.productId)));
      } catch {
        if (active) {
          setWishlistProductIds(new Set());
        }
      }
    };

    void fetchWishlist();
    return () => {
      active = false;
    };
  }, [isAuthenticated, isHydrated]);

  useEffect(() => {
    let active = true;

    const checkFollow = async () => {
      if (!isHydrated || !isAuthenticated || !product) return;
      try {
        const followed = await followApi.isFollowing(product.productId);
        if (active) setIsFollowed(followed);
      } catch {
        // Ignore
      }
    };

    void checkFollow();
    return () => {
      active = false;
    };
  }, [isAuthenticated, isHydrated, product?.productId]);

  useEffect(() => {
    let active = true;
    const fetchReviews = async () => {
      if (activeTab !== "reviews") return;
      setIsReviewsLoading(true);
      try {
        const res = await reviewApi.getPublicReviews({
          productId,
          pageNumber: reviewsPage,
          pageSize: 10,
          rating: reviewsFilter.rating,
          hasImage: reviewsFilter.hasImage,
        });
        if (!active) return;
        setReviews(res.items);
        setReviewsTotalPages(res.totalPages);
      } catch {
        if (!active) return;
        setReviews([]);
      } finally {
        if (active) setIsReviewsLoading(false);
      }
    };
    fetchReviews();
    return () => {
      active = false;
    };
  }, [productId, activeTab, reviewsPage, reviewsFilter]);

  const images = useMemo(() => buildImageList(product), [product]);
  const safeDescriptionHtml = useMemo(
    () => sanitizeRichTextHtml(product?.description),
    [product?.description],
  );

  const specs = useMemo(() => {
    if (!product) return [];
    const priceRange =
      product.priceRangeMin != null && product.priceRangeMax != null
        ? `${formatCurrency(product.priceRangeMin)} - ${formatCurrency(product.priceRangeMax)}`
        : "Updating";

    return [
      { label: "Category", value: product.categoryName },
      { label: "Brand", value: product.brandName ?? "Updating" },
      { label: "Price range", value: priceRange },
      { label: "Material", value: product.materialName ?? "Updating" },
      { label: "Age range", value: product.ageRange ?? "Updating" },
      { label: "Gender", value: product.sexName ?? "Updating" },
      { label: "Origin", value: product.originName ?? "Updating" },
      { label: "Remaining stock", value: product.productStatus === "ComingSoon" ? "Updating" : product.quantity.toString() },
    ];
  }, [product]);

  const quantityInCart = useMemo(() => {
    if (!product) return 0;
    return (
      cart?.items.find((item) => item.productId === product.productId)
        ?.quantity ?? 0
    );
  }, [cart?.items, product]);

  const remainingStock = useMemo(() => {
    if (!product) return 0;
    const inStock = product.quantity > 0 && product.productStatus === "Active";
    if (!inStock) return 0;
    return Math.max(product.quantity - quantityInCart, 0);
  }, [product, quantityInCart]);

  const isFavorite = useMemo(() => {
    if (!product) return false;
    return wishlistProductIds.has(product.productId);
  }, [product, wishlistProductIds]);

  if (isLoading) {
    return (
      <div className="py-16 text-center text-slate-500">Loading product...</div>
    );
  }

  if (error || !product) {
    return (
      <div className="py-16 text-center text-red-500">
        {error ?? "Product not found."}
      </div>
    );
  }

  const safeImage = activeImage ?? product.mainImageUrl ?? FALLBACK_IMAGE;
  const inStock = product.quantity > 0 && product.productStatus === "Active";
  const canAddToCart = inStock && remainingStock > 0;
  const maxSelectableQuantity = Math.max(remainingStock, 1);
  const selectedQuantity = Math.min(
    Math.max(quantity, 1),
    maxSelectableQuantity,
  );
  const averageRating = Number(product.averageRating ?? 0);
  const reviewCount = product.reviewCount ?? 0;
  const soldQuantity = product.soldQuantity ?? 0;

  const handleAddToCart = async () => {
    if (!inStock) {
      toast.error("Product is out of stock.");
      return;
    }

    if (remainingStock <= 0) {
      toast.error("Cart quantity has reached the maximum available stock.");
      return;
    }

    if (selectedQuantity > remainingStock) {
      toast.error(`You can only add up to ${remainingStock} more item(s).`);
      return;
    }

    try {
      setIsAddingToCart(true);
      await addItem(product.productId, selectedQuantity);
      // Tracking add_to_cart cho hệ recommendation
      trackAddToCart(product.productId, { quantity: selectedQuantity });
      toast.success("Added to cart successfully.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to add item to cart.";
      toast.error(message);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!product) {
      return;
    }

    if (!isAuthenticated) {
      toast.error("Please login to manage wishlist.");
      return;
    }

    try {
      setIsWishlistUpdating(true);
      if (isFavorite) {
        await wishlistApi.removeItem(product.productId);
        setWishlistProductIds((previous) => {
          const next = new Set(previous);
          next.delete(product.productId);
          return next;
        });
        toast.success("Removed from wishlist.");
      } else {
        await wishlistApi.addItem(product.productId);
        // Tracking add_to_wishlist
        trackAddToWishlist(product.productId);
        setWishlistProductIds((previous) => {
          const next = new Set(previous);
          next.add(product.productId);
          return next;
        });
        toast.success("Added to wishlist.");
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to update wishlist.";
      toast.error(message);
    } finally {
      setIsWishlistUpdating(false);
    }
  };

  const handleToggleFollow = async () => {
    if (!product) return;
    if (!isAuthenticated) {
      toast.error("Please log in to follow products.");
      return;
    }

    try {
      setIsFollowUpdating(true);
      if (isFollowed) {
        await followApi.unfollowProduct(product.productId);
        setIsFollowed(false);
        toast.success("Unfollowed product.");
      } else {
        await followApi.followProduct(product.productId);
        setIsFollowed(true);
        toast.success("You will be notified when the product launches!");
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to complete the action.";
      toast.error(message);
    } finally {
      setIsFollowUpdating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
      <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8 overflow-x-auto whitespace-nowrap pb-2">
        <Link href="/" className="hover:text-[#ff6a00]">
          Home
        </Link>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <Link href="/products" className="hover:text-[#ff6a00]">
          Products
        </Link>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <span className="text-slate-900 font-medium">
          {product.productName}
        </span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        <div className="space-y-4">
          <div className="aspect-square w-full rounded-2xl bg-white border border-slate-100 overflow-hidden shadow-sm relative">
            <Image
              className="object-contain p-8"
              src={safeImage}
              alt={product.productName}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 20vw"
            />
          </div>
          {images.length > 0 && (
            <div className="grid grid-cols-4 gap-4">
              {images.slice(0, 7).map((img) => (
                <button
                  key={img}
                  onClick={() => setActiveImage(img)}
                  className={`aspect-square rounded-lg border-2 overflow-hidden bg-white shadow-sm relative ${img === safeImage
                    ? "border-[#ff6a00]"
                    : "border-slate-200 hover:border-[#ff6a00]"
                    }`}
                >
                  <Image
                    className="object-cover"
                    src={img}
                    alt={product.productName}
                    fill
                    sizes="(max-width: 768px) 25vw, 12vw"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <div className="mb-2 flex gap-2">
            <span
              className={`inline-block px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${product.productStatus === "ComingSoon"
                ? "bg-blue-100 text-blue-700"
                : inStock
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-slate-200 text-slate-600"
                }`}
            >
              {product.productStatus === "ComingSoon"
                ? "Coming soon"
                : inStock
                  ? "Ready to ship"
                  : "Out of stock"}
            </span>
          </div>
          <div className="mb-4 flex items-start justify-between gap-4">
            <h1 className="text-3xl font-black leading-tight">
              {product.productName}
            </h1>
            <button
              type="button"
              onClick={handleToggleWishlist}
              disabled={isWishlistUpdating}
              className="h-11 w-11 rounded-full border border-slate-200 bg-white shadow-sm flex items-center justify-center transition-colors hover:border-red-200 disabled:opacity-60 disabled:cursor-not-allowed"
              aria-label={
                isFavorite ? "Remove from wishlist" : "Add to wishlist"
              }
            >
              <span
                className={`material-symbols-outlined text-[22px] ${isFavorite ? "text-red-500" : "text-slate-500"}`}
                style={{
                  fontVariationSettings: isFavorite ? "'FILL' 1" : "'FILL' 0",
                }}
              >
                favorite
              </span>
            </button>
          </div>
          <div className="flex items-center gap-4 mb-6 text-sm flex-wrap">
            <div className="flex items-center text-[#ff6a00]">
              {renderRatingStars(averageRating)}
              <span className="ml-1 text-sm font-bold">
                {averageRating.toFixed(1)}
              </span>
            </div>
            <span className="text-slate-400">|</span>
            <span className="text-sm font-medium">{reviewCount} reviews</span>
            <span className="text-slate-400">|</span>
            <span className="text-sm font-medium">{soldQuantity} sold</span>
          </div>
          <div className="flex items-center gap-3 mb-6 text-sm text-slate-500">
            <span>Category:</span>
            <span className="font-semibold text-slate-900">
              {product.categoryName}
            </span>
            {product.brandName && (
              <>
                <span className="text-slate-400">|</span>
                <span>Brand:</span>
                <span className="font-semibold text-slate-900">
                  {product.brandName}
                </span>
              </>
            )}
          </div>

          <div className="p-6 bg-slate-50 rounded-2xl mb-8 relative overflow-hidden">
            {product.promotionType === "FLASH_SALE" && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#ff6a00] text-white rounded-lg mb-4 shadow-sm animate-pulse">
                <span className="material-symbols-outlined text-sm">bolt</span>
                <span className="text-xs font-black uppercase tracking-wider">
                  Flash Sale Live Now
                </span>
              </div>
            )}
            {product.productStatus === "ComingSoon" ? (
              <div className="flex items-baseline gap-4 mb-2">
                <span className="text-4xl font-black text-[#ff6a00]">
                  {formatMysteryPrice(product.price)}
                </span>
                <span className="text-sm text-slate-400">
                  Price to be announced
                </span>
              </div>
            ) : product.discountedPrice != null ? (
              <div className="mb-2">
                <div className="flex items-center gap-4 mb-1">
                  <span className="text-4xl font-black text-[#ff6a00]">
                    {formatCurrency(product.discountedPrice)}
                  </span>
                  {product.discountPercent != null &&
                    product.discountPercent > 0 && (
                      <span className="bg-red-500 text-white text-sm font-bold px-2 py-1 rounded-md shadow-sm">
                        -{product.discountPercent}%
                      </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg text-slate-400 line-through">
                    {formatCurrency(product.price)}
                  </span>
                  <span className="text-xs text-slate-400">
                    (Original price)
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-baseline gap-4 mb-2">
                <span className="text-4xl font-black text-[#ff6a00]">
                  {formatCurrency(product.price)}
                </span>
                <span className="text-sm text-slate-400">
                  Suggested retail price
                </span>
              </div>
            )}

            {product.promotionType === "FLASH_SALE" &&
              product.promotionSaleQuantity != null && (
                <div className="mb-8">
                  <div className="relative w-full h-7 bg-[#ffeddb] rounded-full overflow-hidden flex items-center shadow-inner border border-[#ff6a00]/10">
                    {/* Progress Fill */}
                    <div
                      className="absolute inset-y-0 left-0 bg-linear-to-r from-[#ff6a00] to-[#ff9d00] rounded-full transition-all duration-1000 ease-out z-0"
                      style={{
                        width: `${Math.max(Math.min(((product.promotionSoldQuantity || 0) / product.promotionSaleQuantity) * 100, 100), 0)}%`,
                      }}
                    />

                    {/* Text & Icon Overlay */}
                    <div className="absolute inset-0 flex items-center px-4 gap-1.5 z-10">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-yellow-300"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-1.245-1.134-1.792-.153-.547-.173-1.096-.145-1.566.028-.47.16-.92.35-1.31.189-.39.43-.76.71-1.127a1 1 0 00-.336-1.302z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-[10px] sm:text-[11px] font-black text-white uppercase tracking-wide drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
                        Sold {product.promotionSoldQuantity || 0}/
                        {product.promotionSaleQuantity}
                      </span>
                    </div>
                  </div>
                </div>
              )}

            <div className="flex items-center gap-2 text-sm font-medium text-emerald-600">
              <span className="material-symbols-outlined text-base">
                confirmation_number
              </span>
              <span>Use code TOY200 to save 200k on orders from 999k</span>
            </div>
          </div>

          {product.productStatus !== "ComingSoon" && (
            <div className="space-y-6 mb-8">
              <div>
                <p className="text-sm font-bold mb-3 uppercase tracking-tight">
                  Quantity:
                </p>
                <div className="flex items-center border border-slate-200 w-fit rounded-lg overflow-hidden">
                  <button
                    className="px-3 py-2 hover:bg-slate-100 transition-colors"
                    onClick={() => setQuantity(Math.max(1, selectedQuantity - 1))}
                  >
                    <span className="material-symbols-outlined text-base">
                      remove
                    </span>
                  </button>
                  <input
                    className="w-14 text-center border-x border-slate-200 py-2 bg-transparent focus:ring-0 outline-none"
                    type="text"
                    value={selectedQuantity}
                    readOnly
                  />
                  <button
                    className="px-3 py-2 hover:bg-slate-100 transition-colors"
                    onClick={() =>
                      setQuantity(
                        Math.min(maxSelectableQuantity, selectedQuantity + 1),
                      )
                    }
                    disabled={
                      !canAddToCart || selectedQuantity >= maxSelectableQuantity
                    }
                  >
                    <span className="material-symbols-outlined text-base">
                      add
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            {product.productStatus === "ComingSoon" || !inStock ? (
              <button
                className={`flex-1 px-8 py-4 font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60 ${isFollowed
                  ? "bg-slate-100 text-slate-600 border-2 border-slate-200 hover:bg-slate-200"
                  : "bg-[#ff6a00] text-white hover:bg-[#e05e00] shadow-lg shadow-orange-200"
                  }`}
                type="button"
                onClick={handleToggleFollow}
                disabled={isFollowUpdating}
              >
                <span className="material-symbols-outlined">
                  {isFollowed ? "notifications_active" : "notifications"}
                </span>
                {isFollowUpdating
                  ? "Processing..."
                  : isFollowed
                    ? "Following"
                    : product.productStatus === "ComingSoon"
                      ? "Follow product"
                      : "Notify when in stock"}
              </button>
            ) : (
              <>
                <button
                  className="flex-1 px-8 py-4 border-2 border-[#ff6a00] text-[#ff6a00] font-bold rounded-xl hover:bg-orange-50 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!canAddToCart || isAddingToCart}
                >
                  <span className="material-symbols-outlined">
                    add_shopping_cart
                  </span>
                  {isAddingToCart
                    ? "Adding..."
                    : !canAddToCart
                      ? "Max stock reached in cart"
                      : "Add to cart"}
                </button>
                <button className="flex-1 px-8 py-4 bg-[#ff6a00] text-white font-bold rounded-xl hover:bg-[#e05e00] shadow-lg shadow-orange-200 transition-all flex items-center justify-center gap-2">
                  Buy now
                </button>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-100 pt-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-[#ff6a00]">
                <span className="material-symbols-outlined">
                  local_shipping
                </span>
              </div>
              <span className="text-xs font-semibold">
                Free shipping on orders from 499k
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-[#ff6a00]">
                <span className="material-symbols-outlined">cached</span>
              </div>
              <span className="text-xs font-semibold">
                Free returns within 7 days
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-[#ff6a00]">
                <span className="material-symbols-outlined">verified_user</span>
              </div>
              <span className="text-xs font-semibold">
                Official 12-month warranty
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-16 flow-root">
        <div className="border-b border-slate-200 flex items-center gap-8 mb-8 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("description")}
            className={`pb-4 border-b-2 font-bold whitespace-nowrap ${activeTab === "description"
              ? "border-[#ff6a00] text-[#ff6a00]"
              : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
          >
            Product description
          </button>
          <button
            onClick={() => setActiveTab("specs")}
            className={`pb-4 border-b-2 font-semibold whitespace-nowrap ${activeTab === "specs"
              ? "border-[#ff6a00] text-[#ff6a00]"
              : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
          >
            Specifications
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`pb-4 border-b-2 font-semibold whitespace-nowrap ${activeTab === "reviews"
              ? "border-[#ff6a00] text-[#ff6a00]"
              : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
          >
            Customer reviews
          </button>
        </div>

        {activeTab === "description" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="relative z-0 lg:col-span-3 prose max-w-none text-slate-600 leading-relaxed flow-root">
              {safeDescriptionHtml ? (
                <div
                  className="ql-editor p-0 overflow-hidden wrap-break-word"
                  dangerouslySetInnerHTML={{ __html: safeDescriptionHtml }}
                />
              ) : (
                <p className="mb-4">
                  This product description is being updated. Check back soon for
                  more details on materials, features, and benefits.
                </p>
              )}
              <div className="clear-both" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                <div className="rounded-xl border border-slate-100 p-4">
                  <p className="text-sm font-semibold text-slate-900">
                    Release date
                  </p>
                  <p className="text-sm text-slate-500">
                    {formatDateTime(product.launchDate)}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 p-4">
                  <p className="text-sm font-semibold text-slate-900">
                    Last updated
                  </p>
                  <p className="text-sm text-slate-500">
                    {formatDateTime(product.updatedAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "specs" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="bg-slate-50 rounded-2xl p-6 h-fit lg:col-span-3">
              <h3 className="text-lg font-bold mb-4">Key specs</h3>
              <div className="space-y-4">
                {specs.map((item) => (
                  <div
                    key={item.label}
                    className="flex justify-between border-b border-slate-200 pb-2 text-sm"
                  >
                    <span className="text-slate-500">{item.label}</span>
                    <span className="font-semibold text-slate-900 text-right">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "reviews" && (
          <section>
            <h2 className="text-2xl font-black mb-8">Product reviews</h2>
            <div className="bg-white border border-slate-200 rounded-2xl p-6 lg:p-8">
              <div className="flex flex-col md:flex-row gap-8 mb-8 border-b border-slate-100 pb-8">
                <div className="flex flex-col items-center justify-center md:w-1/4">
                  <div className="text-5xl font-black text-[#ff6a00] mb-2">
                    {averageRating.toFixed(1)}
                  </div>
                  <div className="flex items-center text-[#ff6a00] mb-2">
                    {renderRatingStars(averageRating)}
                  </div>
                  <div className="text-sm text-slate-500">
                    {reviewCount} reviews
                  </div>
                </div>
                <div className="md:w-3/4 flex flex-wrap gap-3 items-center">
                  <button
                    onClick={() => {
                      setReviewsFilter({});
                      setReviewsPage(1);
                    }}
                    className={`px-4 py-2 text-sm font-semibold rounded-lg border transition-colors ${!reviewsFilter.rating && !reviewsFilter.hasImage
                      ? "bg-[#ff6a00] text-white border-[#ff6a00]"
                      : "bg-white text-slate-600 border-slate-200 hover:border-[#ff6a00] hover:text-[#ff6a00]"
                      }`}
                  >
                    All
                  </button>
                  {[5, 4, 3, 2, 1].map((star) => (
                    <button
                      key={star}
                      onClick={() => {
                        setReviewsFilter({ rating: star });
                        setReviewsPage(1);
                      }}
                      className={`px-4 py-2 text-sm font-semibold rounded-lg border transition-colors flex items-center gap-1 ${reviewsFilter.rating === star
                        ? "bg-[#ff6a00] text-white border-[#ff6a00]"
                        : "bg-white text-slate-600 border-slate-200 hover:border-[#ff6a00] hover:text-[#ff6a00]"
                        }`}
                    >
                      {star} Sao
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      setReviewsFilter({ hasImage: true });
                      setReviewsPage(1);
                    }}
                    className={`px-4 py-2 text-sm font-semibold rounded-lg border transition-colors ${reviewsFilter.hasImage
                      ? "bg-[#ff6a00] text-white border-[#ff6a00]"
                      : "bg-white text-slate-600 border-slate-200 hover:border-[#ff6a00] hover:text-[#ff6a00]"
                      }`}
                  >
                    With images
                  </button>
                </div>
              </div>

              {isReviewsLoading ? (
                <div className="py-12 flex justify-center">
                  <svg
                    className="animate-spin h-8 w-8 text-[#ff6a00]"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </div>
              ) : reviews.length === 0 ? (
                <div className="py-12 text-center text-slate-500">
                  No reviews match this filter.
                </div>
              ) : (
                <div className="space-y-8">
                  {reviews.map((review) => (
                    <div
                      key={review.reviewId}
                      className="flex gap-4 border-b border-slate-100 pb-8 last:border-0 last:pb-0"
                    >
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 text-slate-500 font-bold">
                        {review.accountName?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-sm">
                            {review.accountName}
                          </span>
                          <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[10px]">
                              check_circle
                            </span>
                            Verified purchase
                          </span>
                        </div>
                        <div className="flex items-center text-[#ff6a00] mb-3">
                          {Array.from({ length: 5 }).map((_, index) => (
                            <span
                              key={index}
                              className="material-symbols-outlined text-sm"
                              style={{
                                fontVariationSettings:
                                  index < review.rating
                                    ? "'FILL' 1"
                                    : "'FILL' 0",
                              }}
                            >
                              star
                            </span>
                          ))}
                        </div>
                        {review.comment && (
                          <p className="text-sm text-slate-600 mb-4 whitespace-pre-wrap">
                            {review.comment}
                          </p>
                        )}

                        {review.images && review.images.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {review.images.map((img) => (
                              <div
                                key={img.reviewProductImageId}
                                className="relative w-20 h-20 rounded border border-slate-200 overflow-hidden cursor-pointer"
                              >
                                <Image
                                  src={img.imageUrl}
                                  alt="Review image"
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="text-xs text-slate-400 mb-4">
                          {new Date(review.createdAt).toLocaleDateString(
                            "vi-VN",
                          )}{" "}
                          {review.isEdited && "(Edited)"}
                        </div>

                        {review.replies && review.replies.length > 0 && (
                          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 mt-2">
                            {review.replies.map((reply) => (
                              <div
                                key={reply.replyProductId}
                                className="text-sm"
                              >
                                <div className="font-bold text-slate-800 mb-1">
                                  Reply from {reply.staffName}
                                </div>
                                <p className="text-slate-600 whitespace-pre-wrap">
                                  {reply.content}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {reviewsTotalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-8 pt-4 border-t border-slate-100">
                      <button
                        onClick={() =>
                          setReviewsPage((p) => Math.max(1, p - 1))
                        }
                        disabled={reviewsPage === 1}
                        className="w-8 h-8 rounded border border-slate-200 flex items-center justify-center disabled:opacity-50 hover:bg-slate-50 transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">
                          chevron_left
                        </span>
                      </button>
                      <span className="text-sm font-medium text-slate-700">
                        {reviewsPage} / {reviewsTotalPages}
                      </span>
                      <button
                        onClick={() =>
                          setReviewsPage((p) =>
                            Math.min(reviewsTotalPages, p + 1),
                          )
                        }
                        disabled={reviewsPage === reviewsTotalPages}
                        className="w-8 h-8 rounded border border-slate-200 flex items-center justify-center disabled:opacity-50 hover:bg-slate-50 transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">
                          chevron_right
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        )}
      </div>

      <RecommendationWidget
        widgetCode={WIDGET_CODES.PDP_SIMILAR}
        productId={product.productId}
        title="Sản phẩm tương tự"
        subtitle="Các sản phẩm có đặc điểm gần với sản phẩm bạn đang xem"
        source={`pdp:${product.productId}`}
        className="relative mt-24 mb-12 flow-root lg:mt-28"
      />

      <RecommendationWidget
        widgetCode={WIDGET_CODES.PDP_ALSO_BOUGHT}
        productId={product.productId}
        title="Khách hàng cũng mua"
        subtitle="Những sản phẩm thường được mua kèm"
        source={`pdp_also_bought:${product.productId}`}
        className="relative mb-16 flow-root"
      />
    </div>
  );
}
