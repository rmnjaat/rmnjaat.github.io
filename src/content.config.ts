import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const lessons = defineCollection({
  // Keep "index" in ids: where-clause/null/index.mdx is the lesson "Indexing NULL".
  loader: glob({ base: './src/content/lessons', pattern: '**/*.mdx', generateId: ({ entry }) => entry.replace(/\.mdx$/, '') }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string(),
    chapter: z.string(),
    order: z.number(),
    minutes: z.number().default(8),
    summary: z.string(),
    recap: z.array(z.string()).default([]),
    /** lesson (default), practice (exercise set) or quiz (unit check) */
    kind: z.enum(['lesson', 'practice', 'quiz']).default('lesson'),
    /** "Before you start": what the reader should already know */
    prereqs: z.string().optional(),
    /** "You will learn": 3–5 outcomes */
    outcomes: z.array(z.string()).default([]),
    /** URL of the corresponding page on use-the-index-luke.com, for credit */
    source: z.string().optional(),
  }),
});

const reference = defineCollection({
  loader: glob({ base: './src/content/reference', pattern: '**/*.mdx' }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string(),
    section: z.enum(['explain-plan', 'myth-directory', 'glossary', 'example-schema', 'about']),
    order: z.number().default(0),
    summary: z.string(),
    source: z.string().optional(),
  }),
});

export const collections = { lessons, reference };
