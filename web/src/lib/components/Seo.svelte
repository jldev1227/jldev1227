<script lang="ts">
	import { page } from '$app/state';
	import { identity } from '$content/site';
	import { alternates, LOCALE_TAG, OG_LOCALE, other, type Locale } from '$i18n';

	interface Props {
		locale: Locale;
		title: string;
		description: string;
		keywords?: string;
		image?: string;
		type?: 'website' | 'article';
		/** Extra JSON-LD nodes merged into the page graph. */
		schema?: Record<string, unknown>[];
	}

	let {
		locale,
		title,
		description,
		keywords,
		image = '/og/jldev-cover.png',
		type = 'website',
		schema = []
	}: Props = $props();

	const origin = identity.url;
	// The canonical is always the page being rendered, never a path passed in.
	const pathname = $derived(page.url.pathname);
	const canonical = $derived(origin + pathname);
	const imageUrl = $derived(origin + image);
	const links = $derived(alternates(pathname, origin));

	const graph = $derived([
		{
			'@type': 'Person',
			'@id': `${origin}/#person`,
			name: identity.name,
			alternateName: identity.alias,
			url: origin,
			email: `mailto:${identity.email}`,
			jobTitle: 'Software Engineer',
			sameAs: [identity.github, identity.linkedin]
		},
		{
			'@type': 'WebSite',
			'@id': `${origin}/#website`,
			url: origin,
			name: `${identity.alias} · ${identity.name}`,
			inLanguage: LOCALE_TAG[locale],
			publisher: { '@id': `${origin}/#person` }
		},
		...schema
	]);

	// A literal closing script tag inside JSON-LD would end the block early.
	const jsonLd = $derived(
		JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c')
	);
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	{#if keywords}<meta name="keywords" content={keywords} />{/if}
	<link rel="canonical" href={canonical} />

	{#each links as alt (alt.hreflang)}
		<link rel="alternate" hreflang={alt.hreflang} href={alt.href} />
	{/each}

	<meta property="og:type" content={type} />
	<meta property="og:site_name" content={`${identity.alias} · ${identity.name}`} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={canonical} />
	<meta property="og:image" content={imageUrl} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:locale" content={OG_LOCALE[locale]} />
	<meta property="og:locale:alternate" content={OG_LOCALE[other(locale)]} />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={imageUrl} />

	<meta name="author" content={identity.name} />
	<meta name="robots" content="index, follow, max-image-preview:large" />

	<!-- JSON-LD we generate ourselves; every `<` in the payload is escaped. -->
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html `<script type="application/ld+json">${jsonLd}</` + `script>`}
</svelte:head>
