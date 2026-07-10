export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="grid gap-px overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--border)] md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-[var(--surface)] p-5">
            <div className="h-10 w-24 animate-pulse rounded bg-[var(--surface-strong)]" />
            <div className="mt-3 h-4 w-36 animate-pulse rounded bg-[var(--surface-strong)]" />
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.7fr_0.75fr]">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-8">
          <div className="h-4 w-24 animate-pulse rounded bg-[var(--surface-strong)]" />
          <div className="mt-4 h-8 w-96 animate-pulse rounded bg-[var(--surface-strong)]" />
          <div className="mt-3 h-5 w-72 animate-pulse rounded bg-[var(--surface-strong)]" />
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <div className="h-4 w-16 animate-pulse rounded bg-[var(--surface-strong)]" />
          <div className="mt-4 h-20 w-full animate-pulse rounded bg-[var(--surface-strong)]" />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="h-5 w-32 animate-pulse rounded bg-[var(--surface-strong)]" />
          <div className="mt-5 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 rounded-lg border border-[var(--border)] bg-[var(--surface-strong)] p-4">
                <div className="size-14 animate-pulse rounded-full bg-[var(--surface-hover)]" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-32 animate-pulse rounded bg-[var(--surface-hover)]" />
                  <div className="h-4 w-24 animate-pulse rounded bg-[var(--surface-hover)]" />
                </div>
                <div className="h-8 w-16 animate-pulse rounded bg-[var(--surface-hover)]" />
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="h-5 w-24 animate-pulse rounded bg-[var(--surface-strong)]" />
          <div className="mt-5 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-lg border border-[var(--border)] bg-[var(--surface-strong)] p-4">
                <div className="flex items-center gap-3">
                  <div className="size-12 animate-pulse rounded-full bg-[var(--surface-hover)]" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-28 animate-pulse rounded bg-[var(--surface-hover)]" />
                    <div className="h-4 w-36 animate-pulse rounded bg-[var(--surface-hover)]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
