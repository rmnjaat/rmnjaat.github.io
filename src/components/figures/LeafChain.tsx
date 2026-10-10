import Stepper, { Node, Arrow, Label, C } from './Stepper';

/** Leaf nodes in logical (key) order versus their physical position on disk. */
const LEAVES = ['11 … 23', '39 … 46', '53 … 57', '67 … 83', '91 … 98'];
const PHYSICAL = [2, 0, 4, 1, 3]; // disk block i holds logical leaf PHYSICAL[i]

export default function LeafChain({ n = '1.1', title = 'Index leaf nodes and the doubly linked list' }: { n?: string; title?: string }) {
  const steps = [
    { label: 'Logical order', text: 'Leaf nodes hold the index entries sorted by key. Each leaf points to its neighbours in both directions, so the database can walk the index forwards or backwards.' },
    { label: 'Physical order', text: 'On disk the leaves sit wherever there was room when they were created. The list links the right leaves together regardless of where they are stored.' },
    { label: 'Why a tree', text: 'Walking the list to find 57 would mean reading every leaf before it. That is a scan, not a lookup. The B-tree on top exists to jump straight to the right leaf.' },
  ];
  const lw = 110, gap = 40, x0 = 40, topY = 40, botY = 190;
  return (
    <Stepper n={n} title={title} steps={steps}>
      {(step) => (
        <svg viewBox="0 0 800 300" className="fig-svg" role="img" aria-label="Five leaf nodes linked in key order above, stored in a different order on disk below">
          <Label x={x0} y={28}>logical order (the linked list)</Label>
          {LEAVES.map((t, i) => {
            const x = x0 + i * (lw + gap);
            const hot = step === 2 && i <= 2;
            return (
              <g key={i}>
                <Node x={x} y={topY} w={lw} h={44} hot={hot}>
                  <text x={x + lw / 2} y={topY + 27} textAnchor="middle" fontSize={14} fill={C.text}>{t}</text>
                </Node>
                {i < LEAVES.length - 1 && <Arrow x1={x + lw} y1={topY + 22} x2={x + lw + gap} y2={topY + 22} both width={1.6} hot={step === 2 && i < 2} />}
              </g>
            );
          })}
          <g style={{ opacity: step >= 1 ? 1 : 0.28, transition: 'opacity .4s ease' }}>
            <Label x={x0} y={botY - 12}>physical order (disk blocks)</Label>
            {PHYSICAL.map((logical, i) => {
              const x = x0 + i * (lw + gap);
              const lx = x0 + logical * (lw + gap);
              return (
                <g key={i}>
                  <Node x={x} y={botY} w={lw} h={44} dim>
                    <text x={x + lw / 2} y={botY + 27} textAnchor="middle" fontSize={14} fill={C.textMuted}>{LEAVES[logical]}</text>
                  </Node>
                  <line x1={lx + lw / 2} y1={topY + 44} x2={x + lw / 2} y2={botY} stroke={C.muted} strokeWidth={1} strokeDasharray="3 3" style={{ opacity: step >= 1 ? 1 : 0 }} />
                  <text x={x + lw / 2} y={botY + 62} textAnchor="middle" className="lbl">block {i + 1}</text>
                </g>
              );
            })}
          </g>
          {step === 2 && (
            <g>
              <rect x={x0 + 2 * (lw + gap) + lw / 2 - 18} y={topY - 2} width={36} height={48} rx={4} fill="none" stroke={C.hot} strokeWidth={2} />
              <text x={x0 + 2 * (lw + gap) + lw / 2} y={topY + 72} textAnchor="middle" fontSize={12} fill={C.hot} fontFamily="var(--font-sans)">57 is here, three leaves in</text>
            </g>
          )}
        </svg>
      )}
    </Stepper>
  );
}
