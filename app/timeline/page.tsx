import { TimelineClient } from "@/components/TimelineClient";
import { SectionHeader } from "@/components/SectionHeader";
import { loadTimelineRows } from "@/lib/archive-data.ts";

export const dynamic = "force-dynamic";

export default async function TimelinePage() {
  const events = await loadTimelineRows();

  return (
    <div className="page-wrap">
      <header className="workbench-intro">
          <SectionHeader
            title="Browse every archived event in date order."
            description="Start with sessions that still have waiting slots, then move backward through completed roulette, birthday, and graduation rows."
            titleClassName="text-[clamp(2.5rem,4vw,4rem)]"
          />
          <aside className="workbench-note">
            <h2 className="text-sm font-semibold text-[var(--foreground)]">Audit unresolved rows</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--foreground-soft)] sm:text-base">
              This route is the fast audit trail for unresolved rows. The filters stay light so the list itself does the work.
            </p>
          </aside>
      </header>
      <TimelineClient events={events} />
    </div>
  );
}

