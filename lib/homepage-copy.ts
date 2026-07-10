import { formatEventDate } from "./format.ts";
import type { OverviewSnapshot } from "./types.ts";

export function buildHomepageCopy(snapshot: OverviewSnapshot) {
  const topMember = snapshot.leaderboard[0] ?? null;
  const waitingCopy = snapshot.pending_slots
    ? `${snapshot.pending_slots} draw${snapshot.pending_slots === 1 ? "" : "s"} still waiting`
    : "No open draws right now";

  return {
    latestShowEventCopy: snapshot.latest_show_event ? formatEventDate(snapshot.latest_show_event) : "No show/event dates yet",
    topMemberName: topMember?.nickname ?? "No ranking yet",
    topMemberSubcopy: topMember
      ? `${topMember.count} time${topMember.count === 1 ? "" : "s"} so far`
      : "Ranking starts after someone appears at least two times in show/event cheki",
    waitingCopy,
    quickCounts: [
      {
        label: "Show / Event sessions",
        value: snapshot.show_event_sessions,
        copy: "All non-birthday, non-graduation archive rows",
      },
      {
        label: "Birthday sessions",
        value: snapshot.birthday_sessions,
        copy: "Special single-member birthday rows",
      },
      {
        label: "Graduation sessions",
        value: snapshot.graduation_sessions,
        copy: "Special graduation archive rows",
      },
      {
        label: "Assigned show/event slots",
        value: snapshot.assigned_show_event_slots,
        copy: "Filled slots that feed ranking and recent activity",
      },
    ],
  };
}
