# Claude instructions — experimental comic reader

This branch explores turning the JLDEV portfolio from a long page decorated as
a comic into a portfolio that behaves like a physical comic.

## Read before editing

Read these files in order:

1. `AGENTS.md`
2. `web/docs/comic-reader/README.md`
3. `web/src/lib/components/comic-reader/README.md`
4. `mockups/jldev-comic-page-ux.html`
5. The matching project skills in `.claude/skills/`

Use `comic-panel` for any panel or `comic.css` work, `bilingual-copy` for every
new visible string, and `ship-web` for the final verification gate.

## Objective

Build a progressive prototype with exactly three reader states:

1. a closed cover;
2. the cover opening;
3. one readable interior spread.

The prototype must prove the physical interaction before the rest of the home
page is converted. Do not migrate every section in the first pass.

## Implementation order

1. Preserve the existing `/en`, `/es`, and mission routes.
2. Model the reader states and content before adding animation.
3. Build a static closed cover and one static spread with semantic HTML.
4. Make the full document usable without JavaScript as a vertical comic page.
5. Add keyboard controls and explicit previous/next/open buttons.
6. Add the cover opening with CSS 3D transforms.
7. Add pointer or swipe progress for the page gesture.
8. Only then add Anime.js for timeline coordination, using modular imports.
9. Verify reduced motion, both locales, desktop, tablet, and mobile.

## Non-negotiable constraints

- Do not use generated or stock artwork as the final cover illustration.
- Remove the current digital-workbench hero from the experimental cover; keep
  the asset in the repository until the prototype is accepted.
- Build the cover primarily from semantic HTML, CSS, and hand-authored SVG.
- Do not install `page-flip`, GSAP, Three.js, Lottie, or a smooth-scroll
  library for the first prototype.
- Do not let an animation library own layout, routing, or reader state.
- Do not clone interactive page content to produce the flip effect.
- Do not trap scrolling. Mobile uses one page at a time, not a squeezed
  two-page spread.
- Do not hide essential navigation inside gesture-only controls.
- Do not hard-code visible English or Spanish strings in a Svelte component.
- Keep all current metadata, canonical URLs, hreflang links, and prerendered
  routes working.
- Respect `prefers-reduced-motion`; the complete experience must remain usable
  when motion is effectively disabled.

## Definition of the first successful milestone

- The cover clearly reads as a printed comic issue, not a technology poster.
- Opening it reveals one two-page spread on desktop and one page on mobile.
- Open, previous, and next controls work with pointer and keyboard.
- Swipe is an enhancement, never the only control.
- Focus remains visible and moves to the newly revealed page when appropriate.
- The URL can preserve the current reader position without creating new
  prerendered routes.
- With JavaScript disabled, the content is still present in document order.
- English and Spanish layouts have been visually inspected.
- `npm run check`, `npm run lint`, and `npm run build` pass from `web/`.

Do not deploy this branch unless the user explicitly requests it.
