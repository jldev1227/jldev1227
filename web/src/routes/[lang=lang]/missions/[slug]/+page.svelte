<script lang="ts">
	import { Seo } from '$lib/components';
	import {
		CASE_SECTIONS,
		CaseFilePage,
		caseSectionLabel,
		ComicCover,
		ComicReader,
		isCaseSection,
		type CoverIssue,
		type ReaderPage
	} from '$lib/components/comic-reader';
	import { cover as coverCopy, identity } from '$content/site';
	import { path, translator } from '$i18n';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const locale = $derived(data.locale);
	const project = $derived(data.project);
	const t = $derived(translator(locale));

	const canonicalPath = $derived(path(locale, 'missions', project.slug));
	const title = $derived(`${project.title} · ${identity.alias}`);

	/**
	 * Every case file is its own issue of the same collection: same masthead and
	 * imprint, its own number and cover story.
	 */
	const issue = $derived<CoverIssue>({
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
		art: project.coverArt,
		coverText: project.coverText,
		palette: project.palette
	});

	// The pages themselves are laid out in `CaseFilePage`, which the archive on
	// the home page prints from as well. A page's id is its section, and it is
	// also the hash that reopens the book there.
	const readerPages = $derived<ReaderPage[]>(
		CASE_SECTIONS.map((section) => ({
			id: section,
			label: caseSectionLabel(t, section),
			content: casePage
		}))
	);
</script>

<Seo
	{locale}
	{title}
	description={project.tagline[locale]}
	type="article"
	schema={[
		{
			'@type': 'CreativeWork',
			'@id': `${identity.url}${canonicalPath}#case`,
			name: project.title,
			abstract: project.tagline[locale],
			inLanguage: locale,
			author: { '@id': `${identity.url}/#person` },
			keywords: project.stack.join(', ')
		}
	]}
/>

{#snippet casePage(id: string)}
	{#if isCaseSection(id)}
		<CaseFilePage {locale} {project} section={id} />
	{/if}
{/snippet}

<!-- Its own issue of the collection, read exactly like the introductory one. -->
<main id="content" class="comic">
	<ComicReader {locale} pages={readerPages}>
		{#snippet cover({ enhanced, open })}
			<ComicCover {locale} {issue} {enhanced} onopen={open} />
		{/snippet}
	</ComicReader>
</main>

<style>
	.comic {
		display: block;
		max-width: var(--jl-page-max);
		margin: 0 auto;
		/* Room either side for the stack of page edges the reader draws. */
		padding: 0 clamp(18px, 3vw, 36px);
	}
</style>
