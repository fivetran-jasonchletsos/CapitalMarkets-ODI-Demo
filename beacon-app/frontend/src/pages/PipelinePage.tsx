import { useState } from 'react';
import Hero from '../components/Hero';
import { useJSON } from '../api/data';
import { Loading, ErrorState } from '../components/Skeleton';

type Pipeline = {
  refreshed_at: string;
  connectors: { name: string; source: string; mechanism: string; fivetran_id?: string; fivetran_url?: string; status: string; last_sync_minutes: number; rows_synced_24h: number; latency_target_min: number; note?: string | null }[];
  layers: { layer: string; name: string; tables: number; last_run_min: number; status: string; tests_passing: number; tests_total: number }[];
  recent_runs: { run_id: string; model: string; status: string; duration_s: number; rows: number; started_at: string }[];
  failure_sim: { enabled: boolean; note: string };
};

const STATUS_CHIP: Record<string, string> = {
  healthy: 'live',
  degraded: 'warn',
  failed: 'alert',
  success: 'live',
};

export default function PipelinePage() {
  const pipe = useJSON<Pipeline>('pipeline.json');
  const [simulateFailure, setSimulateFailure] = useState(false);

  if (pipe.loading) return <Loading label="Loading pipeline status…" />;
  if (pipe.error) return <ErrorState error={pipe.error} />;
  if (!pipe.data) return null;

  const connectors = pipe.data.connectors.map((c) => {
    if (simulateFailure && c.name.startsWith('FIX')) {
      return { ...c, status: 'failed', last_sync_minutes: 38, note: 'FIX 4.4 gateway in NJ4 unreachable since 21:18 — surveillance models on the gold layer go stale, Part 45 SDR submission queue backs up against T+1 06:00 ET deadline.' };
    }
    return c;
  });

  return (
    <div>
      <Hero
        eyebrow={`Pipeline · Refreshed ${new Date(pipe.data.refreshed_at).toLocaleString()}`}
        title="Capital markets sources → Iceberg → multi-engine, end-to-end"
        subtitle="Seven Fivetran connectors land trading, clearing, regulatory, and member CDC rows into Iceberg (MDLS) on S3 — one copy of the bytes. Snowflake, Athena, and Trino all read the same Iceberg tables via external catalogs — no copies, no extracts. Triggered by Fivetran, dbt Labs flows bronze, silver, gold, platinum the moment each sync finishes. Toggle the failure simulator to see how a FIX-gateway outage cascades into a regulatory-submission risk."
        rightSlot={
          <button
            onClick={() => setSimulateFailure((v) => !v)}
            className={`px-4 py-2 font-mono text-xs uppercase tracking-wider font-bold border-2 ${
              simulateFailure
                ? 'bg-alert text-white border-alert'
                : 'bg-gold text-navy-900 border-gold hover:bg-gold-bright'
            }`}
          >
            {simulateFailure ? '◆ Stop simulating failure' : '◆ Simulate FIX gateway failure'}
          </button>
        }
      />

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="font-display text-xl text-white mb-4">Connectors</h2>
        <div className="term-card p-0 overflow-x-auto">
          <table className="spec-table">
            <thead>
              <tr>
                <th>Connector</th>
                <th>Schema (Fivetran)</th>
                <th>Source</th>
                <th>Status</th>
                <th>Last sync</th>
                <th>Rows / 24h</th>
                <th>Target</th>
                <th>Fivetran</th>
              </tr>
            </thead>
            <tbody>
              {connectors.map((c) => (
                <tr key={c.name}>
                  <td className="font-mono text-xs font-semibold">{c.name}</td>
                  <td className="font-mono text-[11px] text-gold-bright">{c.fivetran_id ?? '—'}</td>
                  <td className="text-sm">{c.source}</td>
                  <td><span className={`chip ${STATUS_CHIP[c.status] ?? 'navy'}`}>{c.status}</span></td>
                  <td className="font-mono text-xs tabular">{c.last_sync_minutes}m ago</td>
                  <td className="font-mono text-xs tabular">{c.rows_synced_24h.toLocaleString()}</td>
                  <td className="font-mono text-xs tabular">{c.latency_target_min}m</td>
                  <td>
                    {c.fivetran_url ? (
                      <a
                        href={c.fivetran_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider font-bold text-gold-bright hover:text-white whitespace-nowrap"
                      >
                        Open
                        <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                          <path d="M2 10L10 2M5 2h5v5" />
                        </svg>
                      </a>
                    ) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4">
          <a
            href="https://fivetran.com/dashboard/connectors"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gold text-navy-900 font-mono text-xs uppercase tracking-wider font-bold border-2 border-gold hover:bg-gold-bright transition-colors"
          >
            Open Fivetran connector dashboard
            <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M2 10L10 2M5 2h5v5" />
            </svg>
          </a>
        </div>
        {(simulateFailure || connectors.some((c) => c.note)) && (
          <div className="mt-3 space-y-2">
            {connectors.filter((c) => c.note).map((c) => (
              <div key={c.name} className={`term-card ${c.status === 'failed' ? 'alert' : 'warn'} p-3 text-sm`}>
                <span className="font-mono text-[10px] uppercase tracking-wider text-navy-200 mr-2">{c.name}</span>
                <span className="text-navy-100">{c.note}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
        <h2 className="font-display text-xl text-white mb-4">dbt layers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {pipe.data.layers.map((l) => {
            const failing = simulateFailure && l.layer === 'gold';
            return (
              <div key={l.layer} className={`term-card ${failing ? 'alert' : 'live'} p-4`}>
                <div className="flex items-center justify-between">
                  <span className={`chip ${l.layer === 'platinum' ? 'live' : l.layer === 'gold' ? 'gold' : 'navy'}`}>{l.layer}</span>
                  <span className={`chip ${failing ? 'alert' : 'live'}`}>{failing ? 'stale data' : l.status}</span>
                </div>
                <div className="mt-2 font-display text-lg text-white">{l.name}</div>
                <div className="mt-3 text-sm grid grid-cols-2 gap-1">
                  <div className="font-mono text-[11px] text-navy-200">Tables</div>
                  <div className="font-mono text-sm tabular text-right text-white">{l.tables}</div>
                  <div className="font-mono text-[11px] text-navy-200">Tests</div>
                  <div className="font-mono text-sm tabular text-right text-white">{l.tests_passing}/{l.tests_total}</div>
                  <div className="font-mono text-[11px] text-navy-200">Last run</div>
                  <div className="font-mono text-sm tabular text-right text-white">{failing ? '38m (stale)' : `${l.last_run_min}m`}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="font-display text-xl text-white mb-4">Recent dbt runs</h2>
        <div className="term-card p-0 overflow-x-auto">
          <table className="spec-table">
            <thead>
              <tr><th>Run ID</th><th>Model</th><th>Status</th><th>Duration</th><th>Rows</th><th>Started</th></tr>
            </thead>
            <tbody>
              {pipe.data.recent_runs.map((r) => (
                <tr key={r.run_id}>
                  <td className="font-mono text-xs">{r.run_id}</td>
                  <td className="font-mono text-xs">{r.model}</td>
                  <td><span className={`chip ${STATUS_CHIP[r.status] ?? 'navy'}`}>{r.status}</span></td>
                  <td className="font-mono text-xs tabular">{r.duration_s}s</td>
                  <td className="font-mono text-xs tabular">{r.rows.toLocaleString()}</td>
                  <td className="font-mono text-xs">{new Date(r.started_at).toLocaleTimeString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12">
        <div className="term-card gold p-5">
          <div className="eyebrow mb-2">Failure simulator</div>
          <p className="text-sm text-navy-100">{pipe.data.failure_sim.note}</p>
        </div>
      </section>
    </div>
  );
}
