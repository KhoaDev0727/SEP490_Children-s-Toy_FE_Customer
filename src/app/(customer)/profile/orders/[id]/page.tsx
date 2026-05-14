import ProfileSidebar from "../../_components/ProfileSidebar";
import OrderDetailView from "./_components/OrderDetailView";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const orderId = Number(id);

  return (
    <main className="flex-grow max-w-[1280px] mx-auto w-full px-4 md:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <ProfileSidebar />

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <OrderDetailView orderId={Number.isNaN(orderId) ? 0 : orderId} />
    </main>
  );
}
