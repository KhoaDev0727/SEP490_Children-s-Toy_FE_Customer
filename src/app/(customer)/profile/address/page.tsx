import Link from "next/link";
import ProfileSidebar from "../_components/ProfileSidebar";
import AddressList from "./_components/AddressList";

export const metadata = {
  title: "Địa chỉ của tôi - ShopX",
};

export default function AddressPage() {
  return (
    <main className="flex-grow max-w-[1280px] mx-auto w-full px-4 md:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-6">
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
          <span className="text-[#a14000] font-medium">Địa chỉ</span>
        </nav>
      </div>

      <ProfileSidebar />

      <section className="col-span-1 md:col-span-3 bg-white rounded-xl shadow-sm border border-[#e2bfb0]/30 overflow-hidden">
        <AddressList />
      </section>
    </main>
  );
}
