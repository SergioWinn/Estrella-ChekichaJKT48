import test from "node:test";
import assert from "node:assert/strict";

import { buildHomepageCopy } from "../lib/homepage-copy.ts";

test("buildHomepageCopy mirrors the Streamlit homepage messaging", () => {
  const copy = buildHomepageCopy({
    assigned_show_event_slots: 77,
    birthday_sessions: 42,
    graduation_sessions: 4,
    latest_show_event: new Date("2026-07-11T00:00:00+07:00"),
    leaderboard: [
      {
        avatar_url: null,
        count: 5,
        generasi: 11,
        last_seen: new Date("2026-07-10T00:00:00+07:00"),
        member_id: "chelsea",
        nickname: "Chelsea",
        rank: 1,
      },
    ],
    pending_slots: 2,
    recent_assignments: [],
    show_event_sessions: 65,
  });

  assert.equal(copy.waitingCopy, "2 draws still waiting");
  assert.equal(copy.topMemberName, "Chelsea");
  assert.equal(copy.topMemberSubcopy, "5 times so far");
  assert.equal(copy.quickCounts[0]?.label, "Show / Event sessions");
  assert.equal(copy.quickCounts[0]?.value, 65);
  assert.equal(copy.quickCounts[3]?.label, "Assigned show/event slots");
  assert.equal(copy.quickCounts[3]?.copy, "Filled slots that feed ranking and recent activity");
});
