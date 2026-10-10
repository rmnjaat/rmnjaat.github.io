import { useEffect, useRef, useState } from 'react';
import type { Database, SqlJsStatic } from 'sql.js';

interface Props {
  /** Initial SQL in the editor. */
  sql: string;
  /** Short name shown in the header. */
  title?: string;
  /** Extra statements run once after the schema loads (e.g. CREATE INDEX). */
  setup?: string;
}

interface Result { columns: string[]; rows: unknown[][]; truncated: boolean }

let sqlPromise: Promise<SqlJsStatic> | null = null;
let schemaPromise: Promise<string> | null = null;
function loadSql() {
  if (!sqlPromise) sqlPromise = import('sql.js').then((m) => m.default({ locateFile: (f: string) => `/${f}` }));
  return sqlPromise;
}
function loadSchema() {
  if (!schemaPromise) schemaPromise = fetch('/schema.sql').then((r) => r.text());
  return schemaPromise;
}

function fmtPlan(rows: unknown[][]): { indent: number; text: string }[] {
  // EXPLAIN QUERY PLAN returns (id, parent, notused, detail)
  const byId = new Map<number, number>();
  const depth = (id: number): number => { const p = byId.get(id); return p === 0 || p === undefined ? 0 : 1 + depth(p); };
  rows.forEach((r) => byId.set(Number(r[0]), Number(r[1])));
  return rows.map((r) => ({ indent: depth(Number(r[0])), text: String(r[3]) }));
}

/**
 * A real SQLite database in the browser (sql.js). Each playground on a page
 * gets its own database so lessons can create indexes without side effects.
 */
export default function Playground({ sql, title = 'query', setup }: Props) {
  const [text, setText] = useState(sql);
  const [db, setDb] = useState<Database | null>(null);
  const [status, setStatus] = useState<{ text: string; err?: boolean }>({ text: 'loading database…' });
  const [result, setResult] = useState<Result | null>(null);
  const [plan, setPlan] = useState<{ indent: number; text: string }[] | null>(null);
  const ta = useRef<HTMLTextAreaElement>(null);
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [SQL, schema] = await Promise.all([loadSql(), loadSchema()]);
        const d = new SQL.Database();
        d.run(schema);
        if (setup) d.run(setup);
        if (!alive) { d.close(); return; }
        setDb(d);
        setStatus({ text: 'ready · employees: 1,000 rows · sales: 20,000 rows' });
      } catch (e) {
        setStatus({ text: `could not load SQLite: ${(e as Error).message}`, err: true });
      }
    })();
    return () => { alive = false; };
  }, [setup]);

  const run = () => {
    if (!db) return;
    const stmt = text.trim().replace(/;\s*$/, '');
    if (!stmt) return;
    try {
      const t0 = performance.now();
      const res = db.exec(stmt);
      const ms = performance.now() - t0;
      const first = res[0];
      if (first) {
        const rows = first.values.slice(0, 200);
        setResult({ columns: first.columns, rows, truncated: first.values.length > 200 });
        setStatus({ text: `${first.values.length} row${first.values.length === 1 ? '' : 's'} · ${ms.toFixed(2)} ms` });
      } else {
        setResult(null);
        if (/^\s*(insert|update|delete)/i.test(stmt)) {
          const n = db.getRowsModified();
          setStatus({ text: `done · ${n} row${n === 1 ? '' : 's'} affected · ${ms.toFixed(2)} ms` });
        } else {
          const what = /^\s*create\s+index/i.test(stmt) ? 'index created' : /^\s*drop\s+index/i.test(stmt) ? 'index dropped' : 'done';
          setStatus({ text: `${what} · ${ms.toFixed(2)} ms` });
        }
      }
      let planText = '';
      if (/^\s*(select|with)/i.test(stmt)) {
        const p = db.exec(`EXPLAIN QUERY PLAN ${stmt}`);
        const rows = p[0] ? fmtPlan(p[0].values) : [];
        setPlan(rows); planText = rows.map((r) => r.text).join('\n');
      } else {
        setPlan(null);
      }
      window.dispatchEvent(new CustomEvent('util:ran', { detail: { sql: stmt, plan: planText, host: host.current } }));
    } catch (e) {
      setResult(null); setPlan(null);
      setStatus({ text: (e as Error).message, err: true });
    }
  };

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); run(); }
  };

  const showIndexes = () => { setText(`SELECT name, tbl_name, sql FROM sqlite_master WHERE type = 'index' ORDER BY tbl_name, name;`); };

  return (
    <div className="pg" ref={host}>
      <div className="pg-head"><span>playground</span><span className="name">{title}.sql</span><span style={{ marginLeft: 'auto' }}>SQLite, in your browser</span></div>
      <label className="sr-only" htmlFor={`pg-${title}`}>SQL</label>
      <textarea id={`pg-${title}`} ref={ta} value={text} onChange={(e) => setText(e.target.value)} onKeyDown={onKey} spellCheck={false} />
      <div className="pg-actions">
        <button type="button" className="btn small primary" onClick={run} disabled={!db}>Run + explain</button>
        <button type="button" className="btn small" onClick={() => setText(sql)}>Reset query</button>
        <button type="button" className="btn small" onClick={showIndexes}>Show indexes</button>
        <span className={`status${status.err ? ' err' : ''}`} role="status">{status.text}</span>
      </div>
      <div className="pg-out">
        <div className="pane">
          <h3>Result</h3>
          {result ? (
            <div className="scroll">
              <table>
                <thead><tr>{result.columns.map((c) => <th key={c}>{c}</th>)}</tr></thead>
                <tbody>{result.rows.map((r, i) => <tr key={i}>{r.map((v, j) => <td key={j}>{v === null ? 'NULL' : String(v)}</td>)}</tr>)}</tbody>
              </table>
              {result.truncated && <p className="empty">Showing the first 200 rows.</p>}
            </div>
          ) : <p className="empty">Run the query to see rows here. Ctrl/⌘ + Enter also runs.</p>}
        </div>
        <div className="pane">
          <h3>Execution plan</h3>
          {plan ? (
            plan.length ? (
              <pre className="plan">{plan.map((p, i) => (
                <span key={i}>{'  '.repeat(p.indent)}{p.text.split(/(\bSCAN\b|\bSEARCH\b|COVERING INDEX|TEMP B-TREE)/).map((part, j) =>
                  /SCAN|TEMP B-TREE/.test(part) ? <span key={j} className="scan">{part}</span> : /SEARCH|COVERING INDEX/.test(part) ? <span key={j} className="search">{part}</span> : part)}{'\n'}</span>
              ))}</pre>
            ) : <p className="empty">No plan: the query needs no table access.</p>
          ) : <p className="empty">The plan appears here for SELECT statements.</p>}
        </div>
      </div>
    </div>
  );
}
