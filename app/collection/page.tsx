/* Hallmark · genre: modern-minimal · macrostructure: Command Deck · design-system: design.md · designed-as-app */

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
    <div className="page-wrap archive-workspace">
      <header className="archive-page-heading">
        <div>
          <p className="kicker">Your personal archive</p>
          <h1>My collection</h1>
          <p>Keep track of your chekicha and add the ones you own.</p>
        </div>
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
