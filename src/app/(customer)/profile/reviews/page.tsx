import { Metadata } from "next";
import { Suspense } from "react";
import ProfileSidebar from "../_components/ProfileSidebar";
import ReviewTabs from "@/features/reviews/components/ReviewTabs";

export const metadata: Metadata = {
  title: "My Reviews | Children's Toy Store",
  description: "Manage and review your product ratings.",
};

export default function ProfileReviewsPage() {
  return (
    <main className="flex-grow max-w-[1280px] mx-auto w-full px-4 md:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-6">
      <ProfileSidebar />

      <section className="col-span-1 md:col-span-3 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[600px]">
        <div className="px-6 py-4 border-b border-slate-200 bg-white">
          <h1 className="text-2xl font-bold text-[#0f172a]">
            My Reviews
          </h1>
          <p className="mt-1 text-sm text-[#475569]">
            Review purchased products and share your experience.
          </p>
        </div>
        
        <div className="flex flex-col grow">
          <Suspense fallback={
            <div className="flex flex-col justify-center items-center py-20 space-y-4">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
                <div className="absolute inset-0 rounded-full border-4 border-[#ff4f00] border-t-transparent animate-spin"></div>
              </div>
              <p className="text-sm text-slate-500 animate-pulse font-medium">
                Loading reviews...
              </p>
            </div>
          }>
            <ReviewTabs />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
