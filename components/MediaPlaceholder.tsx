import { TicketIcon } from "@/components/UiIcons";

export function MediaPlaceholder({ className = "" }: { className?: string }) {
  return (
    <div className={`flex h-full w-full items-center justify-center bg-[var(--surface-strong)] text-[var(--muted-strong)] ${className}`.trim()}>
      <span className="inline-flex size-14 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)]/70 opacity-60">
        <TicketIcon className="size-6" />
      </span>
    </div>
  );
}
