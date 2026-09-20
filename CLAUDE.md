# Claude instructions — experimental comic reader

Each project case file is an issue of a comic, read on its own route, with
page-turn physics written in this repository rather than taken from a library.

## Read before editing

Read `AGENTS.md`, `web/docs/comic-reader/README.md`,
`web/src/lib/components/comic-reader/README.md`, the approved mockup, and the
matching project skills before changing the experience.

## Current product decision

The site is a landing page and a set of case files, and nothing wraps the
reader:

1. `/[lang]` is the personal landing — hero, origin, powers, the projects as
   worlds, method, contact. Each world links to its case file.
2. `/[lang]/missions/<slug>` is that case file, read in `ComicReader` on the
   page itself.

There is no grid archive, no modal `<dialog>`, no `browse` state and no
`/[lang]/missions` index — they were removed by product decision, together with
the box, the first-person hands, the pickup animation, the `inspect` state and
the front/back selector that preceded them. Every outer shell around the reader
added a second state machine to keep in sync with the URL, and none earned it.
A case file is a route.

## Reader boundaries

- There is no page-turn library. `ComicReader.svelte` and `reader-state.ts`
  are the physics: sheets as leaves with two faces, a `preserve-3d` turn, a
  pointer drag with velocity, the paper ease, reduced motion, reflow between
  spread and single page. Do not add `page-flip`, `react-pageflip`, Turn.js
  or any equivalent; improve the reader instead.
- Svelte owns state, localized content, routes, hashes, focus, and links. The
  reader reports the leading page (`onpagechange`) and is told where to open
  (`initialPage`); on a mission route the reader owns the hash.
- A case file's log page and the introductory calendar print
  `src/lib/content/project-history.ts`, generated from the local repositories
  by `scripts/project-history.mjs`. Regenerate it; never edit the numbers.
- `ComicReader` serves the canonical mission routes; do not redirect mission
  URLs, and do not reintroduce an index above them.
- Do not introduce Three.js or Rive: neither has a product use any more.
- Do not add Anime.js unless a measured transition cannot be expressed with CSS
  or Web Animations.

## Non-negotiable behavior

- Every visible string lives in bilingual content or `src/lib/i18n/ui.ts`.
- Ordinary project anchors remain in server HTML before enhancement.
- Drag or swipe anywhere on the book, mobile touch, ArrowLeft/ArrowRight,
  Home, End, browser Back and reduced motion must work.
- The URL uses `#<section>`; a case file opens at the page its hash names.
- Project links inside live pages remain clickable and must not trigger a turn.
- Do not deploy unless the user explicitly requests it.

## Completion gate

From `web/`, run `npm run test:unit`, `npm run test:e2e`, `npm run check`,
`npm run lint`, and `npm run build`. Inspect `/en` and `/es` in desktop and
mobile layouts, including an actual drag across a page of a case file.
