"use client";

import Image from "next/image";
import logoImage from "@/assets/image/Logo/Logo.png";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Academic Disclaimer Banner (TOP) */}
        <div className="w-full p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 shadow-xs flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left transition-all hover:shadow-md mb-8">
          <div className="w-9 h-9 rounded-xl bg-[#ff6a00] text-white flex items-center justify-center shrink-0 shadow-sm">
            <span className="material-symbols-outlined text-xl">info</span>
          </div>
          <p className="text-sm sm:text-base font-medium text-amber-950 leading-relaxed">
            <span className="font-bold text-[#ff6a00]">Lưu ý:</span> Website được xây dựng phục vụ mục đích học tập và bảo vệ đồ án. Hình ảnh sản phẩm và nhãn hiệu thuộc quyền sở hữu của các chủ sở hữu tương ứng.
          </p>
        </div>

        {/* Divider Line & Footer Content (BOTTOM) */}
        <div className="pt-8 border-t border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Brand */}
            <div className="col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="rounded-lg text-white" style={{ backgroundColor: "#ff6a00" }}>
                  <Image
                    src={logoImage}
                    alt="Children's Toy Store Logo"
                    width={40}
                    height={40}
                    className="rounded-lg"
                  />
                </div>
                <h2 className="text-lg font-bold text-slate-900">children's toy store</h2>
              </div>
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                Safe, fun, and high-quality toys designed for every stage of childhood.
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

            {/* About children's toy store */}
            <div>
              <h4 className="font-bold text-slate-900 mb-4">About children's toy store</h4>
              <p className="text-sm text-slate-500 leading-relaxed">
                children's toy store offers safe, creative, and educational toys that make learning fun and support
                healthy development as children grow.
              </p>
            </div>

            {/* Commitment */}
            <div>
              <h4 className="font-bold text-slate-900 mb-4">Our Commitment</h4>
              <p className="text-sm text-slate-500 leading-relaxed">
                Every product is carefully selected for trusted quality, child-safe materials, and clear
                origin, so parents can shop with confidence.
              </p>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-bold text-slate-900 mb-4">Customer Support</h4>
              <p className="text-sm text-slate-500 leading-relaxed">
                Need help with orders, products, or delivery? Contact{" "}
                <a href="mailto:lorkingdom.service@gmail.com" className="text-[#ff6a00] hover:underline">
                  lorkingdom.service@gmail.com
                </a>{" "}
                and our team will get back to you as quickly as possible.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

