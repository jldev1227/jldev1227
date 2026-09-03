<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		class?: string;
		children: Snippet;
	}

	let { class: className = '', children }: Props = $props();
</script>

<p class="jl-bubble {className}">{@render children()}</p>

<style>
	.jl-bubble {
		margin: 0;
	}
</style>
