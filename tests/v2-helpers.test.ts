import test from "node:test";
import assert from "node:assert/strict";

import {
  buildEventPayload,
  duplicateMemberLabels,
  getAuthRedirectPath,
  getEventDurationMinutes,
  normalizeUsername,
  usernameToEmail,
  validateUsername,
} from "../lib/v2-helpers.ts";
import { addCollectionQuantityToEntries, buildCollectibleSlots, hydrateCollectionEntries } from "../lib/v2-collection.ts";

test("username helpers normalize and validate the Streamlit auth rules", () => {
  assert.equal(normalizeUsername("  MiChiE.Name  "), "michie.name");
  assert.equal(usernameToEmail("Michie"), "michie@users.chekitrack.local");
  assert.equal(validateUsername("ab"), "Use 3-30 characters: lowercase letters, numbers, dot, underscore, or hyphen.");
  assert.equal(validateUsername("good_name-7"), null);
});

test("auth redirect path follows role-aware V2 navigation", () => {
  assert.equal(getAuthRedirectPath(null), "/collection");
  assert.equal(getAuthRedirectPath({ role: "user" }), "/collection");
  assert.equal(getAuthRedirectPath({ role: "admin" }), "/admin");
});

test("collection helper merges quantity on existing event and slot", () => {
  const entries = [
    { id: "1", event_id: "evt-1", slot_key: "A", quantity: 2, user_id: "user-1" },
  ];

  const updated = addCollectionQuantityToEntries(entries, {
    event_id: "evt-1",
    member_id: "m1",
    quantity: 3,
    slot_key: "A",
    user_id: "user-1",
  });

  assert.equal(updated.type, "updated");
  assert.equal(updated.payload.quantity, 5);
});

test("collectible slot helper emits member and slot labels like the Streamlit collection page", () => {
  const slots = buildCollectibleSlots([
    {
      id: "evt-1",
      event_name: "Birthday Live",
      event_type: "Birthday",
      start_time: "2026-07-10T10:00:00+07:00",
      end_time: "2026-07-10T11:00:00+07:00",
      slot_mode: 1,
      member_id_a: "m1",
      member_id_b: null,
      member_a: { nickname: "Michie", avatar_url: null, generasi: 10, status: "LOVE" },
      member_b: null,
    },
    {
      id: "evt-2",
      event_name: "Roulette Night",
      event_type: "Roulette",
      start_time: "2026-07-09T10:00:00+07:00",
      end_time: "2026-07-09T10:15:00+07:00",
      slot_mode: 2,
      member_id_a: "m1",
      member_id_b: "m2",
      member_a: { nickname: "Michie", avatar_url: null, generasi: 10, status: "LOVE" },
      member_b: { nickname: "Gracie", avatar_url: null, generasi: 11, status: "DREAM" },
    },
  ]);

  assert.equal(slots.length, 3);
  assert.equal(slots[0].slot_label, "Member");
  assert.equal(slots[1].slot_label, "Slot A");
  assert.equal(slots[2].slot_label, "Slot B");
  assert.equal(slots[0].member_status, "LOVE");
  assert.equal(slots[2].member_status, "DREAM");
});

test("collection hydration prefers resolved slot data over stale entry ids", () => {
  const hydrated = hydrateCollectionEntries(
    [
      {
        id: "entry-1",
        event_id: "evt-1",
        slot_key: "a",
        member_id: "legacy-member",
        quantity: 1,
        created_at: "2026-07-09T00:00:00Z",
        updated_at: "2026-07-09T00:00:00Z",
        user_id: "user-1",
      },
    ],
    [
      {
        slot_uid: "evt-1:A",
        event_id: "evt-1",
        slot_key: "A",
        slot_label: "Slot A",
        event_name: "Pajama Drive",
        event_type: "Roulette",
        start_time: "2026-07-10T10:00:00+07:00",
        end_time: "2026-07-10T10:15:00+07:00",
        event_image_url: null,
        member_id: "m1",
        member_name: "Michie",
        member_status: "LOVE",
        member_avatar_url: null,
        member_generasi: 10,
        display_label: "Pajama Drive | Slot A | Michie",
      },
    ],
    [],
    [],
  );

  assert.equal(hydrated[0]?.slot_key, "A");
  assert.equal(hydrated[0]?.event_name, "Pajama Drive");
  assert.equal(hydrated[0]?.member_name, "Michie");
  assert.equal(hydrated[0]?.member_status, "LOVE");
});

test("admin helpers block duplicate member names and coerce birthday events to one slot and one hour", () => {
  const duplicates = duplicateMemberLabels(
    [
      { id: "1", nickname: "Michie", full_name: "Michella" },
      { id: "2", nickname: "Gracie", full_name: "Grace" },
    ],
    "Michie",
    "Another Name",
  );

  assert.ok(duplicates[0]?.includes("Nickname already used"));
  assert.equal(getEventDurationMinutes("Birthday"), 60);
  assert.equal(getEventDurationMinutes("Roulette"), 15);

  const eventPayload = buildEventPayload({
    eventDate: "2026-07-10",
    eventType: "Birthday",
    preset: { event_name: "Birthday Live", event_type: "Birthday", event_image_url: "" },
    slotMode: 2,
    startTimeValue: "10:15",
    startHour: 10,
    startMinute: 15,
    memberIdA: "m1",
    memberIdB: "m2",
  });

  assert.equal(eventPayload.slot_mode, 1);
  assert.equal(eventPayload.member_id_b, null);
  assert.equal(eventPayload.end_time, "2026-07-10T04:15:00.000Z");
});
