import test from "node:test";
import assert from "node:assert/strict";

import { buildMemberArchive, buildOverviewSnapshot } from "../lib/archive-data.ts";

test("buildOverviewSnapshot counts sessions, pending slots, ranks ties, and limits recent assignments", () => {
  const rows = [
    {
      id: "evt-1",
      event_name: "Show Alpha",
      event_type: "Roulette",
      start_time: "2026-07-07T10:00:00+07:00",
      slot_mode: 2,
      member_id_a: "michi",
      member_id_b: "grace",
      member_a: { nickname: "Michie", avatar_url: "a.jpg", generasi: 10 },
      member_b: { nickname: "Gracie", avatar_url: "b.jpg", generasi: 11 },
    },
    {
      id: "evt-2",
      event_name: "Birthday Gala",
      event_type: "Birthday",
      start_time: "2026-07-06T10:00:00+07:00",
      slot_mode: 1,
      member_id_a: "fritzy",
      member_id_b: null,
      member_a: { nickname: "Fritzy", avatar_url: "c.jpg", generasi: 12 },
      member_b: null,
    },
    {
      id: "evt-3",
      event_name: "Show Beta",
      event_type: "Roulette",
      start_time: "2026-07-05T09:00:00+07:00",
      slot_mode: 2,
      member_id_a: "grace",
      member_id_b: null,
      member_a: { nickname: "Gracie", avatar_url: "b2.jpg", generasi: 11 },
      member_b: null,
    },
    {
      id: "evt-4",
      event_name: "Graduation Night",
      event_type: "Graduation",
      start_time: "2026-07-04T09:00:00+07:00",
      slot_mode: 1,
      member_id_a: null,
      member_id_b: null,
      member_a: null,
      member_b: null,
    },
    {
      id: "evt-5",
      event_name: "Show Gamma",
      event_type: "Roulette",
      start_time: "2026-07-03T09:00:00+07:00",
      slot_mode: 1,
      member_id_a: "michi",
      member_id_b: null,
      member_a: { nickname: "Michie", avatar_url: "a2.jpg", generasi: 10 },
      member_b: null,
    },
    {
      id: "evt-6",
      event_name: "Show Delta",
      event_type: "Roulette",
      start_time: "2026-07-02T09:00:00+07:00",
      slot_mode: 1,
      member_id_a: "fritzy",
      member_id_b: null,
      member_a: { nickname: "Fritzy", avatar_url: "c2.jpg", generasi: 12 },
      member_b: null,
    },
    {
      id: "evt-7",
      event_name: "Show Epsilon",
      event_type: "Roulette",
      start_time: "2026-07-01T09:00:00+07:00",
      slot_mode: 1,
      member_id_a: "fritzy",
      member_id_b: null,
      member_a: { nickname: "Fritzy", avatar_url: "c3.jpg", generasi: 12 },
      member_b: null,
    },
    {
      id: "evt-8",
      event_name: "Show Zeta",
      event_type: "Roulette",
      start_time: "2026-06-30T09:00:00+07:00",
      slot_mode: 1,
      member_id_a: "guest",
      member_id_b: null,
      member_a: { nickname: "Guest", avatar_url: null, generasi: null },
      member_b: null,
    },
    {
      id: "evt-9",
      event_name: "Show Eta",
      event_type: "Roulette",
      start_time: "2026-06-29T09:00:00+07:00",
      slot_mode: 1,
      member_id_a: "late",
      member_id_b: null,
      member_a: { nickname: "Late", avatar_url: null, generasi: null },
      member_b: null,
    },
  ];

  const snapshot = buildOverviewSnapshot(rows, 6);

  assert.equal(snapshot.show_event_sessions, 7);
  assert.equal(snapshot.birthday_sessions, 1);
  assert.equal(snapshot.graduation_sessions, 1);
  assert.equal(snapshot.assigned_show_event_slots, 8);
  assert.equal(snapshot.pending_slots, 2);
  assert.equal(snapshot.leaderboard.length, 3);
  assert.deepEqual(
    snapshot.leaderboard.map((row) => ({
      nickname: row.nickname,
      count: row.count,
      rank: row.rank,
    })),
    [
      { nickname: "Gracie", count: 2, rank: 1 },
      { nickname: "Michie", count: 2, rank: 1 },
      { nickname: "Fritzy", count: 2, rank: 1 },
    ],
  );
  assert.equal(snapshot.recent_assignments.length, 6);
  assert.deepEqual(
    snapshot.recent_assignments.map((row) => row.event_name),
    ["Show Alpha", "Show Alpha", "Show Beta", "Show Gamma", "Show Delta", "Show Epsilon"],
  );
});

test("buildMemberArchive groups duplicate slots once per event and caps recent history at 12", () => {
  const rows = [
    {
      id: "evt-13",
      event_name: "Newest",
      event_type: "Roulette",
      start_time: "2026-07-13T09:00:00+07:00",
      slot_mode: 2,
      member_id_a: "double",
      member_id_b: "double",
    },
    ...Array.from({ length: 12 }, (_, index) => ({
      id: `evt-${12 - index}`,
      event_name: `Event ${12 - index}`,
      event_type: "Roulette",
      start_time: `2026-07-${String(12 - index).padStart(2, "0")}T09:00:00+07:00`,
      slot_mode: 1,
      member_id_a: "double",
      member_id_b: null,
    })),
  ];

  const { limitedHistoryMap, totalMap } = buildMemberArchive(rows);

  assert.equal(totalMap.double, 13);
  assert.equal(limitedHistoryMap.double.length, 12);
  assert.equal(limitedHistoryMap.double[0].event_name, "Newest");
  assert.equal(limitedHistoryMap.double.at(-1)?.event_name, "Event 2");
});
