import type { ChekichaRow, MemberRelation } from "./types.ts";
import { formatEventTime, parseDate } from "./format.ts";
import type { CollectionEntry } from "./types.ts";

export interface CollectibleSlot {
  display_label: string;
  end_time?: string | null;
  event_id: string;
  event_image_url?: string | null;
  event_name: string;
  event_type: string;
  member_avatar_url?: string | null;
  member_generasi?: number | null;
  member_id: string;
  member_name: string;
  slot_key: "A" | "B";
  slot_label: string;
  slot_uid: string;
  start_time: string;
}

function relationToSingleMember(value: MemberRelation | MemberRelation[] | null | undefined): MemberRelation | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }
  return value ?? null;
}

export function buildCollectibleSlots(rows: ChekichaRow[]): CollectibleSlot[] {
  const slots: CollectibleSlot[] = [];

  for (const row of rows) {
    const dt = parseDate(row.start_time);
    const slotMode = row.slot_mode || 1;
    const memberA = relationToSingleMember(row.member_a);
    const memberB = relationToSingleMember(row.member_b);
    const eventName = row.event_name || "Untitled event";
    const eventType = row.event_type || "Roulette";
    const dayTime = dt ? `${dt.getUTCDate()} ${dt.toLocaleString("en-US", { month: "short", timeZone: "UTC" })} ${dt.getUTCFullYear()} | ${formatEventTime(row.start_time, row.end_time)}` : "Unknown date";

    if (row.id && row.member_id_a && memberA) {
      const slotLabel = eventType === "Birthday" || eventType === "Graduation" ? "Member" : "Slot A";
      slots.push({
        slot_uid: `${row.id}:A`,
        event_id: row.id,
        slot_key: "A",
        slot_label: slotLabel,
        event_name: eventName,
        event_type: eventType,
        start_time: row.start_time,
        end_time: row.end_time,
        event_image_url: row.event_image_url,
        member_id: row.member_id_a,
        member_name: memberA.nickname || "Unknown member",
        member_avatar_url: memberA.avatar_url,
        member_generasi: memberA.generasi,
        display_label: `${eventName} | ${dayTime} | ${slotLabel} | ${memberA.nickname || "Unknown member"}`,
      });
    }

    if (row.id && slotMode === 2 && row.member_id_b && memberB) {
      slots.push({
        slot_uid: `${row.id}:B`,
        event_id: row.id,
        slot_key: "B",
        slot_label: "Slot B",
        event_name: eventName,
        event_type: eventType,
        start_time: row.start_time,
        end_time: row.end_time,
        event_image_url: row.event_image_url,
        member_id: row.member_id_b,
        member_name: memberB.nickname || "Unknown member",
        member_avatar_url: memberB.avatar_url,
        member_generasi: memberB.generasi,
        display_label: `${eventName} | ${dayTime} | Slot B | ${memberB.nickname || "Unknown member"}`,
      });
    }
  }

  return slots;
}

export function addCollectionQuantityToEntries(
  entries: Array<{ event_id: string; id: string; quantity: number; slot_key: string; user_id: string }>,
  payload: { event_id: string; member_id: string; quantity: number; slot_key: string; user_id: string },
) {
  const existing = entries.find(
    (entry) => entry.user_id === payload.user_id && entry.event_id === payload.event_id && entry.slot_key === payload.slot_key,
  );

  if (existing) {
    return {
      type: "updated" as const,
      payload: {
        id: existing.id,
        quantity: Number(existing.quantity || 0) + payload.quantity,
      },
    };
  }

  return {
    type: "created" as const,
    payload,
  };
}

export function hydrateCollectionEntries(
  rows: Array<Pick<CollectionEntry, "created_at" | "event_id" | "id" | "member_id" | "quantity" | "slot_key" | "updated_at" | "user_id">>,
  slots: CollectibleSlot[],
  fallbackEvents: Array<Pick<CollectionEntry, "end_time" | "event_id" | "event_image_url" | "event_name" | "event_type" | "start_time">>,
  fallbackMembers: Array<Pick<CollectionEntry, "member_avatar_url" | "member_generasi" | "member_id" | "member_name">>,
): CollectionEntry[] {
  const slotsByKey = new Map(slots.map((slot) => [`${slot.event_id}:${slot.slot_key}`, slot]));
  const eventsById = new Map(fallbackEvents.map((event) => [event.event_id, event]));
  const membersById = new Map(fallbackMembers.map((member) => [member.member_id, member]));

  return rows.map((row) => {
    const slotKey = String(row.slot_key || "A").toUpperCase();
    const slot = slotsByKey.get(`${row.event_id}:${slotKey}`);
    const event = eventsById.get(row.event_id);
    const member = membersById.get(row.member_id);

    return {
      ...row,
      slot_key: slotKey,
      event_name: slot?.event_name || event?.event_name || "Archived event",
      event_type: slot?.event_type || event?.event_type || "Roulette",
      start_time: slot?.start_time || event?.start_time,
      end_time: slot?.end_time || event?.end_time,
      event_image_url: slot?.event_image_url || event?.event_image_url,
      member_name: slot?.member_name || member?.member_name || "Unknown member",
      member_avatar_url: slot?.member_avatar_url || member?.member_avatar_url,
      member_generasi: slot?.member_generasi || member?.member_generasi,
    };
  });
}
