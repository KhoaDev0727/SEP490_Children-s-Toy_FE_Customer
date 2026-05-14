import { Metadata } from "next";
import ProfileSidebar from "../_components/ProfileSidebar";
import ReviewTabs from "@/features/reviews/components/ReviewTabs";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Đánh giá của tôi | Children's Toy Store",
  description: "Quản lý và xem lại các đánh giá sản phẩm của bạn.",
};

export default function ProfileReviewsPage() {
  return (
    <main className="flex-grow max-w-[1280px] mx-auto w-full px-4 md:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Breadcrumb */}
      <div className="col-span-full mb-2">
        <nav className="flex items-center gap-2 text-sm text-[#5a4136]">
          <Link href="/" className="hover:text-[#a14000] transition-colors">
            Trang chủ
          </Link>
          <span className="material-symbols-outlined text-[14px] opacity-50">chevron_right</span>
          <Link href="/profile" className="hover:text-[#a14000] transition-colors">
            Tài khoản
          </Link>
          <span className="material-symbols-outlined text-[14px] opacity-50">chevron_right</span>
          <span className="text-[#a14000] font-medium">Đánh giá của tôi</span>
        </nav>
      </div>

      <ProfileSidebar />

      <section className="col-span-1 md:col-span-3 bg-white rounded-3xl shadow-[0_14px_40px_rgba(15,23,42,0.08)] border border-slate-200/80 flex flex-col min-h-[600px] overflow-hidden">
        <div className="px-6 md:px-8 py-6 border-b border-slate-200/70 bg-linear-to-r from-orange-50/80 via-white to-amber-50/70">
          <h1 className="text-2xl md:text-[28px] font-semibold tracking-tight text-slate-900">
            Đánh giá của tôi
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Xem lại các sản phẩm đã mua và chia sẻ trải nghiệm của bạn.
          </p>
        </div>
        
        <div className="flex flex-col grow">
          <ReviewTabs />
        </div>
      </section>
    </main>
  );
}
