const AUTH_EMAIL_DOMAIN = "users.chekitrack.local";

export const STATUS_OPTIONS = ["LOVE", "DREAM", "PASSION", "TRAINEE", "GRADUATED"] as const;
export const GENERATION_OPTIONS = [3, 6, 7, 8, 9, 10, 11, 12, 13, 14] as const;
export const TIME_STEP_MINUTES = 15;

const JAKARTA_OFFSET_MINUTES = 7 * 60;

export interface AuthProfile {
  created_at?: string;
  id?: string;
  role?: string | null;
  username?: string | null;
}

export interface EventPreset {
  event_image_url?: string | null;
  event_name: string;
  event_type: string;
  id?: string;
  is_active?: boolean;
  sort_order?: number | null;
}

export function normalizeUsername(username: string): string {
  return (username || "").trim().toLowerCase();
}

export function validateUsername(username: string): string | null {
  const normalized = normalizeUsername(username);
  return /^[a-z0-9](?:[a-z0-9._-]{1,28}[a-z0-9])?$/.test(normalized)
    ? null
    : "Use 3-30 characters: lowercase letters, numbers, dot, underscore, or hyphen.";
}

export function usernameToEmail(username: string): string {
  return `${normalizeUsername(username)}@${AUTH_EMAIL_DOMAIN}`;
}

export function getAuthRedirectPath(profile: AuthProfile | null | undefined): "/admin" | "/collection" {
  return profile?.role === "admin" ? "/admin" : "/collection";
}

export function singleMemberEvent(eventType: string | null | undefined): boolean {
  return eventType === "Birthday" || eventType === "Graduation";
}

export function getEventDurationMinutes(eventType: string): number {
  return singleMemberEvent(eventType) ? 60 : 15;
}

export function duplicateMemberLabels(
  members: Array<{ full_name?: string | null; id?: string; nickname?: string | null }>,
  nickname: string,
  fullName: string,
  excludeId?: string,
): string[] {
  const nicknameKey = nickname.trim().toLowerCase();
  const fullNameKey = fullName.trim().toLowerCase();
  const duplicates: string[] = [];

  for (const member of members) {
    if (excludeId && member.id === excludeId) {
      continue;
    }
    const memberNickname = String(member.nickname || "").trim().toLowerCase();
    const memberFullName = String(member.full_name || "").trim().toLowerCase();

    if (nicknameKey && memberNickname === nicknameKey) {
      duplicates.push(`Nickname already used by ${member.full_name || member.nickname}.`);
    }
    if (fullNameKey && memberFullName === fullNameKey) {
      duplicates.push(`Full name already exists for ${member.nickname || member.full_name}.`);
    }
  }

  return duplicates;
}

export function buildEventPayload(args: {
  eventDate: string;
  eventType: string;
  memberIdA?: string | null;
  memberIdB?: string | null;
  preset: EventPreset;
  slotMode: number;
  startTimeValue?: string;
  startHour: number;
  startMinute: number;
}) {
  const durationMinutes = getEventDurationMinutes(args.eventType);
  const [timeHour, timeMinute] = String(args.startTimeValue || "")
    .split(":")
    .map((part) => Number(part));
  const startHour = Number.isFinite(timeHour) ? timeHour : args.startHour;
  const startMinute = Number.isFinite(timeMinute) ? timeMinute : args.startMinute;
  const startUtcMs = Date.UTC(
    Number(args.eventDate.slice(0, 4)),
    Number(args.eventDate.slice(5, 7)) - 1,
    Number(args.eventDate.slice(8, 10)),
    startHour,
    startMinute,
  ) - JAKARTA_OFFSET_MINUTES * 60_000;
  const start = new Date(startUtcMs);
  const end = new Date(start.getTime() + durationMinutes * 60_000);
  const isSingle = singleMemberEvent(args.eventType);

  return {
    start_time: start.toISOString(),
    end_time: end.toISOString(),
    event_name: args.preset.event_name,
    event_type: args.preset.event_type,
    event_image_url: args.preset.event_image_url || null,
    slot_mode: isSingle ? 1 : args.slotMode,
    member_id_a: args.memberIdA || null,
    member_id_b: isSingle || args.slotMode !== 2 ? null : args.memberIdB || null,
  };
}
