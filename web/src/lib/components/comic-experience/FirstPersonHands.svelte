<script lang="ts">
	export type HandPose = 'idle' | 'reaching' | 'holding' | 'hidden';

	interface Props {
		pose: HandPose;
	}

	let { pose }: Props = $props();

	const poses = [
		{ id: 'idle', src: '/art/library-experience/hands-idle-v1.webp', width: 1536, height: 1024 },
		{
			id: 'reaching',
			src: '/art/library-experience/hands-reaching-v1.webp',
			width: 1536,
			height: 1024
		},
		{
			id: 'holding',
			src: '/art/library-experience/hands-holding-v1.webp',
			width: 1024,
			height: 1536
		}
	] as const;
</script>

<div class="hands" data-pose={pose} aria-hidden="true">
	{#each poses as handPose (handPose.id)}
		<img
			class:active={pose === handPose.id}
			class:holding={handPose.id === 'holding'}
			src={handPose.src}
			alt=""
			width={handPose.width}
			height={handPose.height}
			decoding="async"
			draggable="false"
		/>
	{/each}
</div>

<style>
	.hands {
		position: absolute;
		inset: 0;
		z-index: 6;
		overflow: hidden;
		pointer-events: none;
	}

	.hands img {
		position: absolute;
		inset: auto 0 0;
		width: 100%;
		height: 74%;
		object-fit: contain;
		object-position: center bottom;
		opacity: 0;
		transform: translateY(7%);
		transition:
			opacity 180ms ease,
			transform 420ms var(--jl-paper-ease, ease);
		filter: drop-shadow(0 22px 22px rgb(0 0 0 / 0.35));
	}

	.hands img.active {
		opacity: 1;
		transform: translateY(0);
	}

	.hands img.holding {
		left: 50%;
		width: min(82vw, 760px);
		height: 94%;
		transform: translate(-50%, 8%);
	}

	.hands img.holding.active {
		transform: translate(-50%, 0);
	}

	@media (width < 640px) {
		.hands img {
			width: 132%;
			max-width: none;
			margin-left: -16%;
			height: 56%;
		}

		.hands img.holding {
			width: 118vw;
			height: 88%;
			margin-left: 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.hands img {
			transition: opacity 80ms linear;
			transform: none;
		}

		.hands img.holding,
		.hands img.holding.active {
			transform: translateX(-50%);
		}
	}
</style>
