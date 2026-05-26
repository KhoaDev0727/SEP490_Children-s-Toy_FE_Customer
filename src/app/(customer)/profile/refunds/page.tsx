import ProfileSidebar from "../_components/ProfileSidebar";
import RefundHistoryView from "./_components/RefundHistoryView";

export const metadata = {
  title: "My Refunds | TiniToy",
  description: "View and manage your refund requests.",
};

export default function RefundHistoryPage() {
  return (
    <main className="flex-grow max-w-[1280px] mx-auto w-full px-4 md:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-6">
      <ProfileSidebar />
      <RefundHistoryView />
    </main>
  );
}
