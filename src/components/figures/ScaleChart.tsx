import { useState } from 'react';
import { C } from './Stepper';

interface Props { n?: string; title?: string }

/**
 * Response time against data volume for three access paths. The curves are
 * qualitative: the point is the shape, not the numbers.
 */
export default function ScaleChart({ n = '3.1', title = 'How response time grows with data volume' }: Props) {
  const [show, setShow] = useState({ good: true, filter: true, scan: true });
  const W = 720, H = 300, px = 60, py = 24, pw = W - px - 20, ph = H - py - 50;
  const xs = Array.from({ length: 41 }, (_, i) => i / 40);
  const path = (f: (t: number) => number) => xs.map((t, i) => `${i ? 'L' : 'M'}${px + t * pw},${py + ph - f(t) * ph}`).join(' ');
  const good = (t: number) => 0.04 + 0.02 * Math.log1p(t * 20) / Math.log1p(20);
  const filter = (t: number) => 0.04 + 0.55 * t;
  const scan = (t: number) => 0.06 + 0.9 * t;
  const Toggle = ({ k, label, color }: { k: keyof typeof show; label: string; color: string }) => (
    <button type="button" className="btn small" aria-pressed={show[k]} onClick={() => setShow({ ...show, [k]: !show[k] })} style={{ opacity: show[k] ? 1 : 0.5 }}>
      <span style={{ display: 'inline-block', width: 14, height: 3, background: color, borderRadius: 2 }} aria-hidden="true" /> {label}
    </button>
  );
  return (
    <figure className="fig stepper">
      <div className="fig-head"><span className="fig-n">Figure {n}</span><span className="fig-title">{title}</span></div>
      <div className="fig-body">
        <svg viewBox={`0 0 ${W} ${H}`} className="fig-svg" role="img" aria-label="Three curves: an index with access predicates stays flat, an index with filter predicates grows linearly, a full table scan grows linearly and steeper">
          <line x1={px} y1={py} x2={px} y2={py + ph} stroke={C.muted} />
          <line x1={px} y1={py + ph} x2={px + pw} y2={py + ph} stroke={C.muted} />
          <text x={px + pw} y={py + ph + 22} textAnchor="end" className="lbl">data volume →</text>
          <text x={px - 8} y={py + 10} textAnchor="end" className="lbl" transform={`rotate(-90 ${px - 8} ${py + 10})`}>response time →</text>
          {show.scan && <path d={path(scan)} fill="none" stroke={C.hot} strokeWidth={2.4} />}
          {show.filter && <path d={path(filter)} fill="none" stroke={C.ink} strokeWidth={2} strokeDasharray="6 4" />}
          {show.good && <path d={path(good)} fill="none" stroke={C.cool} strokeWidth={2.4} />}
          {show.scan && <text x={px + pw - 4} y={py + ph - scan(1) * ph - 8} textAnchor="end" fontSize={12} fontFamily="var(--font-sans)" fill={C.hot}>full table scan</text>}
          {show.filter && <text x={px + pw - 4} y={py + ph - filter(1) * ph - 8} textAnchor="end" fontSize={12} fontFamily="var(--font-sans)" fill={C.text}>index, filter predicate</text>}
          {show.good && <text x={px + pw - 4} y={py + ph - good(1) * ph - 8} textAnchor="end" fontSize={12} fontFamily="var(--font-sans)" fill={C.cool}>index, access predicate</text>}
          <line x1={px + pw * 0.08} y1={py} x2={px + pw * 0.08} y2={py + ph} stroke={C.muted} strokeDasharray="3 3" />
          <text x={px + pw * 0.08 + 4} y={py + 12} className="lbl">dev database</text>
          <line x1={px + pw * 0.85} y1={py} x2={px + pw * 0.85} y2={py + ph} stroke={C.muted} strokeDasharray="3 3" />
          <text x={px + pw * 0.85 - 4} y={py + 12} className="lbl" textAnchor="end">production</text>
        </svg>
        <div className="controls">
          <Toggle k="good" label="access predicate" color="var(--fig-cool)" />
          <Toggle k="filter" label="filter predicate" color="var(--fig-ink)" />
          <Toggle k="scan" label="full scan" color="var(--fig-hot)" />
        </div>
      </div>
      <figcaption>All three look fine on the small development database at the left. Only the index whose where clause is fully covered by access predicates stays flat as the table grows.</figcaption>
    </figure>
  );
}
