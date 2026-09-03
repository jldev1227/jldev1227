# AGENTS.md

Instructions for AI agents working in this repository. Humans: see
[`README.md`](README.md) for the GitHub profile and [`web/README.md`](web/README.md)
for the site.

## What this repository is

Two things share one repo:

1. **The GitHub profile.** `README.md` and `assets/` render on
   <https://github.com/jldev1227>. The comic banners and footer are hand-authored
   SVG. `.github/workflows/contribution-snake.yml` regenerates the contribution
   animation into the `output` branch.
2. **The website.** `web/` holds the SvelteKit site deployed to
   **<https://1227jl.dev>**. Vercel's *Root Directory* is set to `web`.

Never move `README.md` out of the root — GitHub only renders a profile README
from there.

## The site in one paragraph

A **comic page**: the portfolio is laid out as sequential panels with ink
borders, halftone dots, caption boxes and speech bubbles. Every page is a page of
a comic, every project is a *case file*. The design derives from
`mockups/jldev-comic-page-ux.html`, which is the approved direction and is kept
as the reference — read it before changing the visual language.

## Layout

```
web/src/
  app.html                     %jl.lang% is filled in by hooks.server.ts
  hooks.server.ts              locale negotiation (cookie → Accept-Language)
  params/lang.ts               route matcher: only `en` and `es` match
  lib/
    styles/comic.css           design tokens + panel/caption/bubble primitives
    i18n/                      locales, UI dictionary, path builders
    content/site.ts            all page copy, bilingual
    content/projects.ts        the five case files
    components/                Panel, Caption, Bubble, ArtSlot, Masthead, Seo…
  routes/
    +page.server.ts            `/` → `/en` or `/es`, the only dynamic route
    [lang=lang]/               everything else, prerendered
```

## Rules that matter

**Copy never lives in a component.** Every string is either a `Localized`
(`{ en, es }`) value in `src/lib/content/`, or a UI key in
`src/lib/i18n/ui.ts`. A hard-coded English string in a `.svelte` file is a bug —
it silently ships untranslated.

**Two path families, not interchangeable.** `homePath` / `missionsPath` /
`missionPath` wrap SvelteKit's `resolve()` and are for `href` attributes; they
return *relative* paths during SSR. `path()` returns a root-absolute path and is
for metadata — canonical, hreflang, JSON-LD, sitemap. Swapping them produces
URLs like `/en/./es`. See `src/lib/i18n/paths.ts`.

**Panels clip their contents.** `.jl-panel` sets `overflow: hidden` so the
halftone and diagonal fills stay inside the frame. Anything absolutely
positioned — a caption in the corner, a decorative ring — is clipped on purpose.
Copy must *flow*, with top padding reserving the caption's corner; do not
bottom-anchor a text block with `position: absolute`, because Spanish runs about
a line longer than English and slides under the caption.

**Display type is outlined.** `.jl-display` carries an em-based
`-webkit-text-stroke`, because Anton's accents (Ó, Ú, Á) sit above the 0.88
line-height and disappear into the line above without it. On light panels set
`--jl-display-stroke: var(--jl-white)`.

**Prerendering is the default.** New routes under `[lang=lang]` need an
`entries()` generator, since nothing links to them from a prerenderable page.
`hooks.server.ts` guards cookie writes with `building`.

**Illustration is not done.** Portrait and cover art are placeholders
(`ArtSlot`, `static/art/`, `static/og/`). Leave the slots in place; do not
substitute stock or generated imagery.

## Skills

Project skills live in `.claude/skills/`. Load the one that matches the task:

| Skill | Use it when |
|---|---|
| `comic-panel` | Adding or restyling a panel, or touching `comic.css` |
| `case-file` | Adding, renaming or writing a project case file |
| `bilingual-copy` | Adding or editing any user-visible string |
| `ship-web` | Before a deploy, or when verifying a change end-to-end |

## Before you call a change done

```bash
cd web && npm run check && npm run lint && npm run build
```

Then look at the page. `.claude/launch.json` starts the dev server; a full-page
screenshot catches the clipping and overlap bugs that type-checking cannot.
Check **both languages** — Spanish is the longer one and breaks layouts first.

## Deployment

Vercel project, Root Directory `web`, framework preset SvelteKit,
`@sveltejs/adapter-vercel`. Production domain `1227jl.dev`. Analytics and Speed
Insights are injected in `src/routes/+layout.svelte` and only report in
production.
