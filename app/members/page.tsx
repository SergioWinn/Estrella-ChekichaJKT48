import { MembersClient } from "@/components/MembersClient";
import { SectionHeader } from "@/components/SectionHeader";
import { buildMemberArchive, loadMemberArchiveRows, loadMembers } from "@/lib/archive-data.ts";

export const dynamic = "force-dynamic";

export default async function MembersPage() {
  const [members, archiveRows] = await Promise.all([loadMembers(), loadMemberArchiveRows()]);
  const { limitedHistoryMap, totalMap } = buildMemberArchive(archiveRows);
  const browserItems = members.map((member) => ({
    ...member,
    history: limitedHistoryMap[member.id] ?? [],
    totalCheki: totalMap[member.id] ?? 0,
  }));

  return (
    <div className="page-wrap">
      <header className="workbench-intro">
          <SectionHeader
            title="Find a member, then open their recent history."
            description="Search by nickname, full name, team, or generation. Open a card to check the same archive trail the older Streamlit view exposed."
            titleClassName="text-[clamp(2.5rem,4vw,4rem)]"
          />
          <aside className="workbench-note">
            <h2 className="text-sm font-semibold text-[var(--foreground)]">Scan before opening</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--foreground-soft)] sm:text-base">
              This route favors quick scanning first. The modal history stays secondary until a member is actually selected.
            </p>
          </aside>
      </header>
      <MembersClient members={browserItems} />
    </div>
  );
}

