"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useAuthContext } from "@/context/AuthContext";
import { useCart } from "@/features/cart/context/CartContext";
import { productApi } from "@/features/products/services/product-api";
import { ProductDetail, ProductList } from "@/features/products/types/product";
import { formatCurrency, formatDateTime } from "@/features/products/utils/format";
import { wishlistApi } from "@/features/wishlist/services/wishlist-api";

const FALLBACK_IMAGE = "https://placehold.co/900x900/png?text=Toy";

const buildImageList = (product: ProductDetail | null) => {
  if (!product) return [];
  const images = [product.mainImageUrl, ...product.additionalImageUrls].filter(Boolean) as string[];
  return Array.from(new Set(images));
};

const renderRatingStars = (rating: number) => {
  const safeRating = Math.max(0, Math.min(5, rating));
  const fullStars = Math.floor(safeRating);
  const hasHalfStar = safeRating - fullStars >= 0.5;

  return Array.from({ length: 5 }).map((_, index) => {
    if (index < fullStars) {
      return (
        <span key={index} className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
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
    html.includes("&lt;") && html.includes("&gt;") ? decodeHtmlEntities(html) : html;

  const parser = new DOMParser();
  const doc = parser.parseFromString(normalizedInput, "text/html");

  doc.querySelectorAll("script, style, iframe, object, embed").forEach((node) => node.remove());

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
      /(background(-color)?\s*:\s*(#000|black|rgba\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\.[0-9]+\)))/.test(style);

    if (hasOverlayClass || (hasFixedOrAbsolute && (hasViewportCover || hasDarkBackground))) {
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

export default function ProductDetailsView({ productId }: { productId: number }) {
  const { addItem, cart } = useCart();
  const { isAuthenticated, isHydrated } = useAuthContext();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [similarProducts, setSimilarProducts] = useState<ProductList[]>([]);
  const [wishlistProductIds, setWishlistProductIds] = useState<Set<number>>(new Set());
  const [isWishlistUpdating, setIsWishlistUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState<"description" | "specs" | "reviews">(
    "description",
  );

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
        setError("Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.");
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

    const fetchSimilar = async () => {
      try {
        const result = await productApi.getProducts({ pageNumber: 1, pageSize: 8 });
        if (!active) return;
        const items = result.items.filter((item) => item.productId !== productId).slice(0, 5);
        setSimilarProducts(items);
      } catch {
        if (active) setSimilarProducts([]);
      }
    };

    fetchSimilar();
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
        : "Đang cập nhật";

    return [
      { label: "Danh mục", value: product.categoryName },
      { label: "Thương hiệu", value: product.brandName ?? "Đang cập nhật" },
      { label: "Khoảng giá", value: priceRange },
      { label: "Chất liệu", value: product.materialName ?? "Đang cập nhật" },
      { label: "Độ tuổi", value: product.ageRange ?? "Đang cập nhật" },
      { label: "Giới tính", value: product.sexName ?? "Đang cập nhật" },
      { label: "Xuất xứ", value: product.originName ?? "Đang cập nhật" },
      { label: "Số lượng còn", value: product.quantity.toString() },
    ];
  }, [product]);

  const quantityInCart = useMemo(() => {
    if (!product) return 0;
    return cart?.items.find((item) => item.productId === product.productId)?.quantity ?? 0;
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
    return <div className="py-16 text-center text-slate-500">Đang tải sản phẩm...</div>;
  }

  if (error || !product) {
    return <div className="py-16 text-center text-red-500">{error ?? "Không tìm thấy sản phẩm."}</div>;
  }

  const safeImage = activeImage ?? product.mainImageUrl ?? FALLBACK_IMAGE;
  const inStock = product.quantity > 0 && product.productStatus === "Active";
  const canAddToCart = inStock && remainingStock > 0;
  const maxSelectableQuantity = Math.max(remainingStock, 1);
  const selectedQuantity = Math.min(Math.max(quantity, 1), maxSelectableQuantity);
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
      toast.success("Added to cart successfully.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to add item to cart.";
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

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
      <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8 overflow-x-auto whitespace-nowrap pb-2">
        <Link href="/" className="hover:text-[#ff6a00]">Trang chủ</Link>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <Link href="/products" className="hover:text-[#ff6a00]">Sản phẩm</Link>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <span className="text-slate-900 font-medium">{product.productName}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        <div className="space-y-4">
          <div className="aspect-square w-full rounded-2xl bg-white border border-slate-100 overflow-hidden shadow-sm">
            <img className="w-full h-full object-contain p-8" src={safeImage} alt={product.productName} />
          </div>
          {images.length > 0 && (
            <div className="grid grid-cols-4 gap-4">
              {images.slice(0, 7).map((img) => (
                <button
                  key={img}
                  onClick={() => setActiveImage(img)}
                  className={`aspect-square rounded-lg border-2 overflow-hidden bg-white shadow-sm ${
                    img === safeImage ? "border-[#ff6a00]" : "border-slate-200 hover:border-[#ff6a00]"
                  }`}
                >
                  <img className="w-full h-full object-cover" src={img} alt={product.productName} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <div className="mb-2">
            <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${inStock ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>
              {inStock ? "Sẵn sàng giao" : "Hết hàng"}
            </span>
          </div>
          <div className="mb-4 flex items-start justify-between gap-4">
            <h1 className="text-3xl font-black leading-tight">{product.productName}</h1>
            <button
              type="button"
              onClick={handleToggleWishlist}
              disabled={isWishlistUpdating}
              className="h-11 w-11 rounded-full border border-slate-200 bg-white shadow-sm flex items-center justify-center transition-colors hover:border-red-200 disabled:opacity-60 disabled:cursor-not-allowed"
              aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
            >
              <span
                className={`material-symbols-outlined text-[22px] ${isFavorite ? "text-red-500" : "text-slate-500"}`}
                style={{ fontVariationSettings: isFavorite ? "'FILL' 1" : "'FILL' 0" }}
              >
                favorite
              </span>
            </button>
          </div>
          <div className="flex items-center gap-4 mb-6 text-sm flex-wrap">
            <div className="flex items-center text-[#ff6a00]">
              {renderRatingStars(averageRating)}
              <span className="ml-1 text-sm font-bold">{averageRating.toFixed(1)}</span>
            </div>
            <span className="text-slate-400">|</span>
            <span className="text-sm font-medium">{reviewCount} Đánh giá</span>
            <span className="text-slate-400">|</span>
            <span className="text-sm font-medium">{soldQuantity} Đã bán</span>
          </div>
          <div className="flex items-center gap-3 mb-6 text-sm text-slate-500">
            <span>Danh mục:</span>
            <span className="font-semibold text-slate-900">{product.categoryName}</span>
            {product.brandName && (
              <>
                <span className="text-slate-400">|</span>
                <span>Thương hiệu:</span>
                <span className="font-semibold text-slate-900">{product.brandName}</span>
              </>
            )}
          </div>

          <div className="p-6 bg-slate-50 rounded-2xl mb-8">
            {product.discountedPrice != null ? (
              <div className="mb-2">
                <div className="flex items-center gap-4 mb-1">
                  <span className="text-4xl font-black text-[#ff6a00]">{formatCurrency(product.discountedPrice)}</span>
                  {product.discountPercent != null && product.discountPercent > 0 && (
                    <span className="bg-red-500 text-white text-sm font-bold px-2 py-1 rounded-md shadow-sm">
                      -{product.discountPercent}%
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg text-slate-400 line-through">{formatCurrency(product.price)}</span>
                  <span className="text-xs text-slate-400">(Giá gốc)</span>
                </div>
              </div>
            ) : (
              <div className="flex items-baseline gap-4 mb-2">
                <span className="text-4xl font-black text-[#ff6a00]">{formatCurrency(product.price)}</span>
                <span className="text-sm text-slate-400">Giá bán lẻ đề xuất</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm font-medium text-emerald-600">
              <span className="material-symbols-outlined text-base">confirmation_number</span>
              <span>Mã TOY200 giảm ngay 200k cho đơn từ 999k</span>
            </div>
          </div>

          <div className="space-y-6 mb-8">
            <div>
              <p className="text-sm font-bold mb-3 uppercase tracking-tight">Số lượng:</p>
              <div className="flex items-center border border-slate-200 w-fit rounded-lg overflow-hidden">
                <button
                  className="px-3 py-2 hover:bg-slate-100 transition-colors"
                  onClick={() => setQuantity(Math.max(1, selectedQuantity - 1))}
                >
                  <span className="material-symbols-outlined text-base">remove</span>
                </button>
                <input
                  className="w-14 text-center border-x border-slate-200 py-2 bg-transparent focus:ring-0 outline-none"
                  type="text"
                  value={selectedQuantity}
                  readOnly
                />
                <button
                  className="px-3 py-2 hover:bg-slate-100 transition-colors"
                  onClick={() => setQuantity(Math.min(maxSelectableQuantity, selectedQuantity + 1))}
                  disabled={!canAddToCart || selectedQuantity >= maxSelectableQuantity}
                >
                  <span className="material-symbols-outlined text-base">add</span>
                </button>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                In cart: {quantityInCart} | Can add: {remainingStock}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <button
              className="flex-1 px-8 py-4 border-2 border-[#ff6a00] text-[#ff6a00] font-bold rounded-xl hover:bg-orange-50 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              type="button"
              onClick={handleAddToCart}
              disabled={!canAddToCart || isAddingToCart}
            >
              <span className="material-symbols-outlined">add_shopping_cart</span>
              {isAddingToCart ? "Adding..." : !canAddToCart ? "Max stock reached in cart" : "Add to cart"}
            </button>
            <button className="flex-1 px-8 py-4 bg-[#ff6a00] text-white font-bold rounded-xl hover:bg-[#e05e00] shadow-lg shadow-orange-200 transition-all flex items-center justify-center gap-2">
              Mua ngay
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-100 pt-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-[#ff6a00]">
                <span className="material-symbols-outlined">local_shipping</span>
              </div>
              <span className="text-xs font-semibold">Miễn phí vận chuyển đơn từ 499k</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-[#ff6a00]">
                <span className="material-symbols-outlined">cached</span>
              </div>
              <span className="text-xs font-semibold">Đổi trả miễn phí 7 ngày</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-[#ff6a00]">
                <span className="material-symbols-outlined">verified_user</span>
              </div>
              <span className="text-xs font-semibold">Bảo hành chính hãng 12 tháng</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-16 flow-root">
        <div className="border-b border-slate-200 flex items-center gap-8 mb-8 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("description")}
            className={`pb-4 border-b-2 font-bold whitespace-nowrap ${
              activeTab === "description"
                ? "border-[#ff6a00] text-[#ff6a00]"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            Mô tả sản phẩm
          </button>
          <button
            onClick={() => setActiveTab("specs")}
            className={`pb-4 border-b-2 font-semibold whitespace-nowrap ${
              activeTab === "specs"
                ? "border-[#ff6a00] text-[#ff6a00]"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            Thông số kỹ thuật
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`pb-4 border-b-2 font-semibold whitespace-nowrap ${
              activeTab === "reviews"
                ? "border-[#ff6a00] text-[#ff6a00]"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            Đánh giá khách hàng
          </button>
        </div>

        {activeTab === "description" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 flow-root">
            <div className="relative z-0 lg:col-span-3 prose max-w-none text-slate-600 leading-relaxed flow-root">
              {safeDescriptionHtml ? (
                <div
                  className="ql-editor p-0 overflow-hidden break-words"
                  dangerouslySetInnerHTML={{ __html: safeDescriptionHtml }}
                />
              ) : (
                <p className="mb-4">
                  Sản phẩm đang được cập nhật mô tả chi tiết. Hãy quay lại sau để xem thêm thông tin về chất liệu, tính năng và lợi ích cho bé.
                </p>
              )}
              <div className="clear-both" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                <div className="rounded-xl border border-slate-100 p-4">
                  <p className="text-sm font-semibold text-slate-900">Ngày ra mắt</p>
                  <p className="text-sm text-slate-500">{formatDateTime(product.launchDate)}</p>
                </div>
                <div className="rounded-xl border border-slate-100 p-4">
                  <p className="text-sm font-semibold text-slate-900">Cập nhật gần nhất</p>
                  <p className="text-sm text-slate-500">{formatDateTime(product.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "specs" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="bg-slate-50 rounded-2xl p-6 h-fit lg:col-span-3">
              <h3 className="text-lg font-bold mb-4">Thông số cơ bản</h3>
              <div className="space-y-4">
                {specs.map((item) => (
                  <div key={item.label} className="flex justify-between border-b border-slate-200 pb-2 text-sm">
                    <span className="text-slate-500">{item.label}</span>
                    <span className="font-semibold text-slate-900 text-right">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "reviews" && (
          <section>
            <h2 className="text-2xl font-black mb-8">Đánh giá sản phẩm</h2>
            <div className="bg-white border border-slate-200 rounded-2xl p-6 lg:p-8">
              <div className="flex flex-col md:flex-row gap-8 mb-8 border-b border-slate-100 pb-8">
                <div className="flex flex-col items-center justify-center md:w-1/4">
                  <div className="text-5xl font-black text-[#ff6a00] mb-2">{averageRating.toFixed(1)}</div>
                  <div className="flex items-center text-[#ff6a00] mb-2">
                    {renderRatingStars(averageRating)}
                  </div>
                  <div className="text-sm text-slate-500">{reviewCount} đánh giá</div>
                </div>
                <div className="md:w-3/4 flex flex-wrap gap-3 items-center">
                  {[
                    "Tất cả",
                    "5 Sao (102)",
                    "4 Sao (15)",
                    "3 Sao (8)",
                    "2 Sao (2)",
                    "1 Sao (1)",
                    "Có hình ảnh/video (45)",
                  ].map((label, index) => (
                    <button
                      key={label}
                      className={`px-4 py-2 text-sm font-semibold rounded-lg border transition-colors ${
                        index === 0
                          ? "bg-[#ff6a00] text-white border-[#ff6a00]"
                          : "bg-white text-slate-600 border-slate-200 hover:border-[#ff6a00] hover:text-[#ff6a00]"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-8">
                {[
                  {
                    name: "Nguyễn Văn A",
                    rating: 5,
                    content:
                      "Đồ chơi rất chắc chắn, màu sắc đẹp và bé nhà mình chơi rất thích. Đóng gói cẩn thận, giao hàng nhanh.",
                    meta: "12/10/2023 14:30 | Phân loại: Đồ chơi giáo dục",
                  },
                  {
                    name: "Trần Thị B",
                    rating: 4,
                    content:
                      "Sản phẩm đúng mô tả, chất liệu an toàn. Bé chơi lâu không bị chán. Mong có thêm nhiều màu sắc hơn.",
                    meta: "05/10/2023 09:15 | Phân loại: Đồ chơi lắp ráp",
                  },
                ].map((review) => (
                  <div key={review.name} className="flex gap-4 border-b border-slate-100 pb-8 last:border-0 last:pb-0">
                    <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm">{review.name}</span>
                        <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-[10px]">check_circle</span>
                          Đã mua hàng
                        </span>
                      </div>
                      <div className="flex items-center text-[#ff6a00] mb-3">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <span
                            key={index}
                            className="material-symbols-outlined text-sm"
                            style={{ fontVariationSettings: index < review.rating ? "'FILL' 1" : "'FILL' 0" }}
                          >
                            star
                          </span>
                        ))}
                      </div>
                      <p className="text-sm text-slate-600 mb-4">{review.content}</p>
                      <div className="text-xs text-slate-400">{review.meta}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>

      <section className="relative mt-24 mb-16 flow-root lg:mt-28">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black">Sản phẩm tương tự</h2>
          <Link href="/products" className="text-[#ff6a00] font-bold flex items-center gap-1 hover:gap-2 transition-all">
            Xem tất cả <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>
        {similarProducts.length === 0 ? (
          <div className="text-slate-500">Chưa có gợi ý sản phẩm.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {similarProducts.map((item) => (
              <Link
                key={item.productId}
                href={`/products/${item.productId}`}
                className="bg-white rounded-xl border border-slate-100 overflow-hidden hover:shadow-xl transition-all group"
              >
                <div className="aspect-square relative overflow-hidden">
                  <img
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    src={item.mainImageUrl || FALLBACK_IMAGE}
                    alt={item.productName}
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-bold line-clamp-2 mb-2 group-hover:text-[#ff6a00] transition-colors">
                    {item.productName}
                  </h3>
                  <div className="mt-auto">
                    {item.discountedPrice != null ? (
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg font-black text-[#ff6a00]">
                            {formatCurrency(item.discountedPrice)}
                          </span>
                          {item.discountPercent != null && item.discountPercent > 0 && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500 text-white shadow-sm">
                              -{item.discountPercent}%
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-400 line-through block">
                          {formatCurrency(item.price)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-lg font-black text-[#ff6a00]">
                        {formatCurrency(item.price)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
