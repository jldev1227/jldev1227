# Claude instructions — experimental comic library

This branch turns the JLDEV homepage into a comic archive: the collection laid
out as a grid of covers, each issue opening in a modal reader whose page-turn
physics are written in this repository, not taken from a library.

## Read before editing

Read `AGENTS.md`, `web/docs/comic-reader/README.md`,
`web/docs/comic-reader/LIBRARY-INTERACTION.md`,
`web/src/lib/components/comic-reader/README.md`, the approved mockup, and the
matching project skills before changing the experience.

## Current product decision

The homepage has exactly two application states:

1. `browse` — choose an issue from the grid of covers;
2. `read` — the selected cover and its live HTML pages are inside
   `ComicReader`, in a native modal `<dialog>` over the grid.

The grid is four covers across on a desk, stepping down to two on a phone. The
first issue is the only illustrated one and is about the author — origin,
powers, stack, contact. Every other issue is a project case file printing the
same six pages as its canonical route, through `CaseFilePage.svelte`.

There is no box, no first-person hands, no pickup animation, no `inspect`
state, no front/back selector and no “read this issue” action. After selecting
a cover the visitor drags the page corners immediately. The only persistent
experience button is the localized close. Arrow keys remain as an accessible
alternative.

## Reader boundaries

- There is no page-turn library. `ComicReader.svelte` and `reader-state.ts`
  are the physics: sheets as leaves with two faces, a `preserve-3d` turn, a
  pointer drag with velocity, the paper ease, reduced motion, reflow between
  spread and single page. Do not add `page-flip`, `react-pageflip`, Turn.js
  or any equivalent; improve the reader instead.
- Svelte owns state, localized content, routes, hashes, focus, and links. The
  reader reports the leading page (`onpagechange`) and is told where to open
  (`initialPage`); on the home page the experience owns the hash
  (`manageHash={false}`), on a mission route the reader does.
- The modal measures the room and gives the reader the width at which the
  book fits in both dimensions; the reader never scrolls inside the dialog.
- The modal is the browser's `<dialog>` opened with `showModal()`: do not
  reimplement the focus trap, the inert background or Escape. Opening and
  closing are a View Transition: the chosen cover carries the
  `issue-cover` name on the grid and then on the book, one element at a time.
- A case file's log page and the introductory calendar print
  `src/lib/content/project-history.ts`, generated from the local repositories
  by `scripts/project-history.mjs`. Regenerate it; never edit the numbers.
- The same `ComicReader` serves canonical mission routes; do not redirect
  mission URLs.
- Do not introduce Three.js or Rive: neither has a product use any more.
- Do not add Anime.js unless a measured transition cannot be expressed with CSS
  or Web Animations.

## Non-negotiable behavior

- Every visible string lives in bilingual content or `src/lib/i18n/ui.ts`.
- Ordinary project anchors remain in server HTML before enhancement.
- Drag or swipe anywhere on the book, mobile touch, ArrowLeft/ArrowRight,
  Home, End, Escape, browser Back, reduced motion, and focus restoration to
  the cover must work.
- The URL uses `#issue/pN`; old `#issue` and `#issue/back` links open the cover.
- Project links inside live pages remain clickable and must not trigger a turn.
- Do not deploy unless the user explicitly requests it.

## Completion gate

From `web/`, run `npm run test:unit`, `npm run test:e2e`, `npm run check`,
`npm run lint`, and `npm run build`. Inspect `/en` and `/es` in desktop and
mobile layouts, including an actual drag across a page and focus returning to
the cover when the issue closes.
