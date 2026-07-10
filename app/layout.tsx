import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";

import "./globals.css";

import { AuthIcon, LogoutIcon, SupportIcon } from "@/components/UiIcons";
import { SiteNav } from "@/components/SiteNav";
import { ThemeToggle } from "@/components/ThemeToggle";
import { logoutAction } from "@/lib/v2-actions.ts";
import { getSessionContext } from "@/lib/v2-server.ts";

export const metadata: Metadata = {
  title: "Chekicha Archive Monitor",
  description: "See which draws are still open, who has been assigned, and which members appear most often.",
  icons: {
    icon: "/icon.svg",
    apple: "/apple-icon.png",
  },
};

const themeInitScript = `(() => {
  try {
    const storageKey = "chekicha-theme";
    const savedTheme = window.localStorage.getItem(storageKey);
    const theme = savedTheme === "light" || savedTheme === "dark"
      ? savedTheme
      : (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");

    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  } catch (_error) {}
})();`;

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const { user, profile } = await getSessionContext();
  const links = user
    ? profile?.role === "admin"
      ? [
          { href: "/", label: "Overview" },
          { href: "/timeline", label: "Timeline" },
          { href: "/members", label: "Members" },
          { href: "/collection", label: "Collection" },
          { href: "/admin", label: "Admin" },
        ]
      : [
          { href: "/", label: "Overview" },
          { href: "/timeline", label: "Timeline" },
          { href: "/members", label: "Members" },
          { href: "/collection", label: "Collection" },
        ]
    : [
        { href: "/", label: "Overview" },
        { href: "/timeline", label: "Timeline" },
        { href: "/members", label: "Members" },
      ];

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <div className="mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <header className="mb-6 rounded-[2rem] border border-[var(--border)] bg-[var(--panel)] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.18)] backdrop-blur-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-3 text-sm font-bold uppercase tracking-[0.22em] text-[var(--accent)]">
                  <span className="inline-block size-2 rounded-full bg-[var(--accent)]" />
                  JKT48 Cheki Tracker
                </div>
                <div>
                  <h1 className="text-3xl font-extrabold tracking-[-0.04em] text-[var(--foreground)] sm:text-4xl">Chekicha Archive Monitor</h1>
                  <p className="mt-2 max-w-2xl text-sm text-[var(--muted)] sm:text-base">
                    See which draws are still open, who has been assigned, and which members appear most often.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 self-start lg:self-end">
                <ThemeToggle />
                {user ? (
                  <form action={logoutAction}>
                    <button
                      className="inline-flex size-11 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--accent)] transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)] hover:text-[var(--accent-strong)]"
                      aria-label="Logout"
                      title="Logout"
                    >
                      <LogoutIcon className="size-5" />
                    </button>
                  </form>
                ) : (
                  <Link
                    href="/login"
                    className="inline-flex size-11 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--accent)] transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)] hover:text-[var(--accent-strong)]"
                    aria-label="Open login or signup"
                    title="Login or signup"
                  >
                    <AuthIcon className="size-5" />
                  </Link>
                )}
              </div>
            </div>
            <div className="mt-5">
              <SiteNav links={links} />
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[var(--border)] pt-4 text-sm text-[var(--muted)]">
              <p>
                Developed by{" "}
                <a
                  href="https://x.com/estrellawin19"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[var(--foreground)] transition hover:text-[var(--accent)]"
                >
                  @estrellawin19
                </a>
              </p>
              <a
                href="https://tako.id/Sportagame19Win"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-9 items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 font-medium text-[var(--foreground-soft)] transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
              >
                <SupportIcon className="size-3.5 text-[var(--accent)]" />
                Support via Tako
              </a>
            </div>
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
