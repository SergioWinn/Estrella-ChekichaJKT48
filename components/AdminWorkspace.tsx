"use client";

import { useMemo, useState } from "react";

import { MediaPlaceholder } from "@/components/MediaPlaceholder";
import {
  createEventAction,
  createMemberAction,
  deleteEventAction,
  deleteMemberAction,
  updateEventAction,
  updateMemberAction,
  updateQueueAction,
} from "@/lib/v2-actions.ts";
import { formatEventDate, formatEventTime } from "@/lib/format.ts";
import { GENERATION_OPTIONS, STATUS_OPTIONS, TIME_STEP_MINUTES, singleMemberEvent } from "@/lib/v2-helpers.ts";
import type { ChekichaRow, EventPreset, MemberRecord } from "@/lib/types.ts";

const ADMIN_TABS = [
  { key: "queue", label: "Fill Results" },
  { key: "events", label: "Events" },
  { key: "members", label: "Members" },
] as const;

type AdminTabKey = (typeof ADMIN_TABS)[number]["key"];
const JAKARTA_TIME_ZONE = "Asia/Jakarta";

function hasPendingSlotA(row: Pick<ChekichaRow, "member_id_a">) {
  return !String(row.member_id_a ?? "").trim();
}

function hasPendingSlotB(row: Pick<ChekichaRow, "member_id_b" | "slot_mode">) {
  return Number(row.slot_mode || 1) === 2 && !String(row.member_id_b ?? "").trim();
}

function getJakartaParts(value?: string | null) {
  const dt = value ? new Date(value) : null;
  if (!dt || Number.isNaN(dt.getTime())) {
    return null;
  }

  const parts = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
    month: "2-digit",
    timeZone: JAKARTA_TIME_ZONE,
    year: "numeric",
  }).formatToParts(dt);

  const values = Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
  return {
    dateValue: `${values.year}-${values.month}-${values.day}`,
    timeValue: `${values.hour}:${values.minute}`,
  };
}

function eventDateValue(value?: string | null) {
  return getJakartaParts(value)?.dateValue || "";
}

function eventTimeValue(value?: string | null) {
  return getJakartaParts(value)?.timeValue || "00:00";
}

function eventOptionLabel(event: ChekichaRow) {
  return `${event.event_name || "Untitled event"} | ${formatEventDate(event.start_time)} | ${formatEventTime(event.start_time, event.end_time)} WIB`;
}

function memberOptionLabel(member: MemberRecord) {
  return `${member.nickname || "Unknown"} (${member.full_name || "No full name"})`;
}

const TIME_OPTIONS = Array.from({ length: (24 * 60) / TIME_STEP_MINUTES }, (_, index) => {
  const totalMinutes = index * TIME_STEP_MINUTES;
  const hour = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
  const minute = String(totalMinutes % 60).padStart(2, "0");
  return `${hour}:${minute}`;
});

function AdminStatCard({ label, value, tone = "text-[var(--foreground)]" }: { label: string; tone?: string; value: number | string }) {
  return (
    <article className="app-card p-5">
      <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">{label}</div>
      <div className={`mt-3 text-4xl font-extrabold tracking-[-0.05em] ${tone}`}>{value}</div>
    </article>
  );
}

function EventPreviewCard({
  eventName,
  eventType,
  eventImageUrl,
  dateText,
  footer,
}: {
  dateText?: string;
  eventImageUrl?: string | null;
  eventName: string;
  eventType: string;
  footer?: string;
}) {
  return (
    <div className="app-card p-5">
      <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Event details</div>
      <div className="mt-4 grid gap-4 md:grid-cols-[1.2fr_0.8fr] md:items-center">
        <div>
          <div className="text-4xl font-extrabold tracking-[-0.05em] text-[var(--foreground)]">{eventName}</div>
          {dateText ? <div className="mt-4 text-base text-[var(--muted)]">{dateText}</div> : null}
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full border border-[var(--accent-soft-strong)] bg-[var(--accent-soft)] px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[var(--foreground)]">
              Type {eventType}
            </span>
            {footer ? (
              <span className="rounded-full border border-[var(--border)] bg-[var(--surface-hover)] px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[var(--foreground-soft)]">
                {footer}
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex min-h-40 items-center justify-center overflow-hidden rounded-[1.35rem] border border-[var(--border)] bg-[var(--panel)]">
          {eventImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={eventImageUrl} alt={eventName} className="h-full w-full object-contain" />
          ) : (
            <MediaPlaceholder />
          )}
        </div>
      </div>
    </div>
  );
}

function MemberPreviewCard({
  nickname,
  fullName,
  status,
  generasi,
  avatarUrl,
  title,
}: {
  avatarUrl?: string;
  fullName: string;
  generasi: string;
  nickname: string;
  status: string;
  title: string;
}) {
  return (
    <div className="app-card p-5">
      <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">{title}</div>
      <div className="mt-4 grid gap-4 md:grid-cols-[1.2fr_0.8fr] md:items-center">
        <div>
          <div className="text-4xl font-extrabold tracking-[-0.05em] text-[var(--foreground)]">{nickname || "Nickname"}</div>
          <div className="mt-4 text-xl text-[var(--muted)]">{fullName || "Full name"}</div>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full border border-[var(--border)] bg-[var(--surface-hover)] px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[var(--foreground-soft)]">
              {status}
            </span>
            <span className="rounded-full border border-[var(--border)] bg-[var(--surface-hover)] px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[var(--foreground-soft)]">
              Gen {generasi}
            </span>
          </div>
        </div>
        <div className="flex min-h-40 items-center justify-center overflow-hidden rounded-[1.35rem] border border-[var(--border)] bg-[var(--panel)]">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt={nickname || "Member avatar"} className="h-full w-full object-cover" />
          ) : (
            <span className="rounded-full border border-dashed border-[var(--border-strong)] px-6 py-8 text-center text-sm font-semibold text-[var(--muted)]">
              No avatar URL yet.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function AdminWorkspace({
  error,
  events,
  members,
  presets,
  pendingCount,
  success,
}: {
  error: string;
  events: ChekichaRow[];
  members: MemberRecord[];
  pendingCount: number;
  presets: EventPreset[];
  success: string;
}) {
  const [activeTab, setActiveTab] = useState<AdminTabKey>("queue");
  const [createPresetId, setCreatePresetId] = useState(presets[0]?.id ?? "");
  const [createDate, setCreateDate] = useState(new Date().toISOString().slice(0, 10));
  const [createTimeValue, setCreateTimeValue] = useState("09:00");
  const [createSlotMode, setCreateSlotMode] = useState("1");
  const [createMemberA, setCreateMemberA] = useState("");
  const [createMemberB, setCreateMemberB] = useState("");
  const [newNickname, setNewNickname] = useState("");
  const [newFullName, setNewFullName] = useState("");
  const [newStatus, setNewStatus] = useState<string>(STATUS_OPTIONS[0] || "LOVE");
  const [newGenerasi, setNewGenerasi] = useState<string>(String(GENERATION_OPTIONS[0] || 3));
  const [newAvatarUrl, setNewAvatarUrl] = useState("");
  const [selectedEventId, setSelectedEventId] = useState(String(events[0]?.id || ""));
  const [selectedMemberId, setSelectedMemberId] = useState(members[0]?.id || "");

  const selectedCreatePreset = useMemo(() => presets.find((preset) => preset.id === createPresetId) ?? presets[0] ?? null, [createPresetId, presets]);
  const selectedEvent = useMemo(() => events.find((event) => String(event.id || "") === selectedEventId) ?? events[0] ?? null, [events, selectedEventId]);
  const selectedMember = useMemo(() => members.find((member) => member.id === selectedMemberId) ?? members[0] ?? null, [members, selectedMemberId]);
  const queueRows = useMemo(
    () =>
      [...events]
        .filter((event) => hasPendingSlotA(event) || hasPendingSlotB(event))
        .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()),
    [events],
  );
  const waitingSlotACount = queueRows.filter((event) => hasPendingSlotA(event)).length;
  const waitingSlotBCount = queueRows.filter((event) => hasPendingSlotB(event)).length;
  const createEventType = selectedCreatePreset?.event_type || "Roulette";
  const createSingleMember = singleMemberEvent(createEventType);
  const createEventDateText = `${createDate || "No date"} | ${createTimeValue} WIB`;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[1.7fr_1fr]">
        <div className="app-shell p-6 sm:p-8">
          <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Admin console</div>
          <h2 className="mt-4 max-w-4xl text-4xl font-extrabold tracking-[-0.06em] text-[var(--foreground)] sm:text-6xl">
            Operate the archive, not the public showcase.
          </h2>
          <p className="mt-6 max-w-4xl text-lg leading-9 text-[var(--muted)] sm:text-[1.45rem]">
            Manage members, schedule archive rows, and resolve waiting roulette slots from one restricted workspace.
          </p>
        </div>
        <div className="app-shell p-6">
          <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Restricted workspace</div>
          <p className="mt-3 text-xl leading-8 text-[var(--foreground-soft)]">
            This page is visible only to accounts with the <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-base font-semibold text-[var(--foreground)]">admin</span> role.
          </p>
        </div>
      </section>

      {success ? <div className="rounded-2xl border border-[var(--accent-soft-strong)] bg-[var(--accent-soft)] p-3 text-sm text-[var(--accent)]">{success}</div> : null}
      {error ? <div className="rounded-2xl border border-[var(--danger-border)] bg-[var(--danger-soft)] p-3 text-sm text-[var(--danger-foreground)]">{error}</div> : null}

      <div className="rounded-[1.4rem] border border-[var(--accent-soft-strong)] bg-[var(--accent-soft)] px-5 py-4 text-lg font-bold text-[var(--accent)]">
        Admin role active
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <AdminStatCard label="Waiting now" tone="text-[var(--danger)]" value={pendingCount} />
        <AdminStatCard label="Event presets" value={presets.length} />
        <AdminStatCard label="Members" value={members.length} />
      </section>

      <nav className="flex flex-wrap gap-2 border-b border-[var(--border)] pb-1">
        {ADMIN_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`border-b-[3px] px-0 py-3 text-[1.05rem] font-semibold transition ${
              activeTab === tab.key
                ? "border-[var(--accent)] text-[var(--foreground)]"
                : "border-transparent text-[var(--muted)] hover:text-[var(--foreground)]"
            } mr-6`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {activeTab === "queue" ? (
        <section className="space-y-4">
          <div className="rounded-[1.8rem] border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8">
            <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Primary queue</div>
            <h3 className="mt-4 text-3xl font-extrabold tracking-[-0.05em] text-[var(--foreground)] sm:text-5xl">Update Roulette Results</h3>
            <p className="mt-5 max-w-4xl text-lg leading-9 text-[var(--muted)]">
              Resolve waiting entries first. Slot assignment is the most time-sensitive admin task, so it stays at the front of this workspace.
            </p>
          </div>

          <section className="grid gap-4 md:grid-cols-3">
            <AdminStatCard label="Queue size" value={queueRows.length} />
            <AdminStatCard label="Waiting slot A" value={waitingSlotACount} />
            <AdminStatCard label="Waiting slot B" value={waitingSlotBCount} />
          </section>

          {queueRows.length ? (
            <section className="grid gap-6 xl:grid-cols-2">
              {queueRows.map((event) => {
                const waitingA = hasPendingSlotA(event);
                const waitingB = hasPendingSlotB(event) && !singleMemberEvent(event.event_type);

                return (
                  <form key={String(event.id || `${event.event_name}-${event.start_time}`)} action={updateQueueAction} className="space-y-4 rounded-[1.75rem] border border-[var(--border)] bg-[var(--surface)] p-5">
                    <input type="hidden" name="event_id" value={event.id || ""} />
                    <input type="hidden" name="event_name" value={event.event_name || "Event"} />
                    <input type="hidden" name="slot_mode" value={event.slot_mode || 1} />
                    <div className="grid gap-4 md:grid-cols-[1fr_8rem] md:items-start">
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Waiting draw</div>
                        <div className="mt-4 text-4xl font-extrabold tracking-[-0.05em] text-[var(--foreground)]">{event.event_name || "Untitled event"}</div>
                        <div className="mt-5 text-lg text-[var(--muted)]">{formatEventDate(event.start_time)} | {formatEventTime(event.start_time, event.end_time)} WIB</div>
                        <div className="mt-5 flex flex-wrap gap-2">
                          {waitingA ? <span className="rounded-full border border-[var(--border)] bg-[var(--surface-hover)] px-4 py-2 text-sm font-bold uppercase tracking-[0.08em] text-[var(--foreground)]">Slot A waiting for roulette</span> : null}
                          {waitingB ? <span className="rounded-full border border-[var(--border)] bg-[var(--surface-hover)] px-4 py-2 text-sm font-bold uppercase tracking-[0.08em] text-[var(--foreground)]">Slot B waiting for roulette</span> : null}
                        </div>
                      </div>
                      <div className="flex h-36 items-center justify-center overflow-hidden rounded-[1.25rem] border border-[var(--border)] bg-[var(--panel)]">
                        {event.event_image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={event.event_image_url} alt={event.event_name || "Event banner"} className="h-full w-full object-contain" />
                        ) : (
                          <MediaPlaceholder />
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-sm font-semibold text-[var(--muted)]">Assign result</label>
                      <select name="member_id_a" defaultValue={event.member_id_a || ""} className="min-h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3 text-lg text-[var(--foreground)] outline-none">
                        <option value="">{singleMemberEvent(event.event_type) ? "None (Member waiting)" : "None (Waiting for roulette)"}</option>
                        {members.map((member) => (
                          <option key={member.id} value={member.id}>{memberOptionLabel(member)}</option>
                        ))}
                      </select>
                    </div>

                    {waitingB ? (
                      <div className="space-y-3">
                        <label className="block text-sm font-semibold text-[var(--muted)]">Assign slot B</label>
                        <select name="member_id_b" defaultValue={event.member_id_b || ""} className="min-h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3 text-lg text-[var(--foreground)] outline-none">
                          <option value="">None (Waiting for roulette)</option>
                          {members.map((member) => (
                            <option key={member.id} value={member.id}>{memberOptionLabel(member)}</option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <input type="hidden" name="member_id_b" value={event.member_id_b || ""} />
                    )}

                    <button className="min-h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-5 py-3 text-lg font-semibold text-[var(--foreground)] transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)]">
                      Save result
                    </button>
                  </form>
                );
              })}
            </section>
          ) : (
            <div className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)] p-6 text-sm text-[var(--muted)]">No roulette rows are waiting right now.</div>
          )}
        </section>
      ) : null}

      {activeTab === "events" ? (
        <section className="space-y-4">
          <div className="rounded-[1.8rem] border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8">
            <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Schedule desk</div>
            <h3 className="mt-4 text-3xl font-extrabold tracking-[-0.05em] text-[var(--foreground)] sm:text-5xl">Create or edit archive rows</h3>
            <p className="mt-5 max-w-4xl text-lg leading-9 text-[var(--muted)]">
              Use the event tools below to schedule a new row or correct an existing one without losing context.
            </p>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <section className="space-y-5 rounded-[1.75rem] border border-[var(--border)] bg-[var(--surface)] p-5">
              <div className="text-xl font-bold text-[var(--foreground)]">Create event row</div>
              <form action={createEventAction} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-[var(--muted)]">Event date</label>
                  <input type="date" name="event_date" value={createDate} onChange={(event) => setCreateDate(event.target.value)} className="min-h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3 text-lg text-[var(--foreground)] outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-[var(--muted)]">Time</label>
                  <select name="start_time_value" value={createTimeValue} onChange={(event) => setCreateTimeValue(event.target.value)} className="min-h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3 text-lg text-[var(--foreground)] outline-none">
                    {TIME_OPTIONS.map((value) => (
                      <option key={value} value={value}>{value}</option>
                    ))}
                  </select>
                  <input type="hidden" name="start_hour" value={createTimeValue.slice(0, 2)} />
                  <input type="hidden" name="start_minute" value={createTimeValue.slice(3, 5)} />
                </div>
                <p className="text-sm text-[var(--muted)]">Scheduled for {createDate || "no date yet"} at {createTimeValue}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-[var(--muted)]">Event / Setlist</label>
                    <select
                      name="event_name"
                      value={selectedCreatePreset?.event_name || ""}
                      onChange={(event) => {
                        const preset = presets.find((item) => item.event_name === event.target.value);
                        if (preset) {
                          setCreatePresetId(preset.id);
                          if (singleMemberEvent(preset.event_type)) {
                            setCreateSlotMode("1");
                            setCreateMemberB("");
                          }
                        }
                      }}
                      className="min-h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3 text-lg text-[var(--foreground)] outline-none"
                    >
                      {presets.map((preset) => (
                        <option key={preset.id} value={preset.event_name}>{preset.event_name}</option>
                      ))}
                    </select>
                    <input type="hidden" name="event_type" value={createEventType} />
                    <input type="hidden" name="event_image_url" value={selectedCreatePreset?.event_image_url || ""} />
                  </div>
                </div>
                {createSingleMember ? <input type="hidden" name="slot_mode" value="1" /> : (
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-[var(--muted)]">Slot mode</label>
                    <select name="slot_mode" value={createSlotMode} onChange={(event) => setCreateSlotMode(event.target.value)} className="min-h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3 text-lg text-[var(--foreground)] outline-none">
                      <option value="1">1 slot</option>
                      <option value="2">2 slots</option>
                    </select>
                  </div>
                )}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-[var(--muted)]">Assign slot A now</label>
                  <select name="member_id_a" value={createMemberA} onChange={(event) => setCreateMemberA(event.target.value)} className="min-h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3 text-lg text-[var(--foreground)] outline-none">
                    <option value="">None (Waiting for roulette)</option>
                    {members.map((member) => (
                      <option key={member.id} value={member.id}>{memberOptionLabel(member)}</option>
                    ))}
                  </select>
                </div>
                {!createSingleMember && createSlotMode === "2" ? (
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-[var(--muted)]">Assign slot B now</label>
                    <select name="member_id_b" value={createMemberB} onChange={(event) => setCreateMemberB(event.target.value)} className="min-h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3 text-lg text-[var(--foreground)] outline-none">
                      <option value="">None (Waiting for roulette)</option>
                      {members.map((member) => (
                        <option key={member.id} value={member.id}>{memberOptionLabel(member)}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <input type="hidden" name="member_id_b" value="" />
                )}
                <EventPreviewCard
                  eventName={selectedCreatePreset?.event_name || "Select a preset"}
                  eventType={createEventType}
                  eventImageUrl={selectedCreatePreset?.event_image_url}
                  dateText={createEventDateText}
                  footer={createSingleMember ? "Single-member event" : `${createSlotMode} slot mode`}
                />
                <button className="min-h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-5 py-3 text-lg font-semibold text-[var(--foreground)] transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)]">
                  Save event row
                </button>
              </form>
            </section>

            <section className="space-y-5 rounded-[1.75rem] border border-[var(--border)] bg-[var(--surface)] p-5">
              <div className="text-xl font-bold text-[var(--foreground)]">Edit event row</div>
              {selectedEvent ? (
                <>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-[var(--muted)]">Saved event row</label>
                    <select value={selectedEventId} onChange={(event) => setSelectedEventId(event.target.value)} className="min-h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3 text-lg text-[var(--foreground)] outline-none">
                      {events.map((event) => (
                        <option key={String(event.id || event.start_time)} value={String(event.id || "")}>{eventOptionLabel(event)}</option>
                      ))}
                    </select>
                  </div>
                  <div key={String(selectedEvent.id || "no-event")} className="space-y-4">
                    <form action={updateEventAction} className="space-y-4">
                      <input type="hidden" name="event_id" value={selectedEvent.id || ""} />
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-[var(--muted)]">Event date</label>
                        <input type="date" name="event_date" defaultValue={eventDateValue(selectedEvent.start_time)} className="min-h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3 text-lg text-[var(--foreground)] outline-none" />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-[var(--muted)]">Time</label>
                        <select name="start_time_value" defaultValue={eventTimeValue(selectedEvent.start_time)} className="min-h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3 text-lg text-[var(--foreground)] outline-none">
                          {TIME_OPTIONS.map((value) => (
                            <option key={value} value={value}>{value}</option>
                          ))}
                        </select>
                        <input type="hidden" name="start_hour" value={eventTimeValue(selectedEvent.start_time).slice(0, 2)} />
                        <input type="hidden" name="start_minute" value={eventTimeValue(selectedEvent.start_time).slice(3, 5)} />
                      </div>
                      <p className="text-sm text-[var(--muted)]">Scheduled for {eventDateValue(selectedEvent.start_time)} at {eventTimeValue(selectedEvent.start_time)} WIB</p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-[var(--muted)]">Event / Setlist</label>
                          <input name="event_name" defaultValue={selectedEvent.event_name || ""} className="min-h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3 text-lg text-[var(--foreground)] outline-none" />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-[var(--muted)]">Event type</label>
                          <input name="event_type" defaultValue={selectedEvent.event_type || "Roulette"} className="min-h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3 text-lg text-[var(--foreground)] outline-none" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-[var(--muted)]">Event image URL</label>
                        <input name="event_image_url" defaultValue={selectedEvent.event_image_url || ""} className="min-h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3 text-base text-[var(--foreground)] outline-none" />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-[var(--muted)]">Slot mode</label>
                        <select name="slot_mode" defaultValue={String(selectedEvent.slot_mode || 1)} className="min-h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3 text-lg text-[var(--foreground)] outline-none">
                          <option value="1">1 slot</option>
                          <option value="2">2 slots</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-[var(--muted)]">Member slot A</label>
                        <select name="member_id_a" defaultValue={selectedEvent.member_id_a || ""} className="min-h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3 text-lg text-[var(--foreground)] outline-none">
                          <option value="">None (Waiting for roulette)</option>
                          {members.map((member) => (
                            <option key={member.id} value={member.id}>{memberOptionLabel(member)}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-[var(--muted)]">Member slot B</label>
                        <select name="member_id_b" defaultValue={selectedEvent.member_id_b || ""} className="min-h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3 text-lg text-[var(--foreground)] outline-none">
                          <option value="">None (Waiting for roulette)</option>
                          {members.map((member) => (
                            <option key={member.id} value={member.id}>{memberOptionLabel(member)}</option>
                          ))}
                        </select>
                      </div>
                      <EventPreviewCard
                        eventName={selectedEvent.event_name || "Untitled event"}
                        eventType={selectedEvent.event_type || "Roulette"}
                        eventImageUrl={selectedEvent.event_image_url}
                        dateText={`${formatEventDate(selectedEvent.start_time)} | ${formatEventTime(selectedEvent.start_time, selectedEvent.end_time)} WIB`}
                        footer={`Current mode: ${selectedEvent.slot_mode || 1} slot`}
                      />
                      <button className="min-h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-5 py-3 text-lg font-semibold text-[var(--foreground)] transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)]">
                        Save event changes
                      </button>
                    </form>
                    <form action={deleteEventAction} className="rounded-[1.5rem] border border-[var(--danger-border)] bg-[var(--danger-soft)] p-4">
                      <input type="hidden" name="event_id" value={selectedEvent.id || ""} />
                      <input type="hidden" name="event_name" value={selectedEvent.event_name || "Event"} />
                      <label className="flex items-center gap-3 text-sm text-[var(--danger-foreground)]">
                        <input type="checkbox" name="confirm_delete" />
                        Confirm delete for this event row
                      </label>
                      <button className="mt-4 rounded-2xl border border-[var(--danger-border)] px-4 py-3 text-sm font-semibold text-[var(--danger)]">Delete event row</button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)] p-6 text-sm text-[var(--muted)]">No event rows are available to edit yet.</div>
              )}
            </section>
          </div>
        </section>
      ) : null}

      {activeTab === "members" ? (
        <section className="space-y-4">
          <div className="rounded-[1.8rem] border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8">
            <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Member registry</div>
            <h3 className="mt-4 text-3xl font-extrabold tracking-[-0.05em] text-[var(--foreground)] sm:text-5xl">Manage collector roster</h3>
            <p className="mt-5 max-w-4xl text-lg leading-9 text-[var(--muted)]">
              Add a new member quickly or open the edit tool only when you need to change existing records.
            </p>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <section className="space-y-5 rounded-[1.75rem] border border-[var(--border)] bg-[var(--surface)] p-5">
              <div className="text-xl font-bold text-[var(--foreground)]">Add member</div>
              <form action={createMemberAction} className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-[var(--muted)]">Nickname</label>
                    <input name="nickname" value={newNickname} onChange={(event) => setNewNickname(event.target.value)} className="min-h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3 text-lg text-[var(--foreground)] outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-[var(--muted)]">Full name</label>
                    <input name="full_name" value={newFullName} onChange={(event) => setNewFullName(event.target.value)} className="min-h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3 text-lg text-[var(--foreground)] outline-none" />
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-[var(--muted)]">Team / status</label>
                    <select name="status" value={newStatus} onChange={(event) => setNewStatus(event.target.value)} className="min-h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3 text-lg text-[var(--foreground)] outline-none">
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-[var(--muted)]">Generation</label>
                    <select name="generasi" value={newGenerasi} onChange={(event) => setNewGenerasi(event.target.value)} className="min-h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3 text-lg text-[var(--foreground)] outline-none">
                      {GENERATION_OPTIONS.map((generation) => (
                        <option key={generation} value={generation}>{generation}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-[var(--muted)]">Avatar URL</label>
                  <input name="avatar_url" value={newAvatarUrl} onChange={(event) => setNewAvatarUrl(event.target.value)} className="min-h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3 text-base text-[var(--foreground)] outline-none" />
                </div>
                <MemberPreviewCard
                  title="Preview"
                  nickname={newNickname || "Nickname"}
                  fullName={newFullName || "Full name"}
                  status={newStatus}
                  generasi={newGenerasi}
                  avatarUrl={newAvatarUrl}
                />
                <button className="min-h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-5 py-3 text-lg font-semibold text-[var(--foreground)] transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)]">
                  Save member
                </button>
              </form>
            </section>

            <section className="space-y-5 rounded-[1.75rem] border border-[var(--border)] bg-[var(--surface)] p-5">
              <div className="text-xl font-bold text-[var(--foreground)]">Edit / delete member</div>
              {selectedMember ? (
                <>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-[var(--muted)]">Member record</label>
                    <select value={selectedMemberId} onChange={(event) => setSelectedMemberId(event.target.value)} className="min-h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3 text-lg text-[var(--foreground)] outline-none">
                      {members.map((member) => (
                        <option key={member.id} value={member.id}>{memberOptionLabel(member)}</option>
                      ))}
                    </select>
                  </div>
                  <div key={selectedMember.id} className="space-y-4">
                    <form action={updateMemberAction} className="space-y-4">
                      <input type="hidden" name="member_id" value={selectedMember.id} />
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-[var(--muted)]">Edit nickname</label>
                          <input name="nickname" defaultValue={selectedMember.nickname || ""} className="min-h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3 text-lg text-[var(--foreground)] outline-none" />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-[var(--muted)]">Edit full name</label>
                          <input name="full_name" defaultValue={selectedMember.full_name || ""} className="min-h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3 text-lg text-[var(--foreground)] outline-none" />
                        </div>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-[var(--muted)]">Edit team / status</label>
                          <select name="status" defaultValue={selectedMember.status || "LOVE"} className="min-h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3 text-lg text-[var(--foreground)] outline-none">
                            {STATUS_OPTIONS.map((status) => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-[var(--muted)]">Edit generation</label>
                          <select name="generasi" defaultValue={String(selectedMember.generasi || 3)} className="min-h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3 text-lg text-[var(--foreground)] outline-none">
                            {GENERATION_OPTIONS.map((generation) => (
                              <option key={generation} value={generation}>{generation}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-[var(--muted)]">Edit avatar URL</label>
                        <input name="avatar_url" defaultValue={selectedMember.avatar_url || ""} className="min-h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3 text-base text-[var(--foreground)] outline-none" />
                      </div>
                      <MemberPreviewCard
                        title="Edit preview"
                        nickname={selectedMember.nickname || "Nickname"}
                        fullName={selectedMember.full_name || "Full name"}
                        status={selectedMember.status || "LOVE"}
                        generasi={String(selectedMember.generasi || 3)}
                        avatarUrl={selectedMember.avatar_url || undefined}
                      />
                      <button className="min-h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-5 py-3 text-lg font-semibold text-[var(--foreground)] transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)]">
                        Save member changes
                      </button>
                    </form>
                    <form action={deleteMemberAction} className="rounded-[1.5rem] border border-[var(--danger-border)] bg-[var(--danger-soft)] p-4">
                      <input type="hidden" name="member_id" value={selectedMember.id} />
                      <input type="hidden" name="nickname" value={selectedMember.nickname || "Member"} />
                      <label className="flex items-center gap-3 text-sm text-[var(--danger-foreground)]">
                        <input type="checkbox" name="confirm_delete" />
                        Confirm delete for this member record
                      </label>
                      <button className="mt-4 rounded-2xl border border-[var(--danger-border)] px-4 py-3 text-sm font-semibold text-[var(--danger)]">Delete member</button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)] p-6 text-sm text-[var(--muted)]">No members are available to edit yet.</div>
              )}
            </section>
          </div>
        </section>
      ) : null}
    </div>
  );
}
