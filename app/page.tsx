import type { CSSProperties } from "react";
import { buildOverviewSnapshot, loadOverviewRows } from "@/lib/archive-data.ts";
import { formatEventDate } from "@/lib/format.ts";
import { buildHomepageCopy } from "@/lib/homepage-copy.ts";
import { MatchedHeightColumns } from "@/components/MatchedHeightColumns";
import { SectionHeader } from "@/components/SectionHeader";

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
    <article className="border-t border-[var(--border)] pt-4">
      <div className={`text-4xl font-semibold tracking-[-0.04em] ${tone}`}>{value}</div>
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

  return (
    <div className="page-wrap">
      <section className="page-hero">
        <div className="page-hero-grid">
          <div className="space-y-6">
            <SectionHeader
              label="Archive overview"
              title="See who shows up most in show and event cheki."
              description="The front page now reads like an archive desk: one ranking, one recent assignment feed, and small operational checks instead of stacked promo cards."
              titleClassName="max-w-4xl text-[clamp(2.8rem,5vw,5rem)]"
              descriptionClassName="max-w-3xl text-base leading-8"
            />
            <div className="stat-ribbon">
              <div className="stat-ribbon-item">
                <div className="text-2xl font-semibold tracking-[-0.03em] text-[var(--foreground)]">{snapshot.show_event_sessions}</div>
                <p className="mt-1 text-sm text-[var(--muted-strong)]">Show and event sessions</p>
              </div>
              <div className="stat-ribbon-item">
                <div className="text-2xl font-semibold tracking-[-0.03em] text-[var(--foreground)]">{copy.latestShowEventCopy}</div>
                <p className="mt-1 text-sm text-[var(--muted-strong)]">Latest session</p>
              </div>
              <div className="stat-ribbon-item">
                <div className="text-2xl font-semibold tracking-[-0.03em] text-[var(--foreground)]">{copy.topMemberName}</div>
                <p className="mt-1 text-sm text-[var(--muted-strong)]">Top member</p>
              </div>
              <div className="stat-ribbon-item">
                <div className="text-2xl font-semibold tracking-[-0.03em] text-[var(--accent)]">{copy.waitingCopy}</div>
                <p className="mt-1 text-sm text-[var(--muted-strong)]">Open draws</p>
              </div>
            </div>
          </div>
          <aside className="page-rail">
            <div className="kicker">Archive rule</div>
            <p className="mt-3 text-sm leading-7 text-[var(--foreground-soft)] sm:text-base">
              Birthday and graduation rows stay in the small counts below, but the main ranking and recent list only read from show and event archive rows.
            </p>
          </aside>
        </div>
      </section>

      <MatchedHeightColumns
        left={
          <article className="app-shell flex h-[34rem] min-h-0 flex-col overflow-hidden p-5 sm:h-[38rem] xl:h-full">
            <SectionHeader
              title="Members who appear most often"
              titleClassName="text-2xl sm:text-3xl"
              description="Only members with two or more appearances are shown. Ties keep the same rank number and are ordered by the latest show or event assignment."
            />
            <div className="mt-5 grid min-h-0 flex-1 gap-3 overflow-y-auto pr-1">
              {snapshot.leaderboard.length ? (
                snapshot.leaderboard.map((row) => (
                  <div key={row.member_id} className="motion-list-item flex items-center gap-4 border-t border-[var(--border)] py-4" style={buildStaggerStyle(row.rank - 1)}>
                    <div className="min-w-12 text-xl font-semibold text-[var(--accent)]">#{row.rank}</div>
                    <div className="flex size-14 items-center justify-center overflow-hidden rounded-full border border-[var(--border)] bg-[var(--surface-hover)]">
                      {row.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={row.avatar_url} alt={row.nickname} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-lg font-bold text-[var(--foreground)]">{row.nickname.slice(0, 1).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-lg font-semibold text-[var(--foreground)]">{row.nickname}</div>
                      <div className="text-sm text-[var(--muted)]">{row.generasi ? `Gen ${row.generasi}` : "Generation unknown"}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-semibold text-[var(--foreground)]">{row.count}</div>
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
          <div className="xl:sticky xl:top-24">
            <article className="app-shell p-5">
              <SectionHeader
                title="Latest assigned members"
                titleClassName="text-2xl sm:text-3xl"
                description="Both slots from the same event can appear if both were filled."
              />
              <div className="mt-5 space-y-3">
                {snapshot.recent_assignments.length ? (
                  snapshot.recent_assignments.map((row, index) => (
                    <div key={`${row.member_id}-${row.start_time}-${index}`} className="motion-list-item border-t border-[var(--border)] py-4" style={buildStaggerStyle(index)}>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex size-12 items-center justify-center overflow-hidden rounded-full border border-[var(--border)] bg-[var(--surface-hover)]">
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
                        <div className="text-right text-sm text-[var(--muted)]">{formatEventDate(row.start_dt)}</div>
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

      <section className="app-shell p-5 sm:p-6">
        <SectionHeader
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

      <section className="app-shell p-5 sm:p-6">
        <SectionHeader
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

