---
name: bilingual-copy
description: Add or edit any user-visible string on the JLDEV site, in English and Spanish. Use when writing page copy, navigation labels, alt text, SEO titles and descriptions, or when a string appears untranslated.
---

# Bilingual copy

The site ships English and Spanish as equals. There is no fallback language: a
missing translation is a type error, which is the point.

## Where a string goes

| Kind of string | Home |
|---|---|
| Page copy — headings, body, taglines | `web/src/lib/content/site.ts` |
| Project case files | `web/src/lib/content/projects.ts` |
| Chrome — nav, buttons, labels, a11y text | `web/src/lib/i18n/ui.ts` |

**Never put a literal string in a `.svelte` file.** It compiles, renders, and
ships in one language only.

## Adding page copy

Everything in `content/` is a `Localized` value:

```ts
export const origin = {
	caption: { en: 'Previously…', es: 'Anteriormente…' },
	body: { en: '…', es: '…' }
} satisfies Record<string, Localized>;
```

Read it with the current locale:

```svelte
<p>{origin.body[locale]}</p>
```

## Adding a UI string

Add a key to the `UI` object in `i18n/ui.ts`. `satisfies Record<string, Localized>`
means omitting `es` fails the type check.

```ts
'nav.blog': { en: 'Log', es: 'Bitácora' },
```

```svelte
const t = $derived(translator(locale));
<a href={…}>{t('nav.blog')}</a>
```

## Writing the Spanish

Not a gloss of the English — it is the version most visitors from Colombia will
read. Match the comic register: short, declarative, present tense.

- Keep accents on capitals: `PRÓXIMO`, `MISIÓN`, `AÑOS`. RAE requires them and
  the display type is built to show them.
- Spanish runs roughly 15–25% longer. A heading that fits in English can break
  the panel in Spanish — check the layout in Spanish, not English.
- Use `·` as the separator, matching the comic captions.
- Product names, `stack` entries and `title` stay untranslated.

## SEO strings

`seo.title` / `seo.description` / `seo.keywords` in `site.ts` are per-locale and
feed `<title>`, the meta description, Open Graph and Twitter cards. Keep titles
under ~60 characters and descriptions under ~155 in both languages — Spanish is
the one that will overflow.

## Verify

```bash
cd web && npm run check
```

Then load both `/en` and `/es` and read the actual page. Grep for strings that
escaped the content layer:

```bash
grep -rnE '>[A-Za-z][A-Za-z ]{4,}<' web/src/routes web/src/lib/components --include='*.svelte'
```
