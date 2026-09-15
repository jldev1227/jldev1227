<script lang="ts">
	import { translator, type Locale } from '$i18n';
	import ComicVolume from './ComicVolume.svelte';
	import type { ExperienceVolume } from './ComicExperience.svelte';

	/**
	 * The shelf: real DOM with CSS depth, never a WebGL room. Keeping it as
	 * markup is what keeps the type sharp, the Spanish reflowing on its own, and
	 * the no-JavaScript path a list of ordinary links to real documents.
	 *
	 * Milestone 2 of `docs/comic-reader/LIBRARY-INTERACTION.md`.
	 */

	interface Props {
		locale: Locale;
		volumes: ExperienceVolume[];
		/** The issue the shelf should be looking at — set when returning from one. */
		focusedId?: string;
		/** The reader has started: the shelf may take the clicks and the tab order. */
		enhanced: boolean;
		onselect: (id: string) => void;
	}

	let { locale, volumes, focusedId, enhanced, onselect }: Props = $props();

	const t = $derived(translator(locale));

	/**
	 * Roving tabindex: the shelf is one tab stop, and the arrows move within it.
	 * Five links in a row would otherwise cost five tabs to walk past.
	 *
	 * Only once enhanced, though — before that every link has to be reachable
	 * the ordinary way, because arrow keys are not going to work either.
	 */
	let rovingIndex = $state(0);

	const items = $state<(ComicVolume | null)[]>([]);

	$effect(() => {
		const wanted = volumes.findIndex((volume) => volume.id === focusedId);
		if (wanted >= 0) rovingIndex = wanted;
	});

	/**
	 * Coming back from an issue, the shelf should be looking at the one that was
	 * just put down, not at the start of the row. Focus follows only when the
	 * shelf was entered with an issue in mind.
	 */
	let restored = false;
	$effect(() => {
		if (restored || !enhanced || !focusedId) return;
		restored = true;
		items[rovingIndex]?.focus();
	});

	function move(to: number) {
		const index = Math.min(Math.max(to, 0), volumes.length - 1);
		rovingIndex = index;
		items[index]?.focus();
	}

	function onkeydown(event: KeyboardEvent) {
		if (!enhanced || event.metaKey || event.ctrlKey || event.altKey) return;

		switch (event.key) {
			// Left and Right walk the row. Up and Down do the same thing, because
			// the shelf wraps into rows on a wide screen and a visual row is not
			// something the markup knows about — one axis, honestly, beats two
			// that guess wrong.
			case 'ArrowRight':
			case 'ArrowDown':
				event.preventDefault();
				move(rovingIndex + 1);
				break;
			case 'ArrowLeft':
			case 'ArrowUp':
				event.preventDefault();
				move(rovingIndex - 1);
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

<nav class="shelf" aria-label={t('library.shelf')}>
	<h2>{t('library.shelf')}</h2>

	<!-- The keys are handled on the list, so they work wherever focus sits
	     inside it, and the list itself is never a tab stop. -->
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<ul class="row" {onkeydown}>
		{#each volumes as volume, index (volume.id)}
			<li>
				<ComicVolume
					bind:this={items[index]}
					{locale}
					{volume}
					tabbable={!enhanced || index === rovingIndex}
					onfocus={() => (rovingIndex = index)}
					onselect={() => onselect(volume.id)}
				/>
			</li>
		{/each}
	</ul>
</nav>

<style>
	/* Same reason as the grid column above it: without this the horizontal snap
	   row cannot be narrower than its contents. */
	.shelf {
		min-width: 0;
	}

	.shelf h2 {
		margin: 0 0 18px;
		font-family: var(--jl-font-display);
		font-size: clamp(1.5rem, 6vw, 2.6rem);
	}

	/*
	 * The row is the shelf. `perspective` here rather than on each volume means
	 * the five share one vanishing point, so they read as one shelf seen from a
	 * single position instead of five separate drawings.
	 */
	.row {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		gap: clamp(18px, 3vw, 34px);
		margin: 0;
		padding: 0 0 12px;
		perspective: 1400px;
		list-style: none;
	}

	li {
		min-width: 0;
	}

	/*
	 * Neighbouring-book displacement: pulling one out of the row makes room for
	 * it. `:has()` lets the shelf say "every volume after the hovered one moves
	 * on", which is the part that sells it as a physical stack.
	 */
	.row :global(li:has(~ li .volume:is(:hover, :focus-visible))) {
		transform: translateX(-6px);
	}

	.row :global(li:has(.volume:is(:hover, :focus-visible)) ~ li) {
		transform: translateX(6px);
	}

	li {
		transition: transform var(--jl-motion-panel, 220ms) var(--jl-paper-ease, ease);
	}

	@media (prefers-reduced-motion: reduce) {
		li,
		.row :global(li:has(~ li .volume:is(:hover, :focus-visible))),
		.row :global(li:has(.volume:is(:hover, :focus-visible)) ~ li) {
			transform: none;
			transition: none;
		}
	}

	/*
	 * A phone gets a snap row, not a miniature shelf: one issue at a time,
	 * swiped through, with the perspective dropped entirely.
	 */
	@media (width < 640px) {
		.row {
			display: flex;
			gap: 16px;
			overflow-x: auto;
			padding-bottom: 18px;
			perspective: none;
			scroll-snap-type: x mandatory;
			scrollbar-width: thin;
			/* The lifted volume must not be clipped by the scroll container. */
			padding-top: 10px;
		}

		li {
			flex: 0 0 min(62vw, 230px);
			scroll-snap-align: center;
		}

		.row :global(li:has(~ li .volume:is(:hover, :focus-visible))),
		.row :global(li:has(.volume:is(:hover, :focus-visible)) ~ li) {
			transform: none;
		}
	}
</style>
