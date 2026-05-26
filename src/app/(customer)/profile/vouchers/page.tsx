import { Metadata } from "next";
import ProfileSidebar from "../_components/ProfileSidebar";
import VoucherList from "@/features/vouchers/components/VoucherList";

export const metadata: Metadata = {
  title: "My Vouchers | Children's Toy Store",
  description: "Manage and use your discount vouchers.",
};

export default function VouchersPage() {
  return (
    <div className="grow max-w-[1280px] mx-auto w-full px-4 md:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-6">
      <ProfileSidebar />
      <VoucherList />
    </div>
  );
}
