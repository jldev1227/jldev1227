<script lang="ts">
	import { Masthead, PageFooter } from '$lib/components';
	import { translator } from '$i18n';
	import type { Snippet } from 'svelte';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps & { children: Snippet } = $props();

	const t = $derived(translator(data.locale));
</script>

<a class="jl-skip" href="#content">{t('nav.skip')}</a>

<div class="jl-page">
	<Masthead locale={data.locale} />
	<main id="content">
		{@render children()}
	</main>
	<PageFooter locale={data.locale} />
</div>
