<script lang="ts">
	import { identity } from '$content/site';
	import { translator, type Locale } from '$i18n';

	interface Props {
		locale: Locale;
	}

	let { locale }: Props = $props();

	const t = $derived(translator(locale));
	const year = new Date().getFullYear();
</script>

<footer>
	<span class="jl-kicker">{t('footer.rights')}</span>
	<span class="jl-kicker">© {year} {identity.name} · {identity.domain}</span>
</footer>

<style>
	footer {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding: 16px 18px;
		color: var(--jl-on-dark-dim);
		background: var(--jl-ink);
		border: var(--jl-border) solid var(--jl-ink);
		border-top: 0;
	}
</style>
