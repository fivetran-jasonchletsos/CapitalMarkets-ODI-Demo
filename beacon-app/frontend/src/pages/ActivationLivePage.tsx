/*
 * ActivationLivePage — NewCo Activations live-sync playback for Beacon Markets.
 *
 * Terminal-styled live sync playback: Segment Definition -> Field Mapping ->
 * Sync Preview -> API Push -> Destination Confirmation. Fully self-contained —
 * all types and content live inline as local consts (no fetch, no public/data
 * JSON, no imports of components that don't exist in this app).
 *
 * Vertical scenario: a critical, repeat-member spoofing alert lands in
 * gold.fct_alert_evidence. The moment severity = 'critical' AND
 * pattern_confidence_score >= 0.85 AND the member is already on the
 * members-under-review list, Activations syncs the row straight into NICE
 * Actimize Case Manager and auto-opens a fully populated investigation case.
 */

import React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

// ─── Types (inline — mirrors the shape used across the ODI demo portfolio) ──

type ActivationAgentId = 'segment' | 'mapper' | 'sync';

interface ActivationAgent {
  id: ActivationAgentId;
  name: string;
  code: string;
  color: string;
  role: string;
}

type ActivationCodeTarget = 'sql' | 'json';

interface ActivationEvent {
  from: ActivationAgentId;
  step: number; // 1..5
  step_label: string;
  body: string; // narration, typed char-by-char
  side_effect?: string;
  code_target?: ActivationCodeTarget;
  code_append?: string;
}

interface ActivationScenario {
  company: string;
  request_id: string;
  requested_by: string;
  timezone_label: string;
  question: string;
  source_model: string;
  destination_system: string;
  destination_object: string;
  sync_mode: 'upsert' | 'insert' | 'update';
}

interface ActivationRecord {
  key: string;
  fields: Record<string, string | number>;
  status: 'created' | 'updated' | 'skipped';
}

// Timing constants — scale by speed control.
const NARR_TYPE_MS = 14;
const CODE_TYPE_MS = 4;
const POST_NARR_DELAY_MS = 550;
const POST_CODE_DELAY_MS = 350;
const SPEEDS = [1, 2, 4] as const;

const ACCENT = '#22d3ee';

interface RevealState {
  cursor: number;
  narrTyped: number;
  codeTyped: number;
  sideEffects: string[];
}

const INITIAL: RevealState = { cursor: 0, narrTyped: 0, codeTyped: 0, sideEffects: [] };

const STEP_DEFS = [
  { label: 'Segment Definition',       who: 'Segment', tools: 'gold query',       insight: '1 alert matched' },
  { label: 'Field Mapping',            who: 'Mapper',  tools: 'schema map',       insight: '5 fields mapped' },
  { label: 'Sync Preview',             who: 'Mapper',  tools: 'diff preview',     insight: '1 insert · 7 unchanged' },
  { label: 'API Push',                 who: 'Sync',    tools: 'REST push',        insight: '1 case sent' },
  { label: 'Destination Confirmation', who: 'Sync',    tools: 'destination read', insight: '1 landed · 0 errors' },
];

// ─── Vertical-specific scenario content (critical spoofing alert → Actimize) ─

const ACTIVATION_SCENARIO: ActivationScenario = {
  company: 'Beacon Markets',
  request_id: 'ALT-2026-58841',
  requested_by: 'Surveillance Pattern Monitor',
  timezone_label: 'ET',
  question: 'Open a fully populated Actimize case the instant a critical, repeat-member alert lands — no analyst re-keying.',
  source_model: 'gold.fct_alert_evidence',
  destination_system: 'NICE Actimize Case Manager',
  destination_object: 'Case',
  sync_mode: 'insert',
};

const ACTIVATION_AGENTS: ActivationAgent[] = [
  { id: 'segment', name: 'Segment', code: 'SEG', color: '#22d3ee', role: 'Defines the gold-layer trigger query' },
  { id: 'mapper',  name: 'Mapper',  code: 'MAP', color: '#f0c948', role: 'Maps gold columns to destination fields' },
  { id: 'sync',    name: 'Sync',    code: 'SYN', color: '#10e88a', role: 'Pushes the payload and confirms landing' },
];

const ACTIVATION_SCRIPT: ActivationEvent[] = [
  {
    from: 'segment',
    step: 1,
    step_label: 'Segment Definition',
    body: "Watching gold.fct_alert_evidence for one condition: severity = 'critical', pattern_confidence_score >= 0.85, and the member already on the members-under-review list. Halcyon FCM just tripped it — layered-cancels spoofing in ZB futures, third critical alert this week, confidence 0.91.",
    side_effect: 'gold.fct_alert_evidence · threshold crossed · ALT-2026-58841',
    code_target: 'sql',
    code_append:
      "select\n  alert_id,\n  member_id,\n  pattern_type,\n  pattern_confidence_score,\n  evidence_uri\nfrom gold.fct_alert_evidence\nwhere severity = 'critical'\n  and pattern_confidence_score >= 0.85\n  and member_id in (\n    select member_id from gold.dim_members_under_review\n  );",
  },
  {
    from: 'mapper',
    step: 2,
    step_label: 'Field Mapping',
    body: "Field Mapping translates the governed gold columns straight into Actimize Case Manager's case schema — no custom API integration, no analyst in the loop.",
    side_effect: 'mapping · 5 fields → Actimize Case',
    code_target: 'json',
    code_append: JSON.stringify(
      {
        destination: 'NICE Actimize Case Manager',
        object: 'Case',
        field_map: {
          alert_id: 'case_external_id',
          member_id: 'subject_party_id',
          pattern_confidence_score: 'risk_score',
          evidence_uri: 'evidence_attachment_url',
          pattern_type: 'typology_code',
        },
      },
      null,
      2,
    ),
  },
  {
    from: 'mapper',
    step: 3,
    step_label: 'Sync Preview',
    body: 'Sync Preview diffs against Actimize before anything pushes: 1 new case to open, 7 already-reviewed alerts unchanged.',
    side_effect: 'diff · 1 insert · 7 unchanged',
    code_target: 'json',
    code_append: JSON.stringify({ to_insert: 1, unchanged: 7, to_update: 0 }, null, 2),
  },
  {
    from: 'sync',
    step: 4,
    step_label: 'API Push',
    body: 'API Push sends the payload straight into Actimize Case Manager — no manual re-keying of member ID, order IDs, or evidence links.',
    side_effect: 'POST /v1/cases · Actimize · 202 accepted',
    code_target: 'json',
    code_append: JSON.stringify(
      {
        case_external_id: 'ALT-2026-58841',
        subject_party_id: 'MBR-HALCYON-FCM',
        risk_score: 91,
        evidence_attachment_url: 's3://beacon-odi-lake/evidence/ALT-2026-58841.pdf',
        typology_code: 'SPOOFING_LAYERED_CANCELS',
      },
      null,
      2,
    ),
  },
  {
    from: 'sync',
    step: 5,
    step_label: 'Destination Confirmation',
    body: "Destination Confirmation: case ALT-2026-58841 landed in Actimize in under 30 seconds. Today an analyst opens Actimize, keys in the alert ID, member ID, order IDs, pastes an evidence link — call it 12 minutes. Times 18 critical alerts a day, that's 3-plus analyst-hours gone before anyone investigates anything. Zero manual entry, zero re-typed order IDs, and the audit trail proves the case opened within seconds of detection.",
    side_effect: 'Actimize Case Manager · case opened · 0 errors',
  },
];

const ACTIVATION_RECORDS: ActivationRecord[] = [
  {
    key: 'ALT-2026-58841',
    fields: {
      'Subject': 'Halcyon FCM',
      'Risk Score': 91,
      'Typology': 'Spoofing — layered cancels',
      'Evidence': 'attached',
    },
    status: 'created',
  },
  {
    key: 'ALT-2026-58834',
    fields: {
      'Subject': 'Pediment Partners',
      'Risk Score': 88,
      'Typology': 'Spoofing — layered cancels',
      'Evidence': 'attached',
    },
    status: 'created',
  },
  {
    key: 'ALT-2026-58840',
    fields: {
      'Subject': 'Crestline Energy',
      'Risk Score': 62,
      'Typology': 'Wash trades',
      'Evidence': '—',
    },
    status: 'skipped',
  },
  {
    key: 'ALT-2026-58839',
    fields: {
      'Subject': 'Pediment Partners',
      'Risk Score': 58,
      'Typology': 'Quote stuffing',
      'Evidence': '—',
    },
    status: 'skipped',
  },
  {
    key: 'ALT-2026-58838',
    fields: {
      'Subject': 'Northgate Sec.',
      'Risk Score': 41,
      'Typology': 'Marking the close',
      'Evidence': '—',
    },
    status: 'skipped',
  },
  {
    key: 'ALT-2026-58837',
    fields: {
      'Subject': 'Altavest Capital',
      'Risk Score': 77,
      'Typology': 'Spoofing — layered cancels',
      'Evidence': '—',
    },
    status: 'skipped',
  },
  {
    key: 'ALT-2026-58836',
    fields: {
      'Subject': 'Halcyon FCM',
      'Risk Score': 53,
      'Typology': 'Cross-product manipulation',
      'Evidence': '—',
    },
    status: 'skipped',
  },
  {
    key: 'ALT-2026-58835',
    fields: {
      'Subject': 'Crestline Energy',
      'Risk Score': 31,
      'Typology': 'Wash trades',
      'Evidence': '—',
    },
    status: 'skipped',
  },
];

// ─── Destination confirmation payoff table ──────────────────────────────────

function DestinationConfirmationTable({ scenario, records }: { scenario: ActivationScenario; records: ActivationRecord[] }) {
  const cols = Object.keys(records[0]?.fields ?? {});
  return (
    <div className="mt-4 term-card overflow-hidden" style={{ borderLeftColor: ACCENT }}>
      <header className="px-5 py-3 border-b border-navy-700 flex items-center justify-between flex-wrap gap-2">
        <div>
          <div className="eyebrow" style={{ color: ACCENT }}>Landed in {scenario.destination_system}</div>
          <div className="font-mono text-[12px] text-navy-200 mt-0.5">{scenario.destination_object} · {scenario.sync_mode}</div>
        </div>
        <span className="font-mono text-[12px]" style={{ color: ACCENT }}>
          {records.filter((r) => r.status !== 'skipped').length} of {records.length} cases open
        </span>
      </header>
      <div className="overflow-x-auto">
        <table className="spec-table">
          <thead>
            <tr>
              <th>Alert ID</th>
              {cols.map((c) => (<th key={c}>{c}</th>))}
              <th style={{ textAlign: 'right' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.key}>
                <td className="font-mono text-xs">{r.key}</td>
                {cols.map((c) => (<td key={c} className="text-xs">{r.fields[c]}</td>))}
                <td style={{ textAlign: 'right' }}>
                  <span
                    className="font-mono text-[10px] font-bold uppercase tracking-wider"
                    style={{ color: r.status === 'skipped' ? '#f0c948' : '#10e88a' }}
                  >
                    {r.status === 'skipped' ? '● unchanged' : `● ${r.status}`}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Small agent avatar ──────────────────────────────────────────────────────

function AgentBadge({ agent, active, size = 40 }: { agent?: ActivationAgent; active?: boolean; size?: number }) {
  const color = agent?.color ?? ACCENT;
  const code = agent?.code ?? '??';
  return (
    <span
      data-active={active ? 'true' : undefined}
      style={{
        color,
        height: size,
        width: size,
        minWidth: size,
        fontSize: Math.max(11, size * 0.36),
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 2,
        background: 'rgba(10,22,40,0.7)',
        border: `1.5px solid ${active ? color : 'var(--navy-600)'}`,
        fontFamily: '"JetBrains Mono", monospace',
        fontWeight: 700,
        letterSpacing: '0.05em',
        transition: 'all 200ms ease',
        boxShadow: active ? `0 0 0 2px ${color}, 0 0 14px ${color}66` : undefined,
        flexShrink: 0,
      }}
      title={agent?.name ?? 'System'}
    >
      {code}
    </span>
  );
}

// ─── Syntax highlighting (regex-based, dark panel) — SQL + light JSON ───────

const SQL_KEYWORDS = new Set([
  'with', 'as', 'select', 'from', 'where', 'and', 'or', 'on', 'left', 'right',
  'inner', 'outer', 'join', 'group', 'by', 'order', 'desc', 'asc', 'when', 'then',
  'else', 'end', 'case', 'true', 'false', 'null', 'distinct', 'nullif', 'count',
  'sum', 'max', 'min', 'avg', 'in', 'is', 'not',
]);

function tokenizeSqlLine(line: string): React.ReactNode[] {
  const trimmed = line.trimStart();
  if (trimmed.startsWith('--')) {
    return [<span key="c" className="wtok-com">{line}</span>];
  }
  const parts: React.ReactNode[] = [];
  const re = /(\{\{[^}]*\}\})|('[^']*')|(\b\d+(?:\.\d+)?\b)|(\b[a-zA-Z_][a-zA-Z0-9_]*\b)|(\s+)|([^\s'\w{]+)/g;
  let m: RegExpExecArray | null;
  let idx = 0;
  let key = 0;
  while ((m = re.exec(line)) !== null) {
    if (m.index > idx) parts.push(line.slice(idx, m.index));
    if (m[1]) {
      parts.push(<span key={key++} className="wtok-jinja">{m[1]}</span>);
    } else if (m[2]) {
      parts.push(<span key={key++} className="wtok-str">{m[2]}</span>);
    } else if (m[3]) {
      parts.push(<span key={key++} className="wtok-num">{m[3]}</span>);
    } else if (m[4]) {
      const word = m[4];
      if (SQL_KEYWORDS.has(word.toLowerCase())) {
        parts.push(<span key={key++} className="wtok-kw">{word}</span>);
      } else {
        parts.push(word);
      }
    } else if (m[5]) {
      parts.push(m[5]);
    } else {
      parts.push(m[6] ?? '');
    }
    idx = re.lastIndex;
  }
  if (idx < line.length) parts.push(line.slice(idx));
  return parts;
}

function SyntaxSql({ text, cursor }: { text: string; cursor: boolean }) {
  const lines = text.split('\n');
  return (
    <>
      {lines.map((line, li) => (
        <span key={li}>{tokenizeSqlLine(line)}{li < lines.length - 1 && '\n'}</span>
      ))}
      {cursor && <span className="wizard-code-cursor" />}
    </>
  );
}

function tokenizeJsonLine(line: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const re = /("(?:[^"\\]|\\.)*")(\s*:)?|(\btrue\b|\bfalse\b|\bnull\b)|(-?\b\d+(?:\.\d+)?\b)/g;
  let m: RegExpExecArray | null;
  let idx = 0;
  let key = 0;
  while ((m = re.exec(line)) !== null) {
    if (m.index > idx) parts.push(line.slice(idx, m.index));
    if (m[1]) {
      const isKey = !!m[2];
      parts.push(<span key={key++} className={isKey ? 'wtok-kw' : 'wtok-str'}>{m[1]}</span>);
      if (m[2]) parts.push(m[2]);
    } else if (m[3]) {
      parts.push(<span key={key++} className="wtok-jinja">{m[3]}</span>);
    } else if (m[4]) {
      parts.push(<span key={key++} className="wtok-num">{m[4]}</span>);
    }
    idx = re.lastIndex;
  }
  if (idx < line.length) parts.push(line.slice(idx));
  return parts;
}

function SyntaxJson({ text, cursor }: { text: string; cursor: boolean }) {
  const lines = text.split('\n');
  return (
    <>
      {lines.map((line, li) => (
        <span key={li}>{tokenizeJsonLine(line)}{li < lines.length - 1 && '\n'}</span>
      ))}
      {cursor && <span className="wizard-code-cursor" />}
    </>
  );
}

// =============================================================================
// Page
// =============================================================================

export default function ActivationLivePage() {
  const [events] = useState<ActivationEvent[]>(ACTIVATION_SCRIPT);
  const scenario = ACTIVATION_SCENARIO;
  const agents = ACTIVATION_AGENTS;

  const [state, setState] = useState<RevealState>(INITIAL);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState<(typeof SPEEDS)[number]>(1);
  const [complete, setComplete] = useState(false);

  const narrPanelRef = useRef<HTMLDivElement | null>(null);
  const codePanelRef = useRef<HTMLPreElement | null>(null);
  const narrUserScrolled = useRef(false);
  const codeUserScrolled = useRef(false);

  const agentById = useMemo(() => {
    const m: Record<string, ActivationAgent> = {};
    for (const a of agents) m[a.id] = a;
    return m;
  }, [agents]);

  const currentEvent: ActivationEvent | undefined = events[state.cursor];
  const totalSteps = useMemo(() => {
    if (events.length === 0) return 5;
    return Math.max(...events.map((e) => e.step));
  }, [events]);

  // Phase machine: type narration → type code (if any) → advance
  useEffect(() => {
    if (!playing || !currentEvent) {
      if (events.length > 0 && state.cursor >= events.length && !complete) {
        setComplete(true);
      }
      return;
    }
    // Phase 1: type narration
    if (state.narrTyped < currentEvent.body.length) {
      const id = setTimeout(() => {
        setState((s) => ({ ...s, narrTyped: s.narrTyped + 1 }));
      }, Math.max(2, Math.floor(NARR_TYPE_MS / speed)));
      return () => clearTimeout(id);
    }
    // Phase 2: type code if any
    const code = currentEvent.code_append ?? '';
    if (code.length > 0 && state.codeTyped < code.length) {
      const id = setTimeout(() => {
        setState((s) => ({ ...s, codeTyped: s.codeTyped + 1 }));
      }, Math.max(1, Math.floor(CODE_TYPE_MS / speed)));
      return () => clearTimeout(id);
    }
    // Phase 3: commit side effect + advance cursor
    const postDelay = code.length > 0 ? POST_CODE_DELAY_MS : POST_NARR_DELAY_MS;
    const id = setTimeout(() => {
      setState((s) => {
        const next: RevealState = { ...s, cursor: s.cursor + 1, narrTyped: 0, codeTyped: 0 };
        if (currentEvent.side_effect) {
          next.sideEffects = [currentEvent.side_effect, ...s.sideEffects].slice(0, 8);
        }
        return next;
      });
    }, Math.max(80, Math.floor(postDelay / speed)));
    return () => clearTimeout(id);
  }, [playing, speed, currentEvent, state.narrTyped, state.codeTyped, state.cursor, events.length, complete]);

  useEffect(() => {
    const el = narrPanelRef.current;
    if (el && !narrUserScrolled.current) el.scrollTop = el.scrollHeight;
  }, [state.cursor, state.narrTyped]);
  useEffect(() => {
    const el = codePanelRef.current;
    if (el && !codeUserScrolled.current) el.scrollTop = el.scrollHeight;
  }, [state.codeTyped, state.cursor]);

  useEffect(() => {
    const NEAR_BOTTOM_PX = 32;
    const bind = (el: HTMLElement | null, flag: React.MutableRefObject<boolean>) => {
      if (!el) return () => {};
      const handler = () => {
        const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
        flag.current = distanceFromBottom > NEAR_BOTTOM_PX;
      };
      el.addEventListener('scroll', handler, { passive: true });
      return () => el.removeEventListener('scroll', handler);
    };
    const offs = [bind(narrPanelRef.current, narrUserScrolled), bind(codePanelRef.current, codeUserScrolled)];
    return () => { offs.forEach((off) => off()); };
  }, []);

  const reset = () => { setState(INITIAL); setComplete(false); setPlaying(true); };
  const cycleSpeed = () => { const i = SPEEDS.indexOf(speed); setSpeed(SPEEDS[(i + 1) % SPEEDS.length]); };

  const currentStep = currentEvent?.step ?? totalSteps;
  const currentStepLabel = currentEvent?.step_label ?? 'Destination Confirmation';
  const activeAgentId: ActivationAgentId | undefined =
    currentEvent && state.narrTyped < currentEvent.body.length ? currentEvent.from : undefined;

  const visibleNarr = events.slice(0, Math.min(state.cursor + 1, events.length)).map((e, idx) => {
    const isCurrent = idx === state.cursor;
    const body = isCurrent ? e.body.slice(0, state.narrTyped) : e.body;
    return { e, body, isCurrent };
  });

  const codeSoFar = currentEvent?.code_append ? currentEvent.code_append.slice(0, state.codeTyped) : '';
  const codeLabel =
    currentEvent?.code_target === 'sql' ? 'models/gold/fct_alert_evidence.sql' : 'activation_mapping.json';

  return (
    <div className="wizard-terminal mx-auto max-w-[1640px] px-4 py-4 sm:px-6 lg:px-8">

      {/* ── Control bar ── */}
      <div
        className="mb-3 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 sticky top-20 z-20"
        style={{
          background: 'var(--navy-800)',
          border: '1px solid var(--navy-600)',
          borderLeft: `4px solid ${ACCENT}`,
          boxShadow: '0 2px 8px rgba(0,0,0,0.35)',
        }}
      >
        <div className="flex items-center gap-3 flex-wrap">
          <span
            className="chip"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontSize: 12, padding: '4px 10px', fontWeight: 700,
              background: 'rgba(34,211,238,0.1)', color: ACCENT, border: `1px solid ${ACCENT}59`,
            }}
          >
            <span
              style={{
                display: 'inline-block', width: 8, height: 8, borderRadius: 999,
                background: ACCENT,
                animation: complete ? 'none' : 'signal-pulse 1.8s ease-in-out infinite',
              }}
            />
            {complete ? 'Sync Complete' : 'Sync Active'}
          </span>
          <span className="eyebrow" style={{ fontSize: 12 }}>{scenario.request_id}</span>
          <span className="font-mono" style={{ color: 'var(--navy-200)', fontSize: 13 }}>
            Step{' '}
            <span style={{ color: ACCENT, fontWeight: 700 }}>{currentStep}/{totalSteps}</span>
            <span className="mx-2" style={{ color: 'var(--navy-400)' }}>·</span>
            <span style={{ color: 'white' }}>{currentStepLabel}</span>
          </span>
          <div
            aria-hidden
            style={{ width: 160, height: 6, borderRadius: 999, background: 'var(--navy-900)', overflow: 'hidden', border: '1px solid var(--navy-600)' }}
          >
            <div
              style={{
                width: `${Math.min(100, Math.max(0, Math.round(((complete ? events.length : state.cursor) / Math.max(1, events.length)) * 100)))}%`,
                height: '100%',
                background: complete ? '#10e88a' : ACCENT,
                transition: 'width 220ms ease, background 200ms ease',
              }}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="inline-flex items-center gap-1.5 font-mono font-semibold border transition-colors"
            style={{ background: 'var(--navy-900)', borderColor: 'var(--navy-600)', color: 'white', padding: '7px 14px', fontSize: 13 }}
            onClick={() => setPlaying((p) => !p)}
            disabled={complete}
          >
            {playing ? 'Pause' : 'Play'}
          </button>
          <button
            className="inline-flex items-center gap-1.5 font-mono font-semibold border transition-colors"
            style={{ background: 'var(--navy-900)', borderColor: 'var(--navy-600)', color: 'white', padding: '7px 14px', fontSize: 13 }}
            onClick={cycleSpeed}
          >
            {speed}x
          </button>
          <button
            className="inline-flex items-center gap-1.5 font-mono font-semibold border transition-colors"
            style={{ background: 'var(--navy-900)', borderColor: 'var(--navy-600)', color: 'white', padding: '7px 14px', fontSize: 13 }}
            onClick={reset}
          >
            Restart
          </button>
          <Link
            to="/architecture"
            className="inline-flex items-center gap-1.5 font-mono font-semibold border transition-colors"
            style={{ background: 'var(--navy-900)', borderColor: 'var(--navy-600)', color: 'white', padding: '7px 14px', fontSize: 13 }}
          >
            Back
          </Link>
        </div>
      </div>

      {/* ── Question + trigger banner (compact single row) ── */}
      <div className="mb-3 px-4 py-2.5 term-card flex items-center gap-5 flex-wrap" style={{ borderLeftColor: ACCENT }}>
        <div className="min-w-0 flex-shrink" style={{ flex: '1 1 460px' }}>
          <div className="eyebrow" style={{ fontSize: 10, marginBottom: 2, color: ACCENT }}>
            Surveillance · {scenario.timezone_label} · {scenario.requested_by}
          </div>
          <p className="font-display font-medium text-white leading-snug truncate" style={{ fontSize: 16 }} title={scenario.question}>
            &ldquo;{scenario.question}&rdquo;
          </p>
        </div>
        <div className="font-mono text-navy-200 shrink-0" style={{ fontSize: 11 }}>
          Source: <span style={{ color: ACCENT, fontWeight: 700 }}>{scenario.source_model}</span>
          <span className="mx-2" style={{ color: 'var(--navy-400)' }}>&rarr;</span>
          <span style={{ color: ACCENT, fontWeight: 700 }}>{scenario.destination_system}</span>
        </div>
      </div>

      {/* ── Step rail (5 columns) ── */}
      <div className="mb-3 grid gap-1.5" style={{ gridTemplateColumns: 'repeat(5, minmax(0, 1fr))' }}>
        {STEP_DEFS.map((s, idx) => {
          const num = idx + 1;
          const done = currentStep > num || (currentStep === num && complete);
          const active = currentStep === num && !complete;
          const accentColor = active ? ACCENT : done ? '#10e88a' : 'var(--navy-600)';
          return (
            <div
              key={s.label}
              className="term-card px-2.5 py-2 flex flex-col gap-0.5"
              style={{
                borderLeftColor: accentColor,
                background: active ? 'rgba(34,211,238,0.08)' : done ? 'rgba(16,232,138,0.08)' : 'var(--navy-800)',
              }}
              title={`${s.who} · ${s.tools}`}
            >
              <div
                className="font-mono font-bold flex items-center gap-1.5"
                style={{ fontSize: 10, letterSpacing: '0.04em', color: active ? ACCENT : done ? '#10e88a' : 'var(--navy-300)' }}
              >
                <span>STEP {String(num).padStart(2, '0')}</span>
                <span style={{ opacity: 0.6 }}>·</span>
                <span>{done ? 'DONE' : active ? 'NOW' : 'WAIT'}</span>
              </div>
              <div className="font-display font-semibold text-white truncate" style={{ fontSize: 13, lineHeight: 1.15 }}>
                {s.label}
              </div>
              <div
                className="font-mono truncate"
                style={{ fontSize: 10, lineHeight: 1.25, color: active ? ACCENT : done ? '#10e88a' : 'var(--navy-300)', opacity: done || active ? 0.95 : 0.55 }}
                title={s.insight}
              >
                {s.insight}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.25fr)' }}>

        {/* ── LEFT: Sub-agent narration ── */}
        <section className="term-card flex flex-col min-h-[60vh] lg:min-h-[300px] lg:h-[calc(100dvh-440px)]">
          <header className="px-5 py-3 border-b border-navy-700 flex items-center justify-between">
            <div>
              <div className="eyebrow" style={{ fontSize: 11 }}>Sub-agent narration</div>
              <div className="font-mono mt-0.5 text-navy-200" style={{ fontSize: 12 }}>
                {scenario.company} · Activations live sync
              </div>
            </div>
            <div className="flex items-center gap-2">
              {agents.map((a) => (
                <AgentBadge key={a.id} agent={a} active={activeAgentId === a.id} size={36} />
              ))}
            </div>
          </header>

          <div
            ref={narrPanelRef}
            className="px-5 py-4 overflow-y-auto flex-1"
            style={{ background: 'var(--navy-900)', overscrollBehavior: 'contain', fontSize: 14, lineHeight: 1.55 }}
          >
            {visibleNarr.map((m, idx) => {
              const a = agentById[m.e.from];
              const color = a?.color ?? ACCENT;
              const isTyping = m.isCurrent && playing && state.narrTyped < m.e.body.length;
              return (
                <div
                  key={idx}
                  style={{
                    borderLeft: `3px solid ${color}`,
                    marginBottom: 10,
                    border: '1px solid var(--navy-700)',
                    borderLeftColor: color,
                    borderLeftWidth: 3,
                    background: 'var(--navy-800)',
                  }}
                >
                  <div style={{ display: 'flex', gap: 12, padding: '12px 14px' }}>
                    <div style={{ paddingTop: 2, flexShrink: 0 }}>
                      <AgentBadge agent={a} active={isTyping} size={40} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <span className="font-mono font-semibold" style={{ color, fontSize: 13, letterSpacing: '0.02em' }}>
                          {a?.name ?? m.e.from}
                        </span>
                        <span
                          className="chip"
                          style={{ fontSize: 10, padding: '2px 7px', fontWeight: 700, background: 'rgba(34,211,238,0.10)', color: ACCENT, border: `1px solid ${ACCENT}59` }}
                        >
                          STEP {m.e.step}
                        </span>
                        <span className="font-mono" style={{ fontSize: 11, color: 'var(--navy-300)' }}>{m.e.step_label}</span>
                      </div>
                      <div
                        className={isTyping ? 'wizard-chat-cursor' : ''}
                        style={{
                          color: 'var(--navy-50)', fontSize: 14.5, lineHeight: 1.55,
                          fontFamily: '"JetBrains Mono", monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                        }}
                      >
                        {m.body}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── RIGHT: Single live code panel (SQL or JSON, per step) ── */}
        <section className="flex flex-col gap-3 min-h-[60vh] lg:min-h-[300px] lg:h-[calc(100dvh-440px)]" style={{ minWidth: 0 }}>
          <div className="term-card flex flex-col" style={{ flex: '1 1 0', minHeight: 0 }}>
            <header className="px-5 py-3 border-b border-navy-700 flex items-center justify-between">
              <div className="flex items-center gap-3 flex-wrap min-w-0">
                <div className="eyebrow font-mono" style={{ fontSize: 11, letterSpacing: '0.02em' }}>{codeLabel}</div>
                <span
                  className="chip"
                  style={{ color: ACCENT, background: 'rgba(34,211,238,0.07)', border: `1px solid ${ACCENT}4d`, fontSize: 10, padding: '3px 8px', fontWeight: 700, whiteSpace: 'nowrap' }}
                >
                  {currentEvent?.from ? `${agentById[currentEvent.from]?.name ?? currentEvent.from} authoring` : 'Awaiting sync'}
                </span>
              </div>
              <span className="font-mono" style={{ fontSize: 12, whiteSpace: 'nowrap', color: 'var(--navy-300)' }}>
                {codeSoFar.length.toLocaleString()} chars
              </span>
            </header>
            <pre
              ref={codePanelRef}
              className="flex-1"
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 14, lineHeight: 1.6,
                background: '#050d1a', color: '#e8edf8',
                border: 'none', margin: 0, padding: '1.25rem',
                overflowX: 'auto', overflowY: 'auto',
                whiteSpace: 'pre', tabSize: 2,
                overscrollBehavior: 'contain',
                minHeight: 0,
              }}
            >
              {codeSoFar.length === 0 ? (
                <span style={{ color: '#5a7099' }}>{'-- waiting for the next stage to author...'}</span>
              ) : currentEvent?.code_target === 'sql' ? (
                <SyntaxSql text={codeSoFar} cursor={state.codeTyped > 0 && state.codeTyped < (currentEvent.code_append?.length ?? 0)} />
              ) : (
                <SyntaxJson text={codeSoFar} cursor={state.codeTyped > 0 && state.codeTyped < (currentEvent?.code_append?.length ?? 0)} />
              )}
            </pre>
          </div>
        </section>
      </div>

      {/* ── Full-width tool side effects ticker (compact) ── */}
      <div className="term-card mt-3 px-3 py-2 flex items-center gap-3">
        <div className="eyebrow shrink-0" style={{ fontSize: 10 }}>sync events</div>
        {state.sideEffects.length === 0 ? (
          <div className="font-mono" style={{ fontSize: 11.5, color: 'var(--navy-300)' }}>Awaiting first sync event...</div>
        ) : (
          <ul className="flex items-center gap-x-4 gap-y-1 flex-wrap min-w-0">
            {state.sideEffects.slice(0, 4).map((s, i) => (
              <li key={`${s}-${i}`} className="flex items-center gap-1.5 font-mono text-white truncate" style={{ fontSize: 11.5, maxWidth: '32ch' }} title={s}>
                <span
                  style={{
                    display: 'inline-block', width: 7, height: 7, borderRadius: 999, flexShrink: 0,
                    background: i === 0 ? ACCENT : 'var(--navy-400)',
                    animation: i === 0 ? 'signal-pulse 1.8s ease-in-out infinite' : 'none',
                  }}
                />
                <span className="truncate">{s}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ── Sync complete: destination confirmation payoff ── */}
      {complete && (
        <div className="mt-6 term-card p-5" style={{ borderLeftColor: '#10e88a', background: 'rgba(16,232,138,0.06)' }}>
          <div className="flex items-baseline justify-between flex-wrap gap-3 mb-1">
            <div className="flex items-baseline gap-3 flex-wrap">
              <div
                className="chip shrink-0"
                style={{ display: 'inline-flex', fontSize: 12, padding: '4px 10px', fontWeight: 700, background: 'rgba(16,232,138,0.12)', color: '#10e88a', border: '1px solid rgba(16,232,138,0.35)' }}
              >
                Sync Complete
              </div>
              <span className="eyebrow" style={{ fontSize: 11 }}>{scenario.request_id} · {scenario.company}</span>
            </div>
            <Link
              to="/architecture"
              className="inline-flex items-center gap-2 font-semibold transition-colors"
              style={{ background: ACCENT, color: '#0a1628', padding: '10px 18px', fontSize: 13 }}
            >
              Back to architecture
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <DestinationConfirmationTable scenario={scenario} records={ACTIVATION_RECORDS} />
        </div>
      )}

      {/* Inline styles for wizard-specific primitives + terminal window chrome */}
      <style>{`
        @keyframes signal-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.28; }
        }
        .wizard-terminal {
          border-radius: 4px;
          border: 1px solid var(--navy-600);
          padding-top: 28px;
          position: relative;
          margin-top: 4px;
          margin-bottom: 12px;
          box-shadow: 0 18px 40px -22px rgba(0, 0, 0, 0.65);
        }
        .wizard-terminal::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 28px;
          background: linear-gradient(180deg, #0e1f36, #0a1628);
          border-bottom: 1px solid var(--navy-600);
        }
        .wizard-terminal::after {
          content: 'beacon-markets/activations-live · NewCo Activations';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 28px;
          display: flex;
          align-items: center;
          font-size: 11.5px;
          font-family: "JetBrains Mono", monospace;
          background:
            radial-gradient(circle at 14px 14px, #ff5f57 5px, transparent 5.5px),
            radial-gradient(circle at 30px 14px, #febc2e 5px, transparent 5.5px),
            radial-gradient(circle at 46px 14px, #28c940 5px, transparent 5.5px);
          color: var(--navy-200);
          text-indent: 64px;
          letter-spacing: 0.02em;
          pointer-events: none;
        }
        .wizard-terminal > * { position: relative; z-index: 1; }
        .wizard-chat-cursor::after {
          content: '▌';
          display: inline-block;
          margin-left: 2px;
          color: ${ACCENT};
          animation: cursor-blink 0.9s steps(2, start) infinite;
        }
        @keyframes cursor-blink { to { visibility: hidden; } }
        .wizard-code-cursor::after {
          content: '▌';
          color: ${ACCENT};
          animation: cursor-blink 0.9s steps(2, start) infinite;
        }
        .wtok-kw    { color: #79b8ff; font-weight: 600; }
        .wtok-str   { color: #4ade80; }
        .wtok-com   { color: #7a8fa8; font-style: italic; }
        .wtok-num   { color: #f0c948; }
        .wtok-jinja { color: #e879b8; font-weight: 600; }
      `}</style>
    </div>
  );
}
