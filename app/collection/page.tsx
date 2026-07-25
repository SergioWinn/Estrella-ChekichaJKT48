/* Hallmark · genre: modern-minimal · macrostructure: Workbench · design-system: design.md · designed-as-app */

import { SectionHeader } from "@/components/SectionHeader";
import { CollectionClient } from "@/components/CollectionClient.tsx";
import { loadCollectionEntriesForUser, loadCollectibleSlotsForUser, requireUser } from "@/lib/v2-server.ts";

export const dynamic = "force-dynamic";

export default async function CollectionPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const success = typeof params.success === "string" ? params.success : "";
  const error = typeof params.error === "string" ? params.error : "";
  const { supabase, user, profile } = await requireUser();
  const [collectibleSlots, entries] = await Promise.all([
    loadCollectibleSlotsForUser(supabase),
    loadCollectionEntriesForUser(supabase, user.id),
  ]);

  return (
    <div className="page-wrap">
      <header className="workbench-intro">
        <SectionHeader
          title="Manage your saved cheki without leaving the archive."
          description="Review what is already on your shelf, then open the desk only when you need to add or correct a saved slot."
          titleClassName="text-[clamp(2.5rem,4vw,4rem)]"
        />
        <aside className="workbench-note">
          <h2 className="text-sm font-semibold text-[var(--foreground)]">Collector workflow</h2>
          <p className="mt-3 text-sm leading-7 text-[var(--foreground-soft)] sm:text-base">
            The shelf stays scan-first. Add and manage actions stay inside the desk so the archive grid remains the primary surface.
          </p>
        </aside>
      </header>
      <CollectionClient
        collectibleSlots={collectibleSlots}
        entries={entries}
        error={error}
        success={success}
        username={profile?.username || "collector"}
      />
    </div>
  );
}
