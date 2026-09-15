<script lang="ts">
	import { format, translator, type Locale } from '$i18n';
	import { identity } from '$content/site';
	import type { ExperienceVolume } from './ComicExperience.svelte';

	/**
	 * One issue standing on the shelf: a cover face and the sliver of spine you
	 * see when a comic is stacked with its neighbours.
	 *
	 * It is an ordinary anchor to the issue's canonical route. Without scripting
	 * that is the whole behaviour — a link to a readable document — and the shelf
	 * only takes the click over once it has enhanced itself.
	 *
	 * The cover is drawn from the issue's own palette rather than the house
	 * colours, so the five volumes read as five different comics at a glance.
	 * It is not a miniature of `ComicCover`: at this size the furniture would be
	 * illegible, so the face carries only what identifies the issue.
	 */

	interface Props {
		locale: Locale;
		volume: ExperienceVolume;
		/** Roving tabindex: exactly one volume is in the tab order at a time. */
		tabbable: boolean;
		disabled?: boolean;
		variant?: 'shelf' | 'box';
		onselect: (rect: DOMRect) => void;
		onfocus: () => void;
	}

	let {
		locale,
		volume,
		tabbable,
		disabled = false,
		variant = 'shelf',
		onselect,
		onfocus
	}: Props = $props();

	const t = $derived(translator(locale));
	const palette = $derived(volume.cover.palette);

	const style = $derived(
		palette
			? `--jl-world-base:${palette.base}; --jl-world-accent:${palette.accent};` +
					` --jl-world-on:${palette.on === 'ink' ? 'var(--jl-ink)' : 'var(--jl-white)'};` +
					` --jl-world-on-accent:${palette.onAccent === 'ink' ? 'var(--jl-ink)' : 'var(--jl-white)'}`
			: undefined
	);

	let anchor = $state<HTMLAnchorElement | null>(null);

	export function focus() {
		anchor?.focus();
	}

	export function rect(): DOMRect {
		return anchor?.getBoundingClientRect() ?? new DOMRect();
	}
</script>

<a
	bind:this={anchor}
	class="volume"
	data-variant={variant}
	href={volume.href}
	{style}
	tabindex={tabbable ? 0 : -1}
	aria-label={format(t('library.pickUp'), { title: volume.title })}
	aria-disabled={disabled}
	onfocus={() => onfocus()}
	onclick={(event) => {
		if (disabled) {
			event.preventDefault();
			return;
		}
		if (event.metaKey || event.ctrlKey || event.shiftKey) return;
		event.preventDefault();
		onselect(rect());
	}}
>
	<!-- The spine is what a comic shows its neighbours; it carries no copy a
	     screen reader would want, because the link is already named. -->
	<span class="spine" aria-hidden="true"></span>

	<span class="face">
		<span class="masthead" aria-hidden="true">{identity.alias}</span>
		<span class="number">{volume.cover.issue}</span>
		<span class="kicker">{volume.cover.storyKicker}</span>
		<strong class="title jl-display">{volume.cover.titleTop}</strong>
	</span>
</a>

<style>
	/*
	 * A book on a shelf is seen at an angle, so the resting state is turned
	 * slightly away and the hover/focus state squares up and steps forward —
	 * the camera-like push-in the plan asks for. Everything is transform and
	 * opacity: no layout moves, so a row of five does not reflow on hover.
	 */
	.volume {
		position: relative;
		display: block;
		width: 100%;
		aspect-ratio: var(--jl-page-ratio, 0.66);
		color: var(--jl-world-on, var(--jl-white));
		text-decoration: none;
		transform: perspective(900px) rotateY(-13deg) translateZ(0);
		transform-origin: left center;
		transition:
			transform var(--jl-motion-panel, 220ms) var(--jl-paper-ease, ease),
			filter var(--jl-motion-panel, 220ms) var(--jl-paper-ease, ease);
		filter: drop-shadow(10px 10px 0 rgb(5 7 12 / 0.45));
	}

	.volume:is(:hover, :focus-visible) {
		transform: perspective(900px) rotateY(0deg) translateY(-10px) scale(1.04);
		filter: drop-shadow(14px 16px 0 rgb(5 7 12 / 0.55));
	}

	.volume[data-variant='box'] {
		height: 100%;
		aspect-ratio: auto;
		transform: perspective(700px) rotateY(-8deg) translateZ(0);
		filter: drop-shadow(3px 5px 0 rgb(5 7 12 / 0.42));
	}

	.volume[data-variant='box']:is(:hover, :focus-visible) {
		transform: perspective(700px) rotateY(0) translateY(-7%) scale(1.04);
		filter: drop-shadow(5px 8px 0 rgb(5 7 12 / 0.55));
	}

	.volume[aria-disabled='true'] {
		pointer-events: none;
	}

	/* The ink outline a comic panel wears, kept on focus rather than the
	   browser's default ring so it reads as part of the drawing. */
	.volume:focus-visible {
		outline: var(--jl-border) solid var(--jl-yellow);
		outline-offset: 4px;
	}

	/* ------------------------------------------------------------- spine ---- */

	.spine {
		position: absolute;
		top: 0;
		bottom: 0;
		left: -11px;
		width: 11px;
		background: color-mix(in oklab, var(--jl-world-base, var(--jl-navy)) 62%, var(--jl-ink));
		border: 3px solid var(--jl-ink);
		border-right: 0;
	}

	/* -------------------------------------------------------------- face ---- */

	.face {
		container-type: inline-size;
		position: relative;
		display: grid;
		grid-template-rows: auto auto 1fr;
		gap: 4px;
		height: 100%;
		padding: clamp(8px, 7cqi, 16px);
		background: var(--jl-world-base, var(--jl-navy));
		border: var(--jl-border) solid var(--jl-ink);
	}

	.volume[data-variant='box'] .face {
		gap: 2px;
		padding: 5px 3px;
	}

	.volume[data-variant='box'] .masthead,
	.volume[data-variant='box'] .kicker {
		display: none;
	}

	.volume[data-variant='box'] .number {
		font-size: clamp(0.34rem, 1vw, 0.48rem);
		text-align: center;
	}

	.volume[data-variant='box'] .title {
		justify-self: center;
		font-size: clamp(0.46rem, 1.35vw, 0.72rem);
		line-height: 0.9;
		writing-mode: vertical-rl;
		transform: rotate(180deg);
	}

	/*
	 * The accent as a wedge of the ground, not at full strength: the title sits
	 * across the diagonal, and raw accent behind paper-white type measures
	 * around 2:1. Same rule the case panels follow.
	 */
	.face::before {
		content: '';
		position: absolute;
		inset: 0;
		z-index: -1;
		background: linear-gradient(
			150deg,
			transparent 0 54%,
			color-mix(
					in oklab,
					var(--jl-world-accent, var(--jl-red)) 32%,
					var(--jl-world-base, var(--jl-navy))
				)
				54%
		);
	}

	.face {
		isolation: isolate;
	}

	.masthead {
		font-family: var(--jl-font-display);
		font-size: clamp(0.62rem, 9cqi, 1.1rem);
		letter-spacing: 0.02em;
		line-height: 1;
	}

	.number,
	.kicker {
		font-family: var(--jl-font-mono);
		font-size: clamp(0.38rem, 3.6cqi, 0.52rem);
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	/*
	 * Accent as lettering, pulled towards the world's reading colour — the rule
	 * the cover and the case panels already follow. At full strength the issue
	 * number clears its own ground but not the accent wedge it can cross,
	 * measuring 3.0–4.2:1 across the five worlds.
	 */
	.number {
		color: color-mix(
			in oklab,
			var(--jl-world-accent, var(--jl-yellow)) 62%,
			var(--jl-world-on, var(--jl-white))
		);
		font-weight: 600;
	}

	.kicker {
		color: color-mix(in oklab, var(--jl-world-on, var(--jl-white)) 78%, transparent);
	}

	.title {
		align-self: end;
		font-size: clamp(0.8rem, 13cqi, 1.6rem);
		line-height: 0.88;
		/* Anton's accents sit above the line box; the stroke is what separates
		   them from the line above. On a world's own ground that is the ground. */
		--jl-display-stroke: var(--jl-world-base, var(--jl-navy));
	}

	/* --------------------------------------------------- reduced motion ---- */

	/*
	 * No pickup, no tilt, no travel. The volume still has to say which one is
	 * under the pointer or the focus ring, so the accent border does it.
	 */
	@media (prefers-reduced-motion: reduce) {
		.volume,
		.volume:is(:hover, :focus-visible) {
			transform: none;
			transition: none;
		}

		.volume:is(:hover, :focus-visible) .face {
			border-color: var(--jl-world-accent, var(--jl-yellow));
		}
	}

	/*
	 * A phone is not a shelf seen from an angle: the perspective goes, and what
	 * is left is a flat card in a snap row. Handled here rather than in the
	 * shelf so a volume is correct wherever it is placed.
	 */
	@media (width < 640px) {
		.volume,
		.volume:is(:hover, :focus-visible) {
			transform: none;
			filter: drop-shadow(6px 6px 0 rgb(5 7 12 / 0.4));
		}

		.spine {
			display: none;
		}
	}
</style>
