import { resolve } from '$app/paths';
import { DEFAULT_LOCALE, LOCALES, isLocale, type Locale } from './locales';

/**
 * Two families of path builders, and they are not interchangeable:
 *
 * - `homePath` / `missionsPath` / `missionPath` go through `resolve()`, which
 *   type-checks the route id — use them for `href` attributes. During SSR they
 *   return a path relative to the page being rendered.
 * - `path()` returns a root-absolute path — use it for metadata (canonical,
 *   hreflang, JSON-LD, sitemap), where a relative path would be wrong.
 */

/** Root-absolute path: `path('es', 'missions', 'segispro')` → `/es/missions/segispro`. */
export function path(locale: Locale, ...segments: string[]): string {
	const tail = segments.filter(Boolean).join('/');
	return tail ? `/${locale}/${tail}` : `/${locale}`;
}

export function homePath(locale: Locale): string {
	return resolve('/[lang=lang]', { lang: locale });
}

export function missionsPath(locale: Locale): string {
	return resolve('/[lang=lang]/missions', { lang: locale });
}

export function missionPath(locale: Locale, slug: string): string {
	return resolve('/[lang=lang]/missions/[slug]', { lang: locale, slug });
}

/**
 * Rewrite the current path into another locale, keeping the rest of the route.
 * `/en/missions/segispro` → `/es/missions/segispro`
 *
 * Route-agnostic on purpose: it runs on whatever page the visitor is on, so it
 * cannot name a single route id.
 */
export function swapLocale(pathname: string, target: Locale): string {
	const segments = pathname.split('/').filter(Boolean);
	if (isLocale(segments[0])) {
		segments[0] = target;
	} else {
		segments.unshift(target);
	}
	return `/${segments.join('/')}`;
}

/** Every localized variant of a path, for `hreflang` alternates. */
export function alternates(pathname: string, origin: string) {
	return [
		...LOCALES.map((locale) => ({
			hreflang: locale as string,
			href: origin + swapLocale(pathname, locale)
		})),
		{ hreflang: 'x-default', href: origin + swapLocale(pathname, DEFAULT_LOCALE) }
	];
}
