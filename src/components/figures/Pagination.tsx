import { useState } from 'react';
import Stepper, { Node, Arrow, Label, Chip, C } from './Stepper';

interface Props { n?: string; title?: string }

/** Offset paging reads everything before the page; seek paging jumps to it. */
export default function Pagination({ n = '7.2', title = 'Fetching the next page: offset versus seek' }: Props) {
  const [mode, setMode] = useState<'offset' | 'seek'>('offset');
  const steps = mode === 'offset'
    ? [
        { label: 'Page 1', text: 'ORDER BY sale_date DESC, FETCH FIRST 10 ROWS: the index delivers the newest rows first. One leaf read.' },
        { label: 'Page 2 · OFFSET 10', text: 'The database has no way to jump to row 11. It reads rows 1 to 10 again, counts them off, and only then returns rows 11 to 20.' },
        { label: 'Page 3 · OFFSET 20', text: 'Rows 1 to 20 are read and discarded. Each page costs more than the last.' },
        { label: 'Page 4 · OFFSET 30', text: 'Four leaves read to return one. Response time grows with the page number, and if a row was inserted in the meantime the page shifts.' },
      ]
    : [
        { label: 'Page 1', text: 'Same first page. The application remembers the last row it showed: its sale_date and sale_id.' },
        { label: 'Page 2 · seek', text: 'WHERE (sale_date, sale_id) < (last_date, last_id): the tree traversal lands directly on the first row after the previous page. One leaf read.' },
        { label: 'Page 3 · seek', text: 'Again one leaf. The rows before it are never touched.' },
        { label: 'Page 4 · seek', text: 'Every page costs the same, and inserted rows cannot shift the page because the boundary is a value, not a count.' },
      ];
  const toggle = (
    <div className="seg" role="group" aria-label="Paging method">
      <button type="button" aria-pressed={mode === 'offset'} onClick={() => setMode('offset')}>Offset</button>
      <button type="button" aria-pressed={mode === 'seek'} onClick={() => setMode('seek')}>Seek</button>
    </div>
  );
  const leafXs = [20, 160, 300, 440, 580];
  return (
    <Stepper key={mode} n={n} title={title} steps={steps} extra={toggle}>
      {(step) => {
        const page = step; // 0..3
        const read = mode === 'offset' ? page + 1 : 1;
        return (
          <svg viewBox="0 0 720 230" className="fig-svg" role="img" aria-label="Leaf nodes in sale_date order; the leaves read for each page are highlighted">
            <Label x={20} y={28}>index on (sale_date, sale_id), newest first</Label>
            <Node x={290} y={44} w={140} h={30} hot={mode === 'seek' && page > 0}><text x={360} y={64} textAnchor="middle" fontSize={13} fill={C.text}>tree traversal</text></Node>
            {mode === 'seek' && page > 0 && <Arrow x1={360} y1={74} x2={leafXs[page] + 60} y2={118} hot />}
            {mode === 'offset' && <Arrow x1={360} y1={74} x2={leafXs[0] + 60} y2={118} hot />}
            {leafXs.map((x, i) => {
              const isPage = i === page;
              const wasted = mode === 'offset' && i < page;
              const hot = isPage || wasted;
              return (
                <g key={i}>
                  <Node x={x} y={120} w={120} h={56} hot={hot} dim={!hot}>
                    <text x={x + 60} y={143} textAnchor="middle" fontSize={13} fill={C.text}>rows {i * 10 + 1}–{i * 10 + 10}</text>
                    <text x={x + 60} y={163} textAnchor="middle" fontSize={12} fill={isPage ? C.hot : C.textMuted} fontFamily="var(--font-sans)">{isPage ? 'returned' : wasted ? 'read, discarded' : ''}</text>
                  </Node>
                  {i < leafXs.length - 1 && <Arrow x1={x + 120} y1={148} x2={leafXs[i + 1]} y2={148} both width={1.6} hot={mode === 'offset' && i < page} dim={!(mode === 'offset' && i < page)} />}
                </g>
              );
            })}
            <Chip x={20} y={196} hot={read > 1}>{`page ${page + 1}: ${read} leaf${read > 1 ? 'ves' : ''} read`}</Chip>
          </svg>
        );
      }}
    </Stepper>
  );
}
