/* Hallmark - pre-emit critique: P5 H5 E5 S5 R5 V4 */
"use client";

import type { CSSProperties } from "react";
import { useMemo, useState } from "react";

import { EventTeamBadge } from "@/components/EventTeamBadge";
import { FilterPill } from "@/components/FilterPill";
import { MediaPlaceholder } from "@/components/MediaPlaceholder";
import { countPendingSlots, groupTimelineByMonth } from "@/lib/archive-data.ts";
import { formatEventTime } from "@/lib/format.ts";
import { buildTimelineCardState, buildTimelineFilterNote, countTimelineTeams, filterTimelineEvents, getRouletteSeriesOptions } from "@/lib/timeline-view.ts";
import { EVENT_TEAM_OPTIONS, getEffectiveEventTeam } from "@/lib/v2-helpers.ts";
import type { TimelineEvent } from "@/lib/types.ts";

const FILTERS = ["All", "Roulette", "Birthday", "Graduation"] as const;
type TeamFilter = "All" | (typeof EVENT_TEAM_OPTIONS)[number];

function DateRail({ value }: { value: string }) {
  const dt = new Date(value);
  const day = Number.isNaN(dt.getTime())
    ? "--"
    : new Intl.DateTimeFormat("en-GB", { day: "numeric", timeZone: "Asia/Jakarta" }).format(dt);
  const month = Number.isNaN(dt.getTime())
    ? "---"
    : new Intl.DateTimeFormat("en-GB", { month: "short", timeZone: "Asia/Jakarta" }).format(dt).toUpperCase();

  return (
    <div className="flex min-h-full items-center justify-center border-b border-[var(--border)] pb-3 md:justify-start md:border-b-0 md:border-r md:pb-0 md:pr-4">
      <div className="text-center md:min-w-14">
        <div className="tabular-nums text-4xl font-semibold tracking-[-0.05em] text-[var(--foreground)] md:text-[3.1rem]">{day}</div>
        <div className="mt-1 text-base font-semibold text-[var(--muted-strong)] md:text-lg">{month}</div>
      </div>
    </div>
  );
}

function CompactDate({ value }: { value: string }) {
  const dt = new Date(value);
  const day = Number.isNaN(dt.getTime())
    ? "--"
    : new Intl.DateTimeFormat("en-GB", { day: "numeric", timeZone: "Asia/Jakarta" }).format(dt);
  const month = Number.isNaN(dt.getTime())
    ? "---"
    : new Intl.DateTimeFormat("en-GB", { month: "short", timeZone: "Asia/Jakarta" }).format(dt).toUpperCase();

  return (
    <div className="timeline-mobile-date shrink-0 tabular-nums">
      <span className="timeline-mobile-date-day text-3xl font-semibold tracking-[-0.06em] text-[var(--foreground)]">{day}</span>
      <span className="timeline-mobile-date-month text-[10px] font-semibold tracking-[0.16em] text-[var(--muted-strong)]">{month}</span>
    </div>
  );
}

function MemberPill({
  avatarUrl,
  name,
  waiting = false,
}: {
  avatarUrl?: string | null;
  name: string;
  waiting?: boolean;
}) {
  return (
    <span
      className={`inline-flex min-w-0 max-w-full shrink-0 items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-medium md:gap-2 md:px-3 md:py-1.5 md:text-sm ${
        waiting
          ? "border-[var(--warning-border)] bg-[var(--warning-soft)] text-[var(--warning)]"
          : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)]"
      }`}
    >
      {!waiting ? (
        <span className="flex size-5 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--border)] bg-[var(--surface-hover)] md:size-7">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs font-bold text-[var(--foreground)]">{name.slice(0, 1).toUpperCase()}</span>
          )}
        </span>
      ) : null}
      <span className="truncate">{name}</span>
    </span>
  );
}

export function TimelineClient({ events }: { events: TimelineEvent[] }) {
  const [filterType, setFilterType] = useState<(typeof FILTERS)[number]>("All");
  const [rouletteSeries, setRouletteSeries] = useState("All");
  const [teamFilter, setTeamFilter] = useState<TeamFilter>("All");

  const rouletteSeriesOptions = useMemo(() => getRouletteSeriesOptions(events), [events]);
  const teamBaseEvents = useMemo(() => filterTimelineEvents(events, filterType, rouletteSeries), [events, filterType, rouletteSeries]);
  const teamCounts = useMemo(() => countTimelineTeams(teamBaseEvents), [teamBaseEvents]);
  const availableTeamFilters = useMemo(() => EVENT_TEAM_OPTIONS.filter((team) => teamCounts[team] > 0), [teamCounts]);
  const activeTeamFilter = availableTeamFilters.length > 1 && availableTeamFilters.includes(teamFilter as never) ? teamFilter : "All";
  const teamFilterLocked = availableTeamFilters.length <= 1;
  const filtered = useMemo(() => filterTimelineEvents(events, filterType, rouletteSeries, activeTeamFilter), [events, filterType, rouletteSeries, activeTeamFilter]);
  const pendingCount = useMemo(() => countPendingSlots(events), [events]);
  const sections = useMemo(() => groupTimelineByMonth(filtered), [filtered]);
  const filterNote = useMemo(() => buildTimelineFilterNote(filterType, rouletteSeries, activeTeamFilter), [filterType, rouletteSeries, activeTeamFilter]);
  const pendingLabel = pendingCount === 1 ? "1 row still needs a member assignment." : pendingCount > 1 ? `${pendingCount} rows still need member assignments.` : "All archived rows already have full member coverage.";

  return (
    <div className="space-y-6">
      <section className="motion-section app-shell grid gap-4 p-4 md:p-5 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.28fr)] xl:items-start">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
          <div className="motion-card app-card p-4 md:p-5">
            <div className="tabular-nums text-3xl font-semibold tracking-[-0.05em] text-[var(--foreground)] md:text-4xl">{filtered.length}</div>
            <p className="mt-1 text-sm font-semibold text-[var(--muted-strong)]">Events shown</p>
            <p className="mt-3 max-w-[22rem] text-sm leading-6 text-[var(--muted)]">
              {filtered.length === events.length ? "Showing the full archive across every saved month." : `Showing ${filtered.length} results from the active archive filters.`}
            </p>
          </div>
          <div className="motion-card app-card p-4 md:p-5">
            <div className={`tabular-nums text-3xl font-semibold tracking-[-0.05em] md:text-4xl ${pendingCount ? "text-[var(--accent)]" : "text-[var(--foreground)]"}`}>{pendingCount}</div>
            <p className="mt-1 text-sm font-semibold text-[var(--muted-strong)]">Open slots</p>
            <p className="mt-3 max-w-[22rem] text-sm leading-6 text-[var(--muted)]">{pendingLabel}</p>
          </div>
        </div>
        <div className="motion-card app-card grid gap-4 p-4 md:p-5">
          <div className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_minmax(14rem,18rem)] lg:items-start lg:gap-4">
            <div>
              <div className="kicker">Filter</div>
              <p className="mt-2 max-w-[32rem] text-sm leading-6 text-[var(--muted)]">
                Start with the event type, then tighten the list by series or team when you need a narrower audit slice.
              </p>
            </div>
            <div className="text-sm leading-6 text-[var(--foreground-soft)] lg:text-right" aria-live="polite">{filterNote}</div>
          </div>
          <div className="flex flex-wrap gap-2">
              {FILTERS.map((option) => (
                <FilterPill
                  key={option}
                  onClick={() => setFilterType(option)}
                  active={filterType === option}
                >
                  {option}
                </FilterPill>
              ))}
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="grid gap-1">
              <span className="text-xs font-semibold text-[var(--muted-strong)]">Series</span>
              <select
                value={filterType === "Roulette" ? rouletteSeries : "All"}
                onChange={(event) => setRouletteSeries(event.target.value)}
                disabled={filterType !== "Roulette"}
                aria-disabled={filterType !== "Roulette"}
                className="app-input min-h-10 w-full truncate px-3 py-2 text-sm disabled:text-[var(--muted)]"
              >
                <option value="All">{filterType === "Roulette" ? "All roulette series" : "Series only for roulette"}</option>
                {rouletteSeriesOptions.map((series) => (
                  <option key={series} value={series}>{series}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-1">
              <span className="text-xs font-semibold text-[var(--muted-strong)]">Team</span>
              <select
                value={activeTeamFilter}
                onChange={(event) => setTeamFilter(event.target.value as TeamFilter)}
                disabled={teamFilterLocked}
                aria-disabled={teamFilterLocked}
                className="app-input min-h-10 w-full truncate px-3 py-2 text-sm disabled:text-[var(--muted)]"
              >
                {teamFilterLocked ? (
                  <option value="All">{availableTeamFilters[0] ? `${availableTeamFilters[0]}` : "No team filter"}</option>
                ) : (
                  <>
                    <option value="All">All teams</option>
                    {availableTeamFilters.map((option) => (
                      <option key={option} value={option}>{`${option} ${teamCounts[option]}`}</option>
                    ))}
                  </>
                )}
              </select>
            </label>
          </div>
        </div>
      </section>

      {sections.length ? (
        sections.map(([monthLabel, monthRows], sectionIndex) => (
          <details key={monthLabel} open={sectionIndex === 0} className="app-disclosure motion-section border-t border-[var(--border)] pt-3 sm:pt-4">
            <summary className="timeline-month-summary cursor-pointer rounded-lg px-1 py-3 text-sm font-bold uppercase tracking-[0.16em] text-[var(--muted-strong)] transition-colors hover:text-[var(--foreground)] md:text-base">
              <span>{monthLabel}</span>
              <span className="inline-flex justify-center rounded-md bg-[var(--surface-hover)] px-2 py-1 text-[10px] tracking-normal text-[var(--foreground-soft)] md:text-xs">
                {monthRows.length} {monthRows.length === 1 ? "event" : "events"}
              </span>
            </summary>
            <div className="mt-3 grid grid-cols-2 gap-2 xl:mt-4 xl:gap-4">
              {monthRows.map((row, index) => {
                const card = buildTimelineCardState(row);
                const eventTeam = getEffectiveEventTeam(row.event_name, row.event_type, row.event_team);

                return (
                    <article
                      key={row.id || `${row.event_name}-${row.start_time}`}
                      className="timeline-slab motion-card motion-list-item app-card-strong relative grid min-w-0 grid-cols-1 items-start gap-3 p-3 xl:grid-cols-[4.5rem_minmax(0,1fr)_12.5rem] xl:items-center xl:gap-5 xl:p-5"
                      style={{ "--i": Math.min(index, 5) } as CSSProperties}
                    >
                    <div className="absolute right-6 top-6 hidden xl:block">
                      <span className="inline-flex rounded-full border border-[var(--border)] bg-[var(--surface-hover)] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--accent)]">
                        {card.eventType}
                      </span>
                    </div>
                    <div className="flex min-w-0 items-start justify-between gap-2 xl:hidden">
                      <CompactDate value={row.start_time} />
                      <span className="inline-flex min-w-0 truncate rounded-full border border-[var(--border)] bg-[var(--surface-hover)] px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-[var(--accent)]">
                        {card.eventType}
                      </span>
                    </div>
                    <div className="hidden xl:block">
                      <DateRail value={row.start_time} />
                    </div>
                    <div className="min-w-0 space-y-3">
                      <div className="min-w-0 xl:pr-24">
                        <div className="min-w-0">
                          <h2 className="truncate text-[1.2rem] font-semibold tracking-[-0.05em] text-[var(--foreground)] sm:text-[1.2rem] lg:text-[1.65rem]" title={row.event_name || "Untitled event"}>{row.event_name || "Untitled event"}</h2>
                          <div className="mt-2 flex min-w-0 flex-nowrap items-center gap-2 text-[0.8rem] font-semibold leading-[1.35] md:text-[0.95rem]">
                            <span className="min-w-0 truncate text-[var(--accent)]">{formatEventTime(row.start_time, row.end_time)} WIB</span>
                            <EventTeamBadge team={eventTeam} eventType={row.event_type} compact />
                          </div>
                        </div>
                      </div>
                      <div className="flex min-w-0 flex-wrap gap-1 md:flex-nowrap md:gap-2 md:overflow-x-auto md:pb-1">
                        {card.members.map((member, index) => (
                          <MemberPill
                            key={`${row.id}-${index}-${member.name}`}
                            avatarUrl={member.avatarUrl}
                            name={member.name}
                            waiting={member.waiting}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="timeline-media min-w-0 overflow-hidden rounded-[1rem] border border-[var(--border)] bg-[linear-gradient(180deg,var(--surface-hover),var(--surface))] p-2 sm:aspect-[4/3] sm:self-start md:max-h-40 md:p-3 xl:max-h-none">
                      {row.event_image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={row.event_image_url}
                          alt={row.event_name || "Event banner"}
                          width="320"
                          height="400"
                          loading="lazy"
                          className="h-full w-full object-contain object-center"
                        />
                      ) : (
                        <MediaPlaceholder />
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </details>
        ))
      ) : (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface)] px-6 py-16 text-center text-sm text-[var(--muted)]">
            <svg aria-hidden="true" className="size-12 text-[var(--muted-strong)]" fill="none" viewBox="0 0 24 24"><path d="M12 6v6l4 2" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5"/><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/></svg>
            <span className="font-semibold text-[var(--foreground)]">No events match this filter.</span>
            <span>Try a different filter or check back after the next session is archived.</span>
          </div>
      )}
    </div>
  );
}
