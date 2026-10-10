# Coverage report: Unit 2, second half (ranges, partial indexes, NULL, obfuscation)

Each table maps every point of the original use-the-index-luke.com page to the section of our lesson that covers it. "Section" numbers refer to the numbered `##` headings in the MDX file; "FM" means frontmatter (recap/outcomes); "Try it" is the TryIt block.

## searching-for-ranges.mdx ← /sql/where-clause/searching-for-ranges

| Original point | Our section |
| --- | --- |
| Inequality operators (<, >, BETWEEN) use indexes like equals | 1 |
| LIKE can use an index under certain circumstances, like a range | 1 |
| These operations limit the column order choice in multi-column indexes | 2 |
| The limit can rule out all optimal options; some queries have no "correct" order | 2 |
| Contents: Greater/Less/BETWEEN (column order revisited) | 3 |
| Contents: Indexing LIKE (not for full-text search) | 3 |
| Contents: Index Merge (why not one index per column) | 3 |

## searching-for-ranges/greater-less-between-tuning-sql-access-filter-predicates.mdx ← /greater-less-between-tuning-sql-access-filter-predicates

| Original point | Our section |
| --- | --- |
| Leaf node traversal is the biggest risk of an INDEX RANGE SCAN; golden rule: keep the scanned range small | Opening, FM recap |
| Ask where the scan starts and where it ends | Opening, 1 |
| SQL: date_of_birth >= TO_DATE(?) AND <= TO_DATE(?) | 1 |
| Index on DATE_OF_BIRTH scanned only in the range; cannot be narrowed further | 1 |
| SQL with the additional subsidiary_id = ? condition | 2 |
| Ideal index covers both columns; question is the order | 2 |
| Search for subsidiary 27, born 1 to 9 January 1971 | 2 |
| Figure 2.2: range scan in (DATE_OF_BIRTH, SUBSIDIARY_ID) index, with entries | 2, Figure 2.5 |
| Ordered by date first; subsidiary only orders same-day entries; subsidiary useless during traversal | 2 |
| No entry for subsidiary 27 in the branch nodes, though there is one in the leaves | 2 |
| Date filter is the only condition limiting the range; five leaf nodes scanned | 2 |
| Figure 2.3: range scan in (SUBSIDIARY_ID, DATE_OF_BIRTH) index | 2, Figure 2.6 |
| Equals limits the first column to one value; within it sorted by date; first leaf skipped because branch node shows no employee of 27 born after 25 June 1969 | 2 |
| Traversal leads directly to the second leaf; scan terminates in the same leaf | 2 |
| Tip: index for equality first, then for ranges | 2, KeyIdea |
| Difference depends on data; negligible if date filter is selective; grows with the date range | 2 |
| Falsifies the most-selective-first myth; both conditions match 13 records | 3 |
| Knowing the scanned range is important; most databases show it in the plan | 4 |
| Db2 plan for EMP_TEST with START/STOP/SARG; explanation of labels | 4, db2 tab |
| Oracle plan for EMP_TEST with access/filter | 4, oracle tab |
| PostgreSQL plan for emp_test; Index Cond lists columns in index order; predicates after a range cannot be access predicates; link to distinguishing access and filter predicates | 4, postgresql tab |
| SQL Server plan with row-value SEEK syntax; SQL Server 2012 note | 4, sql-server tab |
| Predicate information identifies conditions as access or filter | 4, oracle tab |
| Note: plan simplified; appendix explains Predicate Information | 4, oracle tab |
| DATE_OF_BIRTH conditions are the only access predicates, so it is the first column; SUBSIDIARY_ID is a filter | 4, oracle tab |
| Important: access predicates are start/stop conditions; filter predicates applied during leaf traversal only; appendix explains MySQL, SQL Server, PostgreSQL | 4, Callout important |
| All conditions become access predicates with the reversed index: Db2, Oracle, PostgreSQL, SQL Server plans for EMP_TEST2 | 4, all tabs |
| BETWEEN specifies both bounds in one condition | 5 |
| BETWEEN always includes the boundary values, like >= and <= | 5 |

## searching-for-ranges/like-performance-tuning.mdx ← /like-performance-tuning

| Original point | Our section |
| --- | --- |
| LIKE causes unexpected performance; some terms index well, others not; wildcard position decides | Opening |
| Example: UPPER(last_name) LIKE 'WIN%D' | 1 |
| Db2 plan with START/STOP/SARG; note that Db2 10.5 cannot use access predicates from LIKE on a function-based index, example run without UPPER; Db2 shows START/STOP from the prefix and the full pattern as filter | 1, db2 tab |
| MySQL plan (range, Using where) | 1, mysql tab |
| Oracle plan with access and filter on the same expression | 1, oracle tab |
| PostgreSQL plan with ~>=~ 'WIN', ~<~ 'WIO' and Filter | 1, postgresql tab |
| Only characters before the first wildcard are used in the traversal; rest are filter predicates; one LIKE has two predicate types | 2 |
| Caution: LIKE works character by character, collations can treat multiple characters as one unit and prevent index use; Laurenz Albe article | 2, Callout |
| More selective prefix means smaller scanned range | 2 |
| Figure 2.4: three LIKE searches ('WI%ND', 'WIN%D', 'WINA%') with the 18 WI entries | 2, Figure 2.7 |
| First expression: 18 rows scanned, 17 discarded; second: 2 rows, 1 wasted; third: no filter predicate | 2 |
| Important: only the part before the first wildcard is an access predicate; remaining characters do not narrow the range | 2, KeyIdea |
| Leading wildcard cannot be an access predicate; full table scan if no other access predicate | 3 |
| Tip: avoid leading wildcards ('%TERM') | 3, Callout tip |
| In reality the optimizer builds a generic plan for bind parameters and has to guess about a leading wildcard | 4 |
| Most databases assume no leading wildcard; wrong for full-text use; no way to tag a full-text LIKE | 4 |
| Box "Labeling Full-Text LIKE Expressions": '%' \|\| ? \|\| '%' does not work | 4 |
| Literal search term: optimization overhead and SQL injection | 4 |
| Intentional obfuscation is the secure, portable solution; link to Combining Columns | 4 |
| PostgreSQL assumes a leading wildcard with bind parameters and does not use the index; make the term visible; take injection precautions | 4 |
| Even a correct leading-wildcard plan may be too slow; use another part of the where clause; link to Index Filter Predicates Used Intentionally | 4 |
| Full-text: Db2 CONTAINS (Db2 Text Search) | 5, db2 tab |
| Full-text: MySQL MATCH/AGAINST, InnoDB since 5.6, previously MyISAM only | 5, mysql tab |
| Full-text: Oracle CONTAINS (Oracle Text) | 5, oracle tab |
| Full-text: PostgreSQL @@ operator; WildSpeed extension stores all rotations, needs much space | 5, postgresql tab |
| Full-text: SQL Server CONTAINS | 5, sql-server tab |
| Think about it: how to index LIKE '%TERM' | Check (reversed-string index) |

## searching-for-ranges/index-merge-performance.mdx ← /index-merge-performance

| Original point | Our section |
| --- | --- |
| Common question: one index per column or one for all; answer: one multi-column (concatenated) index; link to Concatenated Indexes | Opening |
| Queries a single index cannot serve perfectly: two or more independent range conditions; SQL example UPPER(last_name) < ? AND date_of_birth < ? | 1 |
| Impossible to define a B-tree without filter predicates; an index is a linked list | 1 |
| (UPPER(LAST_NAME), DATE_OF_BIRTH) runs A to Z, date only for equal names; reversed order runs oldest to youngest | 1 |
| Entries always along a chain; one range condition as access predicate only; chessboard analogy; no corner | 1, Figure 2.8 |
| Accept the filter predicate and use a multi-column index; often the best; more selective column first | 2 |
| Possible origin of the most-selective-first myth; holds only when a filter predicate is unavoidable | 2 |
| Two separate indexes: scan both, combine; two tree traversals; memory and CPU for combining | 3 |
| Note: one index scan is faster than two | 3, KeyIdea |
| Two methods: index join (Chapter 4 link) and data warehouse technique | 3 |
| Data warehouse is the mother of ad-hoc queries; unpredictable column combinations | 4 |
| Bitmap index: easy to combine, decent performance per-column; a tailored B-tree is still faster | 4 |
| Weakness: insert/update/delete scalability; concurrent writes impossible; fine for scheduled loads; useless online | 4 |
| Important: bitmap indexes almost unusable for OLTP | 4, Callout important |
| Hybrid: B-tree scans converted to in-memory bitmaps, discarded after the statement; memory and CPU cost; optimizer's act of desperation | 4 (plus engine tabs showing the operation) |

## partial-and-filtered-indexes.mdx ← /partial-and-filtered-indexes

| Original point | Our section |
| --- | --- |
| So far only which columns; partial (PostgreSQL) / filtered (SQL Server) indexes specify rows | Opening |
| Caution: Oracle has a unique approach, next section; Db2 (LUW) has none but can emulate via EXCLUDE NULL KEYS | Opening Callout, 3 db2 tab |
| Useful for common where conditions with constant values; messages example SQL | 1 |
| Common in queuing systems; processed messages rarely needed, then by primary key | 1 |
| Two-column index; column order does not matter without a range condition | 1 |
| Index includes rows never searched; still fast thanks to logarithmic scalability; wastes disk space | 1 |
| Partial index syntax: a where clause | 2 |
| Only matching rows in the index; PROCESSED column can be removed; shrinks vertically and horizontally | 2, Figure 2.9 |
| Very small; for a queue the index size stays constant while the table grows | 2, KeyIdea |
| Where clause arbitrarily complex; only deterministic functions; SQL Server allows neither functions nor OR | 3 |
| Database can use a partial index whenever the where clause appears in the query | 3 |
| Think about it: peculiarity of the smallest index for WHERE processed = 'N' | Try it task 3 and hint |

## null.mdx ← /sql/where-clause/null

| Original point | Our section |
| --- | --- |
| NULL causes confusion; placeholder for missing data; IS NULL not = NULL | Opening |
| Oracle oddities: not standard-conforming and special handling in indexes | Opening |
| Standard: NULL is not a value; no value can be NULL; Oracle treats empty string as NULL; SQL demo with dual | 1 |
| Case where Oracle treats NULL as empty string: dummy \|\| NULL; should return NULL | 2 |
| No language treats empty string as NULL except Oracle; impossible to store '' in VARCHAR2 | 2 |
| Strange and dangerous; continues with indexing | 2 |
| Contents: NULL in Indexes (every index is partial); NOT NULL constraints affect index usage; emulating partial indexes with function-based indexing | 3 |

## null/index.mdx ← /sql/where-clause/null/index

| Original point | Our section |
| --- | --- |
| Oracle does not include rows if all indexed columns are NULL; every index is a partial index; implied WHERE A IS NOT NULL OR B IS NOT NULL ... | Opening |
| EMP_DOB single-column index; INSERT without DATE_OF_BIRTH; row not added | 1 |
| Index cannot support WHERE date_of_birth IS NULL | 1 |
| Concatenated index demo_null (subsidiary_id, date_of_birth) gets the row because subsidiary_id is not NULL | 2 |
| Supports subsidiary_id = ? AND date_of_birth IS NULL; all filters are access predicates in the INDEX RANGE SCAN | 2 |
| For the original query DATE_OF_BIRTH must be leftmost; add a column that can never be NULL (any NOT NULL column, e.g. SUBSIDIARY_ID) | 3 |
| Alternatively a constant expression: DROP INDEX emp_dob; CREATE INDEX emp_dob ON employees (date_of_birth, 'X') | 3 |
| Technically a function-based index; disproves the myth that Oracle cannot index NULL | 3 |
| Tip: add a column that cannot be NULL to index NULL like any value | 3, KeyIdea |

## null/not-null-constraint.mdx ← /sql/where-clause/null/not-null-constraint

| Original point | Our section |
| --- | --- |
| To index IS NULL, the index must have a column that can never be NULL; not enough that there are no NULL entries; database must be sure | Opening |
| emp_dob_name (date_of_birth, last_name) supports the query only with NOT NULL on LAST_NAME; SQL | 1 |
| ALTER TABLE MODIFY last_name NULL renders the index unusable | 1 |
| Tip: missing NOT NULL constraint can prevent index usage, especially for count(*) | 1, KeyIdea |
| Constant expressions are also known not to be NULL | 1 |
| User-defined function index does not impose NOT NULL; blackbox function; emp_dob_bb; full scan plan | 2 |
| BLACKBOX: optimizer has no idea what the function does (link to case-insensitive search); NOT NULL of parameter lost; index has all rows but database does not know | 2 |
| Add blackbox(employee_id) IS NOT NULL to the query; range scan plan; always true, result unchanged; Oracle recognises rows must be in the index | 3 |
| No way to tag a function as never NULL; virtual column (11g) with NOT NULL; ALTER TABLE ADD bb_expression; rebuilt index; plan | 4 |
| Oracle knows some internal functions return NULL only for NULL input; emp_dob_upname on upper(last_name); plan | 5 |
| UPPER preserves NOT NULL; removing the constraint renders the index unusable; plan | 5 |

## null/partial-index.mdx ← /sql/where-clause/null/partial-index

| Original point | Our section |
| --- | --- |
| Oracle's NULL handling can emulate partial indexes; use NULL for rows that should not be indexed | Opening |
| Target index: messages_todo ON messages (receiver) WHERE processed = 'N' | 1 |
| Function pi_processed returning receiver only when processed = 'N', else NULL; full PL/SQL | 2 |
| Must be deterministic to be usable in an index | 2 |
| CREATE INDEX messages_todo ON messages (pi_processed(processed, receiver)) contains only PROCESSED='N' rows | 3 |
| Query must use the indexed expression; SQL and plan with access("PI_PROCESSED"(...)=:X) | 3 |
| Partial Indexes, Part II: since 11g, intentionally broken index partition plus SKIP_UNUSABLE_INDEXES | 4 |

## obfuscation.mdx ← /sql/where-clause/obfuscation

| Original point | Our section |
| --- | --- |
| Obfuscated conditions: where clauses phrased to prevent proper index usage; anti-patterns to know and avoid | 1 |
| Contents: Dates (DATE types), Numeric Strings (don't mix types), Combining Columns (redundant where clauses), Smart Logic (smartest way to make SQL slow), Math (databases don't solve equations) | 2 |

## obfuscation/dates.mdx ← /sql/where-clause/obfuscation/dates

| Original point | Our section |
| --- | --- |
| Most obfuscations involve DATE types; Oracle vulnerable because DATE always includes time | Opening |
| TRUNC does not remove the time but sets it to midnight; TRUNC on both sides; yesterday's sales SQL | 1 |
| Valid and correct, cannot use an index on SALE_DATE; as in Case-Insensitive Search; functions are black boxes | 1 |
| Solution: function-based index on TRUNC(sale_date) | 2 |
| Must always use TRUNC in the where clause; inconsistent use needs two indexes | 2 |
| Also with pure date types for longer periods: MySQL DATE_FORMAT example | 2 |
| Function-based index not available in MySQL before 5.7 | 2 |
| Alternative: explicit range condition, generic for all databases; BETWEEN quarter_begin(?) AND quarter_end(?) | 3 |
| Pattern recognisable from the 42-year-old employees exercise | 3 |
| Straight index on SALE_DATE suffices; functions compute boundaries; BETWEEN includes boundaries so quarter_end returns just before next quarter; logic hidden in the function | 3 |
| quarter_begin/quarter_end for Db2 (LUW) | 3, db2 tab |
| quarter_begin/quarter_end for MySQL | 3, mysql tab |
| quarter_begin/quarter_end for Oracle (with seconds-resolution comment) | 3, oracle tab |
| quarter_begin/quarter_end for PostgreSQL | 3, postgresql tab |
| quarter_begin/quarter_end for SQL Server | 3, sql-server tab |
| Similar helpers for other periods, simpler with >= and <; boundaries can be computed in the application | 3 |
| Tip: write continuous periods as explicit ranges, even a single day; Oracle TRUNC(sysdate) example | 3, KeyIdea |
| Comparing dates as strings: PostgreSQL TO_CHAR(sale_date, 'YYYY-MM-DD') = '1970-01-01' | 4 |
| Problem is converting SALE_DATE; belief that only numbers and strings can be passed; bind parameters support all types, e.g. java.util.Date; another benefit of bind parameters | 4 |
| Convert the search term instead: TO_DATE('1970-01-01', ...); uses a straight index; converts input once vs all dates | 4 |
| Either change can introduce a bug with a time component; explicit range with + INTERVAL '1' DAY | 4 |
| Always consider an explicit range when comparing dates | 4 |
| LIKE on date types: sale_date LIKE SYSDATE; no function visible; LIKE enforces string comparison; error or implicit conversion | 5 |
| Oracle predicate information with INTERNAL_FUNCTION(SALE_DATE) LIKE TO_CHAR(SYSDATE@!); INTERNAL_FUNCTION converts the column and prevents index use | 5 |

## obfuscation/numeric-strings.mdx ← /sql/where-clause/obfuscation/numeric-strings

| Original point | Our section |
| --- | --- |
| Numeric strings: numbers in text columns; bad practice; index still usable if consistently treated as string; numeric_string = '42' | Opening, 1 |
| numeric_string = 42 cannot be an access predicate; missing quotes; some databases error (PostgreSQL), many add implicit conversion; CAST(numeric_string AS INT) = 42 | 1 |
| Same problem as a function call; solution: convert the search term: numeric_string = CAST(42 AS VARCHAR(10)) | 2 |
| Why the database does not do it that way: string to number is unambiguous; number to string is not (spaces, punctuation, leading zeros); 42/042/0042/00042 | 2 |
| CAST AS VARCHAR matches only the first spelling; CAST AS INT matches all; semantic as well as performance difference | 2 |
| Database behaviour table: syntax error (BigQuery, PostgreSQL); CAST on column (Db2, MariaDB, MySQL, Oracle, SQL Server); converts the number (SQLite) | 3, Figure 2.10 |
| Numeric strings cause performance problems and conversion errors from a single invalid number, even in trivial queries | 3 |
| Tip: use numeric types to store numbers | 3, KeyIdea |
| Other way round: numeric_number = '42' converts the string; regular index works | 4 |
| Manual conversion the wrong way: TO_CHAR(numeric_number) = '42' | 4 |

## obfuscation/concatenation.mdx ← /sql/where-clause/obfuscation/concatenation

| Original point | Our section |
| --- | --- |
| Popular obfuscation affecting concatenated indexes; date and time the other way round | Opening |
| MySQL ADDTIME(date_column, time_column) > DATE_ADD(now(), INTERVAL -1 DAY); last 24 hours; cannot use index on (DATE_COLUMN, TIME_COLUMN) because the search is on derived data | 1 |
| Use a type with date and time (MySQL DATETIME); datetime_column > ... | 2 |
| Often not possible to change the table | 2 |
| Function-based index with its drawbacks; not an option in MySQL | 2 |
| Extra condition on DATE_COLUMN: date_column >= DATE(DATE_ADD(...)); redundant but a straight filter usable as access predicate; not perfect, good enough approximation | 3 |
| Tip: redundant condition on the most significant column when a range combines multiple columns | 3, KeyIdea |
| PostgreSQL: prefer row values syntax | 3 |
| Also for date and time in text columns with a lexically chronological format (ISO 8601); Oracle TO_CHAR example | 3 |
| Same problem returns in Paging Through Results, same approximation | 3 |
| Reverse case: obfuscate intentionally; bind parameters and LIKE; query with subsidiary_id = ? AND last_name LIKE ? | 4 |
| Which index is better? impossible without the wildcard position; optimizer guesses | 4 |
| Known leading wildcard: last_name \|\| '' LIKE ?; appending an empty string suffices; last resort | 4 |

## obfuscation/smart-logic.mdx ← /sql/where-clause/obfuscation/smart-logic

| Original point | Our section |
| --- | --- |
| Ad-hoc queries; optimizer works at runtime; overhead minimized with bind parameters; databases are optimized for dynamic SQL | Opening |
| Practice of static SQL because of the "dynamic SQL is slow" myth; harmful with shared plan caches (Db2, Oracle, SQL Server) | 1 |
| Example: search by subsidiary id, employee id, last name (case-insensitive) in any combination; smart logic SQL | 1 |
| Named bind variables; NULL disables a filter via OR; reasonable; in line with three-valued logic; one of the worst anti-patterns | 1 |
| Database cannot optimize for a particular filter; prepares for the worst case; full scan plan with predicate information | 2 |
| Full table scan even with an index per column | 2 |
| Not that the database cannot resolve the logic; generic plan because of bind parameters; literal values: SQL and INDEX RANGE SCAN plan on EMP_UP_NAME | 3 |
| No solution, just proves the database can resolve the conditions | 3 |
| Warning: literal values: SQL injection and optimization overhead | 3, Callout warning |
| Dynamic SQL; KISS principle; SQL with only the needed filter and a bind parameter | 4 |
| Tip: use dynamic SQL for dynamic where clauses; still use bind parameters or the myth comes true | 4, KeyIdea |
| Shared plan caches have features to cope, introducing new problems | 5 |
| Db2: fully exposed; REOPT NONE (default, generic), ALWAYS (peek every execution, no caching), ONCE (first execution; nondeterministic, changes after restart or expiry) | 5, db2 tab |
| MySQL: no plan cache; 2009 feature request; optimizer simple enough | 5, mysql tab |
| Oracle: SQL area; bind peeking since 9i, nondeterministic; adaptive cursor sharing since 11g with multiple plans and selectivity ranges, replacement or new variant | 5, oracle tab |
| PostgreSQL: plan cache for open statements only; problem when reusing a handle; JDBC enables cache after the fifth execution; link to planning with actual bind values | 5, postgresql tab |
| SQL Server: parameter sniffing, nondeterministic; hints RECOMPILE, OPTIMIZE FOR, USE PLAN; bugs and surprises; Erland Sommarskog up to SQL Server 2022 | 5, sql-server tab |
| Heuristics help to an extent but were built for histograms and LIKE; most reliable is to avoid unnecessary filters | 5 |
| See also: bind variable examples; building dynamic SQL with ORM tools | 5 (external links) |

## obfuscation/math.mdx ← /sql/where-clause/obfuscation/math

| Original point | Our section |
| --- | --- |
| One more class of obfuscation using a calculation instead of logic | Opening |
| Can numeric_number - 1000 > ? use an index on NUMERIC_NUMBER? | 1 |
| Can 3*a + 5 = b use an index on A and B in any order? | 1 |
| Would you add an equation solver? Vendors say no; neither example uses the index | 1 |
| Math as intentional obfuscation, as with the full-text LIKE; numeric_number + 0 = ? | 2 |
| Function-based index after transforming the where clause like an equation: 3*a - b = -5 | 3 |
| Table references on one side, constants on the other; CREATE INDEX math ON table_name (3*a - b) | 3 |
