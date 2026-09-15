<script lang="ts">
	import { Panel } from '$lib/components';
	import { ComicExperience, type ExperienceVolume } from '$lib/components/comic-experience';
	import type { CoverIssue, ReaderPage } from '$lib/components/comic-reader';
	import { cover as coverCopy } from '$content/site';
	import { findProject, projects } from '$content/projects';
	import { missionPath, translator } from '$i18n';
	import type { PageProps } from './$types';

	/**
	 * Milestone 1 — the three-state shell, proved.
	 *
	 * Every issue of the collection is a volume on the shelf; picking one up
	 * inspects it, and reading it hands off to the reader the site already has.
	 * No Three.js, no Rive, no StPageFlip: if the architecture needs one of them
	 * to hold together, it does not hold together.
	 */

	let { data }: PageProps = $props();

	const locale = $derived(data.locale);
	const t = $derived(translator(locale));

	/**
	 * A page snippet is handed its own id, and that is the only thing it gets —
	 * so the id carries the volume as well as the section. A proving-route
	 * shortcut: milestone 2 gives each issue its own page snippets, the way the
	 * case-file route already does.
	 */
	const SECTIONS = ['challenge', 'approach', 'outcome'] as const;
	type Section = (typeof SECTIONS)[number];

	function partsOf(id: string): { slug: string; section: Section } {
		const [slug, section] = id.split('--');
		return { slug, section: section as Section };
	}

	const volumes = $derived<ExperienceVolume[]>(
		projects.map((project) => ({
			id: project.slug,
			href: missionPath(locale, project.slug),
			title: project.title,
			cover: {
				volume: t('missions.collection'),
				issue: `#${project.number}`,
				price: coverCopy.price[locale],
				imprint: coverCopy.imprint[locale],
				date: coverCopy.date[locale],
				stamp: coverCopy.stamp[locale],
				storyKicker: project.kicker[locale],
				titleTop: project.title,
				lead: project.tagline[locale],
				blurb: project.image.caption[locale],
				palette: project.palette
			} satisfies CoverIssue,
			pages: SECTIONS.map(
				(section) =>
					({
						id: `${project.slug}--${section}`,
						label: t(`missions.${section}`),
						content: casePage
					}) satisfies ReaderPage
			)
		}))
	);
</script>

{#snippet casePage(id: string)}
	{@const { slug, section } = partsOf(id)}
	{@const project = findProject(slug)}
	{#if project}
		<div class="jl-grid">
			<Panel>
				<div class="copy" style="--jl-world-base:{project.palette.base}">
					<h2 class="jl-display">{t(`missions.${section}`)}</h2>
					<p>{project[section][locale]}</p>
				</div>
			</Panel>
		</div>
	{/if}
{/snippet}

<svelte:head>
	<title>Milestone 1 · three-state shell</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<main class="proving">
	<header>
		<h1>Milestone 1 — three-state shell</h1>
		<p>
			Development harness for <code>docs/comic-reader/LIBRARY-INTERACTION.md</code>. Not part of the
			site and not reachable in production.
		</p>
	</header>

	<ComicExperience {locale} {volumes} />
</main>

<style>
	.proving {
		/* `body` pairs `--jl-ink` with a `--jl-paper` that goes near-black under a
		   dark colour scheme, and these harnesses put text straight onto it rather
		   than inside a panel that sets its own colours. Pin the pair
		   to paper so the instrument is readable either way. */
		min-height: 100vh;
		color: var(--jl-ink);
		background: #f4f0e7;
		max-width: var(--jl-page-max);
		margin: 0 auto;
		padding: 24px 16px 64px;
		font-family: var(--jl-font-body);
	}

	header p {
		color: #555;
		font-size: 0.85rem;
	}

	.copy {
		display: flex;
		flex-direction: column;
		gap: 12px;
		height: 100%;
		padding: clamp(20px, 5cqi, 36px);
		color: var(--jl-white);
		background: var(--jl-world-base, var(--jl-navy));
	}

	.copy h2 {
		margin: 0;
		font-size: clamp(1.4rem, 7cqi, 2.4rem);
	}

	.copy p {
		margin: 0;
		font-size: clamp(0.8rem, 2.4cqi, 0.92rem);
		line-height: 1.6;
	}
</style>
