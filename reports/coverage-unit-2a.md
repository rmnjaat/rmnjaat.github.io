# Coverage report: Unit 2, first half (equals operator, functions, bind parameters)

Each table lists every point of the original use-the-index-luke.com page (heading, claim, figure, box, SQL, plan, vendor note, cross-link, number) and the section of our MDX that covers it. Section numbers refer to the `##` headings of the rewritten lesson. "FM" means frontmatter.

## the-equals-operator.mdx

Sources: https://use-the-index-luke.com/sql/where-clause (chapter intro, folded in) and https://use-the-index-luke.com/sql/where-clause/the-equals-operator

| Original point | Our section |
| --- | --- |
| Chapter intro: previous chapter described index structure and the cause of poor index performance; now learn to spot and avoid in SQL; start with the where clause | Opening paragraph |
| Where clause defines the search condition and so falls into the core job of an index: finding data quickly | 1 |
| Huge impact on performance, often phrased carelessly so the database scans a large part of the index | 1 |
| A poorly written where clause is the first ingredient of a slow query | 1 (KeyIdea) |
| Chapter explains how operators affect index usage and how to make an index usable for as many queries as possible; last section covers anti-patterns and alternatives | 1 |
| Chapter contents with cross-links: equals, functions, bind variables, ranges, partial indexes, NULL, obfuscation | 1 (links to ranges, partial, NULL, obfuscation) and 2 (links to the three equals lessons); functions and bind parameters are the following lessons in the unit |
| Equals page: most trivial and most frequently used operator; indexing mistakes still common; where clauses combining multiple conditions particularly vulnerable | 2 |
| Section shows how to verify index usage, how concatenated indexes optimize combined conditions, and analyses a slow query to see the real-world impact of chapter 1 causes | 2 |
| Contents: Primary Keys (verifying index usage), Concatenated Keys (multi-column indexes), Slow Indexes Part II (first ingredient revisited) | 2 (three lesson links) |

## the-equals-operator/primary-keys.mdx

Source: https://use-the-index-luke.com/sql/where-clause/the-equals-operator/primary-keys

| Original point | Our section |
| --- | --- |
| Simplest yet most common where clause: primary key lookup | Opening paragraph |
| `CREATE TABLE employees` DDL with `employees_pk` on `employee_id` | 1 (DDL verbatim) |
| Database creates the index for the primary key automatically; no CREATE INDEX needed | 1 |
| Tip: Appendix C example schema has scripts to populate the table; 1000 rows is enough to know | 1 (Callout tip, link to /sql/example-schema/) |
| Query `WHERE employee_id = 123` | 2 |
| Where clause cannot match multiple rows due to uniqueness; no need to follow leaf nodes, tree traversal is enough | 2 |
| Execution plan used for verification | 3 |
| Db2 plan (from last_explained view, link to appendix); IXSCAN ~ INDEX [RANGE/UNIQUE] SCAN, cannot tell which; FETCH ~ TABLE ACCESS BY INDEX ROWID | 3, db2 tab (plan verbatim, link to /sql/explain-plan/db2/) |
| MySQL plan; type const ~ INDEX UNIQUE SCAN | 3, mysql tab |
| Oracle plan: INDEX UNIQUE SCAN, TABLE ACCESS BY INDEX ROWID, access("EMPLOYEE_ID"=123) | 3, oracle tab |
| PostgreSQL plan: Index Scan combines both Oracle operations; cannot see whether more than one row possible | 3, postgresql tab |
| SQL Server plan: Index Seek ~ INDEX RANGE SCAN, RID Lookup ~ TABLE ACCESS BY ROWID, Nested Loops shown explicitly | 3, sql-server tab |
| INDEX UNIQUE SCAN only traverses the tree; fully uses logarithmic scalability, almost independent of table size | 2 (figure 2.1 and following paragraph) |
| Tip: execution plan also called explain plan or query plan; Appendix A explains retrieving and reading plans in other databases | 3 (Callout tip, link to /sql/explain-plan/) |
| TABLE ACCESS BY INDEX ROWID fetches FIRST_NAME, LAST_NAME; can become a bottleneck (Slow Indexes Part I); not with INDEX UNIQUE SCAN: at most one entry, at most one table access; ingredients of a slow query absent | 4 (KeyIdea, link to /sql/anatomy/slow-indexes/) |
| Sidebar: primary key without unique index; Oracle uses INDEX RANGE SCAN; constraint still enforces uniqueness so at most one entry | 5 |
| Sidebar: reason is deferrable constraints, validated at commit instead of during the statement; needed for circular dependencies | 5 |
| (Added) SQLite playground converted to TryIt with three regex-checked tasks | 6 |

## the-equals-operator/concatenated-keys.mdx

Source: https://use-the-index-luke.com/sql/where-clause/the-equals-operator/concatenated-keys

| Original point | Our section |
| --- | --- |
| PK index automatic, but refinement possible for multi-column keys; concatenated index also called multi-column, composite, combined; column order has great impact | Opening paragraph |
| Merger: other company's employees added, table ten times as large; EMPLOYEE_ID not unique across both; extend key with SUBSIDIARY_ID | 1 |
| `CREATE UNIQUE INDEX employees_pk ON employees (employee_id, subsidiary_id)` | 1 |
| Full-key query (123, 30); complete primary key allows INDEX UNIQUE SCAN regardless of number of columns | 1 |
| Query `subsidiary_id = 20`: TABLE ACCESS FULL; reads entire table, evaluates every row; time grows with table size, tenfold table means tenfold time; fast in small dev environment, serious in production | 2 |
| Sidebar Full Table Scan: can be most efficient when retrieving a large part of the table; no index lookup overhead; index reads one block after another because next block unknown until current processed; full scan reads larger chunks (multi block read); more data but fewer read operations | 2 (Callout "Full table scan") |
| Database cannot use single columns from a concatenated index arbitrarily | 2 (last paragraph) |
| Concatenated index is a B-tree like any other with a sorted list; first column primary sort criterion, second only on ties, and so on | 3 |
| Important: a concatenated index is one index across multiple columns | 3 (Callout important) |
| Telephone directory analogy: sorted by surname then first name; searching second column alone is like searching by first name | 3 |
| Figure 2.1 Concatenated Index: entries for subsidiary 20 not stored together; no SUBSIDIARY_ID = 20 in the tree though present in the leaves; tree useless for this query | 3 (ConcatIndex figure 2.2 and the paragraph after it) |
| Tip: visualize the index with `SELECT <INDEX COLUMN LIST> FROM <TABLE> ORDER BY <INDEX COLUMN LIST> FETCH FIRST 100 ROWS ONLY` (SQL:2008; link to top-N for LIMIT/TOP/ROWNUM); ask if requested rows are clustered in one place | 3 (Callout "Look at the index", code block, link to /sql/partial-results/top-n-queries/) |
| Could add another index on SUBSIDIARY_ID; better solution if searching EMPLOYEE_ID alone makes no sense | 4 |
| First index column always usable; directory: no first name needed to search by surname; reverse the column order | 4 |
| `CREATE UNIQUE INDEX EMPLOYEES_PK ON EMPLOYEES (SUBSIDIARY_ID, EMPLOYEE_ID)` | 4 |
| Both columns still unique so full-key queries still INDEX UNIQUE SCAN; SUBSIDIARY_ID now primary sort criterion; entries for a subsidiary consecutive; B-tree finds their location | 4 |
| Important: most important consideration is choosing the column order so the index is used as often as possible | 4 (Callout important) |
| Plan confirms reversed index; SUBSIDIARY_ID alone not unique, leaf nodes followed: INDEX RANGE SCAN | 4 |
| Db2 plan (FETCH, RIDSCN, SORT (UNIQUE), IXSCAN, 1195 of 10000); SORT orders by physical storage location; RIDSCN prefetches pages collapsing adjacent blocks into one IO | 4, db2 tab |
| MySQL plan; ref ~ INDEX RANGE SCAN | 4, mysql tab |
| Oracle plan (106 rows, cost 75, access SUBSIDIARY_ID=20) | 4, oracle tab |
| PostgreSQL plan: Bitmap Index Scan + Bitmap Heap Scan ~ range scan + table access; fetches all index results first, sorts by physical location, then fetches rows; reduces random IO | 4, postgresql tab |
| SQL Server plan: Index Seek subsidiary_id=20, RID Lookup, Nested Loops | 4, sql-server tab |
| General rule: usable with leading (leftmost) columns; three-column index serves first column, first two, all three | 5 (KeyIdea) |
| Two-index solution also gives good select performance, but single index preferable: saves storage and maintenance; fewer indexes, better insert/delete/update performance | 5 (link to /sql/dml/) |
| Optimal index requires knowing how the application queries data: column combinations in where clauses | 6 |
| External consultants struggle: one query at a time, no overview of access paths; DBAs know schema but not access paths | 6 |
| Development department is where technical and business knowledge meet; developers know data and access paths; can index properly without much effort | 6 |
| (Added) two SQLite playgrounds converted to one TryIt with three regex-checked tasks | 7 |

## the-equals-operator/slow-indexes-part-ii.mdx

Source: https://use-the-index-luke.com/sql/where-clause/the-equals-operator/slow-indexes-part-ii

| Original point | Our section |
| --- | --- |
| Previous section changed column order but considered only two statements; changing an index may affect all queries on the table; section explains how databases pick an index and shows side effects | Opening paragraph |
| Adopted EMPLOYEES_PK improves all subsidiary-only queries; usable for all queries with SUBSIDIARY_ID regardless of other criteria; becomes usable for queries that used another index or another part of the where clause; optimizer chooses among access paths | 1 |
| Sidebar Query Optimizer: transforms SQL into execution plan; also called compiling or parsing; CBO generates many variations, cost from operations and estimated row numbers, lowest cost wins; RBO uses hard-coded rules, less flexible, seldom used | 1 (Callout "The query optimizer") |
| Internal telephone directory application slow since the merger; query `last_name = 'WINAND' AND subsidiary_id = 30` | 2 |
| Example 2.1 plan: cost 30, INDEX RANGE SCAN EMPLOYEES_PK rows 40, filter LAST_NAME on operation 1, access SUBSIDIARY_ID on operation 2 | 2 (plan verbatim) |
| Plan uses an index, cost 30; suspicious because it uses the index we just changed; old index started with EMPLOYEE_ID, not in the where clause, so the query could not use it before | 2 |
| Compare before and after: could redeploy old index; most databases offer a way to prevent an index for one query; Oracle hint `/*+ NO_INDEX(EMPLOYEES EMPLOYEES_PK) */` | 3 |
| Previous plan: TABLE ACCESS FULL cost 477, filter on both conditions | 3 (plan verbatim) |
| Full scan seems faster than the index; unusual because the query matches one row; index seems slow | 3 |
| Go through each step: INDEX RANGE SCAN on EMPLOYEES_PK does not cover LAST_NAME, considers SUBSIDIARY_ID only; Predicate Information entry 2 shows conditions per operation | 4 |
| Tip: Appendix A explains how to find predicate information in other databases | 4 (Callout tip, link to /sql/explain-plan/) |
| Range scan traverses tree to first entry for subsidiary 30, follows leaf chain for all others; result is a list of ROWIDs; a few or many hundreds depending on subsidiary size | 4 |
| TABLE ACCESS BY INDEX ROWID fetches rows with all columns; only then LAST_NAME evaluated; all rows for subsidiary 30 fetched before the LAST_NAME filter applies | 4 (and figure 2.3) |
| Response time depends on number of employees in the subsidiary, not on result size; small subsidiary: range scan better; huge subsidiary: full scan faster (large parts in one shot; link to Full Table Scan sidebar) | 4 (KeyIdea and following paragraph, link to concatenated-keys note) |
| Query slow because the lookup returns many ROWIDs (one per employee of the original company) fetched individually; perfect combination of the two ingredients | 4 |
| Best plan depends on data distribution; optimizer uses statistics; histogram of employees over subsidiaries estimates rows from the index lookup; used for cost | 5 |
| Sidebar Statistics: table, column and index statistics; column: distinct values, min/max, NULL count, histogram; table: size in rows and blocks; index: tree depth, leaf nodes, distinct keys, clustering factor (chapter 5 link); used to estimate selectivity | 5 (Callout "Statistics", link to /sql/clustering/) |
| No statistics (e.g. deleted) means defaults; Oracle defaults suggest small index with medium selectivity; estimate of 40 rows (Rows column in Example 2.1); gross underestimate, 1000 employees in that subsidiary | 5 |
| With correct statistics: 1000 rows estimated for the range scan, higher cost for the table access; plan with cost 680, index scan cost 4 | 5 (plan verbatim) |
| 680 is higher than 477, so the optimizer automatically prefers the full table scan | 5 |
| Proper indexing is the best solution: `CREATE INDEX emp_name ON employees (last_name)` | 6 |
| Example 2.2 plan: cost 3, INDEX RANGE SCAN EMP_NAME rows 1 cost 1, filter SUBSIDIARY_ID on table access, access LAST_NAME | 6 (plan verbatim) |
| Index delivers one row per estimate; only that row fetched; faster than full scan; properly defined index better than the original full scan | 6 |
| Plans 2.1 and 2.2 almost identical: same operations, similar costs, yet second performs much better; INDEX RANGE SCAN efficiency varies widely, especially with a following table access; using an index does not mean the statement runs in the best way possible | 6 (KeyIdea "Remember") |
| (Added) SQLite playground converted to TryIt with three regex-checked tasks; the playground's data (1,000 rows, subsidiary 20 with 500 employees) differs from the book's and the text says so | 7 |

## functions.mdx

Source: https://use-the-index-luke.com/sql/where-clause/functions

| Original point | Our section |
| --- | --- |
| Index on LAST_NAME improved performance considerably but requires searching with the same case as stored; section lifts this restriction without a performance decrease | Opening paragraph |
| Db2: function-based indexes on z/OS for a while, on LUW only since 10.5; user-defined functions not allowed; backup: real column holding the result, maintained by trigger or application, indexed; where clause must use the new column without the expression | 2, db2 tab |
| MySQL: case-insensitive by default, controllable at column level; since 5.7 indexes on generated columns; backup for older versions: same real-column approach | 2, mysql tab |
| Oracle: function-based indexes since 8i; virtual columns added in 11g | 2, oracle tab |
| PostgreSQL: indexes on expressions fully since 7.4, partially since 7.2 | 2, postgresql tab |
| SQL Server: indexable computed columns since 2000 | 2, sql-server tab |
| Contents: Case-Insensitive Search (UPPER and LOWER), User-Defined Functions (limitations of FBIs), Over-Indexing (avoid redundancy) | After section 2 (three lesson links) |

## functions/case-insensitive-search.mdx

Source: https://use-the-index-luke.com/sql/where-clause/functions/case-insensitive-search

| Original point | Our section |
| --- | --- |
| Ignoring case is simple: convert both sides to caps; query `UPPER(last_name) = UPPER('winand')`; matches regardless of capitalization of term or column | Opening paragraph (SQL verbatim) |
| Note: alternative is a different collation; SQL Server and MySQL default collations are case-insensitive | Opening (Callout note) |
| Logic reasonable, plan is not: Db2 TBSCAN 400 of 10000 cost 690 with SARG; Oracle TABLE ACCESS FULL rows 10 cost 477 filter UPPER; PostgreSQL Seq Scan rows=50 Filter upper | 1 (three tabs, plans verbatim) |
| Return of the full table scan; index on LAST_NAME unusable because the search is on UPPER(LAST_NAME), entirely different for the database | 1 |
| Trap: we see the relation instantly and expect the database to; optimizer's view is `WHERE BLACKBOX(...) = 'WINAND'` | 2 (SQL verbatim) |
| UPPER is a black box; parameters not relevant because there is no general relationship between parameters and result | 2 |
| Tip: replace the function name with BLACKBOX to understand the optimizer's view | 2 (Callout tip) |
| Sidebar Compile Time Evaluation: right-hand side evaluated at compile time because all inputs known; Oracle predicate information shows only the upper-case term; like a compiler evaluating constant expressions | 2 (Callout "Compile-time evaluation") |
| Need an index on UPPER(LAST_NAME), not LAST_NAME: `CREATE INDEX emp_up_name ON employees (UPPER(last_name))` | 3 |
| Function-based index (FBI) definition: applies the function first and stores the result; index stores names in caps | 3 |
| FBI usable if the exact expression of the index definition appears in the statement; plans confirm | 3 |
| Db2 plan (FETCH, IXSCAN EMP_UP_NAME 1 of 10000, START/STOP UPPER); note that the query was changed to `UPPER(last_name) = 'WINAND'` because with UPPER('winand') Db2 misestimates 4% and does a TBSCAN; link to Full Table Scan | 3, db2 tab (link to concatenated-keys note) |
| Oracle plan: table access rows 100 cost 41, INDEX RANGE SCAN rows 40 cost 1, access UPPER | 3, oracle tab |
| PostgreSQL plan: Bitmap Heap Scan rows 50, Recheck Cond, Bitmap Index Scan on emp_up_name | 3, postgresql tab |
| Regular INDEX RANGE SCAN as in chapter 1: traverse B-tree, follow leaf chain; no dedicated operations or keywords for FBIs | 3 |
| Warning: ORM tools use UPPER and LOWER without the developer's knowledge; Hibernate injects an implicit LOWER (link) | 3 (Callout "Common mistake", link to /sql/myth-directory/dynamic-sql-is-slow/) |
| Plan not yet as before without UPPER: row estimate too high; table access expects 100 rows though index scan returns 40; cannot; contradicting estimates indicate statistics problems; Oracle does not update table statistics when creating an index | 4 |
| Sidebar Oracle Statistics for FBIs: distinct value counts kept as table statistics, reused across indexes; FBI statistics kept at table level as virtual columns; index statistics collected automatically since 10g but table statistics not; Oracle docs recommend collecting statistics on index and base table with DBMS_STATS after creating an FBI (doc quote, paraphrased); author's recommendation: after every index change update statistics for the table and all its indexes; may have side effects; coordinate with DBAs and back up the original statistics | 4 (Callout "Oracle statistics for function-based indexes") |
| After updating statistics: Oracle plan rows 1 cost 3; PostgreSQL Index Scan using emp_up_name rows=1; estimate fell from 50 to 1 so the planner prefers the simpler Index Scan | 4 (two tabs, plans verbatim) |
| Note: extended statistics on expressions and column groups introduced with Oracle 11g | 4 (Callout note) |
| Updated statistics do not improve performance here (index used anyway) but always check the optimizer's estimates; cardinality estimate is particularly important, also shown in SQL Server and PostgreSQL plans | 4 |
| Tip: Appendix A describes row count estimates in other databases | 4 (Callout tip, link to /sql/explain-plan/) |
| SQL Server and MySQL do not support FBIs as described; workaround via computed/generated columns: add the column, then index | 5 |
| MySQL since 5.7: `ALTER TABLE employees ADD COLUMN last_name_up VARCHAR(255) AS (UPPER(last_name))`; `CREATE INDEX emp_up_name ON employees (last_name_up)` | 5, mysql tab |
| SQL Server: `ALTER TABLE employees ADD last_name_up AS UPPER(last_name)`; `CREATE INDEX emp_up_name ON employees (last_name_up)` | 5, sql-server tab |
| Both can use the index whenever the indexed expression appears; in simple cases even with the query unchanged; sometimes the query must refer to the new column name; always check the plan | 5 (and KeyIdea) |
| (Added) two SQLite playgrounds converted to one TryIt with three regex-checked tasks | 6 |

## functions/user-defined-functions.mdx

Source: https://use-the-index-luke.com/sql/where-clause/functions/user-defined-functions

| Original point | Our section |
| --- | --- |
| Function-based indexing is generic: besides UPPER, expressions like A + B and user-defined functions can be indexed | Opening paragraph |
| One exception: cannot refer to the current time, directly or indirectly | 1 |
| `CREATE FUNCTION get_age` using SYSDATE and MONTHS_BETWEEN/12 | 1 (SQL verbatim) |
| GET_AGE usable in all parts of a query, select and where; query listing all 42-year-olds with get_age in select list and where clause | 1 (SQL verbatim) |
| FBI is the obvious idea but GET_AGE cannot be used because it is not deterministic: result not fully determined by parameters; only deterministic functions can be indexed | 1 |
| Reason: on insert the database calls the function and stores the result in the index, where it stays; no periodic process updates it; updated only when date_of_birth changes through UPDATE; after the next birthday the stored age is wrong | 2 (and KeyIdea) |
| PostgreSQL and Oracle require the declaration: DETERMINISTIC (Oracle), IMMUTABLE (PostgreSQL) | 3 |
| Caution: both trust the declaration, i.e. the developer | 3 (Callout warning "Caution") |
| Declaring GET_AGE deterministic allows the index but it does not work as intended; the stored age does not increase; employees do not get older in the index | 3 |
| Other non-indexable functions: random number generators, functions depending on environment variables | 3 |
| Note: Db2 LUW cannot use UDFs in indexes, not even deterministic ones | 3 (Callout note) |
| Think About It: how can an index still optimize the query for all 42-year-olds? | 4 (question stated, then our answer: a range on date_of_birth; link to /sql/where-clause/searching-for-ranges/) |
| (Added) SQLite TryIt with two regex-checked tasks; notes SQLite's own refusal to index a non-deterministic expression | 5 |

## functions/over-indexing.mdx

Source: https://use-the-index-luke.com/sql/where-clause/functions/over-indexing

| Original point | Our section |
| --- | --- |
| Tempting to index everything if FBIs are new; the very last thing to do; every index causes ongoing maintenance; FBIs make redundant indexes easy | Opening paragraph |
| Case-insensitive search can be written with LOWER: `LOWER(last_name) = LOWER('winand')` | 1 (SQL verbatim) |
| A single index cannot support both methods; could create a second index on LOWER(last_name) but then two indexes are maintained for each insert, update and delete (chapter 8 link) | 1 (link to /sql/dml/) |
| To make one index suffice, consistently use the same function throughout the application | 1 |
| Tip: unify the access path so one index can be used by several queries | 1 (KeyIdea) |
| Warning: ORM tools use UPPER and LOWER without the developer's knowledge; Hibernate injects an implicit LOWER (link) | 1 (Callout "Common mistake", link to /sql/myth-directory/dynamic-sql-is-slow/) |
| Tip: always aim to index the original data, often the most useful information to put into an index | 2 |
| (Added, kept from the previous version) redundant prefix of a concatenated index; per-engine index usage counters | 2 (Callout tip), 3 |
| (Added) SQLite TryIt with two regex-checked tasks | 4 |

## bind-parameters.mdx

Source: https://use-the-index-luke.com/sql/where-clause/bind-parameters

| Original point | Our section |
| --- | --- |
| Topic skipped in most SQL textbooks | Opening paragraph |
| Bind parameters, also dynamic parameters or bind variables: alternative way to pass data; placeholder `?`, `:name` or `@name`; values via separate API call | Opening paragraph and 1 |
| Nothing bad about values in ad-hoc statements; two reasons for programs | 1 |
| Security: best way to prevent SQL injection (Wikipedia link) | 1 |
| Performance: databases with a plan cache (SQL Server, Oracle) reuse a plan for the same statement; saves rebuilding; only if the SQL text is exactly the same; different values mean a different statement and a new plan; with placeholders the statement does not change | 1 |
| Exceptions when the data volume depends on the value: `subsidiary_id = 20`, 99 rows, INDEX RANGE SCAN cost 70 | 2 (SQL and plan verbatim) |
| `subsidiary_id = 30`, 1000 rows, TABLE ACCESS FULL cost 478 | 2 (SQL and plan verbatim) |
| Histogram on SUBSIDIARY_ID determines the frequency of the value; two row estimates; two cost values; lowest cost chosen; small subsidiary gets the index | 2 |
| Cost of TABLE ACCESS BY INDEX ROWID highly sensitive to the row estimate; ten times the rows, ten times the cost; then index cost exceeds full scan; other plan for the bigger subsidiary | 2 |
| With bind parameters no values to determine frequency; equal distribution assumed; same estimates, costs and plan every time | 2 |
| Tip: histograms most useful for non-uniform distributions; for uniform columns dividing distinct values and row count suffices, also with bind parameters | 2 (Callout tip) |
| Compiler analogy: bind variables are like program variables, literals like constants; database uses literals during optimization like a compiler evaluating constant expressions; bind parameters invisible to the optimizer like runtime variable values to a compiler | 3 |
| Paradox: bind parameters improve performance though literals let the optimizer always pick the best plan; the price: generating and evaluating all plan variants is a huge effort that does not pay off for the same result | 3 |
| Tip: not using bind parameters is like recompiling a program every time | 3 (Callout tip) |
| Dilemma: specialized vs generic plan; evaluate all variants each time or reuse a cached plan with the risk of a suboptimal one; database cannot know without doing the full optimization; vendors use heuristics with limited success | 3 (and EngineTabs with each vendor's heuristic, added) |
| Developer resolves the dilemma: always use bind parameters except for values that shall influence the execution plan | 3 (KeyIdea) |
| Examples: unevenly distributed status codes todo/done (done exceeds todo by an order of magnitude; index only for todo); partitioning (values decide which partitions to scan); LIKE performance can suffer (next section link) | 3 (link to /sql/where-clause/searching-for-ranges/like-performance-tuning/) |
| Tip: only a few cases where values affect the plan; use bind parameters if in doubt to prevent SQL injection | 3 (Callout tip) |
| Code snippets, without and with bind parameters: C# (SqlCommand, Parameters.AddWithValue, SqlParameterCollection link) | 4 (code verbatim, link) |
| Java (Statement vs PreparedStatement, setInt, PreparedStatement link) | 4 (code verbatim, link) |
| Perl (DBI prepare/execute, Programming the Perl DBI link) | 4 (code verbatim, link) |
| PHP with MySQL (mysqli query vs prepare/bind_param, mysqli_stmt::bind_param and PDO links) | 4 (code verbatim, links) |
| Ruby (dbh.execute vs prepare/execute, Ruby DBI tutorial link) | 4 (code verbatim, link) |
| See also: examples using ORM tools (myth directory link) | 4 (Callout "See also", link to /sql/myth-directory/dynamic-sql-is-slow/) |
| `?` is the only SQL-standard placeholder; positional, numbered left to right; bind by number; impractical when placeholders are added or removed; many databases offer named parameters with @name or :name | 5 |
| Note: bind parameters cannot change the structure of a statement; not for table or column names; example `prepare("SELECT * FROM ? WHERE ?")` does not work; use dynamic SQL (link) | 5 (Callout note, code verbatim, link to /sql/myth-directory/dynamic-sql-is-slow/) |
| Sidebar Cursor Sharing and Forced Parameterization: the more complex optimizer and query, the more important plan caching; SQL Server and Oracle can replace literals with bind parameters automatically: CURSOR_SHARING (Oracle), forced parameterization (SQL Server); workarounds for applications that do not bind; enabling them prevents developers from intentionally using literals | 6 |
| See also: Smart Logic (plan caching capabilities of different databases); article Planning for Execution Plan Reuse | 6 (link to /sql/where-clause/obfuscation/smart-logic/ and the blog article) |
| (Added) SQLite TryIt with two regex-checked tasks illustrating a value-independent plan | 7 |

## Not placed

Nothing from the nine originals is missing. Two items were deliberately handled differently:

- The chapter page's full table of contents (all 24 sub-pages of the where-clause chapter) is not reproduced as a list in `the-equals-operator.mdx`; the unit navigation provides it. The five group pages are linked from section 1 and the three equals lessons from section 2.
- The Oracle documentation quotation in the case-insensitive-search sidebar is paraphrased, not quoted, since the lesson text is written from scratch.
