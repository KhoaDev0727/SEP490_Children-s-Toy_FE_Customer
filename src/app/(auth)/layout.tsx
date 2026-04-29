import React from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-white flex lg:flex-row flex-col">
      {children}

      <div className="lg:w-1/2 w-full lg:min-h-screen hidden lg:flex items-center justify-center bg-[#ff6a00]">
        <div className="flex flex-col items-center max-w-xs px-10 text-center">

          {/* Logo icon */}
          <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center mb-8 shadow-sm">
            <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 4C10.716 4 4 10.716 4 19s6.716 15 15 15 15-6.716 15-15S27.284 4 19 4zm0 5a4 4 0 110 8 4 4 0 010-8zm0 21.5c-5 0-9.437-2.556-12-6.428C7.038 21.06 12.7 19 19 19s11.962 2.06 12 5.072c-2.563 3.872-7 6.428-12 6.428z" fill="#ff6a00"/>
            </svg>
          </div>

          {/* Brand name */}
          <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">ToyStore</h1>
          <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-6">
            Đồ chơi trẻ em chất lượng
          </p>

          {/* Divider */}
          <div className="w-12 h-0.5 bg-white/30 mb-6 rounded-full" />

        </div>
      </div>
    </div>
  );
}
