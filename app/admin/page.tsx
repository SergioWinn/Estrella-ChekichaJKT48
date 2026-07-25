/* Hallmark · genre: modern-minimal · macrostructure: Workbench · design-system: design.md · designed-as-app */

import { SectionHeader } from "@/components/SectionHeader";
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
    <div className="page-wrap">
      <header className="workbench-intro">
        <SectionHeader
          title="Run archive operations from one restricted workspace."
          description="Queue work, event maintenance, and member upkeep stay inside one admin route, with the highest-priority tasks surfaced first."
          titleClassName="text-[clamp(2.5rem,4vw,4rem)]"
        />
        <aside className="workbench-note">
          <h2 className="text-sm font-semibold text-[var(--foreground)]">Admin workflow</h2>
          <p className="mt-3 text-sm leading-7 text-[var(--foreground-soft)] sm:text-base">
            This route is operational, not promotional. The priority is queue resolution, then event and roster maintenance.
          </p>
        </aside>
      </header>
      <AdminWorkspace
        error={error}
        events={events}
        members={members}
        pendingCount={countPendingSlots(events)}
        presets={presets}
        success={success}
      />
    </div>
  );
}
