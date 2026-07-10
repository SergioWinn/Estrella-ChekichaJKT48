import { AdminWorkspace } from "@/components/AdminWorkspace.tsx";
import { countPendingSlots } from "@/lib/archive-data.ts";
import { loadAdminEventRows, loadAdminMembers, loadEventPresets, requireAdmin } from "@/lib/v2-server.ts";

export const dynamic = "force-dynamic";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const success = typeof params.success === "string" ? params.success : "";
  const error = typeof params.error === "string" ? params.error : "";
  const { supabase } = await requireAdmin();
  const [members, presets, events] = await Promise.all([
    loadAdminMembers(supabase),
    loadEventPresets(supabase),
    loadAdminEventRows(supabase),
  ]);

  return (
    <AdminWorkspace
      error={error}
      events={events}
      members={members}
      pendingCount={countPendingSlots(events)}
      presets={presets}
      success={success}
    />
  );
}
