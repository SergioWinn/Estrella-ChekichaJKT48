import { relationToMember } from "./archive-data.ts";
import type { EventTeam } from "./v2-helpers.ts";
import { EVENT_TEAM_OPTIONS, normalizeEventTeam, singleMemberEvent } from "./v2-helpers.ts";
import type { TimelineEvent } from "./types.ts";

function getEventSeries(event: TimelineEvent): string {
  return (event.event_series || event.event_name || "").trim();
}

export function getRouletteSeriesOptions(events: TimelineEvent[]): string[] {
  const series = new Map<string, string>();

  for (const event of events) {
    if ((event.event_type || "Roulette") !== "Roulette") continue;
    const name = getEventSeries(event);
    if (name) series.set(name.toLocaleLowerCase(), name);
  }

  return Array.from(series.values()).sort((a, b) => a.localeCompare(b));
}

export function filterTimelineEvents(events: TimelineEvent[], filterType: string, rouletteSeries = "All", teamFilter = "All"): TimelineEvent[] {
  return events.filter((event) => {
    const eventType = event.event_type || "Roulette";
    if (filterType !== "All" && eventType !== filterType) return false;
    if (teamFilter !== "All" && (singleMemberEvent(eventType) || normalizeEventTeam(event.event_team) !== teamFilter)) return false;
    return filterType !== "Roulette" || rouletteSeries === "All" || getEventSeries(event) === rouletteSeries;
  });
}

export function buildTimelineFilterNote(filterType: string, rouletteSeries = "All", teamFilter = "All"): string {
  const suffix = teamFilter === "All" ? "" : ` for ${teamFilter}`;
  if (filterType === "All") return `Showing every event type across all months${suffix}`;
  if (filterType === "Roulette" && rouletteSeries !== "All") return `Showing only ${rouletteSeries} roulette sessions${suffix}`;
  if (filterType === "Roulette") return `Showing every roulette show across all months${suffix}`;
  return `Showing only ${filterType} events${suffix}`;
}

export function countTimelineTeams(events: TimelineEvent[]): Record<EventTeam, number> {
  const counts = Object.fromEntries(EVENT_TEAM_OPTIONS.map((team) => [team, 0])) as Record<EventTeam, number>;
  for (const event of events) {
    if (!singleMemberEvent(event.event_type)) counts[normalizeEventTeam(event.event_team)] += 1;
  }
  return counts;
}

export function buildTimelineCardState(row: TimelineEvent) {
  const memberA = relationToMember(row.member_a);
  const memberB = relationToMember(row.member_b);
  const slotMode = row.slot_mode || 1;
  const isSingle = row.event_type === "Birthday" || row.event_type === "Graduation";
  const members = [];

  if (row.member_id_a) {
    members.push({
      avatarUrl: memberA.avatar_url || null,
      name: memberA.nickname || memberA.full_name || "Unknown member",
      waiting: false,
    });
  } else {
    members.push({ avatarUrl: null, name: isSingle ? "Member not assigned yet" : "Slot A waiting", waiting: true });
  }

  if (!isSingle && slotMode === 2) {
    members.push(
      row.member_id_b
        ? {
            avatarUrl: memberB.avatar_url || null,
            name: memberB.nickname || memberB.full_name || "Unknown member",
            waiting: false,
          }
        : { avatarUrl: null, name: "Slot B waiting", waiting: true },
    );
  }

  return {
    eventType: row.event_type || "Roulette",
    isSingle,
    members,
  };
}
