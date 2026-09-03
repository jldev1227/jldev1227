<script lang="ts">
	interface Props {
		/** Title shown while no artwork exists yet. */
		label: string;
		hint: string;
		/** Set once the commissioned illustration lands in `static/art/`. */
		src?: string;
		alt?: string;
		class?: string;
	}

	let { label, hint, src, alt = '', class: className = '' }: Props = $props();
</script>

<div class="jl-art-slot {className}">
	{#if src}
		<img {src} {alt} loading="lazy" decoding="async" />
	{:else}
		<div>
			<strong>{label}</strong>
			<small>{hint}</small>
		</div>
	{/if}
</div>
