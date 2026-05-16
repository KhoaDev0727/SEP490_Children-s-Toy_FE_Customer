"use client";
export default function HeroBanner() {
  return (
    <section className="relative rounded-2xl overflow-hidden min-h-[300px]" style={{ aspectRatio: "21/9" }}>
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuB2j67Iqa0lXKzfydFk2yBQ7Wa3CLNiUe9qRFiwXa0YqArQQbaNLn1XFFRvyvZZyLeRK24wf-Lg339v_EeXfvNb6D_8pfTk18Lgm0ke3N30gqHdcamUx19XPvFHjeQETQIYuMkhazZ0vbMnlrEWoTQY5Zhif_6LctcDar3vwSN8ndtK2isn0CXGpzhCqMkKOUNYYfL5dFF1XhlM3O0YXQ-vqVwVT0iYJzpWJpKWr7Qg5J8aasXZ6dl9CpKZb8JpFpbwUvMZXFK5UZk')`,
        }}
      />
      <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16 text-white"
        style={{ background: "linear-gradient(to right, rgba(0,0,0,0.7), rgba(0,0,0,0.4), transparent)" }}
      >
        <span className="font-bold uppercase tracking-widest text-sm mb-2" style={{ color: "#ff6a00" }}>
          New Collection 2024
        </span>
        <h2 className="text-4xl md:text-6xl font-black mb-4 leading-tight">
          Fashion <br />Shine This Fall
        </h2>
        <p className="text-lg md:text-xl text-slate-200 mb-8 max-w-md">
          Up to 50% off all latest designs. Elevate your style today.
        </p>
        <div className="flex gap-4">
          <button
            className="text-white px-8 py-3 rounded-lg font-bold transition-all shadow-lg"
            style={{ backgroundColor: "#ff6a00" }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Buy Now
          </button>
          <button
            className="text-white border px-8 py-3 rounded-lg font-bold transition-all"
            style={{
              backgroundColor: "rgba(255,255,255,0.1)",
              borderColor: "rgba(255,255,255,0.3)",
              backdropFilter: "blur(8px)",
            }}
          >
            Explore
          </button>
        </div>
      </div>
    </section>
  );
}
