"use client";
import { useAuthContext } from "@/context/AuthContext";
import { useCart } from "@/features/cart/context/CartContext";
import { productApi } from "@/features/products/services/product-api";
import type { ProductDetail } from "@/features/products/types/product";
import {
  formatCurrency,
  formatMysteryPrice,
} from "@/features/products/utils/format";
import { wishlistApi } from "@/features/wishlist/services/wishlist-api";
import { followApi } from "@/features/products/services/follow-api";
import fallbackLogoImage from "@/assets/image/Logo/Logo.png";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import NotificationPopup from "./NotificationPopup";
import Image from "next/image";
import logoImage from "@/assets/image/Logo/Logo.png";
interface WishlistPreviewItem {
  productId: number;
  createdAt: string;
  product: ProductDetail;
}

const FALLBACK_IMAGE = "../../assets/image/Logo.png";

import dynamic from "next/dynamic";

const UserDropdown = dynamic(() => import("./UserDropdown"), {
  ssr: false,
  loading: () => <div className="h-10 w-[110px]" aria-hidden="true" />,
});

export default function Header() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [wishlistItems, setWishlistItems] = useState<WishlistPreviewItem[]>([]);
  const [followedProductIds, setFollowedProductIds] = useState<Set<number>>(
    new Set(),
  );
  const [updatingWishlistProductId, setUpdatingWishlistProductId] = useState<
    number | null
  >(null);
  const [addingWishlistProductId, setAddingWishlistProductId] = useState<
    number | null
  >(null);
  const { cart, addItem } = useCart();
  const { isAuthenticated, isHydrated } = useAuthContext();
  const cartCount = cart?.totalQuantity ?? 0;

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const currentTerm = searchParams.get("searchTerm") ?? "";
    setSearchTerm(currentTerm);
  }, [searchParams]);

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const keyword = searchTerm.trim();
    if (keyword) {
      router.push(`/products?searchTerm=${encodeURIComponent(keyword)}`);
      return;
    }
    router.push("/products");
  };

  const fetchWishlistPreview = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }

    setWishlistLoading(true);
    try {
      const [rawWishlistItems, myFollows] = await Promise.all([
        wishlistApi.getMyWishlist(),
        followApi.getMyFollows().catch(() => [] as number[]),
      ]);
      setFollowedProductIds(new Set(myFollows));
      const productResults = await Promise.allSettled(
        rawWishlistItems.map((item) =>
          productApi.getProductById(item.productId),
        ),
      );

      const mappedItems: WishlistPreviewItem[] = [];
      for (let index = 0; index < rawWishlistItems.length; index += 1) {
        const productResult = productResults[index];
        if (productResult.status !== "fulfilled") {
          continue;
        }

        mappedItems.push({
          productId: rawWishlistItems[index].productId,
          createdAt: rawWishlistItems[index].createdAt,
          product: productResult.value,
        });
      }

      setWishlistItems(mappedItems);
    } catch {
      setWishlistItems([]);
    } finally {
      setWishlistLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isWishlistOpen) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsWishlistOpen(false);
      }
    };

    document.addEventListener("keydown", onEsc);
    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", onEsc);
    };
  }, [isWishlistOpen]);

  const wishlistCount = isAuthenticated ? wishlistItems.length : 0;

  const handleOpenWishlist = async () => {
    if (!isHydrated) {
      return;
    }

    if (!isAuthenticated) {
      toast.error("Please log in to view your wishlist.");
      return;
    }

    setIsWishlistOpen(true);
    await fetchWishlistPreview();
  };

  const handleRemoveWishlistItem = async (productId: number) => {
    try {
      setUpdatingWishlistProductId(productId);
      await wishlistApi.removeItem(productId);
      setWishlistItems((prev) =>
        prev.filter((item) => item.productId !== productId),
      );
      toast.success("Item removed from wishlist.");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to remove wishlist item.";
      toast.error(message);
    } finally {
      setUpdatingWishlistProductId(null);
    }
  };

  const handleAddWishlistItemToCart = async (item: WishlistPreviewItem) => {
    const inStock =
      item.product.quantity > 0 && item.product.productStatus === "Active";
    if (!inStock) {
      toast.error("This product is currently unavailable.");
      return;
    }

    try {
      setAddingWishlistProductId(item.productId);
      await addItem(item.productId, 1);
      toast.success("Item added to cart.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to add item to cart.";
      toast.error(message);
    } finally {
      setAddingWishlistProductId(null);
    }
  };

  const handleToggleFollow = async (productId: number) => {
    try {
      if (followedProductIds.has(productId)) {
        await followApi.unfollowProduct(productId);
        setFollowedProductIds((prev) => {
          const next = new Set(prev);
          next.delete(productId);
          return next;
        });
        toast.success("Unfollowed product.");
      } else {
        await followApi.followProduct(productId);
        setFollowedProductIds((prev) => {
          const next = new Set(prev);
          next.add(productId);
          return next;
        });
        toast.success("You will be notified when the product launches!");
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to complete the action.";
      toast.error(message);
    }
  };

  return (
    <>
      <header
        className="site-header sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800"
        style={{
          backgroundColor: "rgba(255,255,255,0.80)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        {/* Dark mode override */}
        <style>{`
        @media (prefers-color-scheme: dark) {
          .site-header { background-color: rgba(17,17,17,0.80) !important; }
        }
        .dark .site-header { background-color: rgba(17,17,17,0.80) !important; }
      `}</style>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo + Nav */}
            <div className="flex items-center gap-8">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2 flex-shrink-0">
                <div
                  className=" rounded-lg text-white"
                  style={{ backgroundColor: "#ff6a00" }}
                >
                  <Image
                    src={logoImage}
                    alt="Toy Store Logo"
                    width={40}
                    height={40}
                    className="rounded-lg"
                  />
                </div>
                <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Toy Store
                </span>
              </Link>

              {/* Desktop Nav */}
              <nav className="hidden md:flex items-center gap-8">
                <Link
                  href="/"
                  className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-[#ff6a00] transition-colors"
                >
                  Home
                </Link>
                <Link
                  href="/products"
                  className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-[#ff6a00] transition-colors"
                >
                  Products
                </Link>
                <Link
                  href="/blog"
                  className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-[#ff6a00] transition-colors"
                >
                  Blogs
                </Link>
              </nav>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-md hidden lg:block mx-4">
              <form className="relative" onSubmit={handleSearchSubmit}>
                <button
                  type="submit"
                  className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  style={{ fontSize: 20 }}
                  aria-label="Search"
                >
                  search
                </button>
                <input
                  className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-[#ff6a00] text-sm outline-none transition-all text-slate-900 dark:text-slate-100 placeholder-slate-400"
                  placeholder="Search for products..."
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </form>
            </div>

            {/* Right icons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Cart */}
              <Link
                href="/cart"
                aria-label="Open cart"
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg relative text-slate-600 dark:text-slate-300"
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 24 }}
                >
                  shopping_cart
                </span>
                {mounted && cartCount > 0 && (
                  <span
                    className="absolute top-1 right-1 w-4 h-4 text-white text-[10px] flex items-center justify-center rounded-full font-bold"
                    style={{ backgroundColor: "#ff6a00" }}
                  >
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Wishlist */}
              <button
                type="button"
                aria-label="Open wishlist"
                onClick={handleOpenWishlist}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg relative text-slate-600 dark:text-slate-300"
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 24 }}
                >
                  favorite
                </span>
                {mounted && wishlistCount > 0 && (
                  <span
                    className="absolute top-1 right-1 w-4 h-4 text-white text-[10px] flex items-center justify-center rounded-full font-bold"
                    style={{ backgroundColor: "#ff6a00" }}
                  >
                    {wishlistCount > 99 ? "99+" : wishlistCount}
                  </span>
                )}
              </button>

              {/* Notifications */}
              <NotificationPopup />

              {/* User */}
              <UserDropdown />
            </div>
          </div>
        </div>
      </header>

      {isWishlistOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 top-16 z-[60] bg-black/25"
            onClick={() => setIsWishlistOpen(false)}
            aria-label="Close wishlist popup"
          />
          <aside className="fixed right-0 top-16 z-[70] h-[calc(100vh-4rem)] w-full max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col">
            <div className="px-4 py-3 border-b border-slate-200">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2 text-slate-800">
                  <span
                    className="material-symbols-outlined text-red-500"
                    style={{ fontSize: 18 }}
                  >
                    favorite
                  </span>
                  <p className="font-semibold text-sm">
                    Wishlist ({wishlistCount} item
                    {wishlistCount === 1 ? "" : "s"})
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsWishlistOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                  aria-label="Close"
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: 20 }}
                  >
                    close
                  </span>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
              {wishlistLoading ? (
                <div className="text-sm text-slate-500 text-center py-6">
                  Loading wishlist...
                </div>
              ) : wishlistItems.length === 0 ? (
                <div className="text-sm text-slate-500 text-center py-6">
                  Your wishlist is empty.
                </div>
              ) : (
                wishlistItems.map((item) => {
                  const isComingSoon =
                    item.product.productStatus === "ComingSoon";
                  const inStock =
                    item.product.quantity > 0 &&
                    item.product.productStatus === "Active";
                  const displayPrice =
                    item.product.discountedPrice ?? item.product.price;
                  const statusLabel = isComingSoon
                    ? "Coming soon"
                    : inStock
                      ? "In stock"
                      : "Out of stock";
                  const statusBadgeClass = isComingSoon
                    ? "bg-blue-100 text-blue-700"
                    : inStock
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-200 text-slate-600";
                  return (
                    <div
                      key={item.productId}
                      className="bg-white rounded-xl border border-slate-200 p-3"
                    >
                      <div className="flex gap-3">
                        <Link
                          href={`/products/${item.productId}`}
                          className="w-16 h-16 rounded-lg border border-slate-100 overflow-hidden bg-slate-50 flex-shrink-0"
                          onClick={() => setIsWishlistOpen(false)}
                        >
                          <img
                            src={item.product.mainImageUrl || FALLBACK_IMAGE}
                            alt={item.product.productName}
                            className="w-full h-full object-cover"
                          />
                        </Link>
                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/products/${item.productId}`}
                            className="text-sm font-semibold text-slate-900 line-clamp-2 hover:text-[#ff6a00]"
                            onClick={() => setIsWishlistOpen(false)}
                          >
                            {item.product.productName}
                          </Link>
                          <p className="text-xl font-black text-slate-900 leading-tight mt-1">
                            {isComingSoon
                              ? formatMysteryPrice(displayPrice)
                              : formatCurrency(displayPrice)}
                          </p>
                          <span
                            className={`inline-block text-[10px] px-2 py-0.5 rounded-full mt-1 ${statusBadgeClass}`}
                          >
                            {statusLabel}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-2">
                        {isComingSoon ? (
                          <button
                            type="button"
                            onClick={() =>
                              void handleToggleFollow(item.productId)
                            }
                            className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold border transition-colors ${followedProductIds.has(item.productId) ? "bg-slate-100 text-slate-600 border-slate-200" : "bg-white text-[#ff6a00] border-[#ff6a00] hover:bg-[#ff6a00] hover:text-white"}`}
                          >
                            {followedProductIds.has(item.productId)
                              ? "Following"
                              : "Follow"}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              void handleAddWishlistItemToCart(item)
                            }
                            disabled={
                              !inStock ||
                              addingWishlistProductId === item.productId
                            }
                            className="flex-1 py-2 px-3 rounded-lg bg-[#ff7a00] text-white text-sm font-semibold hover:bg-[#e06c00] disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {addingWishlistProductId === item.productId
                              ? "Adding..."
                              : "Add to cart"}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            void handleRemoveWishlistItem(item.productId)
                          }
                          disabled={
                            updatingWishlistProductId === item.productId
                          }
                          className="h-9 w-9 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
                          aria-label="Remove item from wishlist"
                        >
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: 18 }}
                          >
                            delete
                          </span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </aside>
        </>
      )}
    </>
  );
}
