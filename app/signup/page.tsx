import Link from "next/link";

/* Hallmark · genre: modern-minimal · macrostructure: Quiet Letter · design-system: design.md · designed-as-content */

import { SectionHeader } from "@/components/SectionHeader";
import { PendingSubmitButton } from "@/components/PendingSubmitButton";
import { signupAction } from "@/lib/v2-actions.ts";

export const dynamic = "force-dynamic";

export default async function SignupPage({
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
            title="Create account"
            description="Save your Chekicha collection."
            titleClassName="text-3xl"
            descriptionClassName="text-sm"
          />
        </div>
        <div className="auth-form-panel archive-auth-form">
          {error ? <div role="alert" className="app-status-message mb-3 rounded-lg border border-[var(--danger-border)] bg-[var(--danger-soft)] p-3 text-sm text-[var(--danger-foreground)]">{error}</div> : null}
          <form action={signupAction} className="space-y-3">
            <div className="space-y-2">
              <label className="block space-y-2"><span className="text-sm font-semibold text-[var(--muted-strong)]">Username</span><input name="username" required autoCapitalize="none" spellCheck={false} autoComplete="username" aria-describedby="username-hint" className="app-input min-h-11 w-full px-4 py-3 placeholder:text-[var(--muted)]" /></label>
              <p id="username-hint" className="text-sm text-[var(--muted)]">Use letters and numbers. Dots, underscores, and hyphens are allowed between them.</p>
            </div>
            <div className="space-y-2">
              <label className="block space-y-2"><span className="text-sm font-semibold text-[var(--muted-strong)]">Password</span><input name="password" required minLength={8} type="password" autoComplete="new-password" aria-describedby="password-hint" className="app-input min-h-11 w-full px-4 py-3 placeholder:text-[var(--muted)]" /></label>
              <p id="password-hint" className="text-sm text-[var(--muted)]">Use at least 8 characters.</p>
            </div>
            <label className="block space-y-2"><span className="text-sm font-semibold text-[var(--muted-strong)]">Confirm password</span><input name="confirmPassword" required minLength={8} type="password" autoComplete="new-password" className="app-input min-h-11 w-full px-4 py-3 placeholder:text-[var(--muted)]" /></label>
            <PendingSubmitButton pendingLabel="Creating account…" className="min-h-11 w-full rounded-lg bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-[var(--accent-foreground)] hover:bg-[var(--accent-strong)]">Create account</PendingSubmitButton>
          </form>
          <p className="mt-4 text-sm text-[var(--muted)]">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-[var(--accent)] transition-colors hover:text-[var(--accent-strong)]">
              Sign in
            </Link>
          </p>
        </div>
        <Link href="/" className="archive-secondary-action">Back to Timeline</Link>
      </section>
    </div>
  );
}

