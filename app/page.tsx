/* Hallmark · genre: modern-minimal · macrostructure: Stat-Led · design-system: design.md · designed-as-app */

import type { CSSProperties } from "react";
import { EventTeamBadge } from "@/components/EventTeamBadge";
import { buildOverviewSnapshot, loadOverviewRows } from "@/lib/archive-data.ts";
import { formatEventDate } from "@/lib/format.ts";
import { buildHomepageCopy } from "@/lib/homepage-copy.ts";
import { MatchedHeightColumns } from "@/components/MatchedHeightColumns";
import { SectionHeader } from "@/components/SectionHeader";
import { EVENT_TEAM_OPTIONS } from "@/lib/v2-helpers.ts";

export const dynamic = "force-dynamic";

function QuickCountCard({
  label,
  value,
  copy,
  tone = "text-[var(--foreground)]",
}: {
  copy: string;
  label: string;
  tone?: string;
  value: string | number;
}) {
  return (
    <article className="motion-card data-band">
      <div className={`tabular-nums text-4xl font-medium tracking-[-0.05em] ${tone}`}>{value}</div>
      <p className="mt-2 text-sm font-semibold text-[var(--muted-strong)]">{label}</p>
      <p className="mt-2 text-sm text-[var(--muted)]">{copy}</p>
    </article>
  );
}

function buildStaggerStyle(index: number): CSSProperties {
  return { "--i": Math.min(index, 5) } as CSSProperties;
}

export default async function Page() {
  const rows = await loadOverviewRows();
  const snapshot = buildOverviewSnapshot(rows);
  const copy = buildHomepageCopy(snapshot);
  const visibleLeaderboard = snapshot.leaderboard.slice(0, 5);
  const visibleRecentAssignments = snapshot.recent_assignments.slice(0, 5);

  return (
    <div className="page-wrap">
      <section className="motion-section page-hero">
        <div className="page-hero-grid">
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="kicker">Estrella archive desk</div>
              <div className="site-meta-strip flex flex-wrap items-center gap-2.5 text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--muted-strong)]">
                <span>Archive monitor</span>
                <span className="hidden h-1 w-1 rounded-full bg-[var(--border-strong)] sm:block" />
                <span>Since January 2026</span>
                <span className="hidden h-1 w-1 rounded-full bg-[var(--border-strong)] sm:block" />
                <span>JKT48 cheki records</span>
              </div>
            </div>
            <SectionHeader
              title="Chekicha Archive Monitor"
              description="Track resolved sessions, member appearances, and collector records from January 2026 onward."
              titleClassName="max-w-4xl text-[clamp(2.6rem,5vw,4.8rem)]"
              descriptionClassName="max-w-3xl text-base leading-8"
            />
            <div className="stat-ribbon">
              <div className="stat-ribbon-item">
                <div className="tabular-nums text-2xl font-medium tracking-[-0.04em] text-[var(--foreground)]">{snapshot.show_event_sessions}</div>
                <p className="mt-1 text-sm text-[var(--muted-strong)]">Show and event sessions</p>
              </div>
              <div className="stat-ribbon-item">
                <div className="tabular-nums text-2xl font-medium tracking-[-0.04em] text-[var(--foreground)]">{copy.latestShowEventCopy}</div>
                <p className="mt-1 text-sm text-[var(--muted-strong)]">Latest session</p>
              </div>
              <div className="stat-ribbon-item">
                <div className="text-2xl font-medium tracking-[-0.04em] text-[var(--foreground)]">{copy.topMemberName}</div>
                <p className="mt-1 text-sm text-[var(--muted-strong)]">Top member</p>
              </div>
              <div className="stat-ribbon-item">
                <div className="tabular-nums text-2xl font-medium tracking-[-0.04em] text-[var(--accent)]">{copy.waitingCopy}</div>
                <p className="mt-1 text-sm text-[var(--muted-strong)]">Open draws</p>
              </div>
            </div>
          </div>
          <aside className="page-rail">
            <div className="kicker">System</div>
            <p className="mt-3 text-sm leading-7 text-[var(--foreground-soft)] sm:text-base">
              Overview, audit timeline, member browser, collector shelf, and admin workspace in one archive shell.
            </p>
          </aside>
        </div>
      </section>

      <MatchedHeightColumns
        left={
          <article className="motion-section app-shell flex h-full min-h-0 flex-col p-5">
            <SectionHeader
              label="Leaderboard"
              title="Members who appear most often"
              titleClassName="text-2xl sm:text-3xl"
              description="Showing the top 5 members with two or more appearances. Ties keep the same rank number and follow the latest show or event assignment."
            />
            <div className="mt-5 grid gap-3">
              {visibleLeaderboard.length ? (
                visibleLeaderboard.map((row) => (
                  <div key={row.member_id} className="motion-list-item flex items-center justify-between gap-3 border-t border-[var(--border)] py-4" style={buildStaggerStyle(row.rank - 1)}>
                    <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                      <div className="min-w-12 text-xl font-semibold text-[var(--accent)]">#{row.rank}</div>
                      <div className="flex size-12 items-center justify-center overflow-hidden rounded-full border border-[var(--border)] bg-[var(--surface-hover)] sm:size-14">
                      {row.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={row.avatar_url} alt={row.nickname} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-lg font-bold text-[var(--foreground)]">{row.nickname.slice(0, 1).toUpperCase()}</span>
                      )}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-lg font-semibold text-[var(--foreground)]">{row.nickname}</div>
                        <div className="truncate text-sm text-[var(--muted)]">{row.generasi ? `Gen ${row.generasi}` : "Generation unknown"}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="tabular-nums text-2xl font-semibold text-[var(--foreground)]">{row.count}</div>
                      <div className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">times</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="border-t border-[var(--border)] py-4 text-sm text-[var(--muted)]">No members with 2+ show/event appearances yet.</div>
              )}
            </div>
          </article>
        }
        right={
          <div>
            <article className="motion-section app-shell flex h-full min-h-0 flex-col p-5">
              <SectionHeader
                label="Recent"
                title="Latest assigned members"
                titleClassName="text-2xl sm:text-3xl"
                description="Showing the latest 5 filled assignments. Both slots from the same event can appear if both were filled."
              />
              <div className="mt-5 grid gap-3">
                {visibleRecentAssignments.length ? (
                  visibleRecentAssignments.map((row, index) => (
                    <div key={`${row.member_id}-${row.start_time}-${index}`} className="motion-list-item flex items-center justify-between gap-3 border-t border-[var(--border)] py-4" style={buildStaggerStyle(index)}>
                      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                        <div className="flex size-12 items-center justify-center overflow-hidden rounded-full border border-[var(--border)] bg-[var(--surface-hover)] sm:size-14">
                            {row.avatar_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={row.avatar_url} alt={row.nickname} className="h-full w-full object-cover" />
                            ) : (
                              <span className="text-base font-bold text-[var(--foreground)]">{row.nickname.slice(0, 1).toUpperCase()}</span>
                            )}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-lg font-semibold text-[var(--foreground)]">{row.nickname}</div>
                          <div className="truncate text-sm text-[var(--muted)]">{row.event_name}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="tabular-nums text-base font-semibold text-[var(--foreground)] sm:text-lg">{formatEventDate(row.start_dt)}</div>
                        <div className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">date</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="border-t border-[var(--border)] py-4 text-sm text-[var(--muted)]">Recent show and event assignments will appear here.</div>
                )}
              </div>
            </article>
          </div>
        }
      />

      <section className="motion-section app-shell p-5 sm:p-6">
        <SectionHeader
          label="Breakdown"
          title="How the archive is divided right now"
          titleClassName="text-2xl sm:text-3xl"
          description="Small numbers only. No extra chart noise."
        />
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <QuickCountCard label={copy.quickCounts[0]!.label} value={copy.quickCounts[0]!.value} copy={copy.quickCounts[0]!.copy} tone="text-[var(--accent)]" />
          <QuickCountCard label={copy.quickCounts[1]!.label} value={copy.quickCounts[1]!.value} copy={copy.quickCounts[1]!.copy} tone="text-[var(--warning)]" />
          <QuickCountCard label={copy.quickCounts[2]!.label} value={copy.quickCounts[2]!.value} copy={copy.quickCounts[2]!.copy} tone="text-[var(--muted-strong)]" />
          <QuickCountCard label={copy.quickCounts[3]!.label} value={copy.quickCounts[3]!.value} copy={copy.quickCounts[3]!.copy} tone="text-[var(--accent-strong)]" />
        </div>
      </section>
      <section className="motion-section app-shell p-5 sm:p-6">
        <SectionHeader
          label="Teams"
          title="Performing team split"
          titleClassName="text-2xl sm:text-3xl"
          description="Show/event rows only. Birthday and graduation stay outside team counts."
        />
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {EVENT_TEAM_OPTIONS.map((team) => (
            <article key={team} className="motion-card flex min-h-32 flex-col justify-between rounded-[8px] border border-[var(--border)] bg-[var(--surface)] p-4">
              <div>
                <div className="tabular-nums text-4xl font-medium leading-none tracking-[-0.05em] text-[var(--foreground)]">{snapshot.team_counts[team] || 0}</div>
                <div className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">sessions</div>
              </div>
              <div className="mt-5 flex justify-start">
                <EventTeamBadge team={team} eventType="Roulette" compact />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="motion-section app-shell p-5 sm:p-6">
        <SectionHeader
          label="Attention"
          title="Open draws still waiting in the archive"
          titleClassName="text-2xl sm:text-3xl"
          description="Operational detail stays visible, but secondary."
        />
        <p className="mt-4 max-w-3xl text-lg leading-8 text-[var(--foreground-soft)]">
          {copy.waitingCopy}. Use the admin or timeline pages when you want to resolve unfinished rows.
        </p>
      </section>
    </div>
  );
}

