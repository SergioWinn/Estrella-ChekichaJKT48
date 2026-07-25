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
      className={`motion-filter-change inline-flex min-h-11 items-center justify-center rounded-[1rem] border px-4 py-2 text-[11px] font-medium uppercase tracking-[0.14em] transition whitespace-nowrap ${
        active ? "border-[var(--accent-soft-strong)] bg-[var(--accent-soft)] text-[var(--foreground)] shadow-[inset_0_0_0_1px_var(--accent-soft-strong)]" : inactiveClass
      } ${className}`.trim()}
    >
      {children}
    </button>
  );
}

