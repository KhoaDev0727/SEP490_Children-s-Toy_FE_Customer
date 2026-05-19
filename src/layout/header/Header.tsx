"use client";
import { useAuthContext } from "@/context/AuthContext";
import { useCart } from "@/features/cart/context/CartContext";
import { authApi } from "@/features/auth/services/auth-api";
import { productApi } from "@/features/products/services/product-api";
import type { ProductDetail } from "@/features/products/types/product";
import { formatCurrency } from "@/features/products/utils/format";
import { wishlistApi } from "@/features/wishlist/services/wishlist-api";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import NotificationPopup from "./NotificationPopup";

const categories = [
  {
    label: "Fashion",
    sub: "Clothing & Accessories",
    icon: "apparel",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDSvXBgjASMQbwm3AKatnkqRNRqY4pXNgJm7qcYzvJS8Sf0hPwpytSO8T8inw055KH3lHzVQYcTHhAqCazvz0e2tZBVfcHE-fmcjvrlnajV0BkY-VyTxzLTZgfqZ3_qTVnnPMNlSTBCtDD3OJdJZcK69QgD6x9C_YMkc2-Hqmr9skQxbdkOy5hv7-w-nZxATBKAOSyBnGiaqdkv7o5isCJvsLFitjgW8He3JmX_PRYmTb2o4FQqEeG8NjwZAQyZkkUcrQO6J9w5Kwo",
  },
  {
    label: "Electronics",
    sub: "Smartphones & Laptops",
    icon: "devices",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAX4cksixDYIG1ynxHVMo66aqdOGgcztuon4_GSxcFmcwq51bozRc6o5NCQQ4Ot6Gu4eJGi2aPMdvykkDmMzaFHq6CnJ9vncuNFONsTFFP5UA3mEivn7YsnsIHaqUEfkOjB19F7xj2-AphOh6PxID1rD6mOsyT1Jg2ls9n6HTCBAleC-XCfyA7lInFOeM4gBW2t4ccEOcx7LWQVibpZ0EP3mJxx9-gQw4NdetTZjV68EH8S1XORSELcfDPxB0uZue2DJYlvTLJz00Q",
  },
  {
    label: "Home Appliances",
    sub: "Kitchen Appliances",
    icon: "home_appliance",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAX4cksixDYIG1ynxHVMo66aqdOGgcztuon4_GSxcFmcwq51bozRc6o5NCQQ4Ot6Gu4eJGi2aPMdvykkDmMzaFHq6CnJ9vncuNFONsTFFP5UA3mEivn7YsnsIHaqUEfkOjB19F7xj2-AphOh6PxID1rD6mOsyT1Jg2ls9n6HTCBAleC-XCfyA7lInFOeM4gBW2t4ccEOcx7LWQVibpZ0EP3mJxx9-gQw4NdetTZjV68EH8S1XORSELcfDPxB0uZue2DJYlvTLJz00Q",
  },
  {
    label: "Beauty",
    sub: "Cosmetics & Care",
    icon: "face_5",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDAZXcJsZlfDu3I5P34AlnI8tEBaCIrtLZcKMo0TFCmnv-65kxmcESqKFte7crFmX8aFxdZJohfl0aqKB9GyJB9An9aCyQeT27qpqwNBwxshLd44hMD6Drf7bLrZ5nsYehdWQe-wP7k4tAoE4wh8YmDvQBfAikcgsfT0zaeM5HVlw1FtL9OzNWV_9B6lmGRt2NsH1iTrCQEf99fjaSEpItlDlV2PetiN7h3thTcWrijmxoAHyfLyxlRuVkwldN7atM7wA9-vVSyEoU",
  },
  {
    label: "Books",
    sub: "Knowledge & Entertainment",
    icon: "menu_book",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAX4cksixDYIG1ynxHVMo66aqdOGgcztuon4_GSxcFmcwq51bozRc6o5NCQQ4Ot6Gu4eJGi2aPMdvykkDmMzaFHq6CnJ9vncuNFONsTFFP5UA3mEivn7YsnsIHaqUEfkOjB19F7xj2-AphOh6PxID1rD6mOsyT1Jg2ls9n6HTCBAleC-XCfyA7lInFOeM4gBW2t4ccEOcx7LWQVibpZ0EP3mJxx9-gQw4NdetTZjV68EH8S1XORSELcfDPxB0uZue2DJYlvTLJz00Q",
  },
];

interface WishlistPreviewItem {
  productId: number;
  createdAt: string;
  product: ProductDetail;
}

const FALLBACK_IMAGE = "https://placehold.co/200x200/png?text=Toy";

function UserDropdown() {
  const { account, isAuthenticated, isHydrated, clearAuth } = useAuthContext();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore logout API errors — always clear local state
    }
    clearAuth();
    setOpen(false);
    toast.success("Logged out.");
    router.push("/");
  };

  if (!isHydrated) {
    return <div className="h-10 w-[110px]" aria-hidden="true" />;
  }

  if (!isAuthenticated || !account) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className="hidden sm:block px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-[#ff6a00] transition-colors"
        >
          Log in
        </Link>
        <Link
          href="/register"
          className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-opacity hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #ff6a00, #ff9a3c)" }}
        >
          Sign up
        </Link>
      </div>
    );
  }

  const initials = account.accountName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="relative" ref={ref}>
      {/* Trigger: avatar + name + chevron — matches HTML's group pattern */}
      <div
        className="relative group flex items-center gap-2 h-full py-4 cursor-pointer"
        onClick={() => setOpen((prev) => !prev)}
      >
        <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-700 flex-shrink-0">
          {account.imageUrl ? (
            <img
              src={account.imageUrl}
              alt={account.accountName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-white text-xs font-bold"
              style={{ background: "linear-gradient(135deg, #ff6a00, #ff9a3c)" }}
            >
              {initials}
            </div>
          )}
        </div>
        <span className="hidden sm:block text-sm font-medium text-slate-700 dark:text-slate-300 max-w-[120px] truncate">
          {account.accountName}
        </span>
        <span
          className="material-symbols-outlined text-slate-400 transition-transform duration-200"
          style={{
            fontSize: 16,
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          expand_more
        </span>
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full w-48 bg-white dark:bg-slate-900 shadow-xl rounded-xl border border-slate-100 dark:border-slate-800 py-2 z-50">
          {/* User info header */}
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
              {account.accountName}
            </p>
            <p className="text-xs text-slate-500 truncate mt-0.5">{account.email}</p>
          </div>

          <div className="py-1">
            <Link
              href="/profile/orders"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-orange-50 dark:hover:bg-orange-950/20 hover:text-[#ff6a00] transition-colors"
            >
              <span className="material-symbols-outlined opacity-70" style={{ fontSize: 20 }}>
                package_2
              </span>
              Orders
            </Link>
            <Link
              href="/profile/wallet"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-orange-50 dark:hover:bg-orange-950/20 hover:text-[#ff6a00] transition-colors"
            >
              <span className="material-symbols-outlined opacity-70" style={{ fontSize: 20 }}>
                account_balance_wallet
              </span>
              Wallet
            </Link>
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-orange-50 dark:hover:bg-orange-950/20 hover:text-[#ff6a00] transition-colors"
            >
              <span className="material-symbols-outlined opacity-70" style={{ fontSize: 20 }}>
                manage_accounts
              </span>
              Account
            </Link>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 py-1">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-left"
            >
              <span className="material-symbols-outlined opacity-70" style={{ fontSize: 20 }}>
                logout
              </span>
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [wishlistItems, setWishlistItems] = useState<WishlistPreviewItem[]>([]);
  const [updatingWishlistProductId, setUpdatingWishlistProductId] = useState<number | null>(null);
  const [addingWishlistProductId, setAddingWishlistProductId] = useState<number | null>(null);
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
      const rawWishlistItems = await wishlistApi.getMyWishlist();
      const productResults = await Promise.allSettled(
        rawWishlistItems.map((item) => productApi.getProductById(item.productId)),
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
      setWishlistItems((prev) => prev.filter((item) => item.productId !== productId));
      toast.success("Item removed from wishlist.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to remove wishlist item.";
      toast.error(message);
    } finally {
      setUpdatingWishlistProductId(null);
    }
  };

  const handleAddWishlistItemToCart = async (item: WishlistPreviewItem) => {
    const inStock = item.product.quantity > 0 && item.product.productStatus === "Active";
    if (!inStock) {
      toast.error("This product is currently unavailable.");
      return;
    }

    try {
      setAddingWishlistProductId(item.productId);
      await addItem(item.productId, 1);
      toast.success("Item added to cart.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to add item to cart.";
      toast.error(message);
    } finally {
      setAddingWishlistProductId(null);
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
                className="p-1.5 rounded-lg text-white"
                style={{ backgroundColor: "#ff6a00" }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 24 }}>
                  shopping_bag
                </span>
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                ShopX
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

              {/* Products dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setDropdownOpen(true)}
                onMouseLeave={() => setDropdownOpen(false)}
              >
                <button className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-[#ff6a00] transition-colors flex items-center gap-1 py-4 cursor-pointer">
                  Categories
                  <span
                    className="material-symbols-outlined transition-transform duration-200"
                    style={{
                      fontSize: 16,
                      transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  >
                    expand_more
                  </span>
                </button>

                {dropdownOpen && (
                  <div className="absolute top-full left-0 w-64 bg-white dark:bg-slate-900 shadow-xl rounded-xl border border-slate-100 dark:border-slate-800 py-2 z-50">
                    <div className="grid grid-cols-1 gap-1 p-2">
                      {categories.map((cat) => (
                        <a
                          key={cat.label}
                          href="#"
                          className="flex items-center gap-4 px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-orange-50 dark:hover:bg-orange-950/20 hover:text-[#ff6a00] transition-all rounded-lg"
                        >
                          {/* Category thumbnail */}
                          <div className="w-10 h-10 rounded-md overflow-hidden bg-slate-100 flex-shrink-0">
                            <img
                              src={cat.img}
                              alt={cat.label}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          {/* Text */}
                          <div className="flex flex-col">
                            <span className="font-semibold leading-tight">{cat.label}</span>
                            <span className="text-[10px] text-slate-400 mt-0.5">{cat.sub}</span>
                          </div>
                          {/* Material icon accent */}
                          <span
                            className="material-symbols-outlined ml-auto opacity-30"
                            style={{ fontSize: 18 }}
                          >
                            {cat.icon}
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>


              <a
                href="#"
                className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-[#ff6a00] transition-colors"
              >
                Promotions
              </a>
              <Link
                href="/blog"
                className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-[#ff6a00] transition-colors"
              >
                News
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
              <span className="material-symbols-outlined" style={{ fontSize: 24 }}>
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
              <span className="material-symbols-outlined" style={{ fontSize: 24 }}>
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
                  <span className="material-symbols-outlined text-red-500" style={{ fontSize: 18 }}>
                    favorite
                  </span>
                  <p className="font-semibold text-sm">
                    Wishlist ({wishlistCount} item{wishlistCount === 1 ? "" : "s"})
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsWishlistOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                  aria-label="Close"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                    close
                  </span>
                </button>
              </div>

            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
              {wishlistLoading ? (
                <div className="text-sm text-slate-500 text-center py-6">Loading wishlist...</div>
              ) : wishlistItems.length === 0 ? (
                <div className="text-sm text-slate-500 text-center py-6">
                  Your wishlist is empty.
                </div>
              ) : (
                wishlistItems.map((item) => {
                  const inStock = item.product.quantity > 0 && item.product.productStatus === "Active";
                  const displayPrice = item.product.discountedPrice ?? item.product.price;
                  return (
                    <div key={item.productId} className="bg-white rounded-xl border border-slate-200 p-3">
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
                            {formatCurrency(displayPrice)}
                          </p>
                          <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full mt-1 ${inStock ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>
                            {inStock ? "In stock" : "Out of stock"}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => void handleAddWishlistItemToCart(item)}
                          disabled={!inStock || addingWishlistProductId === item.productId}
                          className="flex-1 py-2 px-3 rounded-lg bg-[#ff7a00] text-white text-sm font-semibold hover:bg-[#e06c00] disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {addingWishlistProductId === item.productId ? "Adding..." : "Add to cart"}
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleRemoveWishlistItem(item.productId)}
                          disabled={updatingWishlistProductId === item.productId}
                          className="h-9 w-9 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
                          aria-label="Remove item from wishlist"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
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


