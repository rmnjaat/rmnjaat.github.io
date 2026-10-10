import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';

export interface Step { label: string; text: string }

interface Props {
  n?: string;
  title: string;
  steps: Step[];
  children: (step: number) => ReactNode;
  /** Extra controls rendered left of the caption (mode switches). */
  extra?: ReactNode;
  caption?: ReactNode;
}

const PLAY_MS = 2600;

/**
 * Figure frame with step controls. The figure body is a render prop that
 * receives the current step index; the component owns nothing else.
 * Play advances one step every PLAY_MS and stops on the last step.
 */
export default function Stepper({ n, title, steps, children, extra, caption }: Props) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [wide, setWide] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const last = steps.length - 1;
  const next = useCallback(() => setStep((s) => Math.min(last, s + 1)), [last]);
  const prev = useCallback(() => setStep((s) => Math.max(0, s - 1)), []);
  useEffect(() => { setStep(0); setPlaying(false); }, [steps.length]);

  // Keyboard: arrows step, space toggles play.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'BUTTON' && e.key === ' ') return;
      if (e.key === 'ArrowRight') { e.preventDefault(); setPlaying(false); next(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); setPlaying(false); prev(); }
    };
    el.addEventListener('keydown', onKey);
    return () => el.removeEventListener('keydown', onKey);
  }, [next, prev]);

  // Autoplay.
  useEffect(() => {
    if (!playing) return;
    if (step >= last) { setPlaying(false); return; }
    const t = setTimeout(() => setStep((s) => Math.min(last, s + 1)), PLAY_MS);
    return () => clearTimeout(t);
  }, [playing, step, last]);

  // Is the drawing wider than its box? Then tell phone users they can swipe.
  useEffect(() => {
    const el = bodyRef.current;
    if (!el || !('ResizeObserver' in window)) return;
    const check = () => setWide(el.scrollWidth > el.clientWidth + 4);
    const ro = new ResizeObserver(check);
    ro.observe(el);
    check();
    return () => ro.disconnect();
  }, []);

  const s = steps[Math.min(step, last)];
  const togglePlay = () => {
    if (playing) { setPlaying(false); return; }
    if (step >= last) setStep(0);
    setPlaying(true);
  };
  return (
    <figure className="fig stepper" ref={ref} tabIndex={-1}>
      <div className="fig-head">{n && <span className="fig-n">Figure {n}</span>}<span className="fig-title">{title}</span></div>
      <div className="fig-body" ref={bodyRef} data-step={step}>
        {children(step)}
        {wide && <p className="swipe-hint">The drawing is wider than the screen. Swipe sideways to see all of it.</p>}
        <div className="controls">
          {extra}
          <span className="pill" aria-live="polite">{s.label}</span>
          <p className="caption">{s.text}</p>
          <div className="btns">
            <ol className="dots" aria-label={`Step ${step + 1} of ${steps.length}`}>
              {steps.map((st, i) => <li key={i} className={i === step ? 'on' : i < step ? 'past' : ''}><button type="button" aria-label={`Go to step ${i + 1}: ${st.label}`} onClick={() => { setPlaying(false); setStep(i); }} /></li>)}
            </ol>
            <button type="button" className="btn small" onClick={() => { setPlaying(false); prev(); }} disabled={step === 0} aria-label="Previous step">◀</button>
            <button type="button" className={`btn small${playing ? ' on' : ''}`} onClick={togglePlay} aria-pressed={playing} aria-label={playing ? 'Pause' : 'Play all steps'}>{playing ? '❚❚ Pause' : '▶ Play'}</button>
            <button type="button" className="btn small primary" onClick={() => { setPlaying(false); step === last ? setStep(0) : next(); }}>
              {step === last ? 'Restart' : 'Step'}
            </button>
          </div>
        </div>
      </div>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}

/* Shared SVG helpers. Colours come from CSS variables so dark mode just works. */
export const C = {
  ink: 'var(--fig-ink)',
  muted: 'var(--fig-muted)',
  fill: 'var(--fig-fill)',
  table: 'var(--fig-table)',
  hot: 'var(--fig-hot)',
  hotBg: 'var(--fig-hot-bg)',
  cool: 'var(--fig-cool)',
  text: 'var(--ink)',
  textMuted: 'var(--muted)',
};

export function Node({ x, y, w, h, hot, dim, children }: { x: number; y: number; w: number; h: number; hot?: boolean; dim?: boolean; children?: ReactNode }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={4} fill={hot ? C.hotBg : C.fill} stroke={hot ? C.hot : dim ? C.muted : C.ink} strokeWidth={hot ? 2 : 1.4} strokeDasharray={dim ? '4 3' : undefined} />
      {children}
    </g>
  );
}

export function Arrow({ x1, y1, x2, y2, hot, dim, head = true, both = false, width }: { x1: number; y1: number; x2: number; y2: number; hot?: boolean; dim?: boolean; head?: boolean; both?: boolean; width?: number }) {
  const stroke = hot ? C.hot : dim ? C.muted : C.ink;
  const sw = width ?? (hot ? 2.4 : 1.4);
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const hl = 7;
  const headAt = (x: number, y: number, a: number) => `M${x},${y} L${x - hl * Math.cos(a - 0.45)},${y - hl * Math.sin(a - 0.45)} M${x},${y} L${x - hl * Math.cos(a + 0.45)},${y - hl * Math.sin(a + 0.45)}`;
  return (
    <g fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <line x1={x1} y1={y1} x2={x2} y2={y2} />
      {head && <path d={headAt(x2, y2, ang)} />}
      {both && <path d={headAt(x1, y1, ang + Math.PI)} />}
    </g>
  );
}

export function Label({ x, y, children, anchor = 'start' }: { x: number; y: number; children: ReactNode; anchor?: 'start' | 'middle' | 'end' }) {
  return <text x={x} y={y} className="lbl" textAnchor={anchor}>{children}</text>;
}

export function Chip({ x, y, children, hot }: { x: number; y: number; children: ReactNode; hot?: boolean }) {
  const text = String(children);
  const w = text.length * 7.2 + 16;
  return (
    <g>
      <rect x={x} y={y} width={w} height={22} rx={4} fill={hot ? C.hot : C.ink} />
      <text x={x + 8} y={y + 15} fontSize={12} fill="var(--bg)" fontFamily="var(--font-mono)">{text}</text>
    </g>
  );
}
