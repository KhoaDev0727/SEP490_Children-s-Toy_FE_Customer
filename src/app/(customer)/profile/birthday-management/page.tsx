import ProfileSidebar from "../_components/ProfileSidebar";
import ChildrenGrid from "./_components/ChildrenGrid";

export const metadata = {
  title: "Children's Birthdays - Toy Store",
};

export default function ChildrenBirthdayPage() {
  return (
    <div className="flex-grow max-w-[1280px] mx-auto w-full px-4 md:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-6">
      <ProfileSidebar />

      <section className="col-span-1 md:col-span-3 bg-white rounded-xl shadow-sm border border-[#e2bfb0]/30 overflow-hidden">
        <ChildrenGrid />
      </section>
    </div>
  );
}
