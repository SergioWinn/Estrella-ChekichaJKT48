import test from "node:test";
import assert from "node:assert/strict";

import { buildTimelineCardState, buildTimelineFilterNote, filterTimelineEvents, getRouletteSeriesOptions } from "../lib/timeline-view.ts";

test("buildTimelineFilterNote mirrors the Streamlit filter copy", () => {
  assert.equal(buildTimelineFilterNote("All"), "Showing every event type across all months");
  assert.equal(buildTimelineFilterNote("Roulette", "Ramadhan"), "Showing only Ramadhan roulette sessions");
  assert.equal(buildTimelineFilterNote("Birthday"), "Showing only Birthday events");
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
