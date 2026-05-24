import Hero from '../components/Hero';

export default function AboutPage() {
  return (
    <div>
      <Hero
        eyebrow="ODI Reference Build · Capital Markets"
        title="About Beacon Markets"
        subtitle="A reference build that shows how a multi-asset-class derivatives exchange can run trading, surveillance, clearing, and regulatory reporting on Fivetran's Open Data Infrastructure: capital-markets sources → Fivetran → Iceberg (MDLS) → Snowflake / Athena / Trino → dbt Labs → React. FIX order/execution data joined to market data, clearinghouse, CFTC, FINRA, and member CRM, landed in an open Iceberg lake, read by multiple engines on the same bytes, transformed by dbt, exposed to humans and agents through one governed semantic layer."
      />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
        <section className="term-card gold p-6 mb-10">
          <div className="eyebrow mb-2">The ODI Story</div>
          <h2 className="font-display text-2xl text-white">
            Data infrastructure for agents you trust.
          </h2>
          <p className="mt-3 text-navy-100 leading-relaxed">
            <em>"MDS was optimized for humans. ODI is designed for a future with humans and
            production agents at scale."</em> This demo is one instance of that architecture:
            Fivetran's 750+ connectors and Managed Data Lake Service (MDLS) land FIX, clearing,
            and regulatory CDC rows into Iceberg on S3 — one copy of the bytes. Snowflake,
            Athena, and Trino read the same Iceberg tables via external catalogs (no copies,
            no extracts). Fivetran Transformations triggers dbt Labs the moment each sync
            finishes; bronze, silver, gold, platinum materialization stays in Iceberg, and
            multiple compute engines and AI agents read the same gold tables.
          </p>
          <a
            href="https://fivetran-jasonchletsos.github.io/Fivetran-Demo-Repository/story/"
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-1 font-mono text-xs uppercase tracking-wider font-bold text-gold-bright hover:text-white"
          >
            Read the full ODI Story →
          </a>
        </section>

        <section className="mb-10">
          <h2 className="font-display text-2xl text-white border-b border-gold pb-2 mb-4">What this demo shows</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PILLARS.map((p) => (
              <div key={p.title} className="term-card p-5">
                <div className="chip dark inline-flex mb-3">{p.tag}</div>
                <h3 className="font-display text-lg text-white">{p.title}</h3>
                <p className="mt-2 text-sm text-navy-100 leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-10">
          <h2 className="font-display text-2xl text-white border-b border-gold pb-2 mb-4">Why capital markets are hard</h2>
          <div className="term-card p-6">
            <p className="text-navy-100 leading-relaxed">
              A derivatives exchange generates data in places that don't talk to each other on the
              right cadence: the FIX gateway streams orders and executions in microseconds; the
              match engine emits trade prints; the clearinghouse stages positions T+0 but settles
              T+1; CFTC and FINRA filings happen on regulatory cadences; the Salesforce member CRM
              owns KYC and onboarding. The on-prem Striim pipeline that used to bridge these is
              brittle, expensive, and opaque. ODI replaces it — Fivetran lands all seven into
              Iceberg in the same warehouse, and dbt joins them into a single trade-event,
              order-lifecycle, surveillance, and clearing-position grain that an exchange-ops
              director, a risk officer, a surveillance analyst, and a Cortex agent can all read.
            </p>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="bg-navy-800/60 border border-navy-700 p-3">
                <div className="font-mono text-[10px] uppercase tracking-wider text-navy-200 mb-1">Before ODI (on-prem Striim)</div>
                <ul className="space-y-1 text-navy-100">
                  <li>· Surveillance reviews FIX dumps from yesterday's tape</li>
                  <li>· Risk officer joins clearing CSV exports to a SAS extract</li>
                  <li>· Part 45 SDR submissions are a Tibco BW job — opaque when it breaks</li>
                  <li>· Cortex / agents have no consistent semantic layer to query</li>
                </ul>
              </div>
              <div className="bg-navy-800/80 border-2 border-gold p-3">
                <div className="font-mono text-[10px] uppercase tracking-wider text-gold-bright mb-1">With ODI</div>
                <ul className="space-y-1 text-navy-100">
                  <li>· One semantic layer for orders, trades, quotes, clearing, regulatory</li>
                  <li>· FIX stream lands in Iceberg with sub-second freshness</li>
                  <li>· Agents read gold tables — same numbers the risk committee sees</li>
                  <li>· CFTC SDR submission is a dbt model, not a black-box Tibco BW job</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="font-display text-2xl text-white border-b border-gold pb-2 mb-4">Tech stack</h2>
          <div className="term-card p-5">
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              {STACK.map((s) => (
                <li key={s.name} className="flex items-start gap-3">
                  <div className="chip navy shrink-0 mt-0.5">{s.layer}</div>
                  <div className="min-w-0">
                    <div className="font-display text-base text-white">{s.name}</div>
                    <div className="text-xs text-navy-200">{s.note}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="font-display text-2xl text-white border-b border-gold pb-2 mb-4">Data sources</h2>
          <div className="space-y-3">
            {DATA_SOURCES.map((s) => (
              <article key={s.title} className="term-card p-5">
                <div className="flex items-start gap-3">
                  <span className="chip dark shrink-0">Source</span>
                  <div className="min-w-0">
                    <h3 className="font-display text-lg text-white">{s.title}</h3>
                    <p className="mt-1 text-sm text-navy-100 leading-relaxed">{s.description}</p>
                    <div className="mt-2 text-xs text-navy-200">
                      <span className="font-mono font-bold uppercase tracking-wider text-[10px]">Provides:</span> {s.provides}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-navy-800 border border-navy-600 p-6">
          <div className="eyebrow mb-2">Disclaimer</div>
          <p className="text-navy-100 leading-relaxed text-sm">
            <strong className="text-gold-bright">All data shown is synthetic.</strong>{' '}
            Beacon Markets is a fictional multi-asset-class derivatives exchange modeled on the
            structure of real-world futures and options venues. No real exchange, member, trader,
            order, or trade data is included. This site exists to demonstrate the Fivetran ODI
            architecture pattern.
          </p>
        </section>
      </div>
    </div>
  );
}

const PILLARS = [
  {
    tag: 'Pillar 1',
    title: 'Customer-owned storage',
    body: 'Every byte of FIX, market-data, clearing, and regulatory data lands in Beacon\'s S3 bucket as Apache Iceberg tables (MDLS) — one copy of the bytes. Fivetran writes; Snowflake, Athena, and Trino all read the same Iceberg tables via external catalogs (no copies, no extracts).',
  },
  {
    tag: 'Pillar 2',
    title: 'Open table format',
    body: 'Iceberg v2 gives Beacon ACID transactions on streaming order data, schema evolution across FIX 4.4 to 5.0, and time-travel for any regulatory replay or surveillance back-test.',
  },
  {
    tag: 'Pillar 3',
    title: 'Agents read gold tables',
    body: 'The Cortex agent, the surveillance app, and the dbt-wizard sub-agents read the same gold tables the risk committee sees. One semantic layer for humans and agents.',
  },
];

const STACK = [
  { layer: 'Ingest',    name: 'Fivetran',                       note: 'FIX gateway, market data feed handler, clearinghouse, CFTC EDGAR, FINRA, Salesforce CRM, reference data' },
  { layer: 'Storage',   name: 'Amazon S3',                      note: 'beacon-odi-lake bucket — bronze, silver, gold, platinum prefixes' },
  { layer: 'Format',    name: 'Apache Iceberg v2',              note: 'Parquet + ZSTD compression, partitioned by trade_date and product_id' },
  { layer: 'Catalog',   name: 'Snowflake Horizon',              note: 'Iceberg REST catalog + tag-based access control by desk and asset class' },
  { layer: 'Query',     name: 'Snowflake / Athena / Trino',     note: 'All three engines read the same Iceberg bytes via external catalogs — no copies, no extracts' },
  { layer: 'Transform', name: 'dbt Labs (Snowflake adapter)',    note: 'Triggered by Fivetran Transformations the moment each sync finishes · Bronze, silver, gold, platinum · 351 models, 960 tests' },
  { layer: 'Agents',    name: 'dbt-wizard Sub-agents',          note: 'Read platinum.sem_market_intel, author missing gold models in 92s' },
  { layer: 'Frontend',  name: 'React 18 + Vite + Tailwind 3',   note: 'Static SPA on GitHub Pages, reads JSON snapshot, Recharts' },
];

const DATA_SOURCES = [
  {
    title: 'FIX 4.4/5.0 message gateway',
    description: 'The order and execution stream. Every NewOrderSingle, OrderCancelRequest, ExecutionReport from member firms\' trading systems lands here first. Sub-millisecond latency end to end.',
    provides: 'Orders · cancels · executions · session-level events',
  },
  {
    title: 'Market data feed handler',
    description: 'Inbound consolidated quote and trade tape from Refinitiv and Bloomberg, plus Beacon\'s internal best-bid-offer book. The price physics behind every alert and risk calc.',
    provides: 'Quote snapshots (1s) · trade prints · best-bid-offer book',
  },
  {
    title: 'Clearinghouse',
    description: 'Cleared-trade events, novation status, margin postings, and end-of-day positions per clearing member. Replaces the legacy nightly CSV export with continuous Iceberg refresh.',
    provides: 'Cleared trades · margin postings · positions · novations',
  },
  {
    title: 'CFTC EDGAR + FINRA filings',
    description: 'Regulatory filings: CFTC Part 45 SDR submissions, Part 43 real-time tape, FINRA CAT order-lifecycle reports, SEC 13H large-trader filings, OFAC screening lists.',
    provides: 'Submission ack/reject · large-trader IDs · OFAC matches',
  },
  {
    title: 'Salesforce member CRM',
    description: 'Member onboarding, KYC, parent-FCM hierarchy, contact data, support tickets. Joins to the clearing-member dimension and powers the risk-officer\'s member-by-member views.',
    provides: 'Member accounts · KYC · parent hierarchy · entitlements',
  },
  {
    title: 'Reference data',
    description: 'CUSIP, ISIN, contract specifications, expiration calendar, tick size, multiplier, last-trade rules. The dimension that joins everything together.',
    provides: 'Product reference · expirations · tick / multiplier rules',
  },
];
