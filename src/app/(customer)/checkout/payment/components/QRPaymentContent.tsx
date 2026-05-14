"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState, startTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import QRCodeCard from "@/app/(customer)/checkout/payment/components/QRCodeCard";
import PaymentPanel from "@/app/(customer)/checkout/payment/components/PaymentPanel";
import { checkoutApi } from "@/features/checkout/services/checkout-api";

const BANK_NAME = process.env.NEXT_PUBLIC_SEPAY_BANK_NAME ?? "Bank";
const BANK_CODE = process.env.NEXT_PUBLIC_SEPAY_BANK_CODE ?? "";
const ACCOUNT_NUMBER = process.env.NEXT_PUBLIC_SEPAY_ACCOUNT_NUMBER ?? "";
const ACCOUNT_NAME = process.env.NEXT_PUBLIC_SEPAY_ACCOUNT_NAME ?? "";
const QR_TEMPLATE = process.env.NEXT_PUBLIC_SEPAY_QR_TEMPLATE ?? "";

const sepayStorageKey = (orderId: number) => `sepay_checkout_${orderId}`;

const buildSepayQrUrl = (params: {
  accountNumber: string;
  bankCode: string;
  amount?: number | null;
  content?: string | null;
  template?: string | null;
}) => {
  if (!params.accountNumber || !params.bankCode) return "";

  const query = new URLSearchParams({
    acc: params.accountNumber,
    bank: params.bankCode,
  });

  if (params.amount && params.amount > 0) query.set("amount", String(params.amount));
  if (params.content) query.set("des", params.content);
  if (params.template) query.set("template", params.template);

  return `https://qr.sepay.vn/img?${query.toString()}`;
};

interface QRPaymentContentProps {
  orderId?: number;
  orderCode?: string;
  amount?: number;
  /** Attempt code từ backend (SPX_{orderCode}_{uid8}) */
  initialAttemptCode?: string;
  /** QR image URL từ backend */
  initialQrUrl?: string;
}

export default function QRPaymentContent({
  orderId,
  orderCode,
  amount,
  initialAttemptCode,
  initialQrUrl,
}: QRPaymentContentProps) {
  const router = useRouter();
  const [attemptCode, setAttemptCode] = useState(initialAttemptCode ?? "");
  const [qrUrl, setQrUrl] = useState(initialQrUrl ?? "");
  const [amountValue, setAmountValue] = useState<number | null>(
    Number.isFinite(amount) ? Math.round(amount as number) : null,
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const redirectedRef = useRef(false);

  /** Tránh gọi retryPayment 2 lần (React Strict Mode / deps) cho cùng một orderId khi thiếu QR. */
  const hydrateStartedForOrderRef = useRef<number | null>(null);

  useEffect(() => {
    startTransition(() => {
      if (initialAttemptCode) setAttemptCode(initialAttemptCode);
      if (initialQrUrl) setQrUrl(initialQrUrl);
      if (Number.isFinite(amount)) setAmountValue(Math.round(amount as number));
    });
  }, [amount, initialAttemptCode, initialQrUrl]);

  // Bổ sung từ sessionStorage (OrderSummary lưu sau confirm — tránh URL quá dài)
  useLayoutEffect(() => {
    if (typeof window === "undefined" || !orderId) return;
    try {
      const raw = window.sessionStorage.getItem(sepayStorageKey(orderId));
      if (!raw) return;
      const p = JSON.parse(raw) as { attemptCode?: string; qrUrl?: string };
      startTransition(() => {
        setAttemptCode((prev) => prev || p.attemptCode || "");
        setQrUrl((prev) => prev || p.qrUrl || "");
      });
    } catch {
      /* ignore */
    }
  }, [orderId]);

  const normalizedAmount = amountValue && amountValue > 0 ? amountValue : null;

  useEffect(() => {
    if (!orderId) return;
    // Nếu đã có attemptCode và amount thì có thể tự build QR, không cần gọi server tạo thêm record mới
    if (attemptCode && normalizedAmount) return;
    if (qrUrl && normalizedAmount) return;
    if (hydrateStartedForOrderRef.current === orderId) return;
    hydrateStartedForOrderRef.current = orderId;

    let cancelled = false;
    const hydrateFromServer = async () => {
      setIsRefreshing(true);
      try {
        const res = await checkoutApi.retryPayment(orderId);
        if (cancelled) return;
        setAttemptCode(res.paymentAttemptCode);
        setQrUrl(res.qrImageUrl);
        setAmountValue(Math.round(res.totalAmount));
      } catch (err) {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : "Unable to retrieve payment information.";
        toast.error(msg);
      } finally {
        if (!cancelled) setIsRefreshing(false);
      }
    };

    void hydrateFromServer();
    return () => {
      cancelled = true;
    };
  }, [attemptCode, orderId, normalizedAmount, qrUrl]);

  useEffect(() => {
    if (!orderId || redirectedRef.current) return;

    const checkStatus = async () => {
      try {
        const res = await checkoutApi.getPaymentStatus(orderId);
        if (res.paymentStatus === "PAID") {
          redirectedRef.current = true;
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
          }
          const resolvedOrderCode = orderCode || res.orderCode || "";
          router.replace(
            `/checkout/success?orderId=${orderId}&orderCode=${encodeURIComponent(resolvedOrderCode)}`,
          );
        }
      } catch {
        // Silent retry; avoid toast spam while polling
      }
    };

    void checkStatus();
    pollingRef.current = setInterval(checkStatus, 4000);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [orderCode, orderId, router]);

  const qrImageUrl = useMemo(() => {
    if (qrUrl) return qrUrl;
    return buildSepayQrUrl({
      accountNumber: ACCOUNT_NUMBER,
      bankCode: BANK_CODE,
      amount: normalizedAmount,
      content: attemptCode || orderCode || "",
      template: QR_TEMPLATE || null,
    });
  }, [attemptCode, normalizedAmount, orderCode, qrUrl]);

  if (!qrImageUrl) {
    return (
      <>
        <div className="flex flex-col items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-lg p-8 gap-3 w-full min-h-[420px]">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Loading QR</p>
          <p className="text-sm text-slate-500">Please wait a moment...</p>
        </div>
        <div className="flex flex-col items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-lg p-8 gap-3 w-full min-h-[420px]">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Payment information</p>
          <p className="text-sm text-slate-500">Fetching payment information...</p>
        </div>
      </>
    );
  }

  const handleRefresh = async () => {
    if (!orderId) return;
    setIsRefreshing(true);
    try {
      const res = await checkoutApi.retryPayment(orderId);
      setAttemptCode(res.paymentAttemptCode);
      setQrUrl(res.qrImageUrl);
      setAmountValue(Math.round(res.totalAmount));
      toast.success("New QR code generated.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unable to generate a new QR code.";
      toast.error(msg);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!orderId) return;
    try {
      const res = await checkoutApi.getPaymentStatus(orderId);
      if (res.paymentStatus === "PAID") {
        toast.success("Payment successful!");
        const resolvedOrderCode = orderCode || res.orderCode || "";
        router.replace(
          `/checkout/success?orderId=${orderId}&orderCode=${encodeURIComponent(resolvedOrderCode)}`,
        );
      } else {
        toast.error("The system has not received payment yet. Please wait a little longer.");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unable to check status.";
      toast.error(msg);
    }
  };

  const handleCancelOrder = async () => {
    if (!orderId) return;
    if (!window.confirm("Are you sure you want to cancel this transaction and return to cart?")) return;
    try {
      await checkoutApi.cancelOrder(orderId, "Customer cancelled on QR page");
      toast.success("Transaction cancelled.");
      router.push("/cart");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unable to cancel order.";
      toast.error(msg);
    }
  };

  return (
    <>
      <QRCodeCard qrUrl={qrImageUrl} onRefresh={handleRefresh} isRefreshing={isRefreshing} />
      <PaymentPanel
        bankName={BANK_NAME}
        accountNumber={ACCOUNT_NUMBER}
        accountName={ACCOUNT_NAME}
        amount={normalizedAmount ?? 0}
        content={attemptCode || orderCode || ""}
        onConfirm={handleConfirmPayment}
        onCancel={handleCancelOrder}
      />
    </>
  );
}
