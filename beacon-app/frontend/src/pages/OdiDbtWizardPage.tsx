import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import { useJSON } from '../api/data';
import { Loading, ErrorState } from '../components/Skeleton';

type Wizard = {
  scenario: {
    company: string;
    requested_by: string;
    request_id: string;
    question: string;
    target_model: string;
    target_grain: string;
    manual_time_days: string;
    build_room_seconds: number;
    risk_at_stake_usd: string;
    deadline: string;
  };
  upstream_models: { model: string; layer: string; grain: string; description: string }[];
  agents: { id: string; name: string; tools: string; color: string }[];
  steps: { n: number; agent: string; label: string; insight: string; note: string }[];
  outcome: {
    build_seconds: number;
    model_rows_per_day: number;
    tests_passing: number;
    downstream_consumers: string[];
    callout: string;
  };
};

export default function OdiDbtWizardPage() {
  const wiz = useJSON<Wizard>('wizard.json');
  const [activeStep, setActiveStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef<number | null>(null);

  // Auto-advance the playback when playing.
  useEffect(() => {
    if (!playing || !wiz.data) return;
    if (activeStep >= wiz.data.steps.length - 1) {
      setPlaying(false);
      return;
    }
    timerRef.current = window.setTimeout(() => setActiveStep((s) => s + 1), 2400);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [playing, activeStep, wiz.data]);

  if (wiz.loading) return <Loading label="Loading dbt-wizard playback…" />;
  if (wiz.error) return <ErrorState error={wiz.error} />;
  if (!wiz.data) return null;

  const { scenario, upstream_models, agents, steps, outcome } = wiz.data;
  const current = steps[activeStep];
  const currentAgent = agents.find((a) => current.agent.includes(a.name)) ?? agents[0];

  return (
    <div>
      <Hero
        eyebrow={`dbt-wizard · ${scenario.request_id}`}
        title="From CRO's question to a tested gold model in 92 seconds"
        subtitle={scenario.question}
        rightSlot={
          <div className="border-2 border-gold bg-navy-900/80 px-6 py-5 text-right">
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-gold-bright">dbt-wizard ETA</div>
            <div className="font-display text-5xl text-gold mt-1">{scenario.build_room_seconds}s</div>
            <div className="font-mono text-[11px] text-white/60 mt-1">manual: {scenario.manual_time_days}</div>
            <div className="font-mono text-[11px] text-gold-bright mt-1">{scenario.deadline}</div>
          </div>
        }
      />

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 term-card gold p-5">
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="font-display text-xl text-white">Live playback</h2>
            <div className="flex gap-2">
              <button
                onClick={() => { setActiveStep(0); setPlaying(true); }}
                className="px-3 py-1.5 font-mono text-xs uppercase tracking-wider font-bold bg-gold text-navy-900 hover:bg-gold-bright"
              >
                {playing ? '▶ playing' : '▶ play'}
              </button>
              <button
                onClick={() => setPlaying(false)}
                className="px-3 py-1.5 font-mono text-xs uppercase tracking-wider font-bold bg-navy-700 text-white border border-navy-500 hover:bg-navy-600"
              >
                ◼ pause
              </button>
              <button
                onClick={() => { setActiveStep(0); setPlaying(false); }}
                className="px-3 py-1.5 font-mono text-xs uppercase tracking-wider font-bold bg-navy-800 text-white border border-navy-500 hover:bg-navy-700"
              >
                ↺ reset
              </button>
            </div>
          </div>

          {/* Step rail */}
          <div className="grid grid-cols-6 gap-1.5 mb-4">
            {steps.map((st) => {
              const done = st.n < current.n;
              const active = st.n === current.n;
              const accent = active ? '#d4af37' : done ? '#10e88a' : '#1e3a5f';
              return (
                <button
                  key={st.n}
                  onClick={() => { setActiveStep(st.n - 1); setPlaying(false); }}
                  className="text-left p-2 bg-navy-800/50 border border-navy-700"
                  style={{ borderLeft: `3px solid ${accent}` }}
                >
                  <div className="font-mono text-[9px] uppercase tracking-wider" style={{ color: accent }}>
                    Step {String(st.n).padStart(2, '0')} · {done ? 'done' : active ? 'now' : 'wait'}
                  </div>
                  <div className="font-display text-xs text-white mt-0.5 truncate">{st.label}</div>
                </button>
              );
            })}
          </div>

          {/* Current step body */}
          <div className="bg-navy-900/80 border border-navy-700 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="h-9 w-9 flex items-center justify-center font-mono text-sm font-bold border"
                style={{ background: `${currentAgent.color}22`, color: currentAgent.color, borderColor: currentAgent.color }}
              >
                {currentAgent.name.slice(0, 1)}
              </div>
              <div>
                <div className="font-display text-lg text-white">{currentAgent.name}</div>
                <div className="font-mono text-[10px] uppercase tracking-wider" style={{ color: currentAgent.color }}>
                  {currentAgent.tools}
                </div>
              </div>
              <div className="ml-auto">
                <span className="chip gold">{current.insight}</span>
              </div>
            </div>
            <div className="font-display text-lg text-white mb-2">{current.label}</div>
            <p className="text-sm text-navy-100 leading-relaxed">{current.note}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="term-card live p-5">
            <div className="eyebrow mb-2">Target</div>
            <div className="font-mono text-sm text-gold-bright break-all">{scenario.target_model}</div>
            <div className="font-mono text-[11px] text-navy-200 mt-1 break-all">grain: {scenario.target_grain}</div>
          </div>
          <div className="term-card p-5">
            <div className="eyebrow mb-2">Requested by</div>
            <div className="font-display text-lg text-white">{scenario.requested_by}</div>
            <div className="font-mono text-[11px] text-navy-200 mt-1">{scenario.deadline}</div>
            <div className="mt-3 pt-3 border-t border-navy-700">
              <div className="eyebrow mb-1">At stake</div>
              <div className="font-display text-2xl text-gold-bright">${scenario.risk_at_stake_usd}</div>
              <div className="font-mono text-[11px] text-navy-200">VaR exposure left unmodeled</div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-8">
        <h2 className="font-display text-xl text-white mb-3">Upstream models the Worker joins</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {upstream_models.map((u) => (
            <div key={u.model} className="term-card p-4">
              <span className="chip dark">{u.layer}</span>
              <div className="font-mono text-sm text-white mt-2 break-all">{u.model}</div>
              <div className="font-mono text-[11px] text-navy-200 mt-1">grain: {u.grain}</div>
              <p className="text-xs text-navy-100 mt-2 leading-relaxed">{u.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12">
        <div className="term-card live p-5">
          <div className="grid grid-cols-1 md:grid-cols-[auto,1fr] gap-6 items-center">
            <div>
              <div className="eyebrow mb-1">Outcome</div>
              <div className="font-display text-5xl text-gold-bright tabular">{outcome.build_seconds}s</div>
              <div className="font-mono text-[11px] text-navy-200">total wall-clock</div>
            </div>
            <div>
              <p className="text-base text-white leading-relaxed">{outcome.callout}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {outcome.downstream_consumers.map((c) => (
                  <span key={c} className="chip live">{c}</span>
                ))}
              </div>
              <div className="mt-3 flex gap-4 font-mono text-xs text-navy-100">
                <span>rows/day: <span className="text-gold-bright tabular">{outcome.model_rows_per_day.toLocaleString()}</span></span>
                <span>tests: <span className="text-gold-bright tabular">{outcome.tests_passing}/{outcome.tests_passing}</span></span>
              </div>
            </div>
          </div>
          <div className="mt-5 pt-4 border-t border-navy-700 flex flex-wrap gap-3">
            <Link to="/pipeline" className="inline-flex items-center gap-2 font-semibold text-sm px-4 py-2 bg-gold text-navy-900 hover:bg-gold-bright transition-colors">
              See the pipeline →
            </Link>
            <Link to="/architecture" className="inline-flex items-center gap-2 font-semibold text-sm px-4 py-2 border border-navy-500 bg-navy-800 hover:bg-navy-700 text-white transition-colors">
              Architecture overview
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
