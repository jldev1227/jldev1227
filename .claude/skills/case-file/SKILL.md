---
name: case-file
description: Add, rename, remove or write a project case file (one of the five worlds) on the JLDEV site. Use when touching projects.ts, a /missions route, a case study's challenge/approach/outcome copy, or the mission panels on the home page.
---

# Case file

Projects are **case files** in a comic: `Case file 01 · Platform`. Six of them
exist, defined once in `web/src/lib/content/projects.ts` and rendered in two
places — the worlds on the home page, and the case file's own landing page at
`/[lang]/missions/[slug]`, laid out in that route's `+page.svelte`: a
cover-plate hero, then challenge, approach, architecture, modules,
before → after, stack, log, outcome, and a link to the next case file.

A section's id is a public hash (`#challenge`, `#log`, `#before-after`…), so it
keeps naming its section even when the order on the page changes. Sections
print only what a project can fill: leave a field empty and both the band and
its anchor in the rail disappear.

## Adding one

Append to `projects` in `projects.ts`. Every field is required except `link`:

```ts
{
	slug: 'kebab-case',          // becomes /en/missions/kebab-case — never change it later
	number: '06',
	kicker: { en: 'Case file 06 · Ops', es: 'Expediente 06 · Operaciones' },
	title: 'PROJECT NAME',       // rendered uppercase; not translated
	tagline: { en: '…', es: '…' },
	stack: ['NestJS', 'Postgres'],             // the core; names as `tech-marks` knows them
	libraries: ['Prisma', 'Zod', 'Resend'],    // the wider toolkit, read off the repo's manifest
	modules: [{ name: { en, es }, detail: { en, es } }],   // one per area of the app
	accent: 'blue',              // red | blue | yellow | ink
	palette: {                   // the product's own colours, sampled from its shot
		base: '#071826',           // every ground on the case page
		accent: '#d2a53f',
		on: 'paper',               // what reads on `base`: paper | ink
		onAccent: 'ink'
	},
	challenge: { en: '…', es: '…' },
	approach: { en: '…', es: '…' },
	outcome: { en: '…', es: '…' }
}
```

Then two generated files:

- **The log.** Add the case file's repositories to `PROJECTS` in
  `web/scripts/project-history.mjs` and run `node scripts/project-history.mjs`.
  It reads the local Git history and the tree and writes
  `src/lib/content/project-history.ts`: first and last commit, commits per
  month, repositories, and what the tree holds. Aggregates only — no code,
  path or message leaves the machine. The log page and the calendar in the
  introductory issue print from it; never type those numbers by hand.
- **The marks.** Every `stack` and `libraries` entry should have a mark. Add
  the technology to `MAP` in `web/scripts/tech-marks.mjs` when Simple Icons
  has it, or to `HAND` with a drawn glyph when it is a concept without a
  brand, and run `node scripts/tech-marks.mjs`. A wordmark with neither falls
  back to a monogram on its own.

The route's `entries()` generator reads `projects`, so the new page
prerenders, and the sitemap picks it up.

**A cream world needs checking.** `base` decides every ground on the page, and
two of the six worlds are cream. Anything that mixes `--jl-world-base` into a
dark ground turns pale there, under paper-white type — check a new light
palette against the hero, the log band and the outcome band.

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
languages and check the hero, the rail and every band. `npm run test:e2e`
covers the page's own contract: the narrative in the server HTML, every rail
anchor landing on a real section, and the plate keeping its size.
