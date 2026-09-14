<script lang="ts">
	import { page as appPage } from '$app/state';
	import { cover, hero, identity } from '$content/site';
	import { LOCALE_LABEL, other, swapLocale, translator, type Locale } from '$i18n';

	interface Props {
		locale: Locale;
		/** The reader has started: the open control can do something. */
		enhanced: boolean;
		onopen: () => void;
	}

	let { locale, enhanced, onopen }: Props = $props();

	const t = $derived(translator(locale));

	// The comic carries no masthead, so the edition mark on the cover is where
	// the other language lives.
	const target = $derived(other(locale));
	const switchHref = $derived(swapLocale(appPage.url.pathname, target));
</script>

<div class="shell">
	<div class="cover">
		<!--
			The illustration carries the issue's narrative action; masthead, cover lines,
			edition controls and calls to action remain live, localised HTML above it.
		-->
		<img
			class="art"
			src="/art/julian-cover-freelancer-v1.webp"
			alt=""
			width="1024"
			height="1536"
			aria-hidden="true"
		/>

		<header class="plate">
			<p class="jl-kicker issue">{cover.volume[locale]} · {cover.issue}</p>
			<p class="logo jl-display">{identity.alias} <span>{identity.handle}</span></p>
			<p class="jl-kicker price">{cover.price[locale]}</p>
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
			<p class="jl-caption blurb">{hero.caption[locale]}</p>
			<p class="jl-bubble say">{hero.bubble[locale]}</p>

			<div class="story">
				<p class="jl-kicker">{cover.storyKicker[locale]}</p>
				<h1 class="jl-display">
					{hero.titleTop[locale]}
					<span>{hero.titleAccent[locale]}</span>
				</h1>
				<p class="lead">{hero.lead[locale]}</p>
			</div>

			{#if enhanced}
				<button class="open" type="button" onclick={onopen}>{t('reader.open')}</button>
			{/if}
		</div>

		<footer class="foot">
			<span class="barcode" aria-hidden="true"></span>
			<span class="jl-kicker imprint">{cover.imprint[locale]} · {cover.date[locale]}</span>
			<span class="jl-kicker stamp">{cover.stamp[locale]}</span>
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
		margin: 0;
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

	.story {
		margin-top: auto;
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
