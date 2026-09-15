import { DEFAULT_LOCALE, LOCALES, isLocale, type Locale } from './locales';

/**
 * Every builder here returns a root-absolute path, for `href` attributes and
 * for metadata alike.
 *
 * `homePath` / `missionsPath` / `missionPath` used to go through SvelteKit's
 * `resolve()`, which type-checks the route id but returns a path *relative to
 * the page being rendered*: from `/es/missions/segispro`, "back to the issue"
 * was served as `../../es`. That is only correct while the URL is spelled
 * without a trailing slash — at `/es/missions/segispro/` the same href resolves
 * to `/es/es`, and the link goes somewhere it never claimed to. The dev server
 * redirects trailing slashes away, which hid it locally.
 *
 * The site is served from the root, which is the assumption `path()` already
 * makes, so anchoring every builder there costs nothing and removes a class of
 * bug that only shows up before hydration.
 */

/** Root-absolute path: `path('es', 'missions', 'segispro')` → `/es/missions/segispro`. */
export function path(locale: Locale, ...segments: string[]): string {
	const tail = segments.filter(Boolean).join('/');
	return tail ? `/${locale}/${tail}` : `/${locale}`;
}

export function homePath(locale: Locale): string {
	return path(locale);
}

export function missionsPath(locale: Locale): string {
	return path(locale, 'missions');
}

export function missionPath(locale: Locale, slug: string): string {
	return path(locale, 'missions', slug);
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
