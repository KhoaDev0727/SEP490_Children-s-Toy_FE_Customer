import React from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#ff6a00]">
      <div className="flex min-h-screen">
        <div className="w-full lg:w-3/5">
          <div className="min-h-screen bg-white/95 shadow-[0_24px_60px_rgba(0,0,0,0.18)]">
            <div className="mx-auto w-full max-w-md">
              {children}
            </div>
          </div>
        </div>
        <div className="hidden lg:block lg:w-2/5">
          <div className="h-full w-full min-h-screen flex items-center justify-center p-4">
            <img
              src="/assets/images/lego.jpg"
              alt="ToyStore auth"
              className="max-h-screen w-full object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
