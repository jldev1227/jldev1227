<script module lang="ts">
	import type { Snippet } from 'svelte';

	export interface ReaderPage {
		/** Stable id. It is also the URL hash that restores this page. */
		id: string;
		/** Localized accessible name for the page. */
		label: string;
		/**
		 * Rendered with the page's own id, so one snippet can stand in for a run
		 * of pages that differ only by which record they are printing. Snippets
		 * that do not need it simply take no argument.
		 */
		content: Snippet<[string]>;
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
		/** Disable when a parent experience owns the URL hash. */
		manageHash?: boolean;
		/** The cover is handed the controls it needs rather than reaching for them. */
		cover: Snippet<[{ enhanced: boolean; open: () => void }]>;
	}

	let { locale, pages, manageHash = true, cover }: Props = $props();

	const t = $derived(translator(locale));

	let root = $state<HTMLElement | null>(null);
	let stage = $state<HTMLElement | null>(null);
	let book = $state<HTMLElement | null>(null);
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

	// ---------------------------------------------------------------- geometry

	type Face = { kind: 'cover' } | { kind: 'page'; page: number } | { kind: 'blank' };

	interface Leaf {
		index: number;
		front: Face;
		back: Face;
	}

	function faceFor(page: number): Face {
		return page <= pages.length ? { kind: 'page', page } : { kind: 'blank' };
	}

	/**
	 * A leaf is one physical sheet, printed on both sides: the cover is the front
	 * of the first one and page 1 is its back, page 2 is the front of the second
	 * and page 3 its back, and so on. That is what makes a turn read as paper —
	 * the page arriving is *carried over* by the sheet in motion rather than
	 * lying there, already visible, waiting for it to fall.
	 */
	const leaves = $derived.by(() => {
		const sheets: Leaf[] = [{ index: 0, front: { kind: 'cover' }, back: faceFor(1) }];
		for (let k = 1; 2 * k - 1 <= pages.length; k += 1) {
			sheets.push({ index: k, front: faceFor(2 * k), back: faceFor(2 * k + 1) });
		}
		return sheets;
	});

	/** The pages the reader is turning to — the only ones that stay interactive. */
	const arriving = $derived(pagesInView(position, geometry));

	/** How many sheets are lying turned to the left at a given position. */
	function turnedAt(at: number): number {
		return at <= COVER ? 0 : Math.ceil(at / 2);
	}

	/** On a spread the sheet in motion is a whole leaf; both its faces ride it. */
	const movingLeaf = $derived(
		turn && pagesPerView === 2 ? Math.min(turnedAt(turn.from), turnedAt(turn.to)) : -1
	);

	/**
	 * One page at a time has no facing page to carry, so there the sheet is the
	 * single face: it lifts off the stack taking its own content with it. Face
	 * `n` is position `n` — face 0 is the cover, face 1 is page 1.
	 */
	const movingFace = $derived(
		turn && pagesPerView === 1 ? (turn.direction === 'forward' ? turn.from : turn.to) : -1
	);

	function leafAngle(index: number): number {
		if (pagesPerView === 1) return 0;

		const from = turnedAt(turn ? turn.from : position);
		const to = turnedAt(turn ? turn.to : position);

		if (turn && index === movingLeaf) {
			return to > from ? -180 * turn.progress : -180 * (1 - turn.progress);
		}
		return index < Math.min(from, to) ? -180 : 0;
	}

	/**
	 * Inside a `preserve-3d` context paint order comes from position in space,
	 * not from `z-index`: the unread stack counts down from the top sheet, the
	 * read one counts up, and whatever is in flight sits above both.
	 */
	function leafDepth(index: number): number {
		if (index === movingLeaf) return leaves.length + 2;
		return leafAngle(index) <= -90 ? index + 1 : leaves.length - index;
	}

	/**
	 * Only the top of each stack is ever seen: the sheet lying on the left, the
	 * one waiting on the right, and whatever is in flight between them. The rest
	 * are hidden rather than merely covered, because Chromium's hit testing does
	 * not sort a `preserve-3d` subtree by depth the way its painting does — a
	 * buried sheet still paints behind, but it would swallow the clicks.
	 */
	function leafShown(index: number): boolean {
		if (pagesPerView === 1) return true;

		const from = turnedAt(turn ? turn.from : position);
		const to = turnedAt(turn ? turn.to : position);
		return index >= Math.min(from, to) - 1 && index <= Math.max(from, to);
	}

	function faceAngle(at: number): number {
		if (pagesPerView === 2 || !turn || at !== movingFace) return 0;
		return turn.direction === 'forward' ? -180 * turn.progress : -180 * (1 - turn.progress);
	}

	/**
	 * Only the pages actually being read take the pointer. A face turned away is
	 * hidden by `backface-visibility`, but Chromium still hit tests it, so the
	 * back of a sheet would otherwise swallow the clicks meant for its front.
	 */
	function faceLive(face: Face): boolean {
		if (face.kind === 'blank') return false;
		if (face.kind === 'cover') return position === COVER;
		return arriving.includes(face.page);
	}

	function faceShown(at: number): boolean {
		if (pagesPerView === 2) return true;
		return at === position || at === movingFace;
	}

	// ----------------------------------------------------------------- motion

	/** 0 closed, 1 fully open — the first leaf's angle, read as a fraction. */
	const coverProgress = $derived(Math.min(1, -leafAngle(0) / 180));

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
			`--jl-book-shift:${bookShift}%`,
			`--jl-spine-z:${leaves.length + 1}`,
			`--jl-stack-behind:${stackBehind / pages.length}`,
			`--jl-stack-ahead:${stackAhead / pages.length}`
		].join('; ')
	);

	/** The reading position, in words, for the pager's live region. */
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

		if (reader.mode === 'open') pageEls[reader.page]?.focus();
		else root?.querySelector<HTMLElement>('.cover button')?.focus();
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
			if (enhanced && manageHash) syncHash();
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
		if (manageHash) {
			const restored = pageOf(appPage.url.hash);
			if (restored !== null) reader = reflow({ mode: 'open', page: restored }, geometry);
		}

		enhanced = true;

		if (manageHash) window.addEventListener('hashchange', onHashChange);
		window.addEventListener('pointermove', onPointerMove, { passive: false });
		window.addEventListener('pointerup', onPointerUp);
		window.addEventListener('pointercancel', onPointerCancel);

		return () => {
			observer.disconnect();
			reduced.removeEventListener('change', applyMotion);
			if (manageHash) window.removeEventListener('hashchange', onHashChange);
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
		if (!manageHash) return;
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

<!--
	One face of one sheet. On a spread the leaf around it does the turning and the
	face just rides; on a single page the face is the sheet itself.
-->
{#snippet side(face: Face, at: number, which: 'front' | 'back')}
	<div
		class="face {which}"
		data-shown={faceShown(at) ? '' : undefined}
		data-live={faceLive(face) ? '' : undefined}
		style="--jl-face-angle:{faceAngle(at)}deg; --jl-face-z:{at === movingFace ? 2 : 1}"
	>
		{#if face.kind === 'cover'}
			{@render cover({ enhanced, open: () => run(forward(reader, geometry)) })}
		{:else if face.kind === 'page'}
			<article
				class="page"
				id={pages[face.page - 1].id}
				bind:this={pageEls[face.page]}
				tabindex="-1"
				aria-label={pages[face.page - 1].label}
				inert={enhanced && !arriving.includes(face.page) ? true : undefined}
			>
				{@render pages[face.page - 1].content(pages[face.page - 1].id)}
				<p class="folio" aria-hidden="true">{face.page} / {pages.length}</p>
			</article>
		{:else}
			<div class="paper" aria-hidden="true"></div>
		{/if}
	</div>
{/snippet}

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<section
	class="reader"
	bind:this={root}
	data-enhanced={enhanced ? '' : undefined}
	data-mode={reader.mode}
	data-dragging={dragging ? '' : undefined}
	data-view={pagesPerView}
	style={readerStyle}
	aria-label={t('reader.label')}
	aria-roledescription={t('reader.roledescription')}
	onkeydown={onKeydown}
>
	<div class="stage" bind:this={stage}>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="book"
			bind:this={book}
			onpointerdown={onBookDown}
			onclickcapture={onClickCapture}
			ondragstart={(event) => event.preventDefault()}
		>
			<span class="edge behind" aria-hidden="true"></span>
			<span class="edge ahead" aria-hidden="true"></span>
			<span class="gauge" aria-hidden="true"></span>

			{#each leaves as sheet (sheet.index)}
				<div
					class="leaf"
					data-shown={leafShown(sheet.index) ? '' : undefined}
					style="--jl-leaf-angle:{leafAngle(sheet.index)}deg; --jl-leaf-z:{leafDepth(sheet.index)}"
				>
					{@render side(sheet.front, sheet.index * 2, 'front')}
					{@render side(sheet.back, sheet.index * 2 + 1, 'back')}
				</div>
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
	   JavaScript gets. There a leaf is not a sheet, only a wrapper: the cover and
	   then every page, straight down the document in reading order. */

	.reader {
		position: relative;
		margin-top: var(--jl-gutter);
	}

	.book {
		display: grid;
		gap: var(--jl-gutter);
	}

	.leaf,
	.face {
		display: contents;
	}

	/* A column, so a page that fills its sheet still leaves the folio room at the
	   foot instead of pushing it past the paper's edge. */
	.page {
		position: relative;
		display: flex;
		flex-direction: column;
		min-width: 0;
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

	/* The inside of the back cover, the page edges and the size gauge: all
	   presentation, none of it in the served document. */
	.paper,
	.edge,
	.gauge {
		display: none;
	}

	/* ------------------------------------------------------------- the book -- */

	/*
	 * The perspective sits on the book, not above it, and the book stays flat.
	 * Each leaf is then its own 3D context: it flips its two faces in space
	 * while the sheets themselves stack as ordinary siblings, which is the only
	 * way `z-index` and — more importantly — hit testing stay reliable. Inside
	 * one shared `preserve-3d` context Chromium paints by depth but hit tests by
	 * document order, so a sheet underneath was catching clicks meant for the
	 * one on top.
	 */
	.reader[data-enhanced] .book {
		perspective: 1800px;
		perspective-origin: 50% 50%;
	}

	/* The page is something you take hold of, so nothing inside it may start a
	   selection or the browser's own drag-and-drop: both fight the gesture, and
	   dragging from a case file used to hand the pointer to a native link drag. */
	.reader[data-enhanced] .book {
		position: relative;
		gap: 0;
		cursor: grab;
		user-select: none;
		-webkit-user-select: none;
		/* Vertical scrolling stays the browser's; horizontal is the page turn. */
		touch-action: pan-y;
		transform: translateX(var(--jl-book-shift, 0%));
	}

	.reader[data-enhanced][data-dragging] .book {
		cursor: grabbing;
	}

	/* The pages come in as snippets from the route, so they are outside this
	   component's style scope. */
	.reader[data-enhanced] .book :global(:is(a, img)) {
		-webkit-user-drag: none;
	}

	.reader[data-enhanced][data-view='2'] .book {
		grid-template-columns: 1fr 1fr;
	}

	.reader[data-enhanced][data-view='1'] .book {
		grid-template-columns: 1fr;
	}

	.reader[data-enhanced] .page {
		height: 100%;
	}

	.reader[data-enhanced] .page:focus-visible {
		outline: 4px solid var(--jl-yellow);
		outline-offset: -4px;
	}

	/* Bare board: decoration, and never a thing to click through the sheet that
	   is actually on top. */
	.reader[data-enhanced] .paper {
		display: block;
		pointer-events: none;
		background: linear-gradient(118deg, #efe9dc, #cfc7b4);
		border: var(--jl-border) solid var(--jl-ink);
		box-shadow: inset 0 0 70px rgb(5 7 12 / 0.3);
	}

	/* Every issue of the collection is printed at the same page size. Content
	   decides how tall a page *may* be; this decides how tall one always *is*,
	   so a short issue is not a squatter book than a long one. It is an empty
	   grid item in the page column: percentage padding resolves against that
	   column's width, which is exactly the page's width. */
	.reader[data-enhanced] .gauge {
		display: block;
		grid-row: 1;
		padding-top: calc(100% / var(--jl-page-ratio, 0.66));
		pointer-events: none;
	}

	.reader[data-enhanced][data-view='2'] .gauge {
		grid-column: 2;
	}

	.reader[data-enhanced][data-view='1'] .gauge {
		grid-column: 1;
	}

	/* ------------------------------------------------------------ the spread -- */

	/* Every leaf shares one grid cell, so the book keeps a single height and the
	   sheets stack on the right until they are turned onto the left. */
	.reader[data-enhanced][data-view='2'] .leaf {
		display: grid;
		grid-row: 1;
		grid-column: 2;
		z-index: var(--jl-leaf-z, 1);
		box-shadow: 0 18px 40px rgb(0 0 0 / 0.38);
		transform: rotateY(var(--jl-leaf-angle, 0deg));
		transform-origin: left center;
		transform-style: preserve-3d;
	}

	.reader[data-enhanced][data-view='2'] .leaf:not([data-shown]) {
		visibility: hidden;
	}

	.reader[data-enhanced][data-view='2'] .face {
		display: grid;
		grid-area: 1 / 1;
		backface-visibility: hidden;
	}

	.reader[data-enhanced] .face:not([data-live]) {
		pointer-events: none;
	}

	/* The back of the sheet is a real page, printed the other way round. */
	.reader[data-enhanced][data-view='2'] .face.back {
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
		z-index: var(--jl-spine-z, 5);
	}

	/* -------------------------------------------------------- one at a time -- */

	/* A single page has no facing page to carry, so the leaf stops being a sheet
	   and each face becomes one: it lifts off the stack with its own content and
	   uncovers the next, the way a card leaves the top of a deck. */
	.reader[data-enhanced][data-view='1'] .leaf {
		display: contents;
	}

	.reader[data-enhanced][data-view='1'] .face {
		display: grid;
		grid-area: 1 / 1;
		visibility: hidden;
		backface-visibility: hidden;
		z-index: var(--jl-face-z, 1);
		box-shadow: 0 18px 40px rgb(0 0 0 / 0.38);
		transform: rotateY(var(--jl-face-angle, 0deg));
		transform-origin: left center;
	}

	.reader[data-enhanced][data-view='1'] .face[data-shown] {
		visibility: visible;
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
		z-index: 0;
		pointer-events: none;
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
</style>
