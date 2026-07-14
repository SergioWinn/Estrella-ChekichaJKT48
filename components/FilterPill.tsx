import type { ReactNode } from "react";

export function FilterPill({
  active,
  children,
  className = "",
  inactiveTone = "strong",
  onClick,
  type = "button",
}: {
  active: boolean;
  children: ReactNode;
  className?: string;
  inactiveTone?: "soft" | "strong";
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
}) {
  const inactiveClass =
    inactiveTone === "soft"
      ? "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
      : "border-[var(--border)] bg-[var(--surface-strong)] text-[var(--muted)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]";

  return (
    <button
      type={type}
      onClick={onClick}
      className={`inline-flex min-h-11 items-center justify-center rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] transition whitespace-nowrap ${
        active ? "border-[var(--accent-soft-strong)] bg-[var(--accent-soft)] text-[var(--foreground)]" : inactiveClass
      } ${className}`.trim()}
    >
      {children}
    </button>
  );
}
