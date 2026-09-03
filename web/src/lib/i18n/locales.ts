/**
 * Locale primitives. Kept dependency-free on purpose: the site only ever needs
 * two languages, so a hand-rolled dictionary beats an i18n runtime here.
 */

export const LOCALES = ['en', 'es'] as const;

export type Locale = (typeof LOCALES)[number];

/** Used for `x-default` hreflang and for `/` when negotiation finds nothing. */
export const DEFAULT_LOCALE: Locale = 'en';

/** A value that exists in every language. */
export type Localized<T = string> = Record<Locale, T>;

export const LOCALE_LABEL: Localized = { en: 'English', es: 'Español' };

/** BCP-47 tags used in `<html lang>`, `hreflang` and Open Graph. */
export const LOCALE_TAG: Localized = { en: 'en', es: 'es' };
export const OG_LOCALE: Localized = { en: 'en_US', es: 'es_CO' };

export function isLocale(value: unknown): value is Locale {
	return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

export function other(locale: Locale): Locale {
	return locale === 'en' ? 'es' : 'en';
}

/**
 * Pick the best locale from an `Accept-Language` header.
 * Parses quality values so `es-419;q=0.9, en;q=0.8` resolves to `es`.
 */
export function negotiate(acceptLanguage: string | null | undefined): Locale {
	if (!acceptLanguage) return DEFAULT_LOCALE;

	const ranked = acceptLanguage
		.split(',')
		.map((part) => {
			const [tag, ...params] = part.trim().split(';');
			const q = params
				.map((p) => p.trim())
				.find((p) => p.startsWith('q='))
				?.slice(2);
			return { tag: tag.trim().toLowerCase(), q: q ? Number(q) : 1 };
		})
		.filter((entry) => entry.tag && !Number.isNaN(entry.q))
		.sort((a, b) => b.q - a.q);

	for (const { tag } of ranked) {
		if (tag === '*') return DEFAULT_LOCALE;
		const base = tag.split('-')[0];
		if (isLocale(base)) return base;
	}

	return DEFAULT_LOCALE;
}
