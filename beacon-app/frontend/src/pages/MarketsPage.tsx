import Hero from '../components/Hero';
import { useJSON } from '../api/data';
import { Loading, ErrorState } from '../components/Skeleton';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

type Summary = {
  asset_classes: { id: string; name: string; adv: number; oi: number; share_pct: number; lead_product: string }[];
};

type Volume = {
  intraday_curve: { time: string; volume: number }[];
  venue_share: { venue: string; share_pct: number }[];
  daily_volume_30d: { date: string; RATES: number; ENERGY: number; AG: number; EQTY: number }[];
};

export default function MarketsPage() {
  const summary = useJSON<Summary>('summary.json');
  const volume = useJSON<Volume>('volume.json');

  if (summary.loading || volume.loading) return <Loading label="Loading markets data…" />;
  if (summary.error) return <ErrorState error={summary.error} />;
  if (volume.error) return <ErrorState error={volume.error} />;
  if (!summary.data || !volume.data) return null;

  const totalAdv = summary.data.asset_classes.reduce((s, a) => s + a.adv, 0);

  return (
    <div>
      <Hero
        eyebrow="Markets · CEO scenario"
        title="Products, volume, share"
        subtitle="Market share by asset class and venue. Intraday volume profile, 30-day ADV trend. The numbers the CEO uses to track competitive positioning across rates, energy, agriculture, and equity-index complexes."
      />

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <h2 className="font-display text-xl text-white mb-4">Volume by asset class — today vs. 30-day average</h2>
        <div className="term-card p-5">
          <div className="h-80">
            <ResponsiveContainer>
              <BarChart data={summary.data.asset_classes}>
                <CartesianGrid stroke="#152c4a" strokeDasharray="2 4" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fontFamily: 'JetBrains Mono', fill: '#b3c4dc' }} stroke="#4b6892" />
                <YAxis tickFormatter={(v) => `${(v / 1e6).toFixed(1)}M`} tick={{ fontSize: 11, fontFamily: 'JetBrains Mono', fill: '#b3c4dc' }} stroke="#4b6892" />
                <Tooltip
                  formatter={(v: number) => `${(v / 1e6).toFixed(2)}M`}
                  contentStyle={{ background: '#0a1628', border: '1px solid #d4af37', borderRadius: 0, color: '#fff', fontFamily: 'JetBrains Mono', fontSize: 12 }}
                />
                <Bar dataKey="adv" fill="#d4af37" name="ADV (contracts)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="term-card gold p-5">
          <h2 className="font-display text-xl text-white mb-2">Market share by venue — Rates complex</h2>
          <p className="text-sm text-navy-200 mb-4">Beacon holds 47.2% of the rates listed-futures market. Tradeworx Futures is the primary competitor.</p>
          <div className="space-y-2">
            {volume.data.venue_share.map((v) => (
              <div key={v.venue} className="flex items-center gap-3">
                <div className="font-mono text-xs text-navy-100 w-44 truncate">{v.venue}</div>
                <div className="flex-1 h-7 bg-navy-800 relative overflow-hidden border border-navy-700">
                  <div
                    className="h-full"
                    style={{
                      width: `${v.share_pct}%`,
                      background: v.venue === 'Beacon Markets' ? 'linear-gradient(90deg, #d4af37, #f0c948)' : '#4b6892',
                    }}
                  />
                  <div className="absolute inset-0 flex items-center pl-2 font-mono text-xs font-bold text-white mix-blend-difference">
                    {v.share_pct.toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="term-card p-5">
          <h2 className="font-display text-xl text-white mb-2">Intraday volume curve — today</h2>
          <p className="text-sm text-navy-200 mb-4">U-shape with the expected closing-hour surge into 14:00 to 14:30 CT.</p>
          <div className="h-56">
            <ResponsiveContainer>
              <AreaChart data={volume.data.intraday_curve}>
                <CartesianGrid stroke="#152c4a" strokeDasharray="2 4" />
                <XAxis dataKey="time" tick={{ fontSize: 11, fontFamily: 'JetBrains Mono', fill: '#b3c4dc' }} stroke="#4b6892" />
                <YAxis tickFormatter={(v) => `${(v / 1e3).toFixed(0)}K`} tick={{ fontSize: 11, fontFamily: 'JetBrains Mono', fill: '#b3c4dc' }} stroke="#4b6892" />
                <Tooltip
                  formatter={(v: number) => v.toLocaleString()}
                  contentStyle={{ background: '#0a1628', border: '1px solid #10e88a', borderRadius: 0, color: '#fff', fontFamily: 'JetBrains Mono', fontSize: 12 }}
                />
                <Area type="monotone" dataKey="volume" stroke="#10e88a" fill="#10e88a" fillOpacity={0.18} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-14">
        <h2 className="font-display text-xl text-white mb-4">Asset-class breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {summary.data.asset_classes.map((ac) => (
            <div key={ac.id} className="term-card gold p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="chip dark">{ac.id}</span>
                <h3 className="font-display text-lg text-white">{ac.name}</h3>
              </div>
              <div className="text-xs text-navy-200 mb-3 font-mono">Lead: <span className="text-gold-bright">{ac.lead_product}</span></div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <Stat label="ADV" value={`${(ac.adv / 1e6).toFixed(2)}M`} />
                <Stat label="OI" value={`${(ac.oi / 1e6).toFixed(1)}M`} />
                <Stat label="Beacon share" value={`${ac.share_pct.toFixed(1)}%`} />
                <Stat label="% of book" value={`${((ac.adv / totalAdv) * 100).toFixed(1)}%`} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-navy-900/60 border border-navy-700 px-2 py-1.5">
      <div className="font-mono text-[9px] uppercase tracking-wider text-navy-200">{label}</div>
      <div className="font-display text-base text-white tabular">{value}</div>
    </div>
  );
}
