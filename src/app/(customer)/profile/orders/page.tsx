import ProfileSidebar from "../_components/ProfileSidebar";
import OrderHistoryView from "./_components/OrderHistoryView";

export default function OrderHistoryPage() {
  return (
    <main className="flex-grow max-w-[1280px] mx-auto w-full px-4 md:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Sidebar */}
      <ProfileSidebar />

      {/* Main Content */}
      <OrderHistoryView />
    </main>
  );
}
