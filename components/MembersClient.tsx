"use client";

/* Hallmark · pre-emit critique: P4 H5 E4 S4 R5 V4 */

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";

import { EventTeamBadge } from "@/components/EventTeamBadge";
import { FilterPill } from "@/components/FilterPill";
import { MediaPlaceholder } from "@/components/MediaPlaceholder";
import { CloseIcon } from "@/components/UiIcons";
import { useDebouncedValue } from "@/components/useDebouncedValue";
import { compareMembersByLastCheki, getMemberChekiSummary, memberMatchesQuery, memberSortName } from "@/lib/archive-data.ts";
import { copyComparisonImage } from "@/lib/comparison-image.ts";
import { formatEventDate } from "@/lib/format.ts";
import { STATUS_OPTIONS as MEMBER_STATUS_OPTIONS } from "@/lib/v2-helpers.ts";
import type { MemberChekiStats, MemberHistoryEntry, MemberRecord, OverviewLeaderboardEntry } from "@/lib/types.ts";

const STATUS_OPTIONS = ["All", ...MEMBER_STATUS_OPTIONS] as const;

function MemberStatusSelect({ id, value, onChange }: {
  id: string;
  value: string;
  onChange: (status: string) => void;
}) {
  return (
    <div className="grid gap-1">
      <label htmlFor={id} className="text-sm font-semibold text-[var(--muted-strong)]">Member status</label>
      <select id={id} value={value} onChange={(event) => onChange(event.target.value)} className="app-input min-h-12 w-full min-w-0 px-3 text-base">
        {STATUS_OPTIONS.map((option) => <option key={option}>{option}</option>)}
      </select>
    </div>
  );
}

function RouletteSeriesSelect({ id, options, value, onChange }: {
  id: string;
  options: string[];
  value: string;
  onChange: (series: string) => void;
}) {
  return (
    <div className="grid gap-1">
      <label htmlFor={id} className="text-sm font-semibold text-[var(--muted-strong)]">Roulette series</label>
      <select id={id} value={value} onChange={(event) => onChange(event.target.value)} className="app-input min-h-12 w-full min-w-0 px-3 text-base">
        <option value="">All roulette series</option>
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </div>
  );
}

function subscribeToView(callback: () => void) {
  window.addEventListener("hashchange", callback);
  return () => window.removeEventListener("hashchange", callback);
}

function isRankingView() {
  return window.location.hash === "#ranking";
}

interface MemberBrowserItem extends MemberRecord, MemberChekiStats {
  history: MemberHistoryEntry[];
  totalCheki: number;
}

export function MembersClient({ members, leaderboard, rouletteSeriesOptions, initialQuery = "", canCopyImage = false }: {
  members: MemberBrowserItem[];
  leaderboard: OverviewLeaderboardEntry[];
  rouletteSeriesOptions: string[];
  initialQuery?: string;
  canCopyImage?: boolean;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [directorySeries, setDirectorySeries] = useState("");
  const [rankingQuery, setRankingQuery] = useState("");
  const [rankingStatus, setRankingStatus] = useState("All");
  const [rankingSeries, setRankingSeries] = useState("");
  const [status, setStatus] = useState<(typeof STATUS_OPTIONS)[number]>("All");
  const [showEventOnly, setShowEventOnly] = useState(false);
  const [comparisonQuery, setComparisonQuery] = useState("");
  const [comparisonStatus, setComparisonStatus] = useState("All");
  const [comparisonSeries, setComparisonSeries] = useState("");
  const [comparisonIds, setComparisonIds] = useState<string[]>([]);
  const [comparisonReady, setComparisonReady] = useState(false);
  const [copying, setCopying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");
  const comparisonDialogRef = useRef<HTMLDialogElement>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const showRanking = useSyncExternalStore(subscribeToView, isRankingView, () => false);
  const debouncedQuery = useDebouncedValue(query);
  const directoryQuery = query.trim() ? debouncedQuery : "";
  const membersById = useMemo(() => new Map(members.map((member) => [member.id, member])), [members]);
  const rankingName = rankingQuery.trim().toLowerCase();
  const rankingSeriesKey = rankingSeries.toLocaleLowerCase();
  const rankingFiltered = Boolean(rankingName || rankingSeriesKey) || rankingStatus !== "All";
  const visibleRanking = rankingFiltered
    ? leaderboard.filter((entry) => {
        const member = membersById.get(entry.member_id);
        const matchesStatus = rankingStatus === "All" || member?.status?.toUpperCase() === rankingStatus;
        const matchesName = !rankingName || [member?.nickname, member?.full_name, entry.nickname, entry.full_name].some(
          (name) => name?.toLowerCase().includes(rankingName),
        );
        const matchesSeries = !rankingSeriesKey || entry.roulette_series.includes(rankingSeriesKey);
        return matchesStatus && matchesName && matchesSeries;
      })
    : leaderboard;

  const directorySeriesKey = directorySeries.toLocaleLowerCase();
  const seriesByMemberId = useMemo(
    () => new Map(leaderboard.map((entry) => [entry.member_id, entry.roulette_series])),
    [leaderboard],
  );
  const visibleMembers = useMemo(
    () =>
      members
        .filter(
          (member) =>
            (status === "All" || (member.status || "").toUpperCase() === status) &&
            (!directorySeriesKey || seriesByMemberId.get(member.id)?.includes(directorySeriesKey)) &&
            (!directoryQuery.trim() || memberMatchesQuery(member, directoryQuery)),
        )
        .toSorted((a, b) => memberSortName(a).localeCompare(memberSortName(b))),
    [directoryQuery, directorySeriesKey, members, seriesByMemberId, status],
  );

  const comparisonSeriesKey = comparisonSeries.toLocaleLowerCase();
  const comparisonChoices = members.filter((member) =>
    memberMatchesQuery(member, comparisonQuery) &&
    (comparisonStatus === "All" || member.status?.toUpperCase() === comparisonStatus) &&
    (!comparisonSeriesKey || seriesByMemberId.get(member.id)?.includes(comparisonSeriesKey)),
  ).toSorted((a, b) => memberSortName(a).localeCompare(memberSortName(b)));
  const comparisonResults = members.filter((member) => comparisonIds.includes(member.id)).toSorted(compareMembersByLastCheki);

  async function copyComparison() {
    if (!canCopyImage) return;
    setCopying(true);
    setCopied(false);
    setCopyError("");
    try {
      const theme = document.documentElement.dataset.theme === "light" ? "light" : "dark";
      await copyComparisonImage(comparisonResults, theme);
      setCopied(true);
    } catch {
      setCopyError("Could not copy image. Allow clipboard access and use a supported browser over HTTPS.");
    } finally {
      setCopying(false);
    }
  }

  const selectedMember = useMemo(
    () => visibleMembers.find((member) => member.id === selectedMemberId) ?? members.find((member) => member.id === selectedMemberId) ?? null,
    [members, selectedMemberId, visibleMembers],
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (selectedMember && dialog && !dialog.open) dialog.showModal();
  }, [selectedMember]);

  function resetDirectory() {
    setQuery("");
    setDirectorySeries("");
    setStatus("All");
    setShowEventOnly(false);
    const url = new URL(window.location.href);
    if (url.searchParams.has("q")) {
      url.searchParams.delete("q");
      window.history.replaceState(null, "", url);
    }
  }

  function resetComparisonSearch() {
    setComparisonQuery("");
    setComparisonStatus("All");
    setComparisonSeries("");
    setComparisonIds([]);
  }

  function resetRankingSearch() {
    setRankingQuery("");
    setRankingStatus("All");
    setRankingSeries("");
  }

  return (
    <div className="members-workspace">
      <nav id="directory" className="archive-view-nav" aria-label="Members views">
        <a href="#directory" aria-current={!showRanking ? "location" : undefined}>Directory</a>
        <a href="#ranking" aria-current={showRanking ? "location" : undefined}>Ranking</a>
      </nav>
      {showRanking ? (
      <section id="ranking" className="member-ranking" aria-labelledby="ranking-title">
        <header>
          <h2 id="ranking-title">Most frequent Chekicha members</h2>
          <p>Members with at least one show/event appearance. Excludes birthday &amp; graduation.</p>
        </header>
        {leaderboard.length > 0 && (
          <search aria-label="Ranking search" className="mb-3 grid max-w-md gap-1.5">
            <label htmlFor="ranking-search" className="text-sm font-semibold text-[var(--muted-strong)]">Search by name</label>
            <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
              <input
                id="ranking-search"
                type="search"
                value={rankingQuery}
                onChange={(event) => setRankingQuery(event.target.value)}
                placeholder="Nickname or full name"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                className="app-input min-h-12 w-full px-3 py-2 text-base placeholder:text-[var(--muted)]"
              />
              <button type="button" className="archive-secondary-action" aria-label="Reset ranking search and filters" onClick={resetRankingSearch}>
                Reset
              </button>
            </div>
            <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
              <MemberStatusSelect id="ranking-member-status" value={rankingStatus} onChange={setRankingStatus} />
              <RouletteSeriesSelect id="ranking-roulette-series" options={rouletteSeriesOptions} value={rankingSeries} onChange={setRankingSeries} />
            </div>
          </search>
        )}
        <p role="status" className="mb-2 text-sm text-[var(--muted)] empty:mb-0">
          {rankingFiltered && (visibleRanking.length ? `${visibleRanking.length} ${visibleRanking.length === 1 ? "match" : "matches"}` : "No ranked members match these filters.")}
        </p>
        {visibleRanking.length > 0 && (
          <ol className="archive-member-list" role="list" aria-label="Show/event Chekicha ranking">
            {visibleRanking.map((entry, index) => {
              const member = membersById.get(entry.member_id);
              const name = member?.nickname || entry.nickname;
              const avatar = member?.avatar_url || entry.avatar_url;
              return (
                <li key={entry.member_id}>
                  <button type="button" disabled={!member} onClick={() => setSelectedMemberId(entry.member_id)} aria-haspopup="dialog" className="archive-member-row member-ranking-row">
                    <span className="member-ranking-place">#{entry.rank}</span>
                    <span className="archive-card-photo" aria-hidden="true">
                      {avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={avatar} alt="" loading={index < 8 ? "eager" : "lazy"} decoding="async" />
                      ) : name.slice(0, 1).toUpperCase()}
                    </span>
                    <span className="archive-member-identity"><strong>{name}</strong></span>
                    <span className="archive-member-quantity"><strong>{entry.count}</strong> {entry.count === 1 ? "time" : "times"}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        )}
        {leaderboard.length === 0 && <p className="text-sm text-[var(--muted)]">No show/event ranking available yet.</p>}
      </section>
      ) : (
      <>
      <section className="directory-controls" aria-label="Find a member">
          <div className="directory-toolbar">
            <label htmlFor="member-search" className="sr-only">Search members</label>
              <input
                id="member-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Find a member"
                className="app-input min-h-11 w-full px-3 py-2 text-sm placeholder:text-[var(--muted)]"
              />
              <button type="button" className="archive-secondary-action" aria-label="Reset search and filters" onClick={resetDirectory}>
                Reset
              </button>
          </div>
          <div className="directory-team-filters flex flex-wrap gap-1.5" role="group" aria-label="Filter by team or status">
            {STATUS_OPTIONS.map((option) => (
              <FilterPill key={option} onClick={() => setStatus(option)} active={status === option}>
                {option}
              </FilterPill>
            ))}
          </div>
          <div className="directory-type-toolbar flex flex-wrap items-center justify-between gap-2">
            <div role="group" aria-label="Chekicha types" className="directory-type-filters flex flex-wrap items-center gap-1.5">
              <FilterPill onClick={() => setShowEventOnly(false)} active={!showEventOnly}>All types</FilterPill>
              <FilterPill onClick={() => setShowEventOnly(true)} active={showEventOnly}>Show/event only</FilterPill>
            </div>
            <button type="button" aria-label="Compare members" aria-haspopup="dialog" className="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[var(--accent-soft-strong)] bg-[var(--accent-soft)] px-3 py-2 text-sm font-semibold text-[var(--accent)] transition-colors hover:bg-[var(--surface-hover)]" onClick={() => { setComparisonReady(false); setCopied(false); setCopyError(""); comparisonDialogRef.current?.showModal(); }}>
              <svg aria-hidden="true" className="size-4 shrink-0" fill="none" viewBox="0 0 24 24"><path d="M4 8h16m-4-4 4 4-4 4M20 16H4m4-4-4 4 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Compare
            </button>
          </div>
          {rouletteSeriesOptions.length > 0 && (
            <div className="max-w-md">
              <RouletteSeriesSelect id="directory-roulette-series" options={rouletteSeriesOptions} value={directorySeries} onChange={setDirectorySeries} />
            </div>
          )}
      </section>

          <p className="text-sm text-[var(--muted)]" aria-live="polite">{visibleMembers.length} {visibleMembers.length === 1 ? "member" : "members"}{directorySeries ? ` · ${directorySeries} participants` : ""} · {showEventOnly ? "Show/event Chekicha only. Excludes birthday & graduation." : "All Chekicha types, including birthday & graduation."}</p>
      {visibleMembers.length ? (
        <ul className="archive-member-list" role="list" aria-label="Member directory">
          {visibleMembers.map((member, index) => {
            const { count, lastTime } = getMemberChekiSummary(member, showEventOnly);
            const name = member.nickname || "Unknown member";
            return (
              <li key={member.id}>
                <button type="button" className="archive-member-row" aria-haspopup="dialog" onClick={() => setSelectedMemberId(member.id)}>
                  <span className="archive-card-photo" aria-hidden="true">
                    {member.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={member.avatar_url} alt="" loading={index < 8 ? "eager" : "lazy"} decoding="async" />
                    ) : (member.nickname || "?").slice(0, 1).toUpperCase()}
                  </span>
                  <span className="archive-member-identity">
                    <strong>{name}</strong>
                    <span>{member.status || "Unknown team"} · Last: {lastTime ? formatEventDate(lastTime) : "Not recorded"}</span>
                  </span>
                  <span className="archive-member-quantity"><strong>{count}</strong> {count === 1 ? "time" : "times"}</span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface)] px-6 py-16 text-center text-sm text-[var(--muted)]">
            <svg aria-hidden="true" className="size-12 text-[var(--muted-strong)]" fill="none" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5"/><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/></svg>
            <span className="font-semibold text-[var(--foreground)]">No members found</span>
            <span>Try a different name, status, or Roulette series.</span>
          </div>
      )}
      </>
      )}

      <dialog
        ref={comparisonDialogRef}
        aria-labelledby="comparison-title"
        className="app-modal-dialog m-auto max-h-[100dvh] w-full max-w-none overflow-visible bg-transparent p-3 text-[var(--foreground)] sm:p-6"
        onClick={(event) => { if (event.target === event.currentTarget) event.currentTarget.close(); }}
      >
        <div className="comparison-content mx-auto max-h-[calc(100dvh-1.5rem)] w-full max-w-xl overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--panel)] shadow-[var(--shadow-modal)] sm:max-h-[calc(100dvh-3rem)]" onClick={(event) => event.stopPropagation()}>
          <header className="archive-sticky-header comparison-header flex items-center justify-between gap-4">
            <h2 id="comparison-title" className="min-w-0 text-xl font-semibold tracking-[-0.03em]">Compare members</h2>
            <button type="button" aria-label="Close comparison" onClick={() => comparisonDialogRef.current?.close()} className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:bg-[var(--surface-hover)]"><CloseIcon className="size-4" /></button>
          </header>
          <p className="mt-2 text-sm text-[var(--muted)]">Show/event Chekicha only. Excludes birthday & graduation.</p>
          {comparisonReady ? (
            <>
              <p className="mt-5 text-sm text-[var(--muted)]">Unrecorded first, then oldest last date.</p>
              <table className="mt-3 w-full table-fixed text-left text-xs sm:text-sm">
                <thead className="text-[var(--muted)]"><tr><th scope="col" className="w-[38%] p-2">Member</th><th scope="col" className="w-[42%] p-2">Last Chekicha</th><th scope="col" className="w-[20%] p-2 text-right">Times</th></tr></thead>
                <tbody>{comparisonResults.map((member) => (
                  <tr key={member.id} className="border-t border-[var(--border)]"><th scope="row" className="break-words p-2 font-semibold">{member.nickname || member.full_name}</th><td className="p-2 text-[var(--muted-strong)]">{member.lastShowEventTime ? formatEventDate(member.lastShowEventTime) : "Not recorded"}</td><td className="p-2 text-right">{member.showEventCheki}</td></tr>
                ))}</tbody>
              </table>
              <div className="mt-5 flex flex-wrap gap-2">
                <button type="button" disabled={copying} className="min-h-11 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm hover:bg-[var(--surface-hover)] disabled:cursor-not-allowed disabled:opacity-50" onClick={() => { setComparisonReady(false); setCopied(false); setCopyError(""); }}>Edit selection</button>
                {canCopyImage ? <button type="button" disabled={copying} aria-busy={copying} onClick={copyComparison} className="min-h-11 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--accent-foreground)] hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-50">{copying ? "Copying…" : "Copy image"}</button> : null}
              </div>
              {canCopyImage ? <>
                <p role="status" className="mt-3 text-sm text-[var(--muted)]">{copied ? "Copied! Paste it into your chat." : ""}</p>
                {copyError ? <p role="alert" className="mt-3 text-sm text-[var(--danger-foreground)]">{copyError}</p> : null}
              </> : null}
            </>
          ) : (
            <>
              <div className="mt-5 grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                <input
                  type="search"
                  value={comparisonQuery}
                  onChange={(event) => setComparisonQuery(event.target.value)}
                  aria-label="Find members to compare"
                  placeholder="Find a member"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  className="app-input min-h-12 w-full px-3 py-2 text-base placeholder:text-[var(--muted)]"
                />
                <button type="button" className="archive-secondary-action" aria-label="Reset comparison search, filters, and selection" onClick={resetComparisonSearch}>
                  Reset
                </button>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
                <MemberStatusSelect id="comparison-member-status" value={comparisonStatus} onChange={setComparisonStatus} />
                {rouletteSeriesOptions.length > 0 && (
                  <RouletteSeriesSelect id="comparison-roulette-series" options={rouletteSeriesOptions} value={comparisonSeries} onChange={setComparisonSeries} />
                )}
              </div>
              <div className="mt-3 max-h-[40dvh] overflow-y-auto rounded-xl border border-[var(--border)]">
                {comparisonChoices.length ? comparisonChoices.map((member) => (
                  <label key={member.id} className="flex min-h-12 cursor-pointer items-center gap-3 border-b border-[var(--border)] px-3 py-2 last:border-0 hover:bg-[var(--surface-hover)]">
                    <input type="checkbox" checked={comparisonIds.includes(member.id)} onChange={(event) => setComparisonIds((ids) => event.target.checked ? [...ids, member.id] : ids.filter((id) => id !== member.id))} className="size-4 shrink-0 accent-[var(--accent)]" />
                    <span className="min-w-0 flex-1 break-words text-sm">{member.nickname || member.full_name}</span>
                    <span className="shrink-0 text-xs text-[var(--muted)]">{member.showEventCheki} {member.showEventCheki === 1 ? "time" : "times"}</span>
                  </label>
                )) : <p className="p-3 text-sm text-[var(--muted)]">No members found.</p>}
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <p aria-live="polite" className="text-sm text-[var(--muted)]">{comparisonIds.length} selected · Choose at least 2 members.</p>
                  <button type="button" disabled={!comparisonIds.length} onClick={() => setComparisonIds([])} className="min-h-11 whitespace-nowrap rounded-lg px-2 text-sm text-[var(--accent)] underline underline-offset-4 hover:bg-[var(--surface-hover)] disabled:cursor-not-allowed disabled:text-[var(--muted)] disabled:no-underline disabled:opacity-50">Clear selection</button>
                </div>
                <button type="button" disabled={comparisonIds.length < 2} onClick={() => setComparisonReady(true)} className="min-h-11 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--accent-foreground)] hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-50">Compare selected</button>
              </div>
            </>
          )}
        </div>
      </dialog>

      {selectedMember ? (
        <dialog
          ref={dialogRef}
          aria-labelledby="member-detail-title"
          className="app-modal-dialog archive-detail-drawer"
          onClick={(event) => {
            if (event.target === event.currentTarget) event.currentTarget.close();
          }}
          onClose={() => {
            const delay = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 180;
            window.setTimeout(() => setSelectedMemberId(null), delay);
          }}
        >
          <div
            className="archive-drawer-content directory-history-content"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="archive-sticky-header directory-history-header flex items-center justify-between gap-4">
              <h2 id="member-detail-title" className="min-w-0 break-words text-xl font-semibold tracking-[-0.03em] text-[var(--foreground)] sm:text-2xl">{selectedMember.nickname || "Unknown member"}</h2>
              <button
                type="button"
                onClick={() => dialogRef.current?.close()}
                className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] transition-colors hover:bg-[var(--surface-hover)]"
                aria-label="Close member history"
              >
                <CloseIcon className="size-4" />
              </button>
            </header>

            <div className="mt-4 flex items-start justify-between gap-4">
              <div className="grid min-w-0 flex-1 grid-cols-[minmax(3.5rem,24%)_minmax(0,1fr)] items-start gap-3">
                <div className="archive-card-photo">
                  {selectedMember.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={selectedMember.avatar_url} alt="" />
                  ) : (
                    <span className="text-6xl font-bold text-[var(--foreground)]">{(selectedMember.nickname || "?").slice(0, 1).toUpperCase()}</span>
                  )}
                </div>
                <div className="space-y-3">
                  <p className="text-sm text-[var(--muted-strong)] sm:text-base">{selectedMember.full_name || "No full name"}</p>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    <span className="rounded-full border border-[var(--border)] bg-[var(--surface-hover)] px-2.5 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[var(--foreground-soft)] sm:px-3 sm:py-1.5 sm:text-xs">
                      {selectedMember.status || "Unknown team"}
                    </span>
                    <span className="rounded-full border border-[var(--border)] bg-[var(--surface-hover)] px-2.5 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[var(--foreground-soft)] sm:px-3 sm:py-1.5 sm:text-xs">
                      Generation {selectedMember.generasi || "?"}
                    </span>
                    <span className="rounded-full border border-[var(--accent-soft-strong)] bg-[var(--accent-soft)] px-2.5 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[var(--accent)] sm:px-3 sm:py-1.5 sm:text-xs">
                      All types {selectedMember.totalCheki} {selectedMember.totalCheki === 1 ? "time" : "times"}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--muted)]">Show/event: {selectedMember.showEventCheki} {selectedMember.showEventCheki === 1 ? "time" : "times"} · Last: {selectedMember.lastShowEventTime ? formatEventDate(selectedMember.lastShowEventTime) : "Not recorded"}</p>
                  <p className="text-xs leading-6 text-[var(--muted-strong)] sm:text-sm">
                    Last Chekicha (all types): {selectedMember.history[0] ? formatEventDate(selectedMember.history[0].start_time) : "Not recorded"}. Includes birthday & graduation.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5">
              <h3 className="text-lg font-semibold tracking-[-0.03em] text-[var(--foreground)]">Recent event history</h3>
              <div className="mt-3">
                <div className="grid gap-3">
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
                      <article key={row.id} className="directory-history-row">
                        <div className={slotLabel ? "archive-card-photo directory-show-art" : "archive-card-photo"}>
                          {row.event_image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={row.event_image_url} alt="" loading="lazy" decoding="async" />
                          ) : (
                            <MediaPlaceholder />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="break-words text-sm font-semibold tracking-[-0.02em] text-[var(--foreground)] sm:text-base">{row.event_name || "Untitled event"}</h4>
                          <p className="mt-1 text-xs text-[var(--muted-strong)] sm:text-sm">{formatEventDate(row.start_time)}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          <span className="rounded-full border border-[var(--accent-soft-strong)] bg-[var(--accent-soft)] px-2 py-1 text-xs font-bold uppercase tracking-[0.12em] text-[var(--accent)] sm:px-2.5 sm:text-xs">
                            {row.event_type || "Roulette"}
                          </span>
                          <EventTeamBadge team={row.event_team} eventType={row.event_type} compact />
                          {slotLabel ? (
                            <span className="rounded-full border border-[var(--border)] bg-[var(--surface-hover)] px-2 py-1 text-xs font-bold uppercase tracking-[0.12em] text-[var(--foreground-soft)] sm:px-2.5 sm:text-xs">
                              {slotLabel}
                            </span>
                          ) : null}
                        </div>
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
