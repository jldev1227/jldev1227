---
name: comic-panel
description: Add, restyle or debug a panel on the JLDEV comic page, or change anything in comic.css. Use when working on layout, the halftone/ink treatment, captions, speech bubbles, display type, or when a heading overlaps a caption or gets clipped.
---

# Comic panel

The site is a comic page. A section is a **panel**: ink border, halftone dots,
a caption box in a corner, sometimes a speech bubble. `mockups/jldev-comic-page-ux.html`
is the approved reference — read it before inventing a new treatment.

## Anatomy

```svelte
<div class="jl-grid two-up">
  <Panel class="my-panel">
    <Caption>Narration, upper-left corner.</Caption>
    <Bubble class="my-bubble">Dialogue.</Bubble>
    <div class="my-copy">
      <h2 class="jl-display">Heading</h2>
      <p>Body.</p>
    </div>
  </Panel>
</div>
```

- `.jl-grid` is the row. Give it a class and set `grid-template-columns` there.
- `Panel` renders `.jl-panel`: ink border, halftone `::before`, `overflow: hidden`,
  and a fractional rotation that alternates on even children.
- `Caption` is the rectangular narration box, absolutely placed top-left.
- `Bubble` is the rounded balloon with a skewed tail; position it yourself.
- `ArtSlot` is the illustration placeholder. Keep it until real art exists.

## The two bugs this design keeps producing

**Heading slides under the caption.** The caption is absolutely positioned in
the corner and the panel clips overflow, so a bottom-anchored copy block that
grows upward disappears behind it. Spanish runs roughly a line longer than
English, so it fails there first.

Do not do this:

```css
.my-copy { position: absolute; bottom: 42px; }   /* grows up, into the caption */
```

Do this instead — the copy flows, and top padding reserves the caption's corner:

```css
.my-copy {
	display: flex;
	flex-direction: column;
	justify-content: end;
	min-height: 340px;
	padding: 100px 36px 36px;
}
```

**Accents vanish from display headings.** `.jl-display` uses `line-height: 0.88`,
while Anton draws Ó/Ú/Á about 1.1em above the baseline — the accent lands inside
the line above and, being the same colour, disappears. The base class already
solves this with `paint-order: stroke fill` and an em-based
`-webkit-text-stroke`. When you put ink-coloured display type on a light panel,
switch the stroke so it still separates:

```css
.my-yellow-panel { --jl-display-stroke: var(--jl-white); }
```

`comic.css` already does this for `.jl-panel.years` and any
`.jl-panel[data-accent='yellow']`.

## Scoped styles and child components

`Panel` is a component, so its class lives outside the page's style scope. A
selector that *starts* at the panel needs `:global`:

```css
:global(.jl-panel.my-panel) { background: var(--jl-navy); }
:global(.jl-panel.my-panel) h2 { color: var(--jl-yellow); }
.my-copy h2 { /* fine — .my-copy is in this component */ }
```

`svelte-check` reports unused selectors; treat that warning as a real error.

## Tokens

Colours, gutters, borders, fonts and the halftone are all custom properties on
`:root` in `src/lib/styles/comic.css`. Use them; never hard-code `#d91d3b`.
Panel accents go through `data-accent="red|blue|yellow|ink"`.

## Verify

Type-checking cannot see a clipped heading. Build a full-page screenshot and
look at it, in **both** languages:

```bash
cd web && npm run check && npm run lint
```

Then start the dev server (`.claude/launch.json`) and capture `/en` and `/es`
full-page plus a mobile width. Confirm no text crosses a panel edge:

```js
// in the page console
document.querySelectorAll('.jl-panel').forEach(p => {
  const pr = p.getBoundingClientRect();
  p.querySelectorAll('h1,h2,h3,p,small,strong,span,li,a').forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.height && (r.bottom > pr.bottom + 1 || r.right > pr.right + 1 || r.top < pr.top - 1))
      console.warn('overflows', el);
  });
});
```
