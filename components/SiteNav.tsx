"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface NavLink {
  href: string;
  label: string;
}

export function SiteNav({ links }: { links: NavLink[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const activeLink = links.find((link) => link.href === pathname) ?? links[0];
  const navRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent | TouchEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) setOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <nav ref={navRef} className="site-nav-shell">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="site-nav-links"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "Close menu" : "Open menu"}
        className="site-nav-toggle inline-flex min-h-11 w-full items-center justify-between gap-3 border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-left text-sm font-medium tracking-[-0.02em] text-[var(--foreground)] transition-colors hover:bg-[var(--surface-hover)] md:hidden"
      >
        <span className="inline-flex items-center gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-hover)] text-[var(--accent)]">
            <span className={`site-nav-toggle-icon ${open ? "site-nav-toggle-icon--open" : ""}`} aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </span>
          <span>{activeLink?.label || "Menu"}</span>
        </span>
      </button>
      <div id="site-nav-links" className={`site-nav-grid flex flex-wrap gap-2 ${open ? "site-nav-grid--open" : ""}`}>
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`site-nav-link inline-flex min-h-10 items-center justify-center border px-3 py-2 text-sm font-medium tracking-[-0.02em] whitespace-nowrap transition-colors sm:min-h-11 sm:px-4 ${
                isActive
                  ? "border-[var(--accent-soft-strong)] bg-[var(--accent-soft)] text-[var(--foreground)]"
                  : "border-[var(--border)] bg-transparent text-[var(--muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
