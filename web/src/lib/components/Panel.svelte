<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLElement> {
		/** Semantic element for the panel — `article` for case files. */
		as?: 'section' | 'article' | 'div';
		class?: string;
		children: Snippet;
	}

	let { as = 'section', class: className = '', children, ...rest }: Props = $props();
</script>

<svelte:element this={as} class="jl-panel {className}" {...rest}>
	{@render children()}
</svelte:element>
