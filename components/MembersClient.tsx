"use client";

/* Hallmark · pre-emit critique: P4 H5 E4 S4 R5 V4 */

import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import { EventTeamBadge } from "@/components/EventTeamBadge";
import { FilterPill } from "@/components/FilterPill";
import { MediaPlaceholder } from "@/components/MediaPlaceholder";
import { CloseIcon } from "@/components/UiIcons";
import { useDebouncedValue } from "@/components/useDebouncedValue";
import { compareMembersByLastCheki, memberMatchesQuery } from "@/lib/archive-data.ts";
import { formatEventDate } from "@/lib/format.ts";
import { STATUS_OPTIONS as MEMBER_STATUS_OPTIONS } from "@/lib/v2-helpers.ts";
import type { MemberChekiStats, MemberHistoryEntry, MemberRecord, OverviewLeaderboardEntry } from "@/lib/types.ts";

const STATUS_OPTIONS = ["All", ...MEMBER_STATUS_OPTIONS] as const;

function buildStaggerStyle(index: number): CSSProperties {
  return { "--i": Math.min(index, 5) } as CSSProperties;
}

interface MemberBrowserItem extends MemberRecord, MemberChekiStats {
  history: MemberHistoryEntry[];
  totalCheki: number;
}

export function MembersClient({ members, leaderboard, initialQuery = "" }: {
  members: MemberBrowserItem[];
  leaderboard: OverviewLeaderboardEntry[];
  initialQuery?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [status, setStatus] = useState<(typeof STATUS_OPTIONS)[number]>("All");
  const [comparisonQuery, setComparisonQuery] = useState("");
  const [comparisonIds, setComparisonIds] = useState<string[]>([]);
  const [comparisonReady, setComparisonReady] = useState(false);
  const comparisonDialogRef = useRef<HTMLDialogElement>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const rankingRef = useRef<HTMLOListElement>(null);
  const rankingInteraction = useRef({ pointerHeld: false, touchHeld: false, wheelUntil: 0 });
  const debouncedQuery = useDebouncedValue(query);
  const rankingEntries = leaderboard.slice(0, 20);

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

  const comparisonChoices = members.filter((member) => memberMatchesQuery(member, comparisonQuery));
  const comparisonResults = members.filter((member) => comparisonIds.includes(member.id)).toSorted(compareMembersByLastCheki);

  const selectedMember = useMemo(
    () => visibleMembers.find((member) => member.id === selectedMemberId) ?? members.find((member) => member.id === selectedMemberId) ?? null,
    [members, selectedMemberId, visibleMembers],
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (selectedMember && dialog && !dialog.open) dialog.showModal();
  }, [selectedMember]);

  useEffect(() => {
    const rail = rankingRef.current;
    if (!rail || selectedMember) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const hoverAvailable = window.matchMedia("(hover: hover)");
    const interaction = rankingInteraction.current;
    function releasePointer() { interaction.pointerHeld = false; }
    function releaseTouch(event: TouchEvent) { interaction.touchHeld = event.touches.length > 0; }
    window.addEventListener("pointerup", releasePointer);
    window.addEventListener("pointercancel", releasePointer);
    window.addEventListener("touchend", releaseTouch);
    window.addEventListener("touchcancel", releaseTouch);
    let frame: number;
    let previous = 0;
    let offset = rail.scrollLeft;
    function move(time: number) {
      const elapsed = previous ? Math.min(time - previous, 50) : 0;
      previous = time;
      const paused = comparisonDialogRef.current?.open || interaction.pointerHeld || interaction.touchHeld || time < interaction.wheelUntil;
      const hovered = hoverAvailable.matches && rail?.matches(":hover");
      const keyboardFocused = rail?.matches(":focus-visible") || rail?.querySelector(":focus-visible");
      if (rail && !reducedMotion.matches && !paused && !hovered && !keyboardFocused) {
        const first = rail.firstElementChild as HTMLElement;
        const copy = rail.querySelector<HTMLElement>('[data-ranking-copy="true"]');
        const cycle = copy ? copy.offsetLeft - first.offsetLeft : 0;
        if (cycle > rail.clientWidth) {
          offset = (offset + elapsed * 0.025) % cycle;
          rail.scrollLeft = offset;
        }
      } else if (rail) {
        offset = rail.scrollLeft;
      }
      frame = requestAnimationFrame(move);
    }
    frame = requestAnimationFrame(move);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointerup", releasePointer);
      window.removeEventListener("pointercancel", releasePointer);
      window.removeEventListener("touchend", releaseTouch);
      window.removeEventListener("touchcancel", releaseTouch);
      interaction.pointerHeld = false;
      interaction.touchHeld = false;
    };
  }, [selectedMember, leaderboard.length]);

  return (
    <div className="space-y-6">
      <section id="ranking" className="member-ranking" aria-labelledby="ranking-title">
        <header className="member-ranking-heading">
          <div>
            <h2 id="ranking-title">Most frequent cheki members</h2>
            <p>Top 20 · Cheki show/event · Excludes birthday & graduation</p>
          </div>
        </header>
        {leaderboard.length ? (
          <ol ref={rankingRef} className="member-ranking-list" tabIndex={0} aria-label="Top 20 show/event cheki ranking. Scroll to see more members." onPointerDown={() => { rankingInteraction.current.pointerHeld = true; }} onTouchStart={() => { rankingInteraction.current.touchHeld = true; }} onWheel={() => { rankingInteraction.current.wheelUntil = performance.now() + 200; }}>
            {[...rankingEntries, ...rankingEntries].map((entry, index) => {
              const member = members.find((item) => item.id === entry.member_id);
              const isCopy = index >= rankingEntries.length;
              return (
                <li key={`${entry.member_id}-${index}`} data-ranking-copy={isCopy} aria-hidden={isCopy || undefined}>
                  <button type="button" tabIndex={isCopy ? -1 : undefined} disabled={!member} onClick={() => setSelectedMemberId(entry.member_id)} aria-haspopup="dialog" className="member-ranking-button">
                    <span className="member-ranking-place">#{entry.rank}</span>
                    <span className="member-ranking-name">{member?.nickname || entry.nickname}</span>
                    <span className="member-ranking-count"><strong>{entry.count}</strong> times</span>
                  </button>
                </li>
              );
            })}
          </ol>
        ) : <p className="text-sm text-[var(--muted)]">No show/event ranking available yet.</p>}
      </section>
      <section className="archive-controls" aria-label="Find a member">
        <div className="motion-card app-card grid gap-4 p-4 md:p-5">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-4">
            <label htmlFor="member-search" className="text-sm font-semibold text-[var(--muted-strong)]">Search members</label>
            <div className="grid min-w-0 gap-2 sm:grid-cols-[minmax(0,1fr)_auto] lg:grid-cols-[18rem_auto]">
              <input
                id="member-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                aria-label="Search members"
                placeholder="Search members"
                className="app-input min-h-11 w-full px-3 py-2 text-sm placeholder:text-[var(--muted)]"
              />
              <button type="button" aria-haspopup="dialog" className="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[var(--accent-soft-strong)] bg-[var(--accent-soft)] px-4 py-2 text-sm font-semibold text-[var(--accent)] transition-colors hover:bg-[var(--surface-hover)]" onClick={() => { setComparisonReady(false); comparisonDialogRef.current?.showModal(); }}>
                <svg aria-hidden="true" className="size-4 shrink-0" fill="none" viewBox="0 0 24 24"><path d="M4 8h16m-4-4 4 4-4 4M20 16H4m4-4-4 4 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                Compare members
              </button>
            </div>
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

      <p className="text-sm text-[var(--muted)]" aria-live="polite">{visibleMembers.length} members / Show/event cheki counts and last dates.</p>
      {visibleMembers.length ? (
        <section className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {visibleMembers.map((member, index) => (
            <button
              key={member.id}
              type="button"
              aria-haspopup="dialog"
              onClick={() => setSelectedMemberId(member.id)}
                className="motion-card motion-list-item app-card p-3 text-left transition-colors hover:bg-[var(--surface-hover)] sm:p-4"
              style={buildStaggerStyle(index)}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--border)] bg-[var(--surface-strong)] sm:size-16">
                  {member.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={member.avatar_url} alt={member.nickname || "Member avatar"} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-lg font-bold text-[var(--foreground)]">{(member.nickname || "?").slice(0, 1).toUpperCase()}</span>
                  )}
                </div>
                <div className="w-full min-w-0 flex-1">
                  <h2 className="truncate text-base font-semibold tracking-[-0.03em] text-[var(--foreground)] sm:text-lg">{member.nickname || "Unknown member"}</h2>
                  <p className="mt-1 text-sm text-[var(--muted)]"><strong className="text-[var(--foreground)]">{member.showEventCheki}</strong> times</p>
                  <p className="mt-1 text-xs text-[var(--muted)]">Last cheki: <span className="text-[var(--foreground-soft)]">{member.lastShowEventTime ? formatEventDate(member.lastShowEventTime) : "Not recorded"}</span></p>
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

      <dialog
        ref={comparisonDialogRef}
        aria-labelledby="comparison-title"
        className="app-modal-dialog m-auto max-h-[100dvh] w-full max-w-none overflow-visible bg-transparent p-3 text-[var(--foreground)] sm:p-6"
        onClick={(event) => { if (event.target === event.currentTarget) event.currentTarget.close(); }}
      >
        <div className="relative mx-auto max-h-[calc(100dvh-1.5rem)] w-full max-w-xl overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4 shadow-[var(--shadow-modal)] sm:max-h-[calc(100dvh-3rem)] sm:p-6" onClick={(event) => event.stopPropagation()}>
          <button type="button" aria-label="Close comparison" onClick={() => comparisonDialogRef.current?.close()} className="absolute right-3 top-3 inline-flex size-11 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:bg-[var(--surface-hover)]"><CloseIcon className="size-4" /></button>
          <h2 id="comparison-title" className="pr-12 text-xl font-semibold tracking-[-0.03em]">Compare members</h2>
          <p className="mt-2 pr-8 text-sm text-[var(--muted)]">Show/event cheki only. Excludes birthday & graduation.</p>
          {comparisonReady ? (
            <>
              <p className="mt-5 text-sm text-[var(--muted)]">Not recorded first, then oldest last cheki.</p>
              <table className="mt-3 w-full table-fixed text-left text-xs sm:text-sm">
                <thead className="text-[var(--muted)]"><tr><th scope="col" className="w-[38%] p-2">Member</th><th scope="col" className="w-[42%] p-2">Last cheki</th><th scope="col" className="w-[20%] p-2 text-right">Times</th></tr></thead>
                <tbody>{comparisonResults.map((member) => (
                  <tr key={member.id} className="border-t border-[var(--border)]"><th scope="row" className="break-words p-2 font-semibold">{member.nickname || member.full_name}</th><td className="p-2 text-[var(--muted-strong)]">{member.lastShowEventTime ? formatEventDate(member.lastShowEventTime) : "Not recorded"}</td><td className="p-2 text-right">{member.showEventCheki}</td></tr>
                ))}</tbody>
              </table>
              <button type="button" className="mt-5 min-h-11 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm hover:bg-[var(--surface-hover)]" onClick={() => setComparisonReady(false)}>Edit selection</button>
            </>
          ) : (
            <>
              <input value={comparisonQuery} onChange={(event) => setComparisonQuery(event.target.value)} aria-label="Find members to compare" placeholder="Find members to compare" className="app-input mt-5 min-h-11 w-full px-3 py-2 text-sm" />
              <div className="mt-3 max-h-[40dvh] overflow-y-auto rounded-xl border border-[var(--border)]">
                {comparisonChoices.length ? comparisonChoices.map((member) => (
                  <label key={member.id} className="flex min-h-12 cursor-pointer items-center gap-3 border-b border-[var(--border)] px-3 py-2 last:border-0 hover:bg-[var(--surface-hover)]">
                    <input type="checkbox" checked={comparisonIds.includes(member.id)} onChange={(event) => setComparisonIds((ids) => event.target.checked ? [...ids, member.id] : ids.filter((id) => id !== member.id))} className="size-4 shrink-0 accent-[var(--accent)]" />
                    <span className="min-w-0 flex-1 break-words text-sm">{member.nickname || member.full_name}</span>
                    <span className="shrink-0 text-xs text-[var(--muted)]">{member.showEventCheki} times</span>
                  </label>
                )) : <p className="p-3 text-sm text-[var(--muted)]">No members found.</p>}
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p aria-live="polite" className="text-sm text-[var(--muted)]">{comparisonIds.length} selected · Choose at least 2.</p>
                <button type="button" disabled={comparisonIds.length < 2} onClick={() => setComparisonReady(true)} className="min-h-11 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--accent-foreground)] hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-50">Sort selected</button>
              </div>
            </>
          )}
        </div>
      </dialog>

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
                      Total {selectedMember.totalCheki} times
                    </span>
                  </div>
                  <p className="text-sm text-[var(--muted)]">Show/event cheki: {selectedMember.showEventCheki} times. Last cheki: {selectedMember.lastShowEventTime ? formatEventDate(selectedMember.lastShowEventTime) : "Not recorded"}. Total includes birthday and graduation.</p>
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
