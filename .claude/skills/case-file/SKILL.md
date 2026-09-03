---
name: case-file
description: Add, rename, remove or write a project case file (one of the five worlds) on the JLDEV site. Use when touching projects.ts, a /missions route, a case study's challenge/approach/outcome copy, or the mission panels on the home page.
---

# Case file

Projects are **case files** in a comic: `Case file 01 · Platform`. Five of them
exist, defined once in `web/src/lib/content/projects.ts` and rendered in three
places — the home page mission panels, `/[lang]/missions`, and
`/[lang]/missions/[slug]`.

## Adding one

Append to `projects` in `projects.ts`. Every field is required except `link`:

```ts
{
	slug: 'kebab-case',          // becomes /en/missions/kebab-case — never change it later
	number: '06',
	kicker: { en: 'Case file 06 · Ops', es: 'Expediente 06 · Operaciones' },
	title: 'PROJECT NAME',       // rendered uppercase; not translated
	tagline: { en: '…', es: '…' },
	stack: ['NestJS', 'Postgres'],
	accent: 'blue',              // red | blue | yellow | ink
	challenge: { en: '…', es: '…' },
	approach: { en: '…', es: '…' },
	outcome: { en: '…', es: '…' }
}
```

Nothing else needs editing. The route's `entries()` generator reads `projects`,
so the new page prerenders, and the sitemap picks it up.

**The home page shows the first two large and the rest in a three-up row.** Order
in the array is the reading order of the comic page; a sixth project makes that
row four wide, so check the layout at 1280px and at 980px before shipping it.

## Writing the narrative

The three blocks are fixed: **challenge → approach → outcome**. They exist to
make private work legible without exposing it.

- Say what was operationally broken, what it cost, and for whom.
- Say what you decided and what you traded away — architecture, not a tool list.
- Say what changed, with a number where you have one.
- Never include client data, credentials, internal URLs, screenshots of private
  systems, or source. The case page prints a line saying the codebase is private;
  keep that true.
- Two to four sentences per block. These are panels, not documentation.

Several case files still carry `TODO:` placeholder copy. Replacing a placeholder
means writing **both** languages — see the `bilingual-copy` skill.

## Renaming or removing

A `slug` is a public URL. If one must change, keep the page reachable: add a
redirect in `web/vercel.json` from the old path in both locales.

## Verify

```bash
cd web && npm run check && npm run lint && npm run build
```

The build lists prerendered pages — confirm `en/missions/<slug>.html` and
`es/missions/<slug>.html` are both there, then load the case page in both
languages and check the hero and the three blocks.
