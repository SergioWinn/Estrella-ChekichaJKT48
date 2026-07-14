import { relationToMember } from "./archive-data.ts";
import type { TimelineEvent } from "./types.ts";

export function getRouletteShowOptions(events: TimelineEvent[]): string[] {
  const shows = new Map<string, string>();

  for (const event of events) {
    if ((event.event_type || "Roulette") !== "Roulette") continue;
    const name = (event.event_name || "").trim();
    if (name) shows.set(name.toLocaleLowerCase(), name);
  }

  return Array.from(shows.values()).sort((a, b) => a.localeCompare(b));
}

export function filterTimelineEvents(events: TimelineEvent[], filterType: string, rouletteShow = "All"): TimelineEvent[] {
  return events.filter((event) => {
    const eventType = event.event_type || "Roulette";
    if (filterType !== "All" && eventType !== filterType) return false;
    return filterType !== "Roulette" || rouletteShow === "All" || event.event_name === rouletteShow;
  });
}

export function buildTimelineFilterNote(filterType: string, rouletteShow = "All"): string {
  if (filterType === "All") return "Showing every event type across all months";
  if (filterType === "Roulette" && rouletteShow !== "All") return `Showing only ${rouletteShow} roulette sessions`;
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
