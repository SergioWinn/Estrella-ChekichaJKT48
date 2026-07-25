"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavLink {
  href: string;
  label: string;
}

export function SiteNav({ links }: { links: NavLink[] }) {
  const pathname = usePathname();

  return (
    <nav className="site-nav-grid flex flex-wrap gap-2">
      {links.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`site-nav-link inline-flex min-h-10 items-center justify-center border px-3 py-2 text-sm font-medium tracking-[-0.02em] whitespace-nowrap transition sm:min-h-11 sm:px-4 ${
              isActive
                ? "border-[var(--accent-soft-strong)] bg-[var(--accent-soft)] text-[var(--foreground)]"
                : "border-[var(--border)] bg-transparent text-[var(--muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

