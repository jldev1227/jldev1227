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
	import { tick } from 'svelte';
	import { ComicCover, StPageFlipReader } from '$lib/components/comic-reader';
	import { translator, type Locale } from '$i18n';
	import ComicBoxSelector from './ComicBoxSelector.svelte';
	import FirstPersonHands, { type HandPose } from './FirstPersonHands.svelte';
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

	interface Props {
		locale: Locale;
		volumes: ExperienceVolume[];
	}

	interface Pickup {
		id: string;
		left: number;
		top: number;
		width: number;
		height: number;
		dx: number;
		dy: number;
		scale: number;
		active: boolean;
	}

	let { locale, volumes }: Props = $props();
	const t = $derived(translator(locale));
	const catalogue = $derived<Catalogue>(
		volumes.map((volume) => ({ id: volume.id, pageCount: volume.pages.length }))
	);

	let experience = $state<ExperienceState>(BROWSE);
	let enhanced = $state(false);
	let reducedMotion = $state(false);
	let pickup = $state<Pickup | null>(null);
	let pickupGuard: ReturnType<typeof setTimeout> | undefined;

	const current = $derived.by(() => {
		const state = experience;
		return state.mode === 'read'
			? volumes.find((volume) => volume.id === state.issueId)
			: undefined;
	});
	const pickupVolume = $derived(
		pickup ? volumes.find((volume) => volume.id === pickup?.id) : undefined
	);
	const handPose = $derived<HandPose>(
		experience.mode === 'read' ? 'hidden' : pickup ? 'reaching' : 'idle'
	);

	function writeState(previous: ExperienceState, next: ExperienceState) {
		const url = `${appPage.url.pathname}${appPage.url.search}${toHash(next)}`;
		if (previous.mode === next.mode) replaceState(url, appPage.state);
		else pushState(url, appPage.state);
	}

	function send(event: ExperienceEvent) {
		const next = reduce(experience, event, catalogue);
		if (isSame(next, experience)) return;
		const previous = experience;
		experience = next;
		writeState(previous, next);
	}

	function finishPickup() {
		if (!pickup) return;
		const id = pickup.id;
		clearTimeout(pickupGuard);
		pickup = null;
		send({ type: 'select', issueId: id });
	}

	async function selectIssue(id: string, rect: DOMRect) {
		if (pickup || experience.mode !== 'browse' || rect.width <= 0) return;

		const targetWidth = Math.min(window.innerWidth < 640 ? window.innerWidth * 0.62 : 360, 420);
		const scale = targetWidth / rect.width;
		const targetHeight = rect.height * scale;
		pickup = {
			id,
			left: rect.left,
			top: rect.top,
			width: rect.width,
			height: rect.height,
			dx: window.innerWidth / 2 - targetWidth / 2 - rect.left,
			dy: window.innerHeight / 2 - targetHeight / 2 - rect.top,
			scale,
			active: false
		};

		if (reducedMotion) {
			finishPickup();
			return;
		}

		await tick();
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				if (pickup?.id === id) pickup.active = true;
			});
		});
		pickupGuard = setTimeout(finishPickup, 900);
	}

	function restore() {
		clearTimeout(pickupGuard);
		pickup = null;
		experience = fromHash(window.location.hash, catalogue);
	}

	$effect(() => {
		enhanced = true;
		restore();
		const media = window.matchMedia('(prefers-reduced-motion: reduce)');
		const onMotion = () => (reducedMotion = media.matches);
		const onPop = () => restore();
		onMotion();
		media.addEventListener('change', onMotion);
		window.addEventListener('popstate', onPop);

		return () => {
			clearTimeout(pickupGuard);
			media.removeEventListener('change', onMotion);
			window.removeEventListener('popstate', onPop);
		};
	});

	function onkeydown(event: KeyboardEvent) {
		if (event.key !== 'Escape' || experience.mode !== 'read') return;
		const target = event.target as HTMLElement | null;
		if (target?.closest('input, textarea, select, [contenteditable="true"]')) return;
		event.preventDefault();
		send({ type: 'back' });
	}
</script>

<svelte:window {onkeydown} />

<section class="experience" aria-label={t('library.label')} data-mode={experience.mode}>
	{#if experience.mode === 'browse'}
		<div class="scene">
			<img
				class="room"
				src="/art/library-experience/library-room-v1.webp"
				alt=""
				width="1672"
				height="941"
				aria-hidden="true"
				draggable="false"
				fetchpriority="high"
			/>
			<div class="atmosphere" aria-hidden="true"></div>

			<ComicBoxSelector
				{locale}
				{volumes}
				{enhanced}
				focusedId={experience.focusedIssueId}
				disabled={Boolean(pickup)}
				selectedId={pickup?.id}
				onfocusissue={(id) => send({ type: 'focus', issueId: id })}
				onselect={selectIssue}
			/>

			{#if pickup && pickupVolume}
				<div
					class="pickup"
					class:active={pickup.active}
					ontransitionend={(event) => {
						if (event.propertyName === 'transform') finishPickup();
					}}
					style={`--pickup-left:${pickup.left}px; --pickup-top:${pickup.top}px; --pickup-width:${pickup.width}px; --pickup-height:${pickup.height}px; --pickup-x:${pickup.dx}px; --pickup-y:${pickup.dy}px; --pickup-scale:${pickup.scale}`}
					aria-hidden="true"
				>
					<div
						class="pickup-face"
						style={pickupVolume.cover.palette
							? `--pickup-base:${pickupVolume.cover.palette.base}; --pickup-accent:${pickupVolume.cover.palette.accent}`
							: undefined}
					>
						<span>{pickupVolume.cover.issue}</span>
						<strong class="jl-display">{pickupVolume.title}</strong>
					</div>
				</div>
			{/if}

			<FirstPersonHands pose={handPose} />
		</div>
	{:else if current}
		<div class="read">
			<StPageFlipReader
				{locale}
				pages={current.pages}
				initialPage={experience.page}
				onpagechange={(page) => send({ type: 'turnTo', page })}
			>
				{#snippet cover({ enhanced: readerEnhanced, open })}
					<ComicCover {locale} issue={current.cover} enhanced={readerEnhanced} onopen={open} />
				{/snippet}
			</StPageFlipReader>

			<button class="return" type="button" onclick={() => send({ type: 'return' })}>
				{t('library.toBox')}
			</button>
		</div>
	{/if}
</section>

<style>
	.experience,
	.scene,
	.read {
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
			radial-gradient(circle at 50% 72%, transparent 0 26%, rgb(5 7 12 / 0.22) 62%),
			linear-gradient(to bottom, rgb(5 7 12 / 0.08), rgb(5 7 12 / 0.28));
		pointer-events: none;
	}

	.scene > :global(.archive) {
		position: relative;
		z-index: 2;
		min-height: 100svh;
	}

	.pickup {
		position: fixed;
		top: var(--pickup-top);
		left: var(--pickup-left);
		z-index: 8;
		width: var(--pickup-width);
		height: var(--pickup-height);
		pointer-events: none;
		transform-origin: left top;
		transition: transform 760ms var(--jl-paper-ease, ease);
		filter: drop-shadow(0 20px 18px rgb(0 0 0 / 0.5));
	}

	.pickup.active {
		transform: translate(var(--pickup-x), var(--pickup-y)) scale(var(--pickup-scale));
	}

	.pickup-face {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		height: 100%;
		padding: 9%;
		color: var(--jl-white);
		background:
			linear-gradient(150deg, transparent 0 55%, var(--pickup-accent, var(--jl-red)) 55%),
			var(--pickup-base, var(--jl-navy));
		border: var(--jl-border) solid var(--jl-ink);
	}

	.pickup-face span {
		font-family: var(--jl-font-mono);
		font-size: 0.55rem;
	}

	.pickup-face strong {
		font-size: clamp(0.7rem, 10cqi, 1.5rem);
		line-height: 0.9;
	}

	.read {
		max-width: none;
		margin: 0 auto;
	}

	.return {
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

	.return:focus-visible {
		outline: 3px solid var(--jl-white);
		outline-offset: 3px;
	}

	@media (width < 700px) {
		.room {
			object-position: 50% center;
		}

		.return {
			top: 8px;
			right: 8px;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.pickup {
			transition: none;
		}
	}
</style>
