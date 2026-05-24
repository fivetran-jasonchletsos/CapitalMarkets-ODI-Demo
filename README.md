# Capital Markets ODI Demo — Beacon Markets

Reference build showing how a multi-asset-class derivatives exchange can run
trading, surveillance, clearing, and regulatory reporting on Fivetran's Open
Data Infrastructure. FIX order and execution data joined to market data,
clearinghouse, CFTC, FINRA, and member CRM, landed in an open Iceberg lake
on S3, transformed by dbt, exposed to humans and agents through one governed
semantic layer.

**Live:** https://fivetran-jasonchletsos.github.io/CapitalMarkets-ODI-Demo/

## The fictional company

**Beacon Markets** is a multi-asset-class derivatives exchange listing rates,
energy, agriculture, and equity-index futures and options. Headquartered in
Chicago with NYC and London hubs. ~5M average daily contract volume, $3.05B
annual revenue, 142 clearing members. All data on this site is synthetic.

## Pages

- **Trading Floor (Home)** — KPI tiles (ADV, txn-fee revenue, OI, p99 latency), 30-day volume trend, top 3 anomalies
- **Markets** — products and volume by asset class, market share by venue, intraday curve (CEO scenario)
- **Surveillance** — spoofing, layering, wash-trade alerts, top 5 patterns, false-positive trend (CRO scenario)
- **Risk & Clearing** — VaR, margin utilization, collateral concentration, top members by exposure (CFO + CRO)
- **Regulatory** — CFTC Part 45/43, FINRA CAT, SEC 13H status; end-to-end lineage trace for a single trade
- **ODI Architecture** — lineage nodes by layer, edges, downstream consumers (CTO/CDO scenario)
- **Pipeline** — Fivetran connector status, dbt layers, FIX-gateway failure simulator
- **dbt-wizard** — Build-time AI playback: CRO asks for intraday OI concentration, gold model authored in 92 seconds
- **About** — the canonical ODI Story block, tech stack, data sources

## C-level scenarios

- **CEO** — market share by product, ADV trends, competitor positioning (Markets)
- **CFO** — transaction-fee revenue, collateral utilization, clearing margin (Risk & Clearing + Home)
- **CTO/CDO** — replacing on-prem Striim, sub-millisecond FIX freshness, regulatory data lineage (Architecture + Pipeline)
- **Chief Risk Officer** — VaR, position concentration, spoofing and wash surveillance (Risk + Surveillance)

## Architecture

End-to-end flow: **Capital-markets sources → Fivetran → Iceberg (MDLS) → Snowflake / Athena / Trino → dbt Labs → React.**

1. **Capital-markets sources** — FIX 4.4/5.0 gateway, market data feed handler, clearinghouse, CFTC EDGAR, FINRA filings, Salesforce CRM, reference data.
2. **Fivetran** — 7 connectors (jason_chletsos_ schemas) land every CDC row into Iceberg.
3. **Iceberg (MDLS) on S3** — one copy of the bytes in open Apache Iceberg v2 format; bronze, silver, gold, platinum prefixes.
4. **Snowflake / Athena / Trino** — all three engines read the same Iceberg bytes via external table catalogs (no copies, no extracts).
5. **dbt Labs** — Fivetran Transformations triggers dbt the moment each sync finishes; bronze → silver → gold → platinum materialization stays in Iceberg (351 models, 960 tests).
6. **React** — static SPA reads the JSON snapshot derived from gold/platinum.

```
FIX 4.4/5.0 gateway · Market data feed handler · Clearinghouse
CFTC EDGAR · FINRA filings · Salesforce CRM · Reference data
              │
              ▼  Fivetran (7 connectors, jason_chletsos_ schemas)
              │
   ┌──────────────────────────────────────┐
   │  Iceberg (MDLS) on S3                │
   │  Apache Iceberg v2                   │
   │  bronze · silver · gold · platinum   │
   └──────────────────────────────────────┘
              │
              ▼  External Iceberg reads (same bytes, no copies)
              │
   ┌──────────────────────────────────────┐
   │  Snowflake · AWS Athena · Trino      │
   └──────────────────────────────────────┘
              │
              ▼  dbt Labs — triggered by Fivetran (351 models, 960 tests)
              │
   ┌──────────────────────────────────────┐
   │  Tableau · Power BI · Cortex Agents  │
   │  Surveillance app · dbt-wizard       │
   │  React SPA (this site)               │
   └──────────────────────────────────────┘
```

## Build locally

```bash
cd beacon-app/frontend
npm install
npm run dev
```

Vite serves at http://localhost:5173/CapitalMarkets-ODI-Demo/. To preview
at root, set `VITE_BASE=/`.

## Deploy

Push to `main`; the `deploy.yml` workflow builds and publishes to GitHub
Pages.

---
Synthetic data only. No real exchange, member, trader, or trade data.
