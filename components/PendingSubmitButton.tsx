"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

export function PendingSubmitButton({
  ariaLabel,
  children,
  className = "",
  iconOnly = false,
  pendingLabel,
}: {
  ariaLabel?: string;
  children: ReactNode;
  className?: string;
  iconOnly?: boolean;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      aria-busy={pending}
      aria-label={pending ? pendingLabel : ariaLabel}
      data-pending={pending ? "true" : "false"}
      className={`pending-submit inline-flex items-center justify-center gap-2 ${className}`.trim()}
    >
      {pending ? (
        <svg aria-hidden="true" className="size-4 shrink-0 animate-spin motion-reduce:animate-none" fill="none" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.3" strokeWidth="3" />
          <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeLinecap="round" strokeWidth="3" />
        </svg>
      ) : null}
      {iconOnly ? (pending ? null : children) : <span aria-live="polite">{pending ? pendingLabel : children}</span>}
      {iconOnly ? <span className="sr-only" aria-live="polite">{pending ? pendingLabel : ariaLabel}</span> : null}
    </button>
  );
}
