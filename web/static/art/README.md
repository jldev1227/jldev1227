# Illustration placeholders

Drop the commissioned comic artwork here, then pass `src` to `<ArtSlot />`:

```svelte
<ArtSlot src="/art/julian-portrait.webp" alt={origin.portraitAlt[locale]} … />
```

Suggested exports: WebP or AVIF, 2× the rendered box, under 200 KB each.

## Experimental comic cover

`julian-cover-freelancer-v1.webp` is the full-bleed illustration used by the
experimental reader cover. It was generated from Julian's portrait and a
dynamic comic-cover composition reference, then exported as a 1024 × 1536 WebP.
All masthead, cover lines, language controls, and calls to action remain live
HTML in `ComicCover.svelte`; do not bake localized text into this image.
