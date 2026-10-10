# Visual QA — tablet and desktop (768 / 1024 / 1440)

Reviewed 46 screenshots from `reports/shots/` at `@768`, `@1024` and `@1440`: home (all three widths), `/practice/`, `/playground/`, `/sql/` (table of contents), unit overviews (anatomy, join, where-clause), 14 lessons across nine units, 5 practice sets, 5 unit checks, 8 reference pages (execution-plan index, PostgreSQL, MySQL, Oracle, SQL Server, glossary, example schema, myth directory + one myth), about, site map and the 3-minute quiz.

Caveat: every screenshot is viewport-only (768x1024, 1024x900, 1440x900), so nothing below the fold is captured: figures, in-article tables, plan output, the summary box, the done-row and the pager were not visible in any shot. Items 7 and 8 below come from reading `src/styles/global.css` rather than from pixels, and are marked as such.

Sources read: `src/styles/global.css`, `src/layouts/Lesson.astro`, `src/components/ui/Header.astro`, `src/components/ui/ChapterNav.astro`, `src/components/ui/Figure.astro`, `src/pages/practice/index.astro`, `src/pages/sql/index.astro`.

---

## 1. `/practice/` — every list item collapses into a 70px column (severe, all widths)

**Screenshots:** `_practice_@768.png`, `_practice_@1024.png`, `_practice_@1440.png`

**What is wrong:** each practice-set / unit-check row renders the title word-by-word ("Practice: / reads / and / scans") in a column about 70px wide, the subtitle stacks the same way underneath, and "practice · 12 min" floats to the right of that sliver. One row is ~500px tall; the first unit section does not even fit in the viewport at 1440. This is the only page that is actually broken, and it is broken at every width.

**Cause:** `src/pages/practice/index.astro` line 11 wraps the page in `class="wrap toc-list"` (to reuse the numbered `h2` style), then renders `<ol class="lesson-list">`. In `global.css` the rule

```
.toc-list li { display: grid; grid-template-columns: 3rem 1fr auto; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--rule); align-items: baseline; }
```

has the same specificity as `.lesson-list li` and comes later in the file, so it wins. The single `<a>` child of each `li` is dropped into the 3rem first column, and its own `grid-template-columns: 20px 1fr auto` then squeezes the title into whatever is left.

**Fix (either):**

- Markup, preferred: in `src/pages/practice/index.astro` change `class="wrap toc-list"` to `class="wrap practice-index"` and add to `global.css`:
  ```
  .practice-index { max-width: 820px; }
  .practice-index h2 { font-size: 22px; font-weight: 600; margin: var(--s6) 0 var(--s2); }
  .practice-index h2 .n { font-family: var(--font-mono); font-size: 13px; color: var(--mute); margin-right: 10px; }
  .practice-index h2 a { color: inherit; text-decoration: none; }
  ```
- CSS only: scope the TOC row rule so it cannot reach nested lists, in `global.css`:
  ```
  .toc-list > section > ol > li { display: grid; grid-template-columns: 3rem 1fr auto; ... }   /* was .toc-list li */
  .toc-list > section > ol > li[data-depth='2'] { padding-left: 3rem; }
  ```
  (and the same `>` chain for `.toc-list li .n`, `.toc-list li a`, `.toc-list li .sub`, `.toc-list li .min`).

---

## 2. Sticky tree and anchor offsets assume a 64px header, but the header is 113px tall at 768 and 1024 (every lesson and reference page)

**Screenshots:** every `@768` and `@1024` lesson/reference shot, e.g. `_sql_anatomy_the-tree_@768.png`, `_sql_anatomy_the-tree_@1024.png`, `_sql_explain-plan_postgresql_@1024.png`, `_@1024.png`

**What is wrong:** at 768 and 1024 the header wraps to two rows (nav on row one, Progress / Search / engine select on row two) and its bottom border sits at y=113. The header is `position: sticky`. The curriculum tree is `position: sticky; top: 80px` and headings use `scroll-margin-top: 88px` / `scroll-padding-top: 88px`. Consequences a user hits as soon as they scroll on a tablet or small laptop:

- the top ~33px of the tree (the "0 · Preface" row and part of the open unit) slides under the header and stays hidden;
- clicking any "In this lesson" / in-text anchor lands the heading ~25px under the header.

At 1024 the wrap is avoidable: brand (~196px) + nav (~470px) + tools (~415px with the 120px progress bar) + paddings exceeds 1024 by about 130px. At 768 two rows are unavoidable with this nav, so the offsets must follow the taller header there.

**Fix in `src/styles/global.css`:**

```
/* keep the header on one row down to ~900px */
@media (max-width: 1100px) { .prog { display: none; } }

/* below that the header is two rows: either stop it sticking (what the ≤760 rule already does) ... */
@media (max-width: 900px) {
  .site-header { position: static; }
  .tree { top: 16px; max-height: calc(100vh - 32px); }
  html { scroll-padding-top: 16px; }
  .prose h2 { scroll-margin-top: 16px; }
}
/* ... or keep it sticky and move the offsets: .tree { top: 128px; max-height: calc(100vh - 148px) } html { scroll-padding-top: 136px } .prose h2 { scroll-margin-top: 136px } */
```

Hiding `.prog` under 1100px also removes the half-empty second header row seen on the 1024 home page (`_@1024.png`) and on every 1024 shot.

---

## 3. Glossary outline is taller than the viewport and cannot be scrolled (1440)

**Screenshot:** `_sql_glossary_@1440.png`

**What is wrong:** the "In this page" column lists every glossary term (30+). `.on-page` is `position: sticky; top: 80px` with no height cap, so at 900px tall the list runs off the bottom of the viewport ("Partial index, filtered index" is the last visible entry) and the remaining entries can only be reached once the article has scrolled to its end. The `.tree` already guards against this with `max-height` + `overflow: auto`; the outline does not.

**Fix in `global.css`:**

```
.on-page { position: sticky; top: 80px; font-size: 14px; align-self: start; max-height: calc(100vh - 100px); overflow-y: auto; padding-right: 8px; }
```

(Optionally cap the glossary to its section headings instead of one entry per term in the page's MDX, but the CSS guard is needed anyway.)

---

## 4. 768px: the article column is only ~432px wide and the "Before you start / You will learn" box takes most of the viewport

**Screenshots:** `_sql_anatomy_the-tree_@768.png`, `_sql_anatomy_the-leaf-nodes_@768.png`, `_sql_testing-scalability_response-time-throughput-scaling-horizontal_@768.png`, `_sql_where-clause_practice-ranges-null-obfuscation_@768.png`, `_sql_join_nested-loops-join-n1-problem_@768.png`, `_sql_sorting-grouping_indexed-order-by_@768.png`

**What is wrong:** 768 is 8px above the single-column breakpoint (760), so it gets the full desktop shell: 240px tree + 48px gap + 24px side paddings leave 432px for the article. Inside that, `.before` reserves a 140px label column, so the prerequisite text and the outcome bullets wrap in a ~250px measure. On "Response Time and Throughput" the box runs from y=340 to y=1010, i.e. the whole first screen is the pre-reading box and the lesson text starts below the fold; on "Practice: ranges, NULL…" the four prerequisite links wrap over four lines. The lede paragraphs and `h1` also balance-wrap into two short lines ("Response Time / and Throughput").

**Fix in `global.css`** (keeps the two-column tablet layout, as intended):

```
@media (max-width: 900px) {
  .lesson-shell { grid-template-columns: 208px minmax(0, 1fr); gap: var(--s4); }
  .tree { font-size: 13.5px; }
  .before { grid-template-columns: 1fr; }
  .before > div:nth-last-child(-n+2) { border-bottom: 1px solid var(--rule); }
  .before > div:last-child { border-bottom: 0; }
  .before > div:nth-child(odd) { padding-bottom: 8px; }
  .before > div:nth-child(even) { padding-top: 8px; }
}
```

(The stacked `.before` rules already exist for ≤600px; this reuses them from 900px down.) The article then gets ~488px and the box loses the 140px label column.

---

## 5. Curriculum tree rows wrap awkwardly at every width

**Screenshots:** all lesson shots, clearest in `_sql_where-clause_practice-column-order_@1440.png`, `_sql_clustering_index-only-scan-covering-index_@1024.png`, `_sql_anatomy_the-tree_@1440.png`, `_sql_sorting-grouping_order-by-asc-desc-nulls-last_@1440.png`

**What is wrong:** the tree is 240px and each row is `18px 1fr auto` with an uppercase, letter-spaced `.ty` tag ("PRACTICE", "QUIZ") or "NN MIN" in the last column. Results users will notice:

- "Slow Indexes, Part I" breaks after "Part" leaving a lone "I" on line two (every width, every unit-1 page);
- "Practice: equality, column order and functions" becomes four lines beside a vertical-centred "PRACTICE";
- "Index-Organized Tables and Clustered Indexes" three lines, "Unit check: Anatomy of an index" two lines, "Response Time and Throughput" two lines;
- unit buttons "Testing and Scalability" and "Insert, Delete and Update" wrap to two lines while the other units are one line, so the unit list has an uneven rhythm.

The icon shape already encodes the type (circle = lesson, dashed square = practice, square = quiz), so the text tag is redundant.

**Fix in `global.css`:**

```
.tree li .ty { display: none; }                                         /* type is already shown by .ic */
.tree li a { grid-template-columns: 18px minmax(0, 1fr) auto; }
.lesson-shell { grid-template-columns: 256px minmax(0, 1fr) 200px; }    /* was 240px; 1024 variant likewise */
@media (max-width: 1100px) { .lesson-shell { grid-template-columns: 256px minmax(0, 1fr); } }
```

If the tag should stay, move it under the title instead of beside it: `.tree li .ty { grid-column: 2; font-size: 11px; }` and drop the `auto` column.

---

## 6. Unit checks say the same sentence twice (lede + first paragraph)

**Screenshots:** `_sql_dml_unit-check_@1024.png`, `_sql_join_unit-check_@1440.png`, `_sql_clustering_unit-check_@768.png`

**What is wrong:** when a quiz has no prereqs/outcomes, `Lesson.astro` prints the frontmatter subtitle as a `.lede` ("Five questions on what indexes cost on the write side.") and the MDX body immediately repeats it ("Five questions on this unit. Each has one best answer…", "Six questions on nested loops…" / "Six questions, one answer each…"). Same pattern on the three unit checks reviewed; `anatomy/unit-check` has a before-box so it does not show the lede and reads fine.

**Fix:** either drop the opening sentence from the `*/unit-check.mdx` bodies, or in `src/layouts/Lesson.astro` change

```
{!prereqs && outcomes.length === 0 && subtitle && <p class="lede">{subtitle}</p>}
```
to
```
{!prereqs && outcomes.length === 0 && subtitle && kind !== 'quiz' && <p class="lede">{subtitle}</p>}
```

---

## 7. (From CSS, not visible in shots) in-article tables have no horizontal-scroll guard

29 MDX files contain Markdown tables and nothing uses the `.table-scroll` wrapper that `global.css` defines. `.prose table { width: 100% }` wraps text cells, so narrow tables will be fine, but a table with several `code` columns (the plan-operation tables in `explain-plan/*.mdx`, the reference matrix in `about/site-map.mdx`) will push the 432px tablet article wider than its column with no way to scroll. Cheapest guard, in `global.css`:

```
.prose table { display: block; overflow-x: auto; width: 100%; }
.prose thead, .prose tbody { display: table; width: 100%; }
```

or add a rehype plugin that wraps every `<table>` in `<div class="table-scroll">`.

## 8. (From CSS, not visible in shots) figure bodies clip instead of scrolling

`.fig .fig-body { overflow: hidden }` together with `.fig-svg { width: 100% }` is fine for SVG figures, but any figure whose content has a fixed pixel width (the Playground result table inside `.tryit`, or an SVG with `min-width`) will be clipped silently at 768. If any figure is wider than ~430px at its natural size, change `overflow: hidden` to `overflow-x: auto`. Flagging only because I could not see the figures.

---

## What looks good

- Course home at all three widths: hero, fact row, the two "You'll be able to / Before you start" cards and the unit cards line up on the same 24px rhythm; the Continue card drops cleanly to a single column at 768.
- Table of contents, unit overviews (`/sql/anatomy/`, `/sql/join/`, `/sql/where-clause/` with nested depth-2 rows) and the myth directory / execution-plan index lists: consistent 14px row padding, hairline rules, right-aligned minute column, nothing overflows at 768.
- Lesson header block (crumb, `h1`, meta dots, before-box): identical spacing on every lesson, practice set, quiz and reference page reviewed; the three-column layout at 1440 keeps a comfortable 640px measure with the outline column well clear of the article.
- Quiz cards (`.check`) and the 3-minute quiz: consistent card padding and option spacing at every width; long questions wrap without touching the card edge.
- Playground: the editor/actions/result/plan panes keep their borders aligned at 768, 1024 and 1440; the result/plan panes split 50/50 and the status line right-aligns.
- Code blocks (`pre`) scroll horizontally rather than widening the column, and syntax colouring is consistent across the reference pages.
- Site-map table fits at 768 with the "Original / Here" header row and zebra-free hairlines.
- The 1024 width is fine once the header issue (item 2) is fixed: the outline column is hidden as intended and the article keeps 640px.
