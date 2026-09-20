import { identity } from '$content/site';

export const prerender = true;

/**
 * Open to everyone, deliberately.
 *
 * The obvious thing to add here is a block on the crawlers that collect
 * training material — GPTBot, ClaudeBot, CCBot, Google-Extended and the rest —
 * since the cover art and the case files are the author's own work. The call
 * went the other way: this is a portfolio, its job is to be found and read, and
 * being quotable by an assistant is reach rather than loss. Do not add those
 * rules back without asking; the absence is a decision, not an oversight.
 *
 * Nothing here is disallowed either. Every route the site serves is meant to be
 * indexed, and the ones that are not — a case file's fragment URLs — are the
 * same document under a hash, which no crawler fetches separately.
 */
export function GET(): Response {
	const body = `User-agent: *
Allow: /

Sitemap: ${identity.url}/sitemap.xml
`;

	return new Response(body, { headers: { 'content-type': 'text/plain' } });
}
