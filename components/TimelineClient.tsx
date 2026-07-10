"use client";

import { useMemo, useState } from "react";

import { FilterPill } from "@/components/FilterPill";
import { MediaPlaceholder } from "@/components/MediaPlaceholder";
import { countPendingSlots, groupTimelineByMonth } from "@/lib/archive-data.ts";
import { formatEventTime } from "@/lib/format.ts";
import { buildTimelineCardState, buildTimelineFilterNote } from "@/lib/timeline-view.ts";
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
        <div className="text-4xl font-extrabold tracking-[-0.06em] text-[var(--foreground)] md:text-[3.1rem]">{day}</div>
        <div className="mt-1 text-base font-bold uppercase tracking-[0.12em] text-[var(--muted-strong)] md:text-lg">{month}</div>
      </div>
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
      className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium md:text-sm ${
        waiting
          ? "border-[var(--warning-border)] bg-[var(--warning-soft)] text-[var(--warning)]"
          : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)]"
      }`}
    >
      {!waiting ? (
        <span className="flex size-6 items-center justify-center overflow-hidden rounded-full border border-[var(--border)] bg-[var(--surface-hover)] md:size-7">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs font-bold text-[var(--foreground)]">{name.slice(0, 1).toUpperCase()}</span>
          )}
        </span>
      ) : null}
      <span>{name}</span>
    </span>
  );
}

export function TimelineClient({ events }: { events: TimelineEvent[] }) {
  const [filterType, setFilterType] = useState<(typeof FILTERS)[number]>("All");

  const filtered = useMemo(
    () => (filterType === "All" ? events : events.filter((row) => (row.event_type || "Roulette") === filterType)),
    [events, filterType],
  );
  const pendingCount = useMemo(() => countPendingSlots(events), [events]);
  const sections = useMemo(() => groupTimelineByMonth(filtered), [filtered]);
  const filterNote = useMemo(() => buildTimelineFilterNote(filterType), [filterType]);

  return (
    <div className="space-y-6">
      <section className="app-shell grid gap-4 p-4 md:grid-cols-[0.9fr_0.9fr_1.3fr] md:p-5">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--muted)]">Events shown</div>
          <div className="mt-3 text-3xl font-extrabold tracking-[-0.06em] text-[var(--foreground)] md:text-4xl">{filtered.length}</div>
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--muted)]">Open slots</div>
          <div className={`mt-3 text-3xl font-extrabold tracking-[-0.06em] md:text-4xl ${pendingCount ? "text-[var(--accent)]" : "text-[var(--foreground)]"}`}>{pendingCount}</div>
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--muted)]">Filter</div>
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
          <div className="mt-3 text-xs text-[var(--muted)] md:text-sm">{filterNote}</div>
        </div>
      </section>

      {sections.length ? (
        sections.map(([monthLabel, monthRows]) => (
          <section key={monthLabel} className="app-card space-y-5 p-5 sm:p-6">
            <div className="text-sm font-bold uppercase tracking-[0.34em] text-[var(--muted-strong)] md:text-base">{monthLabel}</div>
            <div className="grid gap-6 xl:grid-cols-2">
              {monthRows.map((row) => {
                const card = buildTimelineCardState(row);

                return (
                    <article
                      key={row.id || `${row.event_name}-${row.start_time}`}
                      className="app-card-strong relative grid gap-4 p-4 md:grid-cols-[4rem_7.5rem_1fr] md:items-center md:p-5"
                    >
                    <div className="absolute right-5 top-5 md:right-6 md:top-6">
                      <span className="inline-flex rounded-full border border-[var(--border)] bg-[var(--surface-hover)] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--accent)]">
                        {card.eventType}
                      </span>
                    </div>
                    <DateRail value={row.start_time} />
                    <div className="app-card-strong aspect-[4/3] w-full overflow-hidden">
                      {row.event_image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={row.event_image_url} alt={row.event_name || "Event banner"} className="h-full w-full object-cover" />
                      ) : (
                        <MediaPlaceholder />
                      )}
                    </div>
                    <div className="min-w-0 space-y-2">
                      <div className="min-w-0 pr-20 md:pr-24">
                        <div className="min-w-0">
                          <h2 className="truncate text-xl font-bold tracking-[-0.04em] text-[var(--foreground)] md:text-2xl">{row.event_name || "Untitled event"}</h2>
                          <p className="mt-1 truncate text-sm text-[var(--muted-strong)] md:text-[0.95rem]">
                            {formatEventTime(row.start_time, row.end_time)} WIB
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-nowrap gap-2 overflow-hidden">
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
        <div className="app-card p-6 text-sm text-[var(--muted)]">
          No events match this filter.
        </div>
      )}
    </div>
  );
}
