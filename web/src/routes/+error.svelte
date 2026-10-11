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
