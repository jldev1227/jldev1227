# Claude instructions — experimental comic library

This branch turns the JLDEV homepage into a first-person comic archive: a
library, a table, and a cardboard box of project comics. Selecting an issue must
open it directly as a readable StPageFlip book.

## Read before editing

Read `AGENTS.md`, `web/docs/comic-reader/README.md`,
`web/docs/comic-reader/LIBRARY-INTERACTION.md`,
`web/src/lib/components/comic-reader/README.md`, the approved mockup, and the
matching project skills before changing the experience.

## Current product decision

The homepage has exactly two application states:

1. `browse` — choose an issue from the box;
2. `read` — the selected cover and its live HTML pages are already inside
   StPageFlip.

There is no `inspect` state, front/back selector, separate back-cover view, or
“read this issue” action. After pickup, the visitor drags the cover/page corners
immediately. The only persistent experience button is the localized return to
the box. Arrow keys remain as an accessible alternative.

## Library boundaries

- Use `page-flip`, never `react-pageflip`.
- `StPageFlipReader.svelte` is the DOM ownership boundary: dynamically import
  the library, pass it HTML pages, listen for page events, and destroy it on
  teardown.
- Svelte owns state, localized content, routes, hashes, focus, and links.
  StPageFlip owns only folding, shadows, orientation, and its internal wrappers.
- Keep `ComicReader.svelte` working on canonical mission routes as a fallback.
- The homepage alone uses StPageFlip; do not redirect mission URLs.
- Do not introduce Three.js: the removed inspector no longer has a product use.
- Rive remains optional until an approved `comic-hands.riv` asset exists. Keep
  the raster hand fallback working.
- Do not add Anime.js unless a measured transition cannot be expressed with CSS
  or Web Animations.

## Non-negotiable behavior

- Every visible string lives in bilingual content or `src/lib/i18n/ui.ts`.
- Ordinary project anchors remain in server HTML before enhancement.
- Corner drag, mobile touch, ArrowLeft/ArrowRight, Home, End, Escape, browser
  Back, reduced motion, and focus restoration must work.
- The URL uses `#issue/pN`; old `#issue` and `#issue/back` links open the cover.
- Project links inside live pages remain clickable and must not trigger a turn.
- Do not deploy unless the user explicitly requests it.

## Completion gate

From `web/`, run `npm run test:unit`, `npm run test:e2e`, `npm run check`,
`npm run lint`, and `npm run build`. Inspect `/en` and `/es` in desktop and
mobile layouts, including an actual corner drag and return-to-box focus.
