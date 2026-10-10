import { getCollection, type CollectionEntry } from 'astro:content';
import { chapters, referenceSections } from './site';

export type Lesson = CollectionEntry<'lessons'>;
export type Ref = CollectionEntry<'reference'>;

export interface NavItem {
  id: string;
  href: string;
  title: string;
  subtitle: string;
  depth: number;
  minutes?: number;
  /** "1", "1.2", … the lesson's position inside its chapter */
  label: string;
  kind: 'lesson' | 'practice' | 'quiz';
}

/** 1 → "1", 1.2 → "1.2" (frontmatter `order` is a decimal for grouped lessons). */
export function orderLabel(order: number): string {
  return Number.isInteger(order) ? String(order) : order.toFixed(1);
}

export async function getOrderedLessons(): Promise<Lesson[]> {
  const all = await getCollection('lessons');
  const chapterIndex = new Map(chapters.map((c) => [c.slug, c.n]));
  return all.sort((a, b) => {
    const ca = chapterIndex.get(a.data.chapter) ?? 99;
    const cb = chapterIndex.get(b.data.chapter) ?? 99;
    if (ca !== cb) return ca - cb;
    return a.data.order - b.data.order;
  });
}

export function lessonHref(id: string) {
  return `/sql/${id}/`;
}

export function toNavItem(l: Lesson): NavItem {
  return {
    id: l.id,
    href: lessonHref(l.id),
    title: l.data.title,
    subtitle: l.data.subtitle,
    depth: l.id.split('/').length - 1,
    minutes: l.data.minutes,
    label: orderLabel(l.data.order),
    kind: l.data.kind,
  };
}

export async function getReferenceBySection() {
  const all = await getCollection('reference');
  const by = new Map<string, Ref[]>();
  for (const s of referenceSections) by.set(s.slug, []);
  for (const r of all) by.get(r.data.section)?.push(r);
  for (const list of by.values()) list.sort((a, b) => a.data.order - b.data.order || a.data.title.localeCompare(b.data.title));
  return by;
}
