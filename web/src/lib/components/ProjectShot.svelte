<script lang="ts">
	interface Props {
		src: string;
		alt: string;
		caption?: string;
		compact?: boolean;
	}

	let { src, alt, caption, compact = false }: Props = $props();
</script>

<figure class:compact>
	<div class="frame">
		<img {src} {alt} loading="lazy" decoding="async" />
	</div>
	{#if caption}
		<figcaption>{caption}</figcaption>
	{/if}
</figure>

<style>
	figure {
		margin: 0;
	}

	.frame {
		display: grid;
		width: 100%;
		aspect-ratio: 16 / 9;
		place-items: center;
		overflow: hidden;
		background: var(--jl-ink);
		border: 4px solid var(--jl-ink);
		box-shadow: 7px 7px 0 var(--jl-red);
		transform: rotate(-0.45deg);
	}

	img {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}

	figcaption {
		max-width: 76ch;
		margin-top: 12px;
		color: var(--jl-on-dark-dim);
		font-family: var(--jl-font-mono);
		font-size: 0.7rem;
		line-height: 1.5;
		text-transform: uppercase;
	}

	/*
	 * Compact used to crop the screenshot to fill its box, which cut the product
	 * off at arbitrary edges. It is a picture in a panel now: the whole shot,
	 * inside a frame, on the world's own colour.
	 */
	.compact .frame {
		aspect-ratio: auto;
		height: 100%;
		background: var(--jl-shot-mat, var(--jl-ink));
		border-width: var(--jl-border);
		box-shadow: 6px 6px 0 var(--jl-ink);
		transform: none;
	}

	.compact img {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}
</style>
