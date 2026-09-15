<script lang="ts">
	import { tick } from 'svelte';
	import { contact, hero, missionIntro, origin, powers, powersPage } from '$content/site';
	import { projects } from '$content/projects';
	import { LOCALE_LABEL, LOCALES, missionPath, type Locale, type Localized } from '$i18n';
	import type { FlipOrientation, PageFlip } from 'page-flip/dist/js/page-flip.module.js';
	import { harness } from './harness-copy';

	/**
	 * Milestone 0 of `docs/comic-reader/LIBRARY-INTERACTION.md`.
	 *
	 * This harness exists to answer the seven compatibility questions in that
	 * document with evidence rather than with reading. It follows the adapter
	 * lifecycle the document specifies — Svelte renders one stable page tree,
	 * `PageFlip` is imported dynamically after mount, `loadFromHTML()` runs only
	 * once the elements exist — so that what it measures is the arrangement
	 * milestone 5 would actually ship.
	 *
	 * It does not touch `ComicReader.svelte`, and the route 404s outside `dev`.
	 */

	/** The spike's near-starting configuration, copied from the plan verbatim. */
	const SETTINGS = {
		width: 420,
		height: 640,
		size: 'stretch',
		minWidth: 280,
		maxWidth: 520,
		minHeight: 420,
		maxHeight: 800,
		showCover: true,
		usePortrait: true,
		mobileScrollSupport: true,
		disableFlipByClick: true,
		clickEventForward: true,
		flippingTime: 600,
		drawShadow: true,
		maxShadowOpacity: 0.35
	} as const;

	interface HarnessPage {
		id: string;
		label: Localized;
		body: Localized;
		/** Rendered as an ordinary anchor, to see whether the library keeps it live. */
		link?: { href: string; label: Localized };
		/** Rendered as a Svelte-bound button, for the same reason. */
		counter?: boolean;
	}

	const caseFile = projects[0];

	const ISSUES = {
		intro: [
			{ id: 'cover', label: harness.issueIntro, body: hero.lead },
			{ id: 'origin', label: origin.pageLabel, body: origin.body, counter: true },
			{
				id: 'powers',
				label: powersPage.pageLabel,
				body: powers[0].body,
				link: { href: missionPath('es', caseFile.slug), label: harness.linkProbe }
			},
			{ id: 'missions', label: missionIntro.pageLabel, body: missionIntro.body },
			{ id: 'contact', label: contact.pageLabel, body: contact.body }
		],
		case: [
			{ id: 'cover', label: harness.issueCase, body: caseFile.tagline },
			{ id: 'challenge', label: caseFile.kicker, body: caseFile.challenge, counter: true },
			{
				id: 'approach',
				label: powersPage.pageLabel,
				body: caseFile.approach,
				link: { href: missionPath('es', caseFile.slug), label: harness.linkProbe }
			},
			{ id: 'outcome', label: contact.pageLabel, body: caseFile.outcome }
		]
	} satisfies Record<string, HarnessPage[]>;

	type IssueId = keyof typeof ISSUES;

	let locale = $state<Locale>('es');
	let issueId = $state<IssueId>('intro');
	/**
	 * The plan's step 5 — destroy before Svelte replaces the tree. The harness
	 * can skip it on purpose, because whether skipping it actually breaks is one
	 * of the things the spike is here to establish.
	 */
	let destroyBeforeSwap = $state(true);

	const pages = $derived(ISSUES[issueId] as HarnessPage[]);

	let root = $state<HTMLDivElement | null>(null);
	let flip: PageFlip | null = null;

	/**
	 * `destroy()` empties its parent, and its parent is the element Svelte's
	 * `{#each}` renders into — so tearing the library down takes the page tree
	 * with it and leaves Svelte updating nodes that are no longer in the
	 * document. Bumping this rebuilds the container from scratch, which is the
	 * only way found to get a second instance after a first one is destroyed.
	 */
	let generation = $state(0);

	/**
	 * Creation is asynchronous — the dynamic import is an await — and that opens
	 * a window in which a second caller sees `flip === null` and starts building
	 * a second instance on the same element. Two wrappers, two shadow sets, one
	 * of each orphaned. The mount effect and an explicit rebuild collided here
	 * exactly once, which is the whole reason this flag exists.
	 */
	let creating = false;

	let live = $state(false);
	let page = $state(0);
	let pageCount = $state(0);
	let orientation = $state<FlipOrientation | ''>('');
	let clicks = $state(0);
	let events = $state<string[]>([]);
	let errors = $state<string[]>([]);

	function log(entry: string) {
		events = [...events, entry];
	}

	async function create() {
		if (flip || creating || !root) return;
		creating = true;
		try {
			const { PageFlip } = await import('page-flip/dist/js/page-flip.module.js');
			const items = root.querySelectorAll('[data-spike-page]');
			if (!items.length) return;

			const instance = new PageFlip(root, SETTINGS);
			instance.on('flip', (event) => {
				page = event.data;
				log(`flip:${event.data}`);
			});
			instance.on('changeOrientation', (event) => {
				orientation = event.data;
				log(`orientation:${event.data}`);
			});
			instance.on('changeState', (event) => log(`state:${event.data}`));

			instance.loadFromHTML(items);

			flip = instance;
			live = true;
			page = instance.getCurrentPageIndex();
			pageCount = instance.getPageCount();
			orientation = instance.getOrientation();
			log(`created:${pageCount}`);
		} catch (cause) {
			errors = [...errors, `create: ${cause instanceof Error ? cause.message : String(cause)}`];
		} finally {
			creating = false;
		}
	}

	function teardown() {
		if (!flip) return;
		try {
			flip.destroy();
			log('destroyed');
		} catch (cause) {
			errors = [...errors, `destroy: ${cause instanceof Error ? cause.message : String(cause)}`];
		}
		flip = null;
		live = false;
		page = 0;
		pageCount = 0;
		orientation = '';
	}

	/** Destroy, rebuild the tree, create — the plan's step 5, made literal. */
	async function rebuild() {
		teardown();
		generation += 1;
		await tick();
		await create();
	}

	/** Swap what the tree renders, with or without the plan's ordering. */
	async function swap(mutate: () => void) {
		if (destroyBeforeSwap) {
			teardown();
			generation += 1;
		}
		mutate();
		await tick();
		if (destroyBeforeSwap) await create();
	}

	$effect(() => {
		// `root` is the dependency: create once the container is in the document.
		if (root && !flip) void create();
		return teardown;
	});

	/**
	 * Facts for the Playwright spike, read straight off the live document rather
	 * than from component state, so a claim the component makes about itself
	 * cannot pass for evidence.
	 */
	function probe() {
		const doc = document;
		const ids = [...doc.querySelectorAll('[data-spike-page]')].map((el) => el.id);
		const duplicated = ids.filter((id, index) => id && ids.indexOf(id) !== index);
		const copy = doc.querySelector<HTMLElement>('[data-spike-page="origin"], [data-spike-page]');
		return {
			live,
			page,
			pageCount,
			orientation,
			clicks,
			generation,
			events: [...events],
			errors: [...errors],
			/** Page elements present in the document, however the library moved them. */
			domPages: ids.length,
			duplicateIds: duplicated.length,
			/**
			 * Generated structure, counted per class rather than in total: a leak
			 * shows up as one of these surviving a teardown or accumulating across
			 * rebuilds, and a single number hides which.
			 */
			generated: {
				parent: doc.querySelectorAll('.stf__parent').length,
				wrapper: doc.querySelectorAll('.stf__wrapper').length,
				block: doc.querySelectorAll('.stf__block').length,
				item: doc.querySelectorAll('.stf__item').length,
				shadow: doc.querySelectorAll(
					'.stf__outerShadow, .stf__innerShadow, .stf__hardShadow, .stf__hardInnerShadow'
				).length
			},
			anchors: doc.querySelectorAll('[data-spike-page] a[href]').length,
			/**
			 * Clipping, measured only on the pages actually on screen: the library
			 * gives a page that is not in view a zero height, which would otherwise
			 * read as "fits".
			 */
			clippedVisible: [...doc.querySelectorAll<HTMLElement>('[data-spike-page]')]
				.filter((el) => el.clientHeight > 0)
				.map((el) => {
					// `.sheet` clips, so `scrollHeight` alone can report a comfortable
					// fit for copy whose last line is already outside the frame. Ask
					// instead where the last child actually ends.
					const box = el.getBoundingClientRect();
					const last = el.lastElementChild?.getBoundingClientRect();
					return {
						id: el.id,
						clipped: el.scrollHeight > el.clientHeight + 1,
						overflows: last ? Math.round(last.bottom - box.bottom) > 1 : false,
						fits: el.clientHeight,
						needs: el.scrollHeight
					};
				}),
			/** Does the first page's copy still fit its box, or is it clipped? */
			clipped: copy ? copy.scrollHeight > copy.clientHeight + 1 : false
		};
	}

	$effect(() => {
		const target = window as unknown as { __spike?: unknown };
		target.__spike = { probe, create, teardown };
		return () => delete target.__spike;
	});
</script>

<svelte:head>
	<title>{harness.title[locale]}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<main class="harness">
	<header>
		<h1>{harness.title[locale]}</h1>
		<p>{harness.lede[locale]}</p>
	</header>

	<div class="controls">
		<fieldset>
			<legend>{harness.locale[locale]}</legend>
			{#each LOCALES as option (option)}
				<button
					type="button"
					data-testid="locale-{option}"
					aria-pressed={locale === option}
					onclick={() => swap(() => (locale = option))}
				>
					{LOCALE_LABEL[option]}
				</button>
			{/each}
		</fieldset>

		<fieldset>
			<legend>{harness.issue[locale]}</legend>
			<button
				type="button"
				data-testid="issue-intro"
				aria-pressed={issueId === 'intro'}
				onclick={() => swap(() => (issueId = 'intro'))}
			>
				{harness.issueIntro[locale]}
			</button>
			<button
				type="button"
				data-testid="issue-case"
				aria-pressed={issueId === 'case'}
				onclick={() => swap(() => (issueId = 'case'))}
			>
				{harness.issueCase[locale]}
			</button>
		</fieldset>

		<fieldset>
			<legend>{harness.status[locale]}</legend>
			<button type="button" data-testid="prev" onclick={() => flip?.flipPrev()}>
				{harness.previous[locale]}
			</button>
			<button type="button" data-testid="next" onclick={() => flip?.flipNext()}>
				{harness.next[locale]}
			</button>
			<button type="button" data-testid="to-cover" onclick={() => flip?.turnToPage(0)}>
				turnToPage(0)
			</button>
			<button type="button" data-testid="destroy" onclick={teardown}>
				{harness.destroy[locale]}
			</button>
			<button type="button" data-testid="create" onclick={() => create()}>
				{harness.create[locale]}
			</button>
			<button type="button" data-testid="rebuild" onclick={rebuild}>
				{harness.rebuild[locale]}
			</button>
			<label>
				<input type="checkbox" data-testid="ordered-swap" bind:checked={destroyBeforeSwap} />
				destroy → swap → create
			</label>
		</fieldset>
	</div>

	<p class="readout" data-testid="readout">
		{live ? harness.live[locale] : harness.down[locale]} · page
		<output data-testid="page">{page}</output>
		/ <output data-testid="page-count">{pageCount}</output> ·
		<output data-testid="orientation">{orientation}</output> ·
		{harness.handler[locale]}
		<output data-testid="clicks">{clicks}</output>
	</p>

	<div class="stage">
		<!-- Keyed on `generation`: the container itself has to be replaced, not
		     just its children, because `destroy()` empties it. -->
		{#key generation}
			<div class="book" bind:this={root} data-testid="book">
				{#each pages as item (item.id)}
					<div class="sheet" id="spike-{item.id}" data-spike-page={item.id} data-density="soft">
						<h2>{item.label[locale]}</h2>
						<p>{item.body[locale]}</p>
						{#if item.counter}
							<button type="button" data-testid="handler" onclick={() => (clicks += 1)}>
								{harness.handlerButton[locale]}
							</button>
						{/if}
						{#if item.link}
							<a href={item.link.href} data-testid="anchor">{item.link.label[locale]}</a>
						{/if}
					</div>
				{/each}
			</div>
		{/key}
	</div>

	<pre class="log" data-testid="log">{events.join('\n')}</pre>
	{#if errors.length}
		<pre class="log errors" data-testid="errors">{errors.join('\n')}</pre>
	{/if}
</main>

<style>
	.harness {
		/* `body` pairs `--jl-ink` with a `--jl-paper` that goes near-black under a
		   dark colour scheme, and these harnesses put text straight onto it rather
		   than inside a panel that sets its own colours. Pin the pair
		   to paper so the instrument is readable either way. */
		min-height: 100vh;
		color: var(--jl-ink);
		background: #f4f0e7;
		max-width: 1100px;
		margin: 0 auto;
		padding: 24px 16px 64px;
		font-family: var(--jl-font-body);
	}

	header p {
		color: #555;
	}

	.controls {
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
		margin: 18px 0;
	}

	fieldset {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px;
		border: 2px solid var(--jl-ink);
	}

	button {
		padding: 6px 10px;
		font: inherit;
		font-size: 0.8rem;
		cursor: pointer;
	}

	button[aria-pressed='true'] {
		color: var(--jl-white);
		background: var(--jl-ink);
	}

	.readout {
		font-family: var(--jl-font-mono);
		font-size: 0.78rem;
	}

	.stage {
		display: grid;
		place-items: center;
		min-height: 680px;
		padding: 16px;
		background: #e9e6df;
	}

	.book {
		width: 100%;
		max-width: 1040px;
	}

	/* The sheets are ordinary blocks until the library takes them over; that is
	   the point of the no-JavaScript path the plan asks for. */
	.sheet {
		display: flex;
		flex-direction: column;
		gap: 10px;
		align-items: start;
		overflow: hidden;
		padding: 24px;
		color: var(--jl-ink);
		background: var(--jl-white);
		border: 3px solid var(--jl-ink);
	}

	.sheet h2 {
		margin: 0;
		font-size: 1.1rem;
	}

	.sheet p {
		margin: 0;
		font-size: 0.85rem;
		line-height: 1.5;
	}

	.log {
		max-height: 180px;
		overflow: auto;
		padding: 10px;
		background: #f2efe8;
		font-size: 0.7rem;
	}

	.errors {
		background: #ffe8e8;
	}
</style>
