import { identity } from '$content/site';

export const prerender = true;

export function GET(): Response {
	const body = `User-agent: *
Allow: /

Sitemap: ${identity.url}/sitemap.xml
`;

	return new Response(body, { headers: { 'content-type': 'text/plain' } });
}
