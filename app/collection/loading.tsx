export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <div className="h-4 w-24 animate-pulse rounded bg-[var(--surface-strong)]" />
        <div className="mt-3 h-7 w-64 animate-pulse rounded bg-[var(--surface-strong)]" />
        <div className="mt-2 h-5 w-72 animate-pulse rounded bg-[var(--surface-strong)]" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <div className="h-8 w-24 animate-pulse rounded bg-[var(--surface-strong)]" />
            <div className="mt-3 h-4 w-20 animate-pulse rounded bg-[var(--surface-strong)]" />
          </div>
        ))}
      </div>
    </div>
  );
}
