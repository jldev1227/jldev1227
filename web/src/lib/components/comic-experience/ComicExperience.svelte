<script module lang="ts">
	import type { CoverIssue, ReaderPage } from '$lib/components/comic-reader';

	export interface ExperienceVolume {
		id: string;
		/** Canonical fallback destination when JavaScript is unavailable. */
		href: string;
		title: string;
		cover: CoverIssue;
		pages: ReaderPage[];
	}
</script>

<script lang="ts">
	import { pushState, replaceState } from '$app/navigation';
	import { page as appPage } from '$app/state';
	import { tick, untrack } from 'svelte';
	import { ComicCover, ComicReader, PAGE_RATIO, SPREAD_MIN } from '$lib/components/comic-reader';
	import { format, translator, type Locale } from '$i18n';
	import { ART_SIZES, ROOM_WIDTHS, responsiveArt } from '$lib/images';
	import ComicGrid from './ComicGrid.svelte';
	import {
		BROWSE,
		fromHash,
		isSame,
		reduce,
		toHash,
		type Catalogue,
		type ExperienceEvent,
		type ExperienceState
	} from './experience-state';

	/**
	 * The archive: a grid of covers, and the issue that is open on top of it.
	 *
	 * Two application states, `browse` and `read`. Reading happens in a modal
	 * dialog over the grid rather than on a page of its own, so the collection
	 * is still there when the issue closes and focus has somewhere to go back
	 * to. The dialog is the browser's: it traps focus, makes the grid inert and
	 * answers Escape without any of that being written here. The book inside it
	 * is `ComicReader`, the same hand-written sheets the mission routes turn.
	 */

	interface Props {
		locale: Locale;
		volumes: ExperienceVolume[];
	}

	let { locale, volumes }: Props = $props();
	const t = $derived(translator(locale));

	/** The backdrop is the one full-bleed image here, so it rides its own ladder. */
	const room = responsiveArt('/art/library-experience/bg-room.jpg', ROOM_WIDTHS, 1440);
	const catalogue = $derived<Catalogue>(
		volumes.map((volume) => ({ id: volume.id, pageCount: volume.pages.length }))
	);

	let experience = $state<ExperienceState>(BROWSE);
	let enhanced = $state(false);
	let reducedMotion = false;
	let dialog = $state<HTMLDialogElement | null>(null);
	let host = $state<HTMLElement | null>(null);
	let stage = $state<HTMLElement | null>(null);

	const current = $derived.by(() => {
		const state = experience;
		return state.mode === 'read'
			? volumes.find((volume) => volume.id === state.issueId)
			: undefined;
	});
	const focusedId = $derived(experience.mode === 'browse' ? experience.focusedIssueId : undefined);
	const initialPage = $derived(experience.mode === 'read' ? experience.page : 0);

	// One history entry per level, so browser Back closes the issue and nothing
	// finer; a page turn only replaces the entry it is reading in.
	function writeState(previous: ExperienceState, next: ExperienceState) {
		const url = `${appPage.url.pathname}${appPage.url.search}${toHash(next)}`;
		if (previous.mode === next.mode) replaceState(url, appPage.state);
		else pushState(url, appPage.state);
	}

	function send(event: ExperienceEvent) {
		const next = reduce(experience, event, catalogue);
		if (isSame(next, experience)) return;
		const previous = experience;
		const apply = () => {
			experience = next;
			writeState(previous, next);
		};
		// Opening and closing are the two moves worth a transition: the cover
		// in the grid becomes the cover of the book, and comes back the same
		// way. Page turns and focus changes are the reader's own.
		if (previous.mode !== next.mode) transition(apply);
		else apply();
	}

	/**
	 * A View Transition when the browser has them and the visitor wants
	 * motion; the plain update otherwise. The DOM must have settled inside
	 * the callback, which is what the `tick()` is for.
	 */
	function transition(update: () => void) {
		if (reducedMotion || typeof document.startViewTransition !== 'function') {
			update();
			return;
		}
		document.startViewTransition(async () => {
			update();
			await tick();
		});
	}

	function restore() {
		const next = fromHash(window.location.hash, catalogue);
		// Browser Back out of an issue is the same reversal as closing it, and the
		// hash alone cannot say which issue was just put down. Read without
		// tracking: this runs inside the mount effect, which must not re-run —
		// and so call this again — every time the state changes.
		const previous = untrack(() => experience);
		const resolved: ExperienceState =
			next.mode === 'browse' && previous.mode === 'read'
				? { mode: 'browse', focusedIssueId: previous.issueId }
				: next;
		if (!isSame(resolved, previous)) experience = resolved;
	}

	$effect(() => {
		enhanced = true;
		restore();
		const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
		const onMotion = () => (reducedMotion = motion.matches);
		onMotion();
		motion.addEventListener('change', onMotion);
		const onPop = () => restore();
		window.addEventListener('popstate', onPop);
		return () => {
			motion.removeEventListener('change', onMotion);
			window.removeEventListener('popstate', onPop);
		};
	});

	// The dialog exists only while an issue is open, and opens itself as a
	// modal the moment it does. `showModal()` is the only way to get the top
	// layer, the focus trap and the inert grid; the `open` attribute is not.
	$effect(() => {
		const el = dialog;
		if (el && !el.open) el.showModal();
	});

	/*
	 * The reader sizes its pages from the width it is given and never looks at
	 * the height, which is right for a document and wrong for a modal: here the
	 * book has to fit the room. The stage is measured in both dimensions and
	 * given the width at which the book fits — two pages across when there is
	 * room for two comfortable ones, one otherwise, using the reader's own
	 * threshold so the two can never disagree.
	 */
	$effect(() => {
		const room = host;
		const book = stage;
		if (!room || !book) return;

		const fit = () => {
			// The room's content box: `clientHeight` would count the padding that
			// keeps the close control and the pager clear of the book.
			const box = getComputedStyle(room);
			const width = room.clientWidth - parseFloat(box.paddingLeft) - parseFloat(box.paddingRight);
			const height = room.clientHeight - parseFloat(box.paddingTop) - parseFloat(box.paddingBottom);
			if (width <= 0 || height <= 0) return;
			let bookWidth = Math.min(width, height * PAGE_RATIO * 2);
			if (bookWidth < SPREAD_MIN) {
				bookWidth = Math.min(width, height * PAGE_RATIO, SPREAD_MIN - 1);
			}
			book.style.width = `${Math.floor(bookWidth)}px`;
		};

		const observer = new ResizeObserver(fit);
		observer.observe(room);
		fit();
		return () => observer.disconnect();
	});
</script>

<section class="experience" aria-label={t('library.label')} data-mode={experience.mode}>
	<div class="scene">
		<picture>
			<source type="image/avif" srcset={room.avif} sizes={ART_SIZES.room} />
			<source type="image/webp" srcset={room.webp} sizes={ART_SIZES.room} />
			<img
				class="room"
				src={room.src}
				alt=""
				width="3840"
				height="2160"
				aria-hidden="true"
				draggable="false"
				fetchpriority="high"
			/>
		</picture>
		<div class="atmosphere" aria-hidden="true"></div>

		<ComicGrid
			{locale}
			{volumes}
			{enhanced}
			{focusedId}
			onfocusissue={(id) => send({ type: 'focus', issueId: id })}
			onselect={(id) => send({ type: 'select', issueId: id })}
		/>
	</div>

	{#if current}
		<!-- Every way out ends in `send`: the button, Escape, and browser Back,
		     which unmounts the dialog outright. `close` is there for whatever
		     else the browser closes a dialog for, so the state can never say
		     "read" over an empty top layer. Escape is handled on the element
		     rather than left to the dialog's close watcher, which not every
		     embedded browser runs. -->
		<dialog
			class="issue"
			data-cover={initialPage === 0 ? '' : undefined}
			bind:this={dialog}
			aria-label={format(t('library.reading'), { title: current.title })}
			onkeydown={(event) => {
				if (event.key !== 'Escape') return;
				event.preventDefault();
				send({ type: 'back' });
			}}
			onclose={() => {
				if (experience.mode === 'read') send({ type: 'back' });
			}}
		>
			<button class="close" type="button" onclick={() => send({ type: 'back' })}>
				{t('library.close')}
			</button>

			<div class="host" bind:this={host}>
				<div class="stage" bind:this={stage}>
					<ComicReader
						{locale}
						pages={current.pages}
						manageHash={false}
						{initialPage}
						globalKeys
						focusOnMount
						onpagechange={(page) => send({ type: 'turnTo', page })}
					>
						{#snippet cover({ enhanced: readerEnhanced, open })}
							<ComicCover {locale} issue={current.cover} enhanced={readerEnhanced} onopen={open} />
						{/snippet}
					</ComicReader>
				</div>
			</div>
		</dialog>
	{/if}
</section>

<style>
	.experience,
	.scene {
		position: relative;
		min-height: 100svh;
		color: var(--jl-white);
		background: var(--jl-ink);
		isolation: isolate;
	}

	.scene {
		overflow: hidden;
	}

	.room {
		position: absolute;
		inset: 0;
		z-index: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: center;
		user-select: none;
	}

	.atmosphere {
		position: absolute;
		inset: 0;
		z-index: 1;
		background:
			radial-gradient(circle at 50% 40%, transparent 0 30%, rgb(5 7 12 / 0.4) 70%),
			linear-gradient(to bottom, rgb(5 7 12 / 0.18), rgb(5 7 12 / 0.4));
		pointer-events: none;
	}

	.scene > :global(.archive) {
		position: relative;
		z-index: 2;
		min-height: 100svh;
	}

	/* ------------------------------------------------------------ the issue -- */

	/*
	 * The dialog is the viewport: the book needs the whole of it on a phone,
	 * and the backdrop is what says "modal" — the grid still there behind it,
	 * dimmed and blurred, the way a table looks past the comic you are holding.
	 */
	.issue {
		position: fixed;
		inset: 0;
		display: flex;
		flex-direction: column;
		width: 100vw;
		max-width: none;
		height: 100dvh;
		max-height: none;
		margin: 0;
		padding: 0;
		/* A single page may grow with its content; the dialog scrolls for it. */
		overflow: hidden auto;
		color: var(--jl-white);
		background: transparent;
		border: 0;
	}

	/* The room the book is measured against: the close control above, the
	   pager's line below, and the page edges either side. */
	.host {
		display: grid;
		flex: 1;
		min-height: 0;
		padding: clamp(56px, 8vh, 84px) clamp(28px, 4vw, 52px) 64px;
		place-items: center;
	}

	.stage {
		width: 100%;
	}

	.issue::backdrop {
		background:
			radial-gradient(circle at 50% 46%, rgb(255 253 246 / 0.1), transparent 38%),
			rgb(5 7 12 / 0.86);
	}

	/*
	 * The grid is blurred, not the backdrop. A `backdrop-filter` re-samples
	 * everything behind the dialog on every frame a page turns; a filter on the
	 * grid itself is rendered once and kept, because nothing there moves.
	 */
	.experience[data-mode='read'] .scene {
		filter: blur(10px) saturate(0.85);
	}

	/* Not a document here, so no gutter above the first sheet. */
	.stage > :global(.reader) {
		margin-top: 0;
	}

	/*
	 * Arriving is a View Transition, set up in `comic.css`: the whole page
	 * crossfades and the cover in the grid morphs into the cover of the book.
	 * While the book is closed the reader's cover face carries the name; once
	 * it opens there is nothing on the grid for it to return to as itself.
	 */
	.issue[data-cover] :global(.leaf:first-of-type .face.front) {
		view-transition-name: issue-cover;
	}

	/* Nothing scrolls behind an open issue. */
	:global(body:has(dialog.issue[open])) {
		overflow: hidden;
	}

	.close {
		position: fixed;
		top: 16px;
		right: 16px;
		z-index: 80;
		padding: 9px 14px;
		color: var(--jl-ink);
		background: var(--jl-yellow);
		border: 3px solid var(--jl-ink);
		box-shadow: 4px 4px 0 var(--jl-red);
		font-family: var(--jl-font-body);
		font-size: 0.72rem;
		font-weight: 600;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		cursor: pointer;
	}

	.close:focus-visible {
		outline: 3px solid var(--jl-white);
		outline-offset: 3px;
	}

	@media (width < 700px) {
		.host {
			padding: 52px 18px 60px;
		}

		.close {
			top: 8px;
			right: 8px;
		}
	}
</style>
