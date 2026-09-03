<script lang="ts">
	import { dev } from '$app/environment';
	import { injectAnalytics } from '@vercel/analytics/sveltekit';
	import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';
	import type { Snippet } from 'svelte';
	import '$lib/styles/comic.css';

	let { children }: { children: Snippet } = $props();

	injectAnalytics({ mode: dev ? 'development' : 'production' });
	injectSpeedInsights();
</script>

{@render children()}
