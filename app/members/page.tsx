/* Hallmark · genre: modern-minimal · macrostructure: Command Deck · design-system: design.md · designed-as-app */

import { MembersClient } from "@/components/MembersClient";
import { buildMemberArchive, buildOverviewSnapshot, loadMemberArchiveRows, loadMembers } from "@/lib/archive-data.ts";

export const dynamic = "force-dynamic";

export default async function MembersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const [members, archiveRows] = await Promise.all([loadMembers(), loadMemberArchiveRows()]);
  const { limitedHistoryMap, totalMap } = buildMemberArchive(archiveRows);
  const { leaderboard } = buildOverviewSnapshot(archiveRows);
  const browserItems = members.map((member) => ({
    ...member,
    history: limitedHistoryMap[member.id] ?? [],
    totalCheki: totalMap[member.id] ?? 0,
  }));

  return (
    <div className="page-wrap archive-workspace">
      <header className="archive-page-heading">
        <div>
          <p className="kicker">Members & statistics</p>
          <h1>Who appears most often?</h1>
          <p>Compare cheki frequency, then open a member to see their event history.</p>
        </div>
      </header>
      <MembersClient members={browserItems} leaderboard={leaderboard} initialQuery={q} />
    </div>
  );
}
