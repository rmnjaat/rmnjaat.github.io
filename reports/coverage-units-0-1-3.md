# Coverage report: units 0, 1 and 3

Every heading, claim, figure, box, SQL sample, plan sample, vendor note, link and number from the original use-the-index-luke.com pages, and where it lives in our lesson. Section numbers refer to the `##` headings of the named lesson. Nothing is marked missing.

Site-wide boilerplate on every original page (newsletter, book promotion, "Hire Markus", blog list, shop, social links, translations, copyright) is intentionally not reproduced; it is not lesson content.

## Preface ← https://use-the-index-luke.com/sql/preface

Lesson: `src/content/lessons/preface.mdx`

| Original heading / point | Where it lives |
| --- | --- |
| Title "Developers Need to Index" | Subtitle, section 3, Check |
| SQL performance problems as old as SQL; "inherently slow" true early, not now; still commonplace | Opening paragraph |
| SQL as most successful 4GL; separates "what" from "how" | Section 1 |
| Example `SELECT date_of_birth FROM employees WHERE last_name = 'WINAND'` | Section 1 (SQL block) |
| Reads like English; no knowledge of files/disks needed; many developers know little about the processing inside | Section 1 |
| Separation works well but not perfectly; limit at performance; author "by definition" not caring how it runs; experience proves the author must know a little | Section 2 |
| The only thing developers need to learn is how to index; indexing is a development task | Section 2 (last paragraph), section 3 |
| Most important information is how the application queries the data (the access path), not storage/hardware; not accessible to DBAs or consultants; reverse engineering takes time; development has it anyway | Section 3 and KeyIdea |
| Book covers everything developers need and nothing more; B-tree index only | Section 4 |
| B-tree works almost identically across databases; Oracle terminology primarily; corresponding terms of other databases; side notes on MySQL, PostgreSQL, SQL Server | Section 4 (also Db2, which our plan reference covers, and SQLite for the playgrounds) |
| Structure tailored for developers; chapters correspond to parts of an SQL statement | Section 5 intro |
| Chapter 1 Anatomy: only non-SQL chapter; fundamental structure; essential, do not skip; about eight pages; afterwards you understand slow indexes | Section 5, first bullet |
| Chapter 2 Where clause: all the stops; single column to ranges and LIKE; main body; much faster SQL | Section 5, second bullet |
| Chapter 3 Performance and Scalability: digression on measurement; adding hardware not the best solution | Section 5, third bullet |
| Chapter 4 Join: indexes for fast joins | Section 5, fourth bullet |
| Chapter 5 Clustering: single column vs all columns; a trick for more | Section 5, fifth bullet |
| Chapter 6 Sorting and grouping: order by and group by can use indexes | Section 5, sixth bullet |
| Chapter 7 Partial results: pipelined execution when you do not need the full result | Section 5, seventh bullet |
| Chapter 8 Insert, Delete, Update: indexes affect write performance; not free; use wisely | Section 5, eighth bullet |
| Appendix A Execution plans; Appendix B Myth directory (extended as book grows); Appendix C Example schema (create and insert statements) | Section 5, appendix paragraph (plus glossary link) |
| Tip: slides "Indexes: The neglected performance all-rounder" (slideshare link) | Section 5, Callout "Before you start" |
| Sidebar "The 3-Minute Quiz" | Section 5, Callout "Before you start", linked to /sql/about/quiz/ |
| Link to next page /sql/anatomy | Section 5 bullet 1 and closing line "Start with the leaf nodes" |

## Chapter intro ← https://use-the-index-luke.com/sql/anatomy

Folded into `src/content/lessons/anatomy/the-leaf-nodes.mdx` and the `anatomy` intro in `src/lib/site.ts`.

| Original point | Where it lives |
| --- | --- |
| "An index makes the query fast" is the most basic explanation; not sufficient; chapter goes deeper but not too deep | the-leaf-nodes opening paragraph; site.ts intro |
| Index is a distinct structure built by `create index`; own disk space; copy of indexed data; pure redundancy; does not change the table; like a book index (own space, redundant, points elsewhere) | the-leaf-nodes section 1 |
| Sidebar: clustered indexes (SQL Server, MySQL/InnoDB), index-organized tables (Oracle), chapter 5 | the-leaf-nodes section 1, Callout "Clustered indexes and index-organized tables" |
| Searching an index is like a printed telephone directory; entries in a well-defined order; order determines position so lookup is fast | the-leaf-nodes section 2 |
| Index is more complex than a printed directory because it changes constantly; printed directory has no room for new entries and waits for the next printing; a database must apply insert/delete/update immediately without moving large amounts of data | the-leaf-nodes section 2; site.ts intro |
| Two structures: doubly linked list and search tree; they explain most performance characteristics | the-leaf-nodes section 2 KeyIdea and section 6; site.ts intro |
| Contents: Leaf nodes (doubly linked list), B-tree (balanced tree), Slow indexes part I (two ingredients) | Unit navigation; the-leaf-nodes section 6 links the tree |

## The Leaf Nodes ← https://use-the-index-luke.com/sql/anatomy/the-leaf-nodes

Lesson: `src/content/lessons/anatomy/the-leaf-nodes.mdx`

| Original heading / point | Where it lives |
| --- | --- |
| Primary purpose: ordered representation of the indexed data | Section 2 |
| Cannot store sequentially: insert would move following entries; moving large amounts of data is slow | Section 2 (sorted array example) |
| Solution: logical order independent of physical order | Section 2 KeyIdea |
| Logical order via doubly linked list; each node links to two neighbours like a chain; insert between two nodes by updating links; physical location irrelevant | Section 3 |
| Called doubly linked because each node refers to preceding and following; read forwards or backwards; insert without moving data, just pointers | Section 3 |
| Table: Java `java.util.LinkedList`, .NET `System.Collections.Generic.LinkedList`, C++ `std::list` (with links) | Section 3 table |
| Databases link index leaf nodes; each leaf node in a database block or page, the smallest storage unit; all index blocks same size, typically a few kilobytes; blocks filled as much as possible | Section 4 |
| Order maintained on two levels: entries within a leaf node and leaf nodes among each other | Section 4 |
| Figure 1.1 Index leaf nodes and corresponding table data (sorted leaf nodes with column 2 + ROWID; unsorted table with columns 1 to 4) | Figure 1.1 (LeafChain, leaf order vs disk order) and Figure 1.2 (static table: entries with ROWIDs pointing into unsorted table blocks) |
| Each entry = indexed columns (the key) + ROWID/RID to the table row | Section 5 |
| Table is a heap, not sorted; no relationship between rows in a block nor between blocks | Section 5 and Figure 1.2 caption |
| Link to next page (the B-tree) | Section 6 |

## The B-Tree ← https://use-the-index-luke.com/sql/anatomy/the-tree

Lesson: `src/content/lessons/anatomy/the-tree.mdx` (audited; additions noted)

| Original heading / point | Where it lives |
| --- | --- |
| Leaf nodes stored in arbitrary order; telephone directory with shuffled pages; Robinson/Smith | Opening paragraph, section 1 |
| Second structure needed: balanced search tree, B-tree | Section 1 |
| Figure 1.2 B-tree structure: 30 entries; linked list between leaves; root and branch nodes | Figure 1.3 (LeafChain) and Figure 1.4 (BTree structure), section 2 |
| Highlighted branch node; each branch entry = biggest value of its leaf; 46, 53, 57, 83; layer built until all leaves covered | Section 2 |
| Next layer built on top until all keys fit in one node, the root; balanced = same depth everywhere | Section 2 and KeyIdea |
| Note: a B-tree is a balanced tree, not a binary tree | Section 2 Callout |
| Database maintains index automatically on insert/delete/update; keeps balance; write overhead; chapter 8 | Section 5 (Insert figure 1.6) and KeyIdea "Remember" |
| Figure 1.3 B-tree traversal for 57; entries processed ascending until >= search term; entry 83; follow reference; repeat to leaf | Figure 1.5 (BTree search), section 3, Callout "Why the largest key" |
| Important: the B-tree enables the database to find a leaf node quickly | Section 3 Callout (added) |
| Traversal very efficient, "first power of indexing"; works almost instantly on huge data; because of balance (same number of steps) and logarithmic growth of depth | Section 3 (added paragraph) and section 6 |
| Real indexes with millions of records have depth 4 or 5; depth 6 hardly seen | Section 6 |
| Sidebar: logarithm definition (Wikipedia link); base = entries per branch node, exponent = depth; 4 entries per node, depth 3 → 64 (4^3); +1 level → 256 (4^4); quadruples per level; depth = log4(entries) | Section 6 (added, with Wikipedia link) |
| Table depth 3 to 10: 64, 256, 1,024, 4,096, 16,384, 65,536, 262,144, 1,048,576 | Section 6 table (rows 6, 8, 9 added) |
| A million records in ten levels; real world more efficient; main factor is entries per node = base; higher base, shallower tree, faster traversal; hundreds of entries per node; each level supports a hundred times more entries | Section 6 (rewritten paragraph) |
| Links: B+tree simulator | Section 6 Callout "See a B-tree grow" (added) |
| Links to previous/next page | Opening paragraph and Callout "Common mistake" (next lesson) |

## Slow Indexes, Part I ← https://use-the-index-luke.com/sql/anatomy/slow-indexes

Lesson: `src/content/lessons/anatomy/slow-indexes.mdx`

| Original heading / point | Where it lives |
| --- | --- |
| Despite the efficient traversal, lookups are sometimes slower than expected; myth of the "degenerated index"; rebuild as miracle cure | Opening paragraph, section 1 |
| Appendix B myth directory covers it; rebuilding does not improve performance in the long run | Section 1 (link to /sql/myth-directory/indexes-can-degenerate/) |
| Real reason follows from the previous sections | Opening paragraph, section 4 |
| First ingredient: leaf node chain. Search for 57 in Figure 1.3: two matching entries; next leaf could hold more; database must read the next leaf | Section 2 |
| Lookup = traversal + following the leaf node chain | Section 2, section 4 |
| Second ingredient: table access. One leaf can hold many hits, often hundreds; table data scattered across many blocks (Figure 1.1); extra table access per hit | Section 3 |
| Three steps: (1) traversal (2) chain (3) fetch table data; only the traversal has an upper bound (index depth); the other two may access many blocks | Section 4 and KeyIdea |
| Origin of the myth: belief that a lookup is only the traversal, hence "broken/unbalanced tree" | Section 4 |
| You can ask most databases how they use an index; Oracle is verbose with three operations | Section 5, 6, 7 |
| INDEX UNIQUE SCAN: traversal only; unique constraint guarantees at most one match | Section 5 (Figure 1.7) |
| INDEX RANGE SCAN: traversal plus chain; fallback when multiple entries could match | Section 6 (Figure 1.8) |
| TABLE ACCESS BY INDEX ROWID: retrieves the row; often once per matched record | Section 6 |
| Important point: a range scan can read a large part of an index; one more table access per row makes a query slow even with an index | Section 6 Callout "important" |
| Links to Figure 1.3, Figure 1.1, myth directory, next page (where clause) | Sections 2, 3, 1, 6 |
| Not in the original but kept from our previous version: operation names in PostgreSQL, MySQL, SQL Server, Db2, SQLite | Section 7 EngineTabs |

## Chapter intro ← https://use-the-index-luke.com/sql/testing-scalability

Folded into `src/content/lessons/testing-scalability/data-volume.mdx` section 1 and the `testing-scalability` intro in `src/lib/site.ts`.

| Original point | Where it lives |
| --- | --- |
| Chapter is about performance and scalability | data-volume opening and section 1; site.ts intro |
| Wikipedia definition: ability to handle a growing amount of work in a capable manner, or to be enlarged to accommodate that growth | data-volume section 1 (paraphrased, two halves) |
| Two definitions: effects of growing load vs growing the system | data-volume section 1 |
| Second definition more popular; scale-up, scale-out, web-scale; always about hardware | data-volume section 1; site.ts intro |
| Broadly: performance impact of environmental changes; hardware one parameter; also data volume and system load | data-volume section 1; site.ts intro |
| Contents: Data volume (sloppy indexing bites back), System load (production load affects response time), Response time and throughput (horizontal scalability) | data-volume section 1, last sentence; unit navigation |

## Data Volume ← https://use-the-index-luke.com/sql/testing-scalability/data-volume

Lesson: `src/content/lessons/testing-scalability/data-volume.mdx`

| Original heading / point | Where it lives |
| --- | --- |
| Data volume has a great impact; accepted that queries slow with more data; how much if data doubles, how to improve the ratio; key questions of scalability | Opening paragraph |
| Example: response time of one query with two indexes; definitions revealed later | Section 2 |
| `SELECT count(*) FROM scale_data WHERE section = ? AND id2 = ?` | Section 2 (SQL block) |
| SECTION controls data volume: bigger section, more rows | Section 2 |
| Figure 3.1 performance comparison: fast 0.029 s, slow 0.055 s | Figure 3.1 (static table) |
| Considerable difference; both under a tenth of a second so probably fast enough; chart shows one test point; scalability means changing environmental parameters | Section 2 |
| Important: scalability shows the dependency of performance on factors like data volume; a performance value is a single data point | Section 2 Callout "important" |
| Figure 3.2 scalability by data volume (sections 0 to 100, 0 to 1.2 s) | Figure 3.2 (ScaleChart) |
| Both grow; at 100x volume the fast query takes more than twice as long, the slow one 20 times, more than one second | Section 2 |
| Tip: Appendix C scripts for Oracle, PostgreSQL, SQL Server | Section 2 Callout "tip" |
| Response time depends on many factors; fast under test conditions does not mean fast in production; dev environments with a fraction of the data | Section 2, last paragraph |
| No surprise queries slow down; the gap is unexpected; compare execution plans | Section 2, 3 |
| Db2 plans (IXSCAN SCALE_SLOW cost 208 / SCALE_FAST cost 296; 4456 of 135449700) | Section 3 EngineTabs db2 (verbatim plans) |
| MySQL plans (ref, key_len 6 / 12, ref const / const,const, Using index condition) | Section 3 EngineTabs mysql |
| Oracle plans (INDEX RANGE SCAN, cost 972 / 13, rows 3000) | Section 3 EngineTabs oracle |
| SQL Server: graphical plans both Index Seek, no hint; STATISTICS PROFILE ON shows SEEK/WHERE | Section 3 EngineTabs sql-server |
| Plans almost identical, only index differs; cost reflects the difference but reason not visible | Section 3 |
| "Slow index experience"; no longer believe in broken index; two ingredients: table access, wide index range | Section 3 (links to slow-indexes and myth) |
| No TABLE ACCESS BY INDEX ROWID in either, so one scans a wider range; shown in the predicate information | Section 3, last paragraph |
| Tip: pay attention to the predicate information; a plan without it is incomplete | Section 4 Callout "tip" |
| Complete Db2 plans: START/STOP (SECTION) + SARG (ID2) vs START/STOP on both | Section 4 EngineTabs db2 |
| Db2 note: the more efficient index has the higher cost, so the optimizer would choose the worse one | Section 4 EngineTabs db2 |
| Complete MySQL plans (unchanged) | Section 4 EngineTabs mysql, with explanation of key_len/ref/Using index condition |
| Complete Oracle plans: access("SECTION") filter("ID2") vs access(both) | Section 4 EngineTabs oracle |
| Note: plans simplified; appendix explains Oracle predicate information | Section 4 EngineTabs oracle (link) |
| SQL Server: hover over Index Seek for "Predicate" vs "Seek Predicates"; WHERE = index filter predicate; SEEK = access predicate | Section 4 EngineTabs sql-server |
| Only SECTION is an access predicate with SCALE_SLOW; reads all rows of the section, discards non-matching ID2; grows with rows in the section. SCALE_FAST: all conditions access predicates; grows with selected rows | Section 4, paragraph after tabs, and KeyIdea |
| Important: filter predicates are like unexploded ordnance | Section 4 Callout "important" |
| Reconstruct definitions: SCALE_SLOW starts with SECTION; ID2 not second; at least three columns | Section 5 |
| `CREATE INDEX scale_slow ON scale_data (section, id1, id2)`; ID1 in second position blocks ID2 | Section 5 |
| SCALE_FAST has SECTION and ID2 in first two positions, order unknown; `CREATE INDEX scale_fast ON scale_data (section, id2, id1)` | Section 5 |
| ID1 added so both indexes are the same size; otherwise size might seem the cause | Section 5 |
| Links: greater/less/between, filter predicates in Oracle/PostgreSQL/SQL Server appendices, indexing LIKE filters, Big-O notation | Section 6 Callout "Further reading"; PostgreSQL also in section 4 tab |

## System Load ← https://use-the-index-luke.com/sql/testing-scalability/system-load

Lesson: `src/content/lessons/testing-scalability/system-load.mdx`

| Original heading / point | Where it lives |
| --- | --- |
| Consideration of a multi-column index often stops once it is used; optimizer uses an index because it beats a full table scan, not because it is the right one; not necessarily optimal | Opening paragraph, section 1 |
| Previous example showed difficulty of seeing wrong column order; predicate information often hidden; search for it to verify optimal usage | Section 1 |
| SQL Server Management Studio shows predicate information only as a hover tooltip; the SCALE_SLOW plan shows ID2 as "Predicate" without Seek (image) | Section 2 EngineTabs sql-server (described in prose plus text plan) |
| MySQL and PostgreSQL even more awkward; Appendix A | Section 2 EngineTabs mysql and postgresql, with links to the plan reference |
| Predicate information has great impact as the system grows; not only data volume but access rate grows; another scalability parameter | Section 2, closing paragraph |
| Figure 3.4: response time vs concurrent queries (0 to 25), data volume fixed at largest section; last point of 3.2 = first point here | Section 3 and Figure 3.3 (static table) |
| Dashed line SCALE_SLOW: up to 32 s at 25 concurrent; 30 times the no-load time; even a full production copy in dev does not reproduce background load | Section 3 |
| Solid line SCALE_FAST, no filter predicates: well under 2 s at 25 concurrent | Section 3 |
| Note: careful plan inspection yields more confidence than superficial benchmarks; full stress test worthwhile but costly | Section 4 Callout and prose |
| Suspicious response times taken lightly expecting "more powerful production hardware"; usually the other way: production infrastructure more complex, accumulates latencies; even production-equivalent test infrastructure differs under background load; next section: not reasonable to expect faster responses from bigger hardware | Section 5 |
| Links: "Latency: Security vs. Performance"; James Golick "We are experiencing too much load. Let's add a new server" | Section 5 Callout "Further reading" |

## Response Time, Throughput and Horizontal Scalability ← https://use-the-index-luke.com/sql/testing-scalability/response-time-throughput-scaling-horizontal

Lesson: `src/content/lessons/testing-scalability/response-time-throughput-scaling-horizontal.mdx`

| Original heading / point | Where it lives |
| --- | --- |
| Bigger hardware not always faster but handles more load; wider highway vs faster car; more lanes do not let you drive faster; more hardware does not automatically fix slow SQL | Opening paragraph |
| 1990s: single-core CPU power rose rapidly, response time issues disappeared on new hardware; car models twice as fast every year; single-core hit the wall in the early 2000s; vendors went multi-core; concurrent tasks but no gain for one task; performance has more than one dimension | Section 1 |
| Horizontal scaling: more servers process more requests, do not improve one query; efficient search tree needed even in CouchDB and MongoDB (links) | Section 1 and 2 |
| Important: proper indexing is the best way to reduce response time, relational and non-relational | Section 2 Callout "important" |
| Proper indexing exploits logarithmic scalability of the B-tree; usually sloppy; chart from data volume lesson shows the effect | Section 2 |
| Figure 3.5 response time by data volume (same chart) | Figure 3.4 (ScaleChart) |
| Difference stunning; hardly possible to compensate with hardware; even if possible, questionable whether best solution | Section 2, after figure |
| NoSQL claims to solve performance via horizontal scalability; mostly writes; eventual consistency; SQL strict consistency slows writes but does not necessarily imply bad throughput | Section 3 |
| Sidebar: strict consistency requires synchronous coordination of writes; adds latency; reduces availability (members must be available) | Section 3 Callout, paragraph 1 |
| Distributed SQL database confused with shared-storage clusters or master-slave replication; more like a web shop integrated with an ERP system; two-phase commit (2PC); global all-or-nothing transactions; only possible if all members available; reduces availability | Section 3 Callout, paragraph 2 |
| More nodes, more trouble; almost impossible beyond a few nodes; dropping strict consistency solves availability and response time; consistency re-established after writing to a subset; conflicts when two nodes accept contradictory changes cannot be prevented; consistency eventually reached by handling conflicts; consistency = same data, not necessarily correct data; Brewer's CAP theorem (Consistency, Availability, Partition tolerance) | Section 3 Callout, paragraph 3 |
| More hardware typically does not improve response time; may be slower from complexity and latency; no network latency when app and DB share a machine but uncommon in production; dedicated hardware; firewall between app server and DB often doubles network latency; complexity accumulates latency; production slower than the cheap desktop | Section 4 |
| Disk seek time: HDD needs a few milliseconds to position; four times for a four-level B-tree, a few dozen milliseconds; half an eternity for a computer but below perception when done once; hundreds or thousands of seeks per statement, especially joins; caching reduces it dramatically; SSD decreases seek time by an order of magnitude; joins still suspected of being slow; next chapter | Section 5 |
| Sidebar SSD and caching: no moving parts; seek time an order of magnitude faster; enterprise storage around 2010; cost and limited lifetime kept them out of databases; databases cache frequently accessed data in memory, especially root nodes; frequently used indexes fully cached so a lookup triggers no seek | Section 5 Callout "Solid state disks and caching" |
| Factbox: two dimensions (response time, throughput); more hardware typically does not improve response time; proper indexing is the best way | Section 5 Callout "Facts to keep"; also KeyIdea in section 1 |
| Links: setup description (system load), NoSQL / eventual consistency / CAP at Wikipedia, B-tree indexes in CouchDB and MongoDB, "Choosing NoSQL For The Right Reason" | Section 5 Callout "Further reading"; CouchDB and MongoDB links also in section 2 |

## New files (no original)

- `src/content/lessons/anatomy/practice.mdx` (kind practice, order 4): four TryIt exercises; all plan regexes verified against `scripts/check-playgrounds.mjs` output.
- `src/content/lessons/anatomy/unit-check.mdx` (kind quiz, order 5): six Check questions.
- `src/content/lessons/testing-scalability/practice.mdx` (kind practice, order 4): three TryIt exercises.
- `src/content/lessons/testing-scalability/unit-check.mdx` (kind quiz, order 5): five Check questions.

## Figure numbering after this pass

Unit 1: 1.1 LeafChain and 1.2 static table (the-leaf-nodes); 1.3 LeafChain, 1.4 BTree structure, 1.5 BTree search, 1.6 Insert (the-tree); 1.7 IndexAccess unique, 1.8 IndexAccess range (slow-indexes).
Unit 3: 3.1 static table and 3.2 ScaleChart (data-volume); 3.3 static table (system-load); 3.4 ScaleChart (response-time).
