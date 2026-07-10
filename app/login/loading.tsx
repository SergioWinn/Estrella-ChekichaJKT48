export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl">
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <div className="h-4 w-28 animate-pulse rounded bg-[var(--surface-strong)]" />
          <div className="mt-4 h-8 w-48 animate-pulse rounded bg-[var(--surface-strong)]" />
          <div className="mt-3 space-y-2">
            <div className="h-4 w-full animate-pulse rounded bg-[var(--surface-strong)]" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-[var(--surface-strong)]" />
          </div>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <div className="h-7 w-24 animate-pulse rounded bg-[var(--surface-strong)]" />
          <div className="mt-5 space-y-4">
            <div className="h-12 w-full animate-pulse rounded bg-[var(--surface-strong)]" />
            <div className="h-12 w-full animate-pulse rounded bg-[var(--surface-strong)]" />
            <div className="h-12 w-full animate-pulse rounded bg-[var(--surface-strong)]" />
          </div>
        </div>
      </section>
    </div>
  );
}
