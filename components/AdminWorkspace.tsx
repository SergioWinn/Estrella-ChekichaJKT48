"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { EventResultLabel } from "@/components/EventResultLabel";
import { EventTeamBadge } from "@/components/EventTeamBadge";
import { MediaPlaceholder } from "@/components/MediaPlaceholder";
import { PendingSubmitButton } from "@/components/PendingSubmitButton";
import { SearchableSelect } from "@/components/SearchableSelect";
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
import { getRouletteSeriesOptions, matchesEventMemberStatus, matchesRouletteSeries } from "@/lib/timeline-view.ts";
import { GENERATION_OPTIONS, STATUS_OPTIONS, getEffectiveEventTeam, getEventResultStatus, getEventSlotProgress, getFixedEventTeam, singleMemberEvent } from "@/lib/v2-helpers.ts";
import type { ChekichaRow, EventPreset, MemberRecord } from "@/lib/types.ts";

const MANUAL_EVENT_TEAM_OPTIONS = ["LOVE", "DREAM", "PASSION"] as const;
const STANDARD_EVENT_TYPES = ["Roulette", "Birthday", "Graduation"];

const ADMIN_TABS = [
  { key: "queue", label: "Fill Results" },
  { key: "events", label: "Events" },
  { key: "members", label: "Members" },
] as const;

type AdminTabKey = (typeof ADMIN_TABS)[number]["key"];
const JAKARTA_TIME_ZONE = "Asia/Jakarta";

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
  const team = getEffectiveEventTeam(event.event_name, event.event_type, event.event_team);
  return `${event.event_name || "Untitled event"} | ${team} | ${formatEventDate(event.start_time)} | ${formatEventTime(event.start_time, event.end_time)} WIB`;
}

function presetOptionLabel(preset: EventPreset) {
  const fixedTeam = getFixedEventTeam(preset.event_name, preset.event_type);
  return `${preset.event_name} | ${fixedTeam ? `${fixedTeam}` : "Choose team"}`;
}

function coerceManualEventTeam(value: string | null | undefined) {
  const team = String(value || "").toUpperCase();
  return team === "DREAM" || team === "PASSION" ? team : "LOVE";
}

function memberOptionLabel(member: MemberRecord) {
  return `${member.nickname || "Unknown"} (${member.full_name || "No full name"})`;
}

function matchesAdminEventFilters(event: Pick<ChekichaRow, "event_type" | "event_name" | "event_series">, type: string, series: string) {
  const eventType = event.event_type || "Roulette";
  if (type !== "All" && eventType !== type) return false;
  if (type !== "All" && type !== "Roulette") return true;
  return series === "All" || (eventType === "Roulette" && matchesRouletteSeries(event, series));
}

function AdminFilterSelect({ id, label, allLabel, options, value, onChange }: {
  id: string;
  label: string;
  allLabel: string;
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-1">
      <label htmlFor={id} className="text-sm font-semibold text-[var(--muted-strong)]">{label}</label>
      <select id={id} value={value} onChange={(event) => onChange(event.target.value)} className="app-input min-h-12 w-full min-w-0 px-3 text-base">
        <option value="All">{allLabel}</option>
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </div>
  );
}

function AdminRecordList({ label, records, eventTypeOptions, rouletteSeriesOptions, memberStatusOptions, selectedId, createLabel, creating, onSelect, onCreate }: {
  label: string;
  records: { id: string; title: string; detail: string; event?: ChekichaRow; memberStatus?: string }[];
  eventTypeOptions?: string[];
  rouletteSeriesOptions?: string[];
  memberStatusOptions?: readonly string[];
  selectedId: string;
  createLabel: string;
  creating: boolean;
  onSelect: (id: string) => void;
  onCreate: () => void;
}) {
  const [query, setQuery] = useState("");
  const [eventType, setEventType] = useState("All");
  const [rouletteSeries, setRouletteSeries] = useState("All");
  const [memberStatus, setMemberStatus] = useState("All");
  const normalized = query.trim().toLowerCase();
  const matches = records.filter(({ title, detail, event, memberStatus: recordStatus }) =>
    `${title} ${detail}`.toLowerCase().includes(normalized) &&
    (event
      ? matchesAdminEventFilters(event, eventType, rouletteSeries) && matchesEventMemberStatus(event, memberStatus)
      : memberStatus === "All" || recordStatus === memberStatus),
  );

  function resetFilters() {
    setQuery("");
    setEventType("All");
    setRouletteSeries("All");
    setMemberStatus("All");
  }

  return (
    <aside className="admin-record-list" aria-label={label}>
      <button type="button" className="archive-primary-action" onClick={onCreate} aria-pressed={creating}>{createLabel}</button>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
        <input
          type="search"
          aria-label={`Search ${label.toLowerCase()}`}
          placeholder={`Search ${label.toLowerCase()}`}
          className="app-input min-h-12 w-full px-3 text-base"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <button type="button" className="archive-secondary-action" aria-label={`Reset ${label.toLowerCase()} search and filters`} onClick={resetFilters}>
          Reset
        </button>
      </div>
      {eventTypeOptions && (
        <AdminFilterSelect id="admin-event-type-filter" label="Event type" allLabel="All event types" options={eventTypeOptions} value={eventType} onChange={setEventType} />
      )}
      {!!rouletteSeriesOptions?.length && (eventType === "All" || eventType === "Roulette") && (
        <AdminFilterSelect id="admin-event-series-filter" label="Roulette series" allLabel="All roulette series" options={rouletteSeriesOptions} value={rouletteSeries} onChange={setRouletteSeries} />
      )}
      {memberStatusOptions && (
        <AdminFilterSelect id="admin-member-status-filter" label="Member status" allLabel="All" options={memberStatusOptions} value={memberStatus} onChange={setMemberStatus} />
      )}
      {matches.length ? (
        <ul className="admin-record-items">
          {matches.map((record) => (
            <li key={record.id}>
              <button type="button" aria-pressed={!creating && selectedId === record.id} onClick={() => onSelect(record.id)}>
                <strong className={record.event ? "flex flex-wrap items-center justify-between gap-x-2 gap-y-1" : undefined}>
                  {record.title}
                  {record.event && <EventResultLabel status={getEventResultStatus(record.event)} />}
                </strong>
                <span>{record.detail}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : <p className="archive-empty">{records.length ? `No ${label.toLowerCase()} match these filters.` : "No records yet."}</p>}
    </aside>
  );
}

const EARLIEST_START_TIME = "12:45";
const LATEST_START_TIME = "21:15";

function EventPreviewCard({
  eventName,
  eventType,
  eventImageUrl,
  eventTeam,
  dateText,
  footer,
}: {
  dateText?: string;
  eventImageUrl?: string | null;
  eventTeam?: string | null;
  eventName: string;
  eventType: string;
  footer?: string;
}) {
  return (
    <details className="app-disclosure border-t border-[var(--border)] pt-4">
      <summary className="cursor-pointer text-sm font-semibold text-[var(--foreground)]">Preview event</summary>
      <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] md:items-center">
        <div>
          <div className="text-4xl font-semibold tracking-[-0.05em] text-[var(--foreground)]">{eventName}</div>
          {dateText ? <div className="mt-4 text-base text-[var(--muted)]">{dateText}</div> : null}
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full border border-[var(--accent-soft-strong)] bg-[var(--accent-soft)] px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[var(--foreground)]">
              Type {eventType}
            </span>
            <EventTeamBadge team={eventTeam} eventType={eventType} />
            {footer ? (
              <span className="rounded-full border border-[var(--border)] bg-[var(--surface-hover)] px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[var(--foreground-soft)]">
                {footer}
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex min-h-40 items-center justify-center overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--panel)]">
          {eventImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={eventImageUrl} alt={eventName} className="h-full w-full object-contain" />
          ) : (
            <MediaPlaceholder />
          )}
        </div>
      </div>
    </details>
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
    <details className="app-disclosure border-t border-[var(--border)] pt-4">
      <summary className="cursor-pointer text-sm font-semibold text-[var(--foreground)]">{title}</summary>
      <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] md:items-center">
        <div>
          <div className="text-4xl font-semibold tracking-[-0.05em] text-[var(--foreground)]">{nickname || "Nickname"}</div>
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
        <div className="flex min-h-40 items-center justify-center overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--panel)]">
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
    </details>
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
  const [queueQuery, setQueueQuery] = useState("");
  const [queueEventType, setQueueEventType] = useState("All");
  const [queueSeries, setQueueSeries] = useState("All");
  const [queueMemberStatus, setQueueMemberStatus] = useState("All");
  const [editor, setEditor] = useState<"edit" | "create" | null>(null);
  const editorHeading = useRef<HTMLHeadingElement>(null);
  const listTrigger = useRef<HTMLElement | null>(null);
  const [createPresetId, setCreatePresetId] = useState(presets[0]?.id ?? "");
  const [createDate, setCreateDate] = useState(new Date().toISOString().slice(0, 10));
  const [createTimeValue, setCreateTimeValue] = useState(EARLIEST_START_TIME);
  const [createSlotMode, setCreateSlotMode] = useState("1");
  const [createEventTeam, setCreateEventTeam] = useState(coerceManualEventTeam(presets[0]?.event_team));
  const [createMemberA, setCreateMemberA] = useState("");
  const [createMemberB, setCreateMemberB] = useState("");
  const [editState, setEditState] = useState<{ eventId: string; eventType: string; slotMode: string } | null>(null);
  const [editEventName, setEditEventName] = useState(events[0]?.event_name || "");
  const [editEventTeam, setEditEventTeam] = useState(coerceManualEventTeam(events[0]?.event_team));
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
  const selectedEventKey = String(selectedEvent?.id || "");
  const selectedEditState = editState?.eventId === selectedEventKey ? editState : null;
  const editEventType = selectedEditState?.eventType || selectedEvent?.event_type || "Roulette";
  const editSlotMode = selectedEditState?.slotMode || String(selectedEvent?.slot_mode || 1);
  const queueRows = useMemo(
    () =>
      events
        .filter((event) => getEventSlotProgress(event).waitingCount > 0)
        .toSorted((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()),
    [events],
  );
  const queueSeriesOptions = useMemo(() => getRouletteSeriesOptions(queueRows), [queueRows]);
  const queueSearch = queueQuery.trim().toLocaleLowerCase();
  const matchingQueueRows = new Set(queueRows.filter((event) =>
    (!queueSearch || [event.event_name || "Untitled event", event.event_series].some((name) => name?.toLocaleLowerCase().includes(queueSearch))) &&
    matchesAdminEventFilters(event, queueEventType, queueSeries) &&
    matchesEventMemberStatus(event, queueMemberStatus),
  ));
  useEffect(() => {
    if (editor && !window.matchMedia("(min-width: 48rem)").matches) {
      editorHeading.current?.focus();
    }
  }, [editor]);

  const eventRecords = useMemo(() => events.flatMap((event) => event.id ? [{
    id: String(event.id),
    title: event.event_name || "Untitled event",
    detail: `${formatEventDate(event.start_time)} · ${formatEventTime(event.start_time, event.end_time)} WIB · ${getEffectiveEventTeam(event.event_name, event.event_type, event.event_team)}`,
    event,
  }] : []), [events]);
  const eventTypeOptions = useMemo(() => [...new Set([...STANDARD_EVENT_TYPES, ...events.map((event) => event.event_type || "Roulette")])], [events]);
  const rouletteSeriesOptions = useMemo(() => getRouletteSeriesOptions(events), [events]);
  const memberRecords = useMemo(() => members.map((member) => ({
    id: member.id,
    title: member.nickname || "Unknown member",
    detail: [member.full_name, member.status].filter(Boolean).join(" · "),
    memberStatus: member.status?.toUpperCase(),
  })), [members]);
  const createEventType = selectedCreatePreset?.event_type || "Roulette";
  const createSingleMember = singleMemberEvent(createEventType);
  const editSingleMember = singleMemberEvent(editEventType);
  const showEditSlotB = !editSingleMember && editSlotMode === "2";
  const createFixedTeam = getFixedEventTeam(selectedCreatePreset?.event_name, createEventType);
  const createManualTeam = coerceManualEventTeam(createEventTeam);
  const createSelectedTeam = createFixedTeam ?? createManualTeam;
  const editFixedTeam = getFixedEventTeam(editEventName, editEventType);
  const editManualTeam = coerceManualEventTeam(editEventTeam);
  const editSelectedTeam = editFixedTeam ?? editManualTeam;
  const createEventDateText = `${createDate || "No date"} | ${createTimeValue} WIB`;
  const memberOptions = useMemo(() => members.map((member) => ({
    label: memberOptionLabel(member),
    value: member.id,
    status: member.status?.toUpperCase(),
  })), [members]);

  function setEditEventType(nextValue: string) {
    setEditState({ eventId: selectedEventKey, eventType: nextValue, slotMode: editSlotMode });
  }

  function setEditSlotMode(nextValue: string) {
    setEditState({ eventId: selectedEventKey, eventType: editEventType, slotMode: nextValue });
  }

  function openEditor(mode: "edit" | "create") {
    listTrigger.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setEditor(mode);
  }

  function backToRecords() {
    setEditor(null);
    requestAnimationFrame(() => listTrigger.current?.focus());
  }

  function resetQueueFilters() {
    setQueueQuery("");
    setQueueEventType("All");
    setQueueSeries("All");
    setQueueMemberStatus("All");
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      {success ? <div role="status" aria-live="polite" className="app-status-message rounded-xl border border-[var(--accent-soft-strong)] bg-[var(--accent-soft)] p-3 text-sm font-semibold text-[var(--accent)]">{success}</div> : null}
      {error ? <div role="alert" className="app-status-message rounded-xl border border-[var(--danger-border)] bg-[var(--danger-soft)] p-3 text-sm text-[var(--danger-foreground)]">{error}</div> : null}

      <nav className="motion-section sticky top-2 z-[var(--z-sticky)] grid grid-cols-3 gap-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1 lg:static" aria-label="Admin workspace sections">
        {ADMIN_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => { setActiveTab(tab.key); setEditor(null); }}
            aria-pressed={activeTab === tab.key}
            className={`inline-flex min-h-11 min-w-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-2 text-xs font-semibold transition-colors sm:px-4 sm:text-sm ${
              activeTab === tab.key
                ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
                : "text-[var(--muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
            }`}
          >
            {tab.label}
            {tab.key === "queue" && pendingCount ? <span className="hidden tabular-nums text-[0.7em] opacity-80 sm:inline">{pendingCount}</span> : null}
          </button>
        ))}
      </nav>

      {activeTab === "queue" ? (
        <section className="app-tab-panel space-y-4">
          <header className="flex items-end justify-between gap-4 border-b border-[var(--border)] pb-4">
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold text-[var(--foreground)] sm:text-3xl">Fill results</h1>
              <p className="mt-1 text-sm text-[var(--muted)]">Choose each winning member, then save.</p>
            </div>
            <span role="status" className="shrink-0 text-sm font-semibold text-[var(--muted-strong)]">
              {matchingQueueRows.size === queueRows.length ? `${queueRows.length} waiting` : `${matchingQueueRows.size} of ${queueRows.length} waiting`}
            </span>
          </header>

          {queueRows.length ? (
            <>
            <search aria-label="Find pending events" className="grid max-w-md gap-2">
              <label htmlFor="queue-event-search" className="text-sm font-semibold text-[var(--muted-strong)]">Search events</label>
              <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                <input id="queue-event-search" type="search" placeholder="Event name or series" className="app-input min-h-12 w-full px-3 text-base" value={queueQuery} onChange={(event) => setQueueQuery(event.target.value)} />
                <button type="button" className="archive-secondary-action" aria-label="Reset pending event search and filters" onClick={resetQueueFilters}>Reset</button>
              </div>
              <AdminFilterSelect id="queue-event-type-filter" label="Event type" allLabel="All event types" options={eventTypeOptions} value={queueEventType} onChange={setQueueEventType} />
              {queueSeriesOptions.length > 0 && (queueEventType === "All" || queueEventType === "Roulette") && (
                <AdminFilterSelect id="queue-event-series-filter" label="Roulette series" allLabel="All roulette series" options={queueSeriesOptions} value={queueSeries} onChange={setQueueSeries} />
              )}
              <AdminFilterSelect id="queue-event-member-status-filter" label="Member status" allLabel="All" options={STATUS_OPTIONS} value={queueMemberStatus} onChange={setQueueMemberStatus} />
            </search>
            {!matchingQueueRows.size && <p className="archive-empty">No pending events match these filters.{queueMemberStatus !== "All" && " Member status applies to saved slot results."}</p>}
            <div className="admin-queue" hidden={!matchingQueueRows.size}>
              {queueRows.map((event, index) => {
                const { waitingA, waitingB, waitingCount } = getEventSlotProgress(event);

                return (
                  <form key={String(event.id || `${event.event_name}-${event.start_time}`)} action={updateQueueAction} className="admin-queue-row" hidden={!matchingQueueRows.has(event)}>
                    <input type="hidden" name="event_id" value={event.id || ""} />
                    <input type="hidden" name="event_name" value={event.event_name || "Event"} />
                    <input type="hidden" name="slot_mode" value={event.slot_mode || 1} />
                    <div className="min-w-0">
                      <div className="min-w-0">
                        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                          <h2 className="break-words font-semibold text-[var(--foreground)]">{event.event_name || "Untitled event"}</h2>
                          <EventResultLabel status={getEventResultStatus(event)} />
                        </div>
                        <div className="mt-1 flex min-w-0 flex-wrap items-center gap-2 text-sm text-[var(--muted)]"><EventTeamBadge team={event.event_team} eventType={event.event_type} /><span>{formatEventDate(event.start_time)} · {formatEventTime(event.start_time, event.end_time)} WIB</span></div>
                        <p className="mt-1 text-sm text-[var(--accent)]">{waitingCount} {waitingCount === 1 ? "result" : "results"} needed</p>
                      </div>
                    </div>

                    <div className="grid gap-3">
                      {waitingA ? (
                      <div className="space-y-2">
                        <label htmlFor={`queue-member-a-${index}`} className="block text-sm font-semibold text-[var(--muted-strong)]">{singleMemberEvent(event.event_type) ? "Member" : "Slot A member"}</label>
                        <SearchableSelect
                          id={`queue-member-a-${index}`}
                          ariaLabel={singleMemberEvent(event.event_type) ? "Member" : "Slot A member"}
                          name="member_id_a"
                          defaultValue={event.member_id_a || ""}
                          options={memberOptions}
                          statusOptions={STATUS_OPTIONS}
                          placeholder="Choose member"
                        />
                      </div>
                      ) : <input type="hidden" name="member_id_a" value={event.member_id_a || ""} />}
                      {waitingB ? (
                        <div className="space-y-2">
                          <label htmlFor={`queue-member-b-${index}`} className="block text-sm font-semibold text-[var(--muted-strong)]">Slot B member</label>
                          <SearchableSelect
                            id={`queue-member-b-${index}`}
                            ariaLabel="Slot B member"
                            name="member_id_b"
                            defaultValue={event.member_id_b || ""}
                            options={memberOptions}
                            statusOptions={STATUS_OPTIONS}
                            placeholder="Choose member"
                          />
                        </div>
                      ) : (
                        <input type="hidden" name="member_id_b" value={event.member_id_b || ""} />
                      )}
                    </div>

                    <PendingSubmitButton pendingLabel="Saving result…" className="min-h-11 w-full whitespace-nowrap rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-[var(--accent-foreground)] hover:bg-[var(--accent-strong)]">Save result</PendingSubmitButton>
                  </form>
                );
              })}
            </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface)] px-6 py-12 text-center text-sm text-[var(--muted)]">
              <svg aria-hidden="true" className="size-10 text-[var(--muted-strong)]" fill="none" viewBox="0 0 24 24"><path d="M12 6v6l4 2" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5"/><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/></svg>
              <span className="font-semibold text-[var(--foreground)]">All caught up</span>
              <span>No events are waiting for member assignments.</span>
            </div>
          )}
        </section>
      ) : null}

      {activeTab === "events" ? (
        <section className="app-tab-panel space-y-4">
          <header className="border-b border-[var(--border)] pb-4">
            <h1 className="text-2xl font-semibold text-[var(--foreground)] sm:text-3xl">Events</h1>
          </header>

          <div className="admin-record-layout" data-editor-open={editor !== null}>
            <AdminRecordList label="Events" records={eventRecords} eventTypeOptions={eventTypeOptions} rouletteSeriesOptions={rouletteSeriesOptions} memberStatusOptions={STATUS_OPTIONS} selectedId={selectedEventKey} createLabel="Create event" creating={editor === "create"} onCreate={() => openEditor("create")} onSelect={(id) => {
              const nextEvent = events.find((item) => String(item.id) === id);
              setSelectedEventId(id);
              setEditEventName(nextEvent?.event_name || "");
              setEditEventTeam(coerceManualEventTeam(nextEvent?.event_team));
              setEditState(null);
              openEditor("edit");
            }} />
            <section className="admin-editor">
              <button type="button" className="admin-editor-back archive-secondary-action" onClick={backToRecords}>Back to events</button>
              {editor === "create" ? <>
              <h2 ref={editorHeading} tabIndex={-1}>Create event</h2>
              <form action={createEventAction} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-[var(--muted)]">Event date</label>
                  <input aria-label="Event date" type="date" name="event_date" value={createDate} onChange={(event) => setCreateDate(event.target.value)} className="app-input min-h-12 w-full px-4 py-3 text-lg" />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-[var(--muted)]">Time</label>
                  <input aria-label="Event start time" type="time" name="start_time_value" min={EARLIEST_START_TIME} max={LATEST_START_TIME} step="60" value={createTimeValue} onChange={(event) => setCreateTimeValue(event.target.value)} required className="app-input min-h-12 w-full px-4 py-3 text-lg" />
                </div>
                <p className="text-sm text-[var(--muted)]">Scheduled for {createDate || "no date yet"} at {createTimeValue}</p>
                <p className="text-sm text-[var(--muted)]">Leave slot fields empty if the roulette draw has not happened yet.</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-[var(--muted)]">Preset event name</label>
                    <select
                      aria-label="Preset event name"
                      value={createPresetId}
                      onChange={(event) => {
                        const preset = presets.find((item) => item.id === event.target.value);
                        if (preset) {
                          setCreatePresetId(preset.id);
                          setCreateEventTeam(coerceManualEventTeam(preset.event_team));
                          if (singleMemberEvent(preset.event_type)) {
                            setCreateSlotMode("1");
                            setCreateMemberB("");
                          }
                        }
                      }}
                      className="app-input min-h-12 w-full px-4 py-3 text-lg"
                    >
                      {presets.map((preset) => (
                        <option key={preset.id} value={preset.id}>{presetOptionLabel(preset)}</option>
                      ))}
                    </select>
                    <input type="hidden" name="event_name" value={selectedCreatePreset?.event_name || ""} />
                    <input type="hidden" name="event_type" value={createEventType} />
                    <input type="hidden" name="event_series" value={selectedCreatePreset?.event_series || ""} />
                    <input type="hidden" name="event_image_url" value={selectedCreatePreset?.event_image_url || ""} />
                  </div>
                </div>
                {createSingleMember ? <input type="hidden" name="event_team" value="ALL" /> : createFixedTeam ? (
                  <div className="space-y-2">
                    <input type="hidden" name="event_team" value={createSelectedTeam} />
                    <label className="block text-sm font-semibold text-[var(--muted)]">Performing team</label>
                    <select aria-label="Performing team" value={createSelectedTeam} disabled className="app-input min-h-12 w-full px-4 py-3 text-lg">
                      <option value={createSelectedTeam}>{createSelectedTeam}</option>
                    </select>
                    <p className="text-sm text-[var(--muted)]">Filled from setlist.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-[var(--muted)]">Performing team</label>
                    <select aria-label="Performing team" name="event_team" value={createManualTeam} onChange={(event) => setCreateEventTeam(event.target.value)} className="app-input min-h-12 w-full px-4 py-3 text-lg">
                      {MANUAL_EVENT_TEAM_OPTIONS.map((team) => <option key={team} value={team}>{team}</option>)}
                    </select>
                  </div>
                )}
                {createSingleMember ? <input type="hidden" name="slot_mode" value="1" /> : (
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-[var(--muted)]">Slot mode</label>
                    <select aria-label="Slot mode" name="slot_mode" value={createSlotMode} onChange={(event) => setCreateSlotMode(event.target.value)} className="app-input min-h-12 w-full px-4 py-3 text-lg">
                      <option value="1">1 slot</option>
                      <option value="2">2 slots</option>
                    </select>
                  </div>
                )}
                <div className="space-y-2">
                  <label htmlFor="create-member-a" className="block text-sm font-semibold text-[var(--muted)]">Member for slot A</label>
                  <SearchableSelect
                    id="create-member-a"
                    ariaLabel="Member for slot A"
                    name="member_id_a"
                    options={memberOptions}
                    statusOptions={STATUS_OPTIONS}
                    value={createMemberA}
                    onChange={setCreateMemberA}
                    placeholder="None (Waiting for roulette)"
                  />
                </div>
                {!createSingleMember && createSlotMode === "2" ? (
                  <div className="space-y-2">
                    <label htmlFor="create-member-b" className="block text-sm font-semibold text-[var(--muted)]">Member for slot B</label>
                    <SearchableSelect
                      id="create-member-b"
                      ariaLabel="Member for slot B"
                      name="member_id_b"
                      options={memberOptions}
                      statusOptions={STATUS_OPTIONS}
                      value={createMemberB}
                      onChange={setCreateMemberB}
                      placeholder="None (Waiting for roulette)"
                    />
                  </div>
                ) : (
                  <input type="hidden" name="member_id_b" value="" />
                )}
                <EventPreviewCard
                  eventName={selectedCreatePreset?.event_name || "Select a preset"}
                  eventType={createEventType}
                  eventImageUrl={selectedCreatePreset?.event_image_url}
                  eventTeam={createSelectedTeam}
                  dateText={createEventDateText}
                  footer={createSingleMember ? "Single-member event" : `${createSlotMode} slot mode`}
                />
                <PendingSubmitButton pendingLabel="Creating event…" className="min-h-11 w-full whitespace-nowrap rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-[var(--accent-foreground)] hover:bg-[var(--accent-strong)]">Create event</PendingSubmitButton>
              </form>
              </> : <>
              <h2 ref={editorHeading} tabIndex={-1}>Edit event</h2>
              {selectedEvent ? (
                <>
                  <p className="text-sm text-[var(--muted)]">{eventOptionLabel(selectedEvent)}</p>
                  <div key={String(selectedEvent.id || "no-event")} className="space-y-4">
                    <form action={updateEventAction} className="space-y-4">
                      <input type="hidden" name="event_id" value={selectedEvent.id || ""} />
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-[var(--muted)]">Event date</label>
                        <input aria-label="Event date" type="date" name="event_date" defaultValue={eventDateValue(selectedEvent.start_time)} className="app-input min-h-12 w-full px-4 py-3 text-lg" />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-[var(--muted)]">Time</label>
                        <input aria-label="Event start time" type="time" name="start_time_value" min={EARLIEST_START_TIME} max={LATEST_START_TIME} step="60" defaultValue={eventTimeValue(selectedEvent.start_time)} required className="app-input min-h-12 w-full px-4 py-3 text-lg" />
                      </div>
                      <p className="text-sm text-[var(--muted)]">Scheduled for {eventDateValue(selectedEvent.start_time)} at {eventTimeValue(selectedEvent.start_time)} WIB</p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-[var(--muted)]">Event name</label>
                          <input aria-label="Event name" name="event_name" value={editEventName} onChange={(event) => setEditEventName(event.target.value)} className="app-input min-h-12 w-full px-4 py-3 text-lg" />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-[var(--muted)]">Event type</label>
                          <input aria-label="Event type" name="event_type" value={editEventType} onChange={(event) => {
                            const nextType = event.target.value;
                            setEditEventType(nextType);
                            if (singleMemberEvent(nextType)) {
                              setEditSlotMode("1");
                              setEditEventTeam("ALL");
                            }
                          }} className="app-input min-h-12 w-full px-4 py-3 text-lg" />
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                          <label className="block text-sm font-semibold text-[var(--muted)]">Timeline series</label>
                          <input aria-label="Timeline series" name="event_series" defaultValue={selectedEvent.event_series || ""} placeholder="Example: Ramadhan" className="app-input min-h-12 w-full px-4 py-3 text-lg" />
                          <p className="text-sm text-[var(--muted)]">Roulette events with the same series share one timeline filter.</p>
                        </div>
                        {editSingleMember ? <input type="hidden" name="event_team" value="ALL" /> : editFixedTeam ? (
                          <div className="space-y-2 sm:col-span-2">
                            <input type="hidden" name="event_team" value={editSelectedTeam} />
                            <label className="block text-sm font-semibold text-[var(--muted)]">Performing team</label>
                            <select aria-label="Performing team" value={editSelectedTeam} disabled className="app-input min-h-12 w-full px-4 py-3 text-lg">
                              <option value={editSelectedTeam}>{editSelectedTeam}</option>
                            </select>
                            <p className="text-sm text-[var(--muted)]">Filled from setlist.</p>
                          </div>
                        ) : (
                          <div className="space-y-2 sm:col-span-2">
                            <label className="block text-sm font-semibold text-[var(--muted)]">Performing team</label>
                            <select aria-label="Performing team" name="event_team" value={editManualTeam} onChange={(event) => setEditEventTeam(event.target.value)} className="app-input min-h-12 w-full px-4 py-3 text-lg">
                              {MANUAL_EVENT_TEAM_OPTIONS.map((team) => <option key={team} value={team}>{team}</option>)}
                            </select>
                          </div>
                        )}
                      </div>
                      <input type="hidden" name="event_image_url" value={selectedEvent.event_image_url || ""} />
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-[var(--muted)]">Slot mode</label>
                        {editSingleMember ? <input type="hidden" name="slot_mode" value="1" /> : (
                          <select aria-label="Slot mode" name="slot_mode" value={editSlotMode} onChange={(event) => setEditSlotMode(event.target.value)} className="app-input min-h-12 w-full px-4 py-3 text-lg">
                            <option value="1">1 slot</option>
                            <option value="2">2 slots</option>
                          </select>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="edit-member-a" className="block text-sm font-semibold text-[var(--muted)]">Member for slot A</label>
                        <SearchableSelect
                          id="edit-member-a"
                          ariaLabel="Member for slot A"
                          name="member_id_a"
                          defaultValue={selectedEvent.member_id_a || ""}
                          options={memberOptions}
                          statusOptions={STATUS_OPTIONS}
                          placeholder="None (Waiting for roulette)"
                        />
                      </div>
                      {showEditSlotB ? (
                        <div className="space-y-2">
                          <label htmlFor="edit-member-b" className="block text-sm font-semibold text-[var(--muted)]">Member for slot B</label>
                          <SearchableSelect
                            id="edit-member-b"
                            ariaLabel="Member for slot B"
                            name="member_id_b"
                            defaultValue={selectedEvent.member_id_b || ""}
                            options={memberOptions}
                            statusOptions={STATUS_OPTIONS}
                            placeholder="None (Waiting for roulette)"
                          />
                        </div>
                      ) : (
                        <input type="hidden" name="member_id_b" value="" />
                      )}
                      <EventPreviewCard
                        eventName={editEventName || "Untitled event"}
                        eventType={editEventType || "Roulette"}
                        eventImageUrl={selectedEvent.event_image_url}
                        eventTeam={editSelectedTeam}
                        dateText={`${formatEventDate(selectedEvent.start_time)} | ${formatEventTime(selectedEvent.start_time, selectedEvent.end_time)} WIB`}
                        footer={editSingleMember ? "Single-member event" : `Current mode: ${editSlotMode} slot`}
                      />
                      <PendingSubmitButton pendingLabel="Saving changes…" className="min-h-11 w-full whitespace-nowrap rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-[var(--accent-foreground)] hover:bg-[var(--accent-strong)]">Save event changes</PendingSubmitButton>
                    </form>
                    <form action={deleteEventAction} className="rounded-lg border border-[var(--danger-border)] bg-[var(--danger-soft)] p-4">
                      <input type="hidden" name="event_id" value={selectedEvent.id || ""} />
                      <input type="hidden" name="event_name" value={selectedEvent.event_name || "Event"} />
                      <label className="flex items-center gap-3 text-sm text-[var(--danger-foreground)]">
                        <input type="checkbox" name="confirm_delete" />
                        I understand this event will be deleted permanently
                      </label>
                      <PendingSubmitButton pendingLabel="Deleting event…" className="mt-4 min-h-11 rounded-lg border border-[var(--danger-border)] px-4 py-3 text-sm font-semibold text-[var(--danger)] hover:bg-[var(--danger-soft)]">Delete event</PendingSubmitButton>
                    </form>
                  </div>
                </>
              ) : (
                <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 text-sm text-[var(--muted)]">No events are available to edit. Create an event to get started.</div>
              )}
              </>}
            </section>
          </div>
        </section>
      ) : null}

      {activeTab === "members" ? (
        <section className="app-tab-panel space-y-4">
          <header className="border-b border-[var(--border)] pb-4">
            <h1 className="text-2xl font-semibold text-[var(--foreground)] sm:text-3xl">Members</h1>
          </header>

          <div className="admin-record-layout" data-editor-open={editor !== null}>
            <AdminRecordList label="Members" records={memberRecords} memberStatusOptions={STATUS_OPTIONS} selectedId={selectedMember?.id ?? ""} createLabel="Add member" creating={editor === "create"} onCreate={() => openEditor("create")} onSelect={(id) => { setSelectedMemberId(id); openEditor("edit"); }} />
            <section className="admin-editor">
              <button type="button" className="admin-editor-back archive-secondary-action" onClick={backToRecords}>Back to members</button>
              {editor === "create" ? <>
              <h2 ref={editorHeading} tabIndex={-1}>Add member</h2>
              <form action={createMemberAction} className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-[var(--muted)]">Nickname</label>
                    <input aria-label="Nickname" name="nickname" value={newNickname} onChange={(event) => setNewNickname(event.target.value)} className="app-input min-h-12 w-full px-4 py-3 text-lg" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-[var(--muted)]">Full name</label>
                    <input aria-label="Full name" name="full_name" value={newFullName} onChange={(event) => setNewFullName(event.target.value)} className="app-input min-h-12 w-full px-4 py-3 text-lg" />
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-[var(--muted)]">Team / status</label>
                    <select aria-label="Team or status" name="status" value={newStatus} onChange={(event) => setNewStatus(event.target.value)} className="app-input min-h-12 w-full px-4 py-3 text-lg">
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-[var(--muted)]">Generation</label>
                    <select aria-label="Generation" name="generasi" value={newGenerasi} onChange={(event) => setNewGenerasi(event.target.value)} className="app-input min-h-12 w-full px-4 py-3 text-lg">
                      {GENERATION_OPTIONS.map((generation) => (
                        <option key={generation} value={generation}>{generation}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-[var(--muted)]">Avatar URL</label>
                  <input aria-label="Avatar URL" name="avatar_url" value={newAvatarUrl} onChange={(event) => setNewAvatarUrl(event.target.value)} className="app-input min-h-12 w-full px-4 py-3 text-base" />
                  <p className="text-sm text-[var(--muted)]">Optional. Shown in collection cards.</p>
                </div>
                <MemberPreviewCard
                  title="Preview"
                  nickname={newNickname || "Nickname"}
                  fullName={newFullName || "Full name"}
                  status={newStatus}
                  generasi={newGenerasi}
                  avatarUrl={newAvatarUrl}
                />
                <PendingSubmitButton pendingLabel="Creating member…" className="min-h-11 w-full whitespace-nowrap rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-[var(--accent-foreground)] hover:bg-[var(--accent-strong)]">Create member</PendingSubmitButton>
              </form>
              </> : <>
              <h2 ref={editorHeading} tabIndex={-1}>Edit member</h2>
              {selectedMember ? (
                <>
                  <div key={selectedMember.id} className="space-y-4">
                    <p className="text-sm text-[var(--muted)]">Deleting a member is permanent.</p>
                    <form action={updateMemberAction} className="space-y-4">
                      <input type="hidden" name="member_id" value={selectedMember.id} />
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-[var(--muted)]">Edit nickname</label>
                          <input aria-label="Edit nickname" name="nickname" defaultValue={selectedMember.nickname || ""} className="app-input min-h-12 w-full px-4 py-3 text-lg" />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-[var(--muted)]">Edit full name</label>
                          <input aria-label="Edit full name" name="full_name" defaultValue={selectedMember.full_name || ""} className="app-input min-h-12 w-full px-4 py-3 text-lg" />
                        </div>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-[var(--muted)]">Edit team / status</label>
                          <select aria-label="Edit team or status" name="status" defaultValue={selectedMember.status || "LOVE"} className="app-input min-h-12 w-full px-4 py-3 text-lg">
                            {STATUS_OPTIONS.map((status) => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-[var(--muted)]">Edit generation</label>
                          <select aria-label="Edit generation" name="generasi" defaultValue={String(selectedMember.generasi || 3)} className="app-input min-h-12 w-full px-4 py-3 text-lg">
                            {GENERATION_OPTIONS.map((generation) => (
                              <option key={generation} value={generation}>{generation}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-[var(--muted)]">Edit avatar URL</label>
                        <input aria-label="Edit avatar URL" name="avatar_url" defaultValue={selectedMember.avatar_url || ""} className="app-input min-h-12 w-full px-4 py-3 text-base" />
                        <p className="text-sm text-[var(--muted)]">Optional. Clear to remove the photo.</p>
                      </div>
                      <MemberPreviewCard
                        title="Edit preview"
                        nickname={selectedMember.nickname || "Nickname"}
                        fullName={selectedMember.full_name || "Full name"}
                        status={selectedMember.status || "LOVE"}
                        generasi={String(selectedMember.generasi || 3)}
                        avatarUrl={selectedMember.avatar_url || undefined}
                      />
                      <PendingSubmitButton pendingLabel="Saving changes…" className="min-h-11 w-full whitespace-nowrap rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-[var(--accent-foreground)] hover:bg-[var(--accent-strong)]">Save member changes</PendingSubmitButton>
                    </form>
                    <form action={deleteMemberAction} className="rounded-lg border border-[var(--danger-border)] bg-[var(--danger-soft)] p-4">
                      <input type="hidden" name="member_id" value={selectedMember.id} />
                      <input type="hidden" name="nickname" value={selectedMember.nickname || "Member"} />
                      <label className="flex items-center gap-3 text-sm text-[var(--danger-foreground)]">
                        <input type="checkbox" name="confirm_delete" />
                        I understand this member record will be deleted permanently
                      </label>
                      <PendingSubmitButton pendingLabel="Deleting member…" className="mt-4 min-h-11 rounded-lg border border-[var(--danger-border)] px-4 py-3 text-sm font-semibold text-[var(--danger)] hover:bg-[var(--danger-soft)]">Delete this member</PendingSubmitButton>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface)] px-6 py-12 text-center text-sm text-[var(--muted)]">
                  <svg aria-hidden="true" className="size-10 text-[var(--muted-strong)]" fill="none" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5"/><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/></svg>
                  <span className="font-semibold text-[var(--foreground)]">No members yet</span>
                  <span>Use Add member to create the first record.</span>
                </div>
              )}
              </>}
            </section>
          </div>
        </section>
      ) : null}
    </div>
  );
}
