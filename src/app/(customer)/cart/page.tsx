"use client";

import { useMemo, useState } from "react";

type CartItem = {
  id: number;
  name: string;
  variant: string;
  price: number;
  quantity: number;
  selected: boolean;
  badge?: string;
  image: string;
};

type RecommendedItem = {
  id: number;
  name: string;
  price: number;
  image: string;
};

const initialCartItems: CartItem[] = [
  {
    id: 1,
    name: "Pro Audio Max Wireless Over-Ear Headphones",
    variant: "Color: Matte Black | Size: Universal",
    price: 349,
    quantity: 1,
    selected: true,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBCZqMtt7Pze92BmRrykU9UvLHuzRPEj7y0mr9yo1guzV-aMGXWIP1X_rBtofYW0LTMHmHZXLI-XqYk0I9sZFsK78Rbv50-L6AE2C2MU9kGlIGXRK9HDR50t5QJqg4n1xoruJWTUbZrX0VYGJEejt1EZ9kjhU58L6_femHr_Dm5bAhIM3-aTj9JOXti6iCc-ASu7AP3UKbJLlekhcXpTWFCMT50kHY9oqVdvIzQsjQpi7AMbEGMk3W2kxEAtOUchDDa59lIPc8KU44",
  },
  {
    id: 2,
    name: "Active Fit Smartwatch Series X",
    variant: "Color: Blaze Orange | 44mm",
    price: 199,
    quantity: 1,
    selected: true,
    badge: "Flash Sale",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDr9-33TkQVIu5ypP8zwuxnzBW205VrMerIfSTJLhG6lr9nz8JvzRjDYjg_-CLdwKIe0-Lr0jtSCO3xl3ZsS7hxaFGwZ4CBcLeTqMMwrMiYzacYYOGRWwASk2ZDmTuMfVXNaMcRy7Z3od2GFjtZPKVIPlIYCNuee3Pfc8o3QCV3DrCJsBzCg2gvcM5g142iicm2XzWDlpZ64bYPXDHyZEo6pYHOfA-VL8wgbydbltgFuhS6ZjpM0RUQA3Rtxy-4OPAkUFcG1HxzrjU",
  },
];

const recommendedItems: RecommendedItem[] = [
  {
    id: 1,
    name: "Acoustic Pods True Wireless Earbuds",
    price: 89,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDIV6L9WQ86V_4uO3VyCxCvTnyqvmlvzJ3Z_4uHV1KLnhj9ufucAU8dF7_tmdCBrHO4kEXKTbzagFrGxB5PgqHlV0pcX9qxQtS1yIGegEz_hfAyUBZw5ke6AbYymCBUrpDYmPwjBKltwMsz5SdllgRDH7YA7lhxN_3cnXsuOZcQsWAGT9_EMbi7Yt0blVFcSR7fZIpqLs6kpgbMvb8ZR46eV6F5wf9vqd5izlZWA9B5W6g73I43VXz3cvM-qkp6r5CaLWzHIHz2vek",
  },
  {
    id: 2,
    name: "UltraCharge 20000mAh Power Bank",
    price: 45,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA9Io7AXfLpU9w8WBt17yAH5m53NrG7e1AblCPTeg-kDHLwLxP62pvSGKaZ0-N-Grkn0pBj29ITShIzdUVzGQrv-hrZmN21kn0H65-PgvSevKlmPizP5XDUyPJ7P4bBY9b-hu8-JVkU409R8ho85VTELJyFHl5SuWH_UpD_CyuSFO85MwWGykF8gSrVgxWlCKl3cyexUwRdnxbEZcF1p5TiS63w4dra3n8JicgugMBOb2BCAkDloFCYXBSzKxqjAI-idIpQhXS_XMI",
  },
  {
    id: 3,
    name: "SoundBlast Waterproof Portable Speaker",
    price: 59,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBqZOaUFsZ_5yDfrgfwzUOJCET3wiZC3esvrkTGiKlupaG04SubuLaCfReV4NigNbMGrclE7YMNQnQvM9-Yk6gsySO7f14NSv6K7rCR8JTYW9jm8sCHXoOQCIsAH0DZWFoaK_RWzQrC2rqvv1u-Bhs2dfpZL7lyrVr_ZNUZaPf8nOM496N8ok5FF-fbP-lbWYJKpOdYe8_TQvAhWRwIvYaDP_j2HwT6KDcUSwbEnkKoAtWn4B6USjoPEIRMeu_mvTksHmWbRn_YdKU",
  },
  {
    id: 4,
    name: "EchoCore Smart Home Hub and Speaker",
    price: 129,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBbuJqi3lGMxEwH4PAU1iKb054lUJLt_QF59mq75BC16ZjPM_YNoRFa8tY_HC6n5UfnNtHNWUVdVuts-yQXFY_IO097DDXVopBVOvgQjJPjATXRwbhR6wpdKUlTh-Zbx4nK4J0myBguFWn2C2n7OKDp66z-O_TDHNAFEjX2XYeaFLRArxFDP0QHzcM7bnClmwW8AVqKFBfH1D0Ygw_zCViJwK91dFE_NT_YtbEq-y6TB1zpb2nfg4DabdeHp_1w_x5mUSJ4i-3eFmE",
  },
  {
    id: 5,
    name: "PrecisionStrike RGB Gaming Mouse",
    price: 75,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAjcLvFkcGVoGTjGOzVrnOWxiWlxFxQtjyU_r4gONvyyXbBiK4Dqz83DfsAbVERwvP6mxATVR4xSw_DjbaIeCgI3gNVLEAADmA9ve9JfEyxThY40AkitMUtmajRneQ2NnYHPyFzGvD9wN5X6YhY9KVEzVAGPWxnxyrPEfO-ptTiUxX-eSxfHz2VA1SZSVt42kgf5Vczz0Zh1wNxpI0aGCiI6TlQVYP9rfstGy7H1sbCQL8iKSNGofWTUctg1e9jAWio7PW0o4IN7LA",
  },
];

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

function formatPrice(value: number) {
  return currencyFormatter.format(value);
}

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>(initialCartItems);
  const [discountCode, setDiscountCode] = useState("");

  const selectedItems = useMemo(() => items.filter((item) => item.selected), [items]);
  const selectedCount = selectedItems.length;
  const selectedUnits = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
  const allSelected = items.length > 0 && selectedCount === items.length;
  const subtotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = selectedCount >= 2 ? 50 : 0;
  const shippingFee = subtotal > 0 ? 0 : 0;
  const total = Math.max(subtotal - discount + shippingFee, 0);

  const updateQuantity = (id: number, delta: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: Math.max(1, item.quantity + delta),
            }
          : item,
      ),
    );
  };

  const toggleItem = (id: number) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item)),
    );
  };

  const toggleAll = () => {
    setItems((prev) => prev.map((item) => ({ ...item, selected: !allSelected })));
  };

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const removeSelected = () => {
    setItems((prev) => prev.filter((item) => !item.selected));
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">
      <div className="mb-8 overflow-hidden rounded-3xl border border-orange-100 bg-gradient-to-r from-orange-50 via-amber-50 to-cyan-50 px-5 py-6 shadow-sm md:px-8 md:py-7">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-500">Your Bag</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
              Shopping Cart
            </h1>
            <p className="mt-2 text-sm text-slate-600 md:text-base">
              {selectedCount} selected products, {selectedUnits} units ready for checkout.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-white/80 px-4 py-2 text-xs font-bold text-slate-700 ring-1 ring-orange-100">
              Free shipping for all selected items
            </span>
            <span className="rounded-full bg-orange-500 px-4 py-2 text-xs font-bold text-white">
              Save {formatPrice(discount)} today
            </span>
          </div>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <span className="material-symbols-outlined text-5xl text-slate-300">shopping_cart</span>
          <p className="mt-4 text-xl font-bold text-slate-800">Your cart is empty</p>
          <p className="mt-2 text-slate-500">Add a few items and come back here to checkout.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="flex w-full flex-col gap-4 lg:w-2/3">
            <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <input
                checked={allSelected}
                className="h-5 w-5 cursor-pointer rounded border-slate-300 text-[#ff6a00] focus:ring-[#ff6a00]"
                type="checkbox"
                onChange={toggleAll}
              />
              <span className="text-base font-bold text-slate-900 md:text-lg">
                Select All ({items.length} products)
              </span>
              <button
                className="ml-auto flex items-center gap-1 rounded-full px-2 py-1 text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
                onClick={removeSelected}
                type="button"
              >
                <span className="material-symbols-outlined text-xl">delete</span>
                <span className="hidden text-xs font-semibold uppercase tracking-wide md:inline">
                  Delete Selected
                </span>
              </button>
            </div>

            {items.map((item) => (
              <div
                key={item.id}
                className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md md:p-5"
              >
                <div className="flex flex-col gap-4 md:flex-row">
                  <div className="flex items-start gap-3 md:gap-4">
                    <input
                      checked={item.selected}
                      className="mt-1 h-5 w-5 cursor-pointer rounded border-slate-300 text-[#ff6a00] focus:ring-[#ff6a00]"
                      type="checkbox"
                      onChange={() => toggleItem(item.id)}
                    />
                    <img
                      alt={item.name}
                      className="h-24 w-24 flex-shrink-0 rounded-xl bg-slate-100 object-cover md:h-32 md:w-32"
                      src={item.image}
                    />
                  </div>

                  <div className="flex flex-grow flex-col justify-between gap-4">
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-lg font-bold leading-tight text-slate-900">{item.name}</h3>
                        <button
                          className="text-slate-400 transition-colors hover:text-red-500"
                          onClick={() => removeItem(item.id)}
                          type="button"
                        >
                          <span className="material-symbols-outlined">close</span>
                        </button>
                      </div>
                      <p className="mt-1 text-sm text-slate-500">{item.variant}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {item.badge ? (
                          <span className="rounded-full bg-orange-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-orange-700">
                            {item.badge}
                          </span>
                        ) : null}
                        <span className="rounded-full bg-cyan-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-cyan-700">
                          In stock
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-400">Unit price</p>
                        <span className="text-3xl font-black text-[#ff6a00]">{formatPrice(item.price)}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-32 items-center rounded-xl border border-slate-300 bg-white">
                          <button
                            className="flex h-full w-10 items-center justify-center rounded-l-xl text-slate-600 transition-colors hover:bg-slate-100"
                            onClick={() => updateQuantity(item.id, -1)}
                            type="button"
                          >
                            <span className="material-symbols-outlined text-sm">remove</span>
                          </button>
                          <input
                            className="h-full w-12 border-none bg-transparent p-0 text-center text-xs font-bold text-slate-900 focus:ring-0"
                            readOnly
                            type="text"
                            value={item.quantity}
                          />
                          <button
                            className="flex h-full w-10 items-center justify-center rounded-r-xl text-slate-600 transition-colors hover:bg-slate-100"
                            onClick={() => updateQuantity(item.id, 1)}
                            type="button"
                          >
                            <span className="material-symbols-outlined text-sm">add</span>
                          </button>
                        </div>
                        <div className="min-w-24 text-right">
                          <p className="text-xs uppercase tracking-wide text-slate-400">Line total</p>
                          <p className="text-lg font-extrabold text-slate-900">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="w-full lg:w-1/3">
            <div className="sticky top-24 rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
              <h2 className="mb-1 text-2xl font-extrabold text-slate-900">Order Summary</h2>
              <p className="mb-6 text-sm text-slate-500">Secure checkout with encrypted payment.</p>

              <div className="mb-6 rounded-2xl bg-slate-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-slate-500">Subtotal ({selectedUnits} units)</span>
                  <span className="text-lg font-bold text-slate-900">{formatPrice(subtotal)}</span>
                </div>
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-slate-500">Shipping Fee</span>
                  <span className="text-lg font-bold text-emerald-600">
                    {shippingFee === 0 ? "Free" : formatPrice(shippingFee)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-cyan-700">
                  <span>Discount</span>
                  <span className="text-lg font-bold">-{formatPrice(discount)}</span>
                </div>
              </div>

              <div className="mb-6 border-t border-dashed border-slate-200 pt-4">
                <div className="mb-2 flex items-end justify-between">
                  <span className="text-slate-500">Total Amount</span>
                  <span className="text-4xl font-black text-[#ff6a00]">{formatPrice(total)}</span>
                </div>
                <p className="text-right text-sm text-slate-500">VAT included where applicable</p>
              </div>

              <div className="mb-6">
                <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-700">
                  Discount Code
                </label>
                <div className="flex gap-2">
                  <input
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#ff6a00] focus:ring-2 focus:ring-[#ff6a00]"
                    onChange={(event) => setDiscountCode(event.target.value)}
                    placeholder="Enter code"
                    type="text"
                    value={discountCode}
                  />
                  <button
                    className="rounded-xl border-2 border-[#ff6a00] px-4 py-3 text-xs font-bold uppercase tracking-wide text-[#ff6a00] transition-colors hover:bg-[#ff6a00] hover:text-white"
                    type="button"
                  >
                    Apply
                  </button>
                </div>
              </div>

              <button
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#ff6a00] py-4 text-lg font-bold text-white shadow-md transition-all hover:scale-[1.01] hover:shadow-xl active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                disabled={selectedCount === 0}
                type="button"
              >
                Proceed to Checkout
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
                <span className="material-symbols-outlined text-base text-emerald-600">verified_user</span>
                SSL secured payment gateway
              </div>
            </div>
          </div>
        </div>
      )}

      <section className="mt-14">
        <h2 className="mb-6 flex items-center gap-2 text-2xl font-extrabold text-slate-900">
          <span className="material-symbols-outlined text-[#ff6a00]">local_fire_department</span>
          Recommended for you
        </h2>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
          {recommendedItems.map((item) => (
            <div
              key={item.id}
              className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative mb-3 aspect-square w-full overflow-hidden rounded-xl bg-slate-100">
                <img
                  alt={item.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  src={item.image}
                />
              </div>
              <h3 className="mb-2 line-clamp-2 flex-grow text-base leading-snug text-slate-900">{item.name}</h3>
              <div className="mt-auto flex items-center justify-between">
                <span className="text-xl font-bold text-[#ff6a00]">{formatPrice(item.price)}</span>
                <button
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition-colors hover:bg-[#ff6a00] hover:text-white"
                  type="button"
                >
                  <span className="material-symbols-outlined text-sm">add_shopping_cart</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
