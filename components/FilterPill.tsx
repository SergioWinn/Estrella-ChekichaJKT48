import type { ReactNode } from "react";

export function FilterPill({
  active,
  children,
  className = "",
  disabled = false,
  inactiveTone = "strong",
  onClick,
  type = "button",
}: {
  active: boolean;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  inactiveTone?: "soft" | "strong";
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
}) {
  const inactiveClass =
    inactiveTone === "soft"
      ? "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:bg-[var(--surface-hover)]"
      : "border-[var(--border)] bg-[var(--surface-strong)] text-[var(--muted)] hover:bg-[var(--surface-hover)]";

  return (
    <button
      type={type}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex min-h-11 items-center justify-center rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] transition whitespace-nowrap ${
        active ? "border-[var(--accent-soft-strong)] bg-[var(--accent-soft)] text-[var(--foreground)]" : inactiveClass
      } ${className}`.trim()}
    >
      {children}
    </button>
  );
}

