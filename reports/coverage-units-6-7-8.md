# Coverage report: Units 6, 7 and 8

Each table maps every point of the original use-the-index-luke.com page to the section of our lesson that covers it. "Section" refers to the numbered `##` headings of the MDX file; "FM" means frontmatter (`recap`, `outcomes`), "TryIt" the exercise block, "Check" the closing question. Nothing from the originals is missing; extras we added beyond the original are listed at the end of each table.

## Chapter intro: /sql/sorting-grouping

Folded into `src/lib/site.ts` (`sorting-grouping.intro`) and section 1 of `sorting-grouping/indexed-order-by.mdx`.

| Original point | Where |
| --- | --- |
| Sorting is resource intensive: CPU, but mainly the need to buffer the complete input before the first output | site.ts intro; indexed-order-by opening paragraph |
| A sort cannot be pipelined; a problem for large data sets | site.ts intro; indexed-order-by opening, section 1 |
| An index is an ordered representation, presorted like an ORDER BY on its definition (Chapter 1 link) | indexed-order-by section 1 (link to /sql/anatomy/) |
| An INDEX RANGE SCAN plus table access can become inefficient for large sets; FULL TABLE SCAN with sort may be faster; optimizer's job | site.ts intro (last sentence); indexed-order-by section 1, last paragraph |
| Indexed ORDER BY returns first rows without processing all input; pipelined; Chapter 7 uses it for pagination; "third power of indexing" | indexed-order-by section 1 |
| Note: B-tree traversal is the first power, clustering the second, pipelined ORDER BY the third (links) | indexed-order-by section 1, Callout "The three powers of indexing" |
| Chapter covers where-clause interaction, ASC/DESC modifiers, GROUP BY | lesson order 1, 2, 3 of the unit |

## sorting-grouping/indexed-order-by ← /sql/sorting-grouping/indexed-order-by

| Original point | Where |
| --- | --- |
| No explicit sort if the index delivers rows in the required order; the index used for the where clause must also cover the ORDER BY | Section 1, KeyIdea in section 3, FM recap |
| Example query: yesterday's sales ORDER BY sale_date, product_id (TRUNC(sysdate) - INTERVAL '1' DAY) | Section 2, SQL verbatim |
| Index on SALE_DATE serves the where clause but the sort remains | Section 2 |
| Db2 plan with TBSCAN / SORT / FETCH / IXSCAN SALES_DATE, predicate info, note about Db2-compliant where clause | Section 2, EngineTabs db2 (plan verbatim, note included) |
| Oracle plan with SORT ORDER BY (cost 18) | Section 2, EngineTabs oracle |
| INDEX RANGE SCAN delivers in index order anyway; extend the index: DROP INDEX sales_date; CREATE INDEX sales_dt_pr (sale_date, product_id) | Section 3, SQL verbatim |
| Db2 and Oracle plans after the change, no sort (cost 300) | Section 3, EngineTabs |
| SORT ORDER BY disappeared although the query still has ORDER BY | Section 3 paragraph after the tabs |
| Important: if index order corresponds to the ORDER BY, the sort can be omitted | Section 3, KeyIdea |
| Cost value increased considerably although fewer operations; clustering factor; cost not always a good indicator | Section 3, "The cost went up" |
| Sidebar "Automatically Optimized Clustering Factor": ROWID as final sort key, adding a column inserts a criterion before ROWID so CF can only get worse, rows of a day still roughly clustered, same table blocks read several times, caching lowers impact | Section 3, Callout "The clustering factor and the ROWID" |
| Sufficient that the scanned range is sorted; ORDER BY product_id only also works | Section 4, first query and paragraph |
| Figure 6.1 Sort Order in the Relevant Index Range | Section 4, Figure 6.1 (table rendering of the figure) |
| Extending the range (>=) covers several days; smaller PRODUCT_ID values appear again; explicit sort needed | Section 4, second query and paragraph |
| Db2 and Oracle plans for the range version (SORT back, cost 301) | Section 4, EngineTabs |
| Two reasons for a sort: (1) cost, (2) index order in scanned range does not match | Section 5, first paragraph; FM recap |
| Tell them apart: use the full index definition in the ORDER BY | Section 5, second paragraph; TryIt task 3 |
| Tip: use the full index definition in the ORDER BY to find the reason | Section 5, KeyIdea "Remember" |
| Inspect the result; often a false perception of the index order | Section 5, KeyIdea "Remember" |
| Optimizer plans for the full execution (fastest to the last record); if it knows the app fetches only the first rows it may prefer indexed ORDER BY; Chapter 7 link | Section 5, last paragraph |
| Links: previous/next page, Chapter 7 | Section 5 (Unit 7 link); unit navigation |
| Extra (ours) | PostgreSQL, MySQL, SQL Server plan sketches in the EngineTabs; Callout "Common mistake"; TryIt; Check |

## sorting-grouping/order-by-asc-desc-nulls-last ← /sql/sorting-grouping/order-by-asc-desc-nulls-last

| Original point | Where |
| --- | --- |
| Indexes can be read in both directions; pipelined ORDER BY also when the scanned range is in the exact opposite order; ASC/DESC can prevent it; index order can be adjusted | Opening paragraph; section 1 |
| Example: sales since yesterday ORDER BY sale_date DESC, product_id DESC | Section 1, SQL verbatim |
| Db2 plan IXSCAN (REVERSE) SALES_DT_PR, STOP predicate; DISALLOW REVERSE SCAN clause | Section 1, EngineTabs db2 |
| Oracle plan INDEX RANGE SCAN DESCENDING | Section 1, EngineTabs oracle |
| Database uses the tree to find the last matching entry, then follows the leaf chain upwards; reason for the doubly linked list (links to the-tree and the-leaf-nodes) | Section 1, paragraph after the tabs (both links) |
| Figure 6.2 Reverse Index Scan | Section 1, Figure 6.2 |
| Crucial that the scanned range is in the exact opposite order | Section 2, first sentence |
| Important: databases can read indexes in both directions | Section 1, KeyIdea |
| Mixed example: ORDER BY sale_date ASC, product_id DESC; yesterday's sales by descending product, then today's; database would have to "jump" | Section 2, SQL verbatim and paragraph |
| Figure 6.3 Impossible Pipelined order by | Section 2, Figure 6.3 |
| No link from yesterday's smallest PRODUCT_ID to today's greatest; index cannot avoid the sort | Section 2, last paragraph |
| Fix: ASC/DESC in the index definition; DROP INDEX; CREATE INDEX sales_dt_pr (sale_date ASC, product_id DESC) | Section 3, SQL verbatim |
| Warning: MySQL before 8.0 ignores ASC/DESC in index definitions; MariaDB honours DESC only since 10.8 | Section 3, Callout "MySQL before 8.0 and MariaDB before 10.8" |
| Db2 and Oracle plans with the new index, no sort | Section 3, EngineTabs |
| Figure 6.4 Mixed-Order Index; swapping the arrows so the first ends where the second starts | Section 3, Figure 6.4 and following paragraph |
| Important: mixed modifiers require the index to be defined likewise; does not affect the where clause | Section 3, KeyIdea "Remember" |
| ASC/DESC only needed for opposite directions, not for reversing all columns | Section 3, "When you do not need it"; Callout "Common mistake" |
| Exception: secondary indexes on index-organized tables; implicit clustering key without sort order; sort all other columns DESC and read in reverse (links) | Section 3, "When you do not need it", second paragraph |
| NULLS FIRST/LAST: SQL:2003 optional extension; sparse support; standard only says NULLs appear together; strictly you would specify it for every nullable column | Section 4, first paragraph |
| SQL Server 2019 and MySQL 8.0 do not implement it | Section 4, EngineTabs sql-server and mysql; Figure 6.5 |
| Oracle supported NULLS sorting before the standard but not in index definitions as of 19c; no pipelined ORDER BY with NULLS FIRST | Section 4, EngineTabs oracle; Figure 6.5 |
| PostgreSQL since 8.3 supports it in ORDER BY and index definition | Section 4, EngineTabs postgresql; Figure 6.5 |
| Figure 6.5 Database/Feature Matrix (read backwards, ORDER BY ASC/DESC, index ASC/DESC, ORDER BY NULLS, NULL considered great/small, index NULLS) for Db2, MySQL, Oracle, PostgreSQL, SQLite, SQL Server | Section 4, Figure 6.5 with all 36 cells |
| Links: previous/next page | Unit navigation |
| Extra (ours) | PostgreSQL, MySQL, SQL Server, SQLite plan lines for the reverse scan; Db2 and SQLite NULL rows in the EngineTabs; TryIt; Check |

## sorting-grouping/indexed-group-by ← /sql/sorting-grouping/indexed-group-by

| Original point | Where |
| --- | --- |
| Two algorithms: hash (temporary hash table, returned once all input processed) and sort/group (sort by grouping key, aggregate adjacent rows) | Section 1 |
| Both materialize an intermediate state, so not pipelined; sort/group can use an index to avoid the sort, enabling a pipelined group by | Section 1, third paragraph |
| Note: MySQL 8.0 does not use the hash algorithm; the sort/group optimization works as described | Section 1, Callout "MySQL" |
| Example: yesterday's revenue per product_id, GROUP BY product_id | Section 2, SQL verbatim |
| Index on SALE_DATE and PRODUCT_ID from the previous section; INDEX RANGE SCAN delivers the order; no materialization; pipelined | Section 2, paragraph after the SQL |
| Db2 plan GRPBY (COMPLETE) over FETCH / IXSCAN | Section 2, EngineTabs db2 |
| Oracle plan SORT GROUP BY NOSORT | Section 2, EngineTabs oracle |
| Oracle marks the pipelined operation with NOSORT; other databases do not mention a sort at all | Section 2, oracle tab and paragraph after the tabs |
| Same prerequisites as pipelined ORDER BY except no ASC/DESC; ASC/DESC index should not matter; same for NULLS FIRST/LAST; some databases cannot use such an index properly | Section 2, KeyIdea and following paragraph |
| Warning: PostgreSQL does not pipeline if the index treats NULL as smallest; add ORDER BY with the index order. Oracle cannot read an index backwards for a pipelined group by followed by ORDER BY. Appendix links | Section 2, Callout "Engine traps" |
| Extending the where clause to all sales since yesterday prevents the pipelined group by; range scan not ordered by the grouping key; compare Figure 6.1 | Section 3 (link to Figure 6.1 in lesson 1) |
| SQL with >= | Section 3, SQL verbatim |
| Db2 plan: GRPBY (FINAL), TBSCAN, SORT (INTERMEDIATE), GRPBY (HASHED PARTIAL), FETCH, RIDSCN, SORT (UNIQUE), IXSCAN; note the where clause used 1 MONTH; two reasons it looks complex (sort by physical location between index and table access; two-phase aggregation) | Section 3, EngineTabs db2 (plan verbatim, both explanations) |
| Oracle plan HASH GROUP BY | Section 3, EngineTabs oracle |
| Hash algorithm needs less memory: buffers only the aggregated result, sort/group materializes the complete input | Section 4, first paragraph |
| Fast execution is not the most important aspect; pipelined delivery of the first result before reading the whole input is the prerequisite for the next chapter | Section 4, second paragraph and KeyIdea "Remember" |
| Think About It: any other operation that could use an index to avoid sorting? | Check (sort-merge join) |
| Links: previous/next page, Chapter 7 | Section 4; unit navigation |
| Extra (ours) | PostgreSQL, SQL Server, MySQL plan sketches; Callout "Common mistake"; TryIt |

## Chapter intro: /sql/partial-results

Folded into `src/lib/site.ts` (`partial-results.intro`) and the opening paragraph of `partial-results/top-n-queries.mdx`.

| Original point | Where |
| --- | --- |
| Often only the first few rows are needed (ten most recent messages); users browse older ones via paging or infinite scrolling | site.ts intro; top-n-queries opening |
| Serious performance problems if all messages must be sorted to find the most recent; pipelined ORDER BY is a powerful optimization (link) | site.ts intro; top-n-queries opening |
| Not only about saving the sort: delivering the first results without reading and sorting all rows; very low startup cost; abort after a few rows without wasting the preparation | top-n-queries opening paragraph |
| Syntax varies by database but execution is very similar ("put their pants on one leg at a time") | site.ts intro (last sentence); top-n-queries section 2 |
| Contents: top-N, next page (offset and seek), window functions | lesson order 1, 2, 3 |

## partial-results/top-n-queries ← /sql/partial-results/top-n-queries

| Original point | Where |
| --- | --- |
| Top-N queries limit the result to a number of rows; most recent or best entries; ranking must be a pipelined ORDER BY (link) | Section 1, first paragraph |
| Fetching N rows and closing the statement: the optimizer cannot foresee it; must know whether all rows are fetched; full scan with sort vs pipelined ORDER BY even if rows are fetched individually | Section 1, second paragraph |
| Tip: inform the database whenever you don't need all rows | Section 1, KeyIdea |
| SQL standard excluded it for a long time; FETCH FIRST in SQL:2008; available in Db2, PostgreSQL, SQL Server 2012, Oracle 12c; non-core extension, proprietary solutions | Section 2, first paragraph |
| Examples query the ten most recent sales; basis is always all sales newest first, top-N syntax aborts after ten | Section 2, first paragraph |
| Db2: FETCH FIRST since version 9 (LUW and zOS); LIMIT since 9.7 with DB2_COMPATIBILITY_VECTOR=MYS | Section 2, EngineTabs db2 |
| MySQL and PostgreSQL: LIMIT 10 | Section 2, EngineTabs mysql |
| Oracle: FETCH FIRST since 12c; earlier ROWNUM with wrapped query | Section 2, EngineTabs oracle (SQL verbatim) |
| PostgreSQL: FETCH FIRST since 8.4; LIMIT still works | Section 2, EngineTabs postgresql |
| SQL Server: TOP 10; FETCH FIRST since 2012 | Section 2, EngineTabs sql-server |
| All of these are recognised as top-N queries | Section 2, paragraph after the tabs |
| Important: the database can only optimize for a partial result if it knows from the beginning | Section 2, Callout important |
| With the limit known, the optimizer prefers a pipelined ORDER BY if applicable | Section 3, first paragraph |
| Db2 plan FETCH / IXSCAN (REVERSE) SALES_DT_PR; top-N not directly visible unless SORT (TOP-N) in last_explained; row estimate drop with empty Predicate Information | Section 3, EngineTabs db2 (plan verbatim and both notes) |
| Oracle plan COUNT STOPKEY / VIEW / TABLE ACCESS BY INDEX ROWID / INDEX FULL SCAN DESCENDING; COUNT STOPKEY = recognised | Section 3, EngineTabs oracle |
| Tip: Appendix A summarizes the operations for Db2, MySQL, Oracle, PostgreSQL, SQL Server (links) | Section 3, Callout tip with the five links |
| Important: a pipelined top-N query does not need to read and sort the entire result | Section 3, KeyIdea "Remember" |
| Without a suitable index: read and sort the whole table; first row only after the last is read | Section 3, paragraph before the second tabs |
| Db2 plan TBSCAN / SORT (TOP-N) / TBSCAN SALES | Section 3, second EngineTabs db2 |
| Oracle plan COUNT STOPKEY / VIEW / SORT ORDER BY STOPKEY / TABLE ACCESS FULL | Section 3, second EngineTabs oracle |
| Almost as slow as aborting on the client; still better because only ten rows are materialized; less memory; STOPKEY modifier on SORT ORDER BY | Section 3, paragraph after the second tabs; Check |
| Advantages: immediate performance and scalability; without pipelining response time grows with table size; with it only with selected rows; almost independent of table size; only B-tree depth | Section 4, first paragraph |
| Figure 7.1 Scalability of Top-N Queries: linear vs constant | Section 4, Figure 7.1 |
| Response time still grows with selected rows (doubles for twice the rows); paging queries start at the first entry and discard; next section | Section 4, last paragraph |
| Links: article "Finding the Best Match With a Top-N Query" | Section 4, Callout "Further reading" |
| Extra (ours) | PostgreSQL, MySQL, SQL Server, SQLite syntax and plan tabs; Callout "Common mistake"; TryIt |

## partial-results/fetch-next-page ← /sql/partial-results/fetch-next-page

| Original point | Where |
| --- | --- |
| After the pipelined top-N query, a query for the next pages must skip rows; offset method (number rows, filter) and seek method (search last entry, fetch following) | Opening paragraph |
| Offset method widely used; easy; OFFSET keyword in the standard as part of FETCH FIRST | Section 1, first paragraph |
| Db2: OFFSET since 11.1; ROW_NUMBER alternative (link); two not-recommended ways via DB2_COMPATIBILITY_VECTOR=MYS (no FETCH FIRST with OFFSET) and =ORA (ROWNUM) | Section 1, EngineTabs db2 |
| MySQL/PostgreSQL: LIMIT 10 OFFSET 10; limit applied after the offset | Section 1, EngineTabs mysql |
| Oracle: OFFSET since 12c; ROWNUM cannot take >=; materialize with alias; nested query; alias RN for lower bound, ROWNUM for upper; thanks to Tom Kyte | Section 1, EngineTabs oracle (SQL verbatim) |
| PostgreSQL: OFFSET without ROWS keyword; OFFSET 10 FETCH NEXT 10 ROWS ONLY | Section 1, EngineTabs postgresql |
| SQL Server: no offset for TOP; FETCH FIRST since 2012; OFFSET mandatory | Section 1, EngineTabs sql-server |
| Advantage: arbitrary page by offset; database must count from the beginning | Section 1, paragraph after the tabs |
| Figure 7.2 Access Using the Offset Method | Section 1, Pagination figure 7.2 (offset side) |
| Two disadvantages: drift on insert; response time grows further back | Section 1, last paragraph; FM recap |
| Seek method uses values of the previous page as delimiter; "comes behind"; doesn't select already shown values | Section 2, first paragraph |
| Assumption one sale per day; sale_date unique; < for descending, > for ascending; FETCH FIRST only limits | Section 2, second paragraph and SQL verbatim |
| Last value instead of row number; index access on SALE_DATE < ?; truly skips; stable results on insert | Section 2, paragraph after the SQL |
| Does not work with several sales per day; skips all of yesterday; ORDER BY not deterministic | Section 2, "The order has to be deterministic" |
| Without deterministic ORDER BY no deterministic sequence; usually consistent only because executed the same way; could shuffle equal rows; parallel execution can change order between runs | Section 2, second paragraph of that subsection |
| Important: paging requires a deterministic sort order | Section 2, Callout important |
| Extend the ORDER BY: first the index's additional columns, then any unique column, extend the index | Section 2, paragraph after the callout |
| CREATE INDEX sl_dtid (sale_date, sale_id); row values query (sale_date, sale_id) < (?, ?) | Section 2, SQL verbatim |
| Comes-after logic on both columns together | Section 2, last sentence; section 3 KeyIdea |
| Sidebar "SQL Row Values": SQL:92 §7.1 row value constructor; lists in brackets; known from INSERT; all comparison operators defined; definition of X < Y; synonymous with "sorts before" | Section 3, first paragraph and KeyIdea |
| Support: SQL Server 2017 none; Oracle no range operators (ORA-01796); MySQL evaluates but no access predicate; Db2 LUW since 10.1 and PostgreSQL since 8.4 proper | Section 3, EngineTabs (all five plus SQLite); Figure 7.4 |
| Approximation with regular comparisons; Oracle example with sale_date <= ? AND NOT (sale_date = ? AND sale_id >= ?) and rownum <= 10 | Section 4, SQL verbatim |
| Two parts: <= selects more than needed and every database can use it for access; second part removes shown rows | Section 4, paragraph after the SQL |
| Sidebar "Indexing Equivalent Logic": OR variant; databases use the whole clause as filter; no optimizer factors out sale_date <= ?; add it manually; all databases can use it; harder to grasp; risk of the redundant part being removed | Section 4, Callout "Indexing equivalent logic" (both SQL variants verbatim) |
| Oracle plan with access("SALE_DATE"<=...) and filter(...) | Section 4, plan verbatim (index name SL_DTIT kept as printed) |
| Access predicate skips fully shown days; filter inspects a few entries again and drops them; Figure 7.3 | Section 4, paragraph after the plan; Pagination figure 7.2 (seek side) |
| Figure 7.4 Scalability when Fetching the Next Page: difference visible from about page 20 | Section 4, Figure 7.3 |
| Drawbacks: difficult handling; careful where clause; no arbitrary pages; reverse all comparisons and sorts to browse back; infinite scrolling needs neither | Section 5 |
| Figure 7.5 Database/Feature Matrix (where clause, ranges, optimal index usage) for six databases | Section 5, Figure 7.4 with all 18 cells |
| Links: previous/next page | Unit navigation |
| Extra (ours) | SQLite tabs; PostgreSQL plan line; Callout "Common mistake"; TryIt; Check |

## partial-results/window-functions ← /sql/partial-results/window-functions

| Original point | Where |
| --- | --- |
| Window functions: flexible, standards-compliant pagination; only SQL Server, Oracle, PostgreSQL 15+ pipeline; MySQL, MariaDB (footnote: window functions since MySQL 8.0, MariaDB 10.2), Db2 LUW do not abort and run inefficiently | Opening paragraph; mysql tab; FM recap |
| Example ROW_NUMBER() OVER (ORDER BY sale_date DESC, sale_id DESC) rn, WHERE rn between 11 and 20, outer ORDER BY | Section 1, SQL verbatim |
| ROW_NUMBER enumerates per the OVER order; outer where limits to rows 11 to 20 | Section 1 |
| Oracle recognises the abort condition and uses the index on SALE_DATE and SALE_ID | Section 2, EngineTabs oracle |
| Db2 plan FILTER / FETCH / IXSCAN (REVERSE) SL_DTID with RESID predicates; 10.5 does not execute as top-N, reads the entire index | Section 2, EngineTabs db2 |
| Db2 double-wrapped query (rn <= 20 inside, rn > 10 outside) and its plan; rn <= 20 not in Predicate Information but reflected in the row estimate | Section 2, EngineTabs db2 (SQL and plan verbatim) |
| Oracle plan WINDOW NOSORT STOPKEY with filter predicates | Section 2, EngineTabs oracle (plan verbatim) |
| PostgreSQL since 15: "Run Condition" in the plan; EXPLAIN ANALYZE output | Section 2, EngineTabs postgresql (plan verbatim) |
| WINDOW NOSORT STOPKEY = no sort and abort at the upper threshold; as efficient as the offset method of the previous section | Section 2, oracle tab |
| Support not common; timeline matrix 2007 to 2025 for SQL Server (partial 2008R2 to 2025, only row_number), PostgreSQL (none 9.0 to 14, partial 15 to 16, full 17 to 18), Oracle (partial 11g, partial 12c to 23), MySQL none, MariaDB none; footnotes a and b | Section 3, Figure 7.5 |
| Could work with any monotonic function but implementations focus on ROW_NUMBER; function matrix (ROW_NUMBER, RANK, DENSE_RANK, COUNT) per product with footnote a (Oracle RANK only with where clause) | Section 3, Figure 7.6 |
| PARTITION BY caution: presence can disable the optimization even when the where clause limits to one partition; views; clause matrix with footnote a | Section 3, paragraph and Figure 7.7 |
| Strength of window functions is analytics; study the documentation; links to Oracle, PostgreSQL, SQL Server docs | Section 4 (all three links) |
| Extra (ours) | SQL Server, SQLite tabs; Callout "Common mistake"; Callout about ROW_NUMBER as offset in disguise; TryIt; Check |

## Chapter intro: /sql/dml

Folded into `src/lib/site.ts` (`dml.intro`) and the opening paragraph of `dml/insert.mdx`.

| Original point | Where |
| --- | --- |
| So far query performance only; SQL also manipulates data; insert, delete, update form the DML, a section of the standard | site.ts intro; insert opening paragraph |
| Performance of these commands is mostly negatively influenced by indexes | site.ts intro; insert opening |
| An index is pure redundancy; only data also in the table; writes must keep the redundancy consistent; insert, delete, update affect the table and every index holding a copy | site.ts intro; insert opening; unit-check question 1 |
| Contents: insert (no direct benefit), delete (indexes for the where clause), update (does not affect all indexes) | lesson subtitles and order |

## dml/insert ← /sql/dml/insert

| Original point | Where |
| --- | --- |
| Number of indexes is the most dominant factor; more indexes, slower; INSERT is the only statement that cannot benefit directly because it has no where clause | Section 1, first paragraph; FM recap |
| Steps: find a place; heap table takes any block with free space; quick, mostly in memory; add the entry to the block | Section 1, second paragraph |
| Indexes: the new entry must be added to each and every index; number of indexes is a multiplier | Section 1, third paragraph |
| Adding to an index is much more expensive: order and balance; specific leaf node (link); tree traversal reads a few blocks (link) | Section 2, first paragraph |
| Free space check; leaf split distributes entries; branch node reference duplicated; branch may split; up to the root; only case the tree gains a layer | Section 2, second paragraph; Insert figure 8.1 |
| Index maintenance is the most expensive part; Figure 8.1: hardly visible without indexes (0.0003 s); one index raises it by a factor of a hundred; each additional index slows further | Section 2 KeyIdea; section 3 and Figure 8.2 |
| Note: the first index makes the greatest difference; keep the number of indexes small | Section 3, Callout note |
| Tip: use indexes deliberately and sparingly; avoid redundant indexes; also benefits delete and update | Section 3, Callout tip |
| Tables without indexes unrealistic; data must be retrieved; even log tables have a primary key | Section 4, first paragraph |
| Temporarily dropping all indexes for large loads if not needed by other statements; dramatic speed-up; common in data warehouses | Section 4, second paragraph |
| Think About It: how would Figure 8.1 change for an index-organized table / clustered index (link)? Could an additional index make an insert faster? | Section 4, KeyIdea "Think about it" |
| Links: previous/next page, leaf nodes, tree, IOT | Sections 2 and 4 |
| Extra (ours) | Callout "Common mistake"; TryIt; Check |

## dml/delete ← /sql/dml/delete

| Original point | Where |
| --- | --- |
| Delete has a where clause that can use all methods of Chapter 2 (link); works like a select followed by an extra step | Opening paragraph; section 1 |
| Deletion is similar to inserting: removing references from indexes, keeping trees balanced; Figure 8.2 very similar to the insert chart (link) | Section 2, first paragraph and Figure 8.3 |
| Figure 8.2 Delete Performance by Number of Indexes (1 to 5 indexes, 0 to 0.12 s) | Section 2, Figure 8.3 |
| No-index case expected fastest in theory, but the full table must be read to find the rows; not shown in the chart | Section 2, paragraph after the figure |
| A delete without an index can still make sense when it removes a large part of the table, like a select | Section 2, last paragraph |
| Tip: even delete and update statements have an execution plan (link) | Section 1, Callout tip |
| Delete without where: no index; TRUNCATE TABLE; same effect, all rows in one shot; very fast; implicit commit (exceptions PostgreSQL and SQL Server); no triggers | Section 3 |
| Sidebar "Side Effects of MVCC": non-blocking concurrent access, consistent view; implementations differ with performance effects; PostgreSQL keeps visibility on table level; delete sets a flag; delete performance independent of index count; physical removal and index maintenance in VACUUM | Section 4 and Callout "PostgreSQL"; Check explanation |
| Links: previous/next page, Chapter 2, execution plans | Sections 1 and 3; unit navigation |
| Extra (ours) | Callout "Common mistake" on foreign keys; TryIt; Check |

## dml/update ← /sql/dml/update

| Original point | Where |
| --- | --- |
| Update must relocate changed index entries; remove old, add new; response time about delete plus insert | Section 1, first paragraph |
| Depends on the number of indexes like insert and delete; difference: updates often change a few columns; only indexes with updated columns are affected | Section 1, second paragraph and KeyIdea |
| Figure 8.3: two statements, all columns (all indexes) vs one column (one index); 1 to 5 indexes, 0 to 0.20 s | Section 2, Figure 8.4 |
| All-columns update shows the pattern of the previous sections (link); one-column update does not increase so much | Section 2, paragraph after the figure |
| Optimize by updating only changed columns; obvious when written manually; ORM tools may set all columns; Hibernate does so with dynamic-update disabled (link); since 4.0 enabled by default | Section 3 (the original's claim about the 4.0 default is reported as the original's note) |
| Good practice: enable query logging in development; tip "Enabling SQL Logging" (link to the nested loops lesson) | Section 3, Callout "Log the SQL" |
| Think About It: a case where insert or delete does not affect all indexes | Section 3, KeyIdea "Think about it" (points at partial and filtered indexes) |
| Links: previous/next page, insert, delete, Hibernate docs | Sections 2 and 3; unit navigation |
| Extra (ours) | ORM all-columns SQL example; Callout "Common mistake"; TryIt; Check |

## Figures and numbering

Original figure numbers were kept where the content matches (6.1 to 6.5) and renumbered where our unit has a different reading order: original 7.2 and 7.3 are both covered by the interactive `Pagination` figure 7.2; original 7.4 is our 7.3; original 7.5 is our 7.4; the three window-function matrices are our 7.5 to 7.7. In Unit 8 the interactive `Insert` figure is 8.1, so the original charts 8.1, 8.2 and 8.3 are our 8.2, 8.3 and 8.4. The charts are rendered as tables with values read off the original axes; the captions say so.

## Not placed

Nothing from the content of the twelve pages was left out. Site chrome (author box, book and training promotions, blog list, shop, newsletter, translations, footer) was not carried over by design.
