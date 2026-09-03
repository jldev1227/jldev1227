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

<nav class="masthead" aria-label={t('nav.primary')}>
	<a class="logo" href={homePath(locale)}>
		{identity.alias} <span>{identity.handle}</span>
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

<style>
	.masthead {
		display: flex;
		align-items: center;
		gap: 20px;
		min-height: 64px;
		padding: 9px 18px;
		color: var(--jl-white);
		background: var(--jl-ink);
		border: var(--jl-border) solid var(--jl-ink);
		border-bottom: 0;
	}

	.logo {
		margin-right: auto;
		color: var(--jl-white);
		font-family: var(--jl-font-display);
		font-size: 1.65rem;
		letter-spacing: 0.08em;
		text-decoration: none;
		transform: skewX(-7deg);
	}

	.logo span {
		color: var(--jl-yellow);
	}

	ul {
		display: flex;
		gap: 20px;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	a {
		color: var(--jl-white);
		font-size: 0.78rem;
		font-weight: 500;
		text-decoration: none;
		text-transform: uppercase;
	}

	ul a:hover {
		color: var(--jl-yellow);
	}

	.lang {
		padding: 6px 9px;
		color: var(--jl-ink);
		background: var(--jl-yellow);
	}

	@media (max-width: 760px) {
		ul {
			display: none;
		}
	}
</style>
