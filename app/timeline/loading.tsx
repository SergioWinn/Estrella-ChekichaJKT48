export default function Loading() {
  return (
    <div className="page-wrap archive-workspace" role="status">
      <span className="sr-only">Loading timeline</span>
      <div aria-hidden="true" className="timeline-workspace motion-safe:animate-pulse">
        <div className="h-14 w-56 max-w-full rounded-lg bg-[var(--surface-strong)]" />
        <div className="h-11 rounded-lg bg-[var(--surface-strong)]" />
        <div className="h-11 w-72 max-w-full rounded-lg bg-[var(--surface-strong)]" />
        <div className="timeline-layout">
          <div className="timeline-month-nav min-h-48 bg-[var(--surface-strong)]" />
          <div className="timeline-rows">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="timeline-row">
                <div className="timeline-art" />
                <div className="my-2 h-8 w-48 max-w-full rounded bg-[var(--surface-strong)]" />
                <div className="timeline-slots"><div className="h-8 w-28 max-w-full rounded bg-[var(--surface-strong)]" /></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
