import Link from "next/link";
import React from "react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center gap-2 text-sm text-[#5a4136]">
      <Link href="/" className="hover:text-[#a14000] transition-colors">
        Home
      </Link>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <span className="material-symbols-outlined text-[14px] opacity-50">
            chevron_right
          </span>
          {item.href ? (
            <Link href={item.href} className="hover:text-[#a14000] transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-[#a14000] font-medium">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
