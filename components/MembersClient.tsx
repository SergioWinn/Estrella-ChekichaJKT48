"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import { EventTeamBadge } from "@/components/EventTeamBadge";
import { FilterPill } from "@/components/FilterPill";
import { MediaPlaceholder } from "@/components/MediaPlaceholder";
import { CloseIcon } from "@/components/UiIcons";
import { useDebouncedValue } from "@/components/useDebouncedValue";
import { memberMatchesQuery } from "@/lib/archive-data.ts";
import { formatEventDate } from "@/lib/format.ts";
import { STATUS_OPTIONS as MEMBER_STATUS_OPTIONS } from "@/lib/v2-helpers.ts";
import type { MemberHistoryEntry, MemberRecord } from "@/lib/types.ts";

const STATUS_OPTIONS = ["All", ...MEMBER_STATUS_OPTIONS] as const;

function buildStaggerStyle(index: number): CSSProperties {
  return { "--i": Math.min(index, 5) } as CSSProperties;
}

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
      members
        .filter(
          (member) =>
            (status === "All" || (member.status || "").toUpperCase() === status) &&
            (!debouncedQuery.trim() || memberMatchesQuery(member, debouncedQuery)),
        )
        .toSorted((a, b) => (a.full_name || a.nickname || "").localeCompare(b.full_name || b.nickname || "")),
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
      <section className="motion-section app-shell grid gap-4 p-4 md:p-5 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.28fr)] xl:items-start">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
          <div className="motion-card app-card p-4 md:p-5">
            <div className="tabular-nums text-3xl font-semibold tracking-[-0.05em] text-[var(--foreground)] md:text-4xl">{visibleMembers.length}</div>
            <p className="mt-1 text-sm font-semibold text-[var(--muted-strong)]">Members shown</p>
          </div>
          <div className="motion-card app-card p-4 md:p-5">
            <div className="tabular-nums text-3xl font-semibold tracking-[-0.05em] text-[var(--foreground)] md:text-4xl">{membersWithHistory}</div>
            <p className="mt-1 text-sm font-semibold text-[var(--muted-strong)]">With history</p>
          </div>
        </div>
        <div className="motion-card app-card grid gap-4 p-4 md:p-5">
          <div className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_minmax(14rem,18rem)] lg:items-start lg:gap-4">
            <div>
              <p className="text-sm font-semibold text-[var(--muted-strong)]">Search members</p>
              <p className="mt-2 max-w-[32rem] text-sm leading-6 text-[var(--muted)]">Search nickname, full name, team, or generation.</p>
            </div>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Search members"
              placeholder="Search members"
              className="app-input min-h-10 w-full px-3 py-2 text-sm placeholder:text-[var(--muted)]"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((option) => (
              <FilterPill key={option} onClick={() => setStatus(option)} active={status === option}>
                {option}
              </FilterPill>
            ))}
          </div>
        </div>
      </section>

      {visibleMembers.length ? (
        <section className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {visibleMembers.map((member, index) => (
            <button
              key={member.id}
              type="button"
              onClick={() => setSelectedMemberId(member.id)}
                className="motion-card motion-list-item app-card p-3 text-left transition-colors hover:bg-[var(--surface-hover)] sm:p-4"
              style={buildStaggerStyle(index)}
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="flex size-14 items-center justify-center overflow-hidden rounded-full border border-[var(--border)] bg-[var(--surface-strong)] sm:size-16">
                  {member.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={member.avatar_url} alt={member.nickname || "Member avatar"} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-lg font-bold text-[var(--foreground)]">{(member.nickname || "?").slice(0, 1).toUpperCase()}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-base font-semibold tracking-[-0.03em] text-[var(--foreground)] sm:text-lg">{member.nickname || "Unknown member"}</h2>
                  <div className="mt-1.5">
                    <span className="rounded-full border border-[var(--border)] bg-[var(--surface-strong)] px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--foreground-soft)] sm:px-3 sm:text-xs">
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
          className="app-modal-dialog m-auto max-h-[100dvh] w-full max-w-none overflow-visible bg-transparent p-3 text-[var(--foreground)] sm:p-6"
          onClick={(event) => {
            if (event.target === event.currentTarget) event.currentTarget.close();
          }}
          onClose={() => {
            const delay = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 180;
            window.setTimeout(() => setSelectedMemberId(null), delay);
          }}
        >
          <div
            className="relative mx-auto max-h-[calc(100dvh-1.5rem)] w-full max-w-4xl overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-3 shadow-[var(--shadow-modal)] sm:max-h-[calc(100dvh-3rem)] sm:p-5"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="absolute right-3 top-3 inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] transition-colors hover:bg-[var(--surface-hover)]"
              aria-label="Close member history"
            >
              <CloseIcon className="size-4" />
            </button>

            <div className="flex items-start justify-between gap-4 pr-12 sm:pr-14">
              <div className="grid min-w-0 flex-1 grid-cols-[5.75rem_minmax(0,1fr)] items-start gap-3 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-4 lg:grid-cols-[14rem_minmax(0,1fr)]">
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
                    <h2 id="member-detail-title" className="text-xl font-semibold tracking-[-0.05em] text-[var(--foreground)] sm:text-[2.2rem]">{selectedMember.nickname || "Unknown member"}</h2>
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
              <h3 className="text-lg font-semibold tracking-[-0.03em] text-[var(--foreground)]">Recent event history</h3>
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
                      <article key={row.id} className="border-t border-[var(--border)] pt-2">
                        <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[1rem] border border-[var(--border)] bg-[var(--surface-strong)]">
                          {row.event_image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={row.event_image_url} alt={row.event_name || "Event banner"} className="h-full w-full object-cover" />
                          ) : (
                            <MediaPlaceholder />
                          )}
                        </div>
                        <div className="mt-2">
                          <h4 className="truncate text-sm font-semibold tracking-[-0.02em] text-[var(--foreground)] sm:text-base">{row.event_name || "Untitled event"}</h4>
                          <p className="mt-1 text-xs text-[var(--muted-strong)] sm:text-sm">{formatEventDate(row.start_time)}</p>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          <span className="rounded-full border border-[var(--accent-soft-strong)] bg-[var(--accent-soft)] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--accent)] sm:px-2.5 sm:text-[11px]">
                            {row.event_type || "Roulette"}
                          </span>
                          <EventTeamBadge team={row.event_team} eventType={row.event_type} compact />
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
