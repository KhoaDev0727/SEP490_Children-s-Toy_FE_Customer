import React from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const logoItems = [
    { src: "/assets/images/lego.png", alt: "Logo 1", className: "-translate-y-6" },
    {
      src: "/assets/images/mattel.jpg",
      alt: "Logo 2",
      className: "translate-y-6",
      sizeClass: "h-24 w-24",
    },
    {
      src: "/assets/images/tinitoy.png",
      alt: "Logo 3",
      className: "-translate-y-3",
      sizeClass: "h-38 w-38",
    },
    { src: "/assets/images/d.jpg", alt: "Logo 4", className: "translate-y-3" },
    { src: "/assets/images/lego.png", alt: "Logo 5", className: "-translate-y-1" },
    {
      src: "/assets/images/tinitoy.png",
      alt: "Logo 6",
      className: "translate-y-1",
      sizeClass: "h-38 w-38",
    },
  ];

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
          <div className="h-full w-full min-h-screen flex items-center justify-center p-6">
            <div className="grid w-full max-w-lg grid-cols-2 gap-6">
              {logoItems.map((item) => (
                <div
                  key={item.alt}
                  className={`flex h-32 w-full items-center justify-center rounded-3xl bg-white/85 shadow-[0_14px_34px_rgba(0,0,0,0.18)] ${item.className}`}
                >
                  <img
                    src={item.src}
                    alt={item.alt}
                    className={`${item.sizeClass ?? "h-20 w-20"} object-contain`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
