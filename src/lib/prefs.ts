// Client-side preferences. Everything is stored in localStorage; nothing leaves the browser.
export const KEYS = { engine: 'util:engine', done: 'util:done', last: 'util:last', tasks: 'util:tasks' } as const;

function read(key: string): string | null { try { return localStorage.getItem(key); } catch { return null; } }
function write(key: string, value: string) { try { localStorage.setItem(key, value); } catch { /* private mode etc. */ } }

export function getEngine(): string { return read(KEYS.engine) ?? 'postgresql'; }
export function setEngine(id: string) {
  write(KEYS.engine, id);
  document.documentElement.dataset.engine = id;
  window.dispatchEvent(new CustomEvent('util:engine', { detail: id }));
}

export function getDone(): Set<string> { try { return new Set(JSON.parse(read(KEYS.done) ?? '[]')); } catch { return new Set(); } }
export function markDone(id: string, done = true) {
  const set = getDone();
  if (done) set.add(id); else set.delete(id);
  write(KEYS.done, JSON.stringify([...set]));
  window.dispatchEvent(new CustomEvent('util:done', { detail: [...set] }));
}
/** Share of all course items (lessons, practice sets, unit checks) marked done. */
export function courseProgress(total: number) {
  const n = getDone().size;
  return { done: n, pct: total ? Math.round((n / total) * 100) : 0 };
}

export function getLast(): { id: string; title: string; href: string } | null { try { const v = read(KEYS.last); return v ? JSON.parse(v) : null; } catch { return null; } }
export function setLast(v: { id: string; title: string; href: string }) { write(KEYS.last, JSON.stringify(v)); }

/** Try-it task completion, keyed by lesson id → array of booleans. */
export function getTasks(id: string): boolean[] { try { return JSON.parse(read(KEYS.tasks) ?? '{}')[id] ?? []; } catch { return []; } }
export function setTasks(id: string, v: boolean[]) {
  let all: Record<string, boolean[]> = {}; try { all = JSON.parse(read(KEYS.tasks) ?? '{}'); } catch {}
  all[id] = v; write(KEYS.tasks, JSON.stringify(all));
}
