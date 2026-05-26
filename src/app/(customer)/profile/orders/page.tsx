import { Suspense } from "react";
import ProfileSidebar from "../_components/ProfileSidebar";
import OrderHistoryView from "./_components/OrderHistoryView";

export default function OrderHistoryPage() {
  return (
    <main className="flex-grow max-w-[1280px] mx-auto w-full px-4 md:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Sidebar */}
      <ProfileSidebar />

      {/* Main Content */}
      <Suspense fallback={
        <div className="md:col-span-3 flex justify-center items-center py-20">
          <div className="w-10 h-10 border-4 border-[#ff6a00] border-t-transparent rounded-full animate-spin"></div>
        </div>
      }>
        <OrderHistoryView />
      </Suspense>
    </main>
  );
}
