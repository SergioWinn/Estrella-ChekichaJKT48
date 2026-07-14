import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";

import { buildCollectibleSlots, hydrateCollectionEntries, type CollectibleSlot } from "./v2-collection.ts";
import { supabaseSelect } from "./supabase.ts";
import { createServerSupabaseClient } from "./supabase-ssr.ts";
import type { AuthProfile, CollectionEntry, EventPreset, MemberRecord } from "./types.ts";
import type { ChekichaRow } from "./types.ts";

export async function getSessionContext() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: AuthProfile | null = null;
  if (user) {
    const { data } = await supabase.from("profiles").select("id, username, role, created_at").eq("id", user.id).maybeSingle();
    profile = data;
  }

  return { supabase, user, profile };
}

type SessionContext = Awaited<ReturnType<typeof getSessionContext>>;
type AuthenticatedSessionContext = SessionContext & { user: User };

export async function requireUser() {
  const context = await getSessionContext();
  if (!context.user) {
    redirect("/login");
  }
  return context as AuthenticatedSessionContext;
}

export async function requireAdmin() {
  const context = await requireUser();
  if (context.profile?.role !== "admin") {
    redirect("/");
  }
  return context;
}

export async function loadEventPresets(supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>): Promise<EventPreset[]> {
  void supabase;
  return supabaseSelect<EventPreset>(
    "event_presets",
    "id,event_name,event_type,event_image_url,sort_order,is_active",
    { filters: { is_active: "eq.true" }, orderBy: "sort_order", orderDirection: "asc" },
  );
}

export async function loadAdminEventRows(supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>): Promise<ChekichaRow[]> {
  void supabase;
  return supabaseSelect<ChekichaRow>(
    "chekicha",
    "id,event_name,event_type,start_time,end_time,event_image_url,slot_mode,member_id_a,member_id_b",
    { orderBy: "start_time", orderDirection: "desc" },
  );
}

export async function loadAdminMembers(supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>): Promise<MemberRecord[]> {
  void supabase;
  return supabaseSelect<MemberRecord>(
    "members",
    "id,nickname,full_name,status,generasi,avatar_url",
    { orderBy: "nickname", orderDirection: "asc" },
  );
}

export async function memberUsageCount(supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>, memberId: string): Promise<number> {
  const { data } = await supabase.from("chekicha").select("id").or(`member_id_a.eq.${memberId},member_id_b.eq.${memberId}`);
  return data?.length ?? 0;
}

export async function eventCollectionUsageCount(supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>, eventId: string): Promise<number> {
  const { data } = await supabase.from("user_collection_entries").select("id").eq("event_id", eventId);
  return data?.length ?? 0;
}

export async function loadCollectibleSlotsForUser(supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>): Promise<CollectibleSlot[]> {
  void supabase;
  return buildCollectibleSlots(
    await supabaseSelect<ChekichaRow>(
      "chekicha",
      "id,event_name,event_type,start_time,end_time,event_image_url,slot_mode,member_id_a,member_id_b,member_a:member_id_a(nickname,full_name,avatar_url,generasi,status),member_b:member_id_b(nickname,full_name,avatar_url,generasi,status)",
      { orderBy: "start_time", orderDirection: "desc" },
    ),
  );
}

export async function loadCollectionEntriesForUser(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  userId: string,
): Promise<CollectionEntry[]> {
  const { data: rows } = await supabase
    .from("user_collection_entries")
    .select("id, event_id, slot_key, member_id, quantity, created_at, updated_at, user_id")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (!rows?.length) {
    return [];
  }

  const eventIds = [...new Set(rows.map((row) => row.event_id))];
  const memberIds = [...new Set(rows.map((row) => row.member_id))];
  const [events, members, slotRows] = await Promise.all([
    supabaseSelect<{ end_time?: string | null; event_image_url?: string | null; event_name?: string | null; event_type?: string | null; id: string; start_time?: string | null }>(
      "chekicha",
      "id,event_name,event_type,start_time,end_time,event_image_url",
      { filters: { id: `in.(${eventIds.join(",")})` } },
    ),
    supabaseSelect<Pick<MemberRecord, "avatar_url" | "full_name" | "generasi" | "id" | "nickname" | "status">>(
      "members",
      "id,nickname,full_name,avatar_url,generasi,status",
      { filters: { id: `in.(${memberIds.join(",")})` } },
    ),
    supabaseSelect<ChekichaRow>(
      "chekicha",
      "id,event_name,event_type,start_time,end_time,event_image_url,slot_mode,member_id_a,member_id_b,member_a:member_id_a(nickname,full_name,avatar_url,generasi,status),member_b:member_id_b(nickname,full_name,avatar_url,generasi,status)",
      { filters: { id: `in.(${eventIds.join(",")})` } },
    ),
  ]);

  return hydrateCollectionEntries(
    rows,
    buildCollectibleSlots(slotRows),
    events.map((event) => ({
      event_id: event.id,
      event_name: event.event_name || "Archived event",
      event_type: event.event_type || "Roulette",
      start_time: event.start_time,
      end_time: event.end_time,
      event_image_url: event.event_image_url,
    })),
    members.map((member) => ({
      member_id: member.id,
      member_full_name: member.full_name,
      member_name: member.nickname || "Unknown member",
      member_status: member.status,
      member_avatar_url: member.avatar_url,
      member_generasi: member.generasi,
    })),
  );
}
