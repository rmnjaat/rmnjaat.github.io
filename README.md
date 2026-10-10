# Use The Index, Luke — learning edition

A course site that teaches SQL indexing to developers. It follows the structure of Markus Winand's book *SQL Performance Explained* (free web edition at [use-the-index-luke.com](https://use-the-index-luke.com)), rewritten in original text and extended with step-through figures, try-it exercises on an in-browser database, practice sets, unit checks and progress tracking.

Live site: https://ramanjangu1.github.io/

## Stack

- [Astro](https://astro.build) 7, fully static. Content is MDX under `src/content/`.
- React islands only where the page needs state: figures, the quiz component, the playground.
- [sql.js](https://sql.js.org): SQLite compiled to WebAssembly. Every try-it block gets a fresh in-memory database loaded from `public/schema.sql`. Nothing is sent to a server.
- [Pagefind](https://pagefind.app) search, built at build time.
- Self-hosted fonts (Geist, Geist Mono). Light theme only.
- Reader state (chosen engine, finished items, try-it task ticks, last visited) lives in `localStorage`.

## Develop

```sh
npm install
npm run dev          # http://localhost:4321
npm run build        # static site in dist/
npm run preview      # serve dist/ on 127.0.0.1:4321
```

Node 22.12 or newer.

## Checks

```sh
npm run lint:content        # frontmatter, lesson shape, component imports, client directives
npm run check:playgrounds   # runs every TryIt/Playground query against SQLite and prints the plan
npm run build && npm run check:links   # every internal link resolves
node scripts/qa-viewports.mjs --shots=reports/shots   # responsive audit at 360/390/768/1024/1440px
```

The deploy workflow runs the build and the link check on every push to `main`.

## Content

- `src/content/lessons/<unit>/…mdx`: lessons, practice sets (`kind: practice`) and unit checks (`kind: quiz`). Unit metadata lives in `src/lib/site.ts`.
- `src/content/reference/`: execution plans per engine, myth directory, glossary, example schema, about, the placement quiz, and a site map that maps every page of the original site to its counterpart here.
- `CONTENT_GUIDE.md`: the lesson shape, frontmatter, components and writing rules. Read it before adding a lesson.
- `reports/coverage-*.md`: per-page coverage audits against the original site.

File path = URL: `lessons/where-clause/functions/over-indexing.mdx` is served at `/sql/where-clause/functions/over-indexing/`.

## Layout of the code

```
src/
  content.config.ts        collections and frontmatter schemas
  lib/site.ts              units, reference sections, engines, course facts
  lib/nav.ts               ordered items, labels, prev/next
  lib/prefs.ts             localStorage preferences and progress
  layouts/Base.astro       head, header, footer
  layouts/Lesson.astro     tree · article · outline; before-you-start box, summary, mark complete, pager
  components/ui/           Header, ChapterNav, Callout, KeyIdea, Figure, EngineTabs, TryIt, Check
  components/figures/      Stepper (figure frame) + BTree, LeafChain, IndexAccess, ConcatIndex,
                           Joins, Pagination, ScaleChart, Insert, Playground
  pages/                   index (course home), sql/[...slug], sql/index, practice, playground, 404
  styles/global.css        tokens, typography, every component style
scripts/                   lint-content, check-playgrounds, check-links, qa-viewports
public/schema.sql          example schema + data for the playground
```

## Deploy

GitHub Actions (`.github/workflows/deploy.yml`) builds on push to `main` and publishes `dist/` to GitHub Pages. The repository is the account's root Pages site, so links are root-relative. To host under a sub-path instead, set `base` in `astro.config.mjs` and prefix internal links with `import.meta.env.BASE_URL`.

## Credit

Curriculum and worked examples follow *SQL Performance Explained* by Markus Winand. The author's text is not reproduced; every page links to the original it covers.
