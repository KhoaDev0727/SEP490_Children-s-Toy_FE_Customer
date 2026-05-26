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
    <div className="flex-grow w-full h-full bg-slate-50 dark:bg-slate-950">
      <div className="max-w-[1280px] mx-auto w-full px-4 md:px-8 py-10">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <QRPaymentContent orderId={orderId} />
      </div>
      </div>
    </div>
  );
}
