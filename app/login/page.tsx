import Link from "next/link";

/* Hallmark · genre: modern-minimal · macrostructure: Quiet Letter · design-system: design.md · designed-as-content */

import { SectionHeader } from "@/components/SectionHeader";
import { PendingSubmitButton } from "@/components/PendingSubmitButton";
import { loginAction } from "@/lib/v2-actions.ts";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error : "";

  return (
    <div className="mx-auto max-w-5xl page-wrap">
      <section className="grid gap-8 py-5 sm:py-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
        <div className="letter-intro">
          <SectionHeader
            title="Reopen your cheki shelf."
            description="Sign in with the same username-first flow as before. Admins route into the control workspace, collectors into their own shelf."
            titleClassName="text-[clamp(2.2rem,4vw,3.7rem)]"
            descriptionClassName="text-sm leading-7 sm:text-base"
          />
          <aside className="workbench-note">
            <div className="kicker">Private access</div>
            <p className="mt-3 text-sm leading-7 text-[var(--foreground-soft)] sm:text-base">
              No extra onboarding, no public profile layer. This route stays narrow and direct.
            </p>
          </aside>
        </div>
        <div className="auth-form-panel p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">Sign in</h2>
          {error ? <div role="alert" className="app-status-message mt-4 rounded-lg border border-[var(--danger-border)] bg-[var(--danger-soft)] p-3 text-sm text-[var(--danger-foreground)]">{error}</div> : null}
          <form action={loginAction} className="mt-5 space-y-4">
            <label className="block space-y-2"><span className="text-sm font-semibold text-[var(--muted-strong)]">Username</span><input name="username" autoComplete="username" className="app-input min-h-11 w-full px-4 py-3 placeholder:text-[var(--muted)]" /></label>
            <label className="block space-y-2"><span className="text-sm font-semibold text-[var(--muted-strong)]">Password</span><input name="password" type="password" autoComplete="current-password" className="app-input min-h-11 w-full px-4 py-3 placeholder:text-[var(--muted)]" /></label>
            <PendingSubmitButton pendingLabel="Signing in…" className="min-h-11 w-full rounded-lg bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-[var(--accent-foreground)] hover:bg-[var(--accent-strong)]">Sign in</PendingSubmitButton>
          </form>
          <p className="mt-4 text-sm text-[var(--muted)]">
            Need an account?{" "}
            <Link href="/signup" className="font-semibold text-[var(--accent)] transition-colors hover:text-[var(--accent-strong)]">
              Create one here
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}

