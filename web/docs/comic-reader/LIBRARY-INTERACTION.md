# Comic archive plan

Status: grid archive with the modal reader implemented on
`codex/experimental-comic-reader`. The earlier room-and-box scene, the
first-person hands, the pickup animation, the Rive milestone, the Three.js
inspector and the StPageFlip adapter were all removed by product decision:
the page-turn physics are the site's own `ComicReader`.

The homepage is a comic archive: the collection laid out as a grid of covers
over one backdrop. The first issue is the only illustrated one and tells who is
writing — origin, how they work, the stack, and where to reach them. Every
other issue is a project case file. Selecting a cover opens that issue in a
modal reader, already on its cover, to be read page by page.

This experience changes only `/[lang]`. Existing mission URLs remain canonical,
prerendered, directly accessible, and are never redirected into the homepage.

## Asset manifest

`web/static/art/library-experience/` holds one file, `bg-room.jpg`, the blurred
backdrop the grid sits on. See its `README.md`. The cover illustration of the
introductory issue is `web/static/art/julian-cover-freelancer-v1.webp`; the
case-file covers are drawn from their own palettes in `projects.ts`.

## Two application states

```text
┌────────────────────────┐     select cover     ┌──────────────────────┐
│ browse                 │ ───────────────────> │ read                 │
│ the grid               │ <───── close ─────── │ modal: cover + pages │
└────────────────────────┘                       └──────────────────────┘
```

Only `browse` and `read` are top-level states. Hover, focus and page-turning
are presentation phases.

```ts
type ExperienceState =
	{ mode: 'browse'; focusedIssueId?: string } | { mode: 'read'; issueId: string; page: number };
```

Allowed transitions:

- `browse → read(0)` when a cover is chosen;
- `read(n) → read(m)` when the reader lands a turn, or a reflow moves the
  leading page;
- `read → browse` when the issue is closed, Escape is pressed, or the browser
  goes Back.

## The grid

The collection is markup with CSS on top: real DOM, ordinary links, a lift on
hover and focus. Keeping it as markup keeps the type sharp, the Spanish
reflowing on its own, and the no-JavaScript path a list of links to real
documents.

- Four covers across on a desk, three on a tablet, two on a phone. The count
  steps down with the width; the covers do not shrink until their type is
  unreadable.
- Each cover is an anchor to the issue's canonical route, with the localized
  `Open {title}` as its accessible name. Only once enhanced does the grid take
  the click over.
- One tab stop: roving tabindex, Left/Right walk the covers, Up/Down step a
  row by however many columns the grid currently has (measured, not assumed),
  Home and End reach the ends, nothing wraps. Enter is the anchor's own; Space
  is handled, because on a link it would scroll.
- The introductory cover prints its illustration under a masthead band and a
  story band, so the lettering has a field to sit on. The case-file covers use
  the accent-as-wedge rule the panels follow, so every mark clears AA.

## The modal reader

Reading happens in a native `<dialog>` opened with `showModal()`: the browser
supplies the top layer, the focus trap, the inert grid behind and the Escape
handling. The dialog fills the viewport — the book needs all of it on a phone —
and the backdrop is what says "modal": the grid still there behind it, dimmed
and blurred.

- The dialog exists only while an issue is open. The component's state is the
  single source of truth; the dialog's own `close` event feeds back into it, so
  Escape and the close button end in the same place.
- One history entry per level: opening pushes, a page turn replaces, and Back
  closes the issue and nothing finer.
- The book is `ComicReader.svelte`, the same hand-written sheets the mission
  routes turn: leaves with two faces in a `preserve-3d` context, a drag with
  velocity and a flick threshold, the paper ease for anything released or
  keyed, a timeout behind the frame loop so a hidden tab never leaves a sheet
  half-way, and a reflow between spread and single page. Its physics live in
  `reader-state.ts` and the component; there is no library to adapt.
- The reader is told where to open (`initialPage`) and reports the leading
  page (`onpagechange`); the experience owns the hash. Keys are taken from the
  window, since the dialog is modal and nothing else could want them, and
  focus lands on the book — the cover's open control, or the current page —
  as soon as it can be read.
- **Size.** The reader sizes pages from the width it is given and never looks
  at the height. The modal measures the room in both dimensions and gives the
  stage the width at which the book fits: two pages across when there is room
  for two comfortable ones (`SPREAD_MIN`), one otherwise, at `PAGE_RATIO`.
- **Centre.** A closed book is one page wide, so the reader slides its
  two-page frame by a quarter as the cover opens — the shift follows the
  cover's own angle, so it is never a separate movement.
- **Light.** A sheet standing between the pages is turned away from the lamp:
  each face carries an overlay whose opacity follows the sine of its angle,
  darkening towards the upright and clearing as it lies down. It is what tells
  the eye this is paper turning rather than a card sliding, and it costs the
  compositor an opacity.
- Closing returns focus to the cover the issue came from, whichever way it was
  closed.

## The issues

- The introductory issue: cover, origin, powers, stack, calendar, contact. The
  calendar lays every case file on one axis, first commit to last, from the
  generated project log.
- Each case file: cover plus the eight pages of its canonical route —
  challenge, log, stack, approach, architecture, modules, before/after,
  outcome — printed by `CaseFilePage.svelte`, which the route uses too, so the
  two cannot drift. The log is read from the repositories by
  `scripts/project-history.mjs` (commits per month, span, what the tree
  holds); the stack page prints the core and the wider toolkit with their
  marks, from Simple Icons or drawn in-house for concepts without a brand.
  The closing page offers the canonical route and the source link; the
  site's own navigation and the indicia appear only on the route.
- Opening and closing an issue is a View Transition: the chosen cover on the
  grid carries the `issue-cover` name while it is focused, the book's cover
  face carries it while the book is closed, and the browser morphs one into
  the other. Reduced motion and browsers without the API get the plain
  update.

## Route policy

- Apply the archive only to `/en` and `/es`.
- Do not redirect `/[lang]/missions` or `/[lang]/missions/[slug]`.
- Do not change their canonical, hreflang, sitemap, or prerender behavior.
- An issue may open inside the homepage, but its normal route remains an
  ordinary link and independently usable document.
- The hash holds only transient reading position: `#issue/pN`. Old `#issue`
  and `#issue/back` links open the cover.

## Verification

From `web/`: `npm run test:unit`, `npm run test:e2e`, `npm run check`,
`npm run lint`, `npm run build`. Inspect `/en` and `/es` in desktop and mobile
layouts, including an actual corner drag and focus returning to the cover on
close. Do not deploy.
