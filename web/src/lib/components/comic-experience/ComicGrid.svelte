<script lang="ts">
	import { translator, type Locale } from '$i18n';
	import ComicVolume from './ComicVolume.svelte';
	import type { ExperienceVolume } from './ComicExperience.svelte';

	/**
	 * The collection, laid out as a grid of covers: real DOM, ordinary links,
	 * and CSS for the lift. Keeping it as markup is what keeps the type sharp,
	 * the Spanish reflowing on its own, and the no-JavaScript path a list of
	 * links to real documents.
	 */

	interface Props {
		locale: Locale;
		volumes: ExperienceVolume[];
		/** The issue the grid should be looking at — set when returning from one. */
		focusedId?: string;
		/** The experience has started: the grid may take the clicks and the tab order. */
		enhanced: boolean;
		onfocusissue: (id: string) => void;
		onselect: (id: string) => void;
	}

	let { locale, volumes, focusedId, enhanced, onfocusissue, onselect }: Props = $props();

	const t = $derived(translator(locale));

	/**
	 * Roving tabindex: the grid is one tab stop, and the arrows move within it.
	 * Six links in a row would otherwise cost six tabs to walk past.
	 *
	 * Only once enhanced, though — before that every link has to be reachable
	 * the ordinary way, because arrow keys are not going to work either.
	 */
	let rovingIndex = $state(0);
	let list = $state<HTMLUListElement | null>(null);
	const items = $state<(ComicVolume | null)[]>([]);

	/**
	 * Coming back from an issue, the grid should be looking at the one that was
	 * just closed, not at the start of the row. `focusedId` is cleared while an
	 * issue is open, so its reappearance is the signal to move focus.
	 */
	let lastFocused: string | undefined;
	$effect(() => {
		const id = focusedId;
		if (!id) {
			lastFocused = undefined;
			return;
		}
		if (!enhanced || id === lastFocused) return;
		lastFocused = id;
		const index = volumes.findIndex((volume) => volume.id === id);
		if (index < 0) return;
		rovingIndex = index;
		items[index]?.focus();
	});

	/** How many covers share the first row — measured, since CSS decides it. */
	function columns(): number {
		const rows = list ? (Array.from(list.children) as HTMLElement[]) : [];
		if (rows.length === 0) return 1;
		const top = rows[0].offsetTop;
		return Math.max(1, rows.filter((row) => row.offsetTop === top).length);
	}

	function move(to: number) {
		const index = Math.min(Math.max(to, 0), volumes.length - 1);
		rovingIndex = index;
		items[index]?.focus();
	}

	function onkeydown(event: KeyboardEvent) {
		if (!enhanced || event.metaKey || event.ctrlKey || event.altKey) return;

		switch (event.key) {
			// Left and Right walk the row; Up and Down step a row at a time, by
			// however many columns the grid currently has. None of them wrap: a
			// grid has a beginning and an end.
			case 'ArrowRight':
				event.preventDefault();
				move(rovingIndex + 1);
				break;
			case 'ArrowLeft':
				event.preventDefault();
				move(rovingIndex - 1);
				break;
			case 'ArrowDown':
				event.preventDefault();
				move(rovingIndex + columns());
				break;
			case 'ArrowUp':
				event.preventDefault();
				move(rovingIndex - columns());
				break;
			case 'Home':
				event.preventDefault();
				move(0);
				break;
			case 'End':
				event.preventDefault();
				move(volumes.length - 1);
				break;
			// Enter is the anchor's own doing; Space is not, and on a link it
			// would scroll the page instead.
			case ' ':
			case 'Spacebar':
				event.preventDefault();
				onselect(volumes[rovingIndex].id);
				break;
		}
	}
</script>

<nav class="archive" aria-label={t('library.collection')}>
	<header class="prompt">
		<p class="eyebrow">{t('library.eyebrow')}</p>
		<h1 class="jl-display">{t('library.title')}</h1>
		<p>{t('library.hint')}</p>
	</header>

	<!-- The keys are handled on the list, so they work wherever focus sits
	     inside it, and the list itself is never a tab stop. -->
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<ul class="grid" bind:this={list} {onkeydown}>
		{#each volumes as volume, index (volume.id)}
			<li>
				<ComicVolume
					bind:this={items[index]}
					{locale}
					{volume}
					tabbable={!enhanced || index === rovingIndex}
					named={enhanced && volume.id === focusedId}
					onfocus={() => {
						rovingIndex = index;
						onfocusissue(volume.id);
					}}
					onselect={() => onselect(volume.id)}
				/>
			</li>
		{/each}
	</ul>
</nav>

<style>
	.archive {
		position: relative;
		display: grid;
		grid-template-rows: auto 1fr;
		min-height: 100%;
		padding-bottom: clamp(40px, 8vh, 88px);
	}

	.prompt {
		width: min(92%, 680px);
		margin: clamp(16px, 4vh, 42px) auto 0;
		padding: 14px 18px;
		color: var(--jl-white);
		background: rgb(5 7 12 / 0.76);
		border: 3px solid var(--jl-yellow);
		box-shadow: 6px 6px 0 rgb(5 7 12 / 0.8);
		text-align: center;
		backdrop-filter: blur(7px);
	}

	.prompt .eyebrow,
	.prompt p {
		margin: 0;
		font-family: var(--jl-font-mono);
		font-size: clamp(0.6rem, 1.7vw, 0.75rem);
		letter-spacing: 0.07em;
		line-height: 1.45;
		text-transform: uppercase;
	}

	.prompt .eyebrow {
		color: var(--jl-yellow);
	}

	.prompt h1 {
		margin: 5px 0 7px;
		font-size: clamp(2rem, 6vw, 4.4rem);
		line-height: 0.86;
		text-shadow: 4px 4px 0 var(--jl-red);
	}

	/* Four across on a desk; the count steps down with the width rather than
	   the covers shrinking until their type is unreadable. */
	.grid {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: clamp(16px, 2.6vw, 30px);
		width: min(92%, 1180px);
		margin: clamp(22px, 4vh, 40px) auto 0;
		padding: 0;
		list-style: none;
	}

	li {
		min-width: 0;
	}

	@media (width < 960px) {
		.grid {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}
	}

	@media (width < 600px) {
		.grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
			gap: 14px;
		}

		.prompt {
			margin-top: 12px;
			padding: 10px 12px;
		}

		.prompt h1 {
			font-size: clamp(1.9rem, 11vw, 3rem);
		}
	}
</style>
