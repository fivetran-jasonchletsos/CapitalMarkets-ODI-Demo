import Hero from '../components/Hero';
import { useJSON } from '../api/data';
import { Loading, ErrorState } from '../components/Skeleton';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';

type Surv = {
  summary: { alerts_24h: number; alerts_critical: number; false_positive_pct: number; median_time_to_review_min: number; members_under_review: number };
  top_patterns: { rank: number; pattern: string; alerts_24h: number; products: string; trend: string }[];
  recent_alerts: { alert_id: string; ts: string; member: string; product: string; pattern: string; severity: string; status: string }[];
  false_positive_trend_30d: { date: string; fp_pct: number }[];
};

const STATUS_CHIP: Record<string, string> = {
  open: 'alert',
  escalated: 'alert',
  'in review': 'warn',
  dismissed: 'navy',
};

const SEV_CHIP: Record<string, string> = {
  critical: 'alert',
  high: 'warn',
  medium: 'navy',
};

export default function SurveillancePage() {
  const s = useJSON<Surv>('surveillance.json');

  if (s.loading) return <Loading label="Loading surveillance feed…" />;
  if (s.error) return <ErrorState error={s.error} />;
  if (!s.data) return null;

  return (
    <div>
      <Hero
        eyebrow="Surveillance · Chief Risk Officer scenario"
        title="Spoofing, layering, wash — caught at the silver layer"
        subtitle="Order-lifecycle data from FIX joined to quote snapshots and member reference, then evaluated against pattern detectors at the silver-to-gold boundary. Surveillance officers and the Cortex agent read the same gold.fct_alert_evidence table."
      />

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="kpi-tile">
            <div className="kpi-tile-label">Alerts · 24h</div>
            <div className="kpi-tile-value">{s.data.summary.alerts_24h.toLocaleString()}</div>
          </div>
          <div className="kpi-tile">
            <div className="kpi-tile-label">Critical</div>
            <div className="kpi-tile-value text-alert">{s.data.summary.alerts_critical}</div>
          </div>
          <div className="kpi-tile">
            <div className="kpi-tile-label">False-positive</div>
            <div className="kpi-tile-value">{s.data.summary.false_positive_pct}%</div>
            <div className="kpi-tile-delta text-live">-5.8pp · 30d</div>
          </div>
          <div className="kpi-tile">
            <div className="kpi-tile-label">Median TTR</div>
            <div className="kpi-tile-value">{s.data.summary.median_time_to_review_min}m</div>
          </div>
          <div className="kpi-tile">
            <div className="kpi-tile-label">Members in review</div>
            <div className="kpi-tile-value">{s.data.summary.members_under_review}</div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="term-card alert p-5">
          <h2 className="font-display text-xl text-white mb-3">Top 5 patterns · this week</h2>
          <div className="space-y-2">
            {s.data.top_patterns.map((p) => (
              <div key={p.rank} className="grid grid-cols-[24px,1fr,auto] items-center gap-2 border-b border-navy-700 pb-2">
                <div className="font-mono text-xs text-navy-300">#{p.rank}</div>
                <div>
                  <div className="text-sm font-semibold text-white">{p.pattern}</div>
                  <div className="font-mono text-[11px] text-navy-200">{p.products}</div>
                </div>
                <div className="text-right">
                  <div className="font-display text-lg text-gold-bright tabular">{p.alerts_24h}</div>
                  <div className={`font-mono text-[10px] ${p.trend.startsWith('+') ? 'text-alert' : 'text-live'}`}>{p.trend}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="term-card live p-5">
          <h2 className="font-display text-xl text-white mb-3">False-positive rate · 30 days</h2>
          <p className="text-sm text-navy-200 mb-4">After we joined silver.fct_order_lifecycle to silver.fct_quote_snapshot_1s (quote-on-quote spoofing instead of order-only), the FP rate dropped from 18.2% to 12.4%.</p>
          <div className="h-44">
            <ResponsiveContainer>
              <LineChart data={s.data.false_positive_trend_30d}>
                <CartesianGrid stroke="#152c4a" strokeDasharray="2 4" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fontFamily: 'JetBrains Mono', fill: '#b3c4dc' }} stroke="#4b6892" />
                <YAxis domain={[10, 20]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11, fontFamily: 'JetBrains Mono', fill: '#b3c4dc' }} stroke="#4b6892" />
                <Tooltip
                  formatter={(v: number) => `${v}%`}
                  contentStyle={{ background: '#0a1628', border: '1px solid #10e88a', borderRadius: 0, color: '#fff', fontFamily: 'JetBrains Mono', fontSize: 12 }}
                />
                <ReferenceLine y={15} stroke="#d4af37" strokeDasharray="4 4" label={{ value: 'target', fill: '#d4af37', fontSize: 11, position: 'right' }} />
                <Line type="monotone" dataKey="fp_pct" stroke="#10e88a" strokeWidth={3} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12">
        <h2 className="font-display text-xl text-white mb-4">Recent alerts feed</h2>
        <div className="term-card p-0 overflow-x-auto">
          <table className="spec-table">
            <thead>
              <tr>
                <th>Alert ID</th>
                <th>Timestamp (UTC)</th>
                <th>Member</th>
                <th>Product</th>
                <th>Pattern</th>
                <th>Severity</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {s.data.recent_alerts.map((a) => (
                <tr key={a.alert_id}>
                  <td className="font-mono text-xs">{a.alert_id}</td>
                  <td className="font-mono text-xs">{new Date(a.ts).toLocaleTimeString()}</td>
                  <td className="text-sm">{a.member}</td>
                  <td className="font-mono text-xs">{a.product}</td>
                  <td className="text-sm">{a.pattern}</td>
                  <td><span className={`chip ${SEV_CHIP[a.severity] ?? 'navy'}`}>{a.severity}</span></td>
                  <td><span className={`chip ${STATUS_CHIP[a.status] ?? 'navy'}`}>{a.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
