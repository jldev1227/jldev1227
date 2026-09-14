<script lang="ts">
	interface Props {
		/** Title shown while no artwork exists yet. */
		label: string;
		hint: string;
		/** Set once the commissioned illustration lands in `static/art/`. */
		src?: string;
		alt?: string;
		/** Intrinsic pixels. They reserve the frame's shape before the file
		    arrives, so the page does not jump when it does. */
		width?: number;
		height?: number;
		class?: string;
	}

	let { label, hint, src, alt = '', width, height, class: className = '' }: Props = $props();
</script>

<div class="jl-art-slot {className}">
	{#if src}
		<img {src} {alt} {width} {height} loading="lazy" decoding="async" />
	{:else}
		<div>
			<strong>{label}</strong>
			<small>{hint}</small>
		</div>
	{/if}
</div>
