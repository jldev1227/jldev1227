---
name: ship-web
description: Verify and deploy the JLDEV site at 1227jl.dev. Use before a deploy, when checking a change end-to-end, or when debugging routing, locale negotiation, prerendering, SEO metadata or the Vercel configuration.
---

# Ship web

Everything runs from `web/`. Vercel's *Root Directory* is `web`.

## The gate

```bash
cd web && npm run check && npm run lint && npm run build
```

All three must be clean — `svelte-check` warnings included. An unused-selector
warning almost always means a rule is silently not applying because the element
lives inside a child component.

`npm run build` prints the prerendered pages. Expect **14 pages** plus
`sitemap.xml` and `robots.txt`: `/en`, `/es`, `/{en,es}/missions`, and five case
files per locale. A missing page means a route is lacking its `entries()`
generator.

## Look at it

Type-checking does not catch a heading clipped by a panel. Start the dev server
(`.claude/launch.json`, or `npm run dev`) and capture full pages:

```bash
CH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
"$CH" --headless --disable-gpu --hide-scrollbars --window-size=1280,2900 \
  --virtual-time-budget=4000 --screenshot=/tmp/es.png http://localhost:5173/es
```

Check **both** languages — Spanish is longer and breaks layouts first — plus a
narrow width. For mobile, use browser device emulation rather than a narrow
headless window: headless Chrome lays out at a desktop viewport and produces
false overflow.

## Smoke-test the routes

```bash
for u in / /en /es /en/missions /es/missions/segispro /sitemap.xml /robots.txt; do
  curl -s -o /dev/null -w "%{http_code} %{redirect_url} $u\n" \
    -H "Accept-Language: es-CO,es;q=0.9" "http://localhost:5173$u"
done
```

`/` must 307 to `/es` for a Spanish `Accept-Language` and `/en` for English —
that is the only dynamic route; everything else is static.

## Check the metadata

```bash
curl -s http://localhost:5173/es | grep -oE '<link rel="(canonical|alternate)"[^>]*>'
```

Canonical and hreflang must be **absolute** and must not contain `/./`. If they
do, a `resolve()`-based path builder was used where `path()` belongs — see
`src/lib/i18n/paths.ts`. Confirm the sitemap's namespaces stay on `http://`;
they are identifiers, not links.

## Deploy

Vercel picks up `main` automatically. Manually:

```bash
cd web && npx vercel deploy --prod
```

First-time setup: link the project, set Root Directory to `web`, add `1227jl.dev`
and `www.1227jl.dev` as domains, and point DNS at Vercel. Analytics and Speed
Insights need nothing beyond the injections already in
`src/routes/+layout.svelte`; they report only in production.
