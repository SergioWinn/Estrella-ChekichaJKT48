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
    <div className="mx-auto max-w-5xl page-wrap">
      <section className="grid gap-8 py-5 sm:py-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
        <div className="letter-intro">
          <SectionHeader
            title="Start your cheki collection."
            description="Create an account to save the cheki you own and keep track of your copies."
            titleClassName="text-[clamp(2.2rem,4vw,3.7rem)]"
            descriptionClassName="text-sm leading-7 sm:text-base"
          />
          <aside className="workbench-note">
            <div className="kicker">Your sign-in details</div>
            <p className="mt-3 text-sm leading-7 text-[var(--foreground-soft)] sm:text-base">
              Choose a username you can remember. You will use it to sign in.
            </p>
          </aside>
        </div>
        <div className="auth-form-panel p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">Create account</h2>
          {error ? <div role="alert" className="app-status-message mt-4 rounded-lg border border-[var(--danger-border)] bg-[var(--danger-soft)] p-3 text-sm text-[var(--danger-foreground)]">{error}</div> : null}
          <form action={signupAction} className="mt-5 space-y-4">
            <label className="block space-y-2"><span className="text-sm font-semibold text-[var(--muted-strong)]">Username</span><input name="username" autoComplete="username" aria-describedby="username-hint" className="app-input min-h-11 w-full px-4 py-3 placeholder:text-[var(--muted)]" /></label>
            <p id="username-hint" className="text-sm text-[var(--muted)]">Use letters and numbers. Dots, underscores, and hyphens are allowed between them.</p>
            <label className="block space-y-2"><span className="text-sm font-semibold text-[var(--muted-strong)]">Password</span><input name="password" type="password" autoComplete="new-password" aria-describedby="password-hint" className="app-input min-h-11 w-full px-4 py-3 placeholder:text-[var(--muted)]" /></label>
            <p id="password-hint" className="text-sm text-[var(--muted)]">Use at least 8 characters.</p>
            <label className="block space-y-2"><span className="text-sm font-semibold text-[var(--muted-strong)]">Confirm password</span><input name="confirmPassword" type="password" autoComplete="new-password" className="app-input min-h-11 w-full px-4 py-3 placeholder:text-[var(--muted)]" /></label>
            <PendingSubmitButton pendingLabel="Creating account…" className="min-h-11 w-full rounded-lg bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-[var(--accent-foreground)] hover:bg-[var(--accent-strong)]">Create account</PendingSubmitButton>
          </form>
          <p className="mt-4 text-sm text-[var(--muted)]">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-[var(--accent)] transition-colors hover:text-[var(--accent-strong)]">
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}

