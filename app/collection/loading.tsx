export default function Loading() {
  return (
    <div className="page-wrap archive-workspace" role="status">
      <span className="sr-only">Loading collection</span>
      <div aria-hidden="true" className="collection-workspace motion-safe:animate-pulse">
        <div className="h-9 w-44 rounded bg-[var(--surface-strong)]" />
        <div className="collection-toolbar">
          <div className="h-5 w-44 rounded bg-[var(--surface-strong)]" />
          <div className="h-11 w-28 rounded-lg bg-[var(--surface-strong)]" />
        </div>
        <div className="grid max-w-md gap-1.5">
          <div className="h-5 w-40 rounded bg-[var(--surface-strong)]" />
          <div className="h-12 rounded-lg bg-[var(--surface-strong)]" />
        </div>
        <ul className="archive-member-list">
          {Array.from({ length: 4 }, (_, index) => (
            <li key={index}>
              <div className="archive-member-row">
                <div className="archive-card-photo" />
                <div className="h-6 w-40 max-w-full rounded bg-[var(--surface-strong)]" />
                <div className="size-6 rounded bg-[var(--surface-strong)]" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
