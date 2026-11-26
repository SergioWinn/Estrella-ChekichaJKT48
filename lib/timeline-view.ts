import { getEventSeries, relationToMember } from "./archive-data.ts";
import type { EventTeam } from "./v2-helpers.ts";
import { EVENT_TEAM_OPTIONS, getEffectiveEventTeam, singleMemberEvent } from "./v2-helpers.ts";
import type { ChekichaRow, TimelineEvent } from "./types.ts";

export function getRouletteSeriesOptions(events: Pick<TimelineEvent, "event_type" | "event_series" | "event_name">[]): string[] {
  const series = new Map<string, string>();

  for (const event of events) {
    if ((event.event_type || "Roulette") !== "Roulette") continue;
    const name = getEventSeries(event);
    if (name) series.set(name.toLocaleLowerCase(), name);
  }

  return Array.from(series.values()).toSorted((a, b) => a.localeCompare(b));
}

export function matchesRouletteSeries(event: Pick<TimelineEvent, "event_series" | "event_name">, series: string): boolean {
  return series === "All" || getEventSeries(event).toLocaleLowerCase() === series.toLocaleLowerCase();
}

export function matchesEventMemberStatus(event: ChekichaRow, memberStatus: string, memberFilter = "All"): boolean {
  if (memberStatus === "All") return true;
  const matchesA = event.member_id_a &&
    (memberFilter === "All" || event.member_id_a === memberFilter) &&
    relationToMember(event.member_a).status?.toUpperCase() === memberStatus;
  const matchesB = !singleMemberEvent(event.event_type) && event.slot_mode === 2 && event.member_id_b &&
    (memberFilter === "All" || event.member_id_b === memberFilter) &&
    relationToMember(event.member_b).status?.toUpperCase() === memberStatus;
  return Boolean(matchesA || matchesB);
}

export function filterTimelineEvents(events: TimelineEvent[], filterType: string, rouletteSeries = "All", teamFilter = "All", query = "", memberFilter = "All", memberStatus = "All"): TimelineEvent[] {
  const search = query.trim().toLocaleLowerCase();
  return events.filter((event) => {
    const eventType = event.event_type || "Roulette";
    if (memberFilter !== "All" && event.member_id_a !== memberFilter && event.member_id_b !== memberFilter) return false;
    if (!matchesEventMemberStatus(event, memberStatus, memberFilter)) return false;
    if (search && ![event.event_name, event.event_series, event.member_a?.nickname, event.member_a?.full_name, event.member_b?.nickname, event.member_b?.full_name].some((value) => value?.toLocaleLowerCase().includes(search))) return false;
    if (filterType !== "All" && eventType !== filterType) return false;
    if (teamFilter !== "All" && (singleMemberEvent(eventType) || getEffectiveEventTeam(event.event_name, eventType, event.event_team) !== teamFilter)) return false;
    return filterType !== "Roulette" || matchesRouletteSeries(event, rouletteSeries);
  });
}

export function buildTimelineFilterNote(filterType: string, rouletteSeries = "All", teamFilter = "All"): string {
  const suffix = teamFilter === "All" ? "" : ` · ${teamFilter}`;
  if (filterType === "All") return `All events${suffix}`;
  if (filterType === "Roulette" && rouletteSeries !== "All") return `${rouletteSeries} roulette${suffix}`;
  if (filterType === "Roulette") return `All roulette${suffix}`;
  return `${filterType} events${suffix}`;
}

export function countTimelineTeams(events: TimelineEvent[]): Record<EventTeam, number> {
  const counts = Object.fromEntries(EVENT_TEAM_OPTIONS.map((team) => [team, 0])) as Record<EventTeam, number>;
  for (const event of events) {
    if (!singleMemberEvent(event.event_type)) counts[getEffectiveEventTeam(event.event_name, event.event_type, event.event_team)] += 1;
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
