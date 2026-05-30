"use client";

import { useEffect } from "react";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function CustomerError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to console or tracking service
    console.error("Customer Segment Error:", error);
  }, [error]);

  return (
    <div
      className="relative flex flex-col items-center justify-center overflow-hidden py-16 md:py-24 px-4"
      style={{
        backgroundColor: "#fff8f6",
        color: "#261812",
        minHeight: "calc(100vh - 400px)", // Dynamic height to fit perfectly
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
      <div className="max-w-3xl mx-auto w-full flex flex-col items-center text-center gap-8 relative z-10">
        {/* Illustration Area */}
        <div
          className="relative w-full max-w-sm aspect-square flex items-center justify-center overflow-hidden"
          style={{
            borderRadius: "9999px",
            backgroundColor: "rgba(254,227,216,0.5)",
            border: "1px solid rgba(161,64,0,0.2)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
            marginBottom: "1rem",
          }}
        >
          <img
            alt="Under Repair"
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
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAsEnsvBSTIvQaevvFqLJ47k5fv1ZT98zyJRXG98GmC05hOu1miOIqJwYhp7Z78WkEr12x2SULvCGZVZCUlAoK-gv35foukjXGxura80kymxerIcztof-MNQnbgKFtwFGtrkQ_aeocIa4LwvdbumiXRZdNH2JzAqewxYs4OW9AzaBeHTmf6AS1o3bEA8bniy8dXQkkWRsmxPaMLUwr_GU_e5sGQzrlrtNKrLNUOxaZvvThKVln2FPCECL3Ws09egZpw2Ddn0ragSa8"
          />
          {/* Gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to top, #fff8f6 0%, transparent 50%, transparent 100%)",
            }}
          />
          {/* Error Tag */}
          <div
            className="absolute px-3 py-1 bg-red-100 text-red-700 rounded-full font-bold text-xs"
            style={{
              bottom: "2.5rem",
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              fontFamily: "Inter, sans-serif",
            }}
          >
            SYSTEM ERROR (500)
          </div>
        </div>

        {/* Text Content */}
        <div className="flex flex-col items-center gap-4 max-w-lg">
          <h2
            style={{
              fontSize: "28px",
              lineHeight: 1.2,
              letterSpacing: "-0.025em",
              fontWeight: 800,
              color: "#261812",
              fontFamily: "Inter, sans-serif",
            }}
          >
            The system is taking a short break.
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
            A technical issue occurred on our side. Our team is fixing it quickly. Please try again in a moment.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto px-6 py-3 font-semibold text-sm rounded-lg transition-all duration-200"
            style={{
              backgroundColor: "#ff6a00",
              color: "#ffffff",
              boxShadow: "0 4px 14px 0 rgba(255,106,0,0.39)",
              cursor: "pointer",
              border: "none",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(255,106,0,0.5)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 4px 14px 0 rgba(255,106,0,0.39)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            Try again now
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 font-semibold text-sm rounded-lg text-center transition-colors duration-200"
            style={{
              border: "2px solid rgba(90,65,54,0.3)",
              color: "#5a4136",
              backgroundColor: "transparent",
              textDecoration: "none",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255,106,0,0.05)";
              e.currentTarget.style.borderColor = "#ff6a00";
              e.currentTarget.style.color = "#ff6a00";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.borderColor = "rgba(90,65,54,0.3)";
              e.currentTarget.style.color = "#5a4136";
            }}
          >
            Go to homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
