import { normalizeEventTeam, singleMemberEvent } from "@/lib/v2-helpers.ts";

export function EventTeamBadge({
  team,
  eventType,
  compact = false,
}: {
  compact?: boolean;
  eventType?: string | null;
  team?: string | null;
}) {
  if (singleMemberEvent(eventType)) return null;

  const normalized = normalizeEventTeam(team);

  return (
    <span
      className={`team-badge team-badge--${normalized.toLowerCase()} inline-flex shrink-0 items-center rounded-full border font-semibold uppercase tracking-[0.14em] ${compact ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs"}`}
    >
      {normalized}
    </span>
  );
}
