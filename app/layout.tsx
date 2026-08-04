import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";

import "./globals.css";

import { AuthIcon, LogoutIcon, SupportIcon } from "@/components/UiIcons";
import { SiteNav } from "@/components/SiteNav";
import { PendingSubmitButton } from "@/components/PendingSubmitButton";
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
          <header className="site-header app-shell mb-5 px-4 py-3 sm:px-5 lg:sticky lg:top-4 lg:z-[var(--z-sticky-nav)]">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-col gap-2">
                <Link href="/" className="kicker w-fit">
                  Estrella archive desk
                </Link>
                <div className="site-meta-strip flex flex-wrap items-center gap-2.5 text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--muted-strong)]">
                  <span>Archive monitor</span>
                  <span className="hidden h-1 w-1 rounded-full bg-[var(--border-strong)] sm:block" />
                  <span>Since January 2026</span>
                  <span className="hidden h-1 w-1 rounded-full bg-[var(--border-strong)] sm:block" />
                  <span>JKT48 cheki records</span>
                </div>
              </div>
              <div className="site-actions order-first flex items-center justify-between gap-2 sm:order-none sm:justify-start xl:ml-4">
                <div className="site-credits hidden items-center gap-3 text-sm text-[var(--muted)] xl:flex">
                  <p>
                    Developed by{" "}
                    <a
                      href="https://x.com/estrellawin19"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-[var(--foreground)] transition-colors hover:text-[var(--accent)]"
                    >
                      @estrellawin19
                    </a>
                  </p>
                </div>
                <a
                  href="https://tako.id/Sportagame19Win"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="site-support-link hidden min-h-10 items-center gap-2 whitespace-nowrap border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 font-medium text-[var(--foreground-soft)] transition-colors hover:bg-[var(--surface-hover)] lg:inline-flex"
                >
                  <SupportIcon className="size-3.5 text-[var(--accent)]" />
                  Support via Tako
                </a>
                <ThemeToggle />
                {user ? (
                  <form action={logoutAction}>
                    <PendingSubmitButton
                      pendingLabel="Logging out..."
                      ariaLabel="Logout"
                      iconOnly
                      className="site-icon-button inline-flex size-10 items-center justify-center border border-[var(--border)] bg-[var(--surface)] text-[var(--accent)] transition-colors hover:bg-[var(--surface-hover)]"
                    >
                      <LogoutIcon className="size-5" />
                    </PendingSubmitButton>
                  </form>
                ) : (
                  <Link
                    href="/login"
                    className="site-icon-button inline-flex size-10 items-center justify-center border border-[var(--border)] bg-[var(--surface)] text-[var(--accent)] transition-colors hover:bg-[var(--surface-hover)]"
                    aria-label="Open login or signup"
                    title="Login or signup"
                  >
                    <AuthIcon className="size-5" />
                  </Link>
                )}
              </div>
            </div>
            <div className="mt-3 flex flex-col gap-3 border-t border-[var(--border)] pt-3 xl:flex-row xl:items-center xl:justify-between">
              <SiteNav links={links} />
              <div className="site-credits flex flex-col items-start gap-2 text-sm text-[var(--muted)] sm:flex-row sm:flex-wrap sm:items-center sm:gap-3 xl:hidden">
                <p>
                  Developed by{" "}
                  <a
                    href="https://x.com/estrellawin19"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-[var(--foreground)] transition-colors hover:text-[var(--accent)]"
                  >
                    @estrellawin19
                  </a>
                </p>
                <a
                  href="https://tako.id/Sportagame19Win"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="site-support-link inline-flex min-h-10 items-center gap-2 whitespace-nowrap border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 font-medium text-[var(--foreground-soft)] transition-colors hover:bg-[var(--surface-hover)]"
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

