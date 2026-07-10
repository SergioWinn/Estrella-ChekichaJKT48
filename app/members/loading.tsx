export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <div className="h-4 w-24 animate-pulse rounded bg-[var(--surface-strong)]" />
        <div className="mt-3 h-7 w-64 animate-pulse rounded bg-[var(--surface-strong)]" />
        <div className="mt-2 h-5 w-80 animate-pulse rounded bg-[var(--surface-strong)]" />
      </div>
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="h-16 animate-pulse rounded bg-[var(--surface-strong)]" />
          <div className="h-16 animate-pulse rounded bg-[var(--surface-strong)]" />
          <div className="h-16 animate-pulse rounded bg-[var(--surface-strong)]" />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <div className="flex items-center gap-4">
              <div className="size-16 animate-pulse rounded-full bg-[var(--surface-strong)]" />
              <div className="flex-1 space-y-2">
                <div className="h-5 w-20 animate-pulse rounded bg-[var(--surface-strong)]" />
                <div className="h-4 w-16 animate-pulse rounded bg-[var(--surface-strong)]" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
