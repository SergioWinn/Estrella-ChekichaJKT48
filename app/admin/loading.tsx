export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-11 animate-pulse rounded-lg bg-[var(--surface-strong)]" />
        ))}
      </div>
      <div className="flex items-end justify-between border-b border-[var(--border)] pb-4">
        <div>
          <div className="h-7 w-36 animate-pulse rounded bg-[var(--surface-strong)]" />
          <div className="mt-2 h-4 w-52 animate-pulse rounded bg-[var(--surface-strong)]" />
        </div>
        <div className="h-4 w-16 animate-pulse rounded bg-[var(--surface-strong)]" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5">
            <div className="h-7 w-48 animate-pulse rounded bg-[var(--surface-strong)]" />
            <div className="h-4 w-56 animate-pulse rounded bg-[var(--surface-strong)]" />
            <div className="h-12 w-full animate-pulse rounded-xl bg-[var(--surface-strong)]" />
            <div className="h-11 w-full animate-pulse rounded-lg bg-[var(--surface-strong)]" />
          </div>
        ))}
      </div>
    </div>
  );
}
