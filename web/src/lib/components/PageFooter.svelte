<script lang="ts">
	import { identity } from '$content/site';
	import { homePath, translator, type Locale } from '$i18n';

	interface Props {
		locale: Locale;
	}

	let { locale }: Props = $props();

	const t = $derived(translator(locale));
	const year = new Date().getFullYear();
</script>

<footer class="site-footer">
	<div class="footer-main">
		<a class="footer-brand" href={homePath(locale)} aria-label={identity.alias}>
			<img src="/brand/jldev-mark.svg" alt="" width="52" height="52" />
			<span>{identity.alias}<small>{identity.handle}</small></span>
		</a>
		<nav aria-label={t('nav.primary')}>
			<a href={`${homePath(locale)}#origin`}>{t('nav.origin')}</a>
			<a href={`${homePath(locale)}#missions`}>{t('nav.missions')}</a>
			<a href={`${homePath(locale)}#contact`}>{t('nav.contact')}</a>
		</nav>
	</div>
	<div class="footer-bottom">
		<span>{t('footer.rights')}</span>
		<span>© {year} {identity.name} · {identity.domain}</span>
	</div>
</footer>

<style>
	.site-footer {
		padding: 36px clamp(24px, 7.4vw, 116px) 24px;
		background: #fff1d0;
		color: #720914;
	}

	.footer-main,
	.footer-bottom {
		display: flex;
		max-width: 1680px;
		align-items: center;
		justify-content: space-between;
		gap: 24px;
		margin-inline: auto;
	}

	.footer-main {
		padding-bottom: 34px;
	}

	.footer-brand {
		display: inline-flex;
		align-items: center;
		gap: 12px;
		color: inherit;
		font:
			800 1.25rem/1 'Inter',
			sans-serif;
		letter-spacing: 0.08em;
		text-decoration: none;
	}

	.footer-brand img {
		width: 52px;
		height: 52px;
		flex: none;
	}

	.footer-brand small {
		display: block;
		margin-top: 7px;
		color: #bd1328;
		font:
			700 0.67rem/1 'Inter',
			sans-serif;
		letter-spacing: 0.15em;
	}

	nav {
		display: flex;
		flex-wrap: wrap;
		gap: clamp(18px, 3vw, 44px);
	}

	nav a {
		color: #720914;
		font:
			700 0.72rem/1.3 'Inter',
			sans-serif;
		letter-spacing: 0.12em;
		text-decoration: none;
		text-transform: uppercase;
		transition: color 160ms ease;
	}

	nav a:hover {
		color: #bd1328;
	}

	.footer-bottom {
		padding-top: 20px;
		border-top: 1px solid rgb(114 9 20 / 0.18);
		color: #815058;
		font:
			500 0.72rem/1.5 'Inter',
			sans-serif;
		letter-spacing: 0.04em;
	}

	:global(.site-footer a:focus-visible) {
		outline: 2px solid #720914;
		outline-offset: 5px;
	}

	@media (max-width: 650px) {
		.site-footer {
			padding: 34px 24px 26px;
		}

		.footer-main,
		.footer-bottom {
			align-items: flex-start;
			flex-direction: column;
		}

		.footer-main {
			gap: 34px;
		}

		.footer-bottom {
			gap: 7px;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		nav a {
			transition: none;
		}
	}
</style>
