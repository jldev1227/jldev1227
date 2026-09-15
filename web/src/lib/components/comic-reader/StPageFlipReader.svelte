<script lang="ts">
	import { onMount } from 'svelte';
	import { format, translator, type Locale } from '$i18n';
	import type { PageFlip } from 'page-flip';
	import type { ReaderPage } from './ComicReader.svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		locale: Locale;
		pages: ReaderPage[];
		initialPage?: number;
		onpagechange?: (page: number) => void;
		cover: Snippet<[{ enhanced: boolean; open: () => void }]>;
	}

	let { locale, pages, initialPage = 0, onpagechange = () => {}, cover }: Props = $props();
	const t = $derived(translator(locale));

	let root = $state<HTMLElement | null>(null);
	let bookRoot = $state<HTMLElement | null>(null);
	let enhanced = $state(false);
	let currentPage = $state(0);
	let engine: PageFlip | null = null;

	const status = $derived(
		currentPage === 0
			? t('reader.cover')
			: format(t('reader.statusPage'), { page: currentPage, total: pages.length })
	);

	onMount(() => {
		let alive = true;
		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
		currentPage = Math.min(Math.max(initialPage, 0), pages.length);

		void import('page-flip').then(({ PageFlip }) => {
			if (!alive || !bookRoot) return;

			const pageElements = Array.from(
				bookRoot.querySelectorAll<HTMLElement>(':scope > .flip-page')
			);
			engine = new PageFlip(bookRoot, {
				width: 440,
				height: 660,
				size: 'stretch',
				minWidth: 280,
				maxWidth: 520,
				minHeight: 420,
				maxHeight: 780,
				startPage: currentPage,
				autoSize: true,
				showCover: true,
				usePortrait: true,
				drawShadow: !reduced.matches,
				maxShadowOpacity: 0.48,
				flippingTime: reduced.matches ? 160 : 720,
				mobileScrollSupport: true,
				clickEventForward: true,
				showPageCorners: !reduced.matches,
				disableFlipByClick: true,
				useMouseEvents: true,
				swipeDistance: 24
			});

			engine.on<number>('flip', ({ data }) => {
				currentPage = Math.min(Math.max(Number(data), 0), pages.length);
				onpagechange(currentPage);
			});
			engine.loadFromHTML(pageElements);
			enhanced = true;
			root?.focus();
		});

		return () => {
			alive = false;
			if (engine) {
				engine.off('flip');
				engine.destroy();
				engine = null;
			}
		};
	});

	function onkeydown(event: KeyboardEvent) {
		if (!engine || event.metaKey || event.ctrlKey || event.altKey) return;
		const target = event.target as HTMLElement | null;
		if (target?.isContentEditable || (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) {
			return;
		}

		if (event.key === 'ArrowRight') engine.flipNext('bottom');
		else if (event.key === 'ArrowLeft') engine.flipPrev('bottom');
		else if (event.key === 'Home') engine.turnToPage(0);
		else if (event.key === 'End') engine.turnToPage(pages.length);
		else return;

		event.preventDefault();
	}
</script>

<svelte:window {onkeydown} />

<!-- StPageFlip owns only `.engine-root`. This boundary contains the library's
     DOM moves and lets the rest of the Svelte experience remain declarative. -->
<section
	class="st-reader"
	class:enhanced
	bind:this={root}
	tabindex="-1"
	aria-label={t('reader.label')}
	aria-roledescription={t('reader.roledescription')}
>
	<div class="engine-root" bind:this={bookRoot}>
		<div class="flip-page cover-page" data-density="hard">
			{@render cover({ enhanced: false, open: () => engine?.flipNext('bottom') })}
		</div>

		{#each pages as page, index (page.id)}
			<article class="flip-page content-page" id={page.id} aria-label={page.label}>
				<div class="page-content">{@render page.content(page.id)}</div>
				<p class="folio" aria-hidden="true">{index + 1} / {pages.length}</p>
			</article>
		{/each}

		<!-- `showCover` needs a final hard sheet. It is neutral endpaper, not a
		     browsable back-cover state or another control. -->
		<div class="flip-page endpaper" data-density="hard" aria-hidden="true"></div>
	</div>

	<p class="reading-status">
		<span aria-live="polite">{status}</span>
		<small>{t('reader.hint')}</small>
	</p>
</section>

<style>
	.st-reader {
		position: relative;
		display: grid;
		place-items: center;
		width: 100%;
		min-height: 100svh;
		padding: clamp(52px, 8vh, 88px) clamp(10px, 3vw, 36px) 42px;
		outline: none;
		background:
			radial-gradient(circle at 50% 46%, rgb(255 253 246 / 0.11), transparent 38%), var(--jl-ink);
	}

	.engine-root {
		width: 100%;
		filter: drop-shadow(0 24px 30px rgb(0 0 0 / 0.55));
	}

	/* Before enhancement the document remains readable in normal page order. */
	.engine-root:not(.stf__parent) {
		display: grid;
		gap: var(--jl-gutter);
		max-width: 760px;
	}

	.flip-page {
		box-sizing: border-box;
		overflow: hidden;
		background: var(--jl-white);
		border: var(--jl-border) solid var(--jl-ink);
		container: jl-page / inline-size;
	}

	.cover-page > :global(*) {
		height: 100%;
	}

	.content-page {
		position: relative;
		display: flex;
		flex-direction: column;
		min-width: 0;
		padding: var(--jl-gutter);
	}

	.page-content {
		display: flex;
		flex: 1;
		height: 100%;
		min-height: 0;
		flex-direction: column;
	}

	.page-content > :global(.jl-grid:first-child) {
		margin-top: 0;
	}

	.folio {
		position: absolute;
		right: var(--jl-gutter);
		bottom: calc(var(--jl-gutter) / 2);
		z-index: 20;
		margin: 0;
		padding: 2px 5px;
		color: var(--jl-ink);
		background: rgb(255 253 246 / 0.82);
		font-family: var(--jl-font-mono);
		font-size: 0.68rem;
		text-align: right;
	}

	.endpaper {
		background:
			repeating-linear-gradient(0deg, rgb(5 7 12 / 0.035) 0 1px, transparent 1px 5px), #eee6d6;
	}

	.reading-status {
		position: absolute;
		left: 50%;
		bottom: 10px;
		z-index: 30;
		margin: 0;
		padding: 7px 11px;
		color: var(--jl-on-dark-dim);
		background: rgb(5 7 12 / 0.78);
		font-family: var(--jl-font-mono);
		font-size: 0.64rem;
		letter-spacing: 0.06em;
		text-align: center;
		text-transform: uppercase;
		pointer-events: none;
	}

	.reading-status span,
	.reading-status small {
		display: block;
	}

	.reading-status small {
		margin-top: 2px;
		font-size: 0.58rem;
	}

	.st-reader :global(.stf__block) {
		perspective: 2200px;
	}

	.st-reader :global(.stf__item) {
		box-sizing: border-box;
		-webkit-user-select: none;
		user-select: none;
	}

	.st-reader :global(.stf__item :is(a, img)) {
		-webkit-user-drag: none;
	}

	@media (width < 700px) {
		.st-reader {
			padding-inline: 4px;
		}

		.reading-status {
			bottom: 6px;
			max-width: calc(100% - 16px);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.engine-root {
			filter: drop-shadow(0 12px 18px rgb(0 0 0 / 0.45));
		}
	}
</style>
