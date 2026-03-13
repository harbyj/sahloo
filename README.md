# Sahloo سهلو — Astro Migration

Sahloo is a bilingual Arabic/English utility tools platform (sahloo.com) — free calculators and converters targeting MENA users. This repo is the **Astro-migrated version** of the original static HTML site.

---

## Stack

| Layer | Technology |
|-------|------------|
| Framework | [Astro](https://astro.build) |
| Languages | TypeScript (frontmatter) + vanilla JS (tool logic) |
| Styling | Vanilla CSS (`main.min.css` — unchanged from v2) |
| i18n | AR (default, RTL, `/`) + EN (`/en/`) |
| Sitemap | `@astrojs/sitemap` (auto-generated) |
| Deployment | Static output (`npm run build`) |

---

## Project Structure

```
sahloo/
├── astro.config.mjs
├── public/
│   ├── css/
│   │   └── main.min.css          # compiled CSS (do not edit directly)
│   ├── js/
│   │   └── main.min.js           # global JS: theme, drawer, search, filters
│   ├── img/
│   ├── favicon.svg
│   ├── manifest.json
│   └── robots.txt
└── src/
    ├── layouts/
    │   └── Layout.astro           # single shared layout for every page
    ├── components/
    │   ├── Header.astro
    │   ├── MobileDrawer.astro
    │   └── Footer.astro
    └── pages/
        ├── index.astro            # AR homepage  →  /
        ├── 404.astro
        ├── privacy/index.astro
        ├── contact/index.astro
        ├── support/index.astro
        ├── tools/
        │   ├── index.astro        # AR tools listing  →  /tools/
        │   ├── age-calculator.astro
        │   ├── bmi-calculator.astro
        │   ├── bill-splitter.astro
        │   ├── currency-converter.astro
        │   ├── date-difference.astro
        │   ├── days-until.astro
        │   ├── discount-calculator.astro
        │   ├── gpa-calculator.astro
        │   ├── loan-calculator.astro
        │   ├── percentage-calculator.astro
        │   ├── unit-converter.astro
        │   └── zakat-calculator.astro
        └── en/
            ├── index.astro        # EN homepage  →  /en/
            ├── 404.astro
            ├── privacy/index.astro
            ├── contact/index.astro
            ├── support/index.astro
            └── tools/
                ├── index.astro    # EN tools listing  →  /en/tools/
                └── [12 EN tool pages]
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Install

```bash
npm install
```

### Dev server

```bash
npm run dev
# → http://localhost:4321/
```

### Build

```bash
npm run build
# output in dist/
```

### Preview build

```bash
npm run preview
```

---

## Layout System

Every page uses a single `Layout.astro`. It accepts these props:

```ts
interface Props {
  lang: 'ar' | 'en';
  title: string;
  description: string;
  canonical: string;
  ogLocale?: string;                    // defaults to ar_SA / en_US
  schemaJson?: Record<string, unknown>; // optional page-level JSON-LD
}
```

The layout handles:
- `<html lang dir>` with correct RTL/LTR based on `lang`
- Full `<head>`: meta, OG, Twitter, hreflang alternates, canonical
- PWA manifest + theme color
- Google Fonts (Tajawal + Inter, async loaded)
- Theme flash prevention (`is:inline` script reads `localStorage`)
- `<Header>`, `<MobileDrawer>`, `<Footer>` with `lang` prop passed through
- `main.min.css` and `main.min.js` loaded globally

### Usage

```astro
---
import Layout from '../layouts/Layout.astro';
---
<Layout
  lang="ar"
  title="حاسبة العمر | Sahloo"
  description="احسب عمرك بالسنوات والأشهر والأيام"
  canonical="https://sahloo.com/tools/age-calculator/"
>
  <main id="main">
    <!-- page content -->
  </main>

  <script is:inline>
    // tool-specific JS — must use is:inline to keep functions global
    function calcAge() { ... }
  </script>
</Layout>
```

---

## i18n Routing

| Language | Root | Tools |
|----------|------|-------|
| Arabic (default) | `/` | `/tools/[tool]/` |
| English | `/en/` | `/en/tools/[tool]/` |

The `lang` prop on `Layout` drives everything — Header, Drawer, and Footer all receive it and build their links using a simple prefix variable:

```ts
const p = lang === 'en' ? '/en' : '';
// then: href={`${p}/tools/`}
```

`hreflang` alternates are auto-computed in Layout from the canonical URL:

```ts
const altHref = lang === 'ar'
  ? canonical.replace('https://sahloo.com/', 'https://sahloo.com/en/')
  : canonical.replace('https://sahloo.com/en/', 'https://sahloo.com/');
```

---

## Tool Pages

Each tool page follows this pattern:

```astro
---
import Layout from '../../../layouts/Layout.astro';
---
<Layout lang="ar" title="..." description="..." canonical="...">

  <main id="main" class="tool-page">
    <!-- breadcrumb, hero, calc-card, info-section, related tools -->
  </main>

  <script is:inline>
    // calculator logic — global functions called by onclick="..."
    function calcAge() { ... }
  </script>

</Layout>
```

> **Important:** Tool scripts must use `<script is:inline>`. Without it, Astro bundles them as ES modules, scoping all functions and breaking `onclick="fnName()"` references in the HTML.

---

## Adding a New Tool

1. Create `src/pages/tools/[tool-slug].astro` (AR version)
2. Create `src/pages/en/tools/[tool-slug].astro` (EN version)
3. Add the tool card to:
   - `src/pages/index.astro` (AR home grid)
   - `src/pages/en/index.astro` (EN home grid)
   - `src/pages/tools/index.astro` (AR tools listing)
   - `src/pages/en/tools/index.astro` (EN tools listing)
   - `src/components/MobileDrawer.astro` (both languages)
   - `src/components/Footer.astro` (both languages)

---

## Sitemap

Handled automatically by `@astrojs/sitemap`. After `npm run build`, a sitemap index is generated at `/sitemap-index.xml` covering all 43 pages. No manual `sitemap.xml` needed.

Config in `astro.config.mjs`:

```js
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
```

---

## Theme System

Theme is stored in `localStorage` under the key `sahloo_theme` (`'light'` | `'dark'` | `'auto'`). Applied as a `data-theme` attribute on `<html>`.

The `is:inline` script in `Layout.astro` reads it before paint to prevent flash:

```js
(function () {
  var t = localStorage.getItem('sahloo_theme') || 'light';
  document.documentElement.setAttribute('data-theme', t);
})();
```

Toggling is handled by `main.min.js` (`.theme-btn` click handler).

---

## CSS & JS

Both `main.min.css` and `main.min.js` live in `public/` and are loaded as-is. Do not move them into `src/` — Astro does not process files in `public/`.

If you need to modify them, edit the source files and re-minify:

```bash
# example with esbuild
esbuild src/css/main.css --bundle --minify --outfile=public/css/main.min.css
esbuild src/js/main.js   --bundle --minify --outfile=public/js/main.min.js
```

---

## Key Decisions

| Decision | Reason |
|----------|--------|
| Single `Layout.astro` (not `BaseLayout`) | Simpler, one source of truth for `<head>` |
| `is:inline` on all tool scripts | Tool functions are called via `onclick=""` — must be global |
| AR as default locale (no `/ar/` prefix) | Preserves existing URLs, better for SEO |
| `main.js` kept in `public/` unchanged | Zero-risk migration, no rewrite needed |
| Tool pages as flat `.astro` files (not `[slug].astro`) | Explicit control per page, no dynamic routing needed |

---

## Tools Reference

| Slug | AR Name | EN Name |
|------|---------|---------|
| `age-calculator` | حساب العمر | Age Calculator |
| `bmi-calculator` | مؤشر كتلة الجسم | BMI Calculator |
| `bill-splitter` | تقسيم الفاتورة | Bill Splitter |
| `currency-converter` | تحويل العملات | Currency Converter |
| `date-difference` | الفرق بين تاريخين | Date Difference |
| `days-until` | كم باقي على | Days Until |
| `discount-calculator` | حاسبة الخصم | Discount Calculator |
| `gpa-calculator` | المعدل التراكمي | GPA Calculator |
| `loan-calculator` | حاسبة القروض | Loan Calculator |
| `percentage-calculator` | حاسبة النسبة المئوية | Percentage Calculator |
| `unit-converter` | تحويل الوحدات | Unit Converter |
| `zakat-calculator` | حاسبة الزكاة | Zakat Calculator |

---

## License

© 2026 Sahloo سهلو. All rights reserved.