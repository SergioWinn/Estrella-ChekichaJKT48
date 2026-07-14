export interface MemberRelation {
  avatar_url?: string | null;
  full_name?: string | null;
  generasi?: number | null;
  nickname?: string | null;
  status?: string | null;
}

export interface ChekichaRow {
  end_time?: string | null;
  event_image_url?: string | null;
  event_name?: string | null;
  event_series?: string | null;
  event_type?: string | null;
  id?: string | null;
  member_a?: MemberRelation | MemberRelation[] | null;
  member_b?: MemberRelation | MemberRelation[] | null;
  member_id_a?: string | null;
  member_id_b?: string | null;
  slot_mode?: number | null;
  start_time: string;
}

export interface OverviewAssignment {
  avatar_url?: string | null;
  event_name: string;
  event_type: string;
  generasi?: number | null;
  member_id: string;
  nickname: string;
  slot_key: "A" | "B";
  start_dt: Date;
  start_time?: string | null;
}

export interface OverviewLeaderboardEntry {
  avatar_url?: string | null;
  count: number;
  generasi?: number | null;
  last_seen: Date;
  member_id: string;
  nickname: string;
  rank: number;
}

export interface OverviewSnapshot {
  assigned_show_event_slots: number;
  birthday_sessions: number;
  graduation_sessions: number;
  latest_show_event: Date | null;
  leaderboard: OverviewLeaderboardEntry[];
  pending_slots: number;
  recent_assignments: OverviewAssignment[];
  show_event_sessions: number;
}

export interface TimelineEvent extends ChekichaRow {
  member_a?: MemberRelation | null;
  member_b?: MemberRelation | null;
}

export interface MemberRecord {
  avatar_url?: string | null;
  full_name?: string | null;
  generasi?: number | null;
  id: string;
  nickname?: string | null;
  status?: string | null;
}

export interface MemberHistoryEntry extends ChekichaRow {
  id: string;
}

export interface AuthProfile {
  created_at?: string;
  id: string;
  role?: string | null;
  username?: string | null;
}

export interface EventPreset {
  event_image_url?: string | null;
  event_name: string;
  event_series?: string | null;
  event_type: string;
  id: string;
  is_active?: boolean;
  sort_order?: number | null;
}

export interface CollectionEntry {
  created_at?: string;
  end_time?: string | null;
  event_id: string;
  event_image_url?: string | null;
  event_name: string;
  event_type: string;
  id: string;
  member_avatar_url?: string | null;
  member_full_name?: string | null;
  member_generasi?: number | null;
  member_id: string;
  member_name: string;
  member_status?: string | null;
  quantity: number;
  start_time?: string | null;
  slot_key: string;
  updated_at?: string;
  user_id: string;
}
