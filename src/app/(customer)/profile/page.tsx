import ProfileSidebar from "./_components/ProfileSidebar";
import ProfileForm from "./_components/ProfileForm";

export default function ProfilePage() {
  return (
    <div className="flex-grow max-w-[1280px] mx-auto w-full px-4 md:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-6">
      <ProfileSidebar />
      <ProfileForm />
    </div>
  );
}
