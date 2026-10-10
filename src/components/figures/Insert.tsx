import Stepper, { Node, Arrow, Label, C } from './Stepper';

/** Inserting key 56: walk to the leaf, the full leaf splits, the new key is promoted. */
const LX = [40, 200, 360, 520];
export default function Insert({ n = '1.4', title = 'Inserting key 56: find the leaf, split it, promote a key' }: { n?: string; title?: string }) {
  const steps = [
    { label: 'Start', text: 'INSERT INTO employees … employee_id = 56. Every index on the table has to store the new entry.' },
    { label: '1 · Find the leaf', text: 'Same walk as a lookup: root 83 ≥ 56, branch 57 ≥ 56. The entry belongs in the third leaf.' },
    { label: '2 · Leaf is full', text: 'That leaf already holds its maximum of three entries. It cannot take a fourth.' },
    { label: '3 · Split', text: 'The leaf becomes two half-full leaves, 55 · 56 and 57 · 57. The neighbours shift and relink.' },
    { label: '4 · Promote', text: 'The largest key of the new left leaf, 56, is promoted into the branch node. The tree is balanced again at the same depth.' },
  ];
  return (
    <Stepper n={n} title={title} steps={steps}>
      {(s) => {
        const split = s >= 3; const promoted = s >= 4;
        const l2x = LX[2], newX = LX[2] + 160, l3x = LX[3] + (split ? 175 : 0);
        return (
          <svg viewBox="0 0 880 330" className="fig-svg" role="img" aria-label="A B-tree while key 56 is inserted">
            {/* pointers */}
            <Arrow x1={306} y1={60} x2={95} y2={120} dim head={false} />
            <Arrow x1={360} y1={60} x2={355} y2={120} hot={s >= 1} dim={s < 1} head={false} />
            <Arrow x1={414} y1={60} x2={720} y2={120} dim head={false} />
            {LX.map((x, i) => <Arrow key={i} x1={265 + i * 60} y1={160} x2={(i === 3 ? l3x : x) + 65} y2={240} hot={s >= 1 && i === 2} dim={!(s >= 1 && i === 2)} head={false} />)}
            {/* root */}
            <Node x={280} y={20} w={160} h={40}>
              <line x1={333} y1={20} x2={333} y2={60} stroke={C.ink} /><line x1={387} y1={20} x2={387} y2={60} stroke={C.ink} />
              <text x={306} y={45} textAnchor="middle" fontSize={14} fill={C.text}>39</text>
              <text x={360} y={45} textAnchor="middle" fontSize={14} fill={s >= 1 ? C.hot : C.text} fontWeight={s >= 1 ? 700 : 400}>83</text>
              <text x={414} y={45} textAnchor="middle" fontSize={14} fill={C.text}>98</text>
            </Node>
            <Label x={270} y={45} anchor="end">root</Label>
            {/* outer branches */}
            <Node x={20} y={120} w={150} h={40} dim><text x={95} y={145} textAnchor="middle" fontSize={13} fill={C.textMuted}>11 · 23 · 39</text></Node>
            <Node x={640} y={120} w={160} h={40} dim><text x={720} y={145} textAnchor="middle" fontSize={13} fill={C.textMuted}>91 · 98</text></Node>
            {/* branch: 4 cells, or 5 when promoted */}
            {!promoted ? (
              <Node x={235} y={120} w={240} h={40}>
                {[295, 355, 415].map((x) => <line key={x} x1={x} y1={120} x2={x} y2={160} stroke={C.ink} />)}
                {[46, 53, 57, 83].map((k, i) => <text key={k} x={265 + i * 60} y={145} textAnchor="middle" fontSize={14} fill={s >= 1 && k === 57 ? C.hot : C.text} fontWeight={s >= 1 && k === 57 ? 700 : 400}>{k}</text>)}
              </Node>
            ) : (
              <Node x={225} y={120} w={290} h={40}>
                {[283, 341, 399, 457].map((x) => <line key={x} x1={x} y1={120} x2={x} y2={160} stroke={C.ink} />)}
                <rect x={342} y={121} width={56} height={38} fill={C.hot} opacity={0.18} />
                {[46, 53, 56, 57, 83].map((k, i) => <text key={k} x={254 + i * 58} y={145} textAnchor="middle" fontSize={14} fill={k === 56 ? C.hot : C.text} fontWeight={k === 56 ? 700 : 400}>{k}</text>)}
              </Node>
            )}
            <Label x={225} y={145} anchor="end">branch</Label>
            {/* leaves */}
            {[[[40, '4A 1B'], [43, '9F 71'], [46, 'A2 D2']], [[46, '8B 1C'], [53, 'A0 A1'], [53, '0D 79']]].map((rows, i) => (
              <Node key={i} x={LX[i]} y={240} w={130} h={80}>
                {rows.map(([k, rid], r) => <g key={r}><text x={LX[i] + 12} y={261 + r * 24} fontSize={12.5} fill={C.text}>{k}</text><text x={LX[i] + 44} y={261 + r * 24} fontSize={12} fill={C.textMuted}>{rid}</text></g>)}
              </Node>
            ))}
            {/* leaf 2: full, then split */}
            <Node x={l2x} y={240} w={130} h={80} hot={s === 2}>
              {(split ? [[55, '9C F6'], [56, '7E 0A']] : [[55, '9C F6'], [57, 'B1 C1'], [57, '50 29']]).map(([k, rid], r) => (
                <g key={r}><text x={l2x + 12} y={261 + r * 24} fontSize={12.5} fill={k === 56 ? C.hot : C.text} fontWeight={k === 56 ? 700 : 400}>{k}</text><text x={l2x + 44} y={261 + r * 24} fontSize={12} fill={C.textMuted}>{rid}</text></g>
              ))}
              {split && <text x={l2x + 65} y={309} textAnchor="middle" className="lbl">room for 1 more</text>}
              {s === 2 && <text x={l2x + 65} y={309} textAnchor="middle" fontSize={11} fill={C.hot} fontFamily="var(--font-sans)">full: 3 of 3</text>}
            </Node>
            {split && (
              <Node x={newX} y={240} w={130} h={80}>
                <text x={newX + 12} y={261} fontSize={12.5} fill={C.text}>57</text><text x={newX + 44} y={261} fontSize={12} fill={C.textMuted}>B1 C1</text>
                <text x={newX + 12} y={285} fontSize={12.5} fill={C.text}>57</text><text x={newX + 44} y={285} fontSize={12} fill={C.textMuted}>50 29</text>
                <text x={newX + 65} y={309} textAnchor="middle" fontSize={11} fill={C.cool} fontFamily="var(--font-sans)">new leaf</text>
              </Node>
            )}
            <Node x={l3x} y={240} w={130} h={80}>
              {[[67, 'C4 6B'], [83, 'FF 9D'], [83, 'AF E9']].map(([k, rid], r) => <g key={r}><text x={l3x + 12} y={261 + r * 24} fontSize={12.5} fill={C.text}>{k}</text><text x={l3x + 44} y={261 + r * 24} fontSize={12} fill={C.textMuted}>{rid}</text></g>)}
            </Node>
            {/* chain */}
            <Arrow x1={LX[0] + 130} y1={280} x2={LX[1]} y2={280} both width={1.4} />
            <Arrow x1={LX[1] + 130} y1={280} x2={l2x} y2={280} both width={1.4} />
            {split ? <><Arrow x1={l2x + 130} y1={280} x2={newX} y2={280} both width={1.4} /><Arrow x1={newX + 130} y1={280} x2={l3x} y2={280} both width={1.4} /></> : <Arrow x1={l2x + 130} y1={280} x2={l3x} y2={280} both width={1.4} />}
            {/* travelling entry */}
            {(s === 1 || s === 2) && (
              <g transform={s === 1 ? 'translate(330 2)' : `translate(${l2x + 36} 292)`}>
                <rect width={60} height={24} rx={12} fill={C.hotBg} stroke={C.hot} />
                <text x={30} y={16} textAnchor="middle" fontSize={11} fill={C.hot} fontWeight={700}>56 · 7E 0A</text>
              </g>
            )}
            {promoted && <g><rect x={700} y={200} width={160} height={26} rx={13} fill="var(--ok-bg)" /><text x={780} y={217} textAnchor="middle" fontSize={11} fill="var(--ok)" fontFamily="var(--font-sans)">balanced · depth unchanged</text></g>}
          </svg>
        );
      }}
    </Stepper>
  );
}
