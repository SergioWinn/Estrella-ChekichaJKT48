import { supabaseSelect } from "./supabase.ts";
import type {
  ChekichaRow,
  MemberHistoryEntry,
  MemberRecord,
  MemberRelation,
  OverviewAssignment,
  OverviewLeaderboardEntry,
  OverviewSnapshot,
  TimelineEvent,
} from "./types.ts";
import { formatMonthLabel } from "./format.ts";

const SPECIAL_EVENT_TYPES = new Set(["Birthday", "Graduation"]);

export function relationToMember(value: MemberRelation | MemberRelation[] | null | undefined): MemberRelation {
  if (Array.isArray(value)) {
    return value[0] ?? {};
  }

  return value ?? {};
}

export function isShowEvent(eventType: string | null | undefined): boolean {
  return !SPECIAL_EVENT_TYPES.has(eventType ?? "");
}

export function countPendingSlots(rows: Pick<ChekichaRow, "member_id_a" | "member_id_b" | "slot_mode">[]): number {
  let pending = 0;

  for (const row of rows) {
    const slotMode = row.slot_mode || 1;
    if (!row.member_id_a) {
      pending += 1;
    }
    if (slotMode === 2 && !row.member_id_b) {
      pending += 1;
    }
  }

  return pending;
}

export function buildOverviewSnapshot(eventRows: ChekichaRow[], recentLimit = 6): OverviewSnapshot {
  let showEventSessions = 0;
  let birthdaySessions = 0;
  let graduationSessions = 0;
  let pendingSlots = 0;
  let latestShowEvent: Date | null = null;
  const assignments: OverviewAssignment[] = [];

  for (const row of eventRows) {
    const eventType = row.event_type;
    const slotMode = row.slot_mode || 1;
    const startTime = new Date(row.start_time);

    if (eventType === "Birthday") {
      birthdaySessions += 1;
    } else if (eventType === "Graduation") {
      graduationSessions += 1;
    } else {
      showEventSessions += 1;
      if (!latestShowEvent || startTime > latestShowEvent) {
        latestShowEvent = startTime;
      }
    }

    const memberA = relationToMember(row.member_a);
    const memberB = relationToMember(row.member_b);

    if (!row.member_id_a) {
      pendingSlots += 1;
    } else if (isShowEvent(eventType)) {
      assignments.push({
        member_id: row.member_id_a || row.id || row.event_name || "unknown-a",
        nickname: memberA.nickname || "Unknown member",
        avatar_url: memberA.avatar_url,
        generasi: memberA.generasi,
        event_name: row.event_name || "Untitled event",
        event_type: eventType || "Roulette",
        start_time: row.start_time,
        start_dt: startTime,
        slot_key: "A",
      });
    }

    if (slotMode === 2) {
      if (!row.member_id_b) {
        pendingSlots += 1;
      } else if (isShowEvent(eventType)) {
        assignments.push({
          member_id: row.member_id_b || row.id || row.event_name || "unknown-b",
          nickname: memberB.nickname || "Unknown member",
          avatar_url: memberB.avatar_url,
          generasi: memberB.generasi,
          event_name: row.event_name || "Untitled event",
          event_type: eventType || "Roulette",
          start_time: row.start_time,
          start_dt: startTime,
          slot_key: "B",
        });
      }
    }
  }

  const leaderboardMap = new Map<string, Omit<OverviewLeaderboardEntry, "rank">>();
  for (const item of assignments) {
    const existing = leaderboardMap.get(item.member_id);
    if (!existing) {
      leaderboardMap.set(item.member_id, {
        member_id: item.member_id,
        nickname: item.nickname,
        avatar_url: item.avatar_url,
        generasi: item.generasi,
        count: 1,
        last_seen: item.start_dt,
      });
      continue;
    }

    existing.count += 1;
    if (item.start_dt > existing.last_seen) {
      existing.last_seen = item.start_dt;
      existing.avatar_url = item.avatar_url;
      existing.generasi = item.generasi;
      existing.nickname = item.nickname;
    }
  }

  const leaderboard = Array.from(leaderboardMap.values())
    .filter((item) => item.count >= 2)
    .sort((left, right) => {
      if (right.count !== left.count) {
        return right.count - left.count;
      }
      if (right.last_seen.getTime() !== left.last_seen.getTime()) {
        return right.last_seen.getTime() - left.last_seen.getTime();
      }
      return left.nickname.localeCompare(right.nickname);
    })
    .map((item) => ({ ...item, rank: 0 }));

  let lastCount: number | null = null;
  let lastRank = 0;
  leaderboard.forEach((item, index) => {
    if (item.count !== lastCount) {
      lastRank = index + 1;
      lastCount = item.count;
    }
    item.rank = lastRank;
  });

  const recentAssignments = [...assignments]
    .sort((left, right) => right.start_dt.getTime() - left.start_dt.getTime())
    .slice(0, recentLimit);

  return {
    show_event_sessions: showEventSessions,
    birthday_sessions: birthdaySessions,
    graduation_sessions: graduationSessions,
    assigned_show_event_slots: assignments.length,
    pending_slots: pendingSlots,
    latest_show_event: latestShowEvent,
    leaderboard,
    recent_assignments: recentAssignments,
  };
}

export function groupTimelineByMonth(events: TimelineEvent[]): Array<[string, TimelineEvent[]]> {
  const grouped = new Map<string, TimelineEvent[]>();

  for (const event of events) {
    const monthLabel = formatMonthLabel(event.start_time);
    const list = grouped.get(monthLabel) ?? [];
    list.push(event);
    grouped.set(monthLabel, list);
  }

  return Array.from(grouped.entries());
}

export function memberMatchesQuery(member: MemberRecord, query: string): boolean {
  const haystack = [
    member.nickname || "",
    member.full_name || "",
    member.status || "",
    String(member.generasi || ""),
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(query.trim().toLowerCase());
}

export function buildMemberArchive(rows: MemberHistoryEntry[]) {
  const historyMap: Record<string, MemberHistoryEntry[]> = {};

  for (const row of rows) {
    const memberIds = new Set([row.member_id_a, row.member_id_b].filter(Boolean) as string[]);
    for (const memberId of memberIds) {
      historyMap[memberId] ??= [];
      historyMap[memberId].push(row);
    }
  }

  const totalMap: Record<string, number> = {};
  const limitedHistoryMap: Record<string, MemberHistoryEntry[]> = {};
  for (const [memberId, memberRows] of Object.entries(historyMap)) {
    totalMap[memberId] = memberRows.length;
    limitedHistoryMap[memberId] = memberRows.slice(0, 12);
  }

  return { limitedHistoryMap, totalMap };
}

export async function loadOverviewRows(): Promise<ChekichaRow[]> {
  return supabaseSelect<ChekichaRow>(
    "chekicha",
    "id,event_type,event_name,start_time,slot_mode,member_id_a,member_id_b,member_a:member_id_a(nickname,avatar_url,generasi),member_b:member_id_b(nickname,avatar_url,generasi)",
  );
}

export async function loadTimelineRows(): Promise<TimelineEvent[]> {
  return supabaseSelect<TimelineEvent>(
    "chekicha",
    "id,start_time,end_time,event_name,event_type,event_image_url,slot_mode,member_id_a,member_id_b,member_a:member_id_a(full_name,nickname,avatar_url),member_b:member_id_b(full_name,nickname,avatar_url)",
    { orderBy: "start_time", orderDirection: "desc" },
  );
}

export async function loadMembers(): Promise<MemberRecord[]> {
  return supabaseSelect<MemberRecord>(
    "members",
    "id,nickname,full_name,status,generasi,avatar_url",
    { orderBy: "nickname", orderDirection: "asc" },
  );
}

export async function loadMemberArchiveRows(): Promise<MemberHistoryEntry[]> {
  return supabaseSelect<MemberHistoryEntry>(
    "chekicha",
    "id,event_name,event_type,start_time,event_image_url,slot_mode,member_id_a,member_id_b",
    { orderBy: "start_time", orderDirection: "desc" },
  );
}
