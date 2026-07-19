/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V4 */
"use client";

import { useMemo, useState } from "react";

import { FilterPill } from "@/components/FilterPill";
import { MediaPlaceholder } from "@/components/MediaPlaceholder";
import { countPendingSlots, groupTimelineByMonth } from "@/lib/archive-data.ts";
import { formatEventTime } from "@/lib/format.ts";
import { buildTimelineCardState, buildTimelineFilterNote, filterTimelineEvents, getRouletteSeriesOptions } from "@/lib/timeline-view.ts";
import type { TimelineEvent } from "@/lib/types.ts";

const FILTERS = ["All", "Roulette", "Birthday", "Graduation"] as const;

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
        <div className="tabular-nums text-4xl font-extrabold tracking-[-0.04em] text-[var(--foreground)] md:text-[3.1rem]">{day}</div>
        <div className="mt-1 text-base font-bold text-[var(--muted-strong)] md:text-lg">{month}</div>
      </div>
    </div>
  );
}

function CompactDate({ value }: { value: string }) {
  const dt = new Date(value);
  const day = Number.isNaN(dt.getTime())
    ? "--"
    : new Intl.DateTimeFormat("en-GB", { day: "numeric", timeZone: "Asia/Jakarta" }).format(dt);

  return (
    <div className="shrink-0 tabular-nums">
      <span className="text-xl font-bold tracking-[-0.04em] text-[var(--foreground)]">{day}</span>
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

  const rouletteSeriesOptions = useMemo(() => getRouletteSeriesOptions(events), [events]);
  const filtered = useMemo(() => filterTimelineEvents(events, filterType, rouletteSeries), [events, filterType, rouletteSeries]);
  const pendingCount = useMemo(() => countPendingSlots(events), [events]);
  const sections = useMemo(() => groupTimelineByMonth(filtered), [filtered]);
  const filterNote = useMemo(() => buildTimelineFilterNote(filterType, rouletteSeries), [filterType, rouletteSeries]);

  return (
    <div className="space-y-6">
      <section className="app-shell grid gap-4 p-4 md:grid-cols-[0.9fr_0.9fr_1.3fr] md:p-5">
        <div>
          <div className="tabular-nums text-3xl font-extrabold tracking-[-0.04em] text-[var(--foreground)] md:text-4xl">{filtered.length}</div>
          <p className="mt-1 text-sm font-semibold text-[var(--muted-strong)]">Events shown</p>
        </div>
        <div>
          <div className={`tabular-nums text-3xl font-extrabold tracking-[-0.04em] md:text-4xl ${pendingCount ? "text-[var(--accent)]" : "text-[var(--foreground)]"}`}>{pendingCount}</div>
          <p className="mt-1 text-sm font-semibold text-[var(--muted-strong)]">Open slots</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-[var(--muted-strong)]">Filter</p>
          <div className="mt-3 flex flex-wrap gap-2.5 md:flex-nowrap">
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
          {filterType === "Roulette" ? (
            <label className="mt-4 block">
              <span className="text-xs font-semibold text-[var(--muted-strong)]">Roulette series</span>
              <select
                value={rouletteSeries}
                onChange={(event) => setRouletteSeries(event.target.value)}
                className="app-input mt-2 min-h-11 w-full truncate px-3 py-2.5 text-sm"
              >
                <option value="All">All roulette series</option>
                {rouletteSeriesOptions.map((series) => (
                  <option key={series} value={series}>{series}</option>
                ))}
              </select>
            </label>
          ) : null}
          <div className="mt-3 text-xs text-[var(--muted)] md:text-sm">{filterNote}</div>
        </div>
      </section>

      {sections.length ? (
        sections.map(([monthLabel, monthRows]) => (
          <section key={monthLabel} className="space-y-5 border-t border-[var(--border)] pt-5 sm:pt-6">
            <div className="text-sm font-bold uppercase tracking-[0.12em] text-[var(--muted-strong)] md:text-base">{monthLabel}</div>
            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              {monthRows.map((row) => {
                const card = buildTimelineCardState(row);

                return (
                    <article
                      key={row.id || `${row.event_name}-${row.start_time}`}
                      className="app-card-strong relative grid min-w-0 gap-2 p-2 md:grid-cols-[4rem_7.5rem_1fr] md:items-center md:gap-4 md:p-5"
                    >
                    <div className="hidden md:block absolute right-5 top-5 md:right-6 md:top-6">
                      <span className="inline-flex rounded-full border border-[var(--border)] bg-[var(--surface-hover)] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--accent)]">
                        {card.eventType}
                      </span>
                    </div>
                    <div className="flex min-w-0 items-center justify-between gap-1 md:hidden">
                      <CompactDate value={row.start_time} />
                      <span className="inline-flex min-w-0 truncate rounded-full border border-[var(--border)] bg-[var(--surface-hover)] px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-[var(--accent)]">
                        {card.eventType}
                      </span>
                    </div>
                    <div className="hidden md:block">
                      <DateRail value={row.start_time} />
                    </div>
                    <div className="aspect-video min-w-0 w-full overflow-hidden rounded-[var(--radius-sm)] bg-[var(--surface)] md:aspect-[4/3]">
                      {row.event_image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={row.event_image_url}
                          alt={row.event_name || "Event banner"}
                          width="480"
                          height="360"
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <MediaPlaceholder />
                      )}
                    </div>
                    <div className="min-w-0 space-y-2">
                      <div className="min-w-0 md:pr-24">
                        <div className="min-w-0">
                          <h2 className="truncate text-sm font-bold tracking-[-0.03em] text-[var(--foreground)] sm:text-base md:text-2xl">{row.event_name || "Untitled event"}</h2>
                          <p className="mt-0.5 truncate text-[11px] text-[var(--muted-strong)] md:mt-1 md:text-[0.95rem]">
                            {formatEventTime(row.start_time, row.end_time)} WIB
                          </p>
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
                  </article>
                );
              })}
            </div>
          </section>
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
