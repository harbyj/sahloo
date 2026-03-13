import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://sahloo.com',
  integrations: [sitemap()],
  i18n: {
    defaultLocale: 'ar',
    locales: ['ar', 'en'],
    routing: { prefixDefaultLocale: false },
  },
});
