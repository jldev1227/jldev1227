# Claude instructions — comic portfolio

The site is a comic page: two landings in the same ink — the personal cover and
one case file per project.

## Read before editing

Read `AGENTS.md`, the approved mockup (`mockups/jldev-comic-page-ux.html`), and
the matching project skills before changing the experience.

## Current product decision

The site is a landing page and a set of case files, and nothing wraps them:

1. `/[lang]` is the personal landing — hero, origin, powers, the projects as
   worlds, method, contact. Each world links to its case file.
2. `/[lang]/missions/<slug>` is that case file, read as its own landing page:
   cover plate beside the story, then challenge, approach, architecture,
   modules, before → after, stack, log, outcome, and the next case file.

There is no grid archive, no modal `<dialog>` and no `/[lang]/missions` index.

**The page-turn reader was removed by product decision.** A case file used to
be an issue read in `ComicReader`, with eight panels sized against a reader page
— which is exactly why its narrative never had room. Do not reintroduce it, and
do not add `page-flip`, `react-pageflip`, Turn.js or any equivalent: the case
file is a document, and the width belongs to the content. `git log` has the
reader if it is ever wanted back.

## Case-file boundaries

- One route owns the layout, the way `/[lang]` owns its own: the sections, the
  section ids and their styles live in
  `src/routes/[lang=lang]/missions/[slug]/+page.svelte`.
- A section id is a public hash. `#challenge`, `#log`, `#before-after` and the
  rest must keep naming their section even if the order on the page changes.
- Sections print only what a project can fill — no empty band, and no anchor in
  the rail that leads nowhere.
- Each case file is painted in its own product's palette (`--jl-world-*`), and
  two of the six worlds are painted on cream: never mix `--jl-world-base` into a
  ground that paper-white type has to sit on.
- The log section prints `src/lib/content/project-history.ts`, generated from
  the local repositories by `scripts/project-history.mjs`. Regenerate it; never
  edit the numbers.
- Do not redirect mission URLs, and do not reintroduce an index above them.
- Do not introduce Three.js or Rive: neither has a product use any more.
- Do not add Anime.js unless a measured transition cannot be expressed with CSS
  or Web Animations.

## Non-negotiable behavior

- Every visible string lives in bilingual content or `src/lib/i18n/ui.ts`.
- Ordinary project anchors remain in server HTML: both landings must read with
  JavaScript switched off.
- The cover plate is portrait. Give it a column of its own or a band of its
  own — never a letterbox crop under a scrim heavy enough to read type through.
- Give an overlay hero an explicit grid row: a 1024 × 1536 plate will otherwise
  size the row itself and carry the headline out through the hero's clip.
- The URL uses `#<section>`; a case file opens at the section its hash names,
  below the sticky rail rather than under it.
- Do not deploy unless the user explicitly requests it.

## Completion gate

From `web/`, run `npm run test:unit`, `npm run test:e2e`, `npm run check`,
`npm run lint`, and `npm run build`. Inspect `/en` and `/es` in desktop and
mobile layouts, a case file included — and check a case file painted on cream
(`formarpro`, `gym-vancouver`) as well as one painted on ink.
