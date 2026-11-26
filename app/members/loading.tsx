export default function Loading() {
  return (
    <div className="page-wrap archive-workspace" role="status">
      <span className="sr-only">Loading members</span>
      <div aria-hidden="true" className="members-workspace motion-safe:animate-pulse">
        <div className="h-9 w-36 rounded bg-[var(--surface-strong)]" />
        <div className="h-11 w-52 max-w-full rounded bg-[var(--surface-strong)]" />
        <div className="h-11 rounded-lg bg-[var(--surface-strong)]" />
        <ul className="archive-member-list">
          {Array.from({ length: 8 }, (_, index) => (
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
