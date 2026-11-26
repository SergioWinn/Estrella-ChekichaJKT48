export default function Loading() {
  return (
    <div className="archive-auth" role="status">
      <span className="sr-only">Loading sign in</span>
      <div aria-hidden="true" className="archive-auth-content motion-safe:animate-pulse">
        <div className="h-14 w-36 rounded bg-[var(--surface-strong)]" />
        <div className="auth-form-panel archive-auth-form grid gap-4">
          {Array.from({ length: 3 }, (_, index) => <div key={index} className="h-12 rounded-lg bg-[var(--surface-strong)]" />)}
        </div>
      </div>
    </div>
  );
}
