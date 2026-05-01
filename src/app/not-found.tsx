"use client";
import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col relative font-sans"
      style={{
        backgroundColor: "#fff8f6",
        color: "#261812",
      }}
    >
      {/* Background Texture */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          opacity: 0.03,
          mixBlendMode: "multiply",
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center relative z-10 px-4 py-24">
        <div className="max-w-3xl mx-auto w-full flex flex-col items-center text-center gap-8">

          {/* Illustration Area */}
          <div
            className="relative w-full max-w-md aspect-square flex items-center justify-center overflow-hidden"
            style={{
              borderRadius: "9999px",
              backgroundColor: "rgba(254,227,216,0.5)",
              border: "1px solid rgba(161,64,0,0.2)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
              marginBottom: "1rem",
            }}
          >
            <img
              alt="Lost Toy"
              className="w-full h-full object-cover"
              style={{
                mixBlendMode: "luminosity",
                opacity: 0.8,
                transition: "transform 0.7s ease-in-out",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLImageElement).style.transform = "scale(1.05)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLImageElement).style.transform = "scale(1)")
              }
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuABwAA8INjur86IwEPOknexattg31hGRFsmDQbjTn_AtdO0emwhtraSCOzAEKpm7jov6_m72Y9Fn-O-rl9jRGnABVxIiK40ecDdQ5KsTsZg_W4YKrFo5QaZJCKTv8aBlYXWh0o205ROtFV5s_Au5SyjagDP6q-CmxX2qtkbpyorrAsvTOjZtNFZmyyeFksYpLvOMTsqPyRCroW_lWfXkCzz0Zv7rDXicj2p69H_VQ3geAk_2l42dQHAaqqQ9uTcaDHkrKkhLQXFLf8"
            />
            {/* Gradient overlay */}
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(to top, #fff8f6 0%, transparent 50%, transparent 100%)",
              }}
            />
            {/* 404 text */}
            <h1
              className="absolute"
              style={{
                bottom: "2rem",
                fontSize: "60px",
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
                fontWeight: 900,
                color: "#ff6a00",
                filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.2))",
                fontFamily: "Inter, sans-serif",
              }}
            >
              404
            </h1>
          </div>

          {/* Text Content */}
          <div className="flex flex-col items-center gap-4 max-w-lg">
            <h2
              style={{
                fontSize: "30px",
                lineHeight: 1.2,
                letterSpacing: "-0.025em",
                fontWeight: 800,
                color: "#261812",
                fontFamily: "Inter, sans-serif",
              }}
            >
              Oops! Trang này đã đi chơi mất rồi.
            </h2>
            <p
              style={{
                fontSize: "14px",
                lineHeight: 1.5,
                fontWeight: 400,
                color: "#5a4136",
                maxWidth: "28rem",
                fontFamily: "Inter, sans-serif",
              }}
            >
              Chúng tôi không tìm thấy nội dung bạn yêu cầu. Đừng lo, hãy quay
              về trang chủ để tiếp tục khám phá thế giới đồ chơi nhé!
            </p>
          </div>

          {/* CTA Button */}
          <div style={{ marginTop: "1rem" }}>
            <Link
              href="/"
              className="inline-flex items-center gap-2"
              style={{
                backgroundColor: "#ff6a00",
                color: "#ffffff",
                fontSize: "14px",
                fontWeight: 600,
                fontFamily: "Inter, sans-serif",
                padding: "1rem 2rem",
                borderRadius: "0.5rem",
                boxShadow: "0 4px 14px 0 rgba(255,106,0,0.39)",
                textDecoration: "none",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                  "0 6px 20px rgba(255,106,0,0.5)";
                (e.currentTarget as HTMLAnchorElement).style.transform =
                  "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                  "0 4px 14px 0 rgba(255,106,0,0.39)";
                (e.currentTarget as HTMLAnchorElement).style.transform =
                  "translateY(0)";
              }}
            >
              {/* Home icon (Material Symbols fallback using SVG) */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="20"
                viewBox="0 -960 960 960"
                width="20"
                fill="currentColor"
              >
                <path d="M160-120v-480l320-240 320 240v480H560v-280H400v280H160Z" />
              </svg>
              Quay về trang chủ
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        className="w-full mt-auto"
        style={{
          backgroundColor: "#f8fafc",
          borderTop: "1px solid #e2e8f0",
          maxWidth: "1280px",
          margin: "auto",
          padding: "3rem 2rem",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1.5rem",
          position: "relative",
          zIndex: 10,
        }}
      >
        <div
          style={{
            fontWeight: 700,
            color: "#0f172a",
            fontSize: "1.125rem",
            fontFamily: "Inter, sans-serif",
          }}
        >
          ShopX Velocity
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem", justifyContent: "center" }}>
          {["Support", "Privacy Policy", "Shipping Info", "Returns"].map((item) => (
            <Link
              key={item}
              href="#"
              style={{
                fontSize: "0.875rem",
                fontWeight: 500,
                color: "#64748b",
                textDecoration: "none",
                opacity: 0.8,
                transition: "all 0.2s",
                fontFamily: "Inter, sans-serif",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color = "#ea580c";
                (e.currentTarget as HTMLAnchorElement).style.textDecoration = "underline";
                (e.currentTarget as HTMLAnchorElement).style.opacity = "1";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color = "#64748b";
                (e.currentTarget as HTMLAnchorElement).style.textDecoration = "none";
                (e.currentTarget as HTMLAnchorElement).style.opacity = "0.8";
              }}
            >
              {item}
            </Link>
          ))}
        </div>

        <div
          style={{
            fontSize: "0.875rem",
            fontWeight: 500,
            color: "#64748b",
            textAlign: "right",
            fontFamily: "Inter, sans-serif",
          }}
        >
          © 2024 ShopX Velocity. Play hard, shop fast.
        </div>
      </footer>
    </div>
  );
}