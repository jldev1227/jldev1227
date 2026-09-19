<script lang="ts">
	import { Masthead, PageFooter, Seo } from '$lib/components';
	import {
		CASE_SECTIONS,
		CaseFilePage,
		caseSectionLabel,
		isCaseSection,
		type CoverIssue,
		type ReaderPage
	} from '$lib/components/comic-reader';
	import { ComicExperience, type ExperienceVolume } from '$lib/components/comic-experience';
	import { findProject, projects } from '$content/projects';
	import { cover, identity, missionIntro } from '$content/site';
	import { missionPath, path, translator } from '$i18n';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const locale = $derived(data.locale);
	const t = $derived(translator(locale));
	const canonicalPath = $derived(path(locale, 'missions'));

	/**
	 * The complete shelf. Each cover remains an ordinary canonical link until
	 * JavaScript enhances it into the modal reader.
	 */
	const archiveVolumes = $derived<ExperienceVolume[]>(
		projects.map((project) => ({
			id: project.slug,
			href: missionPath(locale, project.slug),
			title: project.title,
			cover: {
				volume: t('missions.collection'),
				issue: `#${project.number}`,
				price: cover.price[locale],
				imprint: cover.imprint[locale],
				date: cover.date[locale],
				stamp: cover.stamp[locale],
				storyKicker: project.kicker[locale],
				titleTop: project.title,
				lead: project.tagline[locale],
				blurb: project.image.caption[locale],
				art: project.coverArt,
				coverText: project.coverText,
				palette: project.palette
			} satisfies CoverIssue,
			pages: CASE_SECTIONS.map(
				(section) =>
					({
						id: `${project.slug}--${section}`,
						label: caseSectionLabel(t, section),
						content: casePage
					}) satisfies ReaderPage
			)
		}))
	);
</script>

<Seo
	{locale}
	title={`${t('missions.all')} · ${identity.alias}`}
	description={missionIntro.body[locale]}
	schema={[
		{
			'@type': 'CollectionPage',
			'@id': `${identity.url}${canonicalPath}#collection`,
			name: t('missions.all'),
			inLanguage: locale,
			hasPart: projects.map((project) => ({
				'@type': 'CreativeWork',
				name: project.title,
				url: `${identity.url}${missionPath(locale, project.slug)}`
			}))
		}
	]}
/>

{#snippet casePage(id: string)}
	{@const [slug, section] = id.split('--')}
	{@const project = findProject(slug)}
	{#if project && isCaseSection(section)}
		<CaseFilePage {locale} {project} {section} context="archive" />
	{/if}
{/snippet}

<div class="archive-shell">
	<Masthead {locale} />
	<main id="content">
		<ComicExperience {locale} volumes={archiveVolumes} />
	</main>
	<PageFooter {locale} />
</div>

<style>
	.archive-shell {
		position: relative;
		z-index: 1;
		width: 100%;
		margin: 0 auto;
		background: var(--jl-ink);
		box-shadow:
			0 0 0 1px rgb(255 255 255 / 0.12),
			0 28px 90px rgb(0 0 0 / 0.55);
	}

	main {
		min-height: 100svh;
	}

	@media (max-width: 760px) {
		.archive-shell {
			box-shadow: none;
		}
	}
</style>
