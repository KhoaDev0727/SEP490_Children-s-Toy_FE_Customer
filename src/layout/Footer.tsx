"use client";
export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 rounded-lg text-white" style={{ backgroundColor: "#ff6a00" }}>
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>shopping_bag</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900">ShopX</h2>
            </div>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              A leading online shopping platform delivering great experiences and top-quality products.
            </p>
            <div className="flex gap-4">
              {["public", "share", "alternate_email"].map((icon) => (
                <a
                  key={icon}
                  href="#"
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#ff6a00";
                    e.currentTarget.style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#f1f5f9";
                    e.currentTarget.style.color = "#475569";
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Shopping */}
          <div>
            <h4 className="font-bold text-slate-900 mb-4">Shopping</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              {["New arrivals", "Best sellers", "Men's collection", "Women's collection"].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="transition-colors hover:text-[#ff6a00]"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold text-slate-900 mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              {[
                "Help center",
                "Shipping policy",
                "Returns & refunds",
                "Order tracking",
              ].map((item) => (
                <li key={item}>
                  <a href="#" className="transition-colors hover:text-[#ff6a00]">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-bold text-slate-900 mb-4">Newsletter</h4>
            <p className="text-sm text-slate-500 mb-4">Get our latest offers and updates.</p>
            <div className="flex gap-2">
              <input
                className="flex-1 px-4 py-2 bg-slate-100 border-none rounded-lg text-sm outline-none"
                placeholder="Your email"
                type="email"
              />
              <button
                className="text-white px-4 py-2 rounded-lg font-bold text-sm"
                style={{ backgroundColor: "#ff6a00" }}
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <p>© 2024 ShopX. All rights reserved.</p>
          <div className="flex gap-6">
            {["Terms", "Privacy", "Cookies"].map((item) => (
              <a key={item} href="#" className="hover:text-[#ff6a00] transition-colors">{item}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
