import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import { useJSON } from '../api/data';
import { Loading, ErrorState } from '../components/Skeleton';
import ProductStageRail from '../components/ProductStageRail';

// Activations feature accent — distinct from gold (brand), live (electric green), and alert (red).
const ACTIVATIONS_ACCENT = '#22d3ee';

type Iceberg = {
  catalog: string;
  database: string;
  storage: string;
  nodes: { id: string; label: string; layer: string; type: string; rows: string }[];
  edges: { from: string; to: string; via: string }[];
  consumers: { name: string; reads: string }[];
};

const LAYER_ORDER = ['source', 'bronze', 'silver', 'gold', 'platinum'];
const LAYER_LABEL: Record<string, string> = {
  source:   'Sources · operational',
  bronze:   'Bronze · raw landing',
  silver:   'Silver · conformed',
  gold:     'Gold · business marts',
  platinum: 'Platinum · agent-facing',
};
const LAYER_ACCENT: Record<string, string> = {
  source:   '#7d97bd',
  bronze:   '#a88a2c',
  silver:   '#4b6892',
  gold:     '#d4af37',
  platinum: '#10e88a',
};

export default function ArchitecturePage() {
  const ice = useJSON<Iceberg>('iceberg.json');
  if (ice.loading) return <Loading label="Loading lineage…" />;
  if (ice.error) return <ErrorState error={ice.error} />;
  if (!ice.data) return null;

  const byLayer = (layer: string) => ice.data!.nodes.filter((n) => n.layer === layer);

  return (
    <div>
      <Hero
        eyebrow="Reference Architecture · CTO/CDO scenario"
        title="ODI for a derivatives exchange"
        subtitle="Data Flow: Capital markets sources → Fivetran → Iceberg (MDLS) → Snowflake / Athena / Trino → dbt Labs → React. Replacing on-prem Striim with Fivetran. Fivetran lands every CDC row into Iceberg (MDLS) on S3 in open Apache Iceberg format — one copy of the bytes. Snowflake, Athena, and Trino all read the same Iceberg bytes via external table catalogs — no copies, no extracts. Fivetran Transformations triggers dbt Labs the moment the source sync finishes; bronze, silver, gold, platinum materialization stays in Iceberg."
      />

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 mb-6">
          <Stat label="Catalog" value={ice.data.catalog} mono />
          <Stat label="Database" value={ice.data.database} mono />
          <Stat label="Storage" value={ice.data.storage} mono />
          <Stat label="Tables (all layers)" value={ice.data.nodes.filter((n) => n.layer !== 'source').length.toString()} />
        </div>

        <ProductStageRail accent={ACTIVATIONS_ACCENT} />

        <div className="space-y-6">
          {LAYER_ORDER.map((layer) => {
            const nodes = byLayer(layer);
            if (!nodes.length) return null;
            const accent = LAYER_ACCENT[layer];
            return (
              <div key={layer} className="term-card p-5" style={{ borderLeftColor: accent }}>
                <div className="flex items-baseline justify-between mb-3">
                  <h2 className="font-display text-xl text-white">{LAYER_LABEL[layer]}</h2>
                  <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-navy-200">{nodes.length} {layer === 'source' ? 'systems' : 'tables'}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {nodes.map((n) => (
                    <div key={n.id} className="border border-navy-700 bg-navy-800/60 px-3 py-2">
                      <div className="font-mono text-sm font-semibold text-white break-all">{n.label}</div>
                      <div className="flex justify-between mt-1 text-[11px] font-mono">
                        <span className="text-navy-200">{n.type}</span>
                        <span className="text-gold-bright tabular">{n.rows}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10">
          <h2 className="font-display text-2xl text-white border-b border-gold pb-2 mb-4">Lineage edges</h2>
          <div className="term-card p-0 overflow-hidden">
            <table className="spec-table">
              <thead>
                <tr><th>From</th><th>To</th><th>Mechanism</th></tr>
              </thead>
              <tbody>
                {ice.data.edges.map((e, i) => (
                  <tr key={i}>
                    <td className="font-mono text-xs">{labelOf(ice.data!, e.from)}</td>
                    <td className="font-mono text-xs">{labelOf(ice.data!, e.to)}</td>
                    <td>
                      <span className={`chip ${e.via === 'Fivetran' ? 'dark' : 'navy'}`}>{e.via}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-10">
          <h2 className="font-display text-2xl text-white border-b border-gold pb-2 mb-4">Downstream consumers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {ice.data.consumers.map((c) => (
              <div key={c.name} className="term-card live p-4">
                <div className="font-display text-lg text-white">{c.name}</div>
                <div className="font-mono text-xs text-navy-200 mt-1">reads: {c.reads}</div>
              </div>
            ))}
          </div>
        </div>

        <ActivationsPanel />
      </section>
    </div>
  );
}

// =============================================================================
// ActivationsPanel — NewCo Activations, the native reverse-ETL stage that sits
// directly after Transformations. Trigger / destination / outcome below are
// vertical-specific to Beacon Markets' surveillance-to-case-management workflow.
// =============================================================================
const FIELD_MAP: { source: string; dest: string }[] = [
  { source: 'gold.fct_alert_evidence.alert_id',                  dest: 'Actimize.case_external_id' },
  { source: 'gold.fct_alert_evidence.member_id',                 dest: 'Actimize.subject_party_id' },
  { source: 'gold.fct_alert_evidence.pattern_confidence_score',  dest: 'Actimize.risk_score' },
  { source: 'gold.fct_alert_evidence.evidence_uri',               dest: 'Actimize.evidence_attachment_url' },
  { source: 'gold.fct_alert_evidence.pattern_type',              dest: 'Actimize.typology_code' },
];

function ActivationsPanel() {
  // TRIGGER — the gold-layer condition that fires the sync
  const TRIGGER =
    "gold.fct_alert_evidence writes a row where severity = 'critical' AND pattern_confidence_score >= 0.85, and the member is already on the members-under-review list — a corroborated, repeat high-confidence pattern, not a one-off flag.";
  // DESTINATION — the downstream system NewCo Activations pushes into
  const DESTINATION = 'NICE Actimize Case Manager · auto-opened investigation case';
  // OUTCOME — the business payoff the SE narrates
  const OUTCOME =
    'Cuts critical-alert-to-open-case time from roughly 12 minutes of manual re-keying to under 30 seconds. At 18 critical alerts a day, that reclaims about 3.6 analyst-hours daily for investigation instead of data entry, and closes the documented-escalation gap exchanges must show under CFTC Reg AT and SRO surveillance rules.';

  return (
    <div className="mt-10 term-card p-0 overflow-hidden" style={{ borderLeftColor: ACTIVATIONS_ACCENT }}>
      <header className="flex items-start justify-between gap-4 p-5 border-b border-navy-700">
        <div>
          <div className="eyebrow" style={{ color: ACTIVATIONS_ACCENT }}>Activations · NewCo</div>
          <h2 className="font-display text-xl text-white mt-0.5">
            The gold layer doesn&rsquo;t just get queried. It gets acted on.
          </h2>
          <p className="text-sm text-navy-100 mt-1 max-w-3xl leading-relaxed">
            Activations is the fourth native Fivetran stage, immediately after Transformations. It reads straight
            from the same Iceberg gold tables dbt Labs just built and syncs the result to an operational
            case-management system of record — no separate reverse-ETL vendor, no second copy of the data, no
            second connector to maintain.
          </p>
        </div>
        <div
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-navy-900 shrink-0"
          style={{ background: ACTIVATIONS_ACCENT }}
        >
          Activations
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-navy-700">
        <div className="p-5">
          <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-navy-200 font-semibold mb-2">Trigger · gold layer</div>
          <p className="text-sm text-white leading-relaxed">{TRIGGER}</p>
        </div>
        <div className="p-5">
          <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-navy-200 font-semibold mb-2">Destination</div>
          <p className="text-sm text-white leading-relaxed font-mono">{DESTINATION}</p>
        </div>
        <div className="p-5">
          <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-navy-200 font-semibold mb-2">Business outcome</div>
          <p className="text-sm text-white leading-relaxed">{OUTCOME}</p>
        </div>
      </div>

      <div className="p-5 border-t border-navy-700">
        <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-navy-200 font-semibold mb-3">Field mapping</div>
        <div className="overflow-x-auto">
          <table className="spec-table">
            <thead>
              <tr><th>gold.fct_alert_evidence</th><th>Actimize Case Manager</th></tr>
            </thead>
            <tbody>
              {FIELD_MAP.map((f) => (
                <tr key={f.source}>
                  <td className="font-mono text-xs">{f.source}</td>
                  <td className="font-mono text-xs">{f.dest}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="px-5 py-3 border-t border-navy-700 flex flex-wrap items-center justify-between gap-2 text-[11px] text-navy-200">
        <span className="font-mono">
          Connections &rarr; Destinations &rarr; Transformations &rarr;{' '}
          <strong style={{ color: ACTIVATIONS_ACCENT }}>Activations</strong> · one platform, one lineage graph
        </span>
        <Link
          to="/activations-live"
          className="uppercase tracking-wider font-semibold hover:underline font-mono"
          style={{ color: ACTIVATIONS_ACCENT }}
        >
          Watch it sync &rarr;
        </Link>
      </div>
    </div>
  );
}

function labelOf(d: Iceberg, id: string) {
  return d.nodes.find((n) => n.id === id)?.label ?? id;
}

function Stat({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="term-card gold p-4">
      <div className="font-mono text-[10px] uppercase tracking-wider text-navy-200">{label}</div>
      <div className={`mt-1 text-white ${mono ? 'font-mono text-sm break-all' : 'font-display text-2xl'}`}>{value}</div>
    </div>
  );
}
