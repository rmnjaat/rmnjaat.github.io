# Review: Units 4–8 and the reference section

Read-only technical review, 2026-10-11. Scope: `src/content/lessons/{join,clustering,sorting-grouping,partial-results,dml}/*.mdx`, all of `src/content/reference/`, five built pages under `dist/sql/`, `dist/index.html`, `dist/practice/index.html`. Nothing was edited.

What was checked and passed: `node scripts/check-playgrounds.mjs` on every unit (33 playgrounds, 0 errors); every post-index plan and row count a task or hint asserts, re-run against `public/schema.sql` in sql.js 3.49 (all match except the one paging boundary below); all 75 distinct internal links in the lesson files and all 84 distinct "here" links in `about/site-map.mdx` resolve to a page in `dist/`; the 11 `/sql/glossary/#…` anchors exist in the built glossary; figure numbers are contiguous per unit (4.1–4.3, 5.1–5.2, 6.1–6.5, 7.1–7.7, 8.1–8.4) and every "Figure n.m" mentioned in prose exists; every lesson has a `KeyIdea`, one closing `Check`, and `client:visible` on the islands; every unit check has 5–6 questions; all seven explain-plan pages carry the four sections; no em dashes, en dashes or exclamation marks in prose (the only `!` hits are Oracle's `SYSDATE@!` and blog titles in the site map); no placeholders; the built pages render without leaked MDX, regex escapes or `undefined`.

## Verdict

The units are in good technical shape: the SQL, the SQLite plans and the row counts hold up against the real schema, the cross-references resolve, and the lesson shape is followed throughout. The serious problems are few and specific. One playground in the paging lesson is off by a page (it says the seek query reproduces the OFFSET result shown, and it does not), and a handful of vendor facts are wrong for the versions the site targets: PostgreSQL accepts `OFFSET n ROWS`, MySQL 8.4 rejects `EXPLAIN EXTENDED` rather than ignoring it, the PostgreSQL B-tree entry limit is 2704 not 2713, `innodb_large_prefix` no longer exists, and the Hibernate dynamic-update default is repeated from the source although current Hibernate documents the opposite. The documented `sqlite3` export command on the schema page fails as written. Everything else is cosmetic: plan names that drift from the index they refer to, version strings a release or two behind the stated targets, one figure that does not show what the prose claims, and the usual handful of near-duplicate questions between lesson checks and unit checks.

## Most serious first

### src/content/lessons/partial-results/fetch-next-page.mdx

- [ ] `fetch-next-page.mdx:265-276` · The playground claims the seek condition `(sale_date, sale_id) < ('2025-04-24', 11887)` fetches the same page as `LIMIT 10 OFFSET 5000` ("page 501"), and the hint calls sale 11887 "the last row of page 500". Against the schema, row 5000 is sale 18287 and sale 11887 is row 5010; the seek query returns rows 5011–5020 (first row sale 11247), the offset query returns rows 5001–5010 (first row sale 17647). `practice.mdx:68-77` has it right (OFFSET 5010, "page 501 ends with 11887, fetch page 502"). · Fix: change the starting statement to `LIMIT 10 OFFSET 5010`, the intro to "page 502 by offset", and the hint to "the last row of page 501: sale 11887 on 2025-04-24"; or keep OFFSET 5000 and use boundary `('2025-04-24', 18287)` throughout (tasks 2–3, hint, solution).
- [ ] `fetch-next-page.mdx:61` · "PostgreSQL only accepts `OFFSET` without the `ROWS` keyword" is false. The PostgreSQL 16 SELECT synopsis is `OFFSET start [ ROW | ROWS ]` and the docs call `ROW`/`ROWS` noise words. · Fix: "PostgreSQL accepts both the standard `OFFSET 10 ROWS` and the bare `OFFSET 10`; the `LIMIT`/`OFFSET` form shown for MySQL works as well."
- [ ] `fetch-next-page.mdx:219` · Plan shows `SL_DTIT` for the index created as `sl_dtid` at line 118 and used as `SL_DTID` in `window-functions.mdx:60`. · Fix: `SL_DTID`.
- [ ] `fetch-next-page.mdx:158` · "SQL Server 2017 does not support row values" while the site targets SQL Server 2022 (still true there). · Fix: "SQL Server, 2022 included, does not support row value comparisons".

### src/content/reference/explain-plan/mysql.mdx

- [ ] `mysql.mdx:35` · "`EXPLAIN EXTENDED` … that keyword is now accepted and ignored" is wrong for 8.0 and 8.4. MySQL 8.0 release notes, "Features Removed": "The `EXTENDED` and `PARTITIONS` keywords for the EXPLAIN statement have been removed." It is a syntax error on 8.4. · Fix: "Before 5.7 the `filtered` column and the rewritten query were only available through `EXPLAIN EXTENDED`; 8.0 removed the keyword because both are always on."

### src/content/reference/example-schema/index.mdx

- [ ] `example-schema/index.mdx:234-235` · The documented export command fails: `sqlite3 :memory: < public/schema.sql ".mode insert employees" "SELECT * FROM employees" …` runs the argument commands before it reads stdin, so it dies with `no such table: employees` (reproduced with the local sqlite3). · Fix: `sqlite3 :memory: ".read public/schema.sql" ".mode insert employees" "SELECT * FROM employees" ".mode insert sales" "SELECT * FROM sales" > data.sql`.
- [ ] `example-schema/index.mdx:227` · "add the index that the delete lesson asks for: `CREATE INDEX sales_employees ON sales (employee_id, subsidiary_id)`". The delete lesson never names an index; it only warns about unindexed foreign keys (`delete.mdx:74`). The join unit creates the equivalent index as `sales_emp (subsidiary_id, employee_id)`. · Fix: "add an index on the foreign key columns, which the delete lesson's warning about cascading deletes assumes, for example the `sales_emp (subsidiary_id, employee_id)` index the join unit creates."
- [ ] `example-schema/index.mdx:17,58,60` · "where clause chapter", "sorting and paging chapters" link to site units that are called "Unit 2", "Unit 6", "Unit 7" everywhere else. · Fix: "Unit 2 (the where clause)", "the sorting and paging units". Same wording in `myth-directory/dynamic-sql-is-slow.mdx:45,99` and `myth-directory/indexes-can-degenerate.mdx:33` ("where clause chapter"). "Chapter" is fine where the book itself is meant (`about/index.mdx`, `site-map.mdx`, the "book's own scripts" section).

### src/content/lessons/clustering/index-only-scan-covering-index.mdx

- [ ] `index-only-scan-covering-index.mdx:231` · "B-tree entries are limited to 2713 bytes … 'index row size … exceeds btree maximum, 2713'". Since PostgreSQL 12 (B-tree version 4) the limit is 2704 bytes and the message reads "index row size N exceeds btree version 4 maximum 2704 for index"; 2712 was the pre-12 figure. · Fix: "2704 bytes (PostgreSQL 12 and later; 2712 before)" and the matching message text.
- [ ] `index-only-scan-covering-index.mdx:219` · "each column to 767 bytes unless `innodb_large_prefix` is on or the row format is `DYNAMIC` or `COMPRESSED` (the 767-byte limit was the default up to MySQL 5.6)". `innodb_large_prefix` was removed in MySQL 8.0; on 8.x the index key prefix limit is 3072 bytes for `DYNAMIC`/`COMPRESSED` (the default row format since 5.7.9) and 767 only for `REDUNDANT`/`COMPACT`. · Fix: drop the `innodb_large_prefix` clause and state the row-format rule for 8.x.
- [ ] `index-only-scan-covering-index.mdx:221` · "MySQL may, depending on the SQL mode and row format, truncate it silently and report only the warning 'Specified key was too long'". With the 8.x default strict mode this is error 1071, not a warning. · Fix: "in strict SQL mode, the default since 5.7, it is an error; only with strict mode off is the key silently shortened to a prefix with a warning".
- [ ] `index-only-scan-covering-index.mdx:228` · "Oracle 11g allows 6398 bytes" reads as dated against the stated Oracle 23ai target. · Fix: "with 8 KB blocks and default storage the limit is 6398 bytes (unchanged from 11g through 23ai)".

### src/content/lessons/dml/update.mdx

- [ ] `update.mdx:74` · "The original notes that the mode has been on by default since Hibernate 4.0". The source does say "Since version 4.0, this mode is enabled by default", but it is wrong: Hibernate 4, 5 and 6 document `dynamic-update` / `@DynamicUpdate` as off by default (the default UPDATE sets every mapped column). Repeating it, even attributed, tells readers they need not check. · Fix: "The original says the mode became the default in Hibernate 4.0; the current Hibernate documentation still lists `@DynamicUpdate` as off by default, so check the mapping rather than the version."
- [ ] `update.mdx:68-72` · The "ORM writes every column" example for `sale_id = 17647` uses `employee_id = 57, subsidiary_id = 30, … product_id = 17` and then says "Only `quantity` differs from what is stored". In the schema row 17647 is employee 594, subsidiary 20, product 192 (date and value match). · Fix: use the real values (`employee_id = 594, subsidiary_id = 20, sale_date = '2025-04-24', eur_value = 785.6, product_id = 192, quantity = 3`), or drop "from what is stored".

### src/content/lessons/join/hash-join-partial-objects.mdx

- [ ] `hash-join-partial-objects.mdx:330-332` and recap `:21` · "A join condition with a range … or any other inequality, is a theta join, and a hash join cannot execute it. The optimizer falls back to nested loops." Overstated: a hash join needs at least one equality condition; extra range conditions are hashed on the equality and filtered afterwards (every engine does this, and MySQL's own EXPLAIN prints them as a filter on the hash join). MySQL 8.0.20 and later even run joins with no equality condition as a hash join over a Cartesian build with a filter. · Fix: "A hash join needs at least one equality condition to hash on. Range conditions in the join predicate are checked afterwards as filters; a join with no equality at all, a pure theta join, cannot be hashed in most engines and runs as nested loops (MySQL 8.0.20 and later are the exception and hash it anyway, filtering every pair)."
- [ ] `hash-join-partial-objects.mdx:56-59,135-139` vs `sort-merge-join.mdx:60-65` · Oracle plans in the same unit mix the book's data volume (10,000 employees, 1M sales) with the playground's (1,000 / 20,000). Not wrong, but the index-only-scan lesson (`:113`) then reads "about 40,000 entries" against a 20,000-row playground table. · Fix: a one-line note in each book-scale plan ("book volume: 10,000 employees, one million sales"), as `example-schema/index.mdx:13` promises.

### src/content/lessons/join/nested-loops-join-n1-problem.mdx

- [ ] `nested-loops-join-n1-problem.mdx:239` · `Restrictions.ilike("lastName", 'Win%')` is not valid Java (single-quoted string). The book has the same typo. · Fix: `"Win%"`.
- [ ] `nested-loops-join-n1-problem.mdx:365-367` · The PostgreSQL plan prints `Index Cond: (upper(last_name) ~~ 'WIN%'::text)` and the note then says `LIKE` "needs a `text_pattern_ops` index or the `C` collation to become an index condition". PostgreSQL never prints `~~` as an `Index Cond`; with `text_pattern_ops` it prints `Index Cond: ((upper(last_name) ~>=~ 'WIN'::text) AND (upper(last_name) ~<~ 'WIO'::text))` plus `Filter: (upper(last_name) ~~ 'WIN%'::text)`. · Fix the plan text accordingly.
- [ ] `nested-loops-join-n1-problem.mdx:344-346` · Db2 plan names `EMP_NAME` and `SALES_SUB_EMP` while the lesson creates `emp_up_name` and `sales_emp` (`:186-187`). The note explains `UPPER` was dropped for Db2 but not the second rename. · Fix: `SALES_EMP` in the plan, or one more clause in the note.

### src/content/lessons/join/sort-merge-join.mdx

- [ ] `sort-merge-join.mdx:37` · "The figure above steps through one [full outer join]: rows without a partner on either side are emitted with nulls as the cursors pass them." `Joins.tsx` merge mode (steps "Sort both", "Zip", "When it wins") only dims the unmatched `e3`; it never emits a null-padded row and has no outer-join step. · Fix: either cut the sentence to "the figure shows the zipper; a full outer join simply emits the unmatched rows on either side as the cursors pass them", or add a step to the figure.
- [ ] `sort-merge-join.mdx:63` · Oracle plan uses `EMPLOYEES_PK` with 1,000 rows where every other Oracle plan in the unit uses the book's 10,000-row table; see the hash-join item above.

### src/content/lessons/sorting-grouping/indexed-order-by.mdx

- [ ] `indexed-order-by.mdx:67` · Note says "The where clause was written as `WHERE sale_date > CURRENT_DATE - 1 DAY` for Db2", but the plan it explains (`:64-65`) shows `START (Q1.SALE_DATE = (CURRENT DATE - 1 DAYS))` / `STOP (… = …)`, an equality, as in the Oracle query. · Fix: "`WHERE sale_date = CURRENT DATE - 1 DAY`".

### src/content/lessons/sorting-grouping/order-by-asc-desc-nulls-last.mdx

- [ ] `order-by-asc-desc-nulls-last.mdx:52` · Db2 clause is `DISALLOW REVERSE SCANS` (plural), not `DISALLOW REVERSE SCAN`. · Fix the keyword.
- [ ] `order-by-asc-desc-nulls-last.mdx:216,219,222` and `unit-check.mdx:64` · "as of 19c", "as of SQL Server 2019", "as of MySQL 8.0" against targets Oracle 23ai, SQL Server 2022, MySQL 8.4. All three statements remain true on the newer releases. · Fix: bump the version strings ("as of 23ai", "as of SQL Server 2022", "as of MySQL 8.4").

### src/content/lessons/sorting-grouping/indexed-group-by.mdx

- [ ] `indexed-group-by.mdx:35` · "MySQL 8.0 does not use the hash algorithm for `GROUP BY`." MySQL 8.x's "Aggregate using temporary table" plan is a hash-keyed temporary table in practice; the sentence is the book's and defensible only in the narrow sense that no operator is named "hash aggregate". · Fix: "MySQL has no hash aggregate operator as such; it groups through a temporary table (`Using temporary`) or, with an index in group order, with `Group aggregate`. The index optimisation below works all the same."
- [ ] `indexed-group-by.mdx:118` · "Oracle cannot read an index backwards to execute a pipelined group by that is followed by an `ORDER BY`" is the source sentence with two words changed (see the originality section). · Fix: rephrase, e.g. "Oracle will not combine a backward index read with a pipelined group by when an `ORDER BY` follows; the sort comes back."

### src/content/lessons/partial-results/window-functions.mdx

- [ ] `window-functions.mdx:107` · Second Db2 plan names the index `SALES_DT_ID`; the query (`:88-98`) and the first plan (`:80`) use `SL_DTID`. · Fix: `SL_DTID`.

### src/content/lessons/partial-results/top-n-queries.mdx

- [ ] `top-n-queries.mdx:88` · "From SQL Server 2012 the standard `FETCH FIRST` form is supported too" without saying that SQL Server requires `OFFSET` (the next lesson says so at `fetch-next-page.mdx:71`). On its own the sentence invites `SELECT … ORDER BY … FETCH FIRST 10 ROWS ONLY`, which is a syntax error there. · Fix: "… supported too, but only together with `OFFSET`: `OFFSET 0 ROWS FETCH FIRST 10 ROWS ONLY`."

### src/content/lessons/clustering/index-organized-clustered-index.mdx

- [ ] `index-organized-clustered-index.mdx:144-149` · The SQL Server DDL declares `id NUMBER NOT NULL`; `NUMBER` is an Oracle type (the book has the same slip). · Fix: `id INT NOT NULL`.

### src/content/lessons/dml/insert.mdx

- [ ] `insert.mdx:48,54` · "about 0.0003 seconds" for the no-index insert is stated as a measurement. The source gives no number ("the execution time is hardly visible if the table does not have any indexes"); the figure is read off a chart whose axis starts at 0. · Fix: "too small to read off the chart (well under a millisecond)" and drop the 0.0003 row, or mark it "below the chart's resolution".

### src/content/reference/explain-plan/oracle.mdx

- [ ] `oracle.mdx:159-173` · The `ALLSTATS LAST` plan is introduced right after the two equality examples, has no `Predicate Information`, and only at `:173` does the text say it is "the output of the `LIKE` query above". `E-Rows 25` and `Buffers 4` cannot be checked by the reader against anything. · Fix: say which statement the plan belongs to before the plan, and show its `Predicate Information` (`access("SUBSIDIARY_ID"=20) filter("LAST_NAME" LIKE '%and')`).

### src/content/reference/explain-plan/sqlite.mdx

- [ ] `sqlite.mdx:116-123` · "The playground runs `ANALYZE` … With that knowledge the planner picks [the `ANY(subsidiary_id)` skip scan]". The playground's `ANALYZE` runs before any user index exists, so after `CREATE INDEX emp_sub_name …` the plan is still `SCAN employees` until `ANALYZE` is run again (verified both ways). · Fix: "Run `ANALYZE` again after creating the index; its statistics then say…".

### src/content/reference/glossary/index.mdx

- [ ] `glossary/index.mdx:84-86` · Defines a secondary index as "an index on a table that is itself a clustered index … an index on an index", while `index-organized-clustered-index.mdx:54` defines it as "any further index on the table. On a heap it stores rowids like any other index." · Fix the glossary: "Any index on a table other than the one that stores or orders the table. On a heap it stores rowids like any other index; on a clustered table or index-organized table it stores the clustering key instead, so every lookup through it is two tree traversals."
- [ ] `glossary/index.mdx:68-70` · "Covering index … The term describes the index" sits next to `index-only-scan-covering-index.mdx:109` and recap `:17`: "covering is a property of the plan, not the index". · Fix: "The term names the index, but whether it covers depends on the query: the same index covers `SUM(eur_value)` and not `SUM(quantity)`."

### Unit checks: near-duplicate questions

- [ ] `join/unit-check.mdx:50-60` repeats `hash-join-partial-objects.mdx:358-368` (six-month report as hash join, "what makes it faster", same correct answer and same distractor about reversing the join order). · Fix: ask something the lesson Check does not, for example the symmetry of hash-join indexing or the memory footprint.
- [ ] `partial-results/unit-check.mdx:67-77` repeats `window-functions.mdx:230-240` (which engines stop a `ROW_NUMBER` scan after row 20; identical answer list). · Fix: replace one, for example with the Db2 double-wrap question.
- [ ] `dml/unit-check.mdx:67-77` repeats `update.mdx:103-113` (an update of one column, which indexes move). · Fix: ask about the all-columns ORM update instead.

### Hints and tasks

- [ ] `partial-results/practice.mdx:32,38` · Task 3 asks "Which index would fix that?" and the hint answers it in full ("(subsidiary_id, sale_date). Create it and compare the plans."). Nothing checks the answer. · Fix: move the index to the "Show solution" block and leave the hint at "the equality column has to come before the sort column".
- [ ] `clustering/index-only-scan-covering-index.mdx:247-249` · Task 1 regex `plan: 'COVERING INDEX sales_sub_eur'` also passes if the reader has already added `sale_date` to the where clause? No: that plan drops `COVERING`. Fine. Task 3 regex `sql: 'select\\s+\\*'` passes for any `SELECT *` statement, including `SELECT * FROM sales WHERE subsidiary_id = 20 AND eur_value > 500`, which is the intended teaching anyway. No change needed; listed so the next reviewer does not re-check it.

### Originality (verbatim spot-check against `source:` pages)

Method: every `source:` page (plus the explain-plan sub-pages and the eleven glossary sub-pages) was fetched and its prose compared with the MDX prose (code, plans, tables and JSX excluded) for identical runs of 7+ words and for sentence-level paraphrase; each hit below was then confirmed by eye. The reference section (myth directory, glossary, all explain-plan pages) is clean. The lessons are restructured, but a steady trickle of the book's "key sentences" survives nearly intact, mostly inside `KeyIdea` and `Callout` boxes and in per-engine fact lines. Densest files: `clustering/index-only-scan-covering-index.mdx`, `clustering/index-organized-clustered-index.mdx`, `partial-results/top-n-queries.mdx`, `partial-results/fetch-next-page.mdx`, `dml/insert.mdx`. Fix for every item: rewrite the sentence in the site's own words; where it is a `KeyIdea`, make it the lesson's formulation, not the book's.

Verbatim (identical or one word apart):

- [ ] `dml/delete.mdx:72` · the whole PostgreSQL callout mirrors the source paragraph sentence by sentence; "PostgreSQL's delete performance therefore does not depend on the number of indexes on the table." is a 17-word identical run; the same phrase recurs in frontmatter lines 8, 15 and 21.
- [ ] `dml/insert.mdx:64` · "The first index makes the greatest difference." (identical) and "To keep inserts fast, keep the number of indexes small." (source: "it is very important to keep the number of indexes small").
- [ ] `sorting-grouping/order-by-asc-desc-nulls-last.mdx:104` · "Databases can read indexes in both directions." (identical).
- [ ] `partial-results/fetch-next-page.mdx:158` · "SQL Server 2017 does not support row values at all." (identical; also stale, see above).
- [ ] `join/hash-join-partial-objects.mdx:13` (outcomes) · "indexing a hash join is independent of the join order" (identical 10-word run).

Near-verbatim (same sentence, trivial word changes) and close paraphrases keeping the source's structure:

- [ ] `join/hash-join-partial-objects.mdx:34,48,207,209` · "loaded in one go, so there is no need for an index that can fetch single rows"; "the only independent where condition: it refers to one table and is not part of the join"; "from nine megabytes to 234 kilobytes, a reduction of 97 percent"; "Select fewer columns to improve a hash join."
- [ ] `join/nested-loops-join-n1-problem.mdx:183` · "Indexing for a nested loops join is therefore the same as indexing those two statements."
- [ ] `clustering/index-filter-predicates.mdx:106,108,200` · "depends on the physical distribution of the rows, in other words on how well they are clustered"; "an indirect measure of the probability that two consecutive index entries point into the same table block"; "Some databases even let you add columns to the primary key index that are not part of the key."
- [ ] `clustering/index-only-scan-covering-index.mdx:109,113,117,175,183,185,193,221,228,231,238` · "The term is a little misleading, because it sounds like a property of the index."; "the optimizer expects to aggregate about 40,000 entries … the saving shrinks accordingly"; "The advantage of an index-only scan depends on the number of rows the query touches and on the index clustering factor." (KeyIdea-style callout); "What counts is not how many rows come out but how many the database has to inspect to find them."; "Some indexes have a good clustering factor by nature, and for them an index-only scan brings little."; "broke the index-only scan but also opened a new access path"; "Index the original data whenever you can … Avoid function-based indexing for expressions that cannot serve as access predicates." (KeyIdea); "has nothing to do with the partial indexes of Unit 2 … depending on the SQL mode and row format, truncate"; "depends on the block size and the index storage parameters, roughly 75 percent of the block minus overhead"; the whole 2713-byte sentence pair; "Queries that select no table columns at all are often executed as index-only scans."
- [ ] `clustering/index-organized-clustered-index.mdx:35,37,56,58,110,112,151` · "Some databases can use an index as the primary store for a table."; "Two benefits follow. The space for the heap is saved, and every access through the clustered index is automatically an index-only scan."; "The clustered index's B-tree stands between the secondary index and the data."; "Accessing an index-organized table through a secondary index is very inefficient" (Callout); the whole paragraph at 110 is the source paragraph sentence for sentence; "the select performance of a clustered index … without slowing down the other indexes"; "Dropping the clustered index turns the table back into a heap."
- [ ] `sorting-grouping/indexed-order-by.mdx:174` · "The database has less freedom to align index order with table order, so the clustering factor can only get worse"; recap `:21` "put the full index definition in the ORDER BY".
- [ ] `sorting-grouping/order-by-asc-desc-nulls-last.mdx:28,87,108` · "the scanned index range is in the exact opposite order" (twice); "uses the tree to find the last matching entry".
- [ ] `sorting-grouping/indexed-group-by.mdx:31,35,116,118` · "first sorts the input by the grouping key"; the MySQL note; both "Engine traps" sentences (PostgreSQL and Oracle) are the source sentences with two or three words changed.
- [ ] `partial-results/top-n-queries.mdx:34,42,97,210,212,231` · "Tell the database whenever you do not need all the rows." (KeyIdea); "Db2 has supported the standard's FETCH FIRST since version 9 at least, on LUW and z/OS."; "The database can only optimise for a partial result if it knows about it from the start." (Callout); "the top-N syntax still helps, because the database does not have to materialize the full sorted result, only the ten most recent rows"; "A pipelined top-N query does not read and sort the entire result." (KeyIdea); "does not depend on the table, but it does depend on the number of rows selected".
- [ ] `partial-results/fetch-next-page.mdx:26,30,93,105,115,152,155` · the two-method definition in the opening paragraph; "even made it into the SQL standard as part of the FETCH FIRST extension"; "The seek method avoids both problems by using the values of the previous page as the delimiter."; "The lower bound is the last value of the previous page instead of a row count."; "add any unique column and extend the index accordingly"; the MySQL and Oracle row-value sentences.
- [ ] `partial-results/window-functions.mdx:18,51,69` · "Only SQL Server, Oracle and PostgreSQL 15 and later …"; "Oracle recognises the abort condition and uses the index to produce a pipelined top-N query."; "Since the aborted operations are pipelined, the query is as efficient as the offset method of the previous lesson."
- [ ] `dml/insert.mdx:30,34,38,40,44,66,76` · "the single most important factor for insert performance"; "The number of indexes is a multiplier on the cost of the statement."; "The entry cannot go into any block; it belongs in one specific leaf node."; "allocates a new node and distributes the entries between the old one and the new one"; "The index maintenance is the expensive part of an insert." (KeyIdea); "Create indexes deliberately and sparingly, and avoid redundant ones." (Callout); the "How would the curve change for an index-organized table" exercise prompt.
- [ ] `dml/delete.mdx:62` · "Just as a select that returns a large part of the table is better off with a full scan, a delete that removes a large part of the table can be too."
- [ ] `dml/update.mdx:80` · "Can you think of a case where an INSERT or a DELETE does not affect every index on the table either?" (the source's exercise prompt).

Not flagged (judgment calls): the IBM documentation quote in `explain-plan/db2.mdx:110`, which the page attributes to IBM; the SSMS UI phrase at `explain-plan/sql-server.mdx:45`; 7-word runs inside otherwise original sentences at `nested-loops-join-n1-problem.mdx:177` and `index-organized-clustered-index.mdx:19`.

### Checked and clean (no action)

- Playground claims verified against the schema: 66 employees named Winand (33 in subsidiary 20); 31 sales on 2024-06-01 and on 2025-04-24; 32 on 2024-05-23; 4,000 sales for subsidiary 30 and 10,000 for 20; 3,060 sales of subsidiary 30 since 2024-06-01; 15 groups on 2024-03-05; 968 rows since 2025-09-01; 970 sales before 2024-02-01; 66 sales of product 17 (26 since 2025-01-01); 15,244 sales since 2024-06-01; `sqlite_stat1` row `1000 334 34`; 640 distinct sale dates from 2024-01-01 to 2025-10-01; `eur_value` 9.9–909.8; every `USING INDEX` / `COVERING INDEX` / `TEMP B-TREE` / `LAST TERM OF ORDER BY` / `AUTOMATIC COVERING INDEX` / `BLOOM FILTER` plan a task or solution asserts, before and after the index it tells the reader to create.
- `fetch-next-page.mdx` Figure 7.4 and `order-by-asc-desc-nulls-last.mdx` Figure 6.5 matrices agree with the per-engine prose; `window-functions.mdx` Figures 7.5–7.7 and the "latest releases" line match the source page's current tables (MariaDB 12.3.2, MySQL 26.7.0, Oracle 23.26.2, PostgreSQL 18, SQL Server 2025).
- Vendor facts confirmed: PostgreSQL 18 `BUFFERS` default and `Index Searches`, 9.2 index-only scans, 16 `GENERIC_PLAN`, 15 `Run Condition`, 8.3 `NULLS FIRST/LAST` in indexes, 8.4 row values and `FETCH FIRST`; MySQL 8.0.16 `FORMAT=TREE`, 8.0.18 `EXPLAIN ANALYZE` and hash join, 8.0.13 functional indexes, 8.0 `Backward index scan` and real `DESC` indexes, `Using join buffer (hash join)`; Oracle 12c `FETCH FIRST`/`OFFSET`/`BATCHED`, `WINDOW NOSORT STOPKEY`, `SORT GROUP BY NOSORT`, `DBMS_XPLAN` format strings, `ORA-01796`; SQL Server 2012 `OFFSET … FETCH`, 2016 key limits (32 columns, 1700 bytes), 2019 `dm_exec_query_plan_stats`, `SHOWPLAN_TEXT`/`STATISTICS PROFILE`; Db2 11.1 `OFFSET`, 10.1 row-value index access and zigzag join, `SYSINSTALLOBJECTS`, `db2exfmt -1`, `EXPLAIN_FROM_SECTION`, `MON_GET_PKG_CACHE_STMT`; SQLite 3.15 row values, 3.24 tree output, 3.25 window functions, 3.30 `NULLS FIRST/LAST`, 3.36 `SEARCH` without `TABLE`, 3.38 Bloom filters, 3.39 `FULL OUTER JOIN`, `ANY()` skip-scan notation, the `LIKE` optimisation's collation rule.
- Site map: all 30 spot-checked "here" paths exist (in fact all 84 distinct ones do), including the twelve glossary anchors and the `postgres/concrete-planning` row.
