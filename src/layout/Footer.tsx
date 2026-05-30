"use client";

import Image from "next/image";
import logoImage from "@/assets/image/Logo/Logo.png";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="rounded-lg text-white" style={{ backgroundColor: "#ff6a00" }}>
                <Image
                  src={logoImage}
                  alt="Toy Store Logo"
                  width={40}
                  height={40}
                  className="rounded-lg"
                />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Toy Store</h2>
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

          {/* About ToyStore */}
          <div>
            <h4 className="font-bold text-slate-900 mb-4">About ToyStore</h4>
            <p className="text-sm text-slate-500 leading-relaxed">
              ToyStore offers safe, creative, and educational toys that make learning fun and support
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

        {/* Bottom */}
        <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <p>© 2026 Toy Store. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

