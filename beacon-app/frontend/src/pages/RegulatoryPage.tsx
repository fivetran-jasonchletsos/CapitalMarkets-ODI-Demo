import Hero from '../components/Hero';
import { useJSON } from '../api/data';
import { Loading, ErrorState } from '../components/Skeleton';

type Reg = {
  reporting: { regime: string; status: string; submissions_today: number; fail_pct: number; next_deadline: string; owner: string }[];
  trade_lineage: {
    trade_id: string;
    product: string;
    side: string;
    qty: number;
    price: string;
    member: string;
    trader: string;
    timestamp_utc: string;
    hops: { step: number; system: string; table: string; ts_offset_ms: number; note: string }[];
  };
};

const STATUS_CHIP: Record<string, string> = {
  'on track': 'live',
  'watch': 'warn',
  'breach': 'alert',
};

export default function RegulatoryPage() {
  const r = useJSON<Reg>('regulatory.json');

  if (r.loading) return <Loading label="Loading regulatory feed…" />;
  if (r.error) return <ErrorState error={r.error} />;
  if (!r.data) return null;

  const { trade_lineage: t } = r.data;

  return (
    <div>
      <Hero
        eyebrow="Regulatory · CTO + Compliance scenario"
        title="CFTC + FINRA reporting, end-to-end trade lineage"
        subtitle="Part 45 SDR submissions, Part 43 real-time tape, FINRA CAT order-lifecycle, SEC 13H large-trader reports, OFAC screening. Every trade has a single, queryable lineage trace from FIX gateway to clearinghouse to bronze to silver to gold to regulator submission."
      />

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="font-display text-xl text-white mb-4">Reporting status</h2>
        <div className="term-card p-0 overflow-x-auto">
          <table className="spec-table">
            <thead>
              <tr>
                <th>Regime</th>
                <th>Status</th>
                <th>Submissions today</th>
                <th>Fail %</th>
                <th>Next deadline</th>
                <th>Owner</th>
              </tr>
            </thead>
            <tbody>
              {r.data.reporting.map((row) => (
                <tr key={row.regime}>
                  <td className="text-sm font-semibold">{row.regime}</td>
                  <td><span className={`chip ${STATUS_CHIP[row.status] ?? 'navy'}`}>{row.status}</span></td>
                  <td className="font-mono text-xs tabular">{row.submissions_today.toLocaleString()}</td>
                  <td className="font-mono text-xs tabular">{(row.fail_pct * 100).toFixed(3)}%</td>
                  <td className="font-mono text-xs">{row.next_deadline}</td>
                  <td className="text-sm">{row.owner}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12">
        <h2 className="font-display text-xl text-white mb-4">End-to-end lineage · single trade</h2>
        <div className="term-card gold p-5 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Field label="Trade ID" value={t.trade_id} mono />
            <Field label="Product" value={t.product} />
            <Field label="Side / Qty / Px" value={`${t.side} ${t.qty} @ ${t.price}`} />
            <Field label="Member / Desk" value={`${t.member} · ${t.trader}`} />
            <Field label="Match timestamp (UTC)" value={t.timestamp_utc} mono />
          </div>
        </div>

        <div className="space-y-2">
          {t.hops.map((h, idx) => (
            <div key={h.step} className="term-card p-4 flex items-center gap-4 relative">
              <div className="font-display text-3xl font-semibold text-gold-bright tabular w-10 text-center">{String(h.step).padStart(2, '0')}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs text-gold-bright">{h.system}</span>
                  <span className="font-mono text-[11px] text-navy-200">·</span>
                  <span className="font-mono text-xs text-white truncate">{h.table}</span>
                </div>
                <div className="text-sm text-navy-100 mt-1">{h.note}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-mono text-[10px] uppercase tracking-wider text-navy-200">latency</div>
                <div className="font-display text-lg text-white tabular">+{h.ts_offset_ms.toLocaleString()}ms</div>
              </div>
              {idx < t.hops.length - 1 && (
                <div className="absolute left-[34px] -bottom-2 w-px h-2 bg-gold/60" />
              )}
            </div>
          ))}
        </div>

        <div className="term-card live p-5 mt-6">
          <div className="eyebrow mb-1">Outcome</div>
          <p className="text-sm text-navy-100 leading-relaxed">
            Trade <span className="font-mono text-gold-bright">{t.trade_id}</span> went from match-engine print to regulator-ready record in
            <span className="font-mono text-live"> {(t.hops[t.hops.length - 1].ts_offset_ms / 1000).toFixed(1)}s</span>.
            Every hop is an Iceberg table — run-time agents, the surveillance app, the CFTC submission pipeline, and the auditor all read the same lineage.
          </p>
        </div>
      </section>
    </div>
  );
}

function Field({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-wider text-navy-200">{label}</div>
      <div className={`mt-1 text-white ${mono ? 'font-mono text-xs break-all' : 'font-display text-base'}`}>{value}</div>
    </div>
  );
}
