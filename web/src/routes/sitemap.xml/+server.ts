import { projects } from '$content/projects';
import { identity } from '$content/site';
import { LOCALES, path, swapLocale } from '$lib/i18n';

export const prerender = true;

/** Every localized route, with `xhtml:link` alternates so Google pairs them. */
function paths(): string[] {
	return LOCALES.flatMap((locale) => [
		path(locale),
		path(locale, 'missions'),
		...projects.map((project) => path(locale, 'missions', project.slug))
	]);
}

function urlEntry(path: string, lastmod: string): string {
	const alternates = LOCALES.map(
		(locale) =>
			`\n\t\t<xhtml:link rel="alternate" hreflang="${locale}" href="${identity.url}${swapLocale(path, locale)}" />`
	).join('');

	return `\t<url>
		<loc>${identity.url}${path}</loc>
		<lastmod>${lastmod}</lastmod>
		<changefreq>monthly</changefreq>
		<priority>${path.split('/').length > 2 ? '0.7' : '1.0'}</priority>${alternates}
	</url>`;
}

export function GET(): Response {
	const lastmod = new Date().toISOString().slice(0, 10);

	const body = `<?xml version="1.0" encoding="UTF-8" ?>
<!-- Namespace URIs are literal identifiers: they stay on http, not https. -->
<urlset
	xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
	xmlns:xhtml="http://www.w3.org/1999/xhtml"
>
${paths()
	.map((path) => urlEntry(path, lastmod))
	.join('\n')}
</urlset>`;

	return new Response(body, {
		headers: {
			'content-type': 'application/xml',
			'cache-control': 'public, max-age=0, s-maxage=3600'
		}
	});
}
