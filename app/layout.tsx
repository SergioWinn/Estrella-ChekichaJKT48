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
  description: "Monitor JKT48 cheki records collected from January 2026 onward.",
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
        <div className="site-frame mx-auto min-h-screen max-w-[110rem] px-4 py-4 sm:px-6 lg:px-8">
          <header className="site-header app-shell mb-6 overflow-hidden px-4 py-3 sm:px-5 lg:sticky lg:top-4 lg:z-[var(--z-sticky-nav)]">
            <div className="site-header-top flex flex-col gap-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                  <div className="kicker">Estrella archive desk</div>
                  <div className="site-meta-strip flex flex-wrap items-center gap-2.5 text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--muted-strong)]">
                    <span>Archive monitor</span>
                    <span className="hidden h-1 w-1 rounded-full bg-[var(--border-strong)] sm:block" />
                    <span>Since January 2026</span>
                    <span className="hidden h-1 w-1 rounded-full bg-[var(--border-strong)] sm:block" />
                    <span>JKT48 cheki records</span>
                  </div>
                </div>
                <div className="site-actions flex items-center gap-2 self-start lg:self-auto">
                  <ThemeToggle />
                  {user ? (
                    <form action={logoutAction}>
                      <button
                        className="site-icon-button inline-flex size-11 items-center justify-center border border-[var(--border)] bg-[var(--surface)] text-[var(--accent)] transition-colors hover:bg-[var(--surface-hover)]"
                        aria-label="Logout"
                        title="Logout"
                      >
                        <LogoutIcon className="size-5" />
                      </button>
                    </form>
                  ) : (
                    <Link
                      href="/login"
                      className="site-icon-button inline-flex size-11 items-center justify-center border border-[var(--border)] bg-[var(--surface)] text-[var(--accent)] transition-colors hover:bg-[var(--surface-hover)]"
                      aria-label="Open login or signup"
                      title="Login or signup"
                    >
                      <AuthIcon className="size-5" />
                    </Link>
                  )}
                </div>
              </div>
              <div className="site-header-bar grid gap-3 border-t border-[var(--border)] pt-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(15rem,0.5fr)] lg:items-start">
                <div>
                  <h1 className="max-w-4xl text-[clamp(2rem,3vw,3.6rem)] font-semibold tracking-[-0.06em] text-[var(--foreground)]">
                    Chekicha Archive Monitor
                  </h1>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)] sm:text-[0.95rem]">
                    Track resolved sessions, member appearances, and collector records from January 2026 onward.
                  </p>
                </div>
                <div className="site-summary-panel border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted-strong)]">System</div>
                  <div className="mt-1.5 text-sm leading-6 text-[var(--foreground-soft)]">
                    Overview, audit timeline, member browser, collector shelf, and admin workspace in one archive shell.
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-3 border-t border-[var(--border)] pt-3 xl:flex-row xl:items-center xl:justify-between">
              <SiteNav links={links} />
              <div className="site-credits flex flex-wrap items-center gap-3 text-sm text-[var(--muted)]">
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
                  className="site-support-link inline-flex min-h-11 items-center gap-2 whitespace-nowrap border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 font-medium text-[var(--foreground-soft)] transition-colors hover:bg-[var(--surface-hover)]"
                >
                  <SupportIcon className="size-3.5 text-[var(--accent)]" />
                  Support via Tako
                </a>
              </div>
            </div>
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}

