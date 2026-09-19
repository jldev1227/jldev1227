# Illustration placeholders

Drop the commissioned comic artwork here, then pass `src` to `<ArtSlot />`:

```svelte
<ArtSlot src="/art/julian-portrait.webp" alt={origin.portraitAlt[locale]} … />
```

## Masters and renditions

Author one master per plate — covers at 1024 × 1536, backdrops at 3840 × 2160 —
and let the build make the small ones:

```bash
npm run art:variants
```

`scripts/image-variants.mjs` reads every `/art/…` path the source references and
writes an AVIF and a WebP of each at the widths in `src/lib/images.ts`, beside
the master and named for their width (`segispro-cover-v2-768.avif`). The markup
asks for them through `responsiveArt()` and a `<picture>`, so a phone downloads
about 30 KB where it used to download the 500 KB plate. Commit the renditions
with the master; the build itself runs no image pipeline.

Two rules keep this honest. **Re-run the script after replacing a master** — the
renditions are only regenerated when they are older than the file they came
from. And **never overwrite a plate in place**: `/art/` is served with a
one-year `immutable` cache in `vercel.json`, so a revision has to arrive under a
new name, which is what the `-v2` suffix is for.

## Introductory comic cover

`julian-cover-freelancer-v2.webp` is the active full-bleed illustration for the
introductory `#1227` issue. It presents Julian in a natural rear three-quarter
standing pose inside his freelance studio, turning into profile while reviewing
an architecture sketch. The original `v1` remains beside it as a reversible
art-direction checkpoint.

The generated source used `julian-cover-freelancer-v1.webp` as the identity and
comic-language reference. Two user-supplied cinematic images guided only the
relaxed posture, profile angle and environmental framing. No superhero costume,
emblem, web motif or recognizable character was copied.

Generation prompt direction:

> A 2:3 full-bleed premium hand-inked comic cover of the recognizable young
> Colombian freelance developer from the approved #1227 cover. Show him
> full-body in a natural rear three-quarter standing pose in a lived-in home
> studio at golden hour, weight resting on one leg, turning his face into a clean
> side profile while adjusting an architecture sketch and loosely holding a
> laptop. Surround him with practical backend, database and automation work,
> using navy, cobalt, cream, yellow and restrained red. Preserve calm upper and
> lower zones for live HTML. No embedded text, logos, watermark, readable UI,
> superhero costume, mask, web motif, extreme perspective or giant foreground
> hand.

Generated with the built-in image generation tool and exported as a 1024 × 1536
WebP at quality 88. All masthead, cover lines, language controls and calls to
action remain live HTML in `ComicCover.svelte`; do not bake localized text into
this image.
