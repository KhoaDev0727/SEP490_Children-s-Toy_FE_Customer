import type { Metadata } from "next";
import Link from "next/link";
import CheckoutClient from "@/app/(customer)/checkout/components/CheckoutClient";

export const metadata: Metadata = {
  title: "Checkout — Toy Store Direct",
  description: "Complete your order quickly and securely.",
};

const breadcrumbs = [
  { label: "Home", href: "/" },
  { label: "Cart", href: "/cart" },
  { label: "Checkout", href: "/checkout" },
];

export default function CheckoutPage() {
  return (
    <div className="flex-grow w-full bg-[#fafafa  ] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">

        {/* ── Breadcrumb ──────────────────────────────────── */}
        <nav aria-label="breadcrumb" className="mb-6">
          <ol className="flex items-center gap-2 text-xs text-gray-500 font-semibold">
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
                    className="hover:text-[#ff4f00] transition-colors"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-gray-900 font-extrabold">{crumb.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>

        {/* ── Page Header ───────────────────────────────────
        <div className="mb-8 pb-5 border-b border-gray-200">
          <h1 className="text-3xl font-black tracking-tight text-gray-900">Checkout</h1>
        </div> */}


        {/* ── Main layout: Form (left) + Summary (right) ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8">
          <CheckoutClient />
        </div>
      </div>
    </div>
  );
}
