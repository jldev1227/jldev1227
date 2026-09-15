import { dev } from '$app/environment';
import { error } from '@sveltejs/kit';
import { DEFAULT_LOCALE, isLocale, type Locale } from '$i18n';
import type { PageLoad } from './$types';

/**
 * Milestone 1's proving route. Like the milestone-0 harness it is an
 * instrument: not prerendered, 404 outside `dev`, and it changes nothing about
 * `/[lang]` or the case-file routes.
 */
export const prerender = false;

export const load: PageLoad = ({ url }) => {
	if (!dev) error(404, 'Not found');

	// `?lang=es` drives the proving route, because it sits outside the `[lang]`
	// segment that every real page gets its locale from.
	const requested = url.searchParams.get('lang');
	const locale: Locale = isLocale(requested) ? requested : DEFAULT_LOCALE;
	return { locale };
};
