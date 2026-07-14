import { TimelineClient } from "@/components/TimelineClient";
import { SectionHeader } from "@/components/SectionHeader";
import { loadTimelineRows } from "@/lib/archive-data.ts";

export const dynamic = "force-dynamic";

export default async function TimelinePage() {
  const events = await loadTimelineRows();

  return (
    <div className="page-wrap">
      <section className="page-hero">
        <div className="page-hero-grid">
          <SectionHeader
            label="Timeline"
            title="Browse every archived event in date order."
            description="Start with sessions that still have waiting slots, then move backward through completed roulette, birthday, and graduation rows."
            titleClassName="text-[clamp(2.5rem,4vw,4rem)]"
          />
          <aside className="page-rail">
            <div className="kicker">Use</div>
            <p className="mt-3 text-sm leading-7 text-[var(--foreground-soft)] sm:text-base">
              This route is the fast audit trail for unresolved rows. The filters stay light so the list itself does the work.
            </p>
          </aside>
        </div>
      </section>
      <TimelineClient events={events} />
    </div>
  );
}

