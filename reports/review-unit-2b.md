# Review: Unit 2, second half (ranges, partial indexes, NULL, obfuscation, practice, unit check)

Read-only review of `src/content/lessons/where-clause/` excluding the-equals-operator*, functions*, bind-parameters.mdx and practice-column-order.mdx. Checked against `public/schema.sql`, `node scripts/check-playgrounds.mjs` (29 playgrounds, 0 errors), the built HTML under `dist/sql/where-clause/`, every `/sql/...` link, and the original pages (downloaded and compared for shared word runs of 7+ words).

## Verdict

The content is technically solid: every row count and plan the prose or a task claims was reproduced in SQLite (938/435,416.10, 31, 297/58, 66, 2,439/122/65, 40, 30/15, 20, 219, employee 35, 200 unprocessed, 2 rows for receiver 42), all 29 playgrounds run, every internal link and anchor resolves, figure numbers 2.4 to 2.10 continue the first half with no gap or duplicate, and the lesson shape (sections, KeyIdea, TryIt, Common mistake, one Check) is followed in every full lesson. The two things that need fixing before this half ships are (1) a site-wide rendering bug: every `Show solution` `<pre>` block is run through the Markdown typographer, so the SQL the reader copies contains curly quotes and en dashes that SQLite rejects, and `count(*)` is turned into italics; and (2) a handful of vendor claims that are either wrong (MySQL index-merge intersection on two ranges, MySQL 5.7 function-based indexes) or out of date (PostgreSQL and bind parameters with LIKE, Oracle partial indexes). Beyond that, the Tip/Important boxes in most lessons are copied verbatim from the original and should be reworded, and a few plan comments say COVERING where the plan is not.

## Cross-file (most serious first)

- [ ] `obfuscation/dates.mdx:267-271`, `practice-ranges-null-obfuscation.mdx:41-49` and every `Show solution` / hint `<pre>` in all 13 files with a playground · **Rendering bug in the built HTML.** Astro's Markdown pipeline (smartypants is on by default; `astro.config.mjs` does not disable it) rewrites the text inside the `<pre>` blocks: `'2024-04-01'` becomes `‘2024-04-01’`, `--` becomes `–`, and `count(*) ... count(*)` becomes `count(<em>) ... count(</em>)`. Checked in `dist/sql/where-clause/*/index.html`: all 13 lessons show curly quotes and en dashes in the solution block; `obfuscation/dates` and `practice-ranges-null-obfuscation` (exercise 1) also show `count()` with `<em>`. A reader who copies the solution into the playground gets `unrecognized token`. · Fix: set `markdown: { smartypants: false }` in `astro.config.mjs` (one-line, site-wide), and escape the asterisks in the two files as `count(&#42;)` (the practice file already does this for `GLOB 'Win&#42;'` on line 98). Alternatively move solutions into fenced ```sql blocks outside the `<details>`.
- [ ] Exercise labels · The first half numbers TryIt blocks 2.1 to 2.7 by running count (`functions/case-insensitive-search.mdx` is `2.4`, `functions/user-defined-functions.mdx` is `2.5`, `bind-parameters.mdx` is `2.7`), this half numbers them by lesson order (`2.4.1`, `2.5`, `2.6.1`, `2.7.1`). The reader therefore meets "Exercise 2.5" twice (user-defined functions and partial indexes) and "Exercise 2.4" next to "Exercise 2.4.1". Progress keys are per page so nothing collides, but the labels are confusing. · Fix: pick one scheme for the unit; lesson-order ids (`2.3.1` for case-insensitive search, `2.3.2`, `2.3.3`, `2.3.4` for bind parameters) would make the first half consistent with this one.
- [ ] `searching-for-ranges.mdx`, `null.mdx`, `obfuscation.mdx` · The three group-overview lessons have no `KeyIdea`, no Common-mistake callout and no TryIt; the equivalent overviews in the first half (`the-equals-operator.mdx`, `functions.mdx`) each have two `KeyIdea`s. · Fix: add one `KeyIdea` to each (e.g. "Range operators use the index; they decide the column order" / "In Oracle, NULL is not a value and '' is NULL" / "If the column is not on its own, the index is not used"). TryIt is optional for a 2-minute overview.

## searching-for-ranges/greater-less-between-tuning-sql-access-filter-predicates.mdx

- [ ] `:109` · "a filter on `date_of_birth` matches 13 records, and a filter on `subsidiary_id` matches 13 records too. Look at the first column of each figure alone" · The figures as drawn do not support this: Figure 2.5 shows 11 entries inside the date range and Figure 2.6 shows 8 entries for subsidiary 27 (the original figures are longer). · Fix: either extend both figures to 13 entries each, or change the sentence to "in the full index both conditions match the same number of rows, 13".
- [ ] `:55` vs `:210-211`, `:238-240`, `:283-291` · Prose says "born between the first and the ninth of January 1971"; every plan and the BETWEEN example use `1971-01-10` / `'10-JAN-71'`. · Fix: "between the first and the tenth of January 1971".
- [ ] `:222` and `:254` · The second PostgreSQL plan says `Index Scan using emp_test` and the second SQL Server plan says `OBJECT:emp_test`, but line 115 introduces the `(subsidiary_id, date_of_birth)` index as `EMP_TEST2`, and the Db2 and Oracle tabs use `EMP_TEST2`. · Fix: `emp_test2` in both plans.
- [ ] `:197` · `AND DATE_OF_BIRTH <= :END_T)` · typo (copied from the original); the bind variable is `:END_DT` on line 196 and 174. · Fix: `:END_DT`.
- [ ] `:215` · "a condition that follows a range condition cannot be an access predicate" is presented as a PostgreSQL rule, but PostgreSQL does pass all `Index Cond` entries to the B-tree and checks the trailing ones inside the index (and PostgreSQL 18 adds skip scan). · Fix: "a condition on a column after the range column is checked inside the index for each entry; it does not narrow the scanned range" (keeps the teaching point, drops the absolute).
- [ ] `:270-272` · The `important` callout is the original's Important box word for word ("Access predicates are the start and stop conditions of an index lookup. They define the scanned index range. Index filter predicates are applied during the leaf node traversal only. They do not narrow the scanned index range."). `:157` KeyIdea "Index for equality first, then for ranges." is the original Tip verbatim. · Fix: reword both, e.g. "An access predicate tells the traversal where to start and stop. A filter predicate is only checked on the entries the scan already reads." / "Equality columns first, the range column last."

## searching-for-ranges/index-merge-performance.mdx

- [ ] `:118-123` · MySQL tab shows `type: index_merge ... Using intersect(emp_up_name,emp_dob)` for `UPPER(last_name) < 'C' AND date_of_birth < '1965-01-01'`. MySQL's Index Merge intersection algorithm only applies when each secondary-index condition is an equality on all key parts (or a range on the InnoDB primary key); for two range conditions MySQL uses one index and filters. The original page has no MySQL example here; this plan was invented. · Fix: either drop the MySQL tab or show it for an equality case (`subsidiary_id = 20 AND date_of_birth = '1971-01-09'` with two single-column indexes) and state the equality restriction. Also note MySQL has no function-based index on `UPPER(last_name)` before 8.0.13, so `emp_up_name` cannot exist in older versions.
- [ ] `:69`, `:79`, `:81` · "One index scan is faster than two." (KeyIdea), "For online applications bitmap indexes are mostly useless." and the Important callout "Bitmap indexes are almost unusable for online transaction processing (OLTP)." are verbatim from the original. · Fix: reword, e.g. "Two traversals and a merge always cost more than one scan of the right index." / "Bitmap indexes do not survive concurrent writes, which rules them out for transactional tables."

## searching-for-ranges/like-performance-tuning.mdx

- [ ] `:158` and recap `:20` · "PostgreSQL ... assumes a leading wildcard when a `LIKE` uses a bind parameter and simply does not use the index." This is the original's text and it has been out of date since PostgreSQL 9.2: the server plans the first five executions of a prepared statement with the actual parameter values (custom plans) and only switches to a generic plan if it is not more expensive; with `plan_cache_mode` (12+) you can force either. In practice `LIKE $1` with `'WIN%'` uses the index. · Fix: "PostgreSQL plans the first five executions with the real values and only then considers a generic plan, which cannot assume a prefix; `plan_cache_mode = force_custom_plan` keeps the index for such statements."
- [ ] `:177` · The PostgreSQL full-text tab recommends the WildSpeed extension, which is abandoned (last release 2008, PostgreSQL 8.x). The standard answer for `LIKE '%term%'` in PostgreSQL is `pg_trgm` (contrib since 9.1): a GIN or GiST trigram index serves `LIKE`/`ILIKE` with wildcards anywhere. · Fix: replace the WildSpeed paragraph with `CREATE EXTENSION pg_trgm; CREATE INDEX ... USING gin (last_name gin_trgm_ops);`.
- [ ] `:56-66` · Section 1 says the plans are "against a function-based index on `UPPER(last_name)`", but the MySQL tab shows key `emp_name` (a plain index) with no explanation, while the Db2 tab explains its plain index. · Fix: add one sentence to the MySQL tab: "MySQL before 8.0.13 has no function-based indexes, so this plan uses a plain index on `last_name`."
- [ ] `:166-181` · The full-text tab sentences are the original's verbatim: "Db2 supports the `CONTAINS` keyword. See 'Search functions for Db2 Text Search' in the Db2 documentation.", "SQL Server offers the `CONTAINS` keyword. See 'Full-Text Search' in the SQL Server documentation.", "PostgreSQL implements full-text search with the `@@` operator. See 'Full Text Search' in the PostgreSQL documentation." The MySQL and Oracle sentences are near-verbatim. `:138` KeyIdea first clause is also the original's. · Fix: reword as one short paragraph per engine with the operator and a one-line example query.
- [ ] `:208-218` · The Check's correct answer (index `REVERSE(column)` and search with a trailing wildcard) is not taught anywhere in the lesson; the reader can only guess. · Fix: add two sentences to section 3 introducing the reversed-string trick, or change the question to one the lesson answers (for example which part of `'WIN%D'` is the access predicate).
- [ ] `:183` · SQLite tab could mention `PRAGMA case_sensitive_like = 1`, which makes `LIKE 'Win%'` a range scan on the plain index (verified). Optional.

## partial-and-filtered-indexes.mdx

- [ ] `:102-104` and `:28` · "No `WHERE` clause on `CREATE INDEX`" for Oracle is true, but since 12c Oracle has real partial indexes on partitioned tables (`CREATE INDEX ... INDEXING PARTIAL` with `ALTER TABLE ... MODIFY PARTITION ... INDEXING OFF`). The lesson is Oracle-dated to 11g. · Fix: add "Since 12c, partitioned tables can declare `INDEXING OFF` per partition and `CREATE INDEX ... INDEXING PARTIAL` skips those partitions; for row-level conditions the NULL trick in the next group is still the only way."
- [ ] `:81`, `:110` · "The where clause of a partial index can be as complex as you like" and "A database can use a partial index whenever the index's where clause appears in the query" are the original's sentences. · Fix: reword.
- [ ] `:118` · `TryIt id="2.5"` duplicates the label of `functions/user-defined-functions.mdx` (see cross-file note).

## null.mdx

- [ ] `:26`, `:57` · "The standard does not define NULL as a value but as a placeholder..." and "it is impossible to store an empty string in a `VARCHAR2` column" are near-verbatim from the original. · Fix: reword.
- [ ] `:2` · Title "NULL in the Oracle Database" while the sidebar lists it between vendor-neutral lessons; the content is Oracle-only by design, so fine, but the `prereqs` on line 9 could say so. Optional.

## null/index.mdx

- [ ] `:92` · KeyIdea "Add a column that cannot be NULL to index NULL like any value." is the original Tip verbatim. · Fix: e.g. "Pair the nullable column with one that never is, and NULL becomes an ordinary key."
- [ ] `:127` · SQL Server plan line `SEEK:([date_of_birth]=NULL)`; real showplan text is `Seek Keys[1]: Prefix: [date_of_birth] = Scalar Operator(NULL)`. Minor, but it is presented as plan output. · Fix: use the real wording or label it "abridged".

## null/not-null-constraint.mdx

- [ ] `:61` · KeyIdea "A missing NOT NULL constraint can prevent index usage in Oracle, especially for `count(*)` queries" is the original Tip (the count(*) explanation after it is new and good). `:26` "the table has rows that are not in the index" also matches. · Fix: reword the first clause.
- No technical problems found; the count(*) task's `COVERING INDEX sqlite_autoindex_employees_1` claim was verified.

## null/partial-index.mdx

- [ ] `:93` and recap `:19` · "Since release 11g ... partition the index, make the partition unusable, set `SKIP_UNUSABLE_INDEXES`" is the 2011 workaround; Oracle 12c made it a feature (`INDEXING PARTIAL`, see above). · Fix: add the 12c syntax and keep the 11g trick as history.
- [ ] `:38` · "First we need a function that returns the `RECEIVER` value only when..." is the original's sentence. · Fix: reword.

## obfuscation.mdx

- [ ] `:26` · "a where clause written in a way that prevents proper index usage" is the original's definition verbatim. · Fix: reword.
- [ ] `:26` · "Nobody writes one on purpose, except in the one case covered under Combining Columns" — Math (`+ 0`) is a second deliberate case, taught in this group. · Fix: "except in the two cases this group covers on purpose, in Combining Columns and Math".

## obfuscation/dates.mdx

- [ ] `:60` · "the function-based index is no help for MySQL before 5.7, which had no function-based indexes at all" · Wrong version: MySQL got functional key parts in 8.0.13; 5.7 added generated columns, which can be indexed as a workaround. · Fix: "MySQL has function-based indexes only since 8.0.13 (5.7 can index a generated column instead)".
- [ ] `:269` · Solution comment `-- plan: SEARCH sales USING COVERING INDEX sales_date (...)` · The query selects `sum(eur_value)`, which is not in the index; the actual plan is `SEARCH sales USING INDEX sales_date (sale_date>? AND sale_date<?)` (verified). · Fix: drop "COVERING".
- [ ] `:260` vs `:262-264` · The starting query asks for June 2024, task 2 asks the reader to "rewrite it" as the second quarter; the question changes under the reader's feet and the June numbers (938) no longer apply. · Fix: make task 2 the June range (`>= '2024-06-01' AND < '2024-07-01'`, same 938 rows) and let task 3 widen to the quarter, or say "now ask for the whole quarter".
- [ ] `:26` · "its only `DATE` type always carries a time component" · Oracle also has `TIMESTAMP`; "only" is wrong. · Fix: "its `DATE` type always carries a time component".
- [ ] `:192`, `:38` · KeyIdea "Write queries for continuous periods as explicit range conditions. Do it even for a single day" and "functions are black boxes to the database" are the original's wording. · Fix: reword.
- [ ] `:267-271` · `count(*)` twice inside `<pre>` renders as `count()` with `<em>` (see cross-file). · Fix: `count(&#42;)`.

## obfuscation/numeric-strings.mdx

- [ ] `:129` · Solution comment says `USING COVERING INDEX emp_phone`; the query selects `employee_id`, which is not the rowid of this table, so the plan is `SEARCH employees USING INDEX emp_phone (phone_number=?)` (verified). · Fix: drop "COVERING".
- [ ] `:84` · "No implicit conversion: syntax error" · PostgreSQL's error is a type error (`operator does not exist: character varying = integer`), not a syntax error. · Fix: "type error".
- [ ] `:74` · "because converting a string to a number ..." matches the original. Minor. · Fix: reword.

## obfuscation/concatenation.mdx

- [ ] `:67` · KeyIdea "Use a redundant condition on the most significant column when a range condition combines multiple columns." is the original Tip verbatim; `:65` "it is usually a good enough approximation" also. · Fix: reword, e.g. "When the condition glues columns together, add a plain condition on the leading column that the original implies."
- No technical problems; the redundant condition in the playground is correctly implied (verified rows 14,805 both ways, plan `sales_date (sale_date>?)`).

## obfuscation/math.mdx

- [ ] `:42` · "would you add an equation solver? Most vendors say no" is near-verbatim. · Fix: reword.
- No technical problems; 219 rows and employee 35 verified.

## obfuscation/smart-logic.mdx

- [ ] `:126` · "The JDBC driver switches the cache on after the fifth execution" · The five-execution rule is the server's (PostgreSQL 9.2+ plans five custom plans before considering a generic one); the JDBC `prepareThreshold=5` only decides when the driver starts using server-side prepared statements. As written it blames the driver. · Fix: "PostgreSQL plans the first five executions of a prepared statement with the real values and only then may switch to a generic plan; `plan_cache_mode` (12+) overrides that. The JDBC driver uses server-side prepared statements from the fifth execution."
- [ ] `:137` · "the original site keeps two appendices: [Using Bind-Variables](…/bind-parameters) and [Building Dynamic SQL using ORM Tools](…/obfuscation/smart-logic)" · The second link is this lesson's own `source:` page, and neither target is an appendix; the ORM examples (JPA, Perl DBI, PHP, .NET) are a section of the original page that this rewrite leaves out although the guide requires full coverage. · Fix: either add an `EngineTabs`-style block with the dynamic-SQL-with-ORM examples, or drop the sentence and let the standard source credit point there.
- [ ] `:97`, `:107`, `:115`, `:118`, `:131` · "tell the database what you need right now, and nothing more", KeyIdea "Use dynamic SQL if you need dynamic where clauses. ... otherwise the 'dynamic SQL is slow' myth comes true", "Db2 uses a shared execution plan cache and is fully exposed", the MySQL paragraph, and "maintains the relevant information up to SQL Server 2022" are the original's sentences (the last one is accurate to the source, not invented). · Fix: reword.

## practice-ranges-null-obfuscation.mdx

- [ ] `:41-49` · `count(*)` twice inside the solution `<pre>` renders as italics (`count()`), and quotes/dashes are typographer-mangled (see cross-file). · Fix: `count(&#42;)` plus the config change.
- [ ] `:125` · Hint says SQLite uses a partial index "only when a term of the where clause is identical to the index predicate". SQLite also accepts a few implications (`x = ?` implies `x IS NOT NULL`, and `x > 850` does not imply `x > 800` as the exercise shows). The hint is right for this exercise but slightly too absolute. · Fix: "SQLite needs a term that is identical to the index predicate, or one of the few implications it knows, such as `x = ?` for `x IS NOT NULL`."
- All counts verified: 938 / 435,416.10 / 31 / 13,874.7; 58 of 297; 66 Winands; 2,439 entries, 122 and 65 rows, `SCAN` for `> 850` and `SEARCH` once `> 800` is added; 40 NULL managers, 40 with `manager_id = 7`, 0 for `= NULL`.

## unit-check.mdx

- [ ] `:17` · "from chapter 1" · the site says "unit". · Fix: "from Unit 1".
- [ ] `:41-48` · Question 3 uses `subsidiary_id = 30 AND last_name = 'Winand'` and "to return one Winand"; in the example schema subsidiary 30 has no Winand at all (33 in subsidiary 10, 33 in subsidiary 20; verified). The 200-row figure for subsidiary 30 is right. · Fix: use `subsidiary_id = 20` (500 rows, 33 Winands) and "to return the Winands", or keep 30 with a name that exists there (e.g. `'Skywalker'`).
- [ ] `:96` · "bind parameters are the one thing that defeats both" · For PostgreSQL a partial index is used when the value is visible at plan time, which includes the custom plans of the first five executions (and `force_custom_plan`); "always defeats" is too strong. · Fix: "a generic plan built without the value cannot use either; PostgreSQL's custom plans and Oracle's bind peeking only help when the value is visible when the plan is built."
- Questions do not duplicate each other; Q5 (literals vs binds) and Q8 (smart logic) are adjacent topics but ask different things. Eight questions is within the 5-8 limit.

## Verified OK (no action)

- Figure numbers: 2.4, 2.5, 2.6 (Greater, Less and BETWEEN), 2.7 (LIKE), 2.8 (Index Merge), 2.9 (Partial Indexes), 2.10 (Numeric Strings) continue 2.1-2.3 in reading order with no gaps or duplicates; no prose cites a figure number that does not exist.
- All `/sql/...` links in these 17 files resolve to a content file or built page, including `/sql/explain-plan/postgresql/#access-predicates-and-filter-predicates` (heading exists at `reference/explain-plan/postgresql.mdx:108`), `/sql/explain-plan/`, `/sql/where-clause/`, `/sql/join/` and the three myth-directory pages.
- No em dashes, exclamation marks, "we will", placeholders or TODOs in the MDX source (the `chapter:` frontmatter key is the schema's name, not prose).
- Every TryIt regex was tested against the plan string the Playground emits (`EXPLAIN QUERY PLAN` detail lines joined with newlines, case-insensitive): `^SCAN` / `^SEARCH` anchors match the first line, `<expr>` literals match SQLite's expression-index notation, and the OR/`MULTI-INDEX OR` task fires.
- Playground claims verified by running them: `CREATE INDEX ... (date_of_birth, 1)` is accepted by SQLite; literal `'WINAND' IS NULL` is not folded and the plan stays `SCAN`; `phone_number = 43` uses `emp_phone` (0 rows); `employee_id = '42'` uses the primary key.
