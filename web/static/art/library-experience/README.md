# Immersive library assets

Generated with the built-in ImageGen workflow for the experimental comic
archive. The supplied library and cardboard-box images were visual references;
these files are newly generated project assets.

## Files

| Runtime file             | Master                  | Dimensions | Alpha | Role                                     |
| ------------------------ | ----------------------- | ---------: | ----- | ---------------------------------------- |
| `library-room-v1.webp`   | `library-room-v1.png`   |   1672×941 | no    | Full viewport room and empty table       |
| `comic-box-v1.webp`      | `comic-box-v1.png`      |  1254×1254 | yes   | Box presentation layer                   |
| `hands-idle-v1.webp`     | `hands-idle-v1.png`     |  1536×1024 | yes   | Idle fallback and Rive pose reference    |
| `hands-reaching-v1.webp` | `hands-reaching-v1.png` |  1536×1024 | yes   | Pickup fallback and Rive pose reference  |
| `hands-holding-v1.webp`  | `hands-holding-v1.png`  |  1024×1536 | yes   | Inspect fallback and Rive pose reference |

Use the WebP files in the app. Keep PNG files as editing/Rive-art-direction
masters. Do not flatten the box, project covers, or hands into the room image.

## Alignment guidance

- Room: `object-fit: cover; object-position: center center`.
- Box: centered on the tabletop, approximately 38–48% of desktop viewport width.
- Project controls: positioned over the visible bagged-comic tabs; they remain
  the real interaction layer while `comic-box-v1.webp` ignores pointer events.
- Idle/reaching hands: full-width overlay anchored to the bottom viewport edge.
- Holding hands: center on the selected portrait comic and scale from its
  rendered height, not the viewport width.

All coordinates must be derived from one responsive scene container. Do not use
unrelated viewport pixel offsets for the box, covers, and hands.

## Final generation prompts

### Library room

Premium hand-painted graphic-novel library interior, first-person eye-level
view, symmetrical tall bookshelves, a wide empty wooden reading table in the
lower third, warm amber lamps against burgundy and midnight-blue shadows,
subtle halftone print texture, calm center for compositing; no box, comics,
hands, people, text, logos, or watermark.

### Comic box

Open worn kraft corrugated archival comic box, three-quarter view from slightly
above, filled with tidy bagged-and-boarded comics and blank tabs, graphic-novel
ink treatment, warm upper-left light, isolated on a genuinely transparent
background; no brands, readable labels, hands, table, or watermark.

### Hands

Three matching first-person poses—resting low, reaching toward the center, and
gripping the outer edges of an invisible portrait comic—using realistic adult
anatomy, subtle graphic-novel ink and halftone texture, warm amber key light and
cool burgundy-blue fill, genuinely transparent background, no sleeves, jewelry,
tattoos, object, text, logo, or watermark.

## Rive note

These are raster fallback/key-pose assets. They do not replace
`web/static/rive/comic-hands.riv`. The final Rive file needs separately rigged
hands and the state/input contract documented in
`web/docs/comic-reader/LIBRARY-INTERACTION.md`.
