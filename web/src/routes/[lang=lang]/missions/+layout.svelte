<script lang="ts">
	import { Masthead, PageFooter } from '$lib/components';
	import type { Snippet } from 'svelte';
	import type { LayoutProps } from './$types';

	/**
	 * The case-file routes are ordinary documents, so they keep the chrome: a
	 * masthead to get back and switch language, and a footer. The comic itself
	 * carries neither — the book is the navigation there.
	 */
	let { data, children }: LayoutProps & { children: Snippet } = $props();
</script>

<div class="jl-page">
	<Masthead locale={data.locale} />
	<main id="content">
		{@render children()}
	</main>
	<PageFooter locale={data.locale} />
</div>
