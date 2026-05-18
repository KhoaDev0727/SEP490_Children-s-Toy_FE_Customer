import ProfileSidebar from "../_components/ProfileSidebar";
import PasswordForm from "./_components/PasswordForm";

export const metadata = {
  title: "Change Password - ShopX",
};

export default function PasswordPage() {
  return (
    <main className="flex-grow max-w-[1280px] mx-auto w-full px-4 md:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-6">
      <ProfileSidebar />
      <PasswordForm />
    </main>
  );
}
