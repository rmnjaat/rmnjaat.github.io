# Writing pages

Pages are MDX files under `src/content/lessons/<chapter>/…`. Reference pages live under `src/content/reference/<section>/…`. The file path is the URL.

## Frontmatter

```yaml
title: The B-Tree
subtitle: One sentence, shown under the title.
chapter: anatomy                       # chapter slug, see src/lib/site.ts
order: 2                               # position inside the chapter; 1.1, 1.2 for pages inside a group
summary: One or two sentences for search engines and the contents list.
recap:                                 # 3–6 bullets, rendered as "In short" at the end
  - "Quote strings that contain a colon followed by a space."
source: https://use-the-index-luke.com/sql/anatomy/the-tree
```

Quote any frontmatter string that contains `: ` or starts with a quote. Reference pages use `section:` (`explain-plan`, `myth-directory`, `example-schema`, `about`) instead of `chapter:` and `recap:`.

## Page shape

1. Open with the problem in one or two paragraphs. No "in this page we will".
2. Numbered sections: `## 1. …`, `## 2. …`. Keep them in reading order.
3. One figure where a drawing explains more than prose (`<BTree>`, `<Insert>` and so on, always `client:visible`).
4. A worked example with real plan output where the point needs one.
5. `<KeyIdea>` for the one thing to remember, `<Callout>` for notes, warnings and tips.
6. The "In short" box comes from `recap:`; do not write a summary paragraph.

## Components

```
import { Callout, KeyIdea, Figure, EngineTabs, BTree, LeafChain, IndexAccess, ConcatIndex, Joins, Pagination, ScaleChart, Insert } from '@/components/mdx';
```

| Component | Use |
| --- | --- |
| `Callout` | `kind` = note, important, warning, tip; optional `title`. Multi-line content: put the tag on its own line. |
| `KeyIdea` | Highlighted statement, optional `title`. |
| `Figure` | Frame for static figures: `n`, `title`, default slot, `caption` slot. |
| `EngineTabs` | Per-engine content in named slots: postgresql, mysql, oracle, sql-server, db2, sqlite. |
| Figures | React islands with step controls. `n` sets the figure number. Always `client:visible`. |

Figure numbers: `<chapter>.<running number>` in reading order within the chapter.

## MDX rules

- Inside `<pre>` no blank lines; escape `<`, `>`, `{`, `}`, `*` and `_` (`&#42;`, `&#95;`). `node scripts/fix-mdx.mjs` normalises these.
- Never pad. No closing summaries in the prose, no exclamation marks, no em dashes.
- Vocabulary: chapter, page, section, appendix. Never lesson, unit, course, quiz, exercise.
- Every page states its facts in its own words and links the original page in `source:`.

Run `npm run lint:content` before committing.
