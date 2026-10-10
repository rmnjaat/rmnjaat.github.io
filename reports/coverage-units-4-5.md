# Coverage report: Unit 4 (The Join Operation) and Unit 5 (Clustering Data)

Each table lists every point the original page makes (headings, claims, boxes, code samples, plans, figures, numbers, links) and where it lands in our MDX. Section numbers refer to the numbered `##` headings of the rewritten lesson. "Intro" is the lesson's opening paragraph; "FM" is frontmatter (`recap`, `outcomes`).

Note on ORM samples: the originals show Java (JPA/Hibernate), Perl (DBIx::Class) and PHP (Doctrine). There is no Python/SQLAlchemy sample on any of these pages, and no SQL Server, PostgreSQL or MySQL plan; the originals show Oracle and Db2 (LUW) plans only. Our EngineTabs reproduce the Oracle and Db2 plans and add illustrative PostgreSQL, SQL Server and MySQL plans for the same statement, plus a SQLite note.

## Chapter intro: https://use-the-index-luke.com/sql/join

Folded into `join/nested-loops-join-n1-problem.mdx` section 1 and the `intro` string of chapter `join` in `src/lib/site.ts`.

| Original point | Our placement |
| --- | --- |
| Join transforms normalized data into a denormalized form for a purpose | Nested loops intro; site.ts intro |
| Joins are sensitive to disk seek latency because they combine scattered fragments | Nested loops intro; site.ts intro |
| Indexing is the best remedy; the right index depends on which of three algorithms is used | Nested loops intro; site.ts intro |
| All algorithms process two tables at a time; more tables means intermediate results joined step by step | Nested loops section 1 |
| Sidebar "Pipelining intermediate results": rows are pipelined to the next join rather than materialized, reducing memory | Nested loops section 1 |
| Join order does not change the result but affects performance; optimizer evaluates permutations | Nested loops section 1; FM recap |
| Number of plan variants grows as n! | Nested loops section 1 (720 and 3 million examples) |
| Not a problem when using bind parameters; Important box: the more complex the statement, the more important bind parameters are; not using them is like recompiling a program every time | Nested loops section 1, Callout "Bind parameters again" |
| Contents list: nested loops (N+1), hash join (different indexing), sort-merge (zipper) | Unit structure; site.ts intro names the three |
| Opening joke, promotional boxes, about/buy/hire sidebars | Not teaching content, omitted |

## join/nested-loops-join-n1-problem.mdx <- https://use-the-index-luke.com/sql/join/nested-loops-join-n1-problem

| Original point | Our placement |
| --- | --- |
| Nested loops is the most fundamental join; outer/driving query plus one query per driving row | Section 2 |
| You can implement it yourself with nested selects; bad because network latency adds to disk latency | Section 2 |
| Common because easy to do unknowingly; ORMs; "N+1 selects problem" notoriety | Section 2 |
| Example task: employees whose last name starts with WIN and all their sales | Section 3 |
| Java JPA CriteriaBuilder sample (code) | Section 3, code block |
| Hibernate JPA 3.6.0 generates N+1 selects (three SQL blocks) | Section 3 |
| Perl DBIx::Class sample (code) | Section 3 |
| DBIx::Class 0.08192 generates N+1 selects (three SQL blocks) | Section 3 |
| PHP Doctrine query builder sample (code) | Section 3 |
| Doctrine 2.0.5 generates N+1 selects (three SQL blocks) | Section 3 |
| ORMs do not generate joins; N+1 name explained (N rows -> N+1 statements) | Section 3, closing paragraph |
| Box "Enabling SQL logging": DBIC_TRACE=1; Doctrine EchoSqlLogger only in source, disable in production, build configurable logger; Hibernate native show_sql in hibernate.cfg.xml; JPA persistence.xml properties for EclipseLink, Hibernate, OpenJPA; programmatic logging risks deployment to production | Section 3, Callout "Turn on SQL logging" |
| Nested selects explain the algorithm; database executes the join like the ORMs do; index like for those selects | Section 4 |
| CREATE INDEX emp_up_name ON employees (UPPER(last_name)) | Section 4 |
| CREATE INDEX sales_emp ON sales (subsidiary_id, employee_id) | Section 4 |
| SQL join still more efficient than nested selects despite same lookups: avoids network; faster even with more data transferred (duplicated employee attributes) | Section 4 |
| Two dimensions of performance: response time and throughput = latency and bandwidth; bandwidth minor, latency huge; round trips matter more than data volume (link to Unit 3) | Section 4 |
| Tip: execute joins in the database | Section 4, KeyIdea "Remember" |
| Eager fetching configured at property level in entity mappings; always joins; only sensible if details always needed | Section 5 |
| Eager fetching counterproductive when child not always needed (telephone directory example); static configuration is no solution; control joins at runtime | Section 5 |
| Java: Root.fetch() with JoinType.LEFT to keep employees without sales | Section 5 |
| Warning: JPA/Hibernate return the employee once per sale (30 sales -> 30 times); specified behaviour EJB 3.0 section 4.4.5.3; de-duplicate with LinkedHashSet or distinct() | Section 5, Callout "Fetch joins duplicate the parent" |
| Java fetch join sample code with q.distinct(true) | Section 5 |
| Hibernate 3.6.0 generated SQL with select distinct and left outer join | Section 5 |
| JPA has no separate API to de-duplicate parents only; distinct is alarming because most databases really filter; few recognise PK uniqueness | Section 5 |
| Native Hibernate Criteria API: FetchMode.JOIN plus DISTINCT_ROOT_ENTITY transformer (code) | Section 5 |
| Generated SQL from native API: straight SQL, no unintended clauses | Section 5 |
| Note: Hibernate uses lower() for ilike, important for function-based indexing | Section 5 |
| Perl prefetch => ['sales'] sample (code) | Section 5 |
| DBIx::Class SQL with LEFT JOIN and an unrequested ORDER BY; database must sort | Section 5 |
| PHP Doctrine select('e,s') with leftJoin sample (code) | Section 5 |
| Doctrine generated SQL with LEFT JOIN | Section 5 |
| Execution plan shows NESTED LOOPS OUTER: Db2 plan (NLJOIN LEFT, FETCH EMPLOYEES, RIDSCN, SORT UNIQUE, IXSCAN EMP_NAME, FETCH SALES, IXSCAN SALES_SUB_EMP, predicate info) | Section 6, EngineTabs db2 |
| Note: UPPER removed from where clause to get the Db2 plan | Section 6, db2 tab note |
| Oracle plan (NESTED LOOPS OUTER, EMP_UP_NAME, SALES_EMP, predicate info with (+)) | Section 6, EngineTabs oracle |
| Explanation: employees via EMP_UP_NAME first, then sales per employee | Section 6 intro sentence |
| Tip: get to know your ORM and take control of joins; eager fetching not offered by every ORM; implement a small set of samples; reveals unexpected behaviour like duplication; download samples | Section 6, Callout "Get to know your ORM" |
| Nested loops good when driving query returns a small result; otherwise optimizer may choose hash join, but only if the application uses a join | Section 7; FM recap |
| Links: samples ZIP, example schema, latency article | Samples ZIP is an external download, referenced in prose ("write a handful of sample queries"); schema is our example-schema reference; latency topic covered via Unit 3 link |
| Joins figure (animated nested loops) | Joins figure 4.1, section 2 |

Added beyond the original: PostgreSQL, SQL Server and MySQL plans for the same statement; a SQLite TryIt (4.1) showing the inner lookup and the effect of `sales_emp`.

## join/hash-join-partial-objects.mdx <- https://use-the-index-luke.com/sql/join/hash-join-partial-objects

| Original point | Our placement |
| --- | --- |
| Hash join aims at nested loops' weak spot: many B-tree traversals; loads candidate records of one side into a hash table probed per row of the other side | Intro; section 1 |
| Entirely different indexing approach; fewer columns also helps; challenge for ORMs | Intro |
| No need to index join columns; only independent where predicates help; Tip: index the independent where predicates | Section 2; KeyIdea; FM recap |
| Example: SELECT * sales join employees for last six months (SQL) | Section 2 |
| SALE_DATE filter is the only independent where clause (one table, not a join predicate) | Section 2 |
| Db2 plan without index (HSJOIN, TBSCAN SALES, TBSCAN EMPLOYEES, predicate info); where clause written as current_date - 6 MONTH | Section 2, EngineTabs db2 |
| Oracle plan without index (HASH JOIN, TABLE ACCESS FULL EMPLOYEES 10000 rows 9M, TABLE ACCESS FULL SALES, predicate info) | Section 2, EngineTabs oracle |
| Explanation: step 2 full scan loads employees into hash table keyed by join predicates; step 3 full scan sales, discards rows failing SALE_DATE, probes hash table | Section 2, oracle tab |
| Hash table is a temporary in-memory structure loaded in one shot; no index needed to fetch single records; no filter on EMPLOYEES because no independent predicate | Section 1 and oracle tab |
| Important: indexing join predicates does not improve hash join performance; independent predicates can be indexed, here SALE_DATE | Section 2, Callout "Indexing the join columns does not help" |
| CREATE INDEX sales_date ON sales (sale_date) | Section 2 |
| Db2 plan with index (FETCH SALES, RIDSCN, SORT UNIQUE, IXSCAN SALES_DATE, TBSCAN EMPLOYEES; cost 16655) | Section 2, second EngineTabs db2 |
| Oracle plan with index (TABLE ACCESS BY INDEX ROWID SALES, INDEX RANGE SCAN SALES_DATE; cost 3252); employees still full scan because no independent predicate | Section 2, second EngineTabs oracle |
| Indexing a hash join is symmetric; join order does not influence indexing; SALES_DATE could load the hash table if order reversed; Note box | Section 2, paragraph after plans; KeyIdea |
| Minimize hash table size; optimal only if it fits in memory; optimizer uses the smaller side; Oracle Bytes column shows the estimate; employees 9 MB is smaller | Section 3 |
| Reduce rows with extra conditions, e.g. filter on DEPARTMENT (sales staff only); helps even without an index on it; ensure no sales for other departments; use constraints to guard assumptions | Section 3 ("Suppose employees had a department column") |
| Relevant factor is memory footprint, not row count; select fewer columns | Section 3 |
| Query with four columns (SQL) | Section 3 |
| Seldom introduces bugs: dropping a needed column errors quickly | Section 3 |
| Hash table cut from 9 MB to 234 KB, a 97 percent reduction; Oracle plan with 234K bytes | Section 3, plan block |
| Tip: select fewer columns to improve hash join performance | Section 3, KeyIdea "Remember" |
| Partial objects are hard with ORMs; support sparse | Section 4 intro |
| Java: @Basic(fetch=FetchType.LAZY) on a property (code) | Section 4 |
| Providers are free to ignore it; spec quote EJB 3.0 JPA 9.1.18 (LAZY is a hint) | Section 4 (paraphrased, cited) |
| Hibernate 3.6 bytecode instrumentation; transparent; new dimension of N+1: one select per record and property; JPA offers no runtime control | Section 4 |
| HQL FETCH ALL PROPERTIES clause (code); forces eager fetch despite instrumentation | Section 4 |
| DTOs: select new SalesHeadDTO(...) in HQL/JPQL (code); returns POJO not entity | Section 4 |
| Migrating existing code unreasonable; instrumentation N+1 worse than original problem; common interface with getters for entity and DTO; read-only consumers; large hash joins are usually reporting | Section 4 |
| New reports: DTOs or a simple Map (FewerColumnsHibernate.java) | Section 4 |
| Perl: DBIx::Class is not an entity manager, inheritance causes no aliasing problems; cookbook supports it | Section 4 |
| Two-level schema definition SalesHead / Sales (code); derived class adds the missing attribute; table setup required in derived class | Section 4 |
| prefetch for all employee details, or +columns for selected columns (code) | Section 4 |
| Not possible to load only selected columns from the root table | Section 4 |
| DBIx::Class 0.08192 generated SQL (all sales columns, selected employee columns) | Section 4 |
| PHP: Doctrine 2 partial keyword; documentation warns partial objects may behave oddly; must select PK columns explicitly (code) | Section 4 |
| Generated SQL includes sales subsidiary_id and employee_id again | Section 4 |
| Returned objects compatible with fully loaded ones; missing columns uninitialized; no exception on access | Section 4 |
| Note: MySQL introduced hash join in 8.0.18 (2019) | EngineTabs mysql; FM recap |
| Factbox: no indexes on join predicates; indexes only for independent predicates; reduce hash table horizontally or vertically; cannot do theta joins (range conditions in join predicates) | FM recap; section 5 (theta joins) |
| Links: samples ZIP, example schema | Samples are external downloads; schema is our example-schema reference |
| Joins figure (hash) | Joins figure 4.2, section 1 |

Added beyond the original: PostgreSQL, SQL Server, MySQL plans and SQLite note; Callout "Common mistake" on SELECT *; TryIt 4.2 using SQLite's automatic index as the build-phase analogue.

## join/sort-merge-join.mdx <- https://use-the-index-luke.com/sql/join/sort-merge-join

| Original point | Our placement |
| --- | --- |
| Combines two sorted lists like a zipper; both sides sorted by the join predicates | Intro; section 1 |
| Needs the same indexes as the hash join: independent conditions to read all candidates in one shot | Section 3; FM recap |
| Indexing the join predicates is useless | Section 3; FM recap |
| Unique aspect: absolute symmetry; join order makes no difference, not even for performance | Section 2; KeyIdea |
| Useful for outer joins: for other algorithms the outer join direction implies the join order; not for sort-merge | Section 2 |
| Can do left and right outer join at once: full outer join | Section 2; KeyIdea |
| Figure 4.1: sort-merge join executing a FULL OUTER JOIN (animation) | Joins figure 4.3 (mode merge), section 1, with the full outer join described in section 2 |
| Performs very well once sorted but hardly used because sorting both sides is expensive; hash join preprocesses only one side | Section 4 |
| Strength emerges when inputs are already sorted; exploit index order to avoid sorts; Chapter 6 reference | Section 4, link to Unit 6 |
| Hash join is superior in many cases nevertheless | Section 4 |
| Factbox: no indexes on join predicates needed; MySQL does not support sort-merge joins | FM recap; EngineTabs mysql |

Added beyond the original: Oracle, PostgreSQL, SQL Server, Db2 merge-join plans with and without the sales index; "Equality only" note; TryIt 4.3 showing an index removing the sort step in SQLite.

## Chapter intro: https://use-the-index-luke.com/sql/clustering

Folded into `clustering/index-filter-predicates.mdx` intro and section 1, and the `intro` string of chapter `clustering` in `src/lib/site.ts`.

| Original point | Our placement |
| --- | --- |
| "Cluster" used in many fields: star cluster, computer cluster (HPC or failover); clusters are related things that appear together | Index filter predicates intro |
| Data cluster: storing consecutively accessed data close together to need fewer I/O operations | Index filter predicates intro; site.ts intro |
| Term is ambiguous in database context ("let's use a cluster"); this chapter means data clusters | Index filter predicates intro; site.ts intro |
| Simplest data cluster is the row; all columns in the same block if possible; exceptions for rows that do not fit, e.g. LOBs | Index filter predicates section 1; site.ts intro |
| Sidebar: column stores organize tables by column; beneficial for many rows, few columns (OLAP, data warehouses) | Index filter predicates section 1 |
| Indexes cluster data: leaf nodes store indexed columns in order, similar values next to each other; basis in Chapter 1 | Index filter predicates section 1; site.ts intro |
| Note: B-tree traversal is the first power of indexing; clustering is the second | Index filter predicates section 1; site.ts intro |
| Contents: intentional filter predicates (to tune LIKE), index-only scan, index-organized tables | Unit structure; section 1 closing sentence |

## clustering/index-filter-predicates.mdx <- https://use-the-index-luke.com/sql/clustering/index-filter-predicates

| Original point | Our placement |
| --- | --- |
| Index filter predicates usually indicate improper column order; can be used intentionally, not for range scan performance but to group consecutively accessed data | Section 2 |
| Candidates: where predicates that cannot be access predicates | Section 2 |
| Example query: first_name, last_name, subsidiary_id, phone_number WHERE subsidiary_id = ? AND UPPER(last_name) LIKE '%INA%' | Section 2 |
| Leading-wildcard LIKE cannot use the tree (link); indexing LAST_NAME or UPPER(last_name) does not narrow the range; not a candidate | Section 2 |
| subsidiary_id is well suited; no new index needed because it already leads the primary key index | Section 2 (with the Unit 2 primary key swap named) |
| Db2 plan with EMPLOYEES_PK (FETCH 33 of 333, RIDSCN, SORT UNIQUE, IXSCAN; SARG on FETCH) | Section 2, EngineTabs db2 |
| Oracle plan with EMPLOYEES_PK (TABLE ACCESS BY INDEX ROWID 17 rows cost 230; INDEX RANGE SCAN 333 rows cost 2; filter on 1, access on 2) | Section 2, EngineTabs oracle |
| Cost rises a hundredfold from index scan to table access; table access causes most work; common pattern, not a problem by itself; biggest contributor | Section 2 |
| Table access not a bottleneck if rows in one block; serious if spread over many blocks; depends on physical distribution = clustering of rows | Section 2 |
| Note: correlation between index order and table order is the index clustering factor | Section 2, Callout "The index clustering factor" |
| Sidebar: clustering factor is an indirect measure of the probability that two succeeding index entries refer to the same block; optimizer uses it for TABLE ACCESS BY INDEX ROWID cost | Section 2, same Callout |
| Reordering table rows to match the index is possible but rarely applicable: one sequence only, one index; rudimentary tools; row sequencing is impractical | Section 2 |
| Second power of indexing: add many columns to an index, stored in a well-defined order; index as clustering tool | Section 3 |
| Extend the index to all where-clause columns even if they do not narrow the range: CREATE INDEX empsubupnam ON employees (subsidiary_id, UPPER(last_name)) | Section 3 |
| subsidiary_id first as access predicate; UPPER(last_name) covers the LIKE as filter predicate; uppercase saves CPU cycles; a plain LAST_NAME index would work too (see next section) | Section 3 |
| Db2 plan with EMPSUBUPNAM2 (IXSCAN with SARG LIKE; cost 15); UPPER removed from index and where; Db2 10.5 function-based indexing fresh, optimizer not fully aware; collations better in Db2 | Section 3, EngineTabs db2 |
| Oracle plan with EMPSUBUPNAM (same operations; cost 20; filter on INDEX RANGE SCAN; 17 rows at index) | Section 3, EngineTabs oracle |
| Same operations, cost dropped; LIKE applied during INDEX RANGE SCAN; non-matching rows discarded immediately; table access has no filter left | Section 3, oracle tab and paragraph |
| Rows column: 17 final; first plan index delivers 333 and table loads 333; second plan table access runs 17 times | Section 3, paragraph after plans |
| INDEX RANGE SCAN cost grew from 2 to 3 because the index is bigger; acceptable compromise | Section 3, oracle tab |
| Warning: do not introduce a new index solely for filter predicates; extend an existing one; keep maintenance effort low; some databases allow adding non-PK columns to the PK index | Section 3, Callout "Do not add a new index for this" |
| Figure 5.1: intentional index filter predicates (animation) | IndexAccess figure 5.1, section 3 |
| Seems to confirm "index every where column" wisdom; it ignores column order, which determines access predicates; never leave column order to chance | Section 4 |
| Index size grows with columns, especially text; bigger index is not faster; logarithmic scalability limits the impact; do not add all where columns; use filter predicates intentionally to reduce data volume early | Section 4 |
| Tip links: glossary, access/filter predicates by example, accidental filter predicates at volume, anywhere LIKE, spotting filter predicates in Oracle/PostgreSQL/SQL Server plans | Section 4, Callout "Related pages" |

Added beyond the original: PostgreSQL, SQL Server and MySQL plans (including the PostgreSQL caveat that `Filter` runs after the heap fetch); "when it is worth it" criteria; TryIt 5.1.

## clustering/index-only-scan-covering-index.mdx <- https://use-the-index-luke.com/sql/clustering/index-only-scan-covering-index

| Original point | Our placement |
| --- | --- |
| Index-only scan is one of the most powerful tuning methods; avoids table access completely if selected columns are in the index | Intro; section 1 |
| Index must contain all columns from the statement, in particular the select clause; CREATE INDEX sales_sub_eur ON sales (subsidiary_id, eur_value); SELECT SUM(eur_value) WHERE subsidiary_id = ? | Section 1 |
| Indexing the where clause takes precedence; SUBSIDIARY_ID first so it is an access predicate | Section 1 |
| Plan shows index scan without TABLE ACCESS BY INDEX ROWID: Db2 plan (GRPBY, IXSCAN SALES_SUB_EUR 34804 rows, cost 21) | Section 1, EngineTabs db2 |
| Oracle plan (SORT AGGREGATE, INDEX RANGE SCAN SALES_SUB_EUR 40388 rows cost 104) | Section 1, EngineTabs oracle |
| Called a covering index; Note: term misleading because it sounds like an index property; index-only scan correctly names a plan operation | Section 1, closing paragraph; FM recap |
| Index has a copy of EUR_VALUE; table not needed | Section 1 |
| Can improve performance enormously: row estimate 40,000 means 40,000 table fetches avoided if each row is in a different block; with a good clustering factor the advantage is lower | Section 2 |
| Number of selected rows limits the gain; one row saves one access; tree traversal costs a few blocks too, so the saving may be negligible | Section 2 |
| Important: advantage depends on number of accessed rows and the clustering factor | Section 2, Callout |
| Aggressive strategy; do not design on suspicion; memory and update maintenance (Chapter 8); index without considering the select clause first, extend only if needed | Section 2; FM recap |
| Unpleasant surprise: adding AND sale_date > ? (SQL); expected faster, but column not in index so table must be accessed | Section 3 |
| Db2 plan with FETCH SALES (1223 of 34804, cost 13547) | Section 3, EngineTabs db2 |
| Oracle plan with TABLE ACCESS BY INDEX ROWID SALES via INDEX RANGE SCAN SALES_DATE (10541 rows, cost 371) | Section 3, EngineTabs oracle |
| Table access increases response time although fewer rows; relevant factor is rows inspected, not rows delivered | Section 3 |
| Warning: extending the where clause can cause illogical behaviour; check the plan before extending queries | Section 3, Callout |
| Optimizer picks the next best plan; may be entirely different or similar with another index; here SALES_DATE, a leftover from the hash join chapter | Section 3 |
| Two advantages of SALES_DATE: optimizer believes it more selective (10,000 vs 40,000 rows); estimates arbitrary with bind parameters (first sale date selects the whole table) | Section 3 |
| Second advantage: better clustering factor; SALES grows chronologically, rows appended at the end if none deleted; table order corresponds to index order | Section 3 |
| Good clustering factor means few table blocks; query may be fast enough without index-only scan; then remove the unneeded columns from the other index | Section 3 |
| Note: some indexes have a good clustering factor automatically, so the index-only scan advantage is minimal | Section 3, Callout |
| Happy coincidence: new filter prevented the index-only scan but opened a new access path; adding a column to the select clause can never open a new access path | Section 3 |
| Tip: maintain your index-only scans; add comments referring to the page | Section 3, KeyIdea "Maintain your index-only scans" |
| Function-based indexes: UPPER(last_name) index cannot serve an index-only scan selecting LAST_NAME; previous section should have indexed LAST_NAME itself | Section 4 |
| Tip: always index the original data; avoid function-based indexing for expressions that cannot be access predicates | Section 4, KeyIdea |
| Aggregating queries are good candidates: many rows, few columns, slim index; more columns selected means more to index; select only needed columns; Tip: avoid select * | Section 5 |
| Databases impose limits on columns per index and entry size | Section 5 |
| Sidebar INCLUDE: SQL Server and PostgreSQL 11+ non-key columns; stored only in leaf nodes; cannot be access predicates; example CREATE INDEX empsubupnam ... INCLUDE(phone_number, first_name) | Section 5, Callout "INCLUDE: non-key columns" |
| Db2: 64 columns, key length 25 percent of page size; INCLUDE on unique indexes without changing uniqueness semantics | Section 5, EngineTabs db2 |
| MySQL: InnoDB 3072 bytes total; 767 per column unless innodb_large_prefix or DYNAMIC/COMPRESSED (default up to 5.6); MyISAM 16 columns, 1000 bytes | Section 5, EngineTabs mysql |
| MySQL prefix indexing: unrelated to partial indexes; silent truncation with warning "Specified key was too long"; index no longer has a full copy, selecting the column prevents an index-only scan; explicit prefix CREATE INDEX .. ON employees (last_name(10)) | Section 5, EngineTabs mysql |
| Oracle: key length depends on block size and storage parameters (75 percent of block minus overhead); 32 columns; 11g with 8k blocks 6398 bytes; ORA-01450 | Section 5, EngineTabs oracle |
| PostgreSQL: index-only scans since 9.2; entries limited to 2713 bytes (about BLCKSZ/3); error only on insert/update; 32 columns | Section 5, EngineTabs postgresql (and section 1 postgresql tab for 9.2) |
| SQL Server: since 2016 up to 32 key columns and 1700 bytes (900 for clustered); non-key columns do not count; footnote: before 2016, 16 columns and 900 bytes | Section 5, EngineTabs sql-server |
| Think about it: queries that select no table columns are often index-only scans; meaningful example? | Section 5, Callout "Think about it" (with EXISTS/IN and COUNT(*) as answers) |
| Next section: indexes that cover an entire table | Section 5, closing sentence |

Added beyond the original: PostgreSQL visibility map / Heap Fetches explanation, SQL Server and MySQL plans; TryIt 5.2.

## clustering/index-organized-clustered-index.mdx <- https://use-the-index-luke.com/sql/clustering/index-organized-clustered-index

| Original point | Our placement |
| --- | --- |
| Index-only scan uses only the redundant data in the index; heap table not needed; put all columns in the index and the heap seems pointless | Intro |
| Some databases use an index as primary table store; Oracle: index-organized table (IOT); others: clustered index; both terms used as needed | Section 2 |
| IOT is a B-tree without a heap; two benefits: saves heap space, every access is an index-only scan; both hardly achievable in practice | Section 2 |
| Drawbacks appear with another (secondary) index: data in the clustered index moves to maintain order; physical location cannot be stored; logical key used instead | Sections 2 and 3 |
| Figure 5.2: index-based access on a heap table (INDEX RANGE SCAN then TABLE ACCESS BY INDEX ROWID; sales of 2012-05-23) | Figure 5.2 (comparison table), section 2 |
| Heap table access limited to one read per row because the index has the ROWID as a direct pointer | Section 1; Figure 5.2 |
| Secondary index on an IOT stores the clustering key, often the primary key, not a ROWID | Section 3 |
| Sidebar "Why secondary indexes have no ROWID": a direct pointer needs fixed positions; rows in an index move to keep order; an insert may split a leaf and move entries; heap rows never move once written | Section 3 (and section 1) |
| Secondary access yields a logical key; needs a full tree traversal of the clustered index: INDEX RANGE SCAN on secondary, INDEX UNIQUE SCAN per row | Section 3 |
| Figure 5.3: secondary index on an IOT; the clustered index B-tree stands between the secondary index and the data | Figure 5.2 right column; section 3 prose |
| Very inefficient; prevent with an index-only scan, here a "secondary-index-only scan"; advantage even bigger because it saves an entire INDEX UNIQUE SCAN | Section 3 |
| Important: accessing an IOT via a secondary index is very inefficient | Section 3, Callout |
| Databases exploit redundancies: the clustering key can be queried from the secondary index without accessing the IOT; SELECT sale_id FROM sales_iot WHERE sale_date = ? with Oracle plan (INDEX RANGE SCAN SALES_IOT_DATE, cost 4) | Section 3 |
| SALES_IOT uses SALE_ID as clustering key; SALES_IOT_DATE on SALE_DATE only still has SALE_ID | Section 3 |
| Selecting other columns requires INDEX UNIQUE SCAN per row: SELECT eur_value with Oracle plan (INDEX UNIQUE SCAN SALES_IOT_PK over INDEX RANGE SCAN SALES_IOT_DATE, cost 13) | Section 3 |
| IOTs not as useful as they seem; improvements lost with secondary indexes; clustering key longer than ROWID so secondary indexes are larger, often eliminating heap savings; strength limited to tables without a second index; heap tables provide a stationary master copy that is easy to reference | Section 4 |
| Important: tables with one index only are best as clustered/IOT; tables with more indexes benefit from heaps; index-only scans give select performance of a clustered index without slowing other indexes | Section 4, Callout |
| Database support is inconsistent | Section 5 intro |
| Db2 (LUW): no IOTs; "clustered index" means a heap that tries to insert new rows near nearby index rows | Section 5, EngineTabs db2 |
| MySQL: MyISAM heap tables only; InnoDB always clustered; no choice | Section 5, EngineTabs mysql |
| Oracle: heap by default; ORGANIZATION INDEX clause (DDL); primary key always the clustering key | Section 5, EngineTabs oracle |
| PostgreSQL: heap only; CLUSTER aligns the heap with an index | Section 5, EngineTabs postgresql |
| SQL Server: clustered by default with PK as clustering key; arbitrary, even non-unique, columns allowed; heap via PRIMARY KEY NONCLUSTERED (DDL); dropping the clustered index turns the table into a heap; default often causes problems with secondary indexes | Section 5, EngineTabs sql-server |

Added beyond the original: primary key advice where there is no choice (short, increasing); SQLite note on rowid and WITHOUT ROWID tables; TryIt 5.3 on a WITHOUT ROWID copy of sales.

## New files

- `join/practice.mdx` (kind practice, order 4): four TryIt exercises (inner lookup via primary key; automatic index on a non-indexed join column and its disappearance once the driving side is indexed; fewer columns making the sales side covering; independent condition on each side), one Check.
- `join/unit-check.mdx` (kind quiz, order 5): six Check questions.
- `clustering/practice.mdx` (kind practice, order 4): four TryIt exercises (covering index with USING COVERING INDEX; SELECT * losing it; filter predicate with LIKE '%an%' inside subsidiary 30; WITHOUT ROWID table whose secondary index answers a query for the clustering key), one Check.
- `clustering/unit-check.mdx` (kind quiz, order 5): five Check questions.

## Verification

- `node scripts/lint-content.mjs src/content/lessons/join`: 5 files, 0 problems.
- `node scripts/lint-content.mjs src/content/lessons/clustering`: 5 files, 0 problems.
- `node scripts/check-playgrounds.mjs src/content/lessons/join`: 7 playgrounds, 0 errors.
- `node scripts/check-playgrounds.mjs src/content/lessons/clustering`: 7 playgrounds, 0 errors.
- Every TryIt task regex (40 tasks) was tested against its solution query and the plan SQLite 3.49.1 produces; all match.
