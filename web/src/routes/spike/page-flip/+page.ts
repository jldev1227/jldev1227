import { dev } from '$app/environment';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

/**
 * The harness is an instrument, not a page of the site: it must not appear in
 * the prerendered output, the sitemap, or a production build. `ship-web`
 * expects the build to print exactly 14 pages, and this route keeps it there.
 */
export const prerender = false;

/** Server-rendered, because the question is what the library does to a tree
 *  Svelte already owns and hydrated. */
export const ssr = true;

export const load: PageLoad = () => {
	if (!dev) error(404, 'Not found');
	return {};
};
