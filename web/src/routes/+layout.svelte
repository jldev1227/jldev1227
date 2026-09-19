<script lang="ts">
	import { dev } from '$app/environment';
	import { injectAnalytics } from '@vercel/analytics/sveltekit';
	import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';
	import type { Snippet } from 'svelte';
	import '$lib/styles/comic.css';
	import antonLatin from '@fontsource/anton/files/anton-latin-400-normal.woff2?url';
	import interLatin from '@fontsource-variable/inter/files/inter-latin-wght-normal.woff2?url';

	let { children }: { children: Snippet } = $props();

	injectAnalytics({ mode: dev ? 'development' : 'production' });
	injectSpeedInsights();
</script>

<svelte:head>
	<!-- Both faces are discovered inside the stylesheet, three hops from the
	     document, and the page cannot finish painting without them. Preloading
	     them from the document itself flattens that chain to one hop. -->
	<link rel="preload" as="font" type="font/woff2" href={interLatin} crossorigin="anonymous" />
	<link rel="preload" as="font" type="font/woff2" href={antonLatin} crossorigin="anonymous" />
</svelte:head>

{@render children()}
