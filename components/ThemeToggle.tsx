"use client";

import { useState } from "react";

import { MoonIcon, SunIcon } from "@/components/UiIcons";

const STORAGE_KEY = "chekicha-theme";

type Theme = "dark" | "light";

function resolveTheme(): Theme {
  if (typeof window === "undefined") {
    return "dark";
  }

  const savedTheme = window.localStorage.getItem(STORAGE_KEY);
  if (savedTheme === "dark" || savedTheme === "light") {
    return savedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => resolveTheme());

  return (
    <button
      type="button"
      onClick={() => {
        const currentTheme = resolveTheme();
        const nextTheme: Theme = currentTheme === "dark" ? "light" : "dark";
        applyTheme(nextTheme);
        window.localStorage.setItem(STORAGE_KEY, nextTheme);
        setTheme(nextTheme);
      }}
      className="inline-flex size-11 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] transition-colors hover:bg-[var(--surface-hover)]"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? <SunIcon className="size-4 text-[var(--accent)]" /> : <MoonIcon className="size-4 text-[var(--accent)]" />}
    </button>
  );
}

