// Responsive QA over the built site. Serves dist/ itself, drives headless Chrome over the DevTools protocol.
// Usage: node scripts/qa-viewports.mjs [--urls /,/sql/anatomy/the-tree/] [--viewports 360,768,1440] [--shots dir]
// Checks per page × viewport: horizontal page overflow, elements wider than the viewport, overlapping text boxes,
// tap targets under 40px on touch widths, text under 12px, console errors. Writes reports/qa-viewports.md.
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync, mkdirSync, writeFileSync, readdirSync } from 'node:fs';
import { join, extname } from 'node:path';

const args = Object.fromEntries(process.argv.slice(2).map((a) => a.split('=')).map(([k, v]) => [k.replace(/^--/, ''), v ?? true]));
const CH = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const VIEWPORTS = (args.viewports ? String(args.viewports).split(',').map(Number) : [360, 390, 768, 1024, 1440]).map((w) => ({ w, h: w < 500 ? 800 : w < 900 ? 1024 : 900, mobile: w < 900 }));
const shotsDir = args.shots ? String(args.shots) : null; if (shotsDir) mkdirSync(shotsDir, { recursive: true });

// --- static server for dist ---
const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.wasm': 'application/wasm', '.woff2': 'font/woff2', '.woff': 'font/woff', '.sql': 'text/plain', '.txt': 'text/plain', '.xml': 'application/xml', '.pf_meta': 'application/octet-stream', '.pf_index': 'application/octet-stream', '.pf_fragment': 'application/octet-stream', '.pagefind': 'application/octet-stream' };
const server = createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let f = join('dist', p); if (existsSync(f) && statSync(f).isDirectory()) f = join(f, 'index.html');
  if (!existsSync(f)) { res.writeHead(404); res.end('not found'); return; }
  res.writeHead(200, { 'content-type': MIME[extname(f)] || 'application/octet-stream' }); res.end(readFileSync(f));
});
await new Promise((r) => server.listen(0, '127.0.0.1', r)); const port = server.address().port;

// --- pages ---
let urls;
if (args.urls) urls = String(args.urls).split(',');
else { urls = []; const walk = (d, rel) => { for (const f of readdirSync(d)) { const p = join(d, f); if (statSync(p).isDirectory()) walk(p, rel + f + '/'); else if (f === 'index.html') urls.push(rel); } }; walk('dist', '/'); urls = urls.filter((u) => !u.startsWith('/pagefind')); }

// --- chrome ---
const cdpPort = 9222 + Math.floor(Math.random() * 500);
const chrome = spawn(CH, ['--headless=new', '--disable-gpu', '--hide-scrollbars', `--remote-debugging-port=${cdpPort}`, `--user-data-dir=/tmp/qa-profile-${cdpPort}`, 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let targets; for (let i = 0; i < 40; i++) { try { targets = await (await fetch(`http://127.0.0.1:${cdpPort}/json`)).json(); if (targets.length) break; } catch {} await sleep(250); }
const ws = new WebSocket(targets.find((t) => t.type === 'page').webSocketDebuggerUrl); await new Promise((r) => ws.addEventListener('open', r));
let id = 0; const pending = new Map(); let errs = [];
ws.addEventListener('message', (m) => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); } if (d.method === 'Runtime.exceptionThrown') errs.push(d.params.exceptionDetails.exception?.description?.split('\n')[0] ?? 'exception'); if (d.method === 'Log.entryAdded' && d.params.entry.level === 'error' && !/favicon/.test(d.params.entry.text)) errs.push(d.params.entry.text.slice(0, 160)); });
const send = (method, params = {}) => new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async (expression) => { const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }); if (r.result?.exceptionDetails) throw new Error(r.result.exceptionDetails.text); return r.result?.result?.value; };
await send('Page.enable'); await send('Runtime.enable'); await send('Log.enable');

const AUDIT = `(() => {
  const vw = document.documentElement.clientWidth; const out = { overflow: document.documentElement.scrollWidth > vw + 1, wide: [], overlaps: [], small: [], tiny: [] };
  const desc = (e) => (e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (e.className && typeof e.className === 'string' ? '.' + e.className.trim().split(/\\s+/).slice(0, 2).join('.') : '')).slice(0, 60);
  const vis = (e) => { const cs = getComputedStyle(e); return cs.display !== 'none' && cs.visibility !== 'hidden' && e.getClientRects().length; };
  const all = [...document.querySelectorAll('body *')].filter(vis);
  for (const e of all) { const r = e.getBoundingClientRect(); const inScroll = (() => { let p = e.parentElement; while (p && p !== document.body) { const o = getComputedStyle(p).overflowX; if (o === 'auto' || o === 'scroll' || o === 'hidden') return true; p = p.parentElement; } return false; })(); if (r.width > 0 && (r.right > vw + 1 || r.left < -1) && !inScroll) { const cs = getComputedStyle(e); if (cs.position !== 'fixed') out.wide.push(desc(e) + ' right=' + Math.round(r.right)); } }
  // text leaves: elements whose direct text is non-empty
  const textEls = all.filter((e) => [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 2) && !e.closest('svg') && !['inline', 'contents'].includes(getComputedStyle(e).display));
  const boxes = textEls.map((e) => ({ e, r: e.getBoundingClientRect() })).filter(({ r }) => r.width > 4 && r.height > 4 && r.bottom > 0 && r.top < document.documentElement.scrollHeight);
  for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
    const a = boxes[i], b = boxes[j]; if (a.e.contains(b.e) || b.e.contains(a.e)) continue;
    const x = Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left), y = Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top);
    if (x > 6 && y > 6) { const inter = x * y, small = Math.min(a.r.width * a.r.height, b.r.width * b.r.height); if (inter / small > 0.25 && !a.e.closest('dialog, [hidden], .hintrow') && !b.e.closest('dialog, [hidden]')) out.overlaps.push(desc(a.e) + ' × ' + desc(b.e)); }
    if (out.overlaps.length > 12) break;
  }
  if (vw < 900) for (const e of all.filter((e) => e.matches('a, button, input[type=checkbox], select, summary') && getComputedStyle(e).display !== 'inline')) { const r = e.getBoundingClientRect(); if (r.width > 0 && r.height > 0 && (r.height < 32 || r.width < 32) && !e.closest('.pagefind-ui, dialog, .on-page, .crumb, figcaption, .site-footer, .prose p, .before, .source-note, p, li, td, .summary')) out.small.push(desc(e) + ' ' + Math.round(r.width) + '×' + Math.round(r.height)); }
  for (const e of textEls) { const fs = parseFloat(getComputedStyle(e).fontSize); if (fs < 12 && !e.closest('svg, kbd')) out.tiny.push(desc(e) + ' ' + fs + 'px'); }
  out.wide = [...new Set(out.wide)].slice(0, 10); out.overlaps = [...new Set(out.overlaps)].slice(0, 10); out.small = [...new Set(out.small)].slice(0, 10); out.tiny = [...new Set(out.tiny)].slice(0, 10);
  return out;
})()`;

const report = []; let problems = 0;
for (const url of urls) for (const vp of VIEWPORTS) {
  errs = [];
  await send('Emulation.setDeviceMetricsOverride', { width: vp.w, height: vp.h, deviceScaleFactor: 1, mobile: vp.mobile });
  await send('Page.navigate', { url: `http://127.0.0.1:${port}${url}` });
  await sleep(1400);
  // hydrate islands below the fold, then settle
  await ev(`new Promise(r => { let y = 0; const t = setInterval(() => { y += 900; window.scrollTo(0, y); if (y > document.documentElement.scrollHeight) { clearInterval(t); window.scrollTo(0, 0); r(); } }, 60); })`);
  await sleep(700);
  let a; try { a = await ev(AUDIT); } catch (e) { a = { overflow: false, wide: [], overlaps: [], small: [], tiny: [], err: e.message }; }
  const issues = [];
  if (a.overflow) issues.push('page scrolls horizontally');
  if (a.wide.length) issues.push('wider than viewport: ' + a.wide.join('; '));
  if (a.overlaps.length) issues.push('overlapping text: ' + a.overlaps.join('; '));
  if (a.small.length) issues.push('small tap targets: ' + a.small.join('; '));
  if (a.tiny.length) issues.push('text under 12px: ' + a.tiny.join('; '));
  if (errs.length) issues.push('console: ' + [...new Set(errs)].slice(0, 3).join(' | '));
  if (a.err) issues.push('audit error: ' + a.err);
  if (issues.length) { problems += issues.length; report.push(`### ${url} @ ${vp.w}px\n` + issues.map((i) => `- ${i}`).join('\n')); }
  if (shotsDir) { const s = await send('Page.captureScreenshot', { format: 'png' }); writeFileSync(join(shotsDir, `${url.replace(/\//g, '_') || '_'}@${vp.w}.png`), Buffer.from(s.result.data, 'base64')); }
  process.stdout.write(`${issues.length ? 'X' : '.'}`);
}
process.stdout.write('\n');
ws.close(); chrome.kill(); server.close();
mkdirSync('reports', { recursive: true });
const md = `# Viewport QA\n\n${urls.length} pages × ${VIEWPORTS.map((v) => v.w).join('/')}px · ${problems} findings\n\n${report.join('\n\n') || 'No findings.'}\n`;
writeFileSync(args.out ? String(args.out) : 'reports/qa-viewports.md', md);
console.log(`${urls.length} pages, ${problems} findings → ${args.out || 'reports/qa-viewports.md'}`);
process.exit(0);
