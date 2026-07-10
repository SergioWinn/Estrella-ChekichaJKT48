import { TimelineClient } from "@/components/TimelineClient";
import { SectionHeader } from "@/components/SectionHeader";
import { loadTimelineRows } from "@/lib/archive-data.ts";

export const dynamic = "force-dynamic";

export default async function TimelinePage() {
  const events = await loadTimelineRows();

  return (
    <div className="space-y-6">
      <section className="app-shell p-5 sm:p-6">
        <SectionHeader
          label="Timeline"
          title="Browse every event in date order."
          description="Start with cards that still have waiting slots, then scroll back through completed roulette, birthday, and graduation archive rows."
        />
      </section>
      <TimelineClient events={events} />
    </div>
  );
}
