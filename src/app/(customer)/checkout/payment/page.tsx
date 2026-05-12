import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import QRPaymentContent from "@/app/(customer)/checkout/payment/components/QRPaymentContent";

export const metadata: Metadata = {
  title: "Thanh toán QR — ShopX Velocity",
  description: "Quét mã QR để hoàn tất đơn hàng của bạn.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

// ─── Breadcrumb ────────────────────────────────────────────────────────────────
function Breadcrumb() {
  const crumbs = [
    { label: "Trang chủ", href: "/" },
    { label: "Đơn hàng", href: "/profile" },
    { label: "Thanh toán", href: "/checkout" },
    { label: "QR Payment", href: null },
  ];

  return (
    <nav aria-label="breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-400 mb-8">
      {crumbs.map((crumb, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && (
            <svg className="w-3 h-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
          {crumb.href ? (
            <Link
              href={crumb.href}
              className="hover:text-orange-500 transition-colors font-medium"
            >
              {crumb.label}
            </Link>
          ) : (
            <span className="text-slate-700 dark:text-slate-200 font-semibold">
              {crumb.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}

// ─── Order Summary Badge ────────────────────────────────────────────────────────
interface QRPaymentPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function OrderBadge({ orderCode }: { orderCode?: string }) {
  const displayOrderCode = orderCode?.trim() || "SPX_MADONHANG";
  return (
    <div className="inline-flex items-center gap-2 bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 rounded-full px-4 py-1.5 mb-4">
      <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
      <span className="text-xs font-bold text-orange-700 dark:text-orange-400 uppercase tracking-widest">
        Chờ thanh toán
      </span>
      <span className="text-xs text-slate-500 dark:text-slate-400">
        · Đơn hàng{" "}
        <span className="font-mono font-semibold text-slate-700 dark:text-slate-200">
          #{displayOrderCode}
        </span>
      </span>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default async function QRPaymentPage({ searchParams }: QRPaymentPageProps) {
  const resolvedParams = await searchParams;
  const orderId   = typeof resolvedParams?.orderId === "string" ? Number(resolvedParams.orderId) : undefined;
  const orderCode = typeof resolvedParams?.orderCode === "string" ? resolvedParams.orderCode : undefined;
  const amount    = typeof resolvedParams?.amount === "string" ? Number(resolvedParams.amount) : undefined;
  const attemptCode = typeof resolvedParams?.attemptCode === "string" ? resolvedParams.attemptCode : undefined;
  const qrUrl     = typeof resolvedParams?.qrUrl === "string" ? decodeURIComponent(resolvedParams.qrUrl) : undefined;

  return (
    <div className="max-w-[1280px] mx-auto w-full px-4 md:px-8 py-10 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <Breadcrumb />

      {/* Page heading */}
      <div className="mb-8">
        <OrderBadge orderCode={orderCode} />
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
          Thanh Toán Đơn Hàng
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md">
          Quét mã QR bằng App ngân hàng hoặc chuyển khoản theo thông tin bên dưới để hoàn tất đơn hàng.
        </p>
      </div>

      {/* 2-col grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <QRPaymentContent
          orderId={orderId}
          orderCode={orderCode}
          amount={amount}
          initialAttemptCode={attemptCode}
          initialQrUrl={qrUrl}
        />
      </div>

      {/* Security note */}
      <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400">
        <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
        <span>Giao dịch được mã hóa SSL 256-bit · Hỗ trợ tất cả ngân hàng Việt Nam</span>
      </div>
    </div>
  );
}
