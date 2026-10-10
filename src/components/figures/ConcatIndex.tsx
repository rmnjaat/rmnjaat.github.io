import { useState } from 'react';
import Stepper, { Node, Arrow, Label, C } from './Stepper';

/** Twelve (employee_id, subsidiary_id) pairs. Subsidiary 20 has four employees. */
const ROWS: [number, number][] = [[123, 20], [123, 21], [123, 27], [124, 10], [124, 20], [125, 30], [126, 20], [126, 21], [127, 20], [128, 10], [128, 30], [129, 30]];

interface Props { n?: string; title?: string; subsidiary?: number }

/**
 * Column order in a concatenated index. The same entries, sorted two ways;
 * the rows for one subsidiary are scattered in one order and adjacent in the other.
 */
export default function ConcatIndex({ n = '2.1', title = 'Concatenated index: column order decides what the index can do', subsidiary = 20 }: Props) {
  const [order, setOrder] = useState<'emp' | 'sub'>('emp');
  const sorted = [...ROWS].sort((a, b) => order === 'emp' ? a[0] - b[0] || a[1] - b[1] : a[1] - b[1] || a[0] - b[0]);
  const steps = order === 'emp'
    ? [
        { label: 'Index on (employee_id, subsidiary_id)', text: 'Entries are sorted by employee_id first; subsidiary_id only breaks ties. Like a phone book sorted by last name then first name.' },
        { label: `WHERE subsidiary_id = ${subsidiary}`, text: `The matching entries are spread across the whole index. There is no range to scan, so the database cannot use this index for the query and reads the entire table instead.` },
      ]
    : [
        { label: 'Index on (subsidiary_id, employee_id)', text: 'Same entries, columns swapped: sorted by subsidiary_id first. Lookups on both columns still work, because the first column is still the first thing the tree sees.' },
        { label: `WHERE subsidiary_id = ${subsidiary}`, text: `Now all entries for subsidiary ${subsidiary} sit next to each other. One tree traversal, a short range scan, done.` },
      ];
  const toggle = (
    <div className="seg" role="group" aria-label="Column order">
      <button type="button" aria-pressed={order === 'emp'} onClick={() => setOrder('emp')}>(employee_id, subsidiary_id)</button>
      <button type="button" aria-pressed={order === 'sub'} onClick={() => setOrder('sub')}>(subsidiary_id, employee_id)</button>
    </div>
  );
  const perLeaf = 3;
  const leafXs = [20, 200, 380, 560];
  return (
    <Stepper n={n} title={title} steps={steps} extra={toggle} key={order}>
      {(step) => {
        const hits = sorted.map((r) => r[1] === subsidiary);
        const hitLeaves = new Set(hits.map((h, i) => h ? Math.floor(i / perLeaf) : -1).filter((i) => i >= 0));
        return (
          <svg viewBox="0 0 720 230" className="fig-svg" role="img" aria-label="Index leaf entries sorted by the chosen column order; matching entries are highlighted">
            <Label x={20} y={24}>{order === 'emp' ? 'employee_id · subsidiary_id · rowid' : 'subsidiary_id · employee_id · rowid'}</Label>
            {leafXs.map((x, li) => {
              const hot = step >= 1 && hitLeaves.has(li);
              return (
                <g key={li}>
                  <Node x={x} y={40} w={140} h={110} hot={hot}>
                    {sorted.slice(li * perLeaf, li * perLeaf + perLeaf).map((r, ri) => {
                      const i = li * perLeaf + ri;
                      const sel = step >= 1 && hits[i];
                      const a = order === 'emp' ? r[0] : r[1];
                      const b = order === 'emp' ? r[1] : r[0];
                      return (
                        <g key={ri}>
                          {sel && <rect x={x + 1} y={41 + ri * 36} width={138} height={34} fill={C.hot} opacity={0.18} />}
                          <text x={x + 12} y={64 + ri * 36} fontSize={13} fill={C.text} fontWeight={sel ? 700 : 400}>{a}</text>
                          <text x={x + 56} y={64 + ri * 36} fontSize={13} fill={C.text} fontWeight={sel ? 700 : 400}>{b}</text>
                          <text x={x + 92} y={64 + ri * 36} fontSize={12} fill={C.textMuted}>{(0x3a + i * 7).toString(16).toUpperCase()} {(0x91 + i * 13 % 200).toString(16).toUpperCase()}</text>
                        </g>
                      );
                    })}
                  </Node>
                  {li < leafXs.length - 1 && <Arrow x1={x + 140} y1={95} x2={leafXs[li + 1]} y2={95} both width={1.6} />}
                </g>
              );
            })}
            <text x={20} y={190} fontSize={13} fontFamily="var(--font-sans)" fill={step >= 1 ? (order === 'emp' ? C.hot : C.cool) : C.textMuted}>
              {step < 1
                ? `${ROWS.length} entries in 4 leaf nodes, ${perLeaf} per leaf, sorted by ${order === 'emp' ? 'employee_id' : 'subsidiary_id'} first`
                : order === 'emp' ? `subsidiary ${subsidiary}: ${hitLeaves.size} of 4 leaves, no usable range → full table scan` : `subsidiary ${subsidiary}: ${hitLeaves.size} adjacent leaf${hitLeaves.size > 1 ? 'ves' : ''} → index range scan`}
            </text>
          </svg>
        );
      }}
    </Stepper>
  );
}
