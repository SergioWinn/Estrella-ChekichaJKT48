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
    <div className="space-y-6">
      <section className="app-shell p-5 sm:p-6">
        <SectionHeader
          label="Members"
          title="Find a member, then open their recent history."
          description="Search by nickname, full name, team, or generation. Open a card to browse the same recent archive history the Streamlit page showed."
        />
      </section>
      <MembersClient members={browserItems} />
    </div>
  );
}
