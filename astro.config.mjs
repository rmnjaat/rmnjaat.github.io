import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import pagefind from 'astro-pagefind';
import sitemap from '@astrojs/sitemap';
import { satteri } from '@astrojs/markdown-satteri';
import { wrapTables } from './src/lib/hast-wrap-tables.mjs';

export default defineConfig({
  site: 'https://rmnjaat.github.io',
  integrations: [mdx(), react(), sitemap(), pagefind()],
  compressHTML: true,
  prefetch: { defaultStrategy: 'hover' },
  build: { format: 'directory' },
  markdown: {
    processor: satteri({ hastPlugins: [wrapTables()], features: { smartPunctuation: false } }),
    smartypants: false,
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark-dimmed' },
      defaultColor: false,
    },
  },
});
