import { relationToMember } from "./archive-data.ts";
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

export function filterTimelineEvents(events: TimelineEvent[], filterType: string, rouletteSeries = "All"): TimelineEvent[] {
  return events.filter((event) => {
    const eventType = event.event_type || "Roulette";
    if (filterType !== "All" && eventType !== filterType) return false;
    return filterType !== "Roulette" || rouletteSeries === "All" || getEventSeries(event) === rouletteSeries;
  });
}

export function buildTimelineFilterNote(filterType: string, rouletteSeries = "All"): string {
  if (filterType === "All") return "Showing every event type across all months";
  if (filterType === "Roulette" && rouletteSeries !== "All") return `Showing only ${rouletteSeries} roulette sessions`;
  if (filterType === "Roulette") return "Showing every roulette show across all months";
  return `Showing only ${filterType} events`;
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
