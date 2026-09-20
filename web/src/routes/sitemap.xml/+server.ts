import { contentLog, type PageKind } from '$content/content-log';
import { projects } from '$content/projects';
import { identity } from '$content/site';
import { DEFAULT_LOCALE, LOCALES, path, swapLocale } from '$lib/i18n';

export const prerender = true;

type Entry = { path: string; kind: PageKind };

/** Every localized route, paired with what it is built from. */
function entries(): Entry[] {
	return LOCALES.flatMap((locale) => [
		{ path: path(locale), kind: 'home' as const },
		...projects.map((project) => ({
			path: path(locale, 'missions', project.slug),
			kind: 'caseFile' as const
		}))
	]);
}

/**
 * `hreflang` alternates, identical to the ones in the page's own `<head>`:
 * a crawler that compares the two signals must not find them disagreeing.
 *
 * `x-default` names the URL for a visitor whose language matches neither, and
 * for the two home pages that is the site root, which negotiates from
 * `Accept-Language`. Deeper pages have no such entry point, so they fall back
 * to the default locale's own URL.
 */
function alternateLinks(entry: Entry): string {
	const links = LOCALES.map(
		(locale) => [locale as string, swapLocale(entry.path, locale)] as const
	);
	const fallback = entry.kind === 'home' ? '/' : swapLocale(entry.path, DEFAULT_LOCALE);

	return [...links, ['x-default', fallback] as const]
		.map(
			([hreflang, href]) =>
				`\n\t\t<xhtml:link rel="alternate" hreflang="${hreflang}" href="${identity.url}${href}" />`
		)
		.join('');
}

function urlEntry(entry: Entry): string {
	return `\t<url>
		<loc>${identity.url}${entry.path}</loc>
		<lastmod>${contentLog[entry.kind]}</lastmod>${alternateLinks(entry)}
	</url>`;
}

export function GET(): Response {
	// `changefreq` and `priority` are absent on purpose: Google ignores both,
	// and this file should only claim things that are true. `lastmod` is the
	// one hint that still counts, which is why it comes from Git rather than
	// from the clock — see `scripts/content-log.mjs`.
	const body = `<?xml version="1.0" encoding="UTF-8" ?>
<!-- Namespace URIs are literal identifiers: they stay on http, not https. -->
<urlset
	xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
	xmlns:xhtml="http://www.w3.org/1999/xhtml"
>
${entries().map(urlEntry).join('\n')}
</urlset>`;

	return new Response(body, {
		headers: {
			'content-type': 'application/xml',
			'cache-control': 'public, max-age=0, s-maxage=3600'
		}
	});
}
