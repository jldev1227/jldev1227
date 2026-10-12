<script lang="ts">
	import { page } from '$app/state';
	import { identity } from '$content/site';
	import { homePath, LOCALE_LABEL, other, swapLocale, translator, type Locale } from '$i18n';

	interface Props {
		locale: Locale;
	}

	let { locale }: Props = $props();

	const t = $derived(translator(locale));
	const target = $derived(other(locale));
	const switchHref = $derived(swapLocale(page.url.pathname, target));

	const links = $derived([
		{ label: t('nav.origin'), href: `${homePath(locale)}#origin` },
		{ label: t('nav.missions'), href: `${homePath(locale)}#missions` },
		{ label: t('nav.contact'), href: `${homePath(locale)}#contact` }
	]);
</script>

<header class="masthead">
	<nav class="masthead-nav" aria-label={t('nav.primary')}>
		<a class="logo" href={homePath(locale)}>
			<img src="/brand/jldev-mark.svg" alt="" width="40" height="40" />
			<span class="logo-word">{identity.alias}</span>
			<span class="logo-number">{identity.handle}</span>
		</a>

		<ul>
			{#each links as link (link.href)}
				<li><a href={link.href}>{link.label}</a></li>
			{/each}
		</ul>

		<a
			class="lang"
			href={switchHref}
			hreflang={target}
			lang={target}
			rel="alternate"
			aria-label={t('lang.switchAria')}
			data-sveltekit-reload
		>
			{LOCALE_LABEL[target]}
		</a>
	</nav>
</header>

<style>
	.masthead {
		position: relative;
		z-index: 4;
		isolation: isolate;
		border-bottom: 1px solid rgb(var(--jl-ink-rgb) / 0.2);
		background:
			radial-gradient(ellipse at 50% 0%, rgb(255 255 255 / 0.82), transparent 70%),
			linear-gradient(110deg, #fff4d7 0%, #ffe9b4 52%, #fff1ce 100%);
		box-shadow: 0 12px 32px rgb(0 0 0 / 0.12);
		color: var(--jl-ink);
	}

	.masthead-nav {
		display: grid;
		width: min(100%, 1680px);
		min-height: 76px;
		grid-template-columns: 1fr auto 1fr;
		align-items: center;
		gap: 28px;
		margin-inline: auto;
		padding: 12px clamp(24px, 7.4vw, 116px);
	}

	.logo {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		justify-self: start;
		color: var(--jl-ink);
		font:
			800 0.92rem/1 system-ui,
			sans-serif;
		letter-spacing: 0.13em;
		text-decoration: none;
		text-transform: uppercase;
		white-space: nowrap;
	}

	.logo img {
		width: 40px;
		height: 40px;
		flex: none;
	}

	.logo-word {
		font-size: 1.04rem;
		letter-spacing: 0.08em;
	}

	.logo-number {
		margin-left: 0.05em;
		color: var(--jl-red);
		font-size: 0.68rem;
		letter-spacing: 0.08em;
	}

	ul {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: clamp(20px, 3vw, 42px);
		list-style: none;
	}

	li a {
		position: relative;
		padding-block: 8px;
		color: rgb(var(--jl-ink-rgb) / 0.82);
		font:
			700 0.68rem/1 system-ui,
			sans-serif;
		letter-spacing: 0.12em;
		text-decoration: none;
		text-transform: uppercase;
		transition: color 160ms ease;
	}

	li a::after {
		position: absolute;
		right: 0;
		bottom: 1px;
		left: 0;
		height: 1px;
		transform: scaleX(0);
		transform-origin: left;
		background: var(--jl-red);
		content: '';
		transition: transform 180ms ease;
	}

	li a:hover {
		color: var(--jl-red);
	}

	li a:hover::after {
		transform: scaleX(1);
	}

	.lang {
		justify-self: end;
		min-width: 78px;
		padding: 10px 13px;
		border: 1px solid rgb(var(--jl-ink-rgb) / 0.38);
		border-radius: 2px;
		background: rgb(var(--jl-ink-rgb) / 0.04);
		color: var(--jl-ink);
		font:
			700 0.65rem/1 system-ui,
			sans-serif;
		letter-spacing: 0.13em;
		text-align: center;
		text-decoration: none;
		text-transform: uppercase;
		transition:
			background-color 160ms ease,
			color 160ms ease,
			border-color 160ms ease;
	}

	.lang:hover {
		border-color: var(--jl-red);
		background: var(--jl-red);
		color: #fff4ee;
	}

	:global(.masthead a:focus-visible) {
		outline: 2px solid var(--jl-ink);
		outline-offset: 4px;
	}

	@media (max-width: 680px) {
		.logo img {
			width: 34px;
			height: 34px;
		}

		.logo-word {
			font-size: 0.88rem;
		}

		.logo-number {
			font-size: 0.6rem;
		}

		.masthead-nav {
			min-height: 88px;
			grid-template-columns: 1fr auto;
			grid-template-rows: auto auto;
			gap: 12px 16px;
			padding: 13px 20px 12px;
		}

		ul {
			grid-column: 1 / -1;
			grid-row: 2;
			justify-content: space-between;
			gap: 12px;
		}

		li a {
			font-size: 0.62rem;
			letter-spacing: 0.09em;
		}

		.lang {
			grid-column: 2;
			grid-row: 1;
			min-width: 72px;
			padding: 9px 10px;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		*,
		*::before,
		*::after {
			scroll-behavior: auto !important;
			transition-duration: 0.01ms !important;
		}
	}
</style>
