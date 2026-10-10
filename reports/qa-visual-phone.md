# Visual QA, phone widths (360 and 390)

Scope: `reports/shots/*@360.png` and `*@390.png`. 38 screenshots viewed: home, /practice/, /playground/, /sql/, unit overviews (anatomy, where-clause), 12 lessons across all units, 3 practice sets, 2 unit checks, explain-plan index + PostgreSQL, glossary, example-schema, myth-directory, about, quiz, site-map, plus the 390 variants of home, practice, a lesson, /sql/, playground and site-map.

Limitation: every screenshot is the first 800px of the page only. Items 4, 5 and 9 below (tables, SVG figures, TOC nesting) are not visible in the shots; they are derived from the CSS and content and stated as such. Everything else was seen.

Most severe first.

---

## 1. /practice/ is broken: every practice card is squeezed into a 48px column

**Pages:** `_practice_@360.png`, `_practice_@390.png` (same at every width; the bug is not width-specific but it is unusable on a phone).

**What is wrong:** Under each unit heading the link cards render as a one-word-per-line column at x=66 ("Practice: / reads / and / scans", "Four / exercises / on / the / example / schema."). The minutes label and the status circle are pushed below.

**Cause:** `src/pages/practice/index.astro` wraps the page in `<div class="wrap toc-list">` and then nests `<ol class="lesson-list">`. `src/styles/global.css:349` `.toc-list li { display: grid; grid-template-columns: 3rem 1fr auto; … }` therefore also hits every `.lesson-list li`, whose single child `<a>` lands in the 3rem column. (24 gutter + 8 link padding + 20px icon column + 14 gap = 66px, exactly where the text starts.)

**Fix (one of):**
- `src/styles/global.css:349` and `:350`: scope the TOC rule to direct children: `.toc-list > section > ol > li { … }` and `.toc-list > section > ol > li[data-depth='2'] { … }` (the `/sql/` page is `div.toc-list > section > ol > li`, so it keeps working). Also scope `:347` `.toc-list ol` the same way.
- or, in `src/pages/practice/index.astro:11`, drop `toc-list` from the wrapper and give the `<h2>` its own class.

---

## 2. The header takes 185px, 23% of the first screen, on every page

**Pages:** all 360 and 390 screenshots.

**What is wrong:** Three stacked rows: brand (40px), nav wrapped onto two lines, then search + engine select. At 390 the nav wraps with "Glossary" alone on its own line, which looks orphaned. The page title does not appear until y≈220 on index pages and y≈320 on lessons.

**Fix:** in `src/styles/global.css` inside the existing `@media (max-width: 760px)` block at `:59`:
```css
.site-header .bar { gap: 8px 12px; }
.brand { order: 1; }
.site-tools { order: 2; margin-left: auto; width: auto; }
.site-nav { order: 3; width: 100%; flex-wrap: nowrap; overflow-x: auto; margin: 0 -16px; padding: 0 16px; scrollbar-width: none; -webkit-overflow-scrolling: touch; }
.site-nav::-webkit-scrollbar { display: none; }
.site-nav a { white-space: nowrap; }
```
Result: brand + search + engine on row 1, one swipeable nav strip on row 2, about 108px total (saves ~77px). Optional: shorten the `Execution plans` nav label to `Plans` on phone to let all five fit without scrolling.

---

## 3. Lesson pages: no lesson content on the first screen

**Pages:** every lesson, practice set and unit check at 360 and 390 (`_sql_anatomy_the-tree_@360.png`, `_sql_dml_insert_@360.png`, `_sql_join_practice_@360.png`, `_sql_anatomy_unit-check_@360.png`, etc.).

**What is wrong:** header (185) + 24px shell padding + "Course outline" button (36) + 24px grid gap + breadcrumb + h1 at y=320 + meta with 40px below + the "Before you start / You will learn" box, which alone is 350–400px and then has 64px margin. The reader has to scroll a full screen before the first paragraph on every single lesson.

**Fix:** besides item 2, in `src/styles/global.css` add to the `@media (max-width: 760px)` block at `:82`:
```css
.lesson-shell { gap: var(--s2); padding-top: var(--s2); }
.article .meta { margin-bottom: var(--s3); }
.before { margin-bottom: var(--s5); }
.before > div { padding: 12px 16px; }
```
That recovers ~70px. If more is wanted, render `.before` as `<details>` (open by default on desktop, closed on phone) in `src/layouts/Lesson.astro:41`.

---

## 4. Wide tables cause horizontal page scroll; tables inside figures are clipped (inferred)

**Pages (from content):** `/sql/explain-plan/sqlite/` (a 72-character `code` token in a table cell: ~610px unbreakable), `/sql/explain-plan/oracle/` (8 columns), `/sql/example-schema/` (8 columns), `/sql/sorting-grouping/order-by-asc-desc-nulls-last/` (7 columns), `/sql/partial-results/fetch-next-page/` (7), `/sql/partial-results/window-functions/` (6), plus 5-column tables in bind-parameters, slow-indexes-part-ii, not-null-constraint, smart-logic, hash-join. `/sql/about/site-map/` has a 235-row two-column table of long URLs that will wrap each cell to 4–6 lines at 140px per column.

**What is wrong:** `.prose table { width: 100% }` (`global.css:143`) with no overflow handling; `.prose .table-scroll` at `:146` exists but nothing in `src/content` uses it (0 matches). The article is 328px wide at 360; a table with an unbreakable 600px cell overflows the article and the page gets horizontal scroll. The three `<table>` placed inside `<Figure>` (the-leaf-nodes 1.2, data-volume 3.1, system-load 3.3) sit inside `.fig .fig-body { overflow: hidden }` (`:169`) and are cut off instead.

**Fix:**
- Add a rehype plugin in `astro.config.mjs` `markdown.rehypePlugins` that wraps every `table` in `<div class="table-scroll">` (the class and its CSS already exist), or, CSS-only, in `global.css` `@media (max-width: 760px) { .prose table { display: block; overflow-x: auto; width: max-content; max-width: 100%; } }`.
- `global.css:169` `.fig .fig-body { overflow-x: auto; }` instead of `overflow: hidden`.
- For the site-map table specifically, add in `src/content/reference/about/site-map.mdx` a class and stack the two cells on phone: `@media (max-width: 600px) { .sitemap td { display: block; padding: 4px 0; } .sitemap td:first-child { padding-top: 10px; } .sitemap thead { display: none; } }`.

---

## 5. SVG figure labels render at 4–5px (inferred)

**Pages:** every lesson with an interactive figure: the-leaf-nodes (LeafChain), the-tree (BTree), slow-indexes / IndexAccess, concatenated-keys (ConcatIndex), nested-loops / hash-join / sort-merge (Joins), fetch-next-page (Pagination), the ScaleChart lessons.

**What is wrong:** The figures use `viewBox="0 0 720…800 ×"` and SVG `fontSize={12–14}`. At 360 the figure body is 328 − 2 border − 48 padding = 278px wide, a scale of 0.35–0.39, so a 13px label draws at 5px. Node names, "bucket 0", "rows 1–10", the step captions inside the SVG are all unreadable; the stepper's controls remain usable, so the figure looks finished but says nothing.

**Fix:** `src/styles/global.css` add
```css
@media (max-width: 600px) {
  .fig .fig-body { padding: 12px; overflow-x: auto; }
  .fig-svg { min-width: 560px; }
}
```
Labels then render at ≥10px and the figure scrolls sideways inside its frame (the same affordance as a code block). Pairs with the `overflow-x: auto` change in item 4.

---

## 6. Inconsistent side gutters: 24px on `.wrap` pages, 16px everywhere else

**Pages:** `_practice_@360.png`, `_playground_@360.png`, `_sql_@360.png` (and 390) start text at x=24; the home page, every lesson/reference page, and the header start at x=16.

**Fix:** `src/styles/global.css:79`, add `@media (max-width: 760px) { .wrap { padding-inline: 16px; padding-block: var(--s3) 64px; } }` to match `.home` (`:281`) and `.lesson-shell` (`:82`).

---

## 7. Stray leading bullet in the lesson meta line

**Pages:** every lesson, practice set, unit check and reference page ("• 9 min   • Lesson", "• Reference").

**What is wrong:** `.article .meta span::before` (`global.css:123`) draws the dot separator before every item including the first, so the line reads as a bulleted list with the first bullet hanging under the h1.

**Fix:** `global.css:123` change the selector to `.article .meta span + span::before`.

---

## 8. `/sql/` table of contents: number column and nesting eat the row on a phone (inferred for depth 2)

**Pages:** `_sql_@360.png` shows the 3rem number column ("1.1") plus 12px gap leaving ~230px for title and description. Depth-2 entries (the where-clause sub-lessons) add `padding-left: 3rem` (`global.css:350`), leaving ~175px of text.

**Fix:** `src/styles/global.css` add
```css
@media (max-width: 600px) {
  .toc-list li { grid-template-columns: 2.25rem 1fr auto; gap: 10px; }
  .toc-list li[data-depth='2'] { padding-left: 1.25rem; }
}
```
(Combine with the direct-child selectors from item 1.)

---

## 9. Boxed blocks use 28px side padding at a 328px measure

**Pages:** any lesson with KeyIdea, Check or Summary (seen in CSS: `.keyidea` `:159`, `.check` `:237`, `.summary` `:248` use `padding: … 28px`; `.callout` `:151` uses 20px).

**What is wrong:** 56px of padding inside a 328px column leaves 272px of text, and the three blocks have a different inner gutter from the callouts, so the left text edge jumps between 36px and 44px down the page.

**Fix:** `@media (max-width: 600px) { .keyidea, .check, .summary, .done-row { padding-left: 20px; padding-right: 20px; } }`.

---

## 10. Small tap targets in the header

**Pages:** all. The icon-only search button and the engine select are 36px tall (`.tool-btn { min-height: 36px }`, `global.css:56`); the nav links are 5px+14px+5px ≈ 29px tall.

**Fix:** inside the 760px header media block: `.tool-btn { min-height: 40px; }` and `.site-nav a { padding: 8px 10px; }`.

---

## 11. Minor

- `_sql_@360.png`: "0 Preface" heading has nothing under it and sits 84px above "1 Anatomy of an Index", reading as an empty section. Either list the preface entry beneath it or render it as a plain row.
- `_playground_@360.png`: the status line "ready · employees: 1,000 rows · sales: 20,000 rows" wraps mid-token to a second line. Add `white-space: nowrap; overflow-x: auto` or drop the row counts at ≤400px.

---

## What looks good

- Home page at 360 and 390: headline, intro, stats row and "You'll be able to" card are well proportioned, nothing clipped, 16px gutters consistent with the header.
- Lesson heading hierarchy: breadcrumb, h1 (`text-wrap` keeps "Practice: equality, column order and functions" balanced), meta, and the "Before you start" box collapse to one column cleanly at ≤600px with clear label cells.
- Body text (17px/28px) and link styling are comfortable to read at 360; no text touches an edge on any page.
- Playground: editor, "Run + explain" / "Reset query" / "Show indexes" buttons wrap into a sensible two-row toolbar and are tappable (36px+); the output panes stack via `.pg .pg-out` at ≤760.
- Unit overview pages: the lesson list with status circle, title, description and minutes reads cleanly; depth-2 indent (32px) is fine here.
- Reference pages (execution plans, glossary, example schema, myth directory, about, quiz, site map) share a consistent first screen with the lessons.
- Breadcrumbs truncate gracefully with `flex-wrap`; no horizontal overflow seen in any first screen.
