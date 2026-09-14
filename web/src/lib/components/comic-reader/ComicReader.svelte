<script module lang="ts">
	import type { Snippet } from 'svelte';

	export interface ReaderPage {
		/** Stable id. It is also the URL hash that restores this page. */
		id: string;
		/** Localized accessible name for the page. */
		label: string;
		content: Snippet;
	}

	/**
	 * `cubic-bezier(0.45, 0, 0.2, 1)` — the same curve as `--jl-paper-ease`.
	 * A dragged sheet has to be positioned frame by frame, so the easing has to
	 * exist in JavaScript too; the duration still comes from the CSS token.
	 */
	function bezier(x1: number, y1: number, x2: number, y2: number) {
		const cx = 3 * x1;
		const bx = 3 * (x2 - x1) - cx;
		const ax = 1 - cx - bx;
		const cy = 3 * y1;
		const by = 3 * (y2 - y1) - cy;
		const ay = 1 - cy - by;
		const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
		const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;
		const slopeX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;

		return (x: number) => {
			let t = x;
			for (let i = 0; i < 6; i += 1) {
				const slope = slopeX(t);
				if (Math.abs(slope) < 1e-6) break;
				t -= (sampleX(t) - x) / slope;
			}
			return sampleY(Math.min(1, Math.max(0, t)));
		};
	}

	const paperEase = bezier(0.45, 0, 0.2, 1);

	/**
	 * Inline size, in pixels, below which a spread stops being two comfortable
	 * pages and becomes two cramped ones. Measured on the book's stage, not the
	 * window, so the reader answers to the room it actually has.
	 */
	const SPREAD_MIN = 800;
</script>

<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { replaceState } from '$app/navigation';
	import { page as appPage } from '$app/state';
	import { format, translator, type Locale } from '$i18n';
	import ComicPager from './ComicPager.svelte';
	import {
		COVER,
		backward,
		cancel,
		canGoBack,
		canGoForward,
		forward,
		goTo,
		pagesInView,
		reflow,
		settle,
		target,
		turnDuration,
		withProgress,
		type ReaderGeometry,
		type ReaderState,
		type TurnDirection
	} from './reader-state';

	interface Props {
		locale: Locale;
		pages: ReaderPage[];
		/** The cover is handed the controls it needs rather than reaching for them. */
		cover: Snippet<[{ enhanced: boolean; open: () => void }]>;
	}

	let { locale, pages, cover }: Props = $props();

	const t = $derived(translator(locale));

	let root = $state<HTMLElement | null>(null);
	let stage = $state<HTMLElement | null>(null);
	let book = $state<HTMLElement | null>(null);
	let sheet = $state<HTMLElement | null>(null);
	let pageEls: HTMLElement[] = $state([]);

	/**
	 * The reader starts inert: the server renders every page in reading order and
	 * only a client that got this far switches on the book presentation.
	 */
	let enhanced = $state(false);
	let pagesPerView = $state<1 | 2>(2);
	let reader = $state<ReaderState>({ mode: 'closed' });
	let dragging = $state(false);

	const geometry = $derived<ReaderGeometry>({ pageCount: pages.length, pagesPerView });
	const turn = $derived(reader.mode === 'turning' ? reader : null);
	const position = $derived(target(reader));
	const opened = $derived(position > COVER);

	// ---------------------------------------------------------------- geometry

	/** The pages the reader is turning to — the only ones that stay interactive. */
	const arriving = $derived(pagesInView(position, geometry));

	/** Everything on screen: the destination, plus whatever is still leaving. */
	const onscreen = $derived(turn ? [...arriving, ...pagesInView(turn.from, geometry)] : arriving);

	/** The leaf in motion: the cover, or the page being turned over. */
	const leaf = $derived.by(() => {
		if (!turn) return null;
		if (turn.from === COVER || turn.to === COVER) return { cover: true, page: 0 };
		const from = pagesInView(turn.from, geometry);
		return {
			cover: false,
			page: turn.direction === 'forward' ? from[from.length - 1] : from[0]
		};
	});

	/**
	 * The page landing in the column the leaf is *not* on. The leaf uncovers its
	 * own column as it lifts, but it only covers the far one past 90°, so that
	 * page cross-fades instead of popping. On mobile there is no far column.
	 */
	const fading = $derived.by(() => {
		if (!turn || !leaf || leaf.cover || pagesPerView === 1) return null;
		const destination = pagesInView(turn.to, geometry);
		return turn.direction === 'forward' ? destination[0] : destination[destination.length - 1];
	});

	// ----------------------------------------------------------------- motion

	/** 0 closed, 1 fully open. Drives the cover angle and the book's offset. */
	const coverProgress = $derived.by(() => {
		if (turn && (turn.from === COVER || turn.to === COVER)) {
			return turn.to === COVER ? 1 - turn.progress : turn.progress;
		}
		return opened ? 1 : 0;
	});

	const coverAngle = $derived(-180 * coverProgress);
	const coverStowed = $derived(opened && !(turn && (turn.from === COVER || turn.to === COVER)));

	const leafAngle = $derived(
		!turn || !leaf || leaf.cover ? 0 : (turn.direction === 'forward' ? -180 : 180) * turn.progress
	);

	/**
	 * How much paper is behind and ahead, in pages. The book shows it the way a
	 * printed one does — as the thickness of the edges on either side — so the
	 * end of the issue is something you can see coming, not something you find.
	 */
	function behind(at: number): number {
		return Math.max(0, at - 1);
	}

	function ahead(at: number): number {
		const inView = pagesInView(at, geometry);
		return pages.length - (inView.length ? inView[inView.length - 1] : 0);
	}

	function between(from: number, to: number, k: number): number {
		return from + (to - from) * k;
	}

	const stackBehind = $derived(
		turn ? between(behind(turn.from), behind(turn.to), turn.progress) : behind(position)
	);

	const stackAhead = $derived(
		turn ? between(ahead(turn.from), ahead(turn.to), turn.progress) : ahead(position)
	);

	/** A closed book is one page wide, so the two-page frame slides over. */
	const bookShift = $derived(pagesPerView === 2 ? -25 * (1 - coverProgress) : 0);

	/** Everything CSS needs to draw the current frame of the turn. */
	const readerStyle = $derived(
		[
			`--jl-turn:${turn ? turn.progress : 1}`,
			`--jl-cover-angle:${coverAngle}deg`,
			`--jl-leaf-angle:${leafAngle}deg`,
			`--jl-book-shift:${bookShift}%`,
			`--jl-stack-behind:${stackBehind / pages.length}`,
			`--jl-stack-ahead:${stackAhead / pages.length}`
		].join('; ')
	);

	const status = $derived.by(() => {
		if (position === COVER) return t('reader.cover');
		const shown = pagesInView(position, geometry);
		return shown.length > 1
			? format(t('reader.statusSpread'), {
					from: shown[0],
					to: shown[shown.length - 1],
					total: pages.length
				})
			: format(t('reader.statusPage'), { page: shown[0], total: pages.length });
	});

	/** Mirrors the CSS tokens; `onMount` reads the real values off the element. */
	const motion = { cover: 800, page: 580, reduced: false };
	let frame = 0;
	let guard: ReturnType<typeof setTimeout> | undefined;

	function readMs(el: Element, property: string, fallback: number): number {
		const raw = getComputedStyle(el).getPropertyValue(property).trim();
		const value = Number.parseFloat(raw);
		if (Number.isNaN(value)) return fallback;
		return raw.endsWith('ms') ? value : value * 1000;
	}

	function tween(to: number, ms: number, done: () => void) {
		stopTween();
		if (reader.mode !== 'turning') return;

		const from = reader.progress;
		const finish = () => {
			stopTween();
			reader = withProgress(reader, to);
			done();
		};

		if (ms <= 0 || from === to) {
			finish();
			return;
		}

		const started = performance.now();
		const step = (now: number) => {
			const k = Math.min(1, (now - started) / ms);
			reader = withProgress(reader, from + (to - from) * paperEase(k));
			if (k < 1) frame = requestAnimationFrame(step);
			else finish();
		};
		frame = requestAnimationFrame(step);

		// A tab that stops painting stops its frame loop with it. The turn still
		// has to end, or a visitor who looks away comes back to a book stuck
		// half-way through a page.
		guard = setTimeout(finish, ms + 150);
	}

	function stopTween() {
		cancelAnimationFrame(frame);
		clearTimeout(guard);
	}

	function commit() {
		if (reader.mode !== 'turning') return;
		const full = motion.reduced ? 0 : turnDuration(reader, motion);
		tween(1, full * (1 - reader.progress), land);
	}

	function abort() {
		if (reader.mode !== 'turning') return;
		const full = motion.reduced ? 0 : turnDuration(reader, motion);
		tween(0, full * reader.progress, () => {
			reader = cancel(reader);
		});
	}

	async function land() {
		const turned = reader;
		reader = settle(reader);
		syncHash();

		await tick();

		// Only when the cover is involved: opening it takes its own open control
		// out of reach, and closing it takes the page away. A page-to-page turn
		// leaves focus where the reader put it.
		if (turned.mode !== 'turning') return;
		if (turned.from !== COVER && turned.to !== COVER) return;

		if (reader.mode === 'open') pageEls[reader.page - 1]?.focus();
		else sheet?.querySelector<HTMLElement>('button')?.focus();
	}

	/** Enter a turn without moving yet, so a drag can carry it. */
	function start(direction: TurnDirection): boolean {
		if (reader.mode === 'turning') return false;
		const next = direction === 'forward' ? forward(reader, geometry) : backward(reader, geometry);
		if (next === reader) return false;
		stopTween();
		reader = next;
		return true;
	}

	/** Run a whole turn on its own — a key press, or the pager. */
	function run(next: ReaderState) {
		if (next === reader) return;
		stopTween();
		reader = next;
		if (next.mode === 'turning') commit();
	}

	// ------------------------------------------------------------------- drag

	interface Drag {
		id: number;
		startX: number;
		startY: number;
		span: number;
		/** Unset until a swipe crosses the threshold and picks a direction. */
		direction: TurnDirection | null;
		moved: boolean;
		lastX: number;
		lastAt: number;
		velocity: number;
	}

	let drag: Drag | null = null;
	let swallowClick = false;

	/** The pointer can be gone by the time we ask for it; that is not an error. */
	function capture(el: HTMLElement | null, pointerId: number) {
		try {
			el?.setPointerCapture(pointerId);
		} catch {
			/* the gesture still works, it just is not captured */
		}
	}

	function release(pointerId: number) {
		try {
			if (book?.hasPointerCapture(pointerId)) book.releasePointerCapture(pointerId);
		} catch {
			/* already gone */
		}
	}

	function span(): number {
		const rect = book?.getBoundingClientRect();
		if (!rect) return 400;
		return pagesPerView === 2 ? rect.width / 2 : rect.width;
	}

	/** A swipe anywhere on the book. Direction is undecided until it is clearly
	    horizontal, so vertical scrolling is never stolen. */
	function onBookDown(event: PointerEvent) {
		if (drag || reader.mode === 'turning' || event.button !== 0) return;
		drag = {
			id: event.pointerId,
			startX: event.clientX,
			startY: event.clientY,
			span: span(),
			direction: null,
			moved: false,
			lastX: event.clientX,
			lastAt: performance.now(),
			velocity: 0
		};
	}

	function onPointerMove(event: PointerEvent) {
		if (!drag || event.pointerId !== drag.id) return;

		const dx = event.clientX - drag.startX;
		const dy = event.clientY - drag.startY;

		if (!drag.direction) {
			if (Math.abs(dx) < 14 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
			const direction: TurnDirection = dx < 0 ? 'forward' : 'backward';
			if (!start(direction)) {
				drag = null;
				return;
			}
			drag.direction = direction;
			// Re-anchor so the sheet picks up from the finger, not from a jump.
			drag.startX = event.clientX;
			drag.lastX = event.clientX;
			dragging = true;
			capture(book, event.pointerId);
		}

		const now = performance.now();
		const elapsed = Math.max(1, now - drag.lastAt);
		const step =
			drag.direction === 'forward' ? drag.lastX - event.clientX : event.clientX - drag.lastX;
		drag.velocity = step / elapsed;
		drag.lastX = event.clientX;
		drag.lastAt = now;
		drag.moved = drag.moved || Math.abs(dx) > 4;

		const travel =
			drag.direction === 'forward' ? drag.startX - event.clientX : event.clientX - drag.startX;
		reader = withProgress(reader, travel / (drag.span * 0.7));
		event.preventDefault();
	}

	function onPointerUp(event: PointerEvent) {
		if (!drag || event.pointerId !== drag.id) return;

		const ended = drag;
		drag = null;
		dragging = false;
		release(event.pointerId);

		if (!ended.direction || reader.mode !== 'turning') return;

		if (ended.moved) {
			// The gesture, not the link under it, is what the visitor meant.
			swallowClick = true;
			setTimeout(() => {
				swallowClick = false;
			});
		}

		const flicked = ended.velocity > 0.45;

		if (flicked || reader.progress > 0.35) commit();
		else abort();
	}

	function onPointerCancel(event: PointerEvent) {
		if (!drag || event.pointerId !== drag.id) return;
		drag = null;
		dragging = false;
		release(event.pointerId);
		if (reader.mode === 'turning') abort();
	}

	function onClickCapture(event: MouseEvent) {
		if (!swallowClick) return;
		event.preventDefault();
		event.stopPropagation();
	}

	// ------------------------------------------------------------- lifecycle

	function pageOf(hash: string): number | null {
		const id = hash.replace(/^#/, '');
		if (!id) return null;
		const index = pages.findIndex((item) => item.id === id);
		return index < 0 ? null : index + 1;
	}

	onMount(() => {
		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

		if (root) {
			motion.cover = readMs(root, '--jl-motion-cover', motion.cover);
			motion.page = readMs(root, '--jl-motion-page', motion.page);
		}

		const applyMotion = () => {
			motion.reduced = reduced.matches;
		};

		const applyLayout = (width: number) => {
			const next = width >= SPREAD_MIN ? 2 : 1;
			if (next === pagesPerView) return;

			pagesPerView = next;
			reader = reflow(reader, { pageCount: pages.length, pagesPerView: next });
			// A spread collapsing to one page changes which page leads the view, so
			// the hash has to follow it.
			if (enhanced) syncHash();
		};

		applyMotion();
		reduced.addEventListener('change', applyMotion);

		/**
		 * How many pages fit is a question about the book, not about the window:
		 * the spec asks for the fallback to follow available inline size rather
		 * than user agent or viewport. A `ResizeObserver` also fires once on
		 * observe and on every later change, so there is no first-read race and
		 * no dependence on a resize event arriving.
		 */
		const observer = new ResizeObserver((entries) => {
			const width = entries[0]?.contentRect.width;
			if (width) applyLayout(width);
		});

		if (stage) {
			// Measure once directly as well: the reader must be laid out correctly
			// from its first frame, not from whenever the observer first delivers.
			applyLayout(stage.getBoundingClientRect().width);
			observer.observe(stage);
		}

		// A hash already in the URL is a reading position, not an animation cue:
		// the book is simply already open there.
		const restored = pageOf(appPage.url.hash);
		if (restored !== null) reader = reflow({ mode: 'open', page: restored }, geometry);

		enhanced = true;

		window.addEventListener('hashchange', onHashChange);
		window.addEventListener('pointermove', onPointerMove, { passive: false });
		window.addEventListener('pointerup', onPointerUp);
		window.addEventListener('pointercancel', onPointerCancel);

		return () => {
			observer.disconnect();
			reduced.removeEventListener('change', applyMotion);
			window.removeEventListener('hashchange', onHashChange);
			window.removeEventListener('pointermove', onPointerMove);
			window.removeEventListener('pointerup', onPointerUp);
			window.removeEventListener('pointercancel', onPointerCancel);
			stopTween();
		};
	});

	/** Someone followed a link to a page — a case file's back link, say. */
	function onHashChange() {
		const wanted = pageOf(window.location.hash);
		if (wanted !== null) run(goTo(reader, wanted, geometry));
	}

	/**
	 * The reading position lives in the hash, so it survives a reload and can be
	 * shared without minting a second URL for the same prerendered page.
	 */
	function syncHash() {
		const id = reader.mode === 'open' ? (pages[reader.page - 1]?.id ?? '') : '';
		// `location` is the authority on the hash: SvelteKit's own page URL does
		// not follow a hash this component wrote through `replaceState`.
		if (window.location.hash.replace(/^#/, '') === id) return;

		const { pathname, search } = appPage.url;
		replaceState(`${pathname}${search}${id ? `#${id}` : ''}`, appPage.state);
	}

	function onKeydown(event: KeyboardEvent) {
		if (!enhanced || event.metaKey || event.ctrlKey || event.altKey) return;

		const el = event.target as HTMLElement | null;
		if (el?.isContentEditable || (el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) return;

		switch (event.key) {
			case 'ArrowRight':
				run(forward(reader, geometry));
				break;
			case 'ArrowLeft':
				run(backward(reader, geometry));
				break;
			case 'Home':
				run(goTo(reader, COVER, geometry));
				break;
			case 'End':
				run(goTo(reader, pages.length, geometry));
				break;
			default:
				return;
		}

		event.preventDefault();
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<section
	class="reader"
	bind:this={root}
	data-enhanced={enhanced ? '' : undefined}
	data-mode={reader.mode}
	data-dragging={dragging ? '' : undefined}
	data-cover-stowed={coverStowed ? '' : undefined}
	data-view={pagesPerView}
	style={readerStyle}
	aria-label={t('reader.label')}
	aria-roledescription={t('reader.roledescription')}
	onkeydown={onKeydown}
>
	<div class="stage" bind:this={stage}>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="book" bind:this={book} onpointerdown={onBookDown} onclickcapture={onClickCapture}>
			<span class="edge behind" aria-hidden="true"></span>
			<span class="edge ahead" aria-hidden="true"></span>

			<div class="sheet" bind:this={sheet} inert={enhanced && opened ? true : undefined}>
				<div class="face front">
					{@render cover({ enhanced, open: () => run(forward(reader, geometry)) })}
				</div>
				<div class="face back" aria-hidden="true"></div>
			</div>

			{#each pages as item, index (item.id)}
				{@const n = index + 1}
				<article
					class="page"
					id={item.id}
					bind:this={pageEls[index]}
					tabindex="-1"
					aria-label={item.label}
					data-side={n % 2 === 1 ? 'left' : 'right'}
					data-in-view={onscreen.includes(n) ? '' : undefined}
					data-arriving={turn && arriving.includes(n) ? '' : undefined}
					data-fading={fading === n ? '' : undefined}
					data-sheet={leaf && !leaf.cover && leaf.page === n ? turn?.direction : undefined}
					inert={enhanced && !arriving.includes(n) ? true : undefined}
				>
					{@render item.content()}
					<p class="folio" aria-hidden="true">{n} / {pages.length}</p>
				</article>
			{/each}
		</div>
	</div>

	{#if enhanced}
		<ComicPager
			{locale}
			{status}
			canBack={canGoBack(reader)}
			canForward={canGoForward(reader, geometry)}
			onprevious={() => run(backward(reader, geometry))}
			onnext={() => run(forward(reader, geometry))}
		/>
	{/if}
</section>

<style>
	/* ------------------------------------------------- the static document --- */

	/* Everything above the `[data-enhanced]` line is what a visitor without
	   JavaScript gets: the cover, then every page, in reading order. */

	.reader {
		position: relative;
		margin-top: var(--jl-gutter);
	}

	.book {
		display: grid;
		gap: var(--jl-gutter);
	}

	.sheet,
	.page {
		position: relative;
		min-width: 0;
	}

	/* A column, so a page that fills its sheet still leaves the folio room at the
	   foot instead of pushing it past the paper's edge. */
	.page {
		display: flex;
		flex-direction: column;
		padding: var(--jl-gutter);
		background: var(--jl-white);
		border: var(--jl-border) solid var(--jl-ink);
		container: jl-page / inline-size;
	}

	/* The first grid inside a page already carries the gutter as a top margin. */
	.page > :global(.jl-grid:first-child) {
		margin-top: 0;
	}

	.folio {
		margin: var(--jl-gutter) 0 0;
		color: var(--jl-ink);
		font-family: var(--jl-font-mono);
		font-size: 0.68rem;
		letter-spacing: 0.12em;
		text-align: center;
	}

	.face.back,
	.edge {
		display: none;
	}

	/* ------------------------------------------------------------- the book -- */

	.reader[data-enhanced] .stage {
		perspective: 2400px;
		perspective-origin: 50% 40%;
	}

	.reader[data-enhanced] .book {
		position: relative;
		gap: 0;
		/* Vertical scrolling stays the browser's; horizontal is the page turn. */
		touch-action: pan-y;
		transform: translateX(var(--jl-book-shift, 0%));
		transform-style: preserve-3d;
	}

	/* The whole book is the handle; links inside it keep their own pointer. */
	.reader[data-enhanced] .book {
		cursor: grab;
	}

	.reader[data-enhanced][data-dragging] .book {
		cursor: grabbing;
		user-select: none;
	}

	.reader[data-enhanced][data-view='2'] .book {
		grid-template-columns: 1fr 1fr;
	}

	.reader[data-enhanced][data-view='1'] .book {
		grid-template-columns: 1fr;
	}

	/* Every page shares one grid cell row, so the book keeps a single height and
	   a turn never shifts the layout around it. */
	.reader[data-enhanced] :is(.sheet, .page) {
		grid-row: 1;
		box-shadow: 0 20px 44px rgb(0 0 0 / 0.42);
	}

	.reader[data-enhanced][data-view='1'] :is(.sheet, .page) {
		grid-column: 1;
	}

	.reader[data-enhanced][data-view='2'] .sheet,
	.reader[data-enhanced][data-view='2'] .page[data-side='right'] {
		grid-column: 2;
	}

	.reader[data-enhanced][data-view='2'] .page[data-side='left'] {
		grid-column: 1;
	}

	/* Inside a `preserve-3d` context paint order comes from position in space,
	   not from `z-index`, so the stack is expressed in millimetres of depth. */
	.reader[data-enhanced] .page {
		visibility: hidden;
		transform: translateZ(0);
	}

	.reader[data-enhanced] .page[data-in-view] {
		visibility: visible;
	}

	.reader[data-enhanced] .page[data-arriving] {
		transform: translateZ(1px);
	}

	.reader[data-enhanced] .page[data-fading] {
		opacity: calc(var(--jl-turn, 1) * 1.8);
	}

	.reader[data-enhanced] .page:focus-visible {
		outline: 4px solid var(--jl-yellow);
		outline-offset: -4px;
	}

	/* --------------------------------------------------------- turning leaf -- */

	.reader[data-enhanced] .page[data-sheet] {
		backface-visibility: hidden;
		transform: translateZ(2px) rotateY(var(--jl-leaf-angle, 0deg));
		transform-style: preserve-3d;
	}

	.reader[data-enhanced] .page[data-sheet='forward'] {
		transform-origin: left center;
	}

	.reader[data-enhanced] .page[data-sheet='backward'] {
		transform-origin: right center;
	}

	/* The back of the leaf in motion: bare paper, the way a printed issue has it. */
	.reader[data-enhanced] .page[data-sheet]::after {
		content: '';
		position: absolute;
		inset: 0;
		backface-visibility: hidden;
		background: linear-gradient(118deg, #efe9dc, #cfc7b4);
		border: var(--jl-border) solid var(--jl-ink);
		box-shadow: inset 0 0 70px rgb(5 7 12 / 0.3);
		transform: rotateY(180deg);
	}

	/* ------------------------------------------------------------ the cover -- */

	.reader[data-enhanced] .sheet {
		transform: translateZ(3px) rotateY(var(--jl-cover-angle, 0deg));
		transform-origin: left center;
		transform-style: preserve-3d;
	}

	/* Fully open, the cover lies exactly over the left page: hiding it there is
	   seamless, and it keeps the cover out of the reading order. */
	.reader[data-enhanced][data-cover-stowed] .sheet {
		visibility: hidden;
	}

	.reader[data-enhanced] .face {
		backface-visibility: hidden;
	}

	.reader[data-enhanced] .face.front {
		height: 100%;
	}

	.reader[data-enhanced] .face.back {
		display: block;
		position: absolute;
		inset: 0;
		background: linear-gradient(118deg, #efe9dc, #cfc7b4);
		border: var(--jl-border) solid var(--jl-ink);
		box-shadow: inset 0 0 70px rgb(5 7 12 / 0.3);
		transform: rotateY(180deg);
	}

	/* The gutter shadow where two pages meet the spine. */
	.reader[data-enhanced][data-view='2'] .book::after {
		content: '';
		position: absolute;
		inset-block: 0;
		left: calc(50% - 15px);
		width: 30px;
		opacity: calc((100% - var(--jl-book-shift, 0%)) / 100%);
		background: linear-gradient(
			90deg,
			transparent,
			rgb(5 7 12 / 0.3) 40%,
			rgb(5 7 12 / 0.46) 50%,
			rgb(5 7 12 / 0.3) 60%,
			transparent
		);
		pointer-events: none;
		transform: translateZ(4px);
	}

	/* ------------------------------------------------------- the page edges -- */

	/* The only indicator the comic has, and it is not a control: the thickness of
	   the paper still to read on one side and already read on the other. When the
	   right-hand stack runs out, the issue is over. */
	.reader[data-enhanced] .edge {
		display: block;
		position: absolute;
		top: 9px;
		bottom: 9px;
		width: calc(var(--jl-edge, clamp(6px, 1.4vw, 15px)) * var(--jl-fill, 0));
		background: repeating-linear-gradient(90deg, #efe9dc 0 1px, #b3ab99 1px 2px);
		pointer-events: none;
		transform: translateZ(-1px);
	}

	.reader[data-enhanced] .edge.behind {
		--jl-fill: var(--jl-stack-behind, 0);

		right: 100%;
		border-radius: 3px 0 0 3px;
		box-shadow: -3px 14px 26px rgb(0 0 0 / 0.42);
	}

	.reader[data-enhanced] .edge.ahead {
		--jl-fill: var(--jl-stack-ahead, 0);

		left: 100%;
		border-radius: 0 3px 3px 0;
		box-shadow: 3px 14px 26px rgb(0 0 0 / 0.42);
	}

	/* Motion is the presentation, never the content: with it switched off the
	   book still opens and turns, it just stops travelling to get there. */
	@media (prefers-reduced-motion: reduce) {
		.reader[data-enhanced] .edge {
			transition: none;
		}
	}
</style>
