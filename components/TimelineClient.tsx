"use client";
import { useMemo, useState } from "react";
import { EventTeamBadge } from "@/components/EventTeamBadge";
import { FilterPill } from "@/components/FilterPill";
import { MediaPlaceholder } from "@/components/MediaPlaceholder";
import { countPendingSlots, groupTimelineByMonth, memberSortName } from "@/lib/archive-data.ts";
import { formatEventTime } from "@/lib/format.ts";
import { buildTimelineCardState, countTimelineTeams, filterTimelineEvents, getRouletteSeriesOptions } from "@/lib/timeline-view.ts";
import { EVENT_TEAM_OPTIONS, getEffectiveEventTeam } from "@/lib/v2-helpers.ts";
import type { TimelineEvent } from "@/lib/types.ts";

export function TimelineClient({ events }: { events: TimelineEvent[] }) {
  const [filterType, setFilterType] = useState("All");
  const [rouletteSeries, setRouletteSeries] = useState("All");
  const [teamFilter, setTeamFilter] = useState("All");
  const [memberFilter, setMemberFilter] = useState("All");
  const [query, setQuery] = useState("");
  const series = useMemo(() => getRouletteSeriesOptions(events), [events]);
  const teamCounts = useMemo(() => countTimelineTeams(filterTimelineEvents(events, filterType, rouletteSeries)), [events, filterType, rouletteSeries]);
  const teams = EVENT_TEAM_OPTIONS.filter((team) => teamCounts[team] > 0);
  const activeTeam = teams.length > 1 && teams.some((team) => team === teamFilter) ? teamFilter : "All";
  const filtered = useMemo(() => filterTimelineEvents(events, filterType, rouletteSeries, activeTeam, query, memberFilter), [events, filterType, rouletteSeries, activeTeam, query, memberFilter]);
  const sections = useMemo(() => groupTimelineByMonth(filtered), [filtered]);
  const members = useMemo(() => {
    const options = new Map<string, { label: string; sortName: string }>();
    for (const event of events) {
      if (event.member_id_a) options.set(event.member_id_a, { label: event.member_a?.nickname || event.member_a?.full_name || "Unknown member", sortName: memberSortName(event.member_a || {}) });
      if (event.member_id_b) options.set(event.member_id_b, { label: event.member_b?.nickname || event.member_b?.full_name || "Unknown member", sortName: memberSortName(event.member_b || {}) });
    }
    return Array.from(options.entries()).toSorted(([, left], [, right]) => left.sortName.localeCompare(right.sortName)).map(([id, member]) => [id, member.label] as const);
  }, [events]);
  return <div className="space-y-6">
    <div className="archive-summary" aria-live="polite"><span><strong>{filtered.length}</strong> events shown</span><span><strong>{countPendingSlots(events)}</strong> unassigned slots</span></div>
    <section className="album-filters" aria-label="Filter timeline">
      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-2 text-sm">Search events<input type="search" className="app-input px-3 py-2" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search event or member" /></label>
        <label className="grid gap-2 text-sm">Member<select className="app-input px-3 py-2" value={memberFilter} onChange={(e) => setMemberFilter(e.target.value)}><option value="All">All members</option>{members.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label>
      </div>
      <div className="flex flex-wrap gap-2">{["All", "Roulette", "Birthday", "Graduation"].map((option) => <FilterPill key={option} active={filterType === option} onClick={() => setFilterType(option)}>{option}</FilterPill>)}</div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-2 text-sm">Series<select className="app-input px-3 py-2" value={filterType === "Roulette" ? rouletteSeries : "All"} disabled={filterType !== "Roulette"} onChange={(e) => setRouletteSeries(e.target.value)}><option value="All">{filterType === "Roulette" ? "All roulette series" : "Series only for roulette"}</option>{series.map((name) => <option key={name}>{name}</option>)}</select></label>
        <label className="grid gap-2 text-sm">Team<select className="app-input px-3 py-2" value={activeTeam} disabled={teams.length <= 1} onChange={(e) => setTeamFilter(e.target.value)}><option value="All">{teams.length === 1 ? teams[0] : "All teams"}</option>{teams.length > 1 && teams.map((team) => <option key={team} value={team}>{team} ({teamCounts[team]})</option>)}</select></label>
      </div>
    </section>
    {sections.length ? sections.map(([month, rows], sectionIndex) => <details key={month} open={sectionIndex === 0} className="album-month app-disclosure">
      <summary className="timeline-month-summary"><span>{month}</span><span className="album-event-count">{rows.length} {rows.length === 1 ? "event" : "events"}</span></summary>
      <div className="album-event-grid">{rows.map((row, index) => {
        const card = buildTimelineCardState(row);
        const image = card.isSingle ? card.members[0].avatarUrl : row.event_image_url;
        const date = new Date(row.start_time);
        return <article key={row.id || row.event_name + row.start_time} className={`album-event ${card.isSingle ? "album-event-special" : "album-event-show"}`}>
          <div className="album-event-art">{image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt={card.isSingle ? card.members[0].name : row.event_name || "Event artwork"} loading={sectionIndex === 0 && index < 4 ? "eager" : "lazy"} decoding="async" className={card.isSingle ? "album-portrait" : "album-show-art"} />
          ) : <MediaPlaceholder />}</div>
          <div className="album-event-info">
            <span className="album-category">{card.eventType}</span>
            <h2 className="album-event-title" title={row.event_name || "Untitled event"}><span>{row.event_name || "Untitled event"}</span></h2>
            {card.isSingle && <p className="album-special-name">{card.members[0].name}</p>}
            <div className="album-event-date"><time dateTime={row.start_time}>{Number.isNaN(date.getTime()) ? "Date unavailable" : new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "Asia/Jakarta" }).format(date)}</time><span>{formatEventTime(row.start_time, row.end_time)} WIB</span></div>
            <EventTeamBadge team={getEffectiveEventTeam(row.event_name, row.event_type, row.event_team)} eventType={row.event_type} compact />
          </div>
          {!card.isSingle && <div className={`album-participants ${card.members.length === 1 ? "album-participants-single" : ""}`}>{card.members.map((member, memberIndex) => <div className="album-participant" key={memberIndex}>
            <div className="album-participant-photo">{member.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={member.avatarUrl} alt="" loading="lazy" decoding="async" className="album-portrait" />
            ) : <span className="album-initial" aria-hidden="true">{member.waiting ? "—" : member.name.slice(0, 1)}</span>}</div>
            <div className="min-w-0"><span className="album-slot">Slot {memberIndex === 0 ? "A" : "B"}</span><p className="album-member-name">{member.waiting ? "Awaiting member" : member.name}</p></div>
          </div>)}</div>}
        </article>;
      })}</div>
    </details>) : <div className="app-card p-8 text-center"><p>No events match these filters.</p><button className="mt-4 text-[var(--accent)] underline" onClick={() => { setQuery(""); setMemberFilter("All"); setFilterType("All"); setRouletteSeries("All"); setTeamFilter("All"); }}>Reset filters</button></div>}
  </div>;
}
