<script lang="ts">
	import { translator } from '$i18n';
	import type { Snippet } from 'svelte';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps & { children: Snippet } = $props();

	const t = $derived(translator(data.locale));
</script>

<a class="jl-skip" href="#content">{t('nav.skip')}</a>

<div class="page-stage">
	{@render children()}
</div>
