"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { addCollectionQuantityToEntries } from "./v2-collection.ts";
import { createAdminSupabaseClient } from "./supabase-admin.ts";
import { createActionSupabaseClient } from "./supabase-ssr.ts";
import { eventCollectionUsageCount, getSessionContext, memberUsageCount, requireAdmin, requireUser } from "./v2-server.ts";
import { buildEventPayload, duplicateMemberLabels, getAuthRedirectPath, normalizeUsername, usernameToEmail, validateUsername } from "./v2-helpers.ts";

function withMessage(path: string, message: string, type: "error" | "success" = "error") {
  return `${path}?${type}=${encodeURIComponent(message)}`;
}

export async function loginAction(formData: FormData) {
  const supabase = await createActionSupabaseClient();
  const username = String(formData.get("username") || "");
  const password = String(formData.get("password") || "");
  const usernameError = validateUsername(username);

  if (usernameError) {
    redirect(withMessage("/login", usernameError));
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: usernameToEmail(username),
    password,
  });

  if (error) {
    redirect(withMessage("/login", error.message));
  }

  const { profile } = await getSessionContext();
  redirect(getAuthRedirectPath(profile));
}

export async function signupAction(formData: FormData) {
  const supabase = await createActionSupabaseClient();
  const username = String(formData.get("username") || "");
  const password = String(formData.get("password") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");
  const usernameError = validateUsername(username);

  if (usernameError) {
    redirect(withMessage("/signup", usernameError));
  }
  if (password.length < 8) {
    redirect(withMessage("/signup", "Use at least 8 characters for the password."));
  }
  if (password !== confirmPassword) {
    redirect(withMessage("/signup", "Passwords do not match."));
  }

  const { data, error } = await supabase.auth.signUp({
    email: usernameToEmail(username),
    password,
  });
  if (error) {
    redirect(withMessage("/signup", error.message));
  }
  if (!data.session || !data.user) {
    redirect(withMessage("/signup", "Sign-up did not return a login session. Disable email confirmation in Supabase Auth for this username-first flow."));
  }

  const { error: profileError } = await supabase.from("profiles").insert({
    id: data.user.id,
    username: normalizeUsername(username),
  });
  if (profileError) {
    redirect(withMessage("/signup", profileError.message));
  }

  redirect("/collection?success=Account%20created.");
}

export async function logoutAction() {
  const supabase = await createActionSupabaseClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function createMemberAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminSupabaseClient();
  const members = await (await import("./v2-server.ts")).loadAdminMembers(supabase as never);
  const nickname = String(formData.get("nickname") || "").trim();
  const fullName = String(formData.get("full_name") || "").trim();
  const status = String(formData.get("status") || "LOVE");
  const generasi = Number(formData.get("generasi") || 3);
  const avatarUrl = String(formData.get("avatar_url") || "").trim();

  if (!nickname || !fullName) {
    redirect(withMessage("/admin", "Nickname and full name are required."));
  }
  const duplicates = duplicateMemberLabels(members, nickname, fullName);
  if (duplicates.length) {
    redirect(withMessage("/admin", duplicates.join(" ")));
  }

  const { error } = await supabase.from("members").insert({
    nickname,
    full_name: fullName,
    status,
    generasi,
    avatar_url: avatarUrl || null,
  });
  if (error) {
    redirect(withMessage("/admin", error.message));
  }
  revalidatePath("/admin");
  redirect(withMessage("/admin", `${nickname} added to the member registry.`, "success"));
}

export async function updateMemberAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminSupabaseClient();
  const members = await (await import("./v2-server.ts")).loadAdminMembers(supabase as never);
  const memberId = String(formData.get("member_id") || "");
  const nickname = String(formData.get("nickname") || "").trim();
  const fullName = String(formData.get("full_name") || "").trim();
  const status = String(formData.get("status") || "LOVE");
  const generasi = Number(formData.get("generasi") || 3);
  const avatarUrl = String(formData.get("avatar_url") || "").trim();

  if (!nickname || !fullName) {
    redirect(withMessage("/admin", "Nickname and full name are required."));
  }
  const duplicates = duplicateMemberLabels(members, nickname, fullName, memberId);
  if (duplicates.length) {
    redirect(withMessage("/admin", duplicates.join(" ")));
  }

  const { error } = await supabase.from("members").update({
    nickname,
    full_name: fullName,
    status,
    generasi,
    avatar_url: avatarUrl || null,
  }).eq("id", memberId);
  if (error) {
    redirect(withMessage("/admin", error.message));
  }
  revalidatePath("/admin");
  redirect(withMessage("/admin", `${nickname} updated.`, "success"));
}

export async function deleteMemberAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminSupabaseClient();
  const memberId = String(formData.get("member_id") || "");
  const nickname = String(formData.get("nickname") || "Member");
  const confirmDelete = formData.get("confirm_delete") === "on";

  if (!confirmDelete) {
    redirect(withMessage("/admin", "Confirm delete first."));
  }
  if (await memberUsageCount(supabase as never, memberId)) {
    redirect(withMessage("/admin", "This member cannot be deleted because they already appear in archived sessions."));
  }

  const { error } = await supabase.from("members").delete().eq("id", memberId);
  if (error) {
    redirect(withMessage("/admin", error.message));
  }
  revalidatePath("/admin");
  redirect(withMessage("/admin", `${nickname} deleted.`, "success"));
}

export async function createEventAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminSupabaseClient();
  const eventType = String(formData.get("event_type") || "Roulette");
  const payload = buildEventPayload({
    eventDate: String(formData.get("event_date") || ""),
    eventType,
    preset: {
      event_name: String(formData.get("event_name") || ""),
      event_type: eventType,
      event_image_url: String(formData.get("event_image_url") || ""),
    },
    slotMode: Number(formData.get("slot_mode") || 1),
    startTimeValue: String(formData.get("start_time_value") || ""),
    startHour: Number(formData.get("start_hour") || 0),
    startMinute: Number(formData.get("start_minute") || 0),
    memberIdA: String(formData.get("member_id_a") || "") || null,
    memberIdB: String(formData.get("member_id_b") || "") || null,
  });

  const { error } = await supabase.from("chekicha").insert(payload);
  if (error) {
    redirect(withMessage("/admin", error.message));
  }
  revalidatePath("/admin");
  redirect(withMessage("/admin", `${payload.event_name} saved.`, "success"));
}

export async function updateEventAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminSupabaseClient();
  const eventId = String(formData.get("event_id") || "");
  const eventType = String(formData.get("event_type") || "Roulette");
  const payload = buildEventPayload({
    eventDate: String(formData.get("event_date") || ""),
    eventType,
    preset: {
      event_name: String(formData.get("event_name") || ""),
      event_type: eventType,
      event_image_url: String(formData.get("event_image_url") || ""),
    },
    slotMode: Number(formData.get("slot_mode") || 1),
    startTimeValue: String(formData.get("start_time_value") || ""),
    startHour: Number(formData.get("start_hour") || 0),
    startMinute: Number(formData.get("start_minute") || 0),
    memberIdA: String(formData.get("member_id_a") || "") || null,
    memberIdB: String(formData.get("member_id_b") || "") || null,
  });

  const { error } = await supabase.from("chekicha").update(payload).eq("id", eventId);
  if (error) {
    redirect(withMessage("/admin", error.message));
  }
  revalidatePath("/admin");
  redirect(withMessage("/admin", `${payload.event_name} updated.`, "success"));
}

export async function deleteEventAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminSupabaseClient();
  const eventId = String(formData.get("event_id") || "");
  const eventName = String(formData.get("event_name") || "Event");
  const confirmDelete = formData.get("confirm_delete") === "on";

  if (!confirmDelete) {
    redirect(withMessage("/admin", "Confirm delete first."));
  }
  if (await eventCollectionUsageCount(supabase as never, eventId)) {
    redirect(withMessage("/admin", "This event cannot be deleted because it is already saved in user collections."));
  }

  const { error } = await supabase.from("chekicha").delete().eq("id", eventId);
  if (error) {
    redirect(withMessage("/admin", error.message));
  }
  revalidatePath("/admin");
  redirect(withMessage("/admin", `${eventName} deleted.`, "success"));
}

export async function updateQueueAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminSupabaseClient();
  const eventId = String(formData.get("event_id") || "");
  const eventName = String(formData.get("event_name") || "Event");
  const payload = {
    slot_mode: Number(formData.get("slot_mode") || 1),
    member_id_a: String(formData.get("member_id_a") || "") || null,
    member_id_b: String(formData.get("member_id_b") || "") || null,
  };
  const { error } = await supabase.from("chekicha").update(payload).eq("id", eventId);
  if (error) {
    redirect(withMessage("/admin", error.message));
  }
  revalidatePath("/admin");
  redirect(withMessage("/admin", `${eventName} updated.`, "success"));
}

export async function addCollectionAction(formData: FormData) {
  const { supabase, user } = await requireUser();
  const userId = user.id;
  const eventId = String(formData.get("event_id") || "");
  const slotKey = String(formData.get("slot_key") || "A");
  const memberId = String(formData.get("member_id") || "");
  const quantity = Number(formData.get("quantity") || 1);
  const { data: entries } = await supabase.from("user_collection_entries").select("id, quantity, event_id, slot_key, user_id").eq("user_id", userId);

  const result = addCollectionQuantityToEntries(entries ?? [], {
    event_id: eventId,
    member_id: memberId,
    quantity,
    slot_key: slotKey,
    user_id: userId,
  });

  const error = result.type === "updated"
    ? (await supabase.from("user_collection_entries").update({ quantity: result.payload.quantity }).eq("id", result.payload.id).eq("user_id", userId)).error
    : (await supabase.from("user_collection_entries").insert({
        user_id: userId,
        event_id: eventId,
        slot_key: slotKey,
        member_id: memberId,
        quantity,
      })).error;

  if (error) {
    redirect(withMessage("/collection", error.message));
  }
  revalidatePath("/collection");
  redirect(withMessage("/collection", result.type === "updated" ? "Collection updated." : "Added to collection.", "success"));
}

export async function updateCollectionQuantityAction(formData: FormData) {
  const { supabase, user } = await requireUser();
  const entryId = String(formData.get("entry_id") || "");
  const quantity = Number(formData.get("quantity") || 1);
  const { error } = await supabase.from("user_collection_entries").update({ quantity }).eq("id", entryId).eq("user_id", user.id);
  if (error) {
    redirect(withMessage("/collection", error.message));
  }
  revalidatePath("/collection");
  redirect(withMessage("/collection", "Quantity saved.", "success"));
}

export async function deleteCollectionEntryAction(formData: FormData) {
  const { supabase, user } = await requireUser();
  const entryId = String(formData.get("entry_id") || "");
  const { error } = await supabase.from("user_collection_entries").delete().eq("id", entryId).eq("user_id", user.id);
  if (error) {
    redirect(withMessage("/collection", error.message));
  }
  revalidatePath("/collection");
  redirect(withMessage("/collection", "Entry removed.", "success"));
}
