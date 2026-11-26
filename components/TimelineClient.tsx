"use client";
import { useMemo, useState } from "react";
import { EventTeamBadge } from "@/components/EventTeamBadge";
import { FilterPill } from "@/components/FilterPill";
import { MediaPlaceholder } from "@/components/MediaPlaceholder";
import { countPendingSlots, groupTimelineByMonth, memberSortName } from "@/lib/archive-data.ts";
import { formatEventTime } from "@/lib/format.ts";
import { buildTimelineCardState, countTimelineTeams, filterTimelineEvents, getRouletteSeriesOptions } from "@/lib/timeline-view.ts";
import { EVENT_TEAM_OPTIONS, getEffectiveEventTeam, STATUS_OPTIONS } from "@/lib/v2-helpers.ts";
import type { TimelineEvent } from "@/lib/types.ts";

const eventDay = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "Asia/Jakarta" });

function monthId(month: string) {
  return `month-${month.toLowerCase().replaceAll(" ", "-")}`;
}

export function TimelineClient({ events }: { events: TimelineEvent[] }) {
  const [filterType, setFilterType] = useState("All");
  const [rouletteSeries, setRouletteSeries] = useState("All");
  const [teamFilter, setTeamFilter] = useState("All");
  const [memberFilter, setMemberFilter] = useState("All");
  const [memberStatus, setMemberStatus] = useState("All");
  const [query, setQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const series = useMemo(() => getRouletteSeriesOptions(events), [events]);
  const teamCounts = useMemo(() => countTimelineTeams(filterTimelineEvents(events, filterType, rouletteSeries)), [events, filterType, rouletteSeries]);
  const teams = EVENT_TEAM_OPTIONS.filter((team) => teamCounts[team] > 0);
  const activeTeam = teams.length > 1 && teams.some((team) => team === teamFilter) ? teamFilter : "All";
  const filtered = useMemo(
    () => filterTimelineEvents(events, filterType, rouletteSeries, activeTeam, query, memberFilter, memberStatus),
    [events, filterType, rouletteSeries, activeTeam, query, memberFilter, memberStatus],
  );
  const sections = useMemo(() => groupTimelineByMonth(filtered), [filtered]);
  const members = useMemo(() => {
    const options = new Map<string, { label: string; sortName: string }>();
    for (const event of events) {
      if (event.member_id_a) options.set(event.member_id_a, { label: event.member_a?.nickname || event.member_a?.full_name || "Unknown member", sortName: memberSortName(event.member_a || {}) });
      if (event.member_id_b) options.set(event.member_id_b, { label: event.member_b?.nickname || event.member_b?.full_name || "Unknown member", sortName: memberSortName(event.member_b || {}) });
    }
    return Array.from(options.entries()).toSorted(([, left], [, right]) => left.sortName.localeCompare(right.sortName)).map(([id, member]) => [id, member.label] as const);
  }, [events]);
  const activeSeries = filterType === "Roulette" ? rouletteSeries : "All";
  const extraFilterCount = [activeSeries, activeTeam, memberFilter, memberStatus].filter((value) => value !== "All").length;
  const pending = countPendingSlots(filtered);

  function resetFilters() {
    setQuery("");
    setMemberFilter("All");
    setMemberStatus("All");
    setFilterType("All");
    setRouletteSeries("All");
    setTeamFilter("All");
  }

  return (
    <div className="timeline-workspace">
      <section className="timeline-controls" aria-label="Search and filter timeline">
        <div className="timeline-search-row">
          <input aria-label="Search events or members" type="search" className="app-input timeline-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Event or member" />
          <button type="button" className="archive-secondary-action" aria-label="Reset search and filters" onClick={resetFilters}>
            Reset
          </button>
        </div>
        <div className="timeline-types" role="group" aria-label="Event type">
          {["All", "Roulette", "Birthday", "Graduation"].map((option) => (
            <FilterPill key={option} active={filterType === option} onClick={() => setFilterType(option)}>{option}</FilterPill>
          ))}
        </div>
        <button type="button" className="timeline-filter-toggle" aria-expanded={filtersOpen} aria-controls="timeline-filter-fields" onClick={() => setFiltersOpen((open) => !open)}>
          Filters{extraFilterCount > 0 ? ` (${extraFilterCount})` : ""}
        </button>
        <div className="timeline-filter-fields" id="timeline-filter-fields" hidden={!filtersOpen}>
            <label>Member<select className="app-input" value={memberFilter} onChange={(event) => setMemberFilter(event.target.value)}><option value="All">All members</option>{members.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label>
            <label>
              Member status
              <select className="app-input" value={memberStatus} onChange={(event) => setMemberStatus(event.target.value)}>
                <option value="All">All statuses</option>
                {STATUS_OPTIONS.map((status) => <option key={status}>{status}</option>)}
              </select>
            </label>
            <label>Team<select className="app-input" value={activeTeam} disabled={teams.length <= 1} onChange={(event) => setTeamFilter(event.target.value)}><option value="All">{teams.length === 1 ? teams[0] : "All teams"}</option>{teams.length > 1 && teams.map((team) => <option key={team} value={team}>{team} ({teamCounts[team]})</option>)}</select></label>
            {filterType === "Roulette" && <label>Series<select className="app-input" value={activeSeries} onChange={(event) => setRouletteSeries(event.target.value)}><option value="All">All roulette series</option>{series.map((name) => <option key={name}>{name}</option>)}</select></label>}
        </div>
        <p className="timeline-status" aria-live="polite"><strong>{filtered.length}</strong> {filtered.length === 1 ? "event" : "events"}{pending > 0 && <> · {pending} {pending === 1 ? "slot" : "slots"} awaiting results</>}</p>
      </section>

      {sections.length > 0 ? (
        <div className="timeline-layout">
          <nav className="timeline-month-nav" aria-label="Jump to month">
            <p>Jump to month</p>
            {sections.map(([month, rows]) => <a key={month} href={`#${monthId(month)}`}><span>{month}</span><span>{rows.length}</span></a>)}
          </nav>
          <div className="timeline-results">
            {sections.map(([month, rows], sectionIndex) => (
              <section className="timeline-month" key={month} aria-labelledby={monthId(month)}>
                <h2 id={monthId(month)} tabIndex={-1}>{month}<span>{rows.length} {rows.length === 1 ? "event" : "events"}</span></h2>
                <div className="timeline-rows">
                  {rows.map((row, index) => {
                    const card = buildTimelineCardState(row);
                    const artwork = card.isSingle ? card.members[0].avatarUrl : row.event_image_url;
                    const date = new Date(row.start_time);
                    return (
                      <article key={row.id || row.event_name + row.start_time} className="timeline-row">
                        <div className="timeline-art">
                          {artwork ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={artwork} alt="" loading={sectionIndex === 0 && index < 4 ? "eager" : "lazy"} decoding="async" />
                          ) : <MediaPlaceholder className="timeline-art-placeholder" />}
                        </div>
                        <div className="timeline-event">
                          <div className="timeline-event-meta">
                            <time dateTime={row.start_time}>{Number.isNaN(date.getTime()) ? "Date unavailable" : eventDay.format(date)}</time>
                            <span>{formatEventTime(row.start_time, row.end_time)} WIB</span>
                          </div>
                          <h3>{row.event_name || "Untitled event"}</h3>
                          {(!card.isSingle || row.event_name !== card.eventType) && (
                            <div className="timeline-badges">
                              <span>{card.eventType}</span>
                              <EventTeamBadge team={getEffectiveEventTeam(row.event_name, row.event_type, row.event_team)} eventType={row.event_type} compact />
                            </div>
                          )}
                        </div>
                        <ul className="timeline-slots" aria-label={card.isSingle ? "Member" : "Roulette results"}>
                          {card.members.map((member, memberIndex) => (
                            <li className="timeline-slot" data-waiting={member.waiting || undefined} key={memberIndex}>
                              {!card.isSingle && (
                                <span className="timeline-slot-photo" aria-hidden="true">
                                  {member.avatarUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={member.avatarUrl} alt="" loading="lazy" decoding="async" />
                                  ) : member.waiting ? "–" : member.name.slice(0, 1)}
                                </span>
                              )}
                              <span className="timeline-slot-text">
                                <span>{card.isSingle ? "Member" : `Slot ${memberIndex === 0 ? "A" : "B"}`}</span>
                                <strong>{member.waiting && !card.isSingle ? "Awaiting result" : member.name}</strong>
                              </span>
                            </li>
                          ))}
                        </ul>
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </div>
      ) : (
        <p className="archive-empty">{events.length ? "No events match these filters. Try another search or reset the filters." : "No events have been archived yet."}</p>
      )}
    </div>
  );
}
