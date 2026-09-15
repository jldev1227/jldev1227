<script lang="ts">
	import { translator, type Locale } from '$i18n';
	import ComicVolume from './ComicVolume.svelte';
	import type { ExperienceVolume } from './ComicExperience.svelte';

	interface Props {
		locale: Locale;
		volumes: ExperienceVolume[];
		focusedId?: string;
		enhanced: boolean;
		disabled?: boolean;
		selectedId?: string;
		onfocusissue: (id: string) => void;
		onselect: (id: string, rect: DOMRect) => void;
	}

	let {
		locale,
		volumes,
		focusedId,
		enhanced,
		disabled = false,
		selectedId,
		onfocusissue,
		onselect
	}: Props = $props();

	const t = $derived(translator(locale));
	let rovingIndex = $state(0);
	const items = $state<(ComicVolume | null)[]>([]);
	let restored = false;

	$effect(() => {
		const wanted = volumes.findIndex((volume) => volume.id === focusedId);
		if (wanted >= 0) rovingIndex = wanted;
	});

	$effect(() => {
		if (restored || !enhanced || !focusedId) return;
		restored = true;
		items[rovingIndex]?.focus();
	});

	function focusAt(index: number) {
		if (!volumes.length) return;
		rovingIndex = (index + volumes.length) % volumes.length;
		items[rovingIndex]?.focus();
	}

	function onkeydown(event: KeyboardEvent) {
		if (!enhanced || disabled || event.metaKey || event.ctrlKey || event.altKey) return;

		switch (event.key) {
			case 'ArrowRight':
			case 'ArrowDown':
				event.preventDefault();
				focusAt(rovingIndex + 1);
				break;
			case 'ArrowLeft':
			case 'ArrowUp':
				event.preventDefault();
				focusAt(rovingIndex - 1);
				break;
			case 'Home':
				event.preventDefault();
				focusAt(0);
				break;
			case 'End':
				event.preventDefault();
				focusAt(volumes.length - 1);
				break;
			case ' ':
			case 'Spacebar': {
				event.preventDefault();
				const item = items[rovingIndex];
				if (item) onselect(volumes[rovingIndex].id, item.rect());
				break;
			}
		}
	}
</script>

<nav class="archive" aria-label={t('library.boxLabel')} aria-busy={disabled}>
	<div class="prompt">
		<p class="eyebrow">{t('library.archiveEyebrow')}</p>
		<h1 class="jl-display">{t('library.archiveTitle')}</h1>
		<p>{t('library.archiveHint')}</p>
	</div>

	<div class="box-stage">
		<img
			class="box"
			src="/art/library-experience/comic-box-v1.webp"
			alt=""
			width="1254"
			height="1254"
			aria-hidden="true"
			draggable="false"
		/>

		<!-- The image sells the cardboard object; these links are the actual collection. -->
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<ul class="volumes" {onkeydown}>
			{#each volumes as volume, index (volume.id)}
				<li
					style={`--slot:${index}; --count:${volumes.length}`}
					class:hidden={selectedId === volume.id}
				>
					<ComicVolume
						bind:this={items[index]}
						{locale}
						{volume}
						variant="box"
						tabbable={!enhanced || (!disabled && index === rovingIndex)}
						{disabled}
						onfocus={() => {
							rovingIndex = index;
							onfocusissue(volume.id);
						}}
						onselect={(rect) => onselect(volume.id, rect)}
					/>
				</li>
			{/each}
		</ul>
	</div>
</nav>

<style>
	.archive {
		position: relative;
		display: grid;
		grid-template-rows: auto 1fr;
		min-height: 100%;
		isolation: isolate;
	}

	.prompt {
		position: relative;
		z-index: 7;
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

	.box-stage {
		position: relative;
		align-self: end;
		width: min(72vw, 760px);
		aspect-ratio: 1;
		margin: -7vh auto -13vh;
	}

	.box {
		position: absolute;
		inset: 0;
		z-index: 3;
		display: block;
		width: 100%;
		height: 100%;
		object-fit: contain;
		pointer-events: none;
		filter: drop-shadow(0 26px 24px rgb(0 0 0 / 0.5));
	}

	.volumes {
		position: absolute;
		top: 27%;
		left: 25%;
		z-index: 4;
		display: flex;
		align-items: end;
		width: 51%;
		height: 24%;
		margin: 0;
		padding: 0;
		perspective: 900px;
		list-style: none;
		transform: rotate(-1deg) skewX(-4deg);
	}

	.volumes li {
		position: relative;
		flex: 1 1 0;
		min-width: 0;
		height: 78%;
		margin-left: -1.5%;
		transform-origin: center bottom;
		transition:
			transform var(--jl-motion-panel, 220ms) var(--jl-paper-ease, ease),
			opacity 120ms linear;
	}

	.volumes li:first-child {
		margin-left: 0;
	}

	.volumes li:nth-child(3n + 2) {
		height: 83%;
	}

	.volumes li:nth-child(3n) {
		height: 87%;
	}

	.volumes li:focus-within,
	.volumes li:hover {
		z-index: 8;
		transform: translateY(-18%) scale(1.08);
	}

	.volumes li.hidden {
		opacity: 0;
	}

	@media (width < 700px) {
		.archive {
			grid-template-rows: auto 1fr;
		}

		.prompt {
			margin-top: 12px;
			padding: 10px 12px;
		}

		.prompt h1 {
			font-size: clamp(1.9rem, 11vw, 3rem);
		}

		.box-stage {
			width: min(112vw, 620px);
			margin-bottom: -8vh;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.volumes li,
		.volumes li:focus-within,
		.volumes li:hover {
			transition: none;
			transform: none;
		}
	}
</style>
