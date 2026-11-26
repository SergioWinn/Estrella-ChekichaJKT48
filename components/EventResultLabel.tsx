import { EVENT_RESULT_STATUS, type getEventResultStatus } from "@/lib/v2-helpers.ts";

export function EventResultLabel({ status }: { status: ReturnType<typeof getEventResultStatus> }) {
  const tone = status === EVENT_RESULT_STATUS.complete
    ? "border-[var(--border)] text-[var(--muted-strong)]"
    : "border-[var(--accent-soft-strong)] bg-[var(--accent-soft)] text-[var(--foreground)]";

  return (
    <small lang="id" className={`inline-flex w-fit max-w-full rounded-full border px-2 py-0.5 text-xs font-medium ${tone}`}>
      {status}
    </small>
  );
}
