/* Hallmark - genre: modern-minimal - macrostructure: Command Deck - design-system: design.md - designed-as-app */
import Link from "next/link";
import { TimelineClient } from "@/components/TimelineClient";
import { loadTimelineRows } from "@/lib/archive-data.ts";

export const dynamic = "force-dynamic";

export default async function TimelinePage() {
  const events = await loadTimelineRows();
  return (
    <div className="page-wrap archive-workspace">
      <header className="archive-page-heading">
        <div>
          <h1>Timeline chekicha</h1>
          <p>Since January 2026</p>
        </div>
        <Link href="/members#ranking" className="archive-text-link">Most frequent members <span aria-hidden="true">&rarr;</span></Link>
      </header>
      <TimelineClient events={events} />
    </div>
  );
}
