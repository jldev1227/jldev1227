# Comic reader component contract

The progressive comic-reader presentation. The reader stays independent from
page copy and project data.

## Module shape

```text
comic-reader/
  ComicReader.svelte       state owner and progressive enhancement boundary
  ComicCover.svelte        semantic cover and open control
  ComicPager.svelte        explicit controls and page status
  reader-state.ts          pure state transitions
  index.ts
  README.md
```

Smaller than originally proposed, on purpose. `ComicBook`, `ComicSpread`,
`ComicPage` and `PageTurn` were not written: one cover and one spread never
needed them, and CSS grid places the sheet and the pages without a component
per surface. `reader-motion.ts` waits for Anime.js, which phase 2 does not use.
Add them when a real second spread proves they earn their keep.

## State contract

Reader state must be representable without DOM references:

```ts
type ReaderState =
	| { mode: 'closed' }
	| { mode: 'open'; page: number }
	| {
			mode: 'turning';
			from: number;
			to: number;
			direction: 'forward' | 'backward';
			progress: number;
	  };
```

A _position_ is a page index: `0` is the cover, `1…pageCount` the interior
pages, and a position always names the **leading** page of the view. The field
is `page` rather than `spread` because a spread is a viewport fact, not a
reading position: the same position is two pages on desktop and one on mobile,
and `reflow()` re-anchors it when that changes. `progress` stays in the union
for the phase-3 drag; phase 2 only ever settles at the ends.

State transitions belong in pure TypeScript. Animation completion may dispatch
an event, but it must not become the source of truth.

## Content contract

- Receive localized content and project data through typed props.
- Do not import English or Spanish prose into low-level motion components.
- Put page copy in `src/lib/content/site.ts`.
- Put controls, status, and accessibility labels in `src/lib/i18n/ui.ts`.
- Preserve normal anchors for mission links.
- A page is a semantic `section` or `article`, not a bitmap or canvas snapshot.

## Progressive enhancement

Server-render all meaningful pages in reading order. Before hydration, render a
vertical comic that exposes the full content. Apply the closed-book and stacked
page presentation only after the client confirms the reader can initialize.

Never depend on duplicate DOM trees for desktop and mobile. Prefer CSS layout
and a single semantic source. If a temporary visual sheet is required during a
turn, mark it inert and hidden from accessibility APIs.

## Interaction contract

The comic has no navigation chrome and draws no control at all. That does not
make the reader gesture-only: the keyboard path and the assistive path are
always present, they are simply not painted.

- An explicit button on the cover opens the issue.
- Everything after that is the gesture: drag or swipe anywhere on the book.
- Nothing marks where to drag. What the book does show is the stack of page
  edges on either side, thick with what is left to read and with what has been
  read — so the end of the issue is visible before it arrives. The folio prints
  `n / total` on every page for the same reason.
- `ComicPager` holds the real previous/next controls and the reading position.
  It is positioned off the page and reveals itself on `:focus-within`, the way
  the skip link does. It is never `display: none` — it owns the live region.
- `ArrowLeft` and `ArrowRight` turn pages when focus is within the reader and no
  text input owns the event. `Home` returns to the cover; `End` reaches the
  final spread.
- A swipe anywhere on the book works too, but only claims the gesture once it is
  clearly horizontal. `touch-action: pan-y` leaves vertical scrolling alone.
- A drag under 35% of a page, and slower than a flick, falls back to the spread
  it started on.
- A drag that moved swallows the click it would have ended in, so swiping across
  a case file does not open it.
- Repeated input during a turn is ignored, deterministically.
- A turn always ends. The frame loop is backed by a timeout, because a tab that
  stops painting stops `requestAnimationFrame` with it and the book must not be
  left half-way through a page.

## Motion implementation

A dragged sheet needs a position every frame, so from phase 3 on the turn's
`progress` is owned by one `requestAnimationFrame` loop and written to the
reader root as custom properties. CSS still owns every visual state and the
reduced-motion variant; it just reads the angle instead of timing it. The
`cubic-bezier(0.45, 0, 0.2, 1)` curve is evaluated in TypeScript so a released
drag finishes on the same curve a key press does.

Use custom properties for values shared between CSS and JavaScript:

```css
:root {
	--jl-motion-cover: 800ms;
	--jl-motion-page: 580ms;
	--jl-motion-panel: 220ms;
	--jl-paper-ease: cubic-bezier(0.45, 0, 0.2, 1);
}
```

If Anime.js is introduced:

- initialize it only in the browser;
- scope selectors to the component root;
- use modular imports;
- revert animations and listeners on component teardown;
- never animate reading content in a way that changes its accessible order;
- keep the reduced-motion path independent of timeline completion callbacks.

## Visual constraints

- Reuse the palette and typography tokens in `comic.css`.
- A sheet may clip decorative ink but must not clip copy.
- Reserve caption space in normal flow, especially in Spanish.
- Preserve the outlined display typography treatment for accented capitals.
- Cover decoration should be authored HTML/CSS/SVG, not the existing
  `/art/hero-digital-workbench.webp`.

## Verification checklist

- `/en` and `/es`, desktop full-page capture.
- `/en` and `/es`, mobile viewport capture.
- Keyboard-only open, next, previous, and mission navigation.
- Screen-reader names for every reader control and current-page status.
- Reduced-motion emulation.
- JavaScript-disabled reading order.
- Rapid repeated input and interrupted drag behavior.
- Resize while the cover is open and while a spread is visible.
- `npm run check && npm run lint && npm run build` from `web/`.
