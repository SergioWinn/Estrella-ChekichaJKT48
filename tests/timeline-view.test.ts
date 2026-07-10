import test from "node:test";
import assert from "node:assert/strict";

import { buildTimelineCardState, buildTimelineFilterNote } from "../lib/timeline-view.ts";

test("buildTimelineFilterNote mirrors the Streamlit filter copy", () => {
  assert.equal(buildTimelineFilterNote("All"), "Showing every event type");
  assert.equal(buildTimelineFilterNote("Birthday"), "Showing only Birthday events");
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
