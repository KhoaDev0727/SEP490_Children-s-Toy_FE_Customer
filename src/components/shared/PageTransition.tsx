"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * PageTransition
 * Wraps page content with a smooth fade-in + slight slide-up animation
 * every time the pathname changes (client-side navigation).
 *
 * Usage: wrap {children} in the layout with <PageTransition>.
 * No external dependencies required — pure CSS keyframe via inline style.
 */
export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [key, setKey] = useState(0);
  const prevPathnameRef = useRef(pathname);

  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname;
      setKey((k) => k + 1);
    }
  }, [pathname]);

  return (
    <div
      key={key}
      style={{
        animation: "pageEnter 0.22s cubic-bezier(0.25, 0.46, 0.45, 0.94) both",
      }}
    >
      {children}
    </div>
  );
}
