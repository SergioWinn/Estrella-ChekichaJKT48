"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavLink {
  href: string;
  label: string;
}

export function SiteNav({ links }: { links: NavLink[] }) {
  const currentPath = usePathname();
  const pathname = currentPath === "/timeline" ? "/" : currentPath;

  return (
    <nav className="archive-primary-nav" aria-label="Primary">
      {links.map((link) => (
        <Link key={link.href} href={link.href} aria-current={pathname === link.href ? "page" : undefined}>
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
