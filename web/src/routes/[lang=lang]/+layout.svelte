<script lang="ts">
	import { Masthead, PageFooter } from '$lib/components';
	import { translator } from '$i18n';
	import type { Snippet } from 'svelte';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps & { children: Snippet } = $props();

	const t = $derived(translator(data.locale));
</script>

<a class="jl-skip" href="#content">{t('nav.skip')}</a>

<div class="page-stage">
	<div class="jl-page">
		<Masthead locale={data.locale} />
		<main id="content">
			{@render children()}
		</main>
		<PageFooter locale={data.locale} />
	</div>
</div>

<style>
	.page-stage {
		position: relative;
		min-height: 100vh;
		padding-block: clamp(22px, 3vw, 44px);
		overflow: clip;
		background: var(--jl-ink);
		isolation: isolate;
	}

	/* Blurred comic ink outside the paper: the page stays crisp while its
	   signal colours softly continue into the desktop gutters. */
	.page-stage::before {
		position: fixed;
		inset: -14vh -12vw;
		z-index: -2;
		background:
			radial-gradient(circle at 12% 20%, rgb(217 29 59 / 0.82) 0, transparent 28%),
			radial-gradient(circle at 88% 34%, rgb(20 120 212 / 0.86) 0, transparent 30%),
			radial-gradient(circle at 20% 88%, rgb(255 210 63 / 0.42) 0, transparent 24%), var(--jl-ink);
		filter: blur(62px) saturate(1.12);
		content: '';
		transform: scale(1.08);
	}

	.page-stage::after {
		position: fixed;
		inset: 0;
		z-index: -1;
		background:
			linear-gradient(90deg, rgb(5 7 12 / 0.3), transparent 28% 72%, rgb(5 7 12 / 0.3)),
			radial-gradient(circle at 2px 2px, rgb(255 255 255 / 0.06) 1px, transparent 1.2px);
		background-size:
			auto,
			16px 16px;
		content: '';
	}

	:global(.page-stage > .jl-page) {
		position: relative;
		z-index: 1;
		margin-block: 0;
		box-shadow:
			0 0 0 1px rgb(255 255 255 / 0.12),
			0 28px 90px rgb(0 0 0 / 0.55);
	}

	@media (max-width: 760px) {
		.page-stage {
			padding-block: 0;
		}

		.page-stage::before {
			opacity: 0.35;
			filter: blur(44px) saturate(1.05);
		}

		:global(.page-stage > .jl-page) {
			box-shadow: none;
		}
	}
</style>
