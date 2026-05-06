import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-[#8e7164] font-medium">
      {items.map((item, idx) => (
        <span key={item.label + idx} className="flex items-center gap-2">
          {idx > 0 && (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="opacity-40">
              <path d="M5 2.5L9.5 7 5 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
          {item.href ? (
            <Link href={item.href} className="hover:text-[#ff6a00] transition-colors duration-200">
              {item.label}
            </Link>
          ) : (
            <span className="text-[#261812] font-semibold line-clamp-1 max-w-[220px]">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
