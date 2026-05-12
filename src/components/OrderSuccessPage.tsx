"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────
interface OrderItem {
  id: string;
  name: string;
  variant: string;
  price: number;
  qty: number;
  image: string;
}

// ─── Mock Data (Fallback) ──────────────────────────────────────────────────────
const MOCK_ITEMS: OrderItem[] = [
  {
    id: "1",
    name: "Giày Thể Thao Cao Cấp Đỏ/Đen",
    variant: "Đỏ · Size 42",
    price: 2450000,
    qty: 1,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAAccSy_PfqZDI8UaPITOfz5rpuPGnAVTA8Tpk--993ZwgqLOSEdQ8wjyFRYTmNW_DeT4lwF5lAq2yx96iLldmHaX-rUTnSrIOYSHjYbJKjgFrErNQLQfbhfk5VamnaUoE-BTy8kptbDaVFUBAu_vlRSU7gldcJ34pq3MB537CHJKWhXriEoPIOCBoDT178pm7UH8F2hq8VUGRFka4uR_kLCOYa0G-00LkdQiqWxQMuKtkudChzp75I2DdjffsXPC1kcRUJORXiPwU",
  },
];

const fmt = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

// ─── Animated Check Icon ───────────────────────────────────────────────────────
function CheckIcon() {
  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      aria-hidden="true"
    >
      <circle
        cx="40"
        cy="40"
        r="36"
        stroke="#f97316"
        strokeWidth="3"
        strokeDasharray="226"
        strokeDashoffset="226"
        className="animate-ring"
        style={{ animationFillMode: "forwards" }}
      />
      <polyline
        points="22,40 34,52 58,28"
        stroke="#f97316"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="60"
        strokeDashoffset="60"
        className="animate-check"
        style={{ animationFillMode: "forwards", animationDelay: "0.45s" }}
      />
    </svg>
  );
}

// ─── Progress Steps ────────────────────────────────────────────────────────────
const STEPS = [
  { label: "Đã tiếp nhận", icon: "📋" },
  { label: "Đang xử lý", icon: "⚙️" },
  { label: "Đang giao", icon: "🚚" },
  { label: "Hoàn tất", icon: "🎉" },
];

function ProgressBar({ active }: { active: number }) {
  return (
    <div className="flex items-center justify-between w-full max-w-md mx-auto mb-10">
      {STEPS.map((step, i) => (
        <div key={i} className="flex-1 flex flex-col items-center relative">
          {i < STEPS.length - 1 && (
            <div className="absolute top-4 left-1/2 w-full h-0.5 bg-zinc-200 z-0">
              <div
                className="h-full bg-orange-500 transition-all duration-700"
                style={{ width: i < active ? "100%" : "0%" }}
              />
            </div>
          )}
          <div
            className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-sm
              border-2 transition-all duration-500
              ${
                i < active
                  ? "bg-orange-500 border-orange-500 text-white"
                  : i === active
                  ? "bg-white border-orange-500 text-orange-500 shadow-md shadow-orange-100"
                  : "bg-white border-zinc-200 text-zinc-300"
              }`}
          >
            {i < active ? "✓" : step.icon}
          </div>
          <span
            className={`mt-1.5 text-[10px] font-semibold tracking-wide text-center leading-tight
              ${i <= active ? "text-orange-600" : "text-zinc-400"}`}
          >
            {step.label}
          </span>
        </div>
      ))}
    </div>
  );
}

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const orderCode = searchParams.get("orderCode") || "N/A";
  
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  const total = MOCK_ITEMS.reduce((s, it) => s + it.price * it.qty, 0);

  if (!mounted) return null;

  return (
    <>
      <style>{`
        @keyframes ring { to { stroke-dashoffset: 0; } }
        @keyframes check { to { stroke-dashoffset: 0; } }
        .animate-ring { animation: ring 0.55s cubic-bezier(.65,0,.45,1) forwards; }
        .animate-check { animation: check 0.35s ease forwards; }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .slide-up { animation: slideUp 0.5s ease both; }
        @keyframes confetti-fall {
          0%   { transform: translateY(-10px) rotate(0deg);   opacity: 1; }
          100% { transform: translateY(180px) rotate(720deg); opacity: 0; }
        }
        .confetti-piece {
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 2px;
          animation: confetti-fall 1.4s ease forwards;
        }
      `}</style>

      <main className="flex-1 bg-[#fff8f6] flex items-center justify-center px-4 py-12 md:py-20">
        <div
          className={`w-full max-w-2xl transition-all duration-700 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <div className="bg-white rounded-2xl shadow-xl shadow-orange-100 border border-orange-100 overflow-hidden">
            <div className="h-1.5 w-full bg-gradient-to-r from-orange-400 via-orange-500 to-amber-400" />

            <div className="px-6 md:px-12 py-10 text-center">
              <div
                className="relative mx-auto mb-6 w-20 h-20 slide-up"
                style={{ animationDelay: "0.05s" }}
              >
                {["#f97316","#facc15","#34d399","#60a5fa","#f472b6"].map((c, i) => (
                  <span
                    key={i}
                    className="confetti-piece"
                    style={{
                      background: c,
                      top: "50%",
                      left: "50%",
                      marginLeft: `${Math.cos((i / 5) * Math.PI * 2) * 28}px`,
                      marginTop: `${Math.sin((i / 5) * Math.PI * 2) * 28}px`,
                      animationDelay: `${0.5 + i * 0.06}s`,
                    }}
                  />
                ))}
                <CheckIcon />
              </div>

              <h1
                className="slide-up text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 mb-2"
                style={{ animationDelay: "0.12s" }}
              >
                Đặt hàng thành công!
              </h1>

              <p
                className="slide-up text-zinc-500 text-sm md:text-base mb-1 leading-relaxed"
                style={{ animationDelay: "0.18s" }}
              >
                Cảm ơn bạn đã mua sắm tại{" "}
                <span className="font-bold text-orange-500">ShopX</span>. Đơn hàng{" "}
                <span className="font-bold text-zinc-800">#{orderCode}</span> đã được tiếp nhận
                và đang được xử lý.
              </p>

              <div
                className="slide-up inline-flex items-center gap-1.5 mt-3 mb-8 px-4 py-2 rounded-full
                  bg-orange-50 border border-orange-200 text-sm text-orange-700 font-medium"
                style={{ animationDelay: "0.24s" }}
              >
                <span>🚚</span>
                <span>
                  Dự kiến giao: <strong className="text-orange-800">3-5 ngày làm việc</strong>
                </span>
              </div>

              <div className="slide-up" style={{ animationDelay: "0.3s" }}>
                <ProgressBar active={1} />
              </div>

              <div
                className="slide-up bg-orange-50/60 border border-orange-100 rounded-xl p-5 mb-8 text-left"
                style={{ animationDelay: "0.36s" }}
              >
                <h2 className="font-bold text-zinc-800 text-sm uppercase tracking-widest mb-4 pb-2 border-b border-orange-100">
                  Tóm tắt đơn hàng
                </h2>

                <ul className="divide-y divide-orange-100">
                  {MOCK_ITEMS.map((item) => (
                    <li key={item.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg border border-orange-100 shadow-sm flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-zinc-800 text-sm line-clamp-2">{item.name}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">{item.variant}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-orange-500 text-sm whitespace-nowrap">{fmt(item.price)}</p>
                        <p className="text-xs text-zinc-400 mt-0.5">×{item.qty}</p>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="flex justify-between items-center mt-4 pt-3 border-t border-orange-200">
                  <span className="text-sm font-semibold text-zinc-600">Tổng cộng</span>
                  <span className="text-lg font-extrabold text-orange-500">{fmt(total)}</span>
                </div>
              </div>

              <div
                className="slide-up flex flex-col sm:flex-row items-center justify-center gap-3"
                style={{ animationDelay: "0.42s" }}
              >
                <Link
                  href="/"
                  className="w-full sm:w-auto px-7 py-3 rounded-xl border-2 border-orange-400
                    text-orange-500 font-bold text-sm hover:bg-orange-50
                    transition-colors duration-200 text-center"
                >
                  Tiếp tục mua sắm
                </Link>
                <Link
                  href={orderId ? `/accounts/orders/${orderId}` : "/accounts/orders"}
                  className="w-full sm:w-auto px-7 py-3 rounded-xl bg-orange-500 text-white
                    font-bold text-sm shadow-md shadow-orange-200
                    hover:bg-orange-600 active:scale-95 transition-all duration-200 text-center"
                >
                  Xem đơn hàng →
                </Link>
              </div>
            </div>
          </div>

          <p
            className="slide-up text-center text-xs text-zinc-400 mt-5"
            style={{ animationDelay: "0.5s" }}
          >
            Cần hỗ trợ?{" "}
            <a href="/contact" className="text-orange-500 hover:underline font-medium">
              Liên hệ chúng tôi
            </a>
          </p>
        </div>
      </main>
    </>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}
