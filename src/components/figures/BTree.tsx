import Stepper, { Node, Arrow, Label, C } from './Stepper';

const ROOT = [39, 83, 98];
const BRANCHES = [[11, 23, 39], [46, 53, 57, 83], [91, 98]];
const LEAVES: [number, string][][] = [
  [[40, '4A 1B'], [43, '9F 71'], [46, 'A2 D2']],
  [[46, '8B 1C'], [53, 'A0 A1'], [53, '0D 79']],
  [[55, '9C F6'], [57, 'B1 C1'], [57, '50 29']],
  [[67, 'C4 6B'], [83, 'FF 9D'], [83, 'AF E9']],
];

interface Props {
  n?: string;
  title?: string;
  /** 'structure' explains the layers; 'search' walks a lookup. */
  mode?: 'structure' | 'search';
  /** Key to search for (40..83 are drawn in full). */
  search?: number;
  compact?: boolean;
}

const firstGE = (arr: number[], k: number) => { const i = arr.findIndex((v) => v >= k); return i < 0 ? arr.length - 1 : i; };

export default function BTree({ n = '1.2', title, mode = 'structure', search = 57, compact }: Props) {
  const rIdx = firstGE(ROOT, search);
  const bIdx = rIdx === 1 ? firstGE(BRANCHES[1], search) : -1;
  const leaf = bIdx >= 0 ? LEAVES[bIdx] : null;
  const rowIdx = leaf ? Math.max(0, leaf.findIndex(([k]) => k >= search)) : -1;

  const steps = mode === 'search'
    ? [
        { label: 'Start', text: `Search for key ${search}. The database begins at the root node and reads its entries in order until it finds the first one that is greater than or equal to ${search}.` },
        { label: 'Step 1 · root', text: `${ROOT[rIdx]} is the first root entry ≥ ${search}. Follow the pointer stored with it to the branch node below.` },
        { label: 'Step 2 · branch', text: bIdx >= 0 ? `Same rule, one level down: ${BRANCHES[1][bIdx]} is the first entry ≥ ${search}. Follow its pointer to a leaf node.` : 'The branch node points to a leaf outside the drawn fragment.' },
        { label: 'Step 3 · leaf', text: leaf ? `The leaf node holds the entry ${leaf[rowIdx][0]} with ROWID ${leaf[rowIdx][1]}. Three node reads, no matter how many rows the table has.` : 'The leaf is found after the same number of steps.' },
      ]
    : [
        { label: 'Leaf nodes', text: 'Index entries live in leaf nodes: key plus ROWID, sorted by key. The leaves form a doubly linked list, so the database can walk them in order even though they are scattered on disk.' },
        { label: 'Branch node', text: 'A branch node holds the largest key of each leaf it points to: 46, 53, 57 and 83 here. One branch entry per leaf.' },
        { label: 'Root node', text: 'Branch nodes get the same treatment one level up, until a single node covers everything. That node is the root.' },
        { label: 'Balanced', text: 'Every leaf is the same number of steps from the root. The depth grows only when a whole level fills up, so it stays at 4 or 5 even for millions of rows.' },
      ];

  const H = compact ? 330 : 380;
  const leafY = compact ? 220 : 240;

  return (
    <Stepper n={n || undefined} title={title ?? (mode === 'search' ? `B-tree traversal, searching for ${search}` : 'B-tree structure')} steps={steps}>
      {(step) => {
        const hotRoot = mode === 'search' ? step >= 1 : step >= 2;
        const hotBranch = mode === 'search' ? step >= 2 : step >= 1;
        const hotLeaf = mode === 'search' ? step >= 3 : step >= 0;
        const all = mode === 'structure' && step >= 3;
        const leafXs = [50, 215, 380, 545];
        return (
          <svg viewBox={`0 0 720 ${H}`} className="fig-svg" role="img" aria-label="B-tree with a root node, branch nodes and leaf nodes">
            {/* root → branches */}
            <Arrow x1={306} y1={60} x2={95} y2={120} dim={!all} hot={mode === 'search' && step >= 1 && rIdx === 0} head={false} />
            <Arrow x1={360} y1={60} x2={355} y2={120} hot={mode === 'search' ? step >= 1 && rIdx === 1 : all} dim={!(mode === 'search' ? step >= 1 && rIdx === 1 : all)} head={false} />
            <Arrow x1={414} y1={60} x2={630} y2={120} dim={!all} hot={mode === 'search' && step >= 1 && rIdx === 2} head={false} />
            {/* branch 1 → leaves */}
            {leafXs.map((lx, i) => {
              const bx = 235 + 30 + i * 60;
              const hot = mode === 'search' ? step >= 2 && bIdx === i : hotBranch;
              return <Arrow key={i} x1={bx} y1={160} x2={lx + 65} y2={leafY} hot={hot} dim={!hot} head={false} />;
            })}
            {/* stubs under outer branches */}
            <path d={`M45 160 l-20 30 M95 160 l0 30 M145 160 l20 30 M595 160 l-20 30 M665 160 l20 30`} stroke={C.muted} strokeWidth={1.2} strokeDasharray="3 3" fill="none" />
            <text x={95} y={205} className="lbl" textAnchor="middle">…</text>
            <text x={630} y={205} className="lbl" textAnchor="middle">…</text>

            {/* root */}
            <Node x={280} y={20} w={160} h={40} hot={hotRoot} dim={mode === 'structure' && step < 2}>
              {ROOT.map((k, i) => (
                <g key={k}>
                  {i > 0 && <line x1={280 + i * 53.3} y1={20} x2={280 + i * 53.3} y2={60} stroke={hotRoot ? C.hot : C.ink} strokeWidth={1} />}
                  {mode === 'search' && step >= 1 && i === rIdx && <rect x={281 + i * 53.3} y={21} width={51} height={38} fill={C.hot} opacity={0.18} />}
                  <text x={280 + i * 53.3 + 26.6} y={45} textAnchor="middle" fontSize={15} fontWeight={mode === 'search' && step >= 1 && i === rIdx ? 700 : 400} fill={C.text}>{k}</text>
                </g>
              ))}
            </Node>
            <Label x={270} y={45} anchor="end">root</Label>

            {/* branches */}
            <Node x={20} y={120} w={150} h={40} dim>{BRANCHES[0].map((k, i) => <text key={k} x={45 + i * 50} y={145} textAnchor="middle" fontSize={15} fill={C.textMuted}>{k}</text>)}</Node>
            <Node x={560} y={120} w={140} h={40} dim>{BRANCHES[2].map((k, i) => <text key={k} x={595 + i * 70} y={145} textAnchor="middle" fontSize={15} fill={C.textMuted}>{k}</text>)}</Node>
            <Node x={235} y={120} w={240} h={40} hot={hotBranch} dim={mode === 'structure' && step < 1}>
              {BRANCHES[1].map((k, i) => (
                <g key={k}>
                  {i > 0 && <line x1={235 + i * 60} y1={120} x2={235 + i * 60} y2={160} stroke={hotBranch ? C.hot : C.ink} strokeWidth={1} />}
                  {mode === 'search' && step >= 2 && i === bIdx && <rect x={236 + i * 60} y={121} width={58} height={38} fill={C.hot} opacity={0.18} />}
                  <text x={265 + i * 60} y={145} textAnchor="middle" fontSize={15} fontWeight={mode === 'search' && step >= 2 && i === bIdx ? 700 : 400} fill={C.text}>{k}</text>
                </g>
              ))}
            </Node>
            <Label x={225} y={145} anchor="end">branch</Label>

            {/* leaves */}
            {LEAVES.map((rows, i) => {
              const x = leafXs[i];
              const hot = mode === 'search' ? step >= 3 && bIdx === i : hotLeaf;
              return (
                <Node key={i} x={x} y={leafY} w={130} h={96} hot={hot} dim={mode === 'structure' ? false : !hot && step >= 3}>
                  {rows.map(([k, rid], r) => {
                    const sel = mode === 'search' && step >= 3 && bIdx === i && r === rowIdx;
                    return (
                      <g key={r}>
                        {sel && <rect x={x + 1} y={leafY + 4 + r * 30} width={128} height={28} fill={C.hot} opacity={0.18} />}
                        <text x={x + 12} y={leafY + 24 + r * 30} fontSize={13} fill={C.text} fontWeight={sel ? 700 : 400}>{k}</text>
                        <text x={x + 44} y={leafY + 24 + r * 30} fontSize={13} fill={C.textMuted}>{rid}</text>
                      </g>
                    );
                  })}
                </Node>
              );
            })}
            {/* leaf chain */}
            {[0, 1, 2].map((i) => (
              <Arrow key={i} x1={leafXs[i] + 130} y1={leafY + 48} x2={leafXs[i + 1]} y2={leafY + 48} both width={1.6} hot={false} dim={false} />
            ))}
            <g>
              <Label x={50} y={leafY + 118}>leaf nodes: key + ROWID, doubly linked</Label>
            </g>
          </svg>
        );
      }}
    </Stepper>
  );
}
