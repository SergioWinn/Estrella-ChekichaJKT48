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
  const links = [
    { href: "/", label: "Timeline" },
    { href: "/members", label: "Members" },
    { href: "/collection", label: "My collection" },
    ...(profile?.role === "admin" ? [{ href: "/admin", label: "Admin" }] : []),
  ];

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <div className="site-frame mx-auto min-h-screen max-w-[110rem] px-4 py-4 sm:px-6 lg:px-8">
          <header className="site-header archive-header app-shell">
            <Link href="/" className="archive-wordmark">Estrella<span>JKT48 cheki archive</span></Link>
            <SiteNav links={links} />
            <div className="flex items-center gap-2">
              <ThemeToggle />
              {user ? (
                <form action={logoutAction}>
                  <PendingSubmitButton pendingLabel="Logging out..." ariaLabel="Logout" iconOnly className="site-icon-button inline-flex size-10 items-center justify-center border border-[var(--border)] bg-[var(--surface)] text-[var(--accent)]">
                    <LogoutIcon className="size-5" />
                  </PendingSubmitButton>
                </form>
              ) : (
                <Link href="/login" className="site-icon-button inline-flex size-10 items-center justify-center border border-[var(--border)] bg-[var(--surface)] text-[var(--accent)]" aria-label="Login or signup" title="Login or signup">
                  <AuthIcon className="size-5" />
                </Link>
              )}
            </div>
          </header>
          <main>{children}</main>
          <footer className="archive-footer">
            <p>Developed by <a href="https://x.com/estrellawin19" target="_blank" rel="noopener noreferrer">@estrellawin19</a></p>
            <a href="https://tako.id/Sportagame19Win" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 whitespace-nowrap"><SupportIcon className="size-3.5" />Support via Tako</a>
          </footer>
        </div>
      </body>
    </html>
  );
}

