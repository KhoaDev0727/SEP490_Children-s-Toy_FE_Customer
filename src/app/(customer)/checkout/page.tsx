import type { Metadata } from "next";
import Link from "next/link";
import CheckoutClient from "@/app/(customer)/checkout/components/CheckoutClient";

export const metadata: Metadata = {
  title: "Checkout — ShopX Direct",
  description: "Complete your order quickly and securely.",
};

const breadcrumbs = [
  { label: "Home", href: "/" },
  { label: "Cart", href: "/cart" },
  { label: "Checkout", href: "/checkout" },
];

export default function CheckoutPage() {
  return (
    <div className="flex-grow w-full bg-[#fafafa] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">

        {/* ── Breadcrumb ──────────────────────────────────── */}
        <nav aria-label="breadcrumb" className="mb-6">
          <ol className="flex items-center gap-2 text-xs text-gray-400 font-medium">
            {breadcrumbs.map((crumb, i) => (
              <li key={crumb.href} className="flex items-center gap-2">
                {i > 0 && (
                  <svg className="w-3.5 h-3.5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
                {i < breadcrumbs.length - 1 ? (
                  <Link
                    href={crumb.href}
                    className="hover:text-[#ff6a00] transition-colors"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-gray-700 font-semibold">{crumb.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>

        {/* ── Page Header ─────────────────────────────────── */}
        <div className="mb-7 pb-5 border-b border-gray-200">
          <h1 className="text-3xl font-black tracking-tight text-gray-900">Checkout</h1>
          <p className="text-sm text-gray-400 mt-1 font-medium">
            Complete your info to place your order — just a few seconds 🚀
          </p>
        </div>

        {/* ── Stepper ─────────────────────────────────────── */}
        <div className="flex items-center gap-0 mb-8 max-w-md">
          {[
            { label: "Cart", done: true },
            { label: "Information", done: false, active: true },
            { label: "Confirm", done: false },
          ].map((step, i) => (
            <div key={step.label} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all ${
                    step.done
                      ? "bg-green-500 border-green-500 text-white"
                      : step.active
                      ? "bg-[#ff6a00] border-[#ff6a00] text-white shadow-[0_0_0_3px_rgba(255,106,0,0.15)]"
                      : "bg-white border-gray-200 text-gray-300"
                  }`}
                >
                  {step.done ? (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : i + 1}
                </div>
                <span className={`text-[10px] font-bold mt-1 tracking-wide ${step.active ? "text-[#ff6a00]" : step.done ? "text-green-500" : "text-gray-300"}`}>
                  {step.label}
                </span>
              </div>
              {i < 2 && (
                <div className={`h-0.5 w-12 mx-1.5 mb-4 rounded ${step.done ? "bg-green-400" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>

        {/* ── Main layout: Form (left) + Summary (right) ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8">
          <CheckoutClient />
        </div>
      </div>
    </div>
  );
}
