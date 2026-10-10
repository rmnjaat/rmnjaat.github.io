// Every internal href in dist/ must resolve. Run after `npm run build`: node scripts/check-links.mjs
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
const files = []; const walk = (d) => { for (const f of readdirSync(d)) { const p = join(d, f); statSync(p).isDirectory() ? walk(p) : p.endsWith('.html') && files.push(p); } }; walk('dist');
let bad = 0, total = 0; const seen = new Set();
for (const f of files) for (const m of readFileSync(f, 'utf8').matchAll(/href="(\/[^"#?]*)(#[^"]*)?"/g)) {
  const href = m[1]; total++; if (seen.has(href)) continue; seen.add(href);
  const p = href.endsWith('/') ? join('dist', href, 'index.html') : existsSync(join('dist', href)) ? join('dist', href) : join('dist', href, 'index.html');
  if (!existsSync(p)) { bad++; console.log(`MISSING ${href}  (from ${f.replace('dist/', '')})`); }
}
console.log(`${total} internal links, ${seen.size} unique, ${bad} missing`);
process.exit(bad ? 1 : 0);
