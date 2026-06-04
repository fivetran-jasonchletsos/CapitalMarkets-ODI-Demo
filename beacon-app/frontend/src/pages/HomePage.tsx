import { Link } from 'react-router-dom';
import { useJSON } from '../api/data';
import Hero from '../components/Hero';
import { Loading, ErrorState } from '../components/Skeleton';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

type Summary = {
  generated_at: string;
  snapshot_date: string;
  company: { name: string; tier: string; annual_revenue_usd: number; headcount: number; members: string[]; products: string[] };
  kpis: { label: string; value: number; unit: string; delta: string | null }[];
  asset_classes: { id: string; name: string; adv: number; oi: number; share_pct: number; lead_product: string }[];
  top_anomalies: { rank: number; product: string; issue: string; severity: string; owner: string }[];
};

type Volume = {
  daily_volume_30d: { date: string; RATES: number; ENERGY: number; AG: number; EQTY: number }[];
};

export default function HomePage() {
  const summary = useJSON<Summary>('summary.json');
  const volume = useJSON<Volume>('volume.json');

  if (summary.loading || volume.loading) return <Loading label="Loading exchange snapshot…" />;
  if (summary.error) return <ErrorState error={summary.error} />;
  if (volume.error) return <ErrorState error={volume.error} />;
  if (!summary.data || !volume.data) return null;

  const { company, kpis, asset_classes, top_anomalies } = summary.data;

  return (
    <div>
      <Hero
        eyebrow={`Market Operations · Snapshot ${summary.data.snapshot_date}`}
        title="Four asset classes, one signal"
        subtitle="Beacon Markets matches rates, energy, agriculture, and equity-index derivatives across Chicago, New York, and London. This portal unifies the FIX gateway, market data, clearinghouse, regulatory filings, and member CRM into one governed semantic layer — exchange ops, surveillance, risk, and run-time agents read the same gold tables."
        rightSlot={
          <div className="border-2 border-gold bg-navy-900/80 px-6 py-5 text-right">
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-gold-bright">Annual revenue</div>
            <div className="font-display text-3xl text-gold mt-1">${(company.annual_revenue_usd / 1e9).toFixed(2)}B</div>
            <div className="font-mono text-[11px] text-white/60 mt-1">{company.headcount.toLocaleString()} employees · {company.members.slice(0, 3).join(', ')} +{company.members.length - 3} more</div>
          </div>
        }
      />

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {kpis.map((k) => (
            <div key={k.label} className="kpi-tile">
              <div className="kpi-tile-label">{k.label}</div>
              <div className="kpi-tile-value">
                {formatKpi(k.value, k.unit)}
              </div>
              {k.delta && (
                <div className={`kpi-tile-delta ${k.delta.startsWith('-') && k.label.includes('p99') ? 'text-live' : k.delta.startsWith('+') ? 'text-live' : 'text-alert'}`}>
                  {k.delta}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 term-card gold p-5">
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="font-display text-xl text-white">ADV — last 30 days</h2>
            <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-navy-200">by asset class · contracts</div>
          </div>
          <div className="h-72">
            <ResponsiveContainer>
              <LineChart data={volume.data.daily_volume_30d}>
                <CartesianGrid stroke="#152c4a" strokeDasharray="2 4" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fontFamily: 'JetBrains Mono', fill: '#b3c4dc' }} stroke="#4b6892" />
                <YAxis tickFormatter={(v) => `${(v / 1e6).toFixed(1)}M`} tick={{ fontSize: 11, fontFamily: 'JetBrains Mono', fill: '#b3c4dc' }} stroke="#4b6892" />
                <Tooltip
                  formatter={(v: number) => `${(v / 1e6).toFixed(2)}M`}
                  contentStyle={{ background: '#0a1628', border: '1px solid #d4af37', borderRadius: 0, color: '#fff', fontFamily: 'JetBrains Mono', fontSize: 12 }}
                />
                <Line type="monotone" dataKey="RATES"  stroke="#d4af37" strokeWidth={2.5} dot={false} name="Rates" />
                <Line type="monotone" dataKey="ENERGY" stroke="#10e88a" strokeWidth={2}   dot={false} name="Energy" />
                <Line type="monotone" dataKey="AG"     stroke="#7d97bd" strokeWidth={2}   dot={false} name="Agriculture" />
                <Line type="monotone" dataKey="EQTY"   stroke="#f59e0b" strokeWidth={2}   dot={false} name="Equity Index" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex flex-wrap gap-3 text-sm">
            <Legend swatch="#d4af37" label="Rates" />
            <Legend swatch="#10e88a" label="Energy" />
            <Legend swatch="#7d97bd" label="Agriculture" />
            <Legend swatch="#f59e0b" label="Equity Index" />
          </div>
        </div>

        <div className="term-card alert p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-xl text-white">Top 3 anomalies</h2>
            <span className="chip alert">flagged</span>
          </div>
          <ul className="space-y-3">
            {top_anomalies.map((it) => (
              <li key={it.rank} className="border-l border-navy-600 pl-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-navy-300">#{it.rank}</span>
                  <span className={`chip ${it.severity === 'critical' ? 'alert' : 'warn'}`}>{it.severity}</span>
                </div>
                <div className="mt-1 text-sm font-semibold text-white">{it.issue}</div>
                <div className="font-mono text-[11px] text-navy-200 mt-1">{it.product} · owner: {it.owner}</div>
              </li>
            ))}
          </ul>
          <Link to="/surveillance" className="mt-4 inline-block font-mono text-xs uppercase tracking-wider text-gold-bright hover:text-white">
            View surveillance →
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-8">
        <div className="term-card gold p-0 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr,auto] gap-0">
            <div className="p-6">
              <div className="eyebrow mb-2">dbt-wizard · Build-time AI</div>
              <h2 className="font-display text-2xl text-white mb-2">
                CRO wants intraday OI concentration by member × product × 15-min bucket. The gold model doesn't exist yet.
              </h2>
              <p className="text-sm text-navy-100 max-w-2xl leading-relaxed mb-4">
                No <span className="font-mono text-xs bg-navy-800 border border-navy-600 px-1.5 py-0.5 text-gold-bright">gold.fct_member_oi_concentration_15m</span>.
                Risk Committee meeting in 14 hours. Manual build ETA: 5 to 8 days. dbt-wizard ETA: 92 seconds.
                At risk: <strong className="text-gold-bright">$184M of house VaR exposure left unmodeled</strong>.
              </p>
              <div className="flex flex-wrap gap-2">
                <Link
                  to="/dbt-wizard"
                  className="inline-flex items-center gap-2 font-semibold text-sm px-4 py-2.5 bg-gold text-navy-900 hover:bg-gold-bright transition-colors"
                >
                  See the live build
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M5 12h14M13 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link
                  to="/architecture"
                  className="inline-flex items-center gap-2 font-semibold text-sm px-4 py-2.5 border border-navy-500 bg-navy-800 hover:bg-navy-700 transition-colors text-white"
                >
                  Architecture
                </Link>
              </div>
            </div>
            <div className="hidden lg:flex flex-col items-center justify-center px-8 py-6 bg-navy-900 text-white gap-3" style={{ minWidth: 220 }}>
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/60">dbt-wizard result</div>
              <div className="font-display text-5xl font-semibold text-gold-bright" style={{ lineHeight: 1 }}>92s</div>
              <div className="font-mono text-[11px] text-white/60 text-center">CRO question to<br />materialized gold model</div>
              <div className="text-[11px] text-white/40 font-mono text-center">vs 5 to 8 day manual build</div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-display text-2xl text-white">Asset classes</h2>
          <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-navy-200">
            {asset_classes.length} books · ADV {(asset_classes.reduce((s, a) => s + a.adv, 0) / 1e6).toFixed(2)}M contracts · OI {(asset_classes.reduce((s, a) => s + a.oi, 0) / 1e6).toFixed(1)}M
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {asset_classes.map((ac) => (
            <div key={ac.id} className="term-card p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="chip dark">{ac.id}</span>
                <h3 className="font-display text-lg text-white">{ac.name}</h3>
              </div>
              <div className="text-sm text-navy-200 mb-3">Lead: <span className="font-mono text-gold-bright">{ac.lead_product}</span></div>
              <div className="grid grid-cols-3 gap-2">
                <Mini label="ADV" value={`${(ac.adv / 1e6).toFixed(2)}M`} />
                <Mini label="OI" value={`${(ac.oi / 1e6).toFixed(1)}M`} />
                <Mini label="Share" value={`${ac.share_pct.toFixed(1)}%`} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-navy-100">
      <span className="h-3 w-3" style={{ background: swatch }} /> {label}
    </span>
  );
}

function Mini({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-navy-900/60 border border-navy-700 px-2 py-1.5">
      <div className="font-mono text-[9px] uppercase tracking-wider text-navy-200">{label}</div>
      <div className="font-display text-base text-white">{value}</div>
    </div>
  );
}

function formatKpi(value: number, unit: string) {
  if (unit === 'contracts') {
    if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(0)}K`;
  }
  if (unit === 'usd') {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  }
  if (unit === 'us') return `${value}μs`;
  if (unit === '%')  return `${value}%`;
  return value.toLocaleString();
}
