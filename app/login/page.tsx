import Link from "next/link";

import { SectionHeader } from "@/components/SectionHeader";
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
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="page-hero">
          <SectionHeader
            label="Collector access"
            title="Reopen your cheki shelf."
            description="Sign in with the same username-first flow as before. Admins route into the control workspace, collectors into their own shelf."
            titleClassName="text-[clamp(2.2rem,4vw,3.7rem)]"
            descriptionClassName="text-sm leading-7 sm:text-base"
          />
        </div>
        <div className="app-shell p-6 sm:p-8">
          <div className="kicker">Sign in</div>
          {error ? <div className="mt-4 rounded-lg border border-[var(--danger-border)] bg-[var(--danger-soft)] p-3 text-sm text-[var(--danger-foreground)]">{error}</div> : null}
          <form action={loginAction} className="mt-5 space-y-4">
            <input name="username" placeholder="username" className="app-input min-h-11 w-full px-4 py-3 outline-none placeholder:text-[var(--muted)]" />
            <input name="password" type="password" placeholder="password" className="app-input min-h-11 w-full px-4 py-3 outline-none placeholder:text-[var(--muted)]" />
            <button className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-[var(--accent-foreground)] transition hover:bg-[var(--accent-strong)]">
              Sign in
            </button>
          </form>
          <p className="mt-4 text-sm text-[var(--muted)]">
            Need an account?{" "}
            <Link href="/signup" className="font-semibold text-[var(--accent)] transition hover:text-[var(--accent-strong)]">
              Create one here
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
