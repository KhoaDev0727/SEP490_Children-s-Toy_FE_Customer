"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import QRCodeCard from "@/app/(customer)/checkout/payment/components/QRCodeCard";
import PaymentPanel from "@/app/(customer)/checkout/payment/components/PaymentPanel";
import ConfirmModal from "@/components/common/ConfirmModal";
import { checkoutApi } from "@/features/checkout/services/checkout-api";
import { useCart } from "@/features/cart/context/CartContext";
import { useNotificationRealtime } from "@/features/notifications/context/NotificationRealtimeContext";

const BANK_NAME = process.env.NEXT_PUBLIC_SEPAY_BANK_NAME ?? "Bank";
const ACCOUNT_NUMBER = process.env.NEXT_PUBLIC_SEPAY_ACCOUNT_NUMBER ?? "";
const ACCOUNT_NAME = process.env.NEXT_PUBLIC_SEPAY_ACCOUNT_NAME ?? "";

interface QRPaymentContentProps {
  orderId?: number;
}

export default function QRPaymentContent({ orderId }: QRPaymentContentProps) {
  const router = useRouter();
  const { refreshCart } = useCart();
  const { connection } = useNotificationRealtime();

  // Payment info — fetched securely from API
  const [orderCode, setOrderCode] = useState("");
  const [attemptCode, setAttemptCode] = useState("");
  const [qrUrl, setQrUrl] = useState("");
  const [amountValue, setAmountValue] = useState<number | null>(null);
  const [isFetchingInfo, setIsFetchingInfo] = useState(true);

  const [bankName, setBankName] = useState(process.env.NEXT_PUBLIC_SEPAY_BANK_NAME ?? "Bank");
  const [accountNumber, setAccountNumber] = useState(process.env.NEXT_PUBLIC_SEPAY_ACCOUNT_NUMBER ?? "");
  const [accountName, setAccountName] = useState(process.env.NEXT_PUBLIC_SEPAY_ACCOUNT_NAME ?? "");

  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [expiredByServer, setExpiredByServer] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const redirectedRef = useRef(false);
  const fetchStartedRef = useRef<number | null>(null);
  const expiredRedirectFiredRef = useRef(false);

  const handleQRExpired = useCallback(() => {
    if (redirectedRef.current || expiredRedirectFiredRef.current) return;
    expiredRedirectFiredRef.current = true;
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    // Signal to cart page: this specific order just expired client-side.
    // Cart page reads this on mount to instantly clear the banner without waiting for an API call.
    if (orderId) {
      try { sessionStorage.setItem("sepay_just_expired", String(orderId)); } catch { /* ignore */ }
    }
    toast.error("QR code expired. Redirecting you back to your cart.");
    router.replace("/cart");
  }, [orderId, router]);

  // ── SignalR: lắng nghe ReceiveNotification từ hub ─────────────────────────
  // Khi backend xác nhận thanh toán thành công (PaymentSuccess event),
  // nó push notification qua hub với actionTarget = /profile/orders/{orderId}.
  // Ta bắt sự kiện này để redirect ngay, không cần chờ polling 4s.
  useEffect(() => {
    if (!connection || !orderId) return;

    const handler = (n: {
      notificationType?: string;
      actionTarget?: string;
      title?: string;
      message?: string;
    }) => {
      if (redirectedRef.current) return;
      // Chỉ xử lý notification liên quan đến order hiện tại
      const isThisOrder = n.actionTarget?.includes(`/orders/${orderId}`);
      const isPaymentSuccess =
        n.notificationType === "Order" &&
        isThisOrder &&
        (n.title?.toLowerCase().includes("paid") ||
          n.title?.toLowerCase().includes("payment") ||
          n.message?.toLowerCase().includes("paid") ||
          n.message?.toLowerCase().includes("successful") ||
          n.message?.toLowerCase().includes("thành công"));

      if (!isPaymentSuccess) return;

      redirectedRef.current = true;
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      void refreshCart().catch(() => { });
      const resolvedOrderCode = orderCode || "";
      router.replace(
        `/checkout/success?orderId=${orderId}&orderCode=${encodeURIComponent(resolvedOrderCode)}`,
      );
    };

    connection.on("ReceiveNotification", handler);
    return () => {
      connection.off("ReceiveNotification", handler);
    };
  }, [connection, orderId, orderCode, refreshCart, router]);

  // Fetch sensitive payment info from API on mount
  useEffect(() => {
    if (!orderId || fetchStartedRef.current === orderId) return;
    fetchStartedRef.current = orderId;

    // Clean up sensitive params from URL immediately
    window.history.replaceState(null, "", `/checkout/payment?orderId=${orderId}`);

    const fetchInfo = async () => {
      setIsFetchingInfo(true);
      try {
        const info = await checkoutApi.getPaymentInfo(orderId);

        // Redirect based on effective payment status from the server
        if (info.paymentStatus === "PAID") {
          redirectedRef.current = true;
          await refreshCart().catch(() => {});
          router.replace(
            `/checkout/success?orderId=${orderId}&orderCode=${encodeURIComponent(info.orderCode)}`,
          );
          return;
        }
        if (["EXPIRED", "CANCELLED", "FAILED"].includes(info.paymentStatus ?? "")) {
          toast.error("This payment has expired or been cancelled. Please go back to your cart and try again.");
          router.replace("/cart");
          return;
        }

        setOrderCode(info.orderCode);
        setAttemptCode(info.paymentAttemptCode ?? "");
        setQrUrl(info.qrImageUrl ?? "");
        setAmountValue(Math.round(info.amount));
        if (info.expiresAt) setExpiresAt(info.expiresAt);
        if (info.bankName) setBankName(info.bankName);
        if (info.accountNumber) setAccountNumber(info.accountNumber);
        if (info.accountName) setAccountName(info.accountName);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unable to load payment information.";
        toast.error(msg);
      } finally {
        setIsFetchingInfo(false);
      }
    };

    void fetchInfo();
  }, [orderId, refreshCart, router]);



  useEffect(() => {
    if (!orderId || redirectedRef.current) return;

    const checkStatus = async () => {
      try {
        const res = await checkoutApi.getPaymentStatus(orderId);
        if (typeof res.expiresAt === "string") setExpiresAt(res.expiresAt);
        if (res.paymentStatus === "PAID") {
          redirectedRef.current = true;
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
          }
          await refreshCart().catch(() => {
            // Ignore cart refresh errors while redirecting to success page.
          });
          const resolvedOrderCode = orderCode || res.orderCode || "";
          router.replace(
            `/checkout/success?orderId=${orderId}&orderCode=${encodeURIComponent(resolvedOrderCode)}`,
          );
          return;
        }

        if (["CANCELLED", "EXPIRED", "FAILED"].includes(res.paymentStatus)) {
          setExpiredByServer(true);
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
          }
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
  }, [orderCode, orderId, refreshCart, router]);

  const normalizedAmount = amountValue && amountValue > 0 ? amountValue : null;
  const qrImageUrl = qrUrl;

  if (isFetchingInfo) {
    return (
      <>
        <div className="flex flex-col items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-lg p-8 gap-3 w-full min-h-[420px]">
          <span className="material-symbols-outlined text-4xl text-orange-400 animate-spin">refresh</span>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Loading QR</p>
          <p className="text-sm text-slate-500">Fetching payment information...</p>
        </div>
        <div className="flex flex-col items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-lg p-8 gap-3 w-full min-h-[420px]">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Payment information</p>
          <p className="text-sm text-slate-500">Please wait a moment...</p>
        </div>
      </>
    );
  }

  if (!qrImageUrl) {
    return (
      <>
        <div className="flex flex-col items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-lg p-8 gap-3 w-full min-h-[420px]">
          <p className="text-xs font-bold uppercase tracking-widest text-red-400">Unable to load</p>
          <p className="text-sm text-slate-500">Could not retrieve QR code. Please refresh the page.</p>
        </div>
        <div className="flex flex-col items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-lg p-8 gap-3 w-full min-h-[420px]">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Payment information</p>
          <p className="text-sm text-slate-500">Please try refreshing this page.</p>
        </div>
      </>
    );
  }

  const handleConfirmPayment = async () => {
    if (!orderId) return;
    try {
      const res = await checkoutApi.getPaymentStatus(orderId);
      if (res.paymentStatus === "PAID") {
        redirectedRef.current = true;
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
        await refreshCart().catch(() => {
          // Ignore cart refresh errors while redirecting to success page.
        });
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
    setIsCancelling(true);
    try {
      // restoreCart=true: QR payment cancel should restore items back to the cart
      await checkoutApi.cancelOrder(orderId, "Customer cancelled on QR page", true);
      toast.success("Transaction cancelled. Products restored to cart.");
      await refreshCart();
      router.push("/cart");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unable to cancel order.";
      toast.error(msg);
    } finally {
      setIsCancelling(false);
      setIsCancelModalOpen(false);
    }
  };

  return (
    <>
      <QRCodeCard
        qrUrl={qrImageUrl}
        expiresAt={expiresAt}
        isExpired={expiredByServer}
        onExpired={handleQRExpired}
      />
      <PaymentPanel
        bankName={bankName}
        accountNumber={accountNumber}
        accountName={accountName}
        amount={normalizedAmount ?? 0}
        content={attemptCode || orderCode || ""}
        onConfirm={handleConfirmPayment}
        onCancel={async () => {
          setIsCancelModalOpen(true);
        }}
      />
      <ConfirmModal
        isOpen={isCancelModalOpen}
        title="Cancel Transaction"
        message="Are you sure you want to cancel this transaction? Your items will be restored to your cart."
        onConfirm={handleCancelOrder}
        onCancel={() => setIsCancelModalOpen(false)}
        confirmText={isCancelling ? "Cancelling..." : "Yes, Cancel"}
        cancelText="Keep Paying"
        type="danger"
      />
    </>
  );
}
