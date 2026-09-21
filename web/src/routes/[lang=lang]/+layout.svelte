<script lang="ts">
	import { page } from '$app/state';
	import { translator } from '$i18n';
	import type { Snippet } from 'svelte';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps & { children: Snippet } = $props();

	/**
	 * Routes that paint their own full-bleed page. Both of them are landings
	 * now — the personal cover and every case file — so the stage hands them the
	 * whole width instead of matting them like a sheet of paper.
	 */
	const FLUSH_ROUTES = new Set(['/[lang=lang]', '/[lang=lang]/missions/[slug]']);

	const t = $derived(translator(data.locale));

	/**
	 * The stage is lit by whatever issue is open on it. A case file brings its
	 * world's colours; the introductory issue keeps the house palette.
	 */
	const palette = $derived(page.data.project?.palette);
	const stageStyle = $derived(
		palette
			? `--jl-stage-a:${palette.accent}; --jl-stage-b:${palette.base}; --jl-stage-ground:${palette.base}`
			: undefined
	);
</script>

<a class="jl-skip" href="#content">{t('nav.skip')}</a>

<div
	class="page-stage"
	data-themed={palette ? '' : undefined}
	data-flush={FLUSH_ROUTES.has(page.route.id ?? '') ? '' : undefined}
	style={stageStyle}
>
	{@render children()}
</div>

<style>
	.page-stage {
		position: relative;
		min-height: 100vh;
		padding-block: clamp(22px, 3vw, 44px);
		overflow: clip;
		background: var(--jl-stage-ground, var(--jl-ink));
		isolation: isolate;
	}

	.page-stage[data-flush] {
		padding-block: 0;
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

	/* An issue of a case file is lit by its own world instead of the house one. */
	.page-stage[data-themed]::before {
		background:
			radial-gradient(
				circle at 14% 18%,
				color-mix(in oklab, var(--jl-stage-a) 78%, transparent) 0,
				transparent 30%
			),
			radial-gradient(
				circle at 86% 32%,
				color-mix(in oklab, var(--jl-stage-a) 52%, transparent) 0,
				transparent 32%
			),
			radial-gradient(
				circle at 24% 88%,
				color-mix(in oklab, var(--jl-stage-a) 34%, transparent) 0,
				transparent 26%
			),
			var(--jl-stage-b);
	}

	/* Paper grain, not a dot grid. The grid was a second halftone at a different
	   pitch from the panels', fixed while they scrolled, and the two moiréd
	   against each other. Turbulence has no pitch to beat against. */
	.page-stage::after {
		position: fixed;
		inset: 0;
		z-index: -1;
		background:
			linear-gradient(90deg, rgb(5 7 12 / 0.34), transparent 26% 74%, rgb(5 7 12 / 0.34)),
			url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180"><filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3"/><feColorMatrix type="saturate" values="0"/></filter><rect width="180" height="180" filter="url(%23g)" opacity="0.055"/></svg>');
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
