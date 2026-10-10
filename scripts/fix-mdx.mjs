// Normalises MDX patterns that Astro's MDX compiler rejects:
//  1. blank lines / raw < > { } inside <pre> blocks → removed / escaped
//  2. <KeyIdea>/<Callout> whose multi-line content starts on the tag line → tag on its own line with blank lines around the content
// Run: node scripts/fix-mdx.mjs [path-prefix]
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
const prefix = process.argv[2] || 'src/content';
const files = []; const walk = (d) => { for (const f of readdirSync(d)) { const p = join(d, f); statSync(p).isDirectory() ? walk(p) : p.endsWith('.mdx') && files.push(p); } }; statSync(prefix).isDirectory() ? walk(prefix) : files.push(prefix);
let changed = 0;
for (const f of files) {
  let s = readFileSync(f, 'utf8'); const o = s;
  s = s.replace(/(<pre[^>]*>)([\s\S]*?)(<\/pre>)/g, (m, a, inner, c) => a + inner.replace(/\n[ \t]*\n+/g, '\n').replace(/<(?!\/?(b|i|em|strong|code|span)\b)/g, '&lt;').replace(/(?<!<\/?(?:b|i|em|strong|code|span))>/g, '&gt;').replace(/\{/g, '&#123;').replace(/\}/g, '&#125;').replace(/\*/g, '&#42;').replace(/_/g, '&#95;') + c);
  for (const tag of ['KeyIdea', 'Callout']) {
    const re = new RegExp(`<${tag}(\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, 'g');
    s = s.replace(re, (m, attrs, inner) => {
      const body = inner.trim();
      if (!body.includes('\n')) return `<${tag}${attrs || ''}>${body}</${tag}>`;
      return `<${tag}${attrs || ''}>\n\n${body}\n\n</${tag}>`;
    });
  }
  if (s !== o) { writeFileSync(f, s); changed++; }
}
console.log(`${files.length} files scanned, ${changed} changed`);
