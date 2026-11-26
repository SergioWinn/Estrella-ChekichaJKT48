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
    <div className="archive-auth">
      <section className="archive-auth-content">
        <div className="letter-intro">
          <SectionHeader
            title="Sign in"
            description="Manage your Chekicha collection."
            titleClassName="text-3xl"
            descriptionClassName="text-sm"
          />
        </div>
        <div className="auth-form-panel archive-auth-form">
          {error ? <div role="alert" className="app-status-message mb-3 rounded-lg border border-[var(--danger-border)] bg-[var(--danger-soft)] p-3 text-sm text-[var(--danger-foreground)]">{error}</div> : null}
          <form action={loginAction} className="space-y-3">
            <label className="block space-y-2"><span className="text-sm font-semibold text-[var(--muted-strong)]">Username</span><input name="username" required autoCapitalize="none" spellCheck={false} autoComplete="username" className="app-input min-h-11 w-full px-4 py-3 placeholder:text-[var(--muted)]" /></label>
            <label className="block space-y-2"><span className="text-sm font-semibold text-[var(--muted-strong)]">Password</span><input name="password" required type="password" autoComplete="current-password" className="app-input min-h-11 w-full px-4 py-3 placeholder:text-[var(--muted)]" /></label>
            <PendingSubmitButton pendingLabel="Signing in…" className="min-h-11 w-full rounded-lg bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-[var(--accent-foreground)] hover:bg-[var(--accent-strong)]">Sign in</PendingSubmitButton>
          </form>
          <p className="mt-4 text-sm text-[var(--muted)]">
            Need an account?{" "}
            <Link href="/signup" className="font-semibold text-[var(--accent)] transition-colors hover:text-[var(--accent-strong)]">
              Create an account
            </Link>
          </p>
        </div>
        <Link href="/" className="archive-secondary-action">Back to Timeline</Link>
      </section>
    </div>
  );
}

