# Writing lessons

Lessons are MDX files under `src/content/lessons/<unit>/…`. Reference pages live under `src/content/reference/<section>/…`. The file path (minus `.mdx`) is the URL under `/sql/`.

## Frontmatter (lessons, practice sets, unit checks)

```yaml
---
title: The B-Tree
subtitle: One sentence that says what the reader gets. Shown in lists and search.
chapter: anatomy                       # unit slug, see src/lib/site.ts
order: 2                               # position inside the unit; 1.1, 1.2 for lessons inside a group
kind: lesson                           # lesson (default) | practice | quiz
minutes: 9
summary: One or two sentences for search engines and link previews.
prereqs: "You should have read <a href='/sql/anatomy/the-leaf-nodes/'>The leaf nodes</a> and know what an index entry is."   # HTML allowed, one sentence
outcomes:                              # 3–5 bullets, "You will learn"
  - Why the sorted leaf nodes alone are not enough for a fast lookup
  - How a lookup walks root → branch → leaf in a fixed number of reads
recap:                                 # 3–4 bullets, shown as "Summary" at the end
  - A B-tree is a balanced tree, not a binary tree.
source: https://use-the-index-luke.com/sql/anatomy/the-tree   # the page this rewrites, shown as credit
---
```

Quote any frontmatter string that contains `: ` or starts with a quote. Reference pages use `section:` (`explain-plan`, `myth-directory`, `glossary`, `example-schema`, `about`) instead of `chapter:` and have no `minutes`, `recap`, `outcomes`.

## Lesson shape (every lesson follows it)

1. Opening paragraph: the problem in two or three sentences. No heading.
2. Numbered `##` sections: `## 1. The problem the tree solves`, `## 2. …`. Three to six of them. Short paragraphs, 17px body, about 66 characters per line, so keep paragraphs to 3–5 sentences.
3. A figure or a worked example (query + plan + annotation) inside the section it belongs to, never at the end.
4. `<KeyIdea>` once or twice: the one sentence that must survive.
5. A `<TryIt>` block with 2–3 tasks the reader does in the playground (only where SQLite can show the point).
6. A `<Callout kind="warning" title="Common mistake">` where the topic has one.
7. End with one `<Check>` (two for long lessons). The Summary comes from `recap:`; do not write a summary paragraph.

Practice sets (`kind: practice`): 3–5 `<TryIt>` blocks, each one exercise with an expected result stated in prose or a small table, hints, and the solution behind `Show solution`. One `<Check>` at the end. Unit checks (`kind: quiz`): 5–8 `<Check>` questions, nothing else but a two-sentence intro.

## Components

```mdx
import { Callout, KeyIdea, Figure, EngineTabs, Check, Playground, TryIt, BTree, LeafChain, IndexAccess, ConcatIndex, Joins, Pagination, ScaleChart, Insert } from '@/components/mdx';
```

| Component | What it is |
| --- | --- |
| `KeyIdea` | Quiet panel. `<KeyIdea>` or `<KeyIdea title="Remember">`. One or two sentences. |
| `Callout` | `kind` is `note` (default), `important`, `tip` or `warning`. Optional `title`. |
| `Figure` | Frame for a static figure or table. `n` is the figure number, `title` the heading. Caption in `<p slot="caption">`. |
| `EngineTabs` | Vendor-specific content, one named slot per engine: `postgresql`, `mysql`, `oracle`, `sql-server`, `db2`, `sqlite`. Only engines you have content for. |
| `TryIt` | Tasks + playground. See below. |
| `Check` | One multiple-choice question. `answer` is the zero-based index. Always `client:visible`. |
| `Playground` | Standalone SQLite playground. `sql`, optional `setup`, `title`. Always `client:visible`. Prefer `TryIt` inside lessons. |
| Figures | `BTree`, `LeafChain`, `IndexAccess`, `ConcatIndex`, `Joins`, `Pagination`, `ScaleChart`, `Insert`. Interactive, stepped. Always `client:visible`. |

### TryIt

```mdx
<TryIt id="1.2" tasks={[
  { text: 'Look up employee 57 in subsidiary 30 by its primary key. Find <code>SEARCH</code> in the plan.', sql: 'employee_id\\s*=\\s*57', plan: 'SEARCH' },
  { text: 'Search by <code>last_name</code> only. The plan should say <code>SCAN</code>.', sql: 'last_name\\s*=', plan: '^SCAN' },
  { text: 'Create an index on <code>last_name</code> and run the second query again.', sql: 'create\\s+index' },
]} sql={`SELECT first_name, last_name
  FROM employees
 WHERE employee_id = 57
   AND subsidiary_id = 30;`}>
  <Fragment slot="hints">
    <details class="hint"><summary>Hint for task 2</summary><div class="d">No index starts with last_name, so there is no tree to walk.</div></details>
    <details class="hint"><summary>Show solution</summary><div class="d"><pre>CREATE INDEX emp_name ON employees (last_name);</pre></div></details>
  </Fragment>
</TryIt>
```

`sql` and `plan` are case-insensitive regular expressions tested against the query that ran and the plan it produced; a task ticks itself when both match. `setup` runs once before the first query (for example a `CREATE INDEX`). Playgrounds get a fresh database each, so one lesson's index does not leak into another.

### Figure props

| Figure | Props | Use it for |
| --- | --- | --- |
| `BTree` | `mode="structure"` or `"search"`, `search={57}` (40–83 drawn in full), `n` | tree layers; a lookup walking root → branch → leaf |
| `LeafChain` | `n` | leaf nodes as a doubly linked list vs. disk order |
| `IndexAccess` | `leaves={3}` (1–4), `rows={5}` (1–8), `unique`, `n` | range scan following the leaf chain + table access by rowid |
| `ConcatIndex` | `subsidiary={20}`, `n` | column order of a concatenated index |
| `Joins` | `mode="nested"`/`"hash"`/`"merge"`, `switchable={false}`, `n` | the three join algorithms |
| `Pagination` | `n` | offset vs. seek paging |
| `ScaleChart` | `n` | response time vs. data volume |
| `Insert` | `n` | inserting a key: find the leaf, split, promote |

Figure numbers: `<unit>.<running number>` in reading order within the unit.

## Voice

- Write for a developer who writes SQL every day and has never looked at an execution plan. Explain the mechanism, then the consequence, then what to do about it.
- Short paragraphs, plain words. One idea per paragraph. Headings are numbered `##`; use `###` rarely.
- Concrete before abstract: show the query, then the plan, then the rule.
- Never pad. No "in this lesson we will", no closing summaries in the prose, no exclamation marks, no em dashes.
- Every SQL example uses the example schema (`employees`, `sales`, see `public/schema.sql`). Fenced code blocks: ```` ```sql ```` for SQL, plain ```` ``` ```` for plan output.
- Vendor differences go in `EngineTabs`, never in prose like "in Oracle, however…".
- One `Check` per lesson, at the end.

## Coverage and originality

The curriculum follows Markus Winand's book "SQL Performance Explained" / use-the-index-luke.com, and every lesson must cover every fact, example, figure and callout of the corresponding original page: nothing the original teaches may be missing. The text here is written from scratch. Do not copy sentences from the book or the site. SQL, plan output, table data and the example schema are not prose and may match. Set `source:` to the original page's URL.

## MDX pitfalls (the compiler rejects these)

- Inside `<pre>` blocks: no blank lines; write `<` `>` `{` `}` as `&lt;` `&gt;` `&#123;` `&#125;`. Prefer fenced code blocks outside JSX where possible.
- A `<KeyIdea>` or `<Callout>` that contains more than one paragraph or a code fence: put the opening tag on its own line, a blank line, the content, a blank line, then the closing tag on its own line.
- Never leave a raw `<` or `{` in prose; write `&lt;` or `&#123;`, or put the text in backticks.
- `node scripts/fix-mdx.mjs <path>` normalises the first two patterns automatically.
