export interface Chapter {
  slug: string;
  n: number;
  title: string;
  tagline: string;
  intro: string;
}

export const chapters: Chapter[] = [
  { slug: 'preface', n: 0, title: 'Preface', tagline: 'Why indexing is a developer task',
    intro: 'Indexes are the most effective tuning tool a developer has, and the one most often left to someone else.' },
  { slug: 'anatomy', n: 1, title: 'Anatomy of an Index', tagline: 'What an index looks like',
    intro: '"An index makes the query fast" is true and not enough. An index is a separate, redundant structure that must stay sorted while the table changes underneath it, and it does that with two things: a doubly linked list of leaf nodes and a balanced search tree on top. Those two structures explain most of what a database does fast and slow.' },
  { slug: 'where-clause', n: 2, title: 'The Where Clause', tagline: 'Indexing to make searches fast',
    intro: 'The where clause decides which rows the database has to find. This is the longest chapter because it is where most performance is won or lost.' },
  { slug: 'testing-scalability', n: 3, title: 'Testing and Scalability', tagline: 'Why it was fast in development',
    intro: 'Scalability is usually taken to mean more hardware. In the broader sense it is how performance responds when the environment changes, and hardware is only one parameter. This chapter measures what data volume and concurrent load do to a sloppily indexed query, and why adding servers does not bring the response time back.' },
  { slug: 'join', n: 4, title: 'The Join Operation', tagline: 'Not slow if done right',
    intro: 'A join gathers rows that a normalized schema spread over several tables, and gathering scattered rows is work that waits on disk latency. Indexing is the remedy, but the right index depends on which of the three algorithms, nested loops, hash join or sort-merge, the optimizer picks. ORM tools make it easy to pick the wrong one by accident.' },
  { slug: 'clustering', n: 5, title: 'Clustering Data', tagline: 'Reducing table access',
    intro: 'A data cluster, not a computer cluster, is data that is read together and stored together, so that fewer blocks are read. The row is the smallest cluster, and an index clusters rows with similar values because its leaves are sorted. That is the second power of indexing, after the B-tree traversal.' },
  { slug: 'sorting-grouping', n: 6, title: 'Sorting and Grouping', tagline: 'Pipelined order by',
    intro: 'A sort is expensive not only in CPU but in memory: it must read all its input before it can emit the first row, so it can never be pipelined. An index already stores the data in sorted order, and reading it the right way makes the sort disappear and lets the first rows out before the last ones are read, which is the third power of indexing. The optimizer still weighs that against a full scan with a sort, which can win for large results.' },
  { slug: 'partial-results', n: 7, title: 'Partial Results', tagline: 'Paging efficiently',
    intro: 'Most screens show the first few rows and let the user page or scroll for more. Sorting every row to find the newest ten is where such queries fall over; a pipelined ORDER BY has almost no startup cost and can stop after a handful of rows. The syntax for saying so differs from engine to engine, but underneath they all execute these queries in much the same way.' },
  { slug: 'dml', n: 8, title: 'Insert, Delete and Update', tagline: 'What indexes cost on writes',
    intro: 'Insert, delete and update make up the data manipulation language, and indexes mostly make them slower. An index is pure redundancy, a copy of data that is also in the table, and every write has to keep each copy consistent, so a statement that changes the table also changes every index holding the affected data. This unit measures that cost and shows where the where clause still helps.' },
];

export interface RefSection {
  slug: 'explain-plan' | 'myth-directory' | 'glossary' | 'example-schema' | 'about';
  title: string;
  tagline: string;
  intro: string;
}

export const referenceSections: RefSection[] = [
  { slug: 'explain-plan', title: 'Execution Plans', tagline: 'Getting and reading plans, per engine',
    intro: 'Before a database runs a statement, its optimizer compiles the SQL into an execution plan, the way a compiler turns source code into a program. That plan is the first thing to look at when a statement is slow, because it shows which indexes were used, in what order the tables were joined and where the time goes. One page per engine, plus Gupta SQLBase: how to get the plan, what the operations mean, and how to tell access predicates from filter predicates.' },
  { slug: 'myth-directory', title: 'Myth Directory', tagline: 'Common misbeliefs, debunked',
    intro: 'Advice that sounds right, gets repeated, and makes SQL slower.' },
  { slug: 'glossary', title: 'Glossary', tagline: 'Terms used throughout the book', intro: '' },
  { slug: 'example-schema', title: 'Example Schema', tagline: 'The tables every example uses', intro: '' },
  { slug: 'about', title: 'About', tagline: 'The book, the author, this site', intro: '' },
];

export interface Engine { id: string; label: string; short: string }
export const engines: Engine[] = [
  { id: 'postgresql', label: 'PostgreSQL', short: 'PG' },
  { id: 'mysql', label: 'MySQL', short: 'MySQL' },
  { id: 'oracle', label: 'Oracle', short: 'Oracle' },
  { id: 'sql-server', label: 'SQL Server', short: 'MSSQL' },
  { id: 'db2', label: 'Db2', short: 'Db2' },
  { id: 'sqlite', label: 'SQLite', short: 'SQLite' },
];

export const siteName = 'Use The Index, Luke';
export const siteTagline = 'SQL indexing for developers';
export const courseFacts = { level: 'Intermediate', levelNote: 'you write SQL already', hours: 'About 6 hours' };
export const outcomes = [
  'Read an execution plan and say whether an index helped',
  'Choose the column order of a multi-column index from the queries',
  'Fix the ways a where clause hides a column from its index',
  'Index for joins, sorting and paging, not only for lookups',
];
export const prereqs = [
  'You can write SELECT with WHERE, JOIN and ORDER BY',
  'You have a database you can run EXPLAIN on, or use the built-in playground',
  'No DBA experience needed',
];
