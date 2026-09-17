/* Hallmark · genre: modern-minimal · macrostructure: Live Surface · design-system: design.md · designed-as-app */

import Link from "next/link";

import { EventTeamBadge } from "@/components/EventTeamBadge";
import { buildOverviewSnapshot, loadOverviewRows } from "@/lib/archive-data.ts";
import { formatEventDate } from "@/lib/format.ts";
import { buildHomepageCopy } from "@/lib/homepage-copy.ts";
import { EVENT_TEAM_OPTIONS } from "@/lib/v2-helpers.ts";

export const dynamic = "force-dynamic";

export default async function Page() {
  const snapshot = buildOverviewSnapshot(await loadOverviewRows());
  const copy = buildHomepageCopy(snapshot);
  const leaderboard = snapshot.leaderboard.slice(0, 5);
  const recent = snapshot.recent_assignments.slice(0, 5);
  const focusRows = [
    ["Show and event sessions", snapshot.show_event_sessions, "The core archive, excluding birthday and graduation records."],
    ["Birthday sessions", snapshot.birthday_sessions, "Single-member birthday records kept as their own archive lane."],
    ["Graduation sessions", snapshot.graduation_sessions, "Graduation records stay visible without changing team totals."],
    ["Assigned show and event slots", snapshot.assigned_show_event_slots, "Filled slots that power member ranking and recent activity."],
  ] as const;

  return (
    <div className="overview-scroll">
      <section className="archive-act archive-opening">
        <div className="archive-opening-backdrop" aria-hidden="true" />
        <div className="archive-opening-grid">
          <header className="archive-opening-copy">
            <p className="kicker">Live archive overview</p>
            <h1>One clear view of the JKT48 cheki archive.</h1>
            <p>Sessions, members, teams, and unfinished draws from January 2026 onward.</p>
          </header>

          <div className="archive-console" aria-label="Current archive status">
            <div className="archive-console-bar">
              <span>ESTRELLA / OVERVIEW</span>
              <span className="archive-live"><i aria-hidden="true" /> Snapshot ready</span>
            </div>
            <dl className="archive-console-ledger">
              <div><dt>Latest session</dt><dd>{copy.latestShowEventCopy}</dd></div>
              <div><dt>Most frequent member</dt><dd>{copy.topMemberName}</dd></div>
              <div><dt>Open draws</dt><dd className={snapshot.pending_slots ? "archive-warning" : undefined}>{copy.waitingCopy}</dd></div>
            </dl>
            <div className="archive-console-total">
              <span>Show and event sessions</span>
              <strong>{snapshot.show_event_sessions}</strong>
            </div>
          </div>
        </div>
      </section>

      <section id="archive-focus" className="archive-act archive-focus">
        <div className="archive-sticky-stage">
          <div className="archive-focus-heading">
            <p className="kicker">Archive composition</p>
            <h2>Every number has a lane.</h2>
            <p>Move through the snapshot without losing the whole.</p>
          </div>
          <div className="archive-focus-surface">
            <div className="archive-focus-index" aria-hidden="true">
              {focusRows.map((row, index) => <span key={row[0]}>{String(index + 1).padStart(2, "0")}</span>)}
            </div>
            <div className="archive-focus-track">
              {focusRows.map(([label, value, description], index) => (
                <article key={label} className="archive-focus-row" data-focus-index={index}>
                  <p>{label}</p><strong>{value}</strong><span>{description}</span>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="archive-act archive-people">
        <header className="archive-section-heading">
          <p className="kicker">People in the archive</p>
          <h2>Frequency on one side. Recency on the other.</h2>
        </header>
        <div className="archive-people-grid">
          <section className="archive-member-lane" aria-labelledby="frequent-members">
            <div className="archive-lane-heading"><h3 id="frequent-members">Most frequent</h3><span>2+ appearances</span></div>
            {leaderboard.length ? leaderboard.map((member) => (
              <article className="archive-person-row" key={member.member_id}>
                <span className="archive-rank">#{member.rank}</span>
                <span className="archive-avatar">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {member.avatar_url ? <img src={member.avatar_url} alt="" /> : member.nickname.slice(0, 1).toUpperCase()}
                </span>
                <span className="archive-person-name"><strong>{member.nickname}</strong><small>{member.generasi ? `Generation ${member.generasi}` : "Generation unknown"}</small></span>
                <span className="archive-person-value"><strong>{member.count}</strong><small>times</small></span>
              </article>
            )) : <p className="archive-empty">Rankings begin after a member appears at least twice.</p>}
          </section>

          <section className="archive-member-lane archive-member-lane-late" aria-labelledby="recent-members">
            <div className="archive-lane-heading"><h3 id="recent-members">Latest assigned</h3><span>Newest first</span></div>
            {recent.length ? recent.map((member, index) => (
              <article className="archive-person-row" key={`${member.member_id}-${member.start_time}-${index}`}>
                <span className="archive-avatar">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {member.avatar_url ? <img src={member.avatar_url} alt="" /> : member.nickname.slice(0, 1).toUpperCase()}
                </span>
                <span className="archive-person-name"><strong>{member.nickname}</strong><small>{member.event_name}</small></span>
                <span className="archive-person-value"><strong>{formatEventDate(member.start_dt)}</strong><small>date</small></span>
              </article>
            )) : <p className="archive-empty">Recent assignments will appear here.</p>}
          </section>
        </div>
      </section>

      <section id="team-aperture" className="archive-act archive-teams">
        <div className="archive-sticky-stage archive-team-stage">
          <header className="archive-team-heading">
            <p className="kicker">The archive aperture</p>
            <h2>Five teams. One shared record.</h2>
            <p>Birthday and graduation sessions remain outside this ledger.</p>
          </header>
          <div className="archive-team-axis" aria-hidden="true"><span /></div>
          <div className="archive-team-total" aria-label={`${snapshot.show_event_sessions} show and event sessions across all teams`}>
            <strong>{snapshot.show_event_sessions}</strong>
            <span>sessions across all teams</span>
          </div>
          <div className="archive-team-rail">
            {EVENT_TEAM_OPTIONS.map((team) => (
              <article className="archive-team-panel" key={team}>
                <div className="archive-team-count"><strong>{snapshot.team_counts[team] || 0}</strong><span>sessions</span></div>
                <EventTeamBadge team={team} eventType="Roulette" compact />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="archive-act archive-resolution">
        <div className="archive-resolution-copy">
          <p className="kicker">Continue from here</p>
          <h2>Find the member you came for.</h2>
          <p>{copy.waitingCopy}. The member browser connects each name to its recent archive history.</p>
        </div>
        <form action="/members" method="get" className="archive-search">
          <label htmlFor="overview-member-search">Member name</label>
          <div>
            <input id="overview-member-search" name="q" type="search" placeholder="Try a nickname" autoComplete="off" />
            <button type="submit">Find member</button>
          </div>
        </form>
        <Link href="/timeline" className="archive-timeline-link">Or browse the complete timeline <span aria-hidden="true">→</span></Link>
      </section>
    </div>
  );
}
