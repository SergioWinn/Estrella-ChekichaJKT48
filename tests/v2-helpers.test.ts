import test from "node:test";
import assert from "node:assert/strict";

import {
  buildEventPayload,
  duplicateMemberLabels,
  getAuthErrorMessage,
  getAuthRedirectPath,
  getEventDurationMinutes,
  getEventResultStatus,
  getEventSlotProgress,
  getFixedEventTeam,
  normalizeUsername,
  usernameToEmail,
  validateUsername,
} from "../lib/v2-helpers.ts";
import { addCollectionQuantityToEntries, buildCollectibleSlots, hydrateCollectionEntries } from "../lib/v2-collection.ts";

test("event slot progress counts saved results and empty active slots", () => {
  const roulette = { event_type: "Roulette", slot_mode: 2 };
  for (const slots of [{ member_id_a: "a" }, { member_id_b: "b" }]) {
    const { filledCount, waitingCount } = getEventSlotProgress({ ...roulette, ...slots });
    assert.deepEqual([filledCount, waitingCount], [1, 1]);
    assert.equal(getEventResultStatus({ ...roulette, ...slots }), "Sebagian terisi");
  }
  assert.deepEqual(getEventSlotProgress(roulette), { waitingA: true, waitingB: true, waitingCount: 2, filledCount: 0 });
  assert.equal(getEventResultStatus(roulette), "Belum ada hasil");
  assert.equal(getEventResultStatus({ ...roulette, member_id_a: "a", member_id_b: "b" }), "Lengkap");
  assert.equal(getEventSlotProgress({ ...roulette, member_id_a: "a", member_id_b: "b" }).waitingCount, 0);
  for (const event of [{ ...roulette, slot_mode: 1 }, { ...roulette, event_type: "Birthday" }, { ...roulette, event_type: "Graduation" }]) {
    assert.deepEqual(getEventSlotProgress({ ...event, member_id_b: "b" }), { waitingA: true, waitingB: false, waitingCount: 1, filledCount: 0 });
    assert.equal(getEventResultStatus({ ...event, member_id_a: "a" }), "Lengkap");
  }
});

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

test("auth errors explain recovery without exposing provider details", () => {
  assert.match(getAuthErrorMessage({ code: "invalid_credentials" }, "sign in"), /[Uu]sername.*password.*try again/);
  assert.match(getAuthErrorMessage({ code: "email_exists" }, "create your account"), /username.*Sign in/);
  assert.match(getAuthErrorMessage({ code: "user_already_exists" }, "create your account"), /username.*Sign in/);
  assert.match(getAuthErrorMessage({ status: 429 }, "sign in"), /later/);
  assert.match(getAuthErrorMessage({ code: "weak_password" }, "create your account"), /stronger password/);
  assert.match(getAuthErrorMessage({ code: "email_not_confirmed" }, "sign in"), /Contact @estrellawin19/);
  assert.match(getAuthErrorMessage({ code: "signup_disabled" }, "create your account"), /unavailable/);
  const providerError = { code: "unexpected_failure", status: 500, message: "private database configuration" };
  for (const action of ["sign in", "create your account"] as const) {
    const message = getAuthErrorMessage(providerError, action);
    assert.ok(message.includes(action));
    assert.ok(message.includes("@estrellawin19"));
    assert.ok(!message.includes(providerError.message));
  }
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
      event_team: "LOVE",
      start_time: "2026-07-10T10:00:00+07:00",
      end_time: "2026-07-10T11:00:00+07:00",
      slot_mode: 1,
      member_id_a: "m1",
      member_id_b: null,
      member_a: { nickname: "Michie", full_name: "Michella Adlen", avatar_url: null, generasi: 10, status: "LOVE" },
      member_b: null,
    },
    {
      id: "evt-2",
      event_name: "Roulette Night",
      event_series: "Ramadhan",
      event_type: "Roulette",
      event_team: "DREAM",
      start_time: "2026-07-09T10:00:00+07:00",
      end_time: "2026-07-09T10:15:00+07:00",
      slot_mode: 2,
      member_id_a: "m1",
      member_id_b: "m2",
      member_a: { nickname: "Michie", full_name: "Michella Adlen", avatar_url: null, generasi: 10, status: "LOVE" },
      member_b: { nickname: "Gracie", full_name: "Gracie Octaviani", avatar_url: null, generasi: 11, status: "DREAM" },
    },
  ]);

  assert.equal(slots.length, 3);
  assert.equal(slots[0].slot_label, "Member");
  assert.equal(slots[1].slot_label, "Slot A");
  assert.equal(slots[2].slot_label, "Slot B");
  assert.deepEqual(slots.map((slot) => slot.event_result_status), ["Lengkap", "Lengkap", "Lengkap"]);
  assert.deepEqual(slots.slice(1).map((slot) => slot.event_series), ["Ramadhan", "Ramadhan"]);
  assert.equal(slots[0].event_team, "LOVE");
  assert.equal(slots[1].event_team, "DREAM");
  assert.equal(slots[0].member_status, "LOVE");
  assert.equal(slots[2].member_status, "DREAM");
  assert.equal(slots[0].member_full_name, "Michella Adlen");
  assert.equal(slots[2].member_full_name, "Gracie Octaviani");
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
        event_result_status: "Sebagian terisi",
        event_type: "Roulette",
        event_team: "LOVE",
        start_time: "2026-07-10T10:00:00+07:00",
        end_time: "2026-07-10T10:15:00+07:00",
        event_image_url: null,
        member_id: "m1",
        member_full_name: "Michella Adlen",
        member_name: "Michie",
        member_status: "LOVE",
        member_avatar_url: null,
        member_generasi: 10,
        display_label: "Pajama Drive | LOVE | Slot A | Michie",
      },
    ],
    [{ event_id: "evt-1", event_name: "Pajama Drive", event_result_status: "Sebagian terisi", event_series: "Pajama Drive", event_type: "Roulette" }],
    [],
  );

  assert.equal(hydrated[0]?.slot_key, "A");
  assert.equal(hydrated[0]?.event_name, "Pajama Drive");
  assert.equal(hydrated[0]?.event_result_status, "Sebagian terisi");
  assert.equal(hydrated[0]?.event_series, "Pajama Drive");
  assert.equal(hydrated[0]?.event_team, "LOVE");
  assert.equal(hydrated[0]?.member_name, "Michie");
  assert.equal(hydrated[0]?.member_full_name, "Michella Adlen");
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
    preset: { event_name: "Birthday Live", event_series: "Ramadhan", event_team: "ALL", event_type: "Birthday", event_image_url: "" },
    slotMode: 2,
    startTimeValue: "10:15",
    startHour: 10,
    startMinute: 15,
    memberIdA: "m1",
    memberIdB: "m2",
  });

  assert.equal(eventPayload.slot_mode, 1);
  assert.equal(eventPayload.member_id_b, null);
  assert.equal(eventPayload.event_series, null);
  assert.equal(eventPayload.end_time, "2026-07-10T04:15:00.000Z");

  const roulettePayload = buildEventPayload({
    eventDate: "2026-07-10",
    eventType: "Roulette",
    preset: { event_name: "Sahur Bareng", event_series: "Ramadhan", event_team: "PASSION", event_type: "Roulette" },
    slotMode: 1,
    startTimeValue: "10:15",
    startHour: 10,
    startMinute: 15,
  });

  assert.equal(roulettePayload.event_series, "Ramadhan");
  assert.equal(roulettePayload.event_team, "ALL");
});

test("fixed setlist teams override manual event team values", () => {
  assert.equal(getFixedEventTeam("PASSION 200%", "Roulette"), "PASSION");
  assert.equal(getFixedEventTeam("DREAM BAKUDAN", "Roulette"), "DREAM");
  assert.equal(getFixedEventTeam("ITADAKI LOVE", "Roulette"), "LOVE");
  assert.equal(getFixedEventTeam("Pajama Drive", "Roulette"), "TRAINEE");
  assert.equal(getFixedEventTeam("KIRA-KIRA GIRLS", "Roulette"), "TRAINEE");
  assert.equal(getFixedEventTeam("Pertaruhan Cinta", "Roulette"), "ALL");
  assert.equal(getFixedEventTeam("Ramadhan", "Roulette"), "ALL");
  assert.equal(getFixedEventTeam("Cara Meminum Ramune", "Roulette"), null);
  assert.equal(getFixedEventTeam("Sambil Menggandeng Erat Tanganku", "Roulette"), null);
  assert.equal(getFixedEventTeam("Some Future Fixed Setlist", "Roulette"), "ALL");

  const payload = buildEventPayload({
    eventDate: "2026-07-10",
    eventType: "Roulette",
    preset: { event_name: "DREAM BAKUDAN", event_series: "DREAM BAKUDAN", event_team: "LOVE", event_type: "Roulette" },
    slotMode: 1,
    startTimeValue: "10:15",
    startHour: 10,
    startMinute: 15,
  });

  assert.equal(payload.event_team, "DREAM");

  const allPayload = buildEventPayload({
    eventDate: "2026-07-10",
    eventType: "Roulette",
    preset: { event_name: "Pertaruhan Cinta", event_series: "Pertaruhan Cinta", event_team: "PASSION", event_type: "Roulette" },
    slotMode: 1,
    startTimeValue: "10:15",
    startHour: 10,
    startMinute: 15,
  });

  assert.equal(allPayload.event_team, "ALL");
});
