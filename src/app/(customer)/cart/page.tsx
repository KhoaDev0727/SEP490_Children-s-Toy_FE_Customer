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

function formatPrice(value: number) {
  return `$${value.toFixed(2)}`;
}

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>(initialCartItems);
  const [discountCode, setDiscountCode] = useState("");

  const selectedItems = useMemo(() => items.filter((item) => item.selected), [items]);
  const selectedCount = selectedItems.length;
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
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-10">
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
          Shopping Cart
        </h1>
        <span className="text-sm md:text-base text-slate-500">{selectedCount} items selected</span>
      </div>

      {items.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl px-6 py-14 text-center shadow-sm">
          <span className="material-symbols-outlined text-5xl text-slate-300">shopping_cart</span>
          <p className="mt-3 text-lg font-semibold text-slate-800">Your cart is empty</p>
          <p className="mt-1 text-slate-500">Add a few items and come back here to checkout.</p>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-2/3 flex flex-col gap-3">
            <div className="bg-white rounded-xl p-4 flex items-center gap-4 border border-slate-200 shadow-sm">
              <input
                checked={allSelected}
                className="w-5 h-5 rounded border-slate-300 text-[#ff6a00] focus:ring-[#ff6a00] cursor-pointer"
                type="checkbox"
                onChange={toggleAll}
              />
              <span className="text-lg font-bold text-slate-900">Select All ({items.length} Items)</span>
              <button
                className="ml-auto flex items-center gap-1 text-red-500 hover:text-red-600 transition-colors"
                onClick={removeSelected}
                type="button"
              >
                <span className="material-symbols-outlined text-xl">delete</span>
                <span className="text-xs font-semibold uppercase tracking-wide hidden md:inline">
                  Delete Selected
                </span>
              </button>
            </div>

            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl p-4 md:p-6 flex flex-col md:flex-row gap-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative"
              >
                <div className="absolute top-4 left-4 md:static">
                  <input
                    checked={item.selected}
                    className="w-5 h-5 rounded border-slate-300 text-[#ff6a00] focus:ring-[#ff6a00] cursor-pointer"
                    type="checkbox"
                    onChange={() => toggleItem(item.id)}
                  />
                </div>

                <div className="flex flex-row gap-4 w-full ml-8 md:ml-0">
                  <img
                    alt={item.name}
                    className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-lg bg-slate-100 flex-shrink-0"
                    src={item.image}
                  />

                  <div className="flex flex-col flex-grow justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-3">
                        <h3 className="text-lg font-bold text-slate-900 leading-tight">{item.name}</h3>
                        <button
                          className="text-slate-500 hover:text-red-500 transition-colors hidden md:block"
                          onClick={() => removeItem(item.id)}
                          type="button"
                        >
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </div>
                      <p className="text-sm text-slate-500 mt-1">{item.variant}</p>
                      {item.badge ? (
                        <span className="inline-block mt-2 px-2 py-1 bg-orange-100 text-orange-700 text-[10px] rounded uppercase font-bold tracking-wide">
                          {item.badge}
                        </span>
                      ) : null}
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3 mt-4">
                      <span className="text-3xl font-black text-[#ff6a00]">{formatPrice(item.price)}</span>
                      <div className="flex items-center border border-slate-300 rounded-lg bg-white h-10 w-32">
                        <button
                          className="w-10 h-full flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded-l-lg transition-colors"
                          onClick={() => updateQuantity(item.id, -1)}
                          type="button"
                        >
                          <span className="material-symbols-outlined text-sm">remove</span>
                        </button>
                        <input
                          className="w-12 h-full text-center border-none bg-transparent text-xs font-bold text-slate-900 focus:ring-0 p-0"
                          readOnly
                          type="text"
                          value={item.quantity}
                        />
                        <button
                          className="w-10 h-full flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded-r-lg transition-colors"
                          onClick={() => updateQuantity(item.id, 1)}
                          type="button"
                        >
                          <span className="material-symbols-outlined text-sm">add</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="w-full lg:w-1/3">
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-lg sticky top-24">
              <h2 className="text-2xl font-extrabold text-slate-900 mb-6">Order Summary</h2>

              <div className="flex flex-col gap-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Subtotal ({selectedCount} items)</span>
                  <span className="text-xl font-bold text-slate-900">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Shipping Fee</span>
                  <span className="text-xl font-bold text-slate-900">{formatPrice(shippingFee)}</span>
                </div>
                <div className="flex justify-between items-center text-cyan-700">
                  <span>Discount</span>
                  <span className="text-xl font-bold">-{formatPrice(discount)}</span>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4 mb-6">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-slate-500">Total Amount</span>
                  <span className="text-4xl font-black text-[#ff6a00]">{formatPrice(total)}</span>
                </div>
                <p className="text-sm text-slate-500 text-right">VAT included where applicable</p>
              </div>

              <div className="mb-6">
                <label className="text-xs font-bold uppercase tracking-wide text-slate-700 block mb-2">
                  Discount Code
                </label>
                <div className="flex gap-2">
                  <input
                    className="w-full rounded-lg bg-white border border-slate-300 px-4 py-3 text-sm focus:ring-2 focus:ring-[#ff6a00] focus:border-[#ff6a00] outline-none"
                    onChange={(event) => setDiscountCode(event.target.value)}
                    placeholder="Enter code"
                    type="text"
                    value={discountCode}
                  />
                  <button
                    className="px-4 py-3 rounded-lg border-2 border-[#ff6a00] text-[#ff6a00] text-xs font-bold uppercase tracking-wide hover:bg-[#ff6a00] hover:text-white transition-colors"
                    type="button"
                  >
                    Apply
                  </button>
                </div>
              </div>

              <button
                className="w-full bg-[#ff6a00] text-white text-lg font-bold py-4 rounded-xl shadow-md hover:shadow-xl hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                disabled={selectedCount === 0}
                type="button"
              >
                Proceed to Checkout
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="mt-14">
        <h2 className="text-2xl font-extrabold text-slate-900 mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#ff6a00]">local_fire_department</span>
          Recommended for you
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {recommendedItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl p-3 border border-slate-200 hover:shadow-xl hover:scale-105 transition-all duration-300 group cursor-pointer flex flex-col h-full"
            >
              <div className="relative w-full aspect-square mb-3 rounded-lg overflow-hidden bg-slate-100">
                <img
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  src={item.image}
                />
              </div>
              <h3 className="text-base text-slate-900 leading-snug line-clamp-2 mb-2 flex-grow">{item.name}</h3>
              <div className="flex items-center justify-between mt-auto">
                <span className="text-xl font-bold text-[#ff6a00]">{formatPrice(item.price)}</span>
                <button
                  className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center hover:bg-[#ff6a00] hover:text-white transition-colors"
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

