export default function Loading() {
  return (
    <div className="space-y-4" role="status">
      <span className="sr-only">Loading admin workspace</span>
      <div aria-hidden="true" className="space-y-4 motion-safe:animate-pulse">
        <div className="h-11 rounded-lg bg-[var(--surface-strong)]" />
        <div className="h-9 w-36 rounded bg-[var(--surface-strong)]" />
        <div className="admin-queue">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="admin-queue-row">
              <div className="h-12 w-48 max-w-full rounded bg-[var(--surface-strong)]" />
              <div className="h-11 rounded bg-[var(--surface-strong)]" />
              <div className="h-11 w-24 rounded-lg bg-[var(--surface-strong)]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
