import Stepper, { Node, Arrow, Label, Chip, C } from './Stepper';

interface Props {
  n?: string;
  title?: string;
  /** How many leaf nodes the range scan has to read. */
  leaves?: number;
  /** How many table rows (blocks) match. */
  rows?: number;
  /** A unique scan: one leaf, one row. */
  unique?: boolean;
}

const LEAF_Y = 172, LEAF_W = 110, LEAF_H = 100;
const ROW_Y = [LEAF_Y + 20, LEAF_Y + 44, LEAF_Y + 68]; // entry rows
const CHAIN_Y = LEAF_Y + 88;                            // leaf-to-leaf links, below the rows

/**
 * The two "slow index" ingredients drawn as one figure: a range scan that
 * follows the leaf chain, then one table access per matching ROWID.
 * ROWID arrows start at the right edge of their leaf and are drawn *under*
 * the nodes, so they never cross any text.
 */
export default function IndexAccess({ n = '1.3', title, leaves = 3, rows = 5, unique = false }: Props) {
  const L = unique ? 1 : Math.max(1, Math.min(4, leaves));
  const R = unique ? 1 : Math.max(1, Math.min(8, rows));
  const steps = unique
    ? [
        { label: 'Traverse', text: 'INDEX UNIQUE SCAN: the tree traversal lands on the one leaf entry that can match. Three node reads.' },
        { label: 'Table access', text: 'The entry carries a ROWID. One more read fetches the row from the table. Four block reads in total, and that number does not change as the table grows.' },
      ]
    : [
        { label: 'Traverse', text: 'INDEX RANGE SCAN starts like any lookup: the tree traversal finds the first leaf entry that matches the where clause.' },
        { label: 'Follow the chain', text: `The scan then walks the leaf chain for as long as entries keep matching. Here ${L} leaf node${L > 1 ? 's' : ''} hold matching entries. The tree was fast; this part costs what the data makes it cost.` },
        { label: 'Table access', text: `Every matching entry has a ROWID that points somewhere in the table. ${R} matching rows means up to ${R} table blocks, read one at a time in random order. This is usually the expensive part.` },
      ];
  const leafXs = [20, 150, 280, 410];
  const blocks = [0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => ({ x: 580 + (i % 3) * 52, y: 40 + Math.floor(i / 3) * 62 }));
  const targets = [7, 1, 5, 3, 8, 0, 4, 6].slice(0, R);
  return (
    <Stepper n={n} title={title ?? (unique ? 'Index unique scan and table access' : 'Index range scan and table access')} steps={steps}>
      {(step) => {
        const last = unique ? 1 : 2;
        const chain = unique ? false : step >= 1;
        const table = step >= last;
        const nodeReads = 2 + (chain ? L : 1);
        return (
          <svg viewBox="0 0 740 320" className="fig-svg" role="img" aria-label="A tree traversal, a range scan across leaf nodes, and table accesses by ROWID">
            {/* ROWID arrows first, so the opaque nodes drawn later hide them where they pass behind */}
            {targets.map((t, i) => {
              const leaf = Math.min(L - 1, Math.floor(i / 3));
              const row = i % 3;
              const sx = leafXs[leaf] + LEAF_W, sy = ROW_Y[row];
              const b = blocks[t];
              return <g key={i} style={{ opacity: table ? 1 : 0 }}><Arrow x1={sx} y1={sy} x2={b.x} y2={b.y + 26} hot width={1.4} /></g>;
            })}
            {/* tree */}
            <Node x={200} y={20} w={100} h={32} hot><text x={250} y={41} textAnchor="middle" fontSize={13} fill={C.text}>root</text></Node>
            <Node x={200} y={88} w={100} h={32} hot><text x={250} y={109} textAnchor="middle" fontSize={13} fill={C.text}>branch</text></Node>
            <Arrow x1={250} y1={52} x2={250} y2={86} hot />
            <Arrow x1={250} y1={120} x2={leafXs[0] + 55} y2={LEAF_Y - 2} hot />
            {/* leaves */}
            {leafXs.map((x, i) => {
              const hot = i === 0 || (chain && i < L);
              return (
                <g key={i}>
                  <Node x={x} y={LEAF_Y} w={LEAF_W} h={LEAF_H} hot={hot} dim={!hot}>
                    {[0, 1, 2].map((r) => (
                      <g key={r}>
                        <circle cx={x + 16} cy={ROW_Y[r]} r={4} fill={hot ? C.hot : C.muted} />
                        <text x={x + 30} y={ROW_Y[r] + 4} fontSize={12} fill={hot ? C.text : C.textMuted}>key · rowid</text>
                      </g>
                    ))}
                  </Node>
                  {i < leafXs.length - 1 && <Arrow x1={x + LEAF_W} y1={CHAIN_Y} x2={leafXs[i + 1]} y2={CHAIN_Y} both width={1.6} hot={chain && i < L - 1} dim={!(chain && i < L - 1)} />}
                </g>
              );
            })}
            <Label x={20} y={LEAF_Y + LEAF_H + 22}>index leaf nodes</Label>
            {/* table */}
            <Label x={580} y={28}>table blocks</Label>
            {blocks.map((b, i) => {
              const hit = table && targets.includes(i);
              return <rect key={i} x={b.x} y={b.y} width={44} height={50} rx={3} fill={hit ? C.hotBg : C.table} stroke={hit ? C.hot : C.muted} strokeWidth={hit ? 2 : 1} strokeDasharray={hit ? undefined : '3 3'} />;
            })}
            <Chip x={580} y={240}>{`index reads: ${nodeReads}`}</Chip>
            <Chip x={580} y={270} hot={table}>{`table reads: ${table ? R : 0}`}</Chip>
          </svg>
        );
      }}
    </Stepper>
  );
}
