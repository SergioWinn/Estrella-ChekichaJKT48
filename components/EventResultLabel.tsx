import { EVENT_RESULT_STATUS, type getEventResultStatus } from "@/lib/v2-helpers.ts";

export function EventResultLabel({ status }: { status: ReturnType<typeof getEventResultStatus> }) {
  if (status !== EVENT_RESULT_STATUS.partial) return null;

  return (
    <small lang="id" className="inline-flex w-fit max-w-full rounded-full border border-[var(--accent-soft-strong)] bg-[var(--accent-soft)] px-2 py-0.5 text-xs font-medium text-[var(--foreground)]">
      {status}
    </small>
  );
}
