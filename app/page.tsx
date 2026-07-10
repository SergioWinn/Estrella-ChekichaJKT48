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
    <article className="app-card p-5">
      <div className={`text-4xl font-extrabold tracking-[-0.03em] ${tone}`}>{value}</div>
      <p className="mt-1 text-sm font-semibold text-[var(--muted-strong)]">{label}</p>
      <p className="mt-1 text-sm text-[var(--muted)]">{copy}</p>
    </article>
  );
}

export default async function Page() {
  const rows = await loadOverviewRows();
  const snapshot = buildOverviewSnapshot(rows);
  const copy = buildHomepageCopy(snapshot);

  return (
    <div className="space-y-6">
      <section className="space-y-6">
        <div className="grid gap-px overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--border)] md:grid-cols-2 xl:grid-cols-4">
          <div className="bg-[var(--surface)] p-5">
            <div className="text-4xl font-extrabold tracking-[-0.03em] text-[var(--foreground)]">{snapshot.show_event_sessions}</div>
            <p className="mt-1 text-sm font-semibold text-[var(--muted-strong)]">Show / Event sessions</p>
            <p className="mt-1 text-sm text-[var(--muted)]">Archive rows that feed the homepage ranking.</p>
          </div>
          <div className="bg-[var(--surface)] p-5">
            <div className="text-3xl font-extrabold tracking-[-0.03em] text-[var(--foreground)]">{copy.latestShowEventCopy}</div>
            <p className="mt-1 text-sm font-semibold text-[var(--muted-strong)]">Latest show / event</p>
            <p className="mt-1 text-sm text-[var(--muted)]">Most recent show/event date saved in the archive.</p>
          </div>
          <div className="bg-[var(--surface)] p-5">
            <div className="text-4xl font-extrabold tracking-[-0.03em] text-[var(--foreground)]">{copy.topMemberName}</div>
            <p className="mt-1 text-sm font-semibold text-[var(--muted-strong)]">Top ranked member</p>
            <p className="mt-1 text-sm text-[var(--muted)]">{copy.topMemberSubcopy}</p>
          </div>
          <div className="bg-[var(--surface)] p-5">
            <div className="text-4xl font-extrabold tracking-[-0.03em] text-[var(--accent)]">{copy.waitingCopy}</div>
            <p className="mt-1 text-sm font-semibold text-[var(--muted-strong)]">Open draws</p>
            <p className="mt-1 text-sm text-[var(--muted)]">Still tracked here, but no longer the main story.</p>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.7fr_0.75fr]">
          <div className="app-shell p-6 sm:p-8">
            <SectionHeader
              label="JKT48 cheki tracker"
              title="See who shows up most in show/event cheki."
              description="This homepage now starts from archive patterns: a full ranking, the latest six assigned members, and a quick count of special-event sessions."
              titleClassName="max-w-3xl text-4xl sm:text-5xl"
              descriptionClassName="max-w-3xl text-base leading-8"
            />
          </div>
          <div className="app-shell p-6">
            <div className="text-sm font-semibold text-[var(--accent)]">Scope</div>
            <p className="mt-4 text-lg leading-8 text-[var(--foreground-soft)]">
              Birthday and Graduation stay in the counts below, but the main ranking and recent list only read from show/event archive rows.
            </p>
          </div>
        </div>
      </section>

      <MatchedHeightColumns
        left={
          <article className="app-card flex h-full min-h-0 flex-col overflow-hidden p-5">
            <SectionHeader
              label="Show / event ranking"
              title="Members who appear most often"
              titleClassName="text-2xl sm:text-2xl"
              description="Only members with 2+ appearances are shown. Ties keep the same rank number and are ordered by the latest show/event assignment."
            />
            <div className="mt-5 min-h-0 flex-1 grid gap-3 overflow-y-auto pr-2">
              {snapshot.leaderboard.length ? (
                snapshot.leaderboard.map((row) => (
                  <div key={row.member_id} className="app-card-strong flex items-center gap-4 p-4">
                    <div className="text-2xl font-extrabold text-[var(--accent)]">#{row.rank}</div>
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
                      <div className="text-2xl font-extrabold text-[var(--foreground)]">{row.count}</div>
                      <div className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">times</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="app-card-strong p-4 text-sm text-[var(--muted)]">
                  No members with 2+ show/event appearances yet.
                </div>
              )}
            </div>
          </article>
        }
        right={
          <article className="app-card flex flex-col p-5">
            <SectionHeader
              label="Recent 6"
              title="Latest six assigned show/event members"
              titleClassName="text-2xl sm:text-2xl"
              description="Both slots from the same event can appear if both were filled."
            />
            <div className="mt-5 space-y-3">
              {snapshot.recent_assignments.length ? (
                snapshot.recent_assignments.map((row, index) => (
                  <div key={`${row.member_id}-${row.start_time}-${index}`} className="app-card-strong p-4">
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
                <div className="app-card-strong p-4 text-sm text-[var(--muted)]">
                  Recent show/event assignments will appear here.
                </div>
              )}
            </div>
          </article>
        }
      />

      <section className="app-card p-5 sm:p-6">
        <SectionHeader
          label="Quick counts"
          title="How the archive is split right now"
          titleClassName="text-2xl sm:text-2xl"
          description="Small numbers only, no extra chart noise."
        />
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <QuickCountCard label={copy.quickCounts[0]!.label} value={copy.quickCounts[0]!.value} copy={copy.quickCounts[0]!.copy} tone="text-[var(--accent)]" />
          <QuickCountCard label={copy.quickCounts[1]!.label} value={copy.quickCounts[1]!.value} copy={copy.quickCounts[1]!.copy} tone="text-[var(--warning)]" />
          <QuickCountCard label={copy.quickCounts[2]!.label} value={copy.quickCounts[2]!.value} copy={copy.quickCounts[2]!.copy} tone="text-[var(--muted-strong)]" />
          <QuickCountCard label={copy.quickCounts[3]!.label} value={copy.quickCounts[3]!.value} copy={copy.quickCounts[3]!.copy} tone="text-[var(--accent-strong)]" />
        </div>
      </section>

      <section className="app-card p-5 sm:p-6">
        <SectionHeader
          label="Pending status"
          title="Open draws still in the archive"
          titleClassName="text-2xl sm:text-2xl"
          description="Operational detail kept here as a secondary check."
        />
        <p className="mt-4 text-lg leading-8 text-[var(--foreground-soft)]">
          {copy.waitingCopy}. Use the admin or timeline pages when you want to resolve unfinished rows.
        </p>
      </section>
    </div>
  );
}
