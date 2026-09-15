# Immersive comic archive plan

Status: direct box-to-reader flow and StPageFlip integration implemented on
`codex/experimental-comic-reader`; Rive remains pending. The former inspector
and its Three.js proposal were removed from scope.

The homepage becomes a first-person portfolio scene. The visitor arrives at a
private comic archive: a library surrounds a wooden table, an open cardboard box
sits on the table, and every project is filed as a collectible comic. Selecting
one makes a pair of hands reach for it, lift it into view, and open the existing
project reader.

This experience changes only `/[lang]`. Existing mission URLs remain canonical,
prerendered, directly accessible, and are never redirected into the homepage.

## Visual source and asset manifest

Generated masters and optimized runtime files live in
`web/static/art/library-experience/`. See its `README.md` for dimensions, layer
roles, prompts, and transparency notes.

```text
library-room-v1.webp       full-viewport room and empty table
comic-box-v1.webp          transparent box filled with selectable comic slots
hands-idle-v1.webp         transparent fallback/key pose
hands-reaching-v1.webp     transparent fallback/key pose
hands-holding-v1.webp      transparent fallback/key pose
```

The PNG siblings are source-quality masters. Svelte should serve the WebP files.
The hand poses are also art direction for the Rive animator; crossfading the
three bitmaps is an acceptable first fallback, but it is not the final Rive
animation.

## Two application states

```text
┌────────────────────────┐     select comic     ┌──────────────────────┐
│ browse                 │ ───────────────────> │ read                 │
│ library + table + box  │ <───── return ────── │ cover + HTML pages   │
└────────────────────────┘                       └──────────────────────┘
```

Only `browse` and `read` are top-level states. Hover, focus, reaching, lifting,
and page-turning are presentation phases.

```ts
type ExperienceState =
	{ mode: 'browse'; focusedIssueId?: string } | { mode: 'read'; issueId: string; page: number };
```

Allowed transitions:

- `browse → read(0)` after a comic is chosen and the pickup resolves;
- `read(n) → read(n±1)` when StPageFlip completes a page turn;
- `read → browse` when it is returned to the box or Escape is pressed.

No room walking, free camera, inventory, game engine, arbitrary book rotation,
physics simulation, or fourth cinematic state is required.

## Scene composition

The homepage uses layered DOM rather than one flattened hero image:

```text
z=0   library-room-v1.webp       cover background, center center
z=1   light/vignette layer       CSS gradients; optional restrained parallax
z=2   table interaction plane    semantic issue controls and hit areas
z=3   comic-box-v1.webp          pointer-events: none presentation layer
z=4   project comic covers       real buttons/links aligned with box slots
z=5   selected comic             FLIP transform from slot to center
z=6   Rive hands                 transparent, pointer-events: none
z=7   return control             accessible HTML
z=8   reader                     full viewport while mode === 'read'
```

The box bitmap must not contain the actual interactive controls. Each visible
comic gets a real HTML button or anchor positioned over its slot, with an
accessible project title, visible focus treatment, and a cover/spine generated
from existing project data. CSS perspective supplies the depth. This keeps the
portfolio index usable without WebGL and prevents a canvas from owning content.

Desktop uses the full illustrated room. On narrow screens, crop around the
table and box with `object-position: center`; reduce the number of simultaneously
visible spines or use a horizontally scrollable tray. Never scale the complete
room down until the comics become untappable.

## Interaction sequence

### 0. Arrival — 0 to 600 ms

- Paint the room immediately with reserved aspect ratio and dominant-color
  fallback.
- Fade the box and comic controls in after the background is decoded.
- Hands remain low in `Idle`; no instruction modal interrupts the scene.
- A localized one-line prompt and focusable issue names provide discoverability.

### 1. Browse — persistent

- Hover/focus lifts one comic spine 8–14 px, brightens its edge, and slightly
  separates its neighbours.
- Pointer parallax may move the room no more than 6 px and the box no more than
  10 px. Disable it for reduced motion, touch, and keyboard input.
- Arrow keys move through comics; Enter or Space selects; ordinary project links
  remain available in the no-JavaScript rendering.

### 2. Pickup — 650–850 ms

- Lock new selections while the transition is committed.
- Fire Rive input `take`; the hands move from `Idle` through `Reaching`.
- Animate the selected comic from its measured DOM rectangle toward the center
  with a FLIP transform. Do not animate layout properties.
- Dim the room slightly and soften the unselected comics without hiding them
  from the eventual return path.
- Finish directly in application state `read(0)`.
- A timeout and reduced-motion path must always settle the state.

### 3. Open and read — immediate after pickup

- Mount `StPageFlipReader.svelte` with the live DOM cover already at page zero;
  never rasterize project copy into a canvas.
- Dragging a corner immediately opens the cover. No front/back/read controls sit
  between selection and reading.
- Send focus to the issue heading/current page and announce the selected issue.
- Existing project copy, links, localization, page hashes, and accessible
  previous/next controls remain the source of truth.

### 4. Return — immediate

- Destroy StPageFlip, restore the room, and return focus to the comic that
  launched the experience.
- Browser Back and Escape perform the same reversal: `read → browse`.

## Component boundaries

```text
ComicArchiveExperience.svelte
├── experience-state.ts           pure reducer, history and transition lock
├── LibraryScene.svelte           background layers and responsive framing
├── ComicBoxSelector.svelte       issue collection, focus and slot geometry
│   └── ComicBoxVolume.svelte     one semantic comic control
├── FirstPersonHands.svelte       Rive adapter plus raster fallback
├── StPageFlipReader.svelte       homepage HTML page-turn adapter
└── ComicReader.svelte            required canonical-route fallback
```

`ComicArchiveExperience.svelte` owns the selected issue, application state,
history, focus, transition lock, and reduced-motion choice. Rive and StPageFlip
may emit events but never choose routes or states.

## Rive hand machine

The final `.riv` file is authored in the Rive editor using the generated PNG
poses as visual references, not as three full-screen frames.

| Item             | Required value                |
| ---------------- | ----------------------------- |
| File             | `/rive/comic-hands.riv`       |
| Artboard         | `ComicHands`                  |
| State machine    | `Hands`                       |
| States           | `Idle`, `Reaching`, `Holding` |
| Triggers         | `take`, `release`             |
| Boolean          | `holding`                     |
| Optional numbers | `targetX`, `targetY` (`0…1`)  |

Recommended rig:

- separate left/right forearm, palm, and finger groups;
- mesh deformation around knuckles and wrists;
- one reach animation that can target the selected slot;
- holding loop with almost imperceptible breathing, disabled for reduced motion;
- release transition that can be played in reverse or independently;
- transparent artboard, no pointer listeners, and no embedded text.

Start with `@rive-app/canvas-lite`. Dynamically import it only after the static
scene is usable, pause while offscreen, and clean up the instance on teardown.
If the asset is missing or incompatible, crossfade the three optimized hand
poses or omit the hands without blocking selection.

## StPageFlip compatibility gate

The compatibility gate is accepted for the homepage adapter. Tests confirm that
`loadFromHTML()` preserves Svelte links and handlers, does not create duplicate
focus targets/IDs in portrait mode, survives locale and issue remounts, coexists
with mobile vertical scrolling, and fully cleans up through `destroy()`.
`ComicReader.svelte` remains the canonical mission-route fallback.

## Route policy

- Apply the archive only to `/en` and `/es`.
- Do not redirect `/[lang]/missions` or `/[lang]/missions/[slug]`.
- Do not change their canonical, hreflang, sitemap, or prerender behavior.
- A comic may open inside the homepage experience, but its normal route remains
  an ordinary link and independently usable document.
- Transient mode, selected issue, face, and page may live in `history.state` or
  a hash; they are not new canonical pages.

## Loading and performance

- Serve WebP runtime assets and reserve their intrinsic dimensions.
- Preload only the room; lazy-load box and idle hands after first paint.
- Preload reaching/holding poses on focus or pointer intent.
- Lazy-load Rive and StPageFlip only when their stage needs them.
- Dispose Rive and page-flip instances, observers,
  timers, and event listeners on every state exit.
- Under reduced motion, use immediate state changes or short opacity fades.

## Delivery milestones for Claude

### 0. Asset and layout proof — done

Compose the generated room, box, project covers, and idle hands on an isolated
development harness. Prove desktop and mobile crop, focus targets, Spanish
labels, and alignment without installing animation libraries.

### 1. Two-state shell — done

Implement the pure reducer and tests for `browse` and `read`. Add
transition locking, focus restoration, reduced motion, and Back-button behavior.

### 2. Box selector — done

Create semantic comic controls over the box slots, keyboard navigation, hover
lift, and the no-JavaScript project list. Reuse existing project content.

### 3. Pickup sequence — done

Implement the measured FLIP movement and raster hand fallback. Validate rapid
input, resize, cancellation, and guaranteed settlement.

### 4. Inspector — removed by product decision

Selection now enters the reader directly. Do not add Three.js or restore the
front/back controls.

### 5. Rive hands

Build the runtime adapter, then integrate the approved `.riv` file when its
artboard and inputs match this contract. Do not fabricate completion if the Rive
source asset has not been authored.

### 6. Reader integration — done

StPageFlip is isolated behind `StPageFlipReader.svelte`, with real HTML pages,
corner drag, shadows, portrait/spread layout, URL events, and teardown. The old
reader remains on canonical mission routes.

### 7. Choreography and QA

Tune timings, parallax, lighting, performance, and transitions. Verify `/en` and
`/es` on desktop/mobile, keyboard, reduced motion, JavaScript disabled, direct
mission URLs, browser history, and cleanup. Finish with `npm run check`,
`npm run lint`, and `npm run build`. Do not deploy.

## Implementation record

- `/en` and `/es` now render `ComicExperience` as the homepage.
- The box contains the introductory issue plus the five existing project
  issues. Each remains an ordinary canonical anchor before enhancement.
- `experience-state.ts` owns exactly `browse` and `read`; its unit
  suite covers valid transitions, invalid events, URL restoration, and Back.
- `ComicBoxSelector.svelte` provides roving keyboard focus, wrapping arrow-key
  navigation, visible focus, and measured comic rectangles.
- Selection uses a transform-only FLIP overlay, a transition lock, and a timeout
  guard. Reduced motion settles immediately.
- `FirstPersonHands.svelte` crossfades the generated idle, reaching, and holding
  assets behind a Rive-compatible `pose` interface.
- Selection mounts `StPageFlipReader.svelte` directly on the live cover. It
  lazy-loads `page-flip`, passes semantic HTML through `loadFromHTML()`, and
  destroys the instance on return.
- Only “Return it to the box” remains as persistent reader chrome; pages use
  corner drag, touch, or arrow keys.
- Standalone mission routes retain the existing `ComicReader.svelte` fallback.
- Visual inspection completed for English and Spanish at 1440×900 and 390×844.
  Pickup, corner drag, page curvature, focus restoration, and arrow-key movement
  were exercised in the browser.
- Verification passed: 8 reducer tests; 23 end-to-end tests with one intentional
  single-page skip; `npm run check`, `npm run lint`, and `npm run build` passed.
