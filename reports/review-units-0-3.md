# Technical review: units 0–3 (preface, anatomy, testing-scalability, first half of where-clause)

Scope: `preface.mdx`, `anatomy/*`, `testing-scalability/*`, `where-clause/the-equals-operator*`, `where-clause/functions*`, `where-clause/bind-parameters.mdx`, `where-clause/practice-column-order.mdx` (21 files). Every TryIt task query was executed against a fresh sql.js database with `public/schema.sql` (not only the first statement that `check-playgrounds.mjs` runs); every row count and plan string quoted in task text, hints and solutions was confirmed unless listed below. Three distinctive sentences per file were checked against the `source:` page. Rendered HTML was read for slow-indexes, data-volume, slow-indexes-part-ii and case-insensitive-search.

Severity: **S1** breaks something for the reader · **S2** factually wrong or embarrassing in front of an expert · **S3** style/shape/consistency.

## Site-wide (fix once)

- [ ] **S1** · `astro.config.mjs` (no `markdown.smartypants` setting; Astro defaults it to `true`) · Every `Show solution` `<pre>` block inside `<details class="hint">` is run through smartypants in the build: `'2024-06-01'` renders as `‘2024-06-01’` and `-- plan:` as `– plan:`. 24 of the 25 solution blocks in these 17 pages are affected (`dist/sql/anatomy/slow-indexes/index.html` shows `WHERE sale_date &gt;= ‘2024-06-01’`). A reader who pastes the solution into the playground gets a syntax error on the curly quote. · Fix: set `markdown: { smartypants: false }` in `astro.config.mjs`, or move every solution into a fenced ```` ```sql ```` block inside the `<details>` (fenced code is exempt). Re-check all units, not only these.
- [ ] **S3** · "chapter" where the site says "unit" (nav, breadcrumbs and unit pages render `Unit N · Title`, `src/pages/sql/[...slug].astro:36,62`). Occurrences: `preface.mdx:8,14,19,62,64,65,66,67,68,69,70,71,73`; `anatomy/the-leaf-nodes.mdx:40,56`; `anatomy/slow-indexes.mdx:89,213`; `testing-scalability/data-volume.mdx:31,154,296`; `testing-scalability/response-time-throughput-scaling-horizontal.mdx:70`; `where-clause/the-equals-operator.mdx:12,23,31,35,45`; `where-clause/the-equals-operator/primary-keys.mdx:30,57`; `where-clause/the-equals-operator/concatenated-keys.mdx:187`; `where-clause/the-equals-operator/slow-indexes-part-ii.mdx:111`; `where-clause/functions/case-insensitive-search.mdx:155`; `where-clause/functions/over-indexing.mdx:37`. · Fix: "unit N" / "this unit"; keep "chapter" only when talking about the printed book itself (e.g. "the book's chapter 2").

## src/content/lessons/preface.mdx

- [ ] **S2** · `preface.mdx:66` · Lists "Chapter 3, Performance and Scalability"; the unit is titled "Testing and Scalability" everywhere else (`src/lib/site.ts`, nav, breadcrumbs). · Fix: "Unit 3, Testing and Scalability".
- [ ] **S3** · `preface.mdx:14,73` · "eight chapters and three appendices" does not describe this site: nine units (0–8) and a reference section with five parts (Execution Plans, Myth Directory, Glossary, Example Schema, About). · Fix: "How the eight units after this one and the reference pages build on each other"; at line 73 say "The reference pages support the units: …".

## src/content/lessons/anatomy/the-leaf-nodes.mdx

- [ ] **S3** · `the-leaf-nodes.mdx:78` · "PostgreSQL tuple id" is not what PostgreSQL calls it in plans or docs. · Fix: "PostgreSQL `ctid`, the tuple identifier".
- [ ] (site-wide) `the-leaf-nodes.mdx:114-124` solution block affected by the smartypants bug.

Nothing else found. All three TryIt tasks produce exactly the plans promised (`SCAN sales USING INDEX sales_date`, `SCAN sales` + `USE TEMP B-TREE FOR ORDER BY`); the catalogue query returns the two indexes described.

## src/content/lessons/anatomy/the-tree.mdx

- [ ] **S2** · `the-tree.mdx:41` (and `:53` "instead of thirty") · Prose says Figure 1.4 "shows an index with 30 entries in 10 leaf nodes". The component data in `src/components/figures/BTree.tsx:3-9` is `ROOT [39,83,98]`, `BRANCHES [[11,23,39],[46,53,57,83],[91,98]]`, three entries per leaf: that is 3+4+2 = 9 leaf nodes and 27 entries. · Fix: either change the prose to "27 entries in nine leaf nodes" and ":53 instead of twenty-seven", or add a third entry to `BRANCHES[2]` in `BTree.tsx` (e.g. `[91, 95, 98]`) so the figure matches the book's 30/10.
- [ ] **S2** · `the-tree.mdx:63-75` · Worked example: `Buffers: shared hit=4` only appears with `EXPLAIN (ANALYZE, BUFFERS)`, which the text does not say; "three for the index and one for the row" is not right for the 1,000-row example table, whose PostgreSQL index is two levels deep (meta + root/leaf, so 2–3 index buffers); and PostgreSQL names the constraint's index `employees_pkey` unless the constraint was named. · Fix: say the plan came from `EXPLAIN (ANALYZE, BUFFERS)`, and phrase it as "a handful of index blocks plus one table block"; or drop the `Buffers` line and keep the plan structural.
- [ ] **S3** · `the-tree.mdx:45` and `:16` (recap), repeated in `anatomy/unit-check.mdx:64` · "A B-tree is a balanced tree, not a binary tree." is the source sentence verbatim ("A B-tree is a balanced tree—not a binary tree."). · Fix: "Balanced does not mean binary. A B-tree node holds hundreds of keys, not two, so the tree stays shallow."
- [ ] **S3** · `the-tree.mdx:31` · `LeafChain` is shown again as Figure 1.3 with a new title; it is the same figure as 1.1 one lesson earlier. · Fix: either refer back ("Figure 1.1 in the previous lesson") or keep the repeat but say so in the prose; not a numbering error, just a doubled figure.

TryIt 1.2 verified (`SCAN employees` → `CREATE INDEX emp_name` → `SEARCH employees USING INDEX emp_name (last_name=?)`).

## src/content/lessons/anatomy/slow-indexes.mdx

- [ ] **S2** · `slow-indexes.mdx:66` · "Four block reads for a table of a thousand rows and four for a table of a billion." A thousand-row index is one or two levels deep, not three plus one; an expert will stop here. · Fix: "A handful of block reads, and the same handful whether the table has a thousand rows or a billion."
- [ ] **S3** · `slow-indexes.mdx:85` · "An INDEX RANGE SCAN can read a large part of an index." is the source sentence minus one word. · Fix: "Nothing stops a range scan from walking most of the index; add one table access per row and the query is slow with an index."

All three TryIt tasks verified: `SEARCH sales USING INTEGER PRIMARY KEY (rowid=?)`; June without index `SCAN sales` with 938 rows; after the index `SEARCH sales USING INDEX sales_date (sale_date>? AND sale_date<?)` and the whole of 2024 still uses the index (11,442 rows, "twelvefold" holds). Engine tabs are consistent with the book's plans (MySQL `key_len 3` for DATE is right).

## src/content/lessons/anatomy/practice.mdx

- [ ] **S3** · `practice.mdx:54` and `:67` · "a traversal of three or four blocks, then … perhaps five" leaf blocks: SQLite's 20,000-entry index on a `TEXT` date is two levels deep and 938 entries fit in three or four 4 KB leaf pages. The arithmetic in the solution (`4 + 5 + 938`) is therefore a little high. · Fix: "two or three blocks for the traversal, three or four leaf blocks"; solution `-- roughly 3 + 4 + 938 block reads against 3 + 4 for the count`. Not wrong in spirit; only the numbers.
- [ ] **S3** · `practice.mdx:117` · "the [concatenated index](/sql/where-clause/) lessons" links to the unit overview, not the lesson. · Fix: link `/sql/where-clause/the-equals-operator/concatenated-keys/`.

All four exercises verified: employee 57 is Maria Chen in subsidiary 30; 66 Winands; `SCAN employees USING COVERING INDEX sqlite_autoindex_employees_1` for `subsidiary_id = 30` (200 rows); `(employee_id=?)` prefix search.

## src/content/lessons/anatomy/unit-check.mdx

- [ ] **S3** · `unit-check.mdx:57-64` · "ten million rows typically has a depth of four or five levels": with hundreds of entries per node, 10 M entries fit in three or four levels (300³ ≈ 27 M). The lesson's own claim is "four or five … for tables with millions of rows", which is the book's. · Fix: make the question "a hundred million rows" or accept "three to five levels" in the option and explanation, so a reader who knows real depths is not marked wrong in spirit.

Otherwise sound; every `explain` agrees with the lesson it names.

## src/content/lessons/testing-scalability/data-volume.mdx

- [ ] **S2** · `data-volume.mdx:274` · "Filter predicates are like unexploded ordnance." is the source sentence ("…unexploded ordnance devices"). · Fix: "A filter predicate is a time bomb: harmless at today's volume, and nothing in the plan says when it goes off."
- [ ] **S2** · `data-volume.mdx:30` · The two-part definition of scalability ("ability to cope with a growing amount of work in a capable manner … ability to be enlarged so that it can cope with that growth") is Wikipedia's definition almost word for word, presented as the lesson's own prose; the book quotes it with attribution. · Fix: "Wikipedia defines scalability as …" with a link, or paraphrase properly.
- [ ] **S3** · `data-volume.mdx:139,147` and `:252,260` · The two SQL Server plans seek on `section=2` (slow) and `section=1` (fast) while the text says the pairs differ only in the index name. The book has the same inconsistency; there is no need to copy it. · Fix: use the same section value in both plans.
- [ ] **S3** · `data-volume.mdx:267` · "`Filter` is used only for conditions on columns the index does not contain" is too strong; PostgreSQL also puts conditions on indexed columns under `Filter` when the operator is not index-searchable. · Fix: "`Filter` is mostly for conditions the index cannot evaluate at all".

TryIt 3.1 verified: `SEARCH employees USING COVERING INDEX emp_slow (subsidiary_id=?)` → after `emp_fast`, `(subsidiary_id=? AND last_name=?)`; 33 Winands in subsidiary 20, 500 in the subsidiary. Figure numbering 3.1–3.4 across the unit is in reading order; `ScaleChart` accepts the `title` prop used at `response-time…mdx:44`.

## src/content/lessons/testing-scalability/practice.mdx

No problems found. All counts verified (66 / 33 Winands, 147 born before 1970 in subsidiary 20, 500 in the subsidiary, 938 and 11,442 sales) and every plan string matches, including the exact `^SCAN sales$` and `^SCAN employees USING COVERING INDEX emp_sub_name` regexes.

## src/content/lessons/testing-scalability/system-load.mdx

- [ ] **S3** · `system-load.mdx:83` · "A careful inspection of the execution plan gives more confidence than a superficial benchmark." is a light reword of the source ("Careful execution plan inspection yields more confidence than superficial benchmarks."). Borderline; rephrase if the originality bar is strict. · Fix: "Read the plan carefully and you learn more than a quick benchmark can tell you."

Otherwise clean: Figure 3.3 numbers agree with the recap and the Check, the per-engine predicate-location notes are correct.

## src/content/lessons/testing-scalability/response-time-throughput-scaling-horizontal.mdx

- [ ] **S2** · `response-time….mdx:26` · "Bigger hardware is not always faster, but it can almost always handle more load" is the source's opening sentence with one word changed. · Fix: "A bigger machine rarely makes one query faster; it mostly lets more queries run at once."
- [ ] **S2** · `response-time….mdx:40` (and recap `:19`) · "Proper indexing is the best way to reduce query response time, in relational SQL databases and in non-relational systems alike." is the source sentence reordered. · Fix: "Whatever the database, relational or not, the fastest way to cut a query's response time is a correct index."
- [ ] **S3** · `response-time….mdx:82` · "Facts to keep" callout is a closing summary in the prose, which the guide forbids; the recap already says it. · Fix: delete the callout.
- [ ] **S3** · `response-time….mdx:66` · Common-mistake quote `"We will add a replica."` will trip the "we will" lint. · Fix: `"Just add a read replica."`

## src/content/lessons/testing-scalability/unit-check.mdx

No problems found.

## src/content/lessons/where-clause/the-equals-operator.mdx

- [ ] **S3** · `the-equals-operator.mdx:12,23,31,35,45` · "chapter" five times, including in the Check question ("Based on this chapter's opening"). · Fix: unit.
- [ ] **S3** · `the-equals-operator.mdx` · Only two `##` sections (guide: three to six) and no TryIt. Acceptable for an overview page, but `functions.mdx` has the same shape; decide once whether overview pages are exempt and note it in `CONTENT_GUIDE.md`.

## src/content/lessons/where-clause/the-equals-operator/primary-keys.mdx

- [ ] **S2** · `primary-keys.mdx:136` · "`RID Lookup` to `TABLE ACCESS BY ROWID`": Oracle's operation is `TABLE ACCESS BY INDEX ROWID`, the name used everywhere else on the site. · Fix the name.
- [ ] **S3** · `primary-keys.mdx:125-136` · The SQL Server plan shows `RID Lookup`, i.e. a heap table, while `anatomy/slow-indexes.mdx:155` tells the reader a PK lookup on SQL Server is normally a single `Clustered Index Seek`. Both are true; the reader is not told why this one differs. · Fix: one sentence: "The book's test table is a heap; with the default clustered primary key the whole thing is one `Clustered Index Seek`."

TryIt 2.1 verified, including the negative-lookahead regexes for tasks 2 and 3 (`(employee_id=?)` prefix search; `SCAN employees` for `subsidiary_id = 30`).

## src/content/lessons/where-clause/the-equals-operator/concatenated-keys.mdx

- [ ] **S2** · `concatenated-keys.mdx:129` · "one under 123, one under 124, one under 126" does not match the figure: `src/components/figures/ConcatIndex.tsx:5` has four entries for subsidiary 20 (123, 124, 126 and 127). · Fix: "four entries, under 123, 124, 126 and 127".
- [ ] **S2** · `concatenated-keys.mdx:68` · "A concatenated index is one index across several columns, not several indexes side by side." is the source sentence plus a tail. · Fix: "One B-tree, several columns. There is no second tree hiding behind the second column."
- [ ] **S3** · `concatenated-keys.mdx:33` vs `:94-95` · The same index is written `employees_pk` and then `EMPLOYEES_PK` / `EMPLOYEES` in upper case. · Fix: one spelling.

TryIt 2.2 verified; the follow-up at `:216` (`employee_id = 123` still a `SEARCH` on the primary key) also verified.

## src/content/lessons/where-clause/the-equals-operator/slow-indexes-part-ii.mdx

- [ ] **S3** · `slow-indexes-part-ii.mdx:32` · "Rule-based optimizers are rigid and rarely used today." is the source sentence with two synonyms swapped. · Fix: "Hardly any current database still ships a rule-based optimizer."

TryIt 2.3 verified exactly as the hint describes: `emp_sub (subsidiary_id=?)` first, `emp_name (last_name=?)` after the new index, and still `emp_name` after `ANALYZE` (`sqlite_stat1`: `emp_name 1000 67`, `emp_sub 1000 334`; the hint's "about 333" is fine).

## src/content/lessons/where-clause/functions.mdx

- [ ] **S2** · `functions.mdx:17` (recap), `:43` (MySQL tab), `:8`/`:13` · "SQL Server and MySQL index a computed or generated column" is out of date for MySQL: since 8.0.13 MySQL indexes an expression directly (`CREATE INDEX i ON employees ((UPPER(last_name)))`, "functional key parts", implemented as a hidden generated column). An expert will notice the omission. · Fix: add "MySQL 8.0.13 and later can also index the expression directly" in the tab and soften the recap to "SQL Server, and MySQL before 8.0.13, go through a computed or generated column". Same correction in `case-insensitive-search.mdx:204,208` and its outcomes `:15` / recap `:21`.

## src/content/lessons/where-clause/functions/case-insensitive-search.mdx

- [ ] **S2** · `case-insensitive-search.mdx:204` · "SQL Server and MySQL do not index an expression directly." See `functions.mdx` above. · Fix as there.

Everything else verified: `SCAN employees` → `SEARCH employees USING INDEX emp_up_name (<expr>=?)`, and `LOWER` falls back to `SCAN` as the hint says; `<expr>` renders correctly in the built page; the Hibernate `LOWER` link target does discuss it (`myth-directory/dynamic-sql-is-slow.mdx:61`).

## src/content/lessons/where-clause/functions/user-defined-functions.mdx

- [ ] **S3** · `user-defined-functions.mdx:50` · "Only functions that always return the same result for the same arguments can be indexed." is the source sentence with one word changed. · Fix: "An index can only hold a function whose output is fixed by its input: same argument, same result, forever."

TryIt 2.5 verified, including the exact SQLite error text `non-deterministic use of julianday() in an index` and the `(date_of_birth>? AND date_of_birth<?)` plan for the `>` / `<=` range.

## src/content/lessons/where-clause/functions/over-indexing.mdx

- [ ] **S3** · `over-indexing.mdx:25` · "That is in fact the last thing you should do." is the source sentence minus "very". · Fix: "Do not. Every index you add is a tree the database has to keep in step with the table, for as long as it exists."
- [ ] **S3** · `over-indexing.mdx:129` · Check `explain`: "A function-based index costs no more to maintain than any other" is slightly off; it also evaluates the expression on every write. · Fix: "costs little more to maintain than any other".

TryIt 2.6 verified. The catalogue queries in the engine tabs use real view and column names (`DBA_INDEX_USAGE.TOTAL_ACCESS_COUNT`, `SYSCAT.INDEXES.LASTUSED`, `sys.schema_unused_indexes`, `sys.dm_db_index_usage_stats`).

## src/content/lessons/where-clause/bind-parameters.mdx

- [ ] **S1** · `bind-parameters.mdx:160` · C# sample with bind parameter is missing the closing quote: `+ " where subsidiary_id = @subsidiary_id` followed by `, connection);`. It does not compile. (The book has the same typo; the WebFetch of the source confirms it, which is no reason to keep it.) · Fix: `+ " where subsidiary_id = @subsidiary_id"`.
- [ ] **S2** · `bind-parameters.mdx:171-175` · Java "without bind parameters" sample calls `connection.createStatement("select …")`; JDBC's `createStatement()` takes no SQL, the text goes to `executeQuery`. Again inherited from the book. · Fix: `Statement command = connection.createStatement();` then `ResultSet rs = command.executeQuery("select first_name, last_name from employees where subsidiary_id = " + subsidiary_id);`.
- [ ] **S2** · `bind-parameters.mdx:46-91` vs `:289-296` · The worked example makes subsidiary 20 the small one (99 rows, index) and 30 the big one (1,000 rows, full scan); the playground two screens later has 20 = 500 rows (half) and 30 = 200 (a fifth). A reader who runs the exercise sees the sizes inverted. · Fix: swap the literals in the story (`30` → index plan, `20` → full scan) since the plans are illustrative anyway, or add one line before the TryIt: "The book's test table is ten times bigger and its subsidiaries are the other way round."
- [ ] **S2** · `bind-parameters.mdx:296` · Hint: "Oracle costs the 500-row subsidiary as a full scan and the 200-row one as an index range scan." Unsupported: on a 1,000-row table that fits in a few blocks Oracle would full-scan both. · Fix: "With a histogram and a literal, Oracle could pick a different plan per subsidiary, as section 2 shows on the book's larger table."
- [ ] **S3** · `bind-parameters.mdx:107` and `:267` · "Not using bind parameters is like recompiling a program every time you run it." and "Bind parameters cannot change the structure of a statement." are both the source sentences with one word added or removed. · Fix: "Skipping bind parameters means paying the optimizer for every execution, like rebuilding a binary before each run." / "A placeholder can hold a value. It cannot hold a table name, a column name or a piece of syntax."
- [ ] **S3** · `bind-parameters.mdx:139` · The topic has an obvious Common mistake (string concatenation) but no `<Callout kind="warning" title="Common mistake">`. · Fix: wrap the "without bind parameters" lead-in as the Common mistake callout.

TryIt 2.7 verified (`emp_sub (subsidiary_id=?)` for both 20 and 30). The engine notes on plan caching (PostgreSQL five custom plans then generic, Oracle bind peeking and adaptive cursor sharing, SQL Server parameter sniffing with `OPTION (RECOMPILE)` / `OPTIMIZE FOR UNKNOWN`, Db2 `REOPT`) are accurate.

## src/content/lessons/where-clause/practice-column-order.mdx

- [ ] **S3** · `practice-column-order.mdx:30,62,88,119,150` · TryIt ids are `"1"` … `"5"` (renders as "Exercise 1"), whereas the other practice sets use `p1.1`, `p3.1`. Progress keys include the lesson id (`TryIt.astro:36`), so nothing collides, but the exercise headings differ from the rest of the site. · Fix: `p2.1` … `p2.5`.

Everything else verified: Elena Novak is employee 123 in subsidiary 30; 34 Novaks in subsidiary 30 and 67 overall; with both indexes and `ANALYZE` SQLite picks `emp_sub`, and `emp_sub_name (subsidiary_id=?)` after the drop; swapping the where-clause order leaves the plan unchanged; the catalogue query returns three indexes.

## Not found (checked explicitly)

- No em dashes, exclamation marks in prose, TODO/TBD placeholders, or "we will" outside the one quoted phrase above.
- Every `/sql/…` link in these files resolves to a page in `dist/`.
- Every lesson has at least one `KeyIdea` and ends with exactly one `Check`; practice sets have 3–5 TryIts and one Check; unit checks have 5–6 Checks and nothing else.
- Figure numbers run 1.1–1.8, 2.1–2.3, 3.1–3.4 in reading order with no gaps or duplicates (apart from Figure 1.3 being a repeat of 1.1, noted above). Every "Figure n" referenced in prose exists.
- Section numbers referenced in prose ("section 6", "section 1", "section 2") exist in the file that references them.
- No Check has an ambiguous correct option or an `explain` that contradicts its lesson.

## Verdict

The teaching content is in good shape: every playground claim in these 21 files is true against the actual SQLite database, the row counts and plan strings are exact, the per-engine plan material is faithful to the book and technically correct, and the Checks are well posed. Two things must be fixed before anyone is pointed at the site: the smartypants build setting, which turns every `Show solution` block into SQL that does not run, and the two code samples in bind-parameters that are inherited bugs from the book (a missing quote in C#, a non-existent JDBC call in Java). After those, the items an expert would actually catch are the B-tree figure count (27/9, not 30/10), the "four reads for a thousand rows" line, the outdated MySQL functional-index claim, the `TABLE ACCESS BY ROWID` misnomer and the inverted subsidiary sizes in bind-parameters. The ten near-verbatim sentences are concentrated in the unit 3 and where-clause pages and are each a one-line rewrite. "Chapter" versus "unit" is the only pervasive style problem and is a mechanical find-and-replace.
