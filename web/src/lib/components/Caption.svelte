<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		/** Extra positioning class, when the default top-left corner is wrong. */
		class?: string;
		children: Snippet;
	}

	let { class: className = '', children }: Props = $props();
</script>

<p class="jl-caption {className}">{@render children()}</p>

<style>
	.jl-caption {
		margin: 0;
	}
</style>
