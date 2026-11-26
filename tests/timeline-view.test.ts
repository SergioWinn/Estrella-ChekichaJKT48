import test from "node:test";
import assert from "node:assert/strict";

import { buildTimelineCardState, buildTimelineFilterNote, countTimelineTeams, filterTimelineEvents, getRouletteSeriesOptions, matchesEventMemberStatus } from "../lib/timeline-view.ts";

test("timeline search and member filter compose with categories and either slot", () => {
  const events = [
    { id: "a", event_type: "Roulette", event_name: "Pajama Drive", start_time: "2026-11-20T14:10:00Z", member_id_a: "c", member_a: { nickname: "Cynthia" }, member_id_b: "r", member_b: { full_name: "Raisha Syifa" } },
    { id: "b", event_type: "Birthday", event_name: "Birthday", start_time: "2026-11-24T10:15:00Z", member_id_a: "c", member_a: { nickname: "Cynthia" } },
  ];
  assert.deepEqual(filterTimelineEvents(events, "All", "All", "All", " RAISHA ", "r").map((e) => e.id), ["a"]);
  assert.equal(filterTimelineEvents(events, "Birthday", "All", "All", "Cynthia", "r").length, 0);
  assert.equal(filterTimelineEvents(events, "All", "All", "All", "pajama", "c").length, 1);
});

test("album cards distinguish a single-slot show from a pending second slot", () => {
  const base = { start_time: "2026-11-20T14:10:00Z", member_id_a: "c", member_a: { nickname: "Cynthia", avatar_url: "portrait.webp" } };
  for (const event_type of ["Birthday", "Graduation"]) {
    assert.equal(buildTimelineCardState({ ...base, event_type, slot_mode: 2 }).members.length, 1);
  }
  assert.equal(buildTimelineCardState({ ...base, event_type: "Roulette", slot_mode: 1 }).members.length, 1);
  const double = buildTimelineCardState({ ...base, event_type: "Roulette", slot_mode: 2 });
  assert.equal(double.members.length, 2);
  assert.equal(double.members[1].waiting, true);
  assert.equal(double.members[0].avatarUrl, "portrait.webp");
});

test("timeline status matches assigned members and composes with other filters", () => {
  const double = {
    id: "double", event_type: "Roulette", event_name: "Pajama Drive", start_time: "2026-11-20T14:10:00Z", slot_mode: 2,
    member_id_a: "c", member_a: { nickname: "Cynthia", status: "LOVE" },
    member_id_b: "r", member_b: { full_name: "Raisha Syifa", status: "passion" },
  };
  const events = [double, { ...double, id: "single", slot_mode: 1 }, { ...double, id: "birthday", event_type: "Birthday" }];
  assert.deepEqual(filterTimelineEvents(events, "Roulette", "Pajama Drive", "TRAINEE", "Raisha", "r", "PASSION").map(({ id }) => id), ["double"]);
  assert.equal(filterTimelineEvents(events, "All", "All", "All", "", "c", "PASSION").length, 0);
  assert.deepEqual(filterTimelineEvents(events, "Birthday", "All", "All", "", "All", "LOVE").map(({ id }) => id), ["birthday"]);
  assert.equal(filterTimelineEvents(events, "Birthday", "All", "All", "", "All", "PASSION").length, 0);
  const pending = { ...double, member_id_a: null, member_a: null };
  assert.equal(matchesEventMemberStatus(pending, "PASSION"), true);
  assert.equal(matchesEventMemberStatus({ ...pending, member_id_b: null, member_b: null }, "PASSION"), false);
});

test("buildTimelineFilterNote summarizes the active filters", () => {
  assert.equal(buildTimelineFilterNote("All"), "All events");
  assert.equal(buildTimelineFilterNote("Roulette"), "All roulette");
  assert.equal(buildTimelineFilterNote("Roulette", "Ramadhan"), "Ramadhan roulette");
  assert.equal(buildTimelineFilterNote("Birthday"), "Birthday events");
});

test("roulette series helpers group distinct Ramadhan events", () => {
  const events = [
    { id: "1", event_name: "Pajama Drive", event_series: "Pajama Drive", event_type: "Roulette", start_time: "2026-07-01T10:00:00Z" },
    { id: "2", event_name: "Sahur Bareng", event_series: "Ramadhan", event_type: "Roulette", start_time: "2026-07-02T10:00:00Z" },
    { id: "3", event_name: "Ngabuburit", event_series: "Ramadhan", event_type: "Roulette", start_time: "2026-07-03T10:00:00Z" },
    { id: "4", event_name: "Birthday Live", event_type: "Birthday", start_time: "2026-07-04T10:00:00Z" },
    { id: "5", event_name: "Legacy Show", event_type: "Roulette", start_time: "2026-07-05T10:00:00Z" },
  ];

  assert.deepEqual(getRouletteSeriesOptions(events), ["Legacy Show", "Pajama Drive", "Ramadhan"]);
  assert.deepEqual(filterTimelineEvents(events, "Roulette", "Ramadhan").map((event) => event.id), ["2", "3"]);
  assert.deepEqual(filterTimelineEvents(events, "Roulette", "Pajama Drive").map((event) => event.id), ["1"]);
  assert.equal(filterTimelineEvents(events, "Roulette").length, 4);
  assert.equal(filterTimelineEvents(events, "Birthday", "Pajama Drive").length, 1);
});


test("timeline team filter and counts ignore special single-member events", () => {
  const events = [
    { id: "1", event_name: "Legacy Show", event_type: "Roulette", event_team: "PASSION", start_time: "2026-07-01T10:00:00Z" },
    { id: "2", event_name: "Cara Meminum Ramune", event_type: "Roulette", event_team: "LOVE", start_time: "2026-07-02T10:00:00Z" },
    { id: "3", event_name: "Sambil Menggandeng Erat Tanganku", event_type: "Roulette", event_team: "DREAM", start_time: "2026-07-03T10:00:00Z" },
    { id: "4", event_name: "Birthday Live", event_type: "Birthday", event_team: "LOVE", start_time: "2026-07-04T10:00:00Z" },
    { id: "5", event_name: "DREAM BAKUDAN", event_type: "Roulette", event_team: "LOVE", start_time: "2026-07-05T10:00:00Z" },
  ];

  assert.deepEqual(filterTimelineEvents(events, "All", "All", "LOVE").map((event) => event.id), ["2"]);
  assert.deepEqual(filterTimelineEvents(events, "All", "All", "ALL").map((event) => event.id), ["1"]);
  assert.deepEqual(filterTimelineEvents(events, "All", "All", "DREAM").map((event) => event.id), ["3", "5"]);
  assert.equal(buildTimelineFilterNote("All", "All", "DREAM"), "All events · DREAM");
  assert.deepEqual(countTimelineTeams(events), { ALL: 1, LOVE: 1, DREAM: 2, PASSION: 0, TRAINEE: 0 });
});
test("buildTimelineCardState emits waiting labels for unfinished timeline rows", () => {
  const single = buildTimelineCardState({
    end_time: null,
    event_image_url: null,
    event_name: "Birthday",
    event_type: "Birthday",
    id: "evt-1",
    member_a: null,
    member_b: null,
    member_id_a: null,
    member_id_b: null,
    slot_mode: 1,
    start_time: "2026-07-28T15:00:00+07:00",
  });
  const double = buildTimelineCardState({
    end_time: null,
    event_image_url: null,
    event_name: "Roulette",
    event_type: "Roulette",
    id: "evt-2",
    member_a: { nickname: "Fritzy", full_name: null, avatar_url: null },
    member_b: null,
    member_id_a: "m1",
    member_id_b: null,
    slot_mode: 2,
    start_time: "2026-07-28T16:00:00+07:00",
  });

  assert.deepEqual(single.members, [{ avatarUrl: null, name: "Member not assigned yet", waiting: true }]);
  assert.deepEqual(double.members, [
    { avatarUrl: null, name: "Fritzy", waiting: false },
    { avatarUrl: null, name: "Slot B waiting", waiting: true },
  ]);
});
