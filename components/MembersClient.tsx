"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { FilterPill } from "@/components/FilterPill";
import { MediaPlaceholder } from "@/components/MediaPlaceholder";
import { CloseIcon } from "@/components/UiIcons";
import { useDebouncedValue } from "@/components/useDebouncedValue";
import { memberMatchesQuery } from "@/lib/archive-data.ts";
import { formatEventDate } from "@/lib/format.ts";
import { STATUS_OPTIONS as MEMBER_STATUS_OPTIONS } from "@/lib/v2-helpers.ts";
import type { MemberHistoryEntry, MemberRecord } from "@/lib/types.ts";

const STATUS_OPTIONS = ["All", ...MEMBER_STATUS_OPTIONS] as const;

interface MemberBrowserItem extends MemberRecord {
  history: MemberHistoryEntry[];
  totalCheki: number;
}

export function MembersClient({ members }: { members: MemberBrowserItem[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<(typeof STATUS_OPTIONS)[number]>("All");
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const debouncedQuery = useDebouncedValue(query);

  const visibleMembers = useMemo(
    () =>
      members.filter(
        (member) =>
          (status === "All" || (member.status || "").toUpperCase() === status) &&
          (!debouncedQuery.trim() || memberMatchesQuery(member, debouncedQuery)),
      ),
    [debouncedQuery, members, status],
  );

  const membersWithHistory = visibleMembers.filter((member) => member.totalCheki > 0).length;
  const selectedMember = useMemo(
    () => visibleMembers.find((member) => member.id === selectedMemberId) ?? members.find((member) => member.id === selectedMemberId) ?? null,
    [members, selectedMemberId, visibleMembers],
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (selectedMember && dialog && !dialog.open) dialog.showModal();
  }, [selectedMember]);

  return (
    <div className="space-y-6">
      <section className="app-shell grid gap-4 p-4 md:grid-cols-[0.9fr_0.9fr_1.3fr] md:p-5">
        <div>
          <div className="text-3xl font-extrabold tracking-[-0.04em] text-[var(--foreground)] md:text-4xl">{visibleMembers.length}</div>
          <p className="mt-1 text-sm font-semibold text-[var(--muted-strong)]">Members shown</p>
        </div>
        <div>
          <div className="text-3xl font-extrabold tracking-[-0.04em] text-[var(--foreground)] md:text-4xl">{membersWithHistory}</div>
          <p className="mt-1 text-sm font-semibold text-[var(--muted-strong)]">With history</p>
        </div>
        <div className="space-y-3">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search nickname, full name, team, or generation"
            className="app-input min-h-11 w-full px-4 py-3 text-sm outline-none placeholder:text-[var(--muted)] md:text-base"
          />
          <div className="flex flex-wrap gap-2.5 md:flex-nowrap">
            {STATUS_OPTIONS.map((option) => (
              <FilterPill
                key={option}
                onClick={() => setStatus(option)}
                active={status === option}
              >
                {option}
              </FilterPill>
            ))}
          </div>
        </div>
      </section>

      {visibleMembers.length ? (
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {visibleMembers.map((member) => (
            <button
              key={member.id}
              type="button"
              onClick={() => setSelectedMemberId(member.id)}
                className="app-card p-4 text-left transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)]"
            >
              <div className="flex items-center gap-4">
                <div className="flex size-16 items-center justify-center overflow-hidden rounded-full border border-[var(--border)] bg-[var(--surface-strong)]">
                  {member.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={member.avatar_url} alt={member.nickname || "Member avatar"} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-lg font-bold text-[var(--foreground)]">{(member.nickname || "?").slice(0, 1).toUpperCase()}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-lg font-bold text-[var(--foreground)]">{member.nickname || "Unknown member"}</h2>
                  <div className="mt-2">
                    <span className="rounded-full border border-[var(--border)] bg-[var(--surface-strong)] px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-[var(--foreground-soft)]">
                      {member.status || "Unknown team"}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </section>
      ) : (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface)] px-6 py-16 text-center text-sm text-[var(--muted)]">
            <svg aria-hidden="true" className="size-12 text-[var(--muted-strong)]" fill="none" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5"/><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/></svg>
            <span className="font-semibold text-[var(--foreground)]">No members found</span>
            <span>Try a different search term or team filter.</span>
          </div>
      )}

      {selectedMember ? (
        <dialog
          ref={dialogRef}
          aria-labelledby="member-detail-title"
          className="m-auto max-h-[100dvh] w-full max-w-none overflow-visible bg-transparent p-3 text-[var(--foreground)] backdrop:bg-[var(--overlay)] backdrop:backdrop-blur-sm sm:p-6"
          onClick={(event) => {
            if (event.target === event.currentTarget) event.currentTarget.close();
          }}
          onClose={() => setSelectedMemberId(null)}
        >
          <div
            className="relative mx-auto max-h-[calc(100dvh-1.5rem)] w-full max-w-4xl overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-3 shadow-[var(--shadow-modal)] sm:max-h-[calc(100dvh-3rem)] sm:p-5"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="absolute right-3 top-3 inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] transition hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
              aria-label="Close member history"
            >
              <CloseIcon className="size-4" />
            </button>

            <div className="flex items-start justify-between gap-4 pr-12 sm:pr-14">
              <div className="grid flex-1 grid-cols-[5.75rem_1fr] items-start gap-3 sm:grid-cols-[11rem_1fr] sm:gap-4 lg:grid-cols-[14rem_1fr]">
                <div className="flex aspect-[3/4] w-[5.75rem] items-center justify-center self-start overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-strong)] sm:w-full sm:max-w-none sm:aspect-square">
                  {selectedMember.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={selectedMember.avatar_url} alt={selectedMember.nickname || "Member avatar"} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-6xl font-bold text-[var(--foreground)]">{(selectedMember.nickname || "?").slice(0, 1).toUpperCase()}</span>
                  )}
                </div>
                <div className="space-y-3">
                  <div>
                    <h2 id="member-detail-title" className="text-xl font-extrabold tracking-[-0.04em] text-[var(--foreground)] sm:text-[2.2rem]">{selectedMember.nickname || "Unknown member"}</h2>
                    <p className="mt-1 text-sm text-[var(--muted-strong)] sm:text-base">{selectedMember.full_name || "No full name"}</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    <span className="rounded-full border border-[var(--border)] bg-[var(--surface-hover)] px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--foreground-soft)] sm:px-3 sm:py-1.5 sm:text-xs">
                      {selectedMember.status || "Unknown team"}
                    </span>
                    <span className="rounded-full border border-[var(--border)] bg-[var(--surface-hover)] px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--foreground-soft)] sm:px-3 sm:py-1.5 sm:text-xs">
                      Generation {selectedMember.generasi || "?"}
                    </span>
                    <span className="rounded-full border border-[var(--accent-soft-strong)] bg-[var(--accent-soft)] px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--accent)] sm:px-3 sm:py-1.5 sm:text-xs">
                      Total entries {selectedMember.totalCheki}
                    </span>
                  </div>
                  <p className="text-xs leading-6 text-[var(--muted-strong)] sm:text-sm">
                    Most recent assigned event: {selectedMember.history[0] ? formatEventDate(selectedMember.history[0].start_time) : "No history yet"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5">
              <h3 className="text-lg font-bold text-[var(--foreground)]">Recent event history</h3>
              <div className="mt-3 overflow-x-auto pb-2">
                <div className="grid grid-flow-col grid-rows-1 auto-cols-[minmax(9rem,42vw)] gap-2.5 sm:auto-cols-[11rem] lg:auto-cols-[12rem]">
                {selectedMember.history.length ? (
                  selectedMember.history.map((row) => {
                    let slotLabel: string | null = "Slot A";
                    if (row.event_type === "Birthday" || row.event_type === "Graduation") {
                      slotLabel = null;
                    } else if (row.member_id_b === selectedMember.id && row.member_id_a !== selectedMember.id) {
                      slotLabel = "Slot B";
                    } else if ((row.slot_mode || 1) === 2 && row.member_id_a === selectedMember.id && row.member_id_b === selectedMember.id) {
                      slotLabel = "Slot A+B";
                    }

                    return (
                      <article key={row.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2">
                        <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[1rem] border border-[var(--border)] bg-[var(--surface-strong)]">
                          {row.event_image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={row.event_image_url} alt={row.event_name || "Event banner"} className="h-full w-full object-cover" />
                          ) : (
                            <MediaPlaceholder />
                          )}
                        </div>
                        <div className="mt-2">
                          <h4 className="truncate text-sm font-bold text-[var(--foreground)] sm:text-base">{row.event_name || "Untitled event"}</h4>
                          <p className="mt-1 text-xs text-[var(--muted-strong)] sm:text-sm">{formatEventDate(row.start_time)}</p>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          <span className="rounded-full border border-[var(--accent-soft-strong)] bg-[var(--accent-soft)] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--accent)] sm:px-2.5 sm:text-[11px]">
                            {row.event_type || "Roulette"}
                          </span>
                          {slotLabel ? (
                            <span className="rounded-full border border-[var(--border)] bg-[var(--surface-hover)] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--foreground-soft)] sm:px-2.5 sm:text-[11px]">
                              {slotLabel}
                            </span>
                          ) : null}
                        </div>
                      </article>
                    );
                  })
                ) : (
                  <div className="text-sm text-[var(--muted)]">No completed entries yet.</div>
                )}
                </div>
              </div>
            </div>
          </div>
        </dialog>
      ) : null}
    </div>
  );
}
