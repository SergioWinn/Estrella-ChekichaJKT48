"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { FilterPill } from "@/components/FilterPill";
import { CloseIcon } from "@/components/UiIcons";
import { SectionHeader } from "@/components/SectionHeader";
import { useDebouncedValue } from "@/components/useDebouncedValue";
import { addCollectionAction, deleteCollectionEntryAction, updateCollectionQuantityAction } from "@/lib/v2-actions.ts";
import { formatEventDate, formatEventTime } from "@/lib/format.ts";
import type { CollectibleSlot } from "@/lib/v2-collection.ts";
import type { CollectionEntry } from "@/lib/types.ts";

const FILTER_OPTIONS = ["All", "Roulette", "Birthday", "Graduation"] as const;
const DESK_MODES = ["Add", "Manage"] as const;
const SLOT_PAGE_SIZE = 6;

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
  const debouncedAddQuery = useDebouncedValue(addQuery);

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
    () => (filter === "All" ? entries : entries.filter((entry) => entry.event_type === filter)),
    [entries, filter],
  );
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

      <section className="grid gap-4 md:grid-cols-3">
        <div className="app-card p-4">
          <div className="truncate text-2xl font-extrabold tracking-[-0.04em] text-[var(--foreground)] md:text-3xl">@{username}</div>
          <p className="mt-1 text-sm font-semibold text-[var(--muted-strong)]">Signed in</p>
        </div>
        <div className="app-card p-4">
          <div className="text-3xl font-extrabold tracking-[-0.04em] text-[var(--foreground)] md:text-4xl">{totalQuantity}</div>
          <p className="mt-1 text-sm font-semibold text-[var(--muted-strong)]">Total cheki</p>
        </div>
        <div className="app-card p-4">
          <div className="text-3xl font-extrabold tracking-[-0.04em] text-[var(--foreground)] md:text-4xl">{uniqueMembers}</div>
          <p className="mt-1 text-sm font-semibold text-[var(--muted-strong)]">Tracked members</p>
        </div>
      </section>

      <section className="app-card p-4 md:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-sm text-[var(--muted)]">
          <span>Showing {visibleEntries.length} saved entries.</span>
          <span>{filter === "All" ? "All event types" : `${filter} only`}</span>
        </div>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="text-sm font-semibold text-[var(--muted-strong)]">Collection type</div>
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
          <button
            type="button"
            onClick={() => setDeskOpen(true)}
            className="min-h-11 rounded-full bg-[var(--accent)] px-5 text-sm font-semibold text-[var(--accent-foreground)] transition hover:bg-[var(--accent-strong)] md:text-[0.95rem]"
          >
            Open collection desk
          </button>
        </div>
      </section>

      {visibleEntries.length ? (
        <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
          {visibleEntries.map((entry) => (
            <article key={entry.id} className="app-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-strong)]">
                    {entry.member_avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={entry.member_avatar_url} alt={entry.member_name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-xl font-bold text-[var(--foreground)]">{(entry.member_name || "?").slice(0, 1).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-xl font-bold tracking-[-0.04em] text-[var(--foreground)] md:text-2xl">{entry.member_name}</div>
                    <div className="text-sm text-[var(--muted)] md:text-[0.95rem]">{entry.member_generasi ? `Gen ${entry.member_generasi}` : "Generation unknown"}</div>
                  </div>
                </div>
                <div className="flex min-w-[3.5rem] shrink-0 items-center justify-center rounded-full border border-[var(--accent-soft-strong)] bg-[var(--accent-soft)] px-2.5 py-1.5 text-sm font-bold tracking-[-0.02em] text-[var(--foreground)]">
                  <span className="tabular-nums">x{entry.quantity}</span>
                </div>
              </div>
              <h3 className="mt-3 truncate text-xl font-extrabold tracking-[-0.04em] text-[var(--foreground)] md:text-2xl">{entry.event_name}</h3>
              <div className="mt-4 text-sm text-[var(--muted)] md:text-[0.95rem]">
                {formatEventDate(entry.start_time)} | {formatEventTime(entry.start_time, entry.end_time)} WIB
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full border border-[var(--border)] bg-[var(--surface-hover)] px-4 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--foreground-soft)] md:text-xs">
                  Slot {entry.slot_key}
                </span>
                <span className="rounded-full border border-[var(--accent-soft-strong)] bg-[var(--accent-soft)] px-4 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--accent)] md:text-xs">
                  {entry.event_type}
                </span>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <div className="app-card p-6 text-sm text-[var(--muted)]">
          {entries.length ? `No saved entries match the ${filter} filter yet.` : "No collection entries yet. Open the collection desk to add your first saved slot."}
        </div>
      )}

      {deskOpen ? (
        <div className="collection-desk-overlay fixed inset-0 z-[var(--z-modal-backdrop)] flex items-start justify-center overflow-y-auto px-4 py-6 backdrop-blur-sm" onClick={() => setDeskOpen(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="collection-desk-title"
            aria-describedby="collection-desk-summary"
            className="collection-desk-shell w-full max-w-6xl rounded-xl border border-[var(--border)] bg-[var(--panel)] p-5 shadow-[0_20px_64px_rgba(0,0,0,0.32)]"
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
