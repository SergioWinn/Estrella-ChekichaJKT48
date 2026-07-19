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
    <nav className="flex flex-wrap gap-2">
      {links.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`inline-flex min-h-11 items-center justify-center rounded-full border px-4 py-2 text-sm font-semibold whitespace-nowrap transition ${
              isActive
                ? "border-[var(--accent-soft-strong)] bg-[var(--accent-soft)] text-[var(--foreground)]"
                : "border-[var(--border)] bg-transparent text-[var(--muted)] hover:bg-[var(--surface-hover)]"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

