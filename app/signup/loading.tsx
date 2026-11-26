export default function Loading() {
  return (
    <div className="archive-auth" role="status">
      <span className="sr-only">Loading account setup</span>
      <div aria-hidden="true" className="archive-auth-content motion-safe:animate-pulse">
        <div className="h-14 w-52 max-w-full rounded bg-[var(--surface-strong)]" />
        <div className="auth-form-panel archive-auth-form grid gap-6">
          {Array.from({ length: 4 }, (_, index) => <div key={index} className="h-12 rounded-lg bg-[var(--surface-strong)]" />)}
        </div>
      </div>
    </div>
  );
}
