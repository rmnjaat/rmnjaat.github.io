import { useState } from 'react';
import Stepper, { Node, Arrow, Label, Chip, C } from './Stepper';

type Mode = 'nested' | 'hash' | 'merge';
interface Props { n?: string; title?: string; mode?: Mode; switchable?: boolean }

const OUTER = [['s1', 'e2'], ['s2', 'e4'], ['s3', 'e1'], ['s4', 'e2']]; // sales → employee_id
const INNER = ['e1', 'e2', 'e3', 'e4'];

/** The three join algorithms, each with the index strategy it wants. */
export default function Joins({ n = '4.1', title, mode: initial = 'nested', switchable = true }: Props) {
  const [mode, setMode] = useState<Mode>(initial);
  const steps = mode === 'nested'
    ? [
        { label: 'Outer loop', text: 'Nested loops reads the outer table (sales) row by row. For each row it runs the inner query: find the employee with this employee_id.' },
        { label: 'Row 1', text: 'Row s1 needs e2: one index lookup on employees_pk, one table access. Cheap on its own.' },
        { label: 'Row 2', text: 'Row s2 needs e4: another lookup, another table access.' },
        { label: 'Rows 3 and 4', text: 'And so on. One index traversal per outer row. With N outer rows this is N lookups: the N+1 problem when an ORM does it one query at a time, the same cost when the database does it inside one query.' },
      ]
    : mode === 'hash'
    ? [
        { label: 'Build', text: 'Hash join first loads one side, ideally the smaller, into an in-memory hash table keyed by the join column. Only the columns the query needs are copied: select fewer columns, smaller hash table.' },
        { label: 'Probe', text: 'Then it reads the other side once and probes the hash table for each row. No index on the join column helps here; it is one hash lookup per row in memory.' },
        { label: 'Where to index', text: 'Indexes help a hash join only through independent where-clause conditions on each table, because those cut the rows that go into the build and the probe.' },
      ]
    : [
        { label: 'Sort both', text: 'Sort-merge join needs both inputs sorted by the join column. If an index already delivers that order, the sort is free; otherwise the database sorts explicitly.' },
        { label: 'Zip', text: 'Then it walks both sorted lists at once, like closing a zipper: advance whichever side has the smaller key, emit a row when the keys match.' },
        { label: 'When it wins', text: 'One pass over each side, no repeated lookups. Good for large inputs that are already ordered; rarely chosen otherwise because the sort costs as much as a hash build.' },
      ];
  const toggle = switchable ? (
    <div className="seg" role="group" aria-label="Join algorithm">
      <button type="button" aria-pressed={mode === 'nested'} onClick={() => setMode('nested')}>Nested loops</button>
      <button type="button" aria-pressed={mode === 'hash'} onClick={() => setMode('hash')}>Hash join</button>
      <button type="button" aria-pressed={mode === 'merge'} onClick={() => setMode('merge')}>Sort-merge</button>
    </div>
  ) : undefined;
  const titles: Record<Mode, string> = { nested: 'Nested loops join: one index lookup per outer row', hash: 'Hash join: build once, probe once', merge: 'Sort-merge join: two sorted inputs, one pass' };
  return (
    <Stepper key={mode} n={n} title={title ?? titles[mode]} steps={steps} extra={toggle}>
      {(step) => (
        <svg viewBox="0 0 720 260" className="fig-svg" role="img" aria-label={titles[mode]}>
          {mode === 'nested' && (
            <g>
              <Label x={20} y={28}>sales (outer)</Label>
              {OUTER.map(([s, e], i) => {
                const active = step >= 1 && (step === 1 ? i === 0 : step === 2 ? i === 1 : true);
                return (
                  <g key={s}>
                    <Node x={20} y={40 + i * 48} w={120} h={36} hot={active} dim={step >= 1 && !active}>
                      <text x={32} y={63 + i * 48} fontSize={13} fill={C.text}>{s}</text>
                      <text x={80} y={63 + i * 48} fontSize={13} fill={C.textMuted}>→ {e}</text>
                    </Node>
                    {active && <Arrow x1={140} y1={58 + i * 48} x2={240} y2={58 + i * 48} hot />}
                  </g>
                );
              })}
              <Node x={242} y={40} w={150} h={36} hot={step >= 1}><text x={317} y={63} textAnchor="middle" fontSize={13} fill={C.text}>employees_pk</text></Node>
              <Label x={242} y={100}>index traversal</Label>
              <Arrow x1={392} y1={58} x2={480} y2={58} hot={step >= 1} />
              <Label x={482} y={28}>employees</Label>
              {INNER.map((e, i) => {
                const hit = step >= 1 && (step === 1 ? e === 'e2' : step === 2 ? e === 'e4' : ['e1', 'e2', 'e4'].includes(e));
                return (
                  <rect key={e} x={482 + i * 52} y={40} width={44} height={36} rx={3} fill={hit ? C.hotBg : C.table} stroke={hit ? C.hot : C.muted} strokeDasharray={hit ? undefined : '3 3'} />
                );
              })}
              {INNER.map((e, i) => <text key={e} x={504 + i * 52} y={63} textAnchor="middle" fontSize={12} fill={C.text}>{e}</text>)}
              <Chip x={482} y={110} hot={step >= 1}>{`lookups: ${step === 0 ? 0 : step === 1 ? 1 : step === 2 ? 2 : OUTER.length}`}</Chip>
              <text x={482} y={160} fontSize={13} fontFamily="var(--font-sans)" fill={C.textMuted}>{step === 3 ? 'index on the inner join column pays off' : ''}</text>
            </g>
          )}
          {mode === 'hash' && (
            <g>
              <Label x={20} y={28}>employees (build side)</Label>
              {INNER.map((e, i) => (
                <g key={e}>
                  <Node x={20} y={40 + i * 40} w={90} h={30} hot={step === 0} dim={step > 0}><text x={65} y={60 + i * 40} textAnchor="middle" fontSize={13} fill={C.text}>{e}</text></Node>
                  {step === 0 && <Arrow x1={110} y1={55 + i * 40} x2={230} y2={82 + ((i * 7) % 4) * 28} hot width={1.2} />}
                </g>
              ))}
              <Node x={232} y={60} w={150} h={130} hot={step <= 1}>
                <text x={307} y={52} textAnchor="middle" className="lbl">hash table (memory)</text>
                {[0, 1, 2, 3].map((b) => <g key={b}><line x1={232} y1={60 + b * 32 + 32} x2={382} y2={60 + b * 32 + 32} stroke={C.muted} /><text x={244} y={82 + b * 32} fontSize={12} fill={C.textMuted}>bucket {b}</text></g>)}
              </Node>
              <Label x={480} y={28}>sales (probe side)</Label>
              {OUTER.map(([s, e], i) => (
                <g key={s}>
                  <Node x={480} y={40 + i * 40} w={110} h={30} hot={step === 1} dim={step !== 1}><text x={495} y={60 + i * 40} fontSize={13} fill={C.text}>{s}</text><text x={540} y={60 + i * 40} fontSize={13} fill={C.textMuted}>→ {e}</text></Node>
                  {step === 1 && <Arrow x1={480} y1={55 + i * 40} x2={384} y2={82 + ((i * 5) % 4) * 28} hot width={1.2} />}
                </g>
              ))}
              {step === 2 && (
                <g>
                  <text x={20} y={222} fontSize={13} fontFamily="var(--font-sans)" fill={C.cool}>index where-clause columns on each side, not the join column</text>
                </g>
              )}
            </g>
          )}
          {mode === 'merge' && (
            <g>
              <Label x={20} y={28}>employees, sorted by employee_id</Label>
              {['e1', 'e2', 'e3', 'e4'].map((e, i) => <Node key={e} x={20 + i * 70} y={40} w={60} h={32} hot={step >= 1 && i < 2} dim={step === 0 ? false : i >= 2}><text x={50 + i * 70} y={61} textAnchor="middle" fontSize={13} fill={C.text}>{e}</text></Node>)}
              <Label x={304} y={161}>sales, sorted by employee_id</Label>
              {['e1', 'e2', 'e2', 'e4'].map((e, i) => <Node key={i} x={20 + i * 70} y={140} w={60} h={32} hot={step >= 1 && i < 3} dim={step === 0 ? false : i >= 3}><text x={50 + i * 70} y={161} textAnchor="middle" fontSize={13} fill={C.text}>{e}</text></Node>)}
              {step >= 1 && (
                <g>
                  <Arrow x1={50} y1={72} x2={50} y2={138} hot />
                  <Arrow x1={120} y1={72} x2={120} y2={138} hot />
                  <Arrow x1={120} y1={72} x2={190} y2={138} hot />
                  <text x={330} y={100} fontSize={13} fontFamily="var(--font-sans)" fill={C.hot}>advance the smaller key, emit on match</text>
                </g>
              )}
              {step === 0 && <text x={330} y={100} fontSize={13} fontFamily="var(--font-sans)" fill={C.textMuted}>an index in join-column order makes this sort free</text>}
              {step === 2 && <text x={20} y={222} fontSize={13} fontFamily="var(--font-sans)" fill={C.cool}>one pass per side, no repeated lookups</text>}
            </g>
          )}
        </svg>
      )}
    </Stepper>
  );
}
