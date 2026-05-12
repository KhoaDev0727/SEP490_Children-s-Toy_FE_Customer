import Link from "next/link";

export default function WalletBreadcrumb() {
  return (
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
        <span className="text-[#a14000] font-medium">Wallet</span>
      </nav>
    </div>
  );
}
