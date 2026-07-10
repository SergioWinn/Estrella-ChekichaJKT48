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
    <CollectionClient
      collectibleSlots={collectibleSlots}
      entries={entries}
      error={error}
      success={success}
      username={profile?.username || "collector"}
    />
  );
}
