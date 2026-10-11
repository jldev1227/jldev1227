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
