# 1227jl.dev

The JLDEV portfolio, built as a **comic page**: sequential panels with ink
borders, halftone dots, caption boxes and speech bubbles. Projects are case
files. English and Spanish are equals.

Deployed at **<https://1227jl.dev>**.

## Stack

SvelteKit 2 · Svelte 5 (runes) · TypeScript · `@sveltejs/adapter-vercel`
· Vercel Analytics and Speed Insights · self-hosted Anton and Inter.

No CSS framework and no i18n runtime — both are a hand-rolled ~200 lines, which
is smaller than the config either would need.

## Running it

```bash
npm install
npm run dev
```

| Script            |                                        |
| ----------------- | -------------------------------------- |
| `npm run dev`     | dev server                             |
| `npm run build`   | production build (prerenders 14 pages) |
| `npm run preview` | serve the production build             |
| `npm run check`   | `svelte-check`                         |
| `npm run lint`    | Prettier + ESLint                      |
| `npm run format`  | write Prettier                         |

## How it is put together

```
src/
  app.html                app shell; %jl.lang% is filled in per request
  hooks.server.ts         locale negotiation: cookie → Accept-Language
  params/lang.ts          route matcher — only `en` and `es` match
  lib/
    styles/comic.css      tokens + the panel/caption/bubble primitives
    i18n/                 locales, UI dictionary, path builders
    content/site.ts       every page string, bilingual
    content/projects.ts   the five case files
    components/           Panel · Caption · Bubble · ArtSlot · Masthead · Seo
  routes/
    +page.server.ts       `/` → `/en` or `/es` — the only dynamic route
    [lang=lang]/          the comic page, missions index, case files
    sitemap.xml, robots.txt
```

### Languages

`/` negotiates from a remembered cookie, then `Accept-Language`, and redirects
to `/en` or `/es`. Everything below that is prerendered under a locale prefix,
with `hreflang` alternates and an `x-default` on every page.

Copy never lives in a component: page strings are `{ en, es }` values in
`src/lib/content/`, chrome strings are keys in `src/lib/i18n/ui.ts`. A missing
translation fails the type check.

### Paths

Two families, and they are not interchangeable. `homePath` / `missionsPath` /
`missionPath` wrap SvelteKit's `resolve()` — typed route ids, for `href`
attributes, relative during SSR. `path()` returns a root-absolute path — for
canonical, hreflang, JSON-LD and the sitemap. See `src/lib/i18n/paths.ts`.

### SEO

Per-locale titles and descriptions, canonical, `hreflang` + `x-default`, Open
Graph and Twitter cards, a JSON-LD `@graph` (Person, WebSite, and a ProfilePage
or CreativeWork per route), a generated sitemap with `xhtml:link` alternates, and
`robots.txt`.

## Still to do

- Commissioned artwork for the portrait and case-file `ArtSlot`s → `static/art/`.
- Real narratives for the case files — `projects.ts` still carries `TODO:`
  placeholders for challenge/approach/outcome.
- Confirm the LinkedIn URL in `src/lib/content/site.ts`.

## Deployment

Vercel project with _Root Directory_ set to `web`. `main` deploys to production;
pull requests get preview URLs. `vercel.json` sets security headers, immutable
caching for hashed assets, and redirects for the unprefixed `/missions`.

Agent instructions live in [`../AGENTS.md`](../AGENTS.md); project skills in
`../.claude/skills/`.
