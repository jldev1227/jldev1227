<script lang="ts">
	import { translator, type Locale } from '$i18n';

	interface Props {
		locale: Locale;
		/** Already-localized reading position, e.g. `Pages 1–2 of 2`. */
		status: string;
		canBack: boolean;
		canForward: boolean;
		onprevious: () => void;
		onnext: () => void;
	}

	let { locale, status, canBack, canForward, onprevious, onnext }: Props = $props();

	const t = $derived(translator(locale));
</script>

<nav class="pager" aria-label={t('reader.label')}>
	<button type="button" onclick={onprevious} disabled={!canBack}>
		<span aria-hidden="true">←</span>
		{t('reader.previous')}
	</button>

	<p class="status">
		<span aria-live="polite">{status}</span>
		<small>{t('reader.hint')}</small>
	</p>

	<button type="button" onclick={onnext} disabled={!canForward}>
		{t('reader.next')}
		<span aria-hidden="true">→</span>
	</button>
</nav>

<style>
	/* The comic has no chrome: the page corners are the controls. This pair stays
	   in the document for keyboard and screen-reader users and is invisible until
	   it takes focus, at which point it shows itself the way the skip link does.
	   It is never `display: none` — the status below it is a live region. */
	.pager {
		position: absolute;
		left: 50%;
		bottom: 12px;
		z-index: 30;
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 10px 14px;
		color: var(--jl-white);
		background: var(--jl-ink);
		border: var(--jl-border) solid var(--jl-ink);
		opacity: 0;
		pointer-events: none;
		transform: translate(-50%, 130%);
		transition:
			transform var(--jl-motion-panel) var(--jl-paper-ease),
			opacity var(--jl-motion-panel) var(--jl-paper-ease);
	}

	.pager:focus-within {
		opacity: 1;
		pointer-events: auto;
		transform: translate(-50%, 0);
	}

	button {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 9px 15px;
		color: var(--jl-ink);
		background: var(--jl-yellow);
		border: 3px solid var(--jl-ink);
		box-shadow: 4px 4px 0 var(--jl-red);
		font-family: var(--jl-font-body);
		font-size: 0.72rem;
		font-weight: 600;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		cursor: pointer;
	}

	button:disabled {
		color: var(--jl-on-dark-dim);
		background: #1b2a43;
		border-color: #2c3b55;
		box-shadow: none;
		cursor: default;
	}

	.status {
		min-width: 0;
		margin: 0;
		font-family: var(--jl-font-mono);
		font-size: 0.72rem;
		font-weight: 500;
		letter-spacing: 0.08em;
		text-align: center;
		text-transform: uppercase;
	}

	.status span {
		display: block;
	}

	.status small {
		display: block;
		margin-top: 3px;
		color: var(--jl-on-dark-dim);
		font-size: 0.62rem;
		letter-spacing: 0.05em;
	}
</style>
