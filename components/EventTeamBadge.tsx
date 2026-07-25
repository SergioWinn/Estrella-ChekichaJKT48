import { getEventTeamStyle, normalizeEventTeam } from "@/lib/v2-helpers.ts";

export function EventTeamBadge({ team, label = "Team", compact = false }: { compact?: boolean; label?: string; team?: string | null }) {
  const normalized = normalizeEventTeam(team);

  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border font-bold uppercase tracking-[0.12em] ${compact ? "px-2 py-0.5 text-[9px]" : "px-2.5 py-1 text-[10px] md:text-xs"}`}
      style={getEventTeamStyle(normalized)}
    >
      {label} {normalized}
    </span>
  );
}