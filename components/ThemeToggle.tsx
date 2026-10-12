"use client";

import { useEffect, useState } from "react";

import { MoonIcon, SunIcon } from "@/components/UiIcons";

const STORAGE_KEY = "chekicha-theme";

type Theme = "dark" | "light";

function resolveTheme(): Theme {
  if (typeof window === "undefined") {
    return "dark";
  }

  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Read browser preferences after hydration to match the server render.
    setTheme(resolveTheme());
  }, []);

  return (
    <button
      type="button"
      onClick={() => {
        const currentTheme = resolveTheme();
        const nextTheme: Theme = currentTheme === "dark" ? "light" : "dark";
        const commitTheme = () => {
          applyTheme(nextTheme);
          setTheme(nextTheme);
          try {
            window.localStorage.setItem(STORAGE_KEY, nextTheme);
          } catch {
            // Preferences are optional when browser storage is unavailable.
          }
        };
        const documentWithTransition = document as Document & { startViewTransition?: (callback: () => void) => void };

        if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches && documentWithTransition.startViewTransition) {
          documentWithTransition.startViewTransition(commitTheme);
        } else {
          commitTheme();
        }
      }}
      className="inline-flex size-11 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] transition-colors hover:bg-[var(--surface-hover)]"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      <span key={theme} className="theme-toggle-icon">
        {theme === "dark" ? <SunIcon className="size-4 text-[var(--accent)]" /> : <MoonIcon className="size-4 text-[var(--accent)]" />}
      </span>
    </button>
  );
}

