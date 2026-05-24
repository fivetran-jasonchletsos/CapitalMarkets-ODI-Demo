import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';

const NAV_ITEMS: [string, string][] = [
  ['/', 'Trading Floor'],
  ['/markets', 'Markets'],
  ['/surveillance', 'Surveillance'],
  ['/risk', 'Risk & Clearing'],
  ['/regulatory', 'Regulatory'],
  ['/architecture', 'ODI Architecture'],
  ['/pipeline', 'Pipeline'],
  ['/dbt-wizard', 'dbt-wizard'],
  ['/about', 'About'],
];

const DEMOS = [
  { key: 'tax-assessment',  name: 'Allegheny County Tax', industry: 'Public sector · Property assessment',     url: 'https://fivetran-jasonchletsos.github.io/tax-assessment-databricks-demo/', accent: '#dc2626' },
  { key: 'healthcare',      name: 'Epic Clarity',         industry: 'Healthcare · Clinical analytics',          url: 'https://fivetran-jasonchletsos.github.io/Healthcare-EPIC-Snowflake-Demo/', accent: '#0d9488' },
  { key: 'finserv',         name: 'Altavest Capital',     industry: 'Financial Services · Wealth & banking',    url: 'https://fivetran-jasonchletsos.github.io/FinServ-ODI-Demo/', accent: '#1d4ed8' },
  { key: 'insurance',       name: 'Atlas Risk',           industry: 'Insurance · Policies, claims, reinsurance', url: 'https://fivetran-jasonchletsos.github.io/Insurance-ODI-Demo/', accent: '#0369a1' },
  { key: 'media',           name: 'Lighthouse Media',     industry: 'Media · Audience intelligence',            url: 'https://fivetran-jasonchletsos.github.io/Media-ODI-Demo/', accent: '#7c3aed' },
  { key: 'retail',          name: 'Storefront Analytics', industry: 'Retail & e-commerce',                       url: 'https://fivetran-jasonchletsos.github.io/RetailEcom-ODI-Demo/', accent: '#ea580c' },
  { key: 'techsaas',        name: 'SaaS Pulse',           industry: 'Tech · SaaS analytics',                     url: 'https://fivetran-jasonchletsos.github.io/TechSaaS-ODI-Demo/', accent: '#059669' },
  { key: 'supplychain',     name: 'Manifest',             industry: 'Supply chain · Logistics',                  url: 'https://fivetran-jasonchletsos.github.io/SupplyChain-ODI-Demo/', accent: '#0891b2' },
  { key: 'lifesci',         name: 'Cohort',               industry: 'Life sciences · Clinical research',         url: 'https://fivetran-jasonchletsos.github.io/LifeSci-ODI-Demo/', accent: '#be185d' },
  { key: 'manufacturing',   name: 'Vantex Manufacturing', industry: 'Manufacturing · Auto-parts (Tier-1)',       url: 'https://fivetran-jasonchletsos.github.io/Manufacturing-ODI-Demo/', accent: '#ffd60a' },
  { key: 'capitalmarkets',  name: 'Beacon Markets',       industry: 'Capital Markets · Derivatives exchange',    url: 'https://fivetran-jasonchletsos.github.io/CapitalMarkets-ODI-Demo/', accent: '#d4af37' },
  { key: 'mission-control', name: 'Mission Control',      industry: 'Admin · Governance + observability',       url: 'https://fivetran-jasonchletsos.github.io/ODI-Mission-Control/', accent: '#22d3ee' },
];
const CURRENT_DEMO = 'capitalmarkets';

const TICKER_ITEMS = [
  { sym: 'ZB',    label: '30Y T-Bond',     px: '118-12', d: '+12/32',  up: true  },
  { sym: 'CL',    label: 'WTI Crude',      px: '78.42',  d: '+0.62',   up: true  },
  { sym: 'ZC',    label: 'Corn',           px: '442.25', d: '-3.50',   up: false },
  { sym: 'ES',    label: 'E-Mini S&P',     px: '5,284.50', d: '+18.25', up: true },
  { sym: 'SR3',   label: 'SOFR 3M',        px: '95.485', d: '+0.015',  up: true  },
  { sym: 'NG',    label: 'Nat Gas',        px: '2.872',  d: '-0.041',  up: false },
  { sym: 'ZW',    label: 'Wheat',          px: '672.00', d: '+8.25',   up: true  },
  { sym: 'GC',    label: 'Gold',           px: '2,389.20', d: '+12.40', up: true },
  { sym: 'NQ',    label: 'Nasdaq-100',     px: '18,742.25', d: '+45.75', up: true},
  { sym: 'HO',    label: 'Heating Oil',    px: '2.456',  d: '-0.018',  up: false },
];

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  return (
    <div className="min-h-full flex flex-col bg-ink">
      <div className="gold-rail" />

      <header className="bg-navy-900/95 backdrop-blur text-white sticky top-0 z-30 border-b border-navy-700">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          <div className="flex h-16 sm:h-20 items-center justify-between gap-3 sm:gap-6">
            <Link to="/" className="flex items-center gap-3 shrink-0 min-w-0">
              <div className="h-11 w-11 flex items-center justify-center bg-navy-700 border border-gold">
                <BeaconMark className="h-7 w-7 text-gold" />
              </div>
              <div className="leading-tight min-w-0">
                <div className="font-display text-xl sm:text-2xl tracking-tight truncate text-white">
                  Beacon Markets
                </div>
                <div className="mt-0.5 text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.16em] text-gold-bright">
                  Derivatives Exchange Intelligence
                </div>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-0.5 text-sm">
              {NAV_ITEMS.map(([to, label]) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    `relative px-2.5 py-2 font-semibold tracking-tight text-[13px] transition-colors ${
                      isActive ? 'text-gold-bright' : 'text-white/80 hover:text-white'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {label}
                      {isActive && <span className="absolute left-2.5 right-2.5 -bottom-[1px] h-[2px] bg-gold" />}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <DemoSwitcher />
              <button
                type="button"
                onClick={() => setMobileOpen((o) => !o)}
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                className="lg:hidden h-10 w-10 inline-flex items-center justify-center text-white hover:bg-white/10"
              >
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.25">
                  {mobileOpen ? <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" /> : <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />}
                </svg>
              </button>
            </div>
          </div>

          {mobileOpen && (
            <div className="lg:hidden pb-4 border-t border-white/10 pt-3">
              <nav className="grid grid-cols-2 gap-1 text-sm">
                {NAV_ITEMS.map(([to, label]) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={to === '/'}
                    className={({ isActive }) =>
                      `px-3 py-2 text-center font-semibold border ${
                        isActive
                          ? 'bg-gold text-navy-900 border-gold'
                          : 'border-white/15 text-white/85 hover:bg-white/10'
                      }`
                    }
                  >
                    {label}
                  </NavLink>
                ))}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Ticker tape */}
      <div className="ticker-tape">
        <div className="ticker-track">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((t, i) => (
            <span key={i} className="ticker-item">
              <span className="sym">{t.sym}</span>
              <span className="text-navy-200 mr-2">{t.label}</span>
              <span className="text-white mr-2">{t.px}</span>
              <span className={t.up ? 'up' : 'dn'}>{t.d}</span>
            </span>
          ))}
        </div>
      </div>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-navy-700 bg-navy-900 text-white/80 mt-16">
        <div className="gold-rail" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-7 w-7 flex items-center justify-center bg-navy-700 border border-gold">
                <BeaconMark className="h-4 w-4 text-gold" />
              </div>
              <div className="font-display text-white text-lg tracking-tight">Beacon Markets</div>
            </div>
            <p className="leading-relaxed text-white/60">
              Multi-asset-class derivatives exchange. Rates, energy, agriculture, equities.
              Chicago HQ with New York and London hubs.
              Synthetic data — ODI architecture demonstration only. Not a real exchange.
            </p>
          </div>
          <div>
            <div className="text-[11px] font-mono uppercase tracking-[0.16em] text-gold-bright mb-2">Data Pipeline</div>
            <p className="leading-relaxed text-white/70">
              FIX gateway, market data handlers, clearinghouse, CFTC EDGAR, Salesforce member CRM
              into Fivetran, then Iceberg (MDLS) on S3, then Snowflake / Athena / Trino reading the
              same bytes via external catalogs, then Fivetran-triggered dbt Labs (bronze, silver,
              gold), then static JSON snapshot to React.
            </p>
          </div>
          <div>
            <div className="text-[11px] font-mono uppercase tracking-[0.16em] text-gold-bright mb-2">Open Standards</div>
            <p className="leading-relaxed text-white/70">
              Apache Iceberg v2, Snowflake Horizon catalog, ANSI SQL, dbt semantic layer.
              FIX 4.4/5.0 message gateway joined to clearing and regulatory data. Any compute engine.
            </p>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 text-[11px] text-white/50 flex flex-col sm:flex-row gap-1 sm:items-center sm:justify-between">
            <div>© 2026 Beacon Markets ODI Demo · Fivetran Open Data Infrastructure</div>
            <div>Synthetic snapshot · For Capital Markets walkthrough</div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function DemoSwitcher() {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className="relative hidden sm:block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-mono font-bold uppercase tracking-wider border border-gold/40 bg-gold/15 text-gold-bright hover:bg-gold/25"
      >
        <span className="live-dot" />
        Snapshot
        <svg viewBox="0 0 24 24" className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-full mt-2 w-[300px] border border-navy-600 bg-navy-800 shadow-2xl z-40">
          <div className="px-3 pt-3 pb-2 text-[10px] font-mono font-bold uppercase tracking-[0.16em] text-navy-200 border-b border-navy-700">
            Switch demo
          </div>
          <div className="py-1 max-h-96 overflow-y-auto">
            {DEMOS.map((d) => {
              const current = d.key === CURRENT_DEMO;
              const inner = (
                <div className="flex items-center gap-2.5 px-3 py-2">
                  <span className="h-2.5 w-2.5 shrink-0" style={{ background: d.accent }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-white truncate">{d.name}</div>
                    <div className="text-[11px] text-navy-200 truncate">{d.industry}</div>
                  </div>
                  {current && (
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 bg-navy-700 text-gold-bright border border-navy-600">
                      Current
                    </span>
                  )}
                </div>
              );
              return current ? (
                <div key={d.key} className="opacity-60 cursor-default">{inner}</div>
              ) : (
                <a key={d.key} href={d.url} className="block hover:bg-navy-700" onClick={() => setOpen(false)}>
                  {inner}
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function BeaconMark({ className = '' }: { className?: string }) {
  // Stylized lighthouse beacon
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden>
      <path d="M12 2 L8 22 L16 22 Z" strokeLinejoin="round" />
      <circle cx="12" cy="8" r="2.5" fill="currentColor" stroke="none" />
      <path d="M5 7 L8.5 7.8 M19 7 L15.5 7.8 M6 11 L8.5 11 M18 11 L15.5 11" strokeLinecap="round" />
    </svg>
  );
}
