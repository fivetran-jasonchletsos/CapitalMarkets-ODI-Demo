import Hero from '../components/Hero';
import { useJSON } from '../api/data';
import { Loading, ErrorState } from '../components/Skeleton';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

type Risk = {
  house_var: { var_95_usd: number; var_99_usd: number; stress_2008_usd: number; stress_covid_usd: number };
  margin: { total_margin_required_usd: number; total_margin_posted_usd: number; utilization_pct: number; concentration_top5_pct: number };
  collateral_mix: { type: string; share_pct: number }[];
  top_members: { member: string; net_exposure_usd: number; margin_posted_usd: number; margin_required_usd: number; concentration_pct: number }[];
  fee_revenue_30d: { date: string; fees_usd: number }[];
};

export default function RiskPage() {
  const r = useJSON<Risk>('risk.json');

  if (r.loading) return <Loading label="Loading risk + clearing data…" />;
  if (r.error) return <ErrorState error={r.error} />;
  if (!r.data) return null;

  const stressData = [
    { scenario: 'VaR 95%',     loss: r.data.house_var.var_95_usd },
    { scenario: 'VaR 99%',     loss: r.data.house_var.var_99_usd },
    { scenario: 'Stress · 2008',loss: r.data.house_var.stress_2008_usd },
    { scenario: 'Stress · Covid',loss: r.data.house_var.stress_covid_usd },
  ];

  return (
    <div>
      <Hero
        eyebrow="Risk & Clearing · CFO + CRO scenario"
        title="VaR, margin, collateral, member concentration"
        subtitle="House VaR, clearing-margin utilization, collateral mix, top members by exposure. Transaction-fee revenue trend. The numbers the CFO and Chief Risk Officer both need — joined live from the clearinghouse, market data, and FIX gateway through the silver and gold layers."
      />

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="kpi-tile">
            <div className="kpi-tile-label">House VaR (95%)</div>
            <div className="kpi-tile-value">${(r.data.house_var.var_95_usd / 1e6).toFixed(0)}M</div>
          </div>
          <div className="kpi-tile">
            <div className="kpi-tile-label">House VaR (99%)</div>
            <div className="kpi-tile-value">${(r.data.house_var.var_99_usd / 1e6).toFixed(0)}M</div>
          </div>
          <div className="kpi-tile">
            <div className="kpi-tile-label">Margin utilization</div>
            <div className="kpi-tile-value">{r.data.margin.utilization_pct}%</div>
            <div className="kpi-tile-delta text-warn">top 5 = {r.data.margin.concentration_top5_pct}%</div>
          </div>
          <div className="kpi-tile">
            <div className="kpi-tile-label">Margin posted</div>
            <div className="kpi-tile-value">${(r.data.margin.total_margin_posted_usd / 1e9).toFixed(1)}B</div>
            <div className="kpi-tile-delta text-navy-200">req: ${(r.data.margin.total_margin_required_usd / 1e9).toFixed(1)}B</div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="term-card warn p-5">
          <h2 className="font-display text-xl text-white mb-3">House VaR · stress scenarios</h2>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={stressData} layout="vertical" margin={{ left: 60 }}>
                <CartesianGrid stroke="#152c4a" strokeDasharray="2 4" />
                <XAxis type="number" tickFormatter={(v) => `$${(v / 1e6).toFixed(0)}M`} tick={{ fontSize: 11, fontFamily: 'JetBrains Mono', fill: '#b3c4dc' }} stroke="#4b6892" />
                <YAxis type="category" dataKey="scenario" tick={{ fontSize: 12, fontFamily: 'JetBrains Mono', fill: '#dae3ef' }} stroke="#4b6892" />
                <Tooltip
                  formatter={(v: number) => `$${(v / 1e6).toFixed(0)}M`}
                  contentStyle={{ background: '#0a1628', border: '1px solid #f59e0b', borderRadius: 0, color: '#fff', fontFamily: 'JetBrains Mono', fontSize: 12 }}
                />
                <Bar dataKey="loss" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="term-card gold p-5">
          <h2 className="font-display text-xl text-white mb-3">Transaction-fee revenue · 30d</h2>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={r.data.fee_revenue_30d}>
                <CartesianGrid stroke="#152c4a" strokeDasharray="2 4" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fontFamily: 'JetBrains Mono', fill: '#b3c4dc' }} stroke="#4b6892" />
                <YAxis tickFormatter={(v) => `$${(v / 1e6).toFixed(1)}M`} tick={{ fontSize: 11, fontFamily: 'JetBrains Mono', fill: '#b3c4dc' }} stroke="#4b6892" />
                <Tooltip
                  formatter={(v: number) => `$${(v / 1e6).toFixed(2)}M`}
                  contentStyle={{ background: '#0a1628', border: '1px solid #d4af37', borderRadius: 0, color: '#fff', fontFamily: 'JetBrains Mono', fontSize: 12 }}
                />
                <Line type="monotone" dataKey="fees_usd" stroke="#d4af37" strokeWidth={2.5} dot={{ r: 3, fill: '#d4af37' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="term-card p-5">
          <h2 className="font-display text-xl text-white mb-3">Collateral mix</h2>
          <div className="space-y-2">
            {r.data.collateral_mix.map((c) => (
              <div key={c.type} className="flex items-center gap-3">
                <div className="font-mono text-xs text-navy-100 w-40 truncate">{c.type}</div>
                <div className="flex-1 h-6 bg-navy-800 relative overflow-hidden border border-navy-700">
                  <div
                    className="h-full"
                    style={{
                      width: `${c.share_pct}%`,
                      background: c.type === 'US Treasuries' ? '#d4af37' : c.type.startsWith('Cash') ? '#10e88a' : '#7d97bd',
                    }}
                  />
                  <div className="absolute inset-0 flex items-center pl-2 font-mono text-xs font-bold text-white mix-blend-difference">
                    {c.share_pct.toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="term-card alert p-5">
          <h2 className="font-display text-xl text-white mb-3">Top 5 members · concentration</h2>
          <p className="text-sm text-navy-200 mb-3">Halcyon FCM holds 22.4% of net OI — risk review triggered.</p>
          <table className="spec-table">
            <thead>
              <tr><th>Member</th><th>Net exp.</th><th>Concentration</th></tr>
            </thead>
            <tbody>
              {r.data.top_members.map((m) => (
                <tr key={m.member}>
                  <td className="text-sm">{m.member}</td>
                  <td className="font-mono text-xs tabular">${(m.net_exposure_usd / 1e9).toFixed(2)}B</td>
                  <td><span className={`chip ${m.concentration_pct > 20 ? 'alert' : m.concentration_pct > 15 ? 'warn' : 'navy'}`}>{m.concentration_pct.toFixed(1)}%</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
