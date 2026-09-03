<script lang="ts">
	import { page } from '$app/state';
	import { DEFAULT_LOCALE, homePath, isLocale, translator } from '$i18n';

	const locale = $derived.by(() => {
		const segment = page.url.pathname.split('/')[1];
		return isLocale(segment) ? segment : DEFAULT_LOCALE;
	});

	const t = $derived(translator(locale));
</script>

<svelte:head>
	<title>{page.status} · {t('error.title')}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="jl-page">
	<section class="jl-panel error">
		<strong class="jl-display">{page.status}</strong>
		<h1 class="jl-display">{t('error.title')}</h1>
		<a href={homePath(locale)}>{t('error.home')}</a>
	</section>
</div>

<style>
	.error {
		display: grid;
		place-items: center;
		align-content: center;
		gap: 10px;
		min-height: 70vh;
		padding: 40px;
		color: var(--jl-white);
		background: linear-gradient(135deg, var(--jl-ink) 0 58%, var(--jl-red) 58%);
		text-align: center;
	}

	strong {
		font-size: clamp(5rem, 18vw, 12rem);
		line-height: 0.8;
		color: var(--jl-yellow);
		text-shadow: 6px 6px 0 var(--jl-ink);
	}

	h1 {
		font-size: clamp(1.6rem, 5vw, 3rem);
	}

	a {
		margin-top: 16px;
		padding: 12px 18px;
		color: var(--jl-ink);
		background: var(--jl-yellow);
		border: 3px solid var(--jl-white);
		box-shadow: 5px 5px 0 var(--jl-ink);
		font-size: 0.78rem;
		font-weight: 600;
		text-decoration: none;
		text-transform: uppercase;
	}
</style>
