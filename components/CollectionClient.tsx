"use client";

/* Hallmark · pre-emit critique: P4 H5 E4 S5 R5 V4 */

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

import { FilterPill } from "@/components/FilterPill";
import { CloseIcon } from "@/components/UiIcons";
import { SectionHeader } from "@/components/SectionHeader";
import { useDebouncedValue } from "@/components/useDebouncedValue";
import { addCollectionAction, deleteCollectionEntryAction, updateCollectionQuantityAction } from "@/lib/v2-actions.ts";
import { formatEventDate, formatEventTime } from "@/lib/format.ts";
import type { CollectibleSlot } from "@/lib/v2-collection.ts";
import { STATUS_OPTIONS as MEMBER_STATUS_OPTIONS } from "@/lib/v2-helpers.ts";
import type { CollectionEntry } from "@/lib/types.ts";

const FILTER_OPTIONS = ["All", "Roulette", "Birthday", "Graduation"] as const;
const STATUS_FILTER_OPTIONS = ["All", ...MEMBER_STATUS_OPTIONS] as const;
const DESK_MODES = ["Add", "Manage"] as const;
const SLOT_PAGE_SIZE = 6;

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

function MemberHistoryDialog({ member, onClose }: { member: MemberCollection; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="member-history-title"
      className="m-auto max-h-[min(80dvh,42rem)] w-[calc(100%_-_2rem)] max-w-2xl overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--panel)] p-0 text-[var(--foreground)] shadow-2xl backdrop:bg-[var(--overlay)] backdrop:backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) event.currentTarget.close();
      }}
      onClose={onClose}
    >
      <div className="flex max-h-[min(80dvh,42rem)] flex-col">
        <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] p-4 sm:p-5">
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
              <h3 id="member-history-title" className="truncate text-lg font-semibold tracking-[-0.03em] text-[var(--foreground)] sm:text-xl">
                {member.name}
              </h3>
              <p className="mt-1 text-sm text-[var(--muted)]">
                {member.entries.length} saved {member.entries.length === 1 ? "session" : "sessions"} · {member.totalQuantity} total cheki
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={`Close ${member.name} cheki history`}
          >
            <CloseIcon className="size-4" />
          </button>
        </div>

        <div className="overflow-y-auto p-3 sm:p-4">
          <div className="grid gap-2">
            {member.entries.map((entry) => {
              const showSlot = entry.event_type !== "Birthday" && entry.event_type !== "Graduation";

              return (
                <article key={entry.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 sm:p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h4 className="truncate text-sm font-semibold text-[var(--foreground)] sm:text-base">{entry.event_name}</h4>
                      <p className="mt-1 text-xs text-[var(--muted)] sm:text-sm">
                        {formatEventDate(entry.start_time)} · {formatEventTime(entry.start_time, entry.end_time)} WIB
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full border border-[var(--accent-soft-strong)] bg-[var(--accent-soft)] px-2.5 py-1 text-xs font-bold tabular-nums text-[var(--foreground)]">
                      x{entry.quantity}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <span className="rounded-full border border-[var(--accent-soft-strong)] bg-[var(--accent-soft)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--accent)]">
                      {entry.event_type}
                    </span>
                    {showSlot ? (
                      <span className="rounded-full border border-[var(--border)] bg-[var(--surface-hover)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--foreground-soft)]">
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
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTER_OPTIONS)[number]>("All");
  const [deskMode, setDeskMode] = useState<(typeof DESK_MODES)[number]>(() => {
    const modeParam = searchParams.get("mode");
    if (modeParam === "add" || modeParam === "manage") return modeParam === "add" ? "Add" : "Manage";
    return "Add";
  });
  const [deskOpen, setDeskOpen] = useState(() => {
    const modeParam = searchParams.get("mode");
    return modeParam === "add" || modeParam === "manage";
  });
  const [addFilter, setAddFilter] = useState<(typeof FILTER_OPTIONS)[number]>("All");
  const [addQuery, setAddQuery] = useState("");
  const [visibleSlotCount, setVisibleSlotCount] = useState(SLOT_PAGE_SIZE);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
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
          (statusFilter === "All" || (entry.member_status || "").toUpperCase() === statusFilter),
      ),
    [entries, filter, statusFilter],
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
      .sort((a, b) => a.sortName.localeCompare(b.sortName));
  }, [visibleEntries]);
  const selectedMember = memberCollections.find((member) => member.id === selectedMemberId) ?? null;
  const visibleQuantity = memberCollections.reduce((sum, member) => sum + member.totalQuantity, 0);
  const filteredCollectibleSlots = useMemo(() => {
    const normalizedQuery = debouncedAddQuery.trim().toLowerCase();

    return collectibleSlots.filter((slot) => {
      const matchesFilter = addFilter === "All" || slot.event_type === addFilter;
      const matchesQuery =
        !normalizedQuery ||
        slot.display_label.toLowerCase().includes(normalizedQuery) ||
        slot.member_name.toLowerCase().includes(normalizedQuery) ||
        slot.event_name.toLowerCase().includes(normalizedQuery);

      return matchesFilter && matchesQuery;
    });
  }, [addFilter, collectibleSlots, debouncedAddQuery]);
  const visibleCollectibleSlots = useMemo(() => filteredCollectibleSlots.slice(0, visibleSlotCount), [filteredCollectibleSlots, visibleSlotCount]);
  const hasMoreCollectibleSlots = visibleCollectibleSlots.length < filteredCollectibleSlots.length;

  const totalQuantity = entries.reduce((sum, entry) => sum + Number(entry.quantity || 0), 0);
  const uniqueMembers = new Set(entries.map((entry) => entry.member_id)).size;

  return (
    <div className="space-y-6">
      <section className="app-shell p-5 sm:p-6">
        <SectionHeader
          label="My collection"
          title="Your cheki shelf comes first."
          description={`Signed in as @${username} with ${totalQuantity} total cheki across ${uniqueMembers} tracked members.`}
        />
      </section>

      {success ? <div role="status" aria-live="polite" className="rounded-lg border border-[var(--accent-soft-strong)] bg-[var(--accent-soft)] p-3 text-sm text-[var(--accent)]">{success}</div> : null}
      {error ? <div role="alert" className="rounded-lg border border-[var(--danger-border)] bg-[var(--danger-soft)] p-3 text-sm text-[var(--danger-foreground)]">{error}</div> : null}

      <section className="app-card p-4 md:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-sm text-[var(--muted)]">
          <span>{memberCollections.length} members with saved cheki.</span>
          <span>{visibleQuantity} cheki in this view</span>
        </div>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid gap-4">
            <div className="space-y-2">
              <div className="text-sm font-semibold text-[var(--muted-strong)]">Event type</div>
              <div className="flex flex-wrap gap-2">
                {FILTER_OPTIONS.map((option) => (
                  <FilterPill
                    key={option}
                    onClick={() => setFilter(option)}
                    active={filter === option}
                  >
                    {option}
                  </FilterPill>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-semibold text-[var(--muted-strong)]">Member status</div>
              <div className="flex flex-wrap gap-2">
                {STATUS_FILTER_OPTIONS.map((option) => (
                  <FilterPill
                    key={option}
                    onClick={() => setStatusFilter(option)}
                    active={statusFilter === option}
                  >
                    {option}
                  </FilterPill>
                ))}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setDeskOpen(true)}
            className="min-h-11 rounded-full bg-[var(--accent)] px-5 text-sm font-semibold text-[var(--accent-foreground)] transition hover:bg-[var(--accent-strong)] md:text-[0.95rem]"
          >
            Open collection desk
          </button>
        </div>
      </section>

      {memberCollections.length ? (
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {memberCollections.map((member) => (
            <button
              key={member.id}
              type="button"
              aria-expanded={selectedMemberId === member.id}
              aria-haspopup="dialog"
              onClick={() => setSelectedMemberId(member.id)}
              className="app-card flex min-h-24 w-full items-center gap-3 p-3 text-left hover:bg-[var(--surface-hover)] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 sm:p-4"
            >
              <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-strong)] sm:size-16">
                {member.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={member.avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-lg font-bold text-[var(--foreground)]">{(member.name || "?").slice(0, 1).toUpperCase()}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-base font-semibold tracking-[-0.025em] text-[var(--foreground)] sm:text-lg">{member.name}</div>
                <div className="mt-0.5 text-xs text-[var(--muted)] sm:text-sm">
                  {[member.status, member.generation ? `Gen ${member.generation}` : null].filter(Boolean).join(" · ") || "Member details unavailable"}
                </div>
                <div className="mt-1 truncate text-xs text-[var(--muted-strong)]">
                  {member.entries.length} saved {member.entries.length === 1 ? "session" : "sessions"}
                </div>
              </div>
              <span className="shrink-0 rounded-full border border-[var(--accent-soft-strong)] bg-[var(--accent-soft)] px-2.5 py-1 text-xs font-bold tabular-nums text-[var(--foreground)]">
                x{member.totalQuantity}
              </span>
            </button>
          ))}
        </section>
      ) : (
        <div className="app-card p-6 text-sm text-[var(--muted)]">
          {entries.length ? "No members match the selected event type and member status." : "No collection entries yet. Open the collection desk to add your first saved slot."}
        </div>
      )}

      {selectedMember ? <MemberHistoryDialog member={selectedMember} onClose={() => setSelectedMemberId(null)} /> : null}

      {deskOpen ? (
        <div className="collection-desk-overlay fixed inset-0 z-[var(--z-modal-backdrop)] flex items-start justify-center overflow-y-auto px-4 py-6 backdrop-blur-sm" onClick={() => setDeskOpen(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="collection-desk-title"
            aria-describedby="collection-desk-summary"
            className="collection-desk-shell w-full max-w-6xl rounded-xl border border-[var(--border)] bg-[var(--panel)] p-5 shadow-[var(--shadow-modal)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-semibold text-[var(--accent)]">Collection desk</div>
                <h3 id="collection-desk-title" className="mt-2 text-lg font-extrabold text-[var(--foreground)] md:text-xl">Add, update, or remove collection entries.</h3>
                <p id="collection-desk-summary" className="mt-2 text-sm text-[var(--muted)]">Use Add mode to save new slots and Manage mode to correct quantities you already own.</p>
              </div>
              <button
                type="button"
                onClick={() => setDeskOpen(false)}
                className="inline-flex size-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] transition hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
                aria-label="Close collection desk"
              >
                <CloseIcon className="size-4" />
              </button>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {DESK_MODES.map((mode) => (
                <FilterPill
                  key={mode}
                  onClick={() => setDeskMode(mode)}
                  active={deskMode === mode}
                >
                  {mode}
                </FilterPill>
              ))}
            </div>

            {deskMode === "Add" ? (
              <div className="mt-5 space-y-5">
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm text-[var(--muted)]">
                  <strong className="text-[var(--foreground)]">How to add cheki:</strong> search the resolved slot, set how many copies you have, then save it to your shelf.
                </div>
                {collectibleSlots.length ? (
                  <section className="p-4 md:p-5">
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                          <div className="text-sm font-semibold text-[var(--accent)]">Find slots</div>
                          <div className="mt-1 text-sm text-[var(--muted)]">Search by member or event, then pick the exact slot you want to save.</div>
                        </div>
                        <div className="text-xs font-semibold text-[var(--muted)]">
                          {filteredCollectibleSlots.length} matches
                        </div>
                      </div>

                        <div className="grid gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-strong)] p-4">
                        <input
                          value={addQuery}
                          onChange={(event) => {
                            setAddQuery(event.target.value);
                            setVisibleSlotCount(SLOT_PAGE_SIZE);
                          }}
                          aria-label="Search collection slots by member or event"
                          placeholder="Search member or event"
                            className="app-input min-h-11 w-full px-4 py-3 text-sm outline-none placeholder:text-[var(--muted)] md:text-base"
                        />

                        <div className="flex flex-wrap gap-2">
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
                      </div>

                      {visibleCollectibleSlots.length ? (
                        <div className="grid gap-3">
                          {visibleCollectibleSlots.map((slot) => (
                              <form key={slot.slot_uid} action={addCollectionAction} className="grid gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 lg:grid-cols-[minmax(0,1fr)_7rem_auto] lg:items-center">
                              <div className="min-w-0">
                                <div className="truncate text-sm font-semibold text-[var(--foreground)] md:text-[0.95rem]">{slot.member_name}</div>
                                <div className="truncate text-sm text-[var(--muted)] md:text-[0.95rem]">{slot.event_name}</div>
                                <div className="mt-1 text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
                                  {slot.slot_label} | {formatEventDate(slot.start_time)} | {formatEventTime(slot.start_time, slot.end_time)} WIB
                                </div>
                              </div>
                              <div className="flex gap-2 lg:justify-end">
                                <input type="hidden" name="event_id" value={slot.event_id} />
                                <input type="hidden" name="slot_key" value={slot.slot_key} />
                                <input type="hidden" name="member_id" value={slot.member_id} />
                                <div className="w-full lg:w-24">
                                  <label className="mb-1 block text-xs font-semibold text-[var(--muted)]">Qty</label>
                                  <input
                                    type="number"
                                    min="1"
                                    inputMode="numeric"
                                    aria-label={`Quantity for ${slot.member_name} ${slot.slot_label}`}
                                    name="quantity"
                                    defaultValue="1"
                                     className="app-input min-h-11 w-full px-4 py-3 text-sm outline-none md:text-[0.95rem]"
                                  />
                                </div>
                              </div>
                              <button className="min-h-11 rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-bold text-[var(--accent-foreground)] transition hover:bg-[var(--accent-strong)] md:text-[0.95rem]">
                                Add to shelf
                              </button>
                            </form>
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-strong)] p-4 text-sm text-[var(--muted)]">
                          No slots match this search yet. Try a different member name or switch the type filter.
                        </div>
                      )}

                      {hasMoreCollectibleSlots ? (
                        <button
                          type="button"
                          onClick={() => setVisibleSlotCount((count) => count + SLOT_PAGE_SIZE)}
                          className="min-h-11 self-start rounded-full border border-[var(--border)] bg-[var(--surface-hover)] px-5 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--border-strong)] hover:bg-[var(--accent-soft)]"
                        >
                          Load more slots
                        </button>
                      ) : null}
                    </div>
                  </section>
                ) : (
                   <div className="app-card p-6 text-sm text-[var(--muted)]">
                    No resolved event slots are ready for collection yet.
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm text-[var(--muted)]">
                  <strong className="text-[var(--foreground)]">Manage saved quantities:</strong> change the number, save it, or remove the entry if you no longer collect that slot.
                </div>
                {entries.length ? (
                  entries.map((entry) => (
                    <article key={entry.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-sm font-semibold text-[var(--foreground)] md:text-[0.95rem]">{entry.member_name}</div>
                          <div className="text-sm text-[var(--muted)] md:text-[0.95rem]">{entry.event_name}</div>
                          <div className="mt-2 text-sm text-[var(--muted)] md:text-[0.95rem]">
                            {formatEventDate(entry.start_time)} | {formatEventTime(entry.start_time, entry.end_time)} WIB
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold tracking-[-0.02em] text-[var(--foreground)]">
                            <span className="tabular-nums">x{entry.quantity}</span>
                          </div>
                          <div className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Slot {entry.slot_key}</div>
                        </div>
                      </div>
                      <div className="mt-4 flex gap-3">
                        <form action={updateCollectionQuantityAction} className="flex flex-1 gap-2">
                          <input type="hidden" name="entry_id" value={entry.id} />
                          <div className="flex-1">
                            <label className="mb-1 block text-xs font-semibold text-[var(--muted)]">Saved qty</label>
                            <input
                              type="number"
                              min="1"
                              inputMode="numeric"
                              aria-label={`Saved quantity for ${entry.member_name} ${entry.event_name}`}
                              name="quantity"
                              defaultValue={entry.quantity}
                               className="app-input min-h-11 w-full px-4 py-3 text-sm outline-none md:text-[0.95rem]"
                            />
                          </div>
                          <button className="self-end rounded-xl border border-[var(--border)] bg-[var(--surface-hover)] px-4 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--border-strong)] hover:bg-[var(--accent-soft)] md:text-[0.95rem]">Save quantity</button>
                        </form>
                        <form action={deleteCollectionEntryAction}>
                          <input type="hidden" name="entry_id" value={entry.id} />
                          <button className="rounded-xl border border-[var(--danger-border)] bg-[var(--danger-soft)] px-4 py-3 text-sm font-semibold text-[var(--danger)] transition hover:border-[var(--danger)] hover:bg-[var(--danger-soft)] md:text-[0.95rem]">Remove entry</button>
                        </form>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface)] px-6 py-16 text-center text-sm text-[var(--muted)]">
                    <svg aria-hidden="true" className="size-12 text-[var(--muted-strong)]" fill="none" viewBox="0 0 24 24"><path d="M12 6v6l4 2" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5"/><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/></svg>
                    <span className="font-semibold text-[var(--foreground)]">Your shelf is empty</span>
                    <span>Open <strong>Add</strong> mode to save your first slot.</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
