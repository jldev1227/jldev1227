# Experimental comic reader

Status: phases 0–4 built. The `/[lang]/missions` archive lays the project
collection out as a grid of covers with this reader in a modal, described in
[`LIBRARY-INTERACTION.md`](LIBRARY-INTERACTION.md). No page-turn library is
involved anywhere.

Branch: `codex/experimental-comic-reader`

## Why this experiment exists

The current portfolio has a coherent comic vocabulary—ink borders, halftone,
captions, speech bubbles, and case files—but its interaction remains that of a
conventional long-form web page. The hero image also reads as a generic
technology poster instead of a scene with narrative purpose.

This experiment makes the comic the interaction model itself: visitors arrive
at a cover, open it, read spreads, turn pages, enter case files as chapters, and
finish on a back cover.

## Experience model

The reader below is the book everywhere. The collection entry on `/missions`
adds `browse → read` around it in a modal; an adapter for a page-turn library
was tried in between and removed, because the physics here proved the better
ones to keep.

```text
Closed cover
    -> opening gesture
Spread 01  page 1 origin          page 2 powers
    -> page turn
Spread 02  page 3 missions + 01   page 4 case files 02 and 03
    -> page turn
Spread 03  page 5 case files 04 and 05
           page 6 contact, the closing page
    -> case-file link
Existing /[lang]/missions/[slug] route
    -> browser back returns to the hash, which reopens the book there
```

Contact is the last interior page rather than a true back cover: a back cover
needs a second rotating sheet, and that waits for the drag work in phase 3.

The reader is progressive enhancement. Semantic content and ordinary links are
the source of truth; paper physics are a presentation layer.

## Cover direction

Treat the first screen as an actual issue cover:

- JLDEV as the publication masthead;
- issue number `#1227`, date, price mark, and Colombia-to-the-world stamp;
- the existing headline as the cover story;
- four-colour print palette, imperfect registration, worn paper, and ink;
- a strong diagonal composition made with HTML, CSS, and hand-authored SVG;
- a lifted corner and an explicit open control;
- no glowing monitor collage and no final generated or stock illustration.

A commissioned portrait or manually treated real photograph can be added after
the interaction and composition are accepted. Until then, typography and
graphic storytelling must carry the cover.

## Information architecture

The experiment changes presentation, not the public URL model:

- `/en` and `/es` are the personal, multiverse-style landing pages.
- `/[lang]/missions` is the complete cover archive and modal reader.
- `/[lang]/missions/[slug]` remains the canonical project route.
- A hash or `history.state` may preserve the open spread, but it must not create
  a second canonical URL for the same content.
- All current prerendering, metadata, and language switching stay intact.

## Responsive behavior

### Desktop

- A centered physical book with a visible spine.
- Closed cover, followed by two-page spreads.
- Previous and next zones outside the page content.
- Pointer drag may control the page-turn progress.

### Tablet

- Prefer a spread only while both pages remain comfortably readable.
- Fall back to the single-page model based on available inline size, not user
  agent detection.

### Mobile

- One page at a time.
- Explicit previous/next buttons plus optional swipe.
- No scroll lock and no miniature two-page book.
- The static fallback remains a normal vertical document.

## Motion language

Motion should communicate paper, reading order, and causality. Nothing moves
only to make the page feel busy.

| Event           | Target duration | Purpose                     |
| --------------- | --------------: | --------------------------- |
| Cover open      |      700–900 ms | Establish the physical book |
| Page turn       |      500–650 ms | Change reading position     |
| Panel reveal    |      180–260 ms | Guide reading order         |
| Bubble or stamp |      160–220 ms | Emphasize a narrative beat  |
| Hover response  |       80–140 ms | Confirm interactivity       |

Animate transforms and opacity wherever possible. Avoid large animated filters,
continuous background loops, and layout-triggering geometry.

## Technology decision for the current reader

Use native browser capabilities first:

- CSS perspective and 3D transforms for the cover and sheets;
- pseudo-elements for paper thickness, shade, and page edges;
- Pointer Events for mouse, pen, and touch gestures;
- Web Animations API for isolated effects;
- View Transitions for an optional enhancement between a mission panel and its
  existing case-file route.

Anime.js may be added after the static reader works. Limit it to timeline
coordination, staggered reveals, and mapping a drag gesture to visual progress.
Import only the modules used. Svelte owns state and lifecycle; CSS owns layout.

The implementation proved the interaction without a generic flipbook
dependency, and that is how it stays: a StPageFlip adapter, Rive hands and a
Three.js inspector were each tried or planned and removed. The current shape is
in [`LIBRARY-INTERACTION.md`](LIBRARY-INTERACTION.md).

## Delivery phases

### Phase 0 — storyboard — done

The cover carries the issue furniture and the cover story. Spread 01 is
`origin` (origin panel plus the portrait slot) and `powers` (the years panel
plus the four-power grid). Missions and contact stay below the reader as the
vertical comic page they already were.

### Phase 1 — static shell — done

Closed cover and one interior spread, semantic HTML, both locales, desktop and
mobile compositions checked with no panel overflow in either language.

### Phase 2 — physical opening — done

`reader-state.ts` owns the transitions; `ComicPager` and the cover's open
control drive them; `ArrowLeft` / `ArrowRight` / `Home` / `End` mirror them. The
cover opens on a CSS `rotateY` around the spine while the two-page frame slides
from the closed offset. Reduced motion settles the same states with the travel
removed. The reading position lives in the URL hash (`#origin`, `#powers`), so
a masthead link into a page opens the book at it.

### Phase 3 — direct manipulation — done

The gesture is now the navigation, and the comic carries no chrome at all: no
masthead, no footer, no pager bar. What is left on screen is the page itself.

- A drag or swipe anywhere on the book, which only claims the gesture once it is
  clearly horizontal — `touch-action: pan-y` leaves vertical scrolling to the
  browser. Nothing on screen marks where to grab.
- Commit at 35% of a page width, or on a flick faster than 0.45 px/ms. Below
  that the sheet falls back to where it started.
- A drag that moved swallows the click it would otherwise have ended in, so a
  swipe across a case file does not open it.
- The turn is backed by a timeout as well as the frame loop, so a tab that stops
  painting mid-gesture does not strand the book between pages.

The only indicator is the book itself: the stack of page edges either side of
the sheet, sized by how much of the issue is behind and ahead. It is full on the
right when the comic is closed and gone when the last page is open. The folio
prints `n / total` to say the same thing in words.

Anime.js was not added: a dragged sheet needs a position per frame, which is one
`requestAnimationFrame` loop and the `cubic-bezier(0.45, 0, 0.2, 1)` curve
evaluated in TypeScript. A timeline library would have owned the progress the
state machine already owns.

Because the chrome is gone, two things moved onto the comic itself: the language
switch is printed on the cover as an edition mark and repeated in the closing
page's colophon, and the colophon carries what the footer used to say. The
case-file routes keep their masthead and footer — they are ordinary documents.

### Phase 4 — narrative migration — done, and a collection

The site is a personal landing connected to a collection of six project comics.
`/[lang]` introduces Julian, his working principles and each project as its own
world. Every `/[lang]/missions/[slug]` is an issue of `JLDEV case files`, with
its own cover and eight pages built from the case content.

The index at `/[lang]/missions` is the full shelf. It progressively enhances
the six canonical links into a modal reader while keeping the masthead and
footer around the archive.

Case-file routes remain independent documents. The landing portals and archive
covers both keep ordinary anchors into them.

Every page in a spread shares one height, so a page holding less than its
neighbour grows its panels rather than trailing blank paper: `.stack` on a
case-file page, `.stack-intro` on the missions splash, `.fill` on the closing
page.

### Phase 5 — artwork and polish

Replace temporary graphic composition only with approved authored artwork.
Tune textures, shadows, transitions, performance, and production metadata.

### Phase 6 — library interaction — planned

Historical: this phase proposed a comic-box selector inside a library scene, a
front/back-only book inspector, first-person Rive hands and a StPageFlip
adapter. All four were removed; what shipped is the grid and the modal in
[`LIBRARY-INTERACTION.md`](LIBRARY-INTERACTION.md). It was specified separately
because it adds an outer experience state machine and three browser runtimes;
see [`LIBRARY-INTERACTION.md`](LIBRARY-INTERACTION.md).

## Acceptance criteria

- A first-time visitor understands how to open and navigate the comic.
- Every action is available without drag or swipe.
- Reading and navigation work with keyboard alone.
- Reduced motion removes spatial page turns without removing content.
- JavaScript failure reveals a usable document rather than a closed cover.
- The Spanish layout is treated as a primary layout, not a translation check.
- No animation causes clipped text, duplicate focus targets, or layout shift.
- Existing canonical, hreflang, sitemap, and mission routes do not regress.
- The final validation gate in `.claude/skills/ship-web/SKILL.md` passes.

## Out of scope for the original prototype

- Rewriting case-file narratives.
- Production deployment.
- Sound effects.
- A full-page scroll-controlled cinematic sequence.
- A realistic cloth/paper physics engine.
- Replacing every current artwork asset.
