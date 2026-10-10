// Frontmatter + lesson-shape lint. Run: node scripts/lint-content.mjs [path-prefix]
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import YAML from 'yaml';
const prefix = process.argv[2] || 'src/content';
const files = []; const walk = (d) => { for (const f of readdirSync(d)) { const p = join(d, f); statSync(p).isDirectory() ? walk(p) : p.endsWith('.mdx') && files.push(p); } }; walk(prefix);
const comps = ['Callout', 'KeyIdea', 'Figure', 'EngineTabs', 'TryIt', 'Check', 'Playground', 'BTree', 'LeafChain', 'IndexAccess', 'ConcatIndex', 'Joins', 'Pagination', 'ScaleChart', 'Insert'];
const islands = ['Check', 'Playground', 'BTree', 'LeafChain', 'IndexAccess', 'ConcatIndex', 'Joins', 'Pagination', 'ScaleChart', 'Insert'];
let problems = 0; const say = (f, m) => { problems++; console.log(`${f}: ${m}`); };
for (const f of files) {
  const src = readFileSync(f, 'utf8');
  const m = src.match(/^---\n([\s\S]*?)\n---\n/); if (!m) { say(f, 'no frontmatter'); continue; }
  let fm; try { fm = YAML.parse(m[1]); } catch (e) { say(f, `YAML: ${e.message.split('\n')[0]}`); continue; }
  const body = src.slice(m[0].length); const isLesson = f.includes('/lessons/');
  for (const k of ['title', 'subtitle', 'summary']) if (typeof fm[k] !== 'string') say(f, `missing or non-string ${k}`);
  if (isLesson) {
    for (const k of ['chapter', 'order']) if (fm[k] === undefined) say(f, `missing ${k}`);
    if (fm.recap && !Array.isArray(fm.recap)) say(f, 'recap must be a list'); if (fm.recap) for (const r of fm.recap) if (typeof r !== 'string') say(f, 'recap item is not a string (quote strings containing ": ")');
    if (fm.outcomes) for (const r of fm.outcomes) if (typeof r !== 'string') say(f, 'outcome is not a string');
    const kind = fm.kind || 'lesson';
    if (kind === 'lesson') { if (!fm.outcomes?.length) say(f, 'lesson has no outcomes'); if (!fm.recap?.length) say(f, 'lesson has no recap'); if (!fm.source) say(f, 'lesson has no source URL'); if (!/^## \d/m.test(body)) say(f, 'sections are not numbered (## 1. …)'); if (!/<Check\b/.test(body)) say(f, 'no Check'); }
    if (kind === 'quiz' && (body.match(/<Check\b/g) || []).length < 5) say(f, 'unit check has fewer than 5 Check questions');
    if (kind === 'practice' && !/<TryIt\b/.test(body)) say(f, 'practice set has no TryIt');
  } else if (!fm.section) say(f, 'missing section');
  const imported = new Set((body.match(/import \{([^}]*)\} from '@\/components\/mdx'/)?.[1] ?? '').split(',').map((s) => s.trim()).filter(Boolean));
  for (const c of comps) if (new RegExp(`<${c}[\\s/>]`).test(body) && !imported.has(c)) say(f, `uses <${c}> without import`);
  for (const c of islands) { const re = new RegExp(`<${c}(\\s[^>]*)?>`, 'g'); let mm; while ((mm = re.exec(body))) { const tag = body.slice(mm.index, body.indexOf('>', mm.index) + 1); if (!/client:(visible|load|idle)/.test(tag)) say(f, `<${c}> without client directive`); } }
  if (/—/.test(body)) say(f, `em dash ×${(body.match(/—/g) || []).length}`);
  for (const sl of body.match(/slot="([a-z-]+)"/g) ?? []) if (!/slot="(postgresql|mysql|oracle|sql-server|db2|sqlite|caption|hints)"/.test(sl)) say(f, `unknown slot ${sl}`);
}
console.log(`${files.length} files, ${problems} problems`);
process.exit(problems ? 1 : 0);
