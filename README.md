# Use The Index, Luke: rewritten edition

A plain information site about SQL indexing for developers. It follows the structure of Markus Winand's book *SQL Performance Explained* (free online as [use-the-index-luke.com](https://use-the-index-luke.com)) chapter by chapter and page by page, rewritten in its own words with step-by-step figures and a per-engine execution plan appendix.

Live: https://rmnjaat.github.io/

## Stack

- [Astro](https://astro.build) 7 with MDX content collections. Every page is static HTML.
- React islands only for the figures (B-tree, leaf chain, index access, concatenated index, joins, pagination, insert, scale chart). Each has Step, Play and keyboard control.
- [Pagefind](https://pagefind.app) for search (`/` opens it).
- Geist and Geist Mono via Fontsource. Light theme only.

## Develop

```
npm install
npm run dev          # http://localhost:4321
npm run build        # static output in dist/
npm run preview
```

## Checks

```
npm run lint:content        # frontmatter, page shape, component imports, client directives, no course-era leftovers
npm run check:links         # every internal href in dist/ resolves
node scripts/qa-viewports.mjs   # headless Chrome audit at 360/390/768/1024/1440: overflow, overlap, tap targets, screenshots
```

Deploys to GitHub Pages on every push to `main` (`.github/workflows/deploy.yml`).

## Content

- `src/content/lessons/<chapter>/…mdx`: the chapters and their pages. Chapter metadata lives in `src/lib/site.ts`.
- `src/content/reference/`: execution plans per engine, myth directory, example schema, about, and a site map of every original URL.
- `CONTENT_GUIDE.md`: page shape, frontmatter, components and writing rules.

File path = URL: `lessons/where-clause/functions/over-indexing.mdx` is served at `/sql/where-clause/functions/over-indexing/`.

The original text is the author's copyright and is not reproduced. Every page covers the same information in its own wording and links to the page of the original it rewrites.

## Layout of the repo

```
src/
  content.config.ts        collections and schemas
  lib/site.ts              chapters, reference sections, engines
  lib/nav.ts               ordering, nav items, hrefs
  layouts/Base.astro       head, header, footer
  layouts/Lesson.astro     contents tree · article · on-page outline; summary, source credit, pager
  components/ui/           Header, ChapterNav, Contents, Callout, KeyIdea, Figure, EngineTabs
  components/figures/      Stepper (frame + controls), BTree, LeafChain, IndexAccess, ConcatIndex,
                           Joins, Pagination, ScaleChart, Insert
  pages/                   index (home with contents), sql/[...slug], sql/index, 404
  styles/global.css        tokens, type, layout, components, responsive rules
scripts/                   lint-content, check-links, qa-viewports, fix-mdx
```
