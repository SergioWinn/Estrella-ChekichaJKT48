export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <div className="h-4 w-24 animate-pulse rounded bg-[var(--surface-strong)]" />
        <div className="mt-3 h-7 w-full max-w-64 animate-pulse rounded bg-[var(--surface-strong)]" />
        <div className="mt-2 h-5 w-full max-w-96 animate-pulse rounded bg-[var(--surface-strong)]" />
      </div>
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded bg-[var(--surface-strong)]" />
          ))}
        </div>
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
            <div className="mb-5 h-5 w-32 animate-pulse rounded bg-[var(--surface-strong)]" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              {Array.from({ length: 2 }).map((_, j) => (
                <div key={j} className="grid min-w-0 gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface-strong)] p-4 xl:grid-cols-[4.5rem_minmax(0,1fr)_8rem]">
                  <div className="h-16 w-14 animate-pulse rounded bg-[var(--surface-hover)]" />
                  <div className="min-w-0 space-y-2">
                    <div className="h-6 w-full max-w-40 animate-pulse rounded bg-[var(--surface-hover)]" />
                    <div className="h-4 w-full max-w-28 animate-pulse rounded bg-[var(--surface-hover)]" />
                  </div>
                  <div className="h-20 w-full animate-pulse rounded bg-[var(--surface-hover)]" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
