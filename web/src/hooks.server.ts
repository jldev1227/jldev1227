import { building } from '$app/environment';
import type { Handle } from '@sveltejs/kit';
import { DEFAULT_LOCALE, isLocale, negotiate } from '$lib/i18n';

/** Remembers an explicit language choice for a year. */
export const LOCALE_COOKIE = 'jl_locale';

export const handle: Handle = async ({ event, resolve }) => {
	const fromPath = event.url.pathname.split('/')[1];

	if (isLocale(fromPath)) {
		event.locals.locale = fromPath;

		// Navigating into a language counts as choosing it. Skipped while
		// prerendering, where there is no visitor and cookies are not allowed.
		if (!building) {
			event.cookies.set(LOCALE_COOKIE, fromPath, {
				path: '/',
				maxAge: 60 * 60 * 24 * 365,
				httpOnly: false,
				sameSite: 'lax'
			});
		}
	} else {
		const remembered = building ? undefined : event.cookies.get(LOCALE_COOKIE);
		event.locals.locale = isLocale(remembered)
			? remembered
			: negotiate(event.request.headers.get('accept-language'));
	}

	const response = await resolve(event, {
		transformPageChunk: ({ html }) =>
			html.replace('%jl.lang%', event.locals.locale ?? DEFAULT_LOCALE)
	});

	// A path that does not name its language is answered from the request:
	// `Accept-Language`, or the cookie that remembers an explicit choice. Say
	// so, or a shared cache is free to hand one visitor's negotiated redirect
	// to the next visitor, who asked for the other language.
	if (!isLocale(fromPath)) response.headers.set('vary', 'Accept-Language, Cookie');

	return response;
};
