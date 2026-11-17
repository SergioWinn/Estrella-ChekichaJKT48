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
      ? "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
      : "border-[var(--border)] bg-[var(--surface-strong)] text-[var(--muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]";

  return (
    <button
      type={type}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex min-h-11 items-center justify-center rounded-lg border px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
        active ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]" : inactiveClass
      } ${className}`.trim()}
    >
      {children}
    </button>
  );
}

