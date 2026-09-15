<script module lang="ts">
	/**
	 * One issue's cover furniture, already localized. The cover prints what it is
	 * handed: the introductory issue and every case file are the same object with
	 * different words, which is what makes them one collection.
	 */
	export interface CoverIssue {
		volume: string;
		issue: string;
		price: string;
		imprint: string;
		date: string;
		stamp: string;
		storyKicker: string;
		titleTop: string;
		titleAccent?: string;
		lead: string;
		blurb: string;
		bubble?: string;
		art?: { src: string; width: number; height: number };
		/**
		 * The world's own colours, so every issue is set in the app it is about.
		 * Omitted on the introductory issue, which uses the house palette.
		 */
		palette?: { base: string; accent: string; on: 'paper' | 'ink'; onAccent: 'paper' | 'ink' };
	}
</script>

<script lang="ts">
	import { page as appPage } from '$app/state';
	import { identity } from '$content/site';
	import { LOCALE_LABEL, other, swapLocale, translator, type Locale } from '$i18n';

	interface Props {
		locale: Locale;
		issue: CoverIssue;
		/** The reader has started: the open control can do something. */
		enhanced: boolean;
		onopen: () => void;
	}

	let { locale, issue, enhanced, onopen }: Props = $props();

	const t = $derived(translator(locale));

	// The comic carries no masthead, so the edition mark on the cover is where
	// the other language lives.
	const target = $derived(other(locale));
	const switchHref = $derived(swapLocale(appPage.url.pathname, target));
</script>

<div class="shell">
	<div
		class="cover"
		data-themed={issue.palette ? '' : undefined}
		style={issue.palette
			? `--jl-world-base:${issue.palette.base}; --jl-world-accent:${issue.palette.accent}; --jl-world-on:${issue.palette.on === 'ink' ? 'var(--jl-ink)' : 'var(--jl-white)'}; --jl-world-on-accent:${issue.palette.onAccent === 'ink' ? 'var(--jl-ink)' : 'var(--jl-white)'}`
			: undefined}
	>
		<!--
			The illustration carries the issue's narrative action; masthead, cover lines,
			edition controls and calls to action remain live, localised HTML above it.
		-->
		{#if issue.art}
			<img
				class="art"
				src={issue.art.src}
				alt=""
				width={issue.art.width}
				height={issue.art.height}
				aria-hidden="true"
			/>
		{/if}

		<header class="plate">
			<p class="jl-kicker issue">{issue.volume} · {issue.issue}</p>
			<p class="logo jl-display">{identity.alias} <span>{identity.handle}</span></p>
			<p class="jl-kicker price">{issue.price}</p>
			<a
				class="jl-kicker edition"
				href={switchHref}
				hreflang={target}
				lang={target}
				rel="alternate"
				aria-label={t('lang.switchAria')}
				data-sveltekit-reload
			>
				{LOCALE_LABEL[target]}
			</a>
		</header>

		<div class="body">
			<p class="jl-caption blurb">{issue.blurb}</p>
			{#if issue.bubble}
				<p class="jl-bubble say">{issue.bubble}</p>
			{/if}

			<div class="story">
				<p class="jl-kicker">{issue.storyKicker}</p>
				<h1 class="jl-display">
					{issue.titleTop}
					{#if issue.titleAccent}
						<span>{issue.titleAccent}</span>
					{/if}
				</h1>
				<p class="lead">{issue.lead}</p>
			</div>

			{#if enhanced}
				<button class="open" type="button" onclick={onopen}>{t('reader.open')}</button>
			{/if}
		</div>

		<footer class="foot">
			<span class="barcode" aria-hidden="true"></span>
			<span class="jl-kicker imprint">{issue.imprint} · {issue.date}</span>
			<span class="jl-kicker stamp">{issue.stamp}</span>
		</footer>
	</div>
</div>

<style>
	/* The shell exists so the curled corner can sit in the notch the cover's
	   clip-path cuts out of itself — a child of `.cover` would be clipped too. */
	.shell {
		position: relative;
		display: grid;
		min-height: 100%;
	}

	.cover {
		container-type: inline-size;
		position: relative;
		/* The art and the halftone sit at negative depth; without a stacking
		   context of its own they would fall behind the cover's own background. */
		isolation: isolate;
		display: grid;
		grid-template-rows: auto 1fr auto;
		gap: clamp(10px, 2cqi, 18px);
		overflow: hidden;
		padding: clamp(13px, 3cqi, 26px);
		color: var(--jl-white);
		background: #0d182b;
		border: var(--jl-border) solid var(--jl-ink);
	}

	/* An issue of a case file is printed in that world's colours. */
	.cover[data-themed] {
		color: var(--jl-world-on);
		background: linear-gradient(
			158deg,
			var(--jl-world-base) 0 54%,
			color-mix(in oklab, var(--jl-world-accent) 36%, var(--jl-world-base)) 54%
		);
	}

	/*
	 * A themed cover can be printed on cream as easily as on near-black, so every
	 * mark on it takes its colour from the world's ground rather than assuming a
	 * dark one. Display type is outlined in the ground itself, which is what
	 * keeps accents legible either way.
	 */
	.cover[data-themed] {
		--jl-display-stroke: var(--jl-world-base);
		--jl-cover-ground: var(--jl-world-base);
	}

	.cover[data-themed] :is(.issue, .price, .imprint, .lead) {
		color: color-mix(in oklab, var(--jl-world-on) 76%, transparent);
	}

	/* The kicker sits on the accent diagonal, so accent-on-accent would sink. */
	.cover[data-themed] .story > .jl-kicker {
		color: var(--jl-world-on);
	}

	/* The off-register colour plates only read on ink; on cream a solid drop is
	   what a press would actually leave. */
	.cover[data-themed] .story h1 {
		text-shadow: 6px 6px 0 var(--jl-world-accent);
	}

	.cover[data-themed] .story h1 span {
		color: var(--jl-world-accent);
		text-shadow: 6px 6px 0 var(--jl-world-on);
	}

	.cover[data-themed] .open {
		color: var(--jl-world-on-accent);
		background: var(--jl-world-accent);
		box-shadow: 5px 5px 0 var(--jl-world-on);
	}

	/*
	 * Accent as lettering, not as a field. A cream world's signal blue sits at
	 * 2.9:1 on its own paper, so text and rules printed in the accent are pulled
	 * towards the world's reading colour: on a dark world that lifts the accent,
	 * on a light one it deepens it, and the hue survives either way.
	 */
	.cover[data-themed] :is(.stamp, .logo span) {
		color: color-mix(in oklab, var(--jl-world-accent) 66%, var(--jl-world-on));
	}

	.cover[data-themed] .stamp {
		border-color: color-mix(in oklab, var(--jl-world-accent) 66%, var(--jl-world-on));
		outline-color: color-mix(in oklab, var(--jl-world-accent) 66%, var(--jl-world-on));
		opacity: 1;
	}

	/* Ink bars on the world's own paper, not a solid block of one or the other. */
	.cover[data-themed] .barcode {
		background-color: var(--jl-world-base);
		background-image: repeating-linear-gradient(
			90deg,
			var(--jl-world-on) 0 2px,
			transparent 2px 4px,
			var(--jl-world-on) 4px 5px,
			transparent 5px 9px
		);
		border-color: var(--jl-world-on);
	}

	.art {
		position: absolute;
		inset: 0;
		z-index: -2;
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: center;
		transform: translateY(6%);
	}

	/* Halftone over the whole cover, then the wear of a shelf-worn issue. */
	.cover::before,
	.cover::after {
		content: '';
		position: absolute;
		inset: 0;
		pointer-events: none;
	}

	.cover::before {
		z-index: -1;
		background-image: radial-gradient(
			circle at 2px 2px,
			rgb(255 255 255 / var(--jl-dot-opacity)) 1.5px,
			transparent 1.7px
		);
		background-size: var(--jl-dot-size) var(--jl-dot-size);
	}

	.cover::after {
		z-index: 6;
		background:
			radial-gradient(circle at 16% 9%, rgb(255 253 246 / 0.12), transparent 26%),
			radial-gradient(circle at 96% 86%, rgb(5 7 12 / 0.34), transparent 34%),
			repeating-linear-gradient(101deg, rgb(255 253 246 / 0.05) 0 2px, transparent 2px 9px);
	}

	/* ----------------------------------------------------------- masthead --- */

	.plate {
		display: flex;
		align-items: baseline;
		gap: 12px;
		margin-inline: calc(-1 * clamp(13px, 3cqi, 26px));
		margin-block: 0;
		padding: 0 clamp(13px, 3cqi, 26px) 10px;
		background: linear-gradient(
			0deg,
			transparent,
			color-mix(in oklab, var(--jl-cover-ground, #0d182b) 86%, transparent) 40%
		);
	}

	.plate p {
		margin: 0;
	}

	.plate .logo {
		margin-right: auto;
	}

	.logo {
		order: -1;
		font-size: clamp(2rem, 11cqi, 4.4rem);
		text-shadow: 4px 4px 0 var(--jl-ink);
		transform: skewX(-7deg);
	}

	.logo span {
		color: var(--jl-yellow);
	}

	.edition {
		padding: 4px 8px;
		color: var(--jl-ink);
		background: var(--jl-yellow);
		border: 2px solid var(--jl-ink);
		font-size: clamp(0.5rem, 1.7cqi, 0.64rem);
		text-decoration: none;
	}

	.edition:hover {
		color: var(--jl-white);
		background: var(--jl-red);
	}

	.issue,
	.price {
		color: var(--jl-on-dark);
		font-size: clamp(0.55rem, 1.9cqi, 0.72rem);
	}

	/* ------------------------------------------------------------- story ---- */

	/* Everything flows. Nothing on this cover is bottom-anchored over anything
	   else, because Spanish runs a line longer and would slide underneath. */
	.body {
		display: flex;
		flex-direction: column;
		align-items: start;
		gap: clamp(12px, 3cqi, 22px);
		min-width: 0;
	}

	.blurb {
		position: static;
		max-width: min(340px, 62%);
		margin: 0;
		box-shadow: 4px 4px 0 var(--jl-ink);
	}

	.say {
		position: absolute;
		top: 40%;
		right: 2%;
		max-width: min(196px, 44%);
		margin: 0;
		transform: rotate(-3deg);
	}

	/*
	 * Lettering over an illustration needs something to sit on. Comics print a
	 * flat field under the cover lines for exactly this reason; without it the
	 * kicker and the lead were measuring around 1.2:1 against the artwork.
	 */
	.story {
		margin-top: auto;
		margin-inline: calc(-1 * clamp(13px, 3cqi, 26px));
		padding: 16px clamp(13px, 3cqi, 26px) 12px;
		/* Solid from the first line: the kicker sits at the very top of this block
		   and a fade that starts lower leaves it on the bare illustration. */
		background: color-mix(in oklab, var(--jl-cover-ground, #0d182b) 86%, transparent);
	}

	.story > .jl-kicker {
		display: block;
		margin-bottom: 8px;
		color: var(--jl-yellow);
		font-size: clamp(0.55rem, 1.9cqi, 0.72rem);
	}

	.story h1 {
		max-width: 14ch;
		font-size: clamp(2.3rem, 13cqi, 5.6rem);
		line-height: 0.82;
		/* Off-register colour plates, the way a cheap press lays them down. */
		text-shadow:
			3px 0 0 rgb(217 29 59 / 0.85),
			-3px 0 0 rgb(20 120 212 / 0.85),
			7px 7px 0 var(--jl-ink);
	}

	.story h1 span {
		display: block;
		color: var(--jl-yellow);
	}

	.lead {
		max-width: 46ch;
		margin: clamp(12px, 2.6cqi, 20px) 0 0;
		color: var(--jl-on-dark);
		font-size: clamp(0.78rem, 2.4cqi, 0.95rem);
		line-height: 1.55;
	}

	.open {
		padding: 12px 20px;
		color: var(--jl-ink);
		background: var(--jl-yellow);
		border: 3px solid var(--jl-ink);
		box-shadow: 5px 5px 0 var(--jl-red);
		font-family: var(--jl-font-body);
		font-size: clamp(0.7rem, 2.2cqi, 0.82rem);
		font-weight: 600;
		letter-spacing: 0.07em;
		text-transform: uppercase;
		cursor: pointer;
		transition: transform var(--jl-motion-panel) var(--jl-paper-ease);
	}

	.open:is(:hover, :focus-visible) {
		transform: translate(-2px, -2px);
	}

	/* -------------------------------------------------------------- foot ---- */

	.foot {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-inline: calc(-1 * clamp(13px, 3cqi, 26px));
		padding: 10px clamp(13px, 3cqi, 26px) 0;
		/* Solid where the indicia is, like `.story`: the imprint and the stamp sit
		   on the first line of this block, which a fade leaves on bare artwork. */
		background: color-mix(in oklab, var(--jl-cover-ground, #0d182b) 86%, transparent);
		/* The reader's page corner sits over the bottom-right; keep clear of it. */
		padding-right: clamp(34px, 9cqi, 74px);
	}

	.barcode {
		flex: none;
		width: 74px;
		height: 38px;
		background-color: var(--jl-white);
		background-image: repeating-linear-gradient(
			90deg,
			var(--jl-ink) 0 2px,
			transparent 2px 4px,
			var(--jl-ink) 4px 5px,
			transparent 5px 9px
		);
		border: 2px solid var(--jl-ink);
	}

	.imprint {
		min-width: 0;
		color: var(--jl-on-dark-dim);
		font-size: clamp(0.52rem, 1.7cqi, 0.66rem);
	}

	.stamp {
		margin-left: auto;
		padding: 6px 11px;
		color: var(--jl-yellow);
		border: 2px solid var(--jl-yellow);
		outline: 1px solid var(--jl-yellow);
		outline-offset: 3px;
		font-size: clamp(0.5rem, 1.7cqi, 0.64rem);
		opacity: 0.86;
		transform: rotate(-7deg);
	}

	@container (max-width: 360px) {
		.foot .imprint {
			display: none;
		}
	}
</style>
