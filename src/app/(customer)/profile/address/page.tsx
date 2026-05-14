import Link from "next/link";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import ProfileSidebar from "../_components/ProfileSidebar";
import AddressList from "./_components/AddressList";

export const metadata = {
  title: "My Address - ShopX",
};

export default function AddressPage() {
  return (
    <main className="flex-grow max-w-[1280px] mx-auto w-full px-4 md:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="col-span-full mb-2">
        <Breadcrumbs 
          items={[
            { label: "Account", href: "/profile" },
            { label: "Address" }
          ]} 
        />
      </div>

      <ProfileSidebar />

      <section className="col-span-1 md:col-span-3 bg-white rounded-xl shadow-sm border border-[#e2bfb0]/30 overflow-hidden">
        <AddressList />
      </section>
    </main>
  );
}
