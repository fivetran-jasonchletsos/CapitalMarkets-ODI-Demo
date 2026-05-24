export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-navy-700/50 ${className}`} />;
}

export function Loading({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="font-mono text-xs uppercase tracking-[0.16em] text-navy-200">{label}</div>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
      </div>
    </div>
  );
}

export function ErrorState({ error }: { error: Error }) {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="term-card alert p-6">
        <div className="eyebrow text-alert">Data load failed</div>
        <pre className="mt-2 text-sm text-navy-100 whitespace-pre-wrap">{error.message}</pre>
      </div>
    </div>
  );
}
