import Link from "next/link";
import ProfileSidebar from "../_components/ProfileSidebar";
import PasswordForm from "./_components/PasswordForm";

export const metadata = {
  title: "Change Password - ShopX",
};

export default function PasswordPage() {
  return (
    <main className="flex-grow max-w-[1280px] mx-auto w-full px-4 md:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="col-span-full mb-2">
        <nav className="flex items-center gap-2 text-sm text-[#5a4136]">
          <Link href="/" className="hover:text-[#a14000] transition-colors">
            Home
          </Link>
          <span className="material-symbols-outlined text-[14px] opacity-50">chevron_right</span>
          <Link href="/profile" className="hover:text-[#a14000] transition-colors">
            Account
          </Link>
          <span className="material-symbols-outlined text-[14px] opacity-50">chevron_right</span>
          <span className="text-[#a14000] font-medium">Change Password</span>
        </nav>
      </div>

      <ProfileSidebar />
      <PasswordForm />
    </main>
  );
}
