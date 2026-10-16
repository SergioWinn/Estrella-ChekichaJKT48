/* Hallmark · genre: modern-minimal · macrostructure: Command Deck · design-system: design.md · designed-as-app */

import { MembersClient } from "@/components/MembersClient";
import { buildMemberArchive, buildOverviewSnapshot, loadMemberArchiveRows, loadMembers } from "@/lib/archive-data.ts";
import { getSessionContext } from "@/lib/v2-server.ts";

export const dynamic = "force-dynamic";

export default async function MembersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const [members, archiveRows, { profile }] = await Promise.all([loadMembers(), loadMemberArchiveRows(), getSessionContext()]);
  const { limitedHistoryMap, totalMap, showEventStatsMap } = buildMemberArchive(archiveRows);
  const { leaderboard } = buildOverviewSnapshot(archiveRows);
  const browserItems = members.map((member) => ({
    ...member,
    history: limitedHistoryMap[member.id] ?? [],
    totalCheki: totalMap[member.id] ?? 0,
    showEventCheki: showEventStatsMap[member.id]?.showEventCheki ?? 0,
    lastShowEventTime: showEventStatsMap[member.id]?.lastShowEventTime ?? null,
  }));

  return (
    <div className="page-wrap archive-workspace">
      <header className="archive-page-heading">
        <div>
          <h1>Members</h1>
        </div>
      </header>
      <MembersClient members={browserItems} leaderboard={leaderboard} initialQuery={q} canCopyImage={profile?.role === "admin"} />
    </div>
  );
}
