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

/**
 * The two "slow index" ingredients drawn as one figure: a range scan that
 * follows the leaf chain, then one table access per matching ROWID.
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
  const blocks = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => ({ x: 560 + (i % 3) * 52, y: 40 + Math.floor(i / 3) * 64 }));
  const targets = [7, 1, 10, 4, 9, 2, 11, 6].slice(0, R);
  return (
    <Stepper n={n} title={title ?? (unique ? 'Index unique scan and table access' : 'Index range scan and table access')} steps={steps}>
      {(step) => {
        const last = unique ? 1 : 2;
        const chain = unique ? false : step >= 1;
        const table = step >= last;
        const nodeReads = 2 + (chain ? L : 1);
        return (
          <svg viewBox="0 0 720 320" className="fig-svg" role="img" aria-label="A tree traversal, a range scan across leaf nodes, and table accesses by ROWID">
            {/* tree */}
            <Node x={200} y={20} w={100} h={32} hot><text x={250} y={41} textAnchor="middle" fontSize={13} fill={C.text}>root</text></Node>
            <Node x={200} y={88} w={100} h={32} hot><text x={250} y={109} textAnchor="middle" fontSize={13} fill={C.text}>branch</text></Node>
            <Arrow x1={250} y1={52} x2={250} y2={86} hot />
            <Arrow x1={250} y1={120} x2={leafXs[0] + 55} y2={170} hot />
            {/* leaves */}
            {leafXs.map((x, i) => {
              const hot = i === 0 || (chain && i < L);
              return (
                <g key={i}>
                  <Node x={x} y={172} w={110} h={100} hot={hot} dim={!hot}>
                    {[0, 1, 2].map((r) => (
                      <g key={r}>
                        <circle cx={x + 16} cy={172 + 20 + r * 30} r={4} fill={hot ? C.hot : C.muted} />
                        <text x={x + 30} y={172 + 25 + r * 30} fontSize={12} fill={hot ? C.text : C.textMuted}>key · rowid</text>
                      </g>
                    ))}
                  </Node>
                  {i < leafXs.length - 1 && <Arrow x1={x + 110} y1={222} x2={leafXs[i + 1]} y2={222} both width={1.6} hot={chain && i < L - 1} dim={!(chain && i < L - 1)} />}
                </g>
              );
            })}
            <Label x={20} y={296}>index leaf nodes</Label>
            {/* table */}
            <Label x={560} y={28}>table blocks</Label>
            {blocks.map((b, i) => {
              const hit = table && targets.includes(i);
              return <rect key={i} x={b.x} y={b.y} width={44} height={52} rx={3} fill={hit ? C.hotBg : C.table} stroke={hit ? C.hot : C.muted} strokeWidth={hit ? 2 : 1} strokeDasharray={hit ? undefined : '3 3'} />;
            })}
            {table && targets.map((t, i) => {
              const leaf = Math.min(L - 1, Math.floor(i / 3));
              const row = i % 3;
              const sx = leafXs[leaf] + 110, sy = 172 + 20 + row * 30;
              const b = blocks[t];
              return <Arrow key={i} x1={sx} y1={sy} x2={b.x} y2={b.y + 26} hot width={1.4} />;
            })}
            <Chip x={560} y={240} hot={table}>{`${nodeReads} index reads · ${table ? R : 0} table reads`}</Chip>
          </svg>
        );
      }}
    </Stepper>
  );
}
