"use client";

/* Hallmark | pre-emit critique: P4 H5 E4 S5 R5 V4 */

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

import { EventTeamBadge } from "@/components/EventTeamBadge";
import { FilterPill } from "@/components/FilterPill";
import { PendingSubmitButton } from "@/components/PendingSubmitButton";
import { CloseIcon } from "@/components/UiIcons";
import { useDebouncedValue } from "@/components/useDebouncedValue";
import { addCollectionAction, deleteCollectionEntryAction, updateCollectionQuantityAction } from "@/lib/v2-actions.ts";
import { formatEventDate, formatEventTime } from "@/lib/format.ts";
import { getRouletteSeriesOptions, matchesRouletteSeries } from "@/lib/timeline-view.ts";
import type { CollectibleSlot } from "@/lib/v2-collection.ts";
import { STATUS_OPTIONS as MEMBER_STATUS_OPTIONS } from "@/lib/v2-helpers.ts";
import type { CollectionEntry } from "@/lib/types.ts";

const FILTER_OPTIONS = ["All", "Roulette", "Birthday", "Graduation"] as const;
const STATUS_FILTER_OPTIONS = ["All", ...MEMBER_STATUS_OPTIONS] as const;
const DESK_MODES = ["Add", "Manage"] as const;
const SLOT_PAGE_SIZE = 6;

function MemberStatusSelect({ id, value, onChange }: {
  id: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-2">
      <label htmlFor={id} className="text-sm font-semibold text-[var(--muted-strong)]">Member status</label>
      <select id={id} value={value} onChange={(event) => onChange(event.target.value)} className="app-input min-h-11 w-full min-w-0 px-3 text-base">
        {STATUS_FILTER_OPTIONS.map((option) => <option key={option}>{option}</option>)}
      </select>
    </div>
  );
}

function CollectionFilterSelect({ id, label, allLabel = "All", options, value, onChange }: {
  id: string;
  label: string;
  allLabel?: string;
  options: string[];
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

type MemberCollection = {
  avatarUrl?: string | null;
  entries: CollectionEntry[];
  generation?: number | null;
  id: string;
  name: string;
  sortName: string;
  status?: string | null;
  totalQuantity: number;
};

function MemberHistoryDialog({ member, onClose, onManage }: { member: MemberCollection; onClose: () => void; onManage: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="member-history-title"
      className="app-modal-dialog archive-detail-drawer"
      onClick={(event) => {
        if (event.target === event.currentTarget) event.currentTarget.close();
      }}
      onClose={() => {
        const delay = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 180;
        window.setTimeout(onClose, delay);
      }}
    >
      <div className="flex flex-col">
        <header className="archive-sticky-header collection-history-header flex items-center justify-between gap-4 border-b border-[var(--border)] p-4 sm:p-5">
          <div className="flex min-w-0 items-center gap-3" tabIndex={-1} autoFocus>
            <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-strong)] sm:size-16">
              {member.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={member.avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="text-lg font-bold text-[var(--foreground)]">{(member.name || "?").slice(0, 1).toUpperCase()}</span>
              )}
            </div>
            <div className="min-w-0">
              <h3 id="member-history-title" className="truncate text-lg font-medium tracking-[-0.04em] text-[var(--foreground)] sm:text-xl">
                {member.name}
              </h3>
              <p className="mt-1 text-sm text-[var(--muted)]">
                {member.totalQuantity} Chekicha • {member.entries.length} {member.entries.length === 1 ? "session" : "sessions"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] transition-colors hover:bg-[var(--surface-hover)] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={`Close ${member.name} Chekicha history`}
          >
            <CloseIcon className="size-4" />
          </button>
        </header>

        <div className="border-b border-[var(--border)] px-4 py-2 sm:px-5">
          <button type="button" className="archive-secondary-action" onClick={() => { dialogRef.current?.close(); onManage(); }}>
            Manage copies
          </button>
        </div>
        <div className="p-3 sm:p-4">
          <div className="grid gap-2">
            {member.entries.map((entry) => {
              const showSlot = entry.event_type !== "Birthday" && entry.event_type !== "Graduation";

              return (
                <article key={entry.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 sm:p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h4 className="truncate text-sm font-medium tracking-[-0.02em] text-[var(--foreground)] sm:text-base">{entry.event_name}</h4>
                      <p className="mt-1 text-xs text-[var(--muted)] sm:text-sm">
                        {formatEventDate(entry.start_time)} | {formatEventTime(entry.start_time, entry.end_time)} WIB
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full border border-[var(--accent-soft-strong)] bg-[var(--accent-soft)] px-2.5 py-1 text-xs font-bold tabular-nums text-[var(--foreground)]">
                      x{entry.quantity}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    <span className="rounded-full border border-[var(--accent-soft-strong)] bg-[var(--accent-soft)] px-2.5 py-1 text-xs font-bold uppercase tracking-[0.12em] text-[var(--accent)]">
                      {entry.event_type}
                    </span>
                    <EventTeamBadge team={entry.event_team} eventType={entry.event_type} compact />
                    {showSlot ? (
                      <span className="rounded-full border border-[var(--border)] bg-[var(--surface-hover)] px-2.5 py-1 text-xs font-bold uppercase tracking-[0.12em] text-[var(--foreground-soft)]">
                        Slot {entry.slot_key}
                      </span>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </dialog>
  );
}

export function CollectionClient({
  entries,
  collectibleSlots,
  success,
  error,
  username,
}: {
  collectibleSlots: CollectibleSlot[];
  entries: CollectionEntry[];
  error: string;
  success: string;
  username: string;
}) {
  const searchParams = useSearchParams();
  const [filter, setFilter] = useState<(typeof FILTER_OPTIONS)[number]>("All");
  const [collectionSeries, setCollectionSeries] = useState("All");
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTER_OPTIONS)[number]>("All");
  const [memberQuery, setMemberQuery] = useState("");
  const [deskMode, setDeskMode] = useState<(typeof DESK_MODES)[number]>(() => {
    const modeParam = searchParams.get("mode");
    if (modeParam === "add" || modeParam === "manage") return modeParam === "add" ? "Add" : "Manage";
    return "Add";
  });
  const [deskOpen, setDeskOpen] = useState(() => {
    const modeParam = searchParams.get("mode");
    return modeParam === "add" || modeParam === "manage";
  });
  const deskDialogRef = useRef<HTMLDialogElement>(null);
  const [addFilter, setAddFilter] = useState<(typeof FILTER_OPTIONS)[number]>("All");
  const [addSeries, setAddSeries] = useState("All");
  const [addStatus, setAddStatus] = useState("All");
  const [addQuery, setAddQuery] = useState("");
  const [visibleSlotCount, setVisibleSlotCount] = useState(SLOT_PAGE_SIZE);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [manageMemberId, setManageMemberId] = useState<string | null>(null);
  const [manageQuery, setManageQuery] = useState("");
  const [manageFilter, setManageFilter] = useState<(typeof FILTER_OPTIONS)[number]>("All");
  const [manageSeries, setManageSeries] = useState("All");
  const [manageStatus, setManageStatus] = useState("All");
  const debouncedAddQuery = useDebouncedValue(addQuery);

  /* eslint-disable react-hooks/set-state-in-effect -- URL parameters intentionally synchronize the collection desk. */
  useEffect(() => {
    const modeParam = searchParams.get("mode");
    if (modeParam === "add" || modeParam === "manage") {
      setDeskMode(modeParam === "add" ? "Add" : "Manage");
      setDeskOpen(true);
      return;
    }

    setDeskOpen(false);
  }, [searchParams]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    const dialog = deskDialogRef.current;
    if (!dialog) return;
    if (deskOpen && !dialog.open) dialog.showModal();
    if (!deskOpen && dialog.open) dialog.close();
  }, [deskOpen]);

  useEffect(() => {
    const mode = deskOpen ? (deskMode === "Add" ? "add" : "manage") : null;
    const url = new URL(window.location.href);
    if (mode) {
      url.searchParams.set("mode", mode);
    } else {
      url.searchParams.delete("mode");
    }
    window.history.replaceState(null, "", url.toString());
  }, [deskOpen, deskMode]);

  const visibleEntries = useMemo(
    () =>
      entries.filter(
        (entry) =>
          (filter === "All" || entry.event_type === filter) &&
          (filter !== "Roulette" || matchesRouletteSeries(entry, collectionSeries)) &&
          (statusFilter === "All" || (entry.member_status || "").toUpperCase() === statusFilter),
      ),
    [collectionSeries, entries, filter, statusFilter],
  );
  const memberCollections = useMemo(() => {
    const members = new Map<string, MemberCollection>();

    for (const entry of visibleEntries) {
      const member = members.get(entry.member_id);
      if (member) {
        member.entries.push(entry);
        member.totalQuantity += Number(entry.quantity || 0);
      } else {
        members.set(entry.member_id, {
          avatarUrl: entry.member_avatar_url,
          entries: [entry],
          generation: entry.member_generasi,
          id: entry.member_id,
          name: entry.member_name,
          sortName: entry.member_full_name || entry.member_name,
          status: entry.member_status,
          totalQuantity: Number(entry.quantity || 0),
        });
      }
    }

    return Array.from(members.values())
      .map((member) => ({
        ...member,
        entries: member.entries.toSorted((a, b) => new Date(b.start_time || 0).getTime() - new Date(a.start_time || 0).getTime()),
      }))
      .toSorted((a, b) => a.sortName.localeCompare(b.sortName));
  }, [visibleEntries]);
  const selectedMember = memberCollections.find((member) => member.id === selectedMemberId) ?? null;
  const memberName = memberQuery.trim().toLowerCase();
  const visibleMembers = memberName
    ? memberCollections.filter((member) => [member.name, member.sortName].some((name) => name.toLowerCase().includes(memberName)))
    : memberCollections;
  const visibleQuantity = visibleMembers.reduce((sum, member) => sum + member.totalQuantity, 0);
  const rouletteSeriesOptions = useMemo(() => getRouletteSeriesOptions([...entries, ...collectibleSlots]), [collectibleSlots, entries]);
  const normalizedAddQuery = addQuery.trim() ? debouncedAddQuery.trim().toLowerCase() : "";
  const filteredCollectibleSlots = useMemo(() => {
    return collectibleSlots.filter((slot) => {
      const matchesFilter = addFilter === "All" || slot.event_type === addFilter;
      const matchesSeries = addFilter !== "Roulette" || matchesRouletteSeries(slot, addSeries);
      const matchesStatus = addStatus === "All" || (slot.member_status || "").toUpperCase() === addStatus;
      const matchesQuery =
        !normalizedAddQuery ||
        slot.display_label.toLowerCase().includes(normalizedAddQuery) ||
        slot.member_name.toLowerCase().includes(normalizedAddQuery) ||
        slot.event_name.toLowerCase().includes(normalizedAddQuery);

      return matchesFilter && matchesSeries && matchesStatus && matchesQuery;
    });
  }, [addFilter, addSeries, addStatus, collectibleSlots, normalizedAddQuery]);
  const visibleCollectibleSlots = useMemo(() => filteredCollectibleSlots.slice(0, visibleSlotCount), [filteredCollectibleSlots, visibleSlotCount]);
  const hasMoreCollectibleSlots = visibleCollectibleSlots.length < filteredCollectibleSlots.length;

  const totalQuantity = entries.reduce((sum, entry) => sum + Number(entry.quantity || 0), 0);
  const uniqueMembers = new Set(entries.map((entry) => entry.member_id)).size;
  const hasActiveFilter = filter !== "All" || statusFilter !== "All";
  const managedEntries = manageMemberId ? entries.filter((entry) => entry.member_id === manageMemberId) : entries;
  const managedSearch = manageQuery.trim().toLowerCase();
  const matchingManagedIds = new Set(managedEntries.filter((entry) =>
    (manageFilter === "All" || entry.event_type === manageFilter) &&
    (manageFilter !== "Roulette" || matchesRouletteSeries(entry, manageSeries)) &&
    (manageStatus === "All" || (entry.member_status || "").toUpperCase() === manageStatus) &&
    [entry.member_name, entry.member_full_name, entry.event_name].some((name) => (name ?? "").toLowerCase().includes(managedSearch)),
  ).map((entry) => entry.id));

  function resetCollectionSearch() {
    setMemberQuery("");
    setFilter("All");
    setCollectionSeries("All");
    setStatusFilter("All");
  }

  function resetAddSearch() {
    setAddQuery("");
    setAddFilter("All");
    setAddSeries("All");
    setAddStatus("All");
    setVisibleSlotCount(SLOT_PAGE_SIZE);
  }

  function resetManageSearch() {
    setManageQuery("");
    setManageFilter("All");
    setManageSeries("All");
    setManageStatus("All");
  }

  function openDesk(mode: (typeof DESK_MODES)[number], memberId: string | null = null) {
    setManageMemberId(memberId);
    if (memberId) resetManageSearch();
    setDeskMode(mode);
    setDeskOpen(true);
  }

  function closeDesk() {
    deskDialogRef.current?.close();
  }

  const deskFeedback = (
    <>
      {success ? <div role="status" aria-live="polite" className="app-status-message rounded-lg border border-[var(--accent-soft-strong)] bg-[var(--accent-soft)] p-3 text-sm font-semibold text-[var(--accent)]">{success}</div> : null}
      {error ? <div role="alert" className="app-status-message rounded-lg border border-[var(--danger-border)] bg-[var(--danger-soft)] p-3 text-sm text-[var(--danger-foreground)]">{error}</div> : null}
    </>
  );

  return (
    <div className="collection-workspace">
      <div className="collection-toolbar">
        <div className="archive-summary">
          <span>@{username}</span><span><strong>{totalQuantity}</strong> Chekicha owned</span><span><strong>{uniqueMembers}</strong> members</span>
        </div>
        <button type="button" onClick={() => openDesk("Add")} className="archive-primary-action">Add Chekicha</button>
      </div>

      {!deskOpen && deskFeedback}

      {entries.length > 0 && (
        <search aria-label="Collection search" className="grid max-w-md gap-1.5">
          <label htmlFor="collection-member-search" className="text-sm font-semibold text-[var(--muted-strong)]">Search by member name</label>
          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
            <input
              id="collection-member-search"
              type="search"
              value={memberQuery}
              onChange={(event) => setMemberQuery(event.target.value)}
              placeholder="Nickname or full name"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              className="app-input min-h-12 w-full px-3 py-2 text-base placeholder:text-[var(--muted)]"
            />
            <button type="button" className="archive-secondary-action" aria-label="Reset search and filters" onClick={resetCollectionSearch}>
              Reset
            </button>
          </div>
        </search>
      )}

      <details className="collection-filters app-disclosure">
        <summary>Filter collection{hasActiveFilter ? " · Active" : ""}</summary>
          <div className="grid gap-3 pt-2 md:grid-cols-2">
            <div className="space-y-2">
              <div className="text-xs font-semibold text-[var(--muted-strong)]">Event type</div>
              <div className="flex flex-wrap gap-2">
                {FILTER_OPTIONS.map((option) => (
                  <FilterPill key={option} onClick={() => setFilter(option)} active={filter === option}>
                    {option}
                  </FilterPill>
                ))}
              </div>
              {filter === "Roulette" && (
                <CollectionFilterSelect id="collection-roulette-series" label="Roulette series" allLabel="All roulette series" options={rouletteSeriesOptions} value={collectionSeries} onChange={setCollectionSeries} />
              )}
            </div>
            <div className="space-y-2">
              <div className="text-xs font-semibold text-[var(--muted-strong)]">Member status</div>
              <div className="flex flex-wrap gap-2">
                {STATUS_FILTER_OPTIONS.map((option) => (
                  <FilterPill key={option} onClick={() => setStatusFilter(option)} active={statusFilter === option}>
                    {option}
                  </FilterPill>
                ))}
              </div>
            </div>
          </div>
      </details>

      <p role="status" className="text-sm text-[var(--muted)] empty:absolute">
        {entries.length > 0 && (hasActiveFilter || memberName) && (
          visibleMembers.length
            ? `Showing ${visibleQuantity} Chekicha · ${visibleMembers.length} ${visibleMembers.length === 1 ? "member" : "members"}`
            : memberName ? "No members match this search and filters." : "No matches. Try different filters."
        )}
      </p>
      {visibleMembers.length > 0 && (
        <ul className="archive-member-list" role="list" aria-label="Collection by member">
          {visibleMembers.map((member, index) => (
            <li key={member.id}>
              <button type="button" className="archive-member-row" aria-haspopup="dialog" onClick={() => setSelectedMemberId(member.id)}>
                <span className="archive-card-photo" aria-hidden="true">
                  {member.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={member.avatarUrl} alt="" loading={index < 8 ? "eager" : "lazy"} decoding="async" />
                  ) : (member.name || "?").slice(0, 1).toUpperCase()}
                </span>
                <span className="archive-member-identity">
                  <strong>{member.name}</strong>
                  <span>{[member.status, member.generation ? `Gen ${member.generation}` : null].filter(Boolean).join(" · ")}</span>
                </span>
                <span className="archive-member-quantity"><strong>{member.totalQuantity}</strong> {member.totalQuantity === 1 ? "copy" : "copies"}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {entries.length === 0 && <p className="app-card p-6 text-sm text-[var(--muted)]">No Chekicha yet. Choose Add Chekicha to get started.</p>}

      {selectedMember ? <MemberHistoryDialog member={selectedMember} onClose={() => setSelectedMemberId(null)} onManage={() => openDesk("Manage", selectedMember.id)} /> : null}

        <dialog
          ref={deskDialogRef}
          aria-labelledby="collection-desk-title"
          className="app-modal-dialog collection-editor"
          onClick={(event) => { if (event.target === event.currentTarget) closeDesk(); }}
          onClose={() => setDeskOpen(false)}
        >
          <div
            className="collection-desk-shell"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="archive-sticky-header collection-desk-header flex items-center justify-between gap-4">
              <div>
                <h3 id="collection-desk-title" className="text-lg font-semibold tracking-[-0.04em] text-[var(--foreground)] md:text-xl">{deskMode === "Add" ? "Add Chekicha" : "Manage copies"}</h3>
              </div>
              <button
                type="button"
                onClick={closeDesk}
                className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] transition-colors hover:bg-[var(--surface-hover)]"
                aria-label="Close collection editor"
              >
                <CloseIcon className="size-4" />
              </button>
            </header>
            {deskOpen && (error || success) && <div className="mt-3">{deskFeedback}</div>}

            <div className="mt-5 flex flex-wrap gap-2">
              {DESK_MODES.map((mode) => (
                <FilterPill
                  key={mode}
                  onClick={() => { setDeskMode(mode); setManageMemberId(null); }}
                  active={deskMode === mode}
                >
                  {mode}
                </FilterPill>
              ))}
            </div>

            {deskMode === "Add" ? (
              <div className="mt-5 space-y-5">
                <div className="border-t border-[var(--border)] pt-4 text-sm text-[var(--muted)]">
                  Adding the same slot again increases your saved quantity.
                </div>
                {collectibleSlots.length ? (
                  <section aria-label="Find slots">
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                          <div className="text-sm font-semibold text-[var(--accent)]">Find slots</div>
                        </div>
                        <div role="status" className="text-xs font-semibold text-[var(--muted)]">
                          {filteredCollectibleSlots.length} matches
                        </div>
                      </div>

                      <div className="grid gap-3 border-t border-[var(--border)] pt-4">
                        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                          <input
                            type="search"
                            value={addQuery}
                            onChange={(event) => {
                              setAddQuery(event.target.value);
                              setVisibleSlotCount(SLOT_PAGE_SIZE);
                            }}
                            aria-label="Search collection slots by member or event"
                            placeholder="Member or event"
                            className="app-input min-h-12 w-full px-3 py-2 text-base placeholder:text-[var(--muted)]"
                          />
                          <button type="button" className="archive-secondary-action" aria-label="Reset slot search and filters" onClick={resetAddSearch}>
                            Reset
                          </button>
                        </div>

                        <div role="group" aria-label="Event type" className="flex flex-wrap gap-1.5 [&>button]:px-2">
                          {FILTER_OPTIONS.map((option) => (
                            <FilterPill
                              key={option}
                              onClick={() => {
                                setAddFilter(option);
                                setVisibleSlotCount(SLOT_PAGE_SIZE);
                              }}
                              active={addFilter === option}
                              inactiveTone="soft"
                            >
                              {option}
                            </FilterPill>
                          ))}
                        </div>
                        {addFilter === "Roulette" && (
                          <CollectionFilterSelect id="add-roulette-series" label="Roulette series" allLabel="All roulette series" options={rouletteSeriesOptions} value={addSeries} onChange={(series) => {
                            setAddSeries(series);
                            setVisibleSlotCount(SLOT_PAGE_SIZE);
                          }} />
                        )}
                        <MemberStatusSelect id="add-member-status" value={addStatus} onChange={(status) => {
                          setAddStatus(status);
                          setVisibleSlotCount(SLOT_PAGE_SIZE);
                        }} />
                      </div>

                      {visibleCollectibleSlots.length ? (
                        <div className="grid gap-3">
                          {visibleCollectibleSlots.map((slot) => (
                              <form key={slot.slot_uid} action={addCollectionAction} className="grid gap-3 border-t border-[var(--border)] pt-4 lg:grid-cols-[minmax(0,1fr)_7rem_auto] lg:items-center">
                              <div className="min-w-0">
                                <div className="truncate text-sm font-medium tracking-[-0.02em] text-[var(--foreground)] md:text-[0.95rem]">{slot.member_name}</div>
                                <div className="break-words text-sm text-[var(--muted)] md:text-[0.95rem]">{slot.event_name}</div>
                                <div className="mt-1 text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
                                  {slot.slot_label} | {formatEventDate(slot.start_time)} | {formatEventTime(slot.start_time, slot.end_time)} WIB
                                </div>
                              </div>
                              <div className="flex gap-2 lg:justify-end">
                                <input type="hidden" name="event_id" value={slot.event_id} />
                                <input type="hidden" name="slot_key" value={slot.slot_key} />
                                <input type="hidden" name="member_id" value={slot.member_id} />
                                <div className="w-full lg:w-24">
                                  <label className="mb-1 block text-xs font-semibold text-[var(--muted)]">Copies to add</label>
                                  <input
                                    type="number"
                                    min="1"
                                    inputMode="numeric"
                                    aria-label={`Copies to add for ${slot.member_name} ${slot.event_name} ${slot.slot_label}`}
                                    name="quantity"
                                    defaultValue="1"
                                     className="app-input min-h-11 w-full px-4 py-3 text-sm md:text-[0.95rem]"
                                  />
                                </div>
                              </div>
                              <PendingSubmitButton pendingLabel="Adding…" className="min-h-11 rounded-lg bg-[var(--accent)] px-5 py-3 text-sm font-bold text-[var(--accent-foreground)] hover:bg-[var(--accent-strong)] md:text-[0.95rem]">Add to collection</PendingSubmitButton>
                            </form>
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-strong)] p-4 text-sm text-[var(--muted)]">
                          No slots match your search and filters.
                        </div>
                      )}

                      {hasMoreCollectibleSlots ? (
                        <button
                          type="button"
                          onClick={() => setVisibleSlotCount((count) => count + SLOT_PAGE_SIZE)}
                          className="min-h-11 self-start whitespace-nowrap rounded-lg border border-[var(--border)] bg-[var(--surface-hover)] px-5 text-sm font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--accent-soft)]"
                        >
                          Load more slots
                        </button>
                      ) : null}
                    </div>
                  </section>
                ) : (
                   <div className="app-card p-6 text-sm text-[var(--muted)]">
                    No Chekicha are available to add yet. Check the timeline for assigned members.
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {managedEntries.length > 0 && (
                  <search aria-label="Manage copies search" className="grid gap-1.5 md:col-span-2">
                    <label htmlFor="manage-collection-search" className="text-sm font-semibold text-[var(--muted-strong)]">Search by member or event</label>
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                      <input
                        id="manage-collection-search"
                        type="search"
                        value={manageQuery}
                        onChange={(event) => setManageQuery(event.target.value)}
                        placeholder="Member or event"
                        autoCorrect="off"
                        autoCapitalize="none"
                        spellCheck={false}
                        className="app-input min-h-12 w-full px-3 py-2 text-base placeholder:text-[var(--muted)]"
                      />
                      <button type="button" className="archive-secondary-action" aria-label="Reset Manage copies search and filters" onClick={resetManageSearch}>
                        Reset
                      </button>
                    </div>
                    <div role="group" aria-label="Event type" className="flex flex-wrap gap-1.5 [&>button]:px-2">
                      {FILTER_OPTIONS.map((option) => (
                        <FilterPill key={option} active={manageFilter === option} inactiveTone="soft" onClick={() => setManageFilter(option)}>
                          {option}
                        </FilterPill>
                      ))}
                    </div>
                    {manageFilter === "Roulette" && (
                      <CollectionFilterSelect id="manage-roulette-series" label="Roulette series" allLabel="All roulette series" options={rouletteSeriesOptions} value={manageSeries} onChange={setManageSeries} />
                    )}
                    <MemberStatusSelect id="manage-member-status" value={manageStatus} onChange={setManageStatus} />
                    <p role="status" className="text-sm text-[var(--muted)]">
                      {matchingManagedIds.size === 0 ? "No collection entries match this search and filter." : `${matchingManagedIds.size} ${matchingManagedIds.size === 1 ? "entry" : "entries"}`}
                    </p>
                  </search>
                )}
                <div className="md:col-span-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm text-[var(--muted)]">
                  {manageMemberId && <button type="button" className="archive-secondary-action mb-2" onClick={() => setManageMemberId(null)}>Show all members</button>}
                  <p>Save replaces your total. Remove only affects your collection.</p>
                </div>
                {managedEntries.length ? (
                  managedEntries.map((entry) => (
                    <article key={entry.id} hidden={!matchingManagedIds.has(entry.id)} className="border-t border-[var(--border)] pt-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="text-sm font-medium tracking-[-0.02em] text-[var(--foreground)] md:text-[0.95rem]">{entry.member_name}</div>
                          <div className="break-words text-sm text-[var(--muted)] md:text-[0.95rem]">{entry.event_name}</div>
                          <div className="mt-2 text-sm text-[var(--muted)] md:text-[0.95rem]">
                            {formatEventDate(entry.start_time)} | {formatEventTime(entry.start_time, entry.end_time)} WIB
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <div className="text-sm font-bold tracking-[-0.02em] text-[var(--foreground)]">
                            <span className="tabular-nums">x{entry.quantity}</span>
                          </div>
                          <div className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Slot {entry.slot_key}</div>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                        <form action={updateCollectionQuantityAction} className="flex min-w-0 w-full flex-col gap-2 sm:flex-1 sm:flex-row">
                          <input type="hidden" name="entry_id" value={entry.id} />
                          <div className="min-w-0 flex-1">
                            <label className="mb-1 block text-xs font-semibold text-[var(--muted)]">Total copies owned</label>
                            <input
                              type="number"
                              min="1"
                              inputMode="numeric"
                              aria-label={`Total copies owned for ${entry.member_name} ${entry.event_name}`}
                              name="quantity"
                              defaultValue={entry.quantity}
                               className="app-input min-h-11 w-full px-4 py-3 text-sm md:text-[0.95rem]"
                            />
                          </div>
                          <PendingSubmitButton pendingLabel="Saving…" className="w-full self-end whitespace-nowrap rounded-lg border border-[var(--border)] bg-[var(--surface-hover)] px-4 py-3 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--accent-soft)] sm:w-auto md:text-[0.95rem]">Save total</PendingSubmitButton>
                        </form>
                        <form action={deleteCollectionEntryAction} className="w-full sm:w-auto">
                          <input type="hidden" name="entry_id" value={entry.id} />
                          <PendingSubmitButton pendingLabel="Removing…" className="w-full whitespace-nowrap rounded-lg border border-[var(--danger-border)] bg-[var(--danger-soft)] px-4 py-3 text-sm font-semibold text-[var(--danger)] hover:bg-[var(--surface-hover)] sm:w-auto md:text-[0.95rem]">Remove from collection</PendingSubmitButton>
                        </form>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface)] px-6 py-16 text-center text-sm text-[var(--muted)]">
                    <svg aria-hidden="true" className="size-12 text-[var(--muted-strong)]" fill="none" viewBox="0 0 24 24"><path d="M12 6v6l4 2" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5"/><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/></svg>
                    <span className="font-semibold text-[var(--foreground)]">Your collection is empty</span>
                    <span>Open <strong>Add</strong> to add your first Chekicha.</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </dialog>
    </div>
  );
}
