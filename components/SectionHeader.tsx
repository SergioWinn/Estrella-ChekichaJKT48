import type { ReactNode } from "react";

export function SectionHeader({
  label,
  title,
  description,
  actions,
  className = "",
  titleClassName = "",
  descriptionClassName = "",
}: {
  actions?: ReactNode;
  className?: string;
  description?: ReactNode;
  descriptionClassName?: string;
  label: ReactNode;
  title: ReactNode;
  titleClassName?: string;
}) {
  return (
    <div className={`flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between ${className}`.trim()}>
      <div>
        <div className="text-xs font-semibold text-[var(--accent)]">{label}</div>
        <h2 className={`mt-3 text-3xl font-extrabold tracking-[-0.04em] text-[var(--foreground)] sm:text-4xl ${titleClassName}`.trim()}>{title}</h2>
        {description ? (
          <p className={`mt-3 max-w-3xl text-sm leading-7 text-[var(--muted)] sm:text-base ${descriptionClassName}`.trim()}>{description}</p>
        ) : null}
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}
