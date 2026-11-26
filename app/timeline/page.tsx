/* Hallmark - genre: modern-minimal - macrostructure: Command Deck - design-system: design.md - designed-as-app */
import { TimelineClient } from "@/components/TimelineClient";
import { loadTimelineRows } from "@/lib/archive-data.ts";

export const dynamic = "force-dynamic";

export default async function TimelinePage() {
  const events = await loadTimelineRows();
  return (
    <div className="page-wrap archive-workspace">
      <header className="archive-page-heading">
        <div>
          <h1>Chekicha! timeline</h1>
          <p className="archive-era-line"><span><strong className="archive-fight">JKT48 FIGHT!</strong></span><span>Since January 2026</span></p>
        </div>
      </header>
      <TimelineClient events={events} />
    </div>
  );
}
