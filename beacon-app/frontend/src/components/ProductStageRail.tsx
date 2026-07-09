// components/ProductStageRail.tsx
// Four-stage badge strip showing the real Fivetran product-UI pipeline order,
// left to right: Connections -> Destinations -> Transformations -> Activations.
// Ported from the Clarity/Verity/Altavest reference build.

const STAGES = [
  { label: 'Connections',     sub: 'Source connectors' },
  { label: 'Destinations',    sub: 'Iceberg lakehouse (MDLS)' },
  { label: 'Transformations', sub: 'dbt Labs' },
  { label: 'Activations',     sub: 'Reverse-ETL, native' },
] as const;

export default function ProductStageRail({ accent = '#22d3ee' }: { accent?: string }) {
  return (
    <div className="mb-6 flex flex-wrap items-stretch gap-2" role="list" aria-label="Fivetran product pipeline stages">
      {STAGES.map((s, i) => (
        <div key={s.label} className="flex items-center gap-2" role="listitem">
          <div className="border border-navy-600 bg-navy-800/60 px-3 py-2">
            <div
              className="font-mono text-[9.5px] font-bold uppercase tracking-wider"
              style={{ color: s.label === 'Activations' ? accent : '#b3c4dc' }}
            >
              {s.label}
            </div>
            <div className="font-mono text-[10.5px] text-navy-200 mt-0.5 whitespace-nowrap">{s.sub}</div>
          </div>
          {i < STAGES.length - 1 && (
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" fill="none" stroke="#4b6892" strokeWidth="2.5" strokeLinecap="round">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          )}
        </div>
      ))}
    </div>
  );
}
