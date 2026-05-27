import { Suspense } from "react";
import ProfileSidebar from "../../_components/ProfileSidebar";
import OrderDetailView from "./_components/OrderDetailView";

function OrderDetailFallback() {
  return (
    <section className="col-span-1 md:col-span-3 flex flex-col gap-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-[#e2bfb0]/30 flex items-center gap-3">
        <span className="material-symbols-outlined text-[#ff6a00]">hourglass_top</span>
        <p className="text-sm text-[#5a4136]">Loading order details...</p>
      </div>
    </section>
  );
}

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
      <Suspense fallback={<OrderDetailFallback />}>
        <OrderDetailView orderId={Number.isNaN(orderId) ? 0 : orderId} />
      </Suspense>
    </main>
  );
}
