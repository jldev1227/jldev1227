<script lang="ts">
	import { format, translator, type Locale } from '$i18n';
	import { identity } from '$content/site';
	import type { ExperienceVolume } from './ComicExperience.svelte';

	/**
	 * One issue in the grid: a cover, face up.
	 *
	 * It is an ordinary anchor to the issue's canonical route. Without scripting
	 * that is the whole behaviour — a link to a readable document — and the grid
	 * only takes the click over once it has enhanced itself.
	 *
	 * Every project carries its own illustration and palette, so the six read as
	 * six different comics at a glance. This is not a miniature of
	 * `ComicCover`: at this size the furniture would be illegible, so the face
	 * carries only what identifies the issue.
	 */

	interface Props {
		locale: Locale;
		volume: ExperienceVolume;
		/** Roving tabindex: exactly one volume is in the tab order at a time. */
		tabbable: boolean;
		/**
		 * The cover the reader will open next, or has just closed. It carries the
		 * view-transition name, so opening morphs this face into the book's
		 * cover and closing morphs it back. One volume at a time, or the browser
		 * skips the transition.
		 */
		named?: boolean;
		onselect: () => void;
		onfocus: () => void;
	}

	let { locale, volume, tabbable, named = false, onselect, onfocus }: Props = $props();

	const t = $derived(translator(locale));
	const palette = $derived(volume.cover.palette);
	const art = $derived(volume.cover.art);

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
</script>

<a
	bind:this={anchor}
	class="volume"
	data-art={art ? '' : undefined}
	data-cover-text={volume.cover.coverText}
	href={volume.href}
	{style}
	tabindex={tabbable ? 0 : -1}
	aria-label={format(t('library.pickUp'), { title: volume.title })}
	onfocus={() => onfocus()}
	onclick={(event) => {
		if (event.metaKey || event.ctrlKey || event.shiftKey) return;
		event.preventDefault();
		onselect();
	}}
>
	<span class="face" style:view-transition-name={named ? 'issue-cover' : undefined}>
		{#if art}
			<img
				class="art"
				src={art.src}
				alt=""
				width={art.width}
				height={art.height}
				loading="lazy"
				decoding="async"
				draggable="false"
			/>
		{/if}

		<span class="masthead" aria-hidden="true">{identity.alias}</span>
		<span class="number">{volume.cover.issue}</span>

		<span class="story">
			<span class="kicker">{volume.cover.storyKicker}</span>
			<strong class="title jl-display">
				{volume.cover.titleTop}
				{#if volume.cover.titleAccent}
					<span class="accent">{volume.cover.titleAccent}</span>
				{/if}
			</strong>
			<!-- The illustrated cover already says what it is; a case file gets
			     its tagline, because at this size the title alone is a name. -->
			{#if !art}
				<span class="lead">{volume.cover.lead}</span>
			{/if}
		</span>
	</span>
</a>

<style>
	/*
	 * A comic lying face up on the table. Hover and focus lift it towards the
	 * reader; everything is transform and filter, so a row of covers does not
	 * reflow when one of them rises.
	 */
	.volume {
		position: relative;
		display: block;
		width: 100%;
		aspect-ratio: 2 / 3;
		color: var(--jl-world-on, var(--jl-white));
		text-decoration: none;
		transition:
			transform var(--jl-motion-panel, 220ms) var(--jl-paper-ease, ease),
			filter var(--jl-motion-panel, 220ms) var(--jl-paper-ease, ease);
		filter: drop-shadow(8px 10px 0 rgb(5 7 12 / 0.55));
	}

	.volume:is(:hover, :focus-visible) {
		transform: translateY(-8px) scale(1.03);
		filter: drop-shadow(12px 16px 0 rgb(5 7 12 / 0.6));
	}

	/* The ink outline a comic panel wears, kept on focus rather than the
	   browser's default ring so it reads as part of the drawing. */
	.volume:focus-visible {
		outline: var(--jl-border) solid var(--jl-yellow);
		outline-offset: 4px;
	}

	/* -------------------------------------------------------------- face ---- */

	.face {
		container-type: inline-size;
		position: relative;
		display: grid;
		grid-template-columns: 1fr auto;
		grid-template-rows: auto 1fr;
		gap: 4px;
		height: 100%;
		overflow: hidden;
		padding: clamp(8px, 7cqi, 16px);
		background: var(--jl-world-base, var(--jl-navy));
		border: var(--jl-border) solid var(--jl-ink);
		isolation: isolate;
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

	.art {
		position: absolute;
		inset: 0;
		z-index: -2;
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: center top;
	}

	.masthead {
		font-family: var(--jl-font-display);
		font-size: clamp(0.72rem, 10cqi, 1.3rem);
		letter-spacing: 0.02em;
		line-height: 1;
		text-shadow: 2px 2px 0 var(--jl-ink);
		transform: skewX(-7deg);
	}

	.number,
	.kicker {
		font-family: var(--jl-font-mono);
		font-size: clamp(0.4rem, 3.8cqi, 0.56rem);
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	/*
	 * Accent as lettering, pulled towards the world's reading colour — the rule
	 * the cover and the case panels already follow. At full strength the issue
	 * number clears its own ground but not the accent wedge it can cross,
	 * measuring 3.0–4.2:1 across the six worlds.
	 */
	.number {
		align-self: start;
		color: color-mix(
			in oklab,
			var(--jl-world-accent, var(--jl-yellow)) 62%,
			var(--jl-world-on, var(--jl-white))
		);
		font-weight: 600;
	}

	.story {
		grid-column: 1 / -1;
		align-self: end;
		display: grid;
		gap: 4px;
	}

	.kicker {
		color: color-mix(in oklab, var(--jl-world-on, var(--jl-white)) 78%, transparent);
	}

	.title {
		font-size: clamp(0.82rem, 13cqi, 1.6rem);
		line-height: 0.88;
		/* Anton's accents sit above the line box; the stroke is what separates
		   them from the line above. On a world's own ground that is the ground. */
		--jl-display-stroke: var(--jl-world-base, var(--jl-navy));
	}

	.title .accent {
		display: block;
		color: var(--jl-yellow);
	}

	.lead {
		display: -webkit-box;
		overflow: hidden;
		margin-top: 2px;
		color: color-mix(in oklab, var(--jl-world-on, var(--jl-white)) 84%, transparent);
		font-size: clamp(0.5rem, 4cqi, 0.66rem);
		line-height: 1.4;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 3;
		line-clamp: 3;
	}

	/* ---------------------------------------------------- the illustrated one -- */

	/*
	 * Lettering over an illustration needs something to sit on, the same way the
	 * full cover prints a flat field under its cover lines. The masthead gets a
	 * band across the top, the story a band across the foot, and the middle of
	 * the drawing is left alone.
	 */
	.volume[data-art] .face {
		background: #0d182b;
		--jl-world-base: #0d182b;
	}

	.volume[data-art] .face::before {
		background: linear-gradient(
			to bottom,
			rgb(13 24 43 / 0.86) 0 18%,
			transparent 30% 62%,
			rgb(13 24 43 / 0.9) 74%
		);
	}

	.volume[data-art] .number {
		color: var(--jl-yellow);
	}

	.volume[data-art] .title {
		text-shadow: 3px 3px 0 var(--jl-ink);
	}

	/* The two light illustrated issues keep their grid furniture in paper white;
	   the dark press bands provide the contrast, not the project's page palette. */
	.volume[data-cover-text='paper'] {
		--jl-world-on: var(--jl-white);
		color: var(--jl-white);
	}

	.volume[data-cover-text='paper'] :is(.masthead, .number, .kicker, .title) {
		color: var(--jl-white);
	}

	/* --------------------------------------------------- reduced motion ---- */

	/*
	 * No lift, no travel. The volume still has to say which one is under the
	 * pointer or the focus ring, so the accent border does it.
	 */
	@media (prefers-reduced-motion: reduce) {
		.volume,
		.volume:is(:hover, :focus-visible) {
			transform: none;
			transition: none;
		}

		.volume:is(:hover, :focus-visible) .face {
			border-color: var(--jl-yellow);
		}
	}
</style>
