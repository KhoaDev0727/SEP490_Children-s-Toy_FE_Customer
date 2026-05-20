import React from "react";
import type { Metadata } from "next";
import QRPaymentContent from "@/app/(customer)/checkout/payment/components/QRPaymentContent";

export const metadata: Metadata = {
  title: "Checkout QR — Toy Store Velocity",
  description: "Scan the QR code to complete your order.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

// ─── Page ──────────────────────────────────────────────────────────────────────
interface QRPaymentPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function QRPaymentPage({ searchParams }: QRPaymentPageProps) {
  const resolvedParams = await searchParams;
  const orderId = typeof resolvedParams?.orderId === "string" ? Number(resolvedParams.orderId) : undefined;

  return (
    <div className="max-w-[1280px] mx-auto w-full px-4 md:px-8 py-10 bg-slate-50 dark:bg-slate-950 min-h-screen">
      {/* Page heading */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 rounded-full px-4 py-1.5 mb-4">
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          <span className="text-xs font-bold text-orange-700 dark:text-orange-400 uppercase tracking-widest">
            Awaiting Payment
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
          Order Payment
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md">
          Scan the QR code with your banking app or transfer using the details below to complete your order.
        </p>
      </div>

      {/* 2-col grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <QRPaymentContent orderId={orderId} />
      </div>

      {/* Security note */}
      <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400">
        <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
        <span>Transactions are encrypted with 256-bit SSL · Supports all Vietnamese banks</span>
      </div>
    </div>
  );
}
