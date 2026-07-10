import { relationToMember } from "./archive-data.ts";
import type { TimelineEvent } from "./types.ts";

export function buildTimelineFilterNote(filterType: string): string {
  if (filterType === "All") return "Showing every event type across all months";
  if (filterType === "Roulette") return "Roulette = lottery-drawn show/event sessions. Only these shown.";
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
