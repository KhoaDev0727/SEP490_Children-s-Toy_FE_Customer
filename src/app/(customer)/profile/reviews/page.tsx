import { Metadata } from "next";
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

      <section className="col-span-1 md:col-span-3 bg-white rounded-xl shadow-sm border border-[#e2bfb0]/30 overflow-hidden flex flex-col min-h-[600px]">
        <div className="px-6 py-4 border-b border-[#e2bfb0]/30 bg-white">
          <h1 className="text-2xl font-bold text-[#261812]">
            My Reviews
          </h1>
          <p className="mt-1 text-sm text-[#5a4136]">
            Review purchased products and share your experience.
          </p>
        </div>
        
        <div className="flex flex-col grow">
          <ReviewTabs />
        </div>
      </section>
    </main>
  );
}
