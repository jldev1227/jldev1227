# Illustration placeholders

Drop the commissioned comic artwork here, then pass `src` to `<ArtSlot />`:

```svelte
<ArtSlot src="/art/julian-portrait.webp" alt={origin.portraitAlt[locale]} … />
```

Suggested exports: WebP or AVIF, 2× the rendered box, under 200 KB each.
