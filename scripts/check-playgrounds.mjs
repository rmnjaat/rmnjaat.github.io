// Execute every Playground / TryIt sql+setup against a fresh sql.js database. Run: node scripts/check-playgrounds.mjs [path-prefix]
import initSqlJs from 'sql.js';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
const SQL = await initSqlJs();
const schema = readFileSync('public/schema.sql', 'utf8');
const prefix = process.argv[2] || 'src/content';
const files = []; const walk = (d) => { for (const f of readdirSync(d)) { const p = join(d, f); statSync(p).isDirectory() ? walk(p) : p.endsWith('.mdx') && files.push(p); } }; walk(prefix);
let n = 0, bad = 0;
const lit = (chunk, name) => { const m = chunk.match(new RegExp(name + '=\\{`([\\s\\S]*?)`\\}')) || chunk.match(new RegExp(name + '="([^"]*)"')); return m ? m[1] : null; };
for (const f of files) {
  const src = readFileSync(f, 'utf8');
  const parts = src.split(/(?=<(?:Playground|TryIt)\b)/g).slice(1);
  for (const part of parts) {
    const head = part.split(/<Fragment|\/>\n|<\/TryIt>/)[0];
    const sql = lit(head, 'sql'); if (!sql) continue; const setup = lit(head, 'setup'); const title = lit(head, 'title') || lit(head, 'id') || '?';
    n++; const db = new SQL.Database(); db.run(schema);
    try {
      if (setup) db.run(setup);
      const stmt = sql.trim().replace(/;\s*$/, ''); const t0 = performance.now(); const res = db.exec(stmt); const ms = (performance.now() - t0).toFixed(1);
      let plan = ''; if (/^\s*(select|with)/i.test(stmt)) { const p = db.exec(`EXPLAIN QUERY PLAN ${stmt}`); plan = p[0] ? p[0].values.map((r) => r[3]).join(' | ') : ''; }
      console.log(`OK  ${f.replace('src/content/', '')} [${title}] rows=${res[0]?.values.length ?? 0} ${ms}ms :: ${plan}`);
    } catch (e) { bad++; console.log(`ERR ${f.replace('src/content/', '')} [${title}] ${e.message}\n    SQL: ${sql.replace(/\s+/g, ' ').slice(0, 140)}\n    SETUP: ${(setup ?? '').replace(/\s+/g, ' ').slice(0, 140)}`); }
    db.close();
  }
}
console.log(`${n} playgrounds, ${bad} errors`);
process.exit(bad ? 1 : 0);
