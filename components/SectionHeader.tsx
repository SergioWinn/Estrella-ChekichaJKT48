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
    <div className={["flex flex-col gap-4", className].filter(Boolean).join(" ")}>
      <div className="space-y-3">
        <div className="kicker">{label}</div>
        <h2 className={["max-w-4xl text-3xl font-semibold tracking-[-0.045em] text-[var(--foreground)] sm:text-4xl", titleClassName].filter(Boolean).join(" ")}>
          {title}
        </h2>
        {description ? (
          <p className={["max-w-3xl text-sm leading-7 text-[var(--muted)] sm:text-base", descriptionClassName].filter(Boolean).join(" ")}>
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex items-center">{actions}</div> : null}
    </div>
  );
}

