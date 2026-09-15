<script lang="ts">
	import { Caption, Panel, ProjectShot, Seo } from '$lib/components';
	import { type CoverIssue, type ReaderPage } from '$lib/components/comic-reader';
	import { ComicExperience, type ExperienceVolume } from '$lib/components/comic-experience';
	import { findProject, projects, type Project } from '$content/projects';
	import {
		contact,
		// `cover` is aliased: the snippet handed to the reader is named `cover` too.
		cover as coverCopy,
		hero,
		identity,
		missionIntro,
		origin,
		powers,
		powersPage,
		seo,
		years
	} from '$content/site';
	import { page as appPage } from '$app/state';
	import { homePath, LOCALE_LABEL, missionPath, other, path, swapLocale, translator } from '$i18n';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const locale = $derived(data.locale);
	const t = $derived(translator(locale));

	// One case file to a page: a mission gets a page of its own, and every page of
	// every issue is then printed at the same size.

	// The comic has no masthead, so the closing page carries the indicia: the
	// colophon, and the second place the other language can be reached.
	/** This issue's cover furniture, already localized for the cover to print. */
	const issue = $derived<CoverIssue>({
		volume: coverCopy.volume[locale],
		issue: coverCopy.issue,
		price: coverCopy.price[locale],
		imprint: coverCopy.imprint[locale],
		date: coverCopy.date[locale],
		stamp: coverCopy.stamp[locale],
		storyKicker: coverCopy.storyKicker[locale],
		titleTop: hero.titleTop[locale],
		titleAccent: hero.titleAccent[locale],
		lead: hero.lead[locale],
		blurb: hero.caption[locale],
		bubble: hero.bubble[locale],
		art: { src: '/art/julian-cover-freelancer-v1.webp', width: 1024, height: 1536 }
	});

	const otherLocale = $derived(other(locale));
	const switchHref = $derived(swapLocale(appPage.url.pathname, otherLocale));
	const year = new Date().getFullYear();

	// The reader owns presentation only; the pages it turns are these snippets,
	// and their copy comes from `$content` like every other string on the site.
	// A page id is also the URL hash that reopens the book at it, which is what
	// makes the masthead's #origin, #missions and #contact links work.
	const readerPages = $derived<ReaderPage[]>([
		{ id: 'origin', label: origin.pageLabel[locale], content: pageOrigin },
		{ id: 'powers', label: powersPage.pageLabel[locale], content: pagePowers },
		{ id: 'missions', label: missionIntro.pageLabel[locale], content: pageMissions },
		...projects.map((project) => ({
			id: project.slug,
			label: project.title,
			content: caseFilePage
		})),
		{ id: 'contact', label: contact.pageLabel[locale], content: pageContact }
	]);

	const archiveVolumes = $derived<ExperienceVolume[]>([
		{
			id: 'intro',
			href: homePath(locale),
			title: `${identity.alias} ${coverCopy.issue}`,
			cover: issue,
			pages: readerPages
		},
		...projects.map((project) => ({
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
			pages: [
				{
					id: project.slug,
					label: project.title,
					content: caseFilePage
				}
			]
		}))
	]);
</script>

<Seo
	{locale}
	title={seo.title[locale]}
	description={seo.description[locale]}
	keywords={seo.keywords[locale]}
	schema={[
		{
			'@type': 'ProfilePage',
			'@id': `${identity.url}${path(locale)}#page`,
			name: seo.title[locale],
			inLanguage: locale,
			mainEntity: { '@id': `${identity.url}/#person` }
		}
	]}
/>

<!-- ------------------------------------------------------------- page 1 ---- -->
{#snippet pageOrigin()}
	<div class="jl-grid fill">
		<Panel class="origin jl-bleed jl-bleed-top" data-shade="corner">
			<Caption>{origin.caption[locale]}</Caption>
			<div class="origin-copy">
				<h2 class="jl-display">
					<span>{origin.headingLead[locale]}</span>
					<em>{origin.headingAccent[locale]}</em>
					<span>{origin.headingTail[locale]}</span>
				</h2>
				<p>{origin.body[locale]}</p>
			</div>
		</Panel>
	</div>
{/snippet}

<!-- ------------------------------------------------------------- page 2 ---- -->
{#snippet pagePowers()}
	<div class="jl-grid stack-intro">
		<Panel class="years">
			<Caption>{powersPage.caption[locale]}</Caption>
			<div class="years-copy">
				<strong class="jl-display">{years.value}</strong>
				<span class="jl-kicker">{years.label[locale]}</span>
			</div>
		</Panel>

		<Panel class="powers" aria-label={powersPage.pageLabel[locale]}>
			{#each powers as power (power.title.en)}
				<div class="power">
					<strong class="jl-display">{power.title[locale]}</strong>
					<small>{power.body[locale]}</small>
				</div>
			{/each}
		</Panel>
	</div>
{/snippet}

<!-- ----------------------------------------------------- pages 3, 4 and 5 -- -->

<!-- A case file keeps its ordinary anchor: the reader turns pages, it does not
     replace navigation into the mission routes. -->
{#snippet caseFile(project: Project, index: number)}
	{@const flipped = index % 2 === 1}
	<div
		class="jl-grid case-page"
		data-flipped={flipped ? '' : undefined}
		style="--jl-world-base:{project.palette.base}; --jl-world-accent:{project.palette
			.accent}; --jl-world-on:{project.palette.on === 'ink'
			? 'var(--jl-ink)'
			: 'var(--jl-white)'}; --jl-world-on-accent:{project.palette.onAccent === 'ink'
			? 'var(--jl-ink)'
			: 'var(--jl-white)'}"
	>
		<Panel class="case-shot jl-bleed">
			<ProjectShot src={project.image.src} alt={project.image.alt[locale]} compact />
		</Panel>

		<Panel
			as="article"
			class="case"
			data-accent={project.accent}
			data-shade={flipped ? 'head' : 'corner'}
		>
			<div class="case-copy">
				<span class="jl-kicker">{project.kicker[locale]}</span>
				<h3 class="jl-display">{project.title}</h3>
				<p>{project.tagline[locale]}</p>
				<span class="jl-kicker stack">{project.stack.slice(0, 4).join(' · ')}</span>
				<a class="case-open" href={missionPath(locale, project.slug)}>
					{t('missions.readFile')} · {project.number}
				</a>
			</div>
		</Panel>
	</div>
{/snippet}

<!--
	One page per case file. The reader renders a page with its own id, and a case
	page's id is the project's slug, so one snippet stands in for all five.
-->
{#snippet caseFilePage(slug: string)}
	{@const project = findProject(slug)}
	{#if project}
		{@render caseFile(project, projects.indexOf(project))}
	{/if}
{/snippet}

{#snippet pageMissions()}
	<div class="jl-grid fill">
		<Panel class="mission-intro jl-bleed jl-bleed-top" data-shade="head">
			<h2 class="jl-display">{missionIntro.title[locale]}</h2>
			<p>{missionIntro.body[locale]}</p>
		</Panel>
	</div>
{/snippet}

{#snippet pageContact()}
	<div class="jl-grid fill">
		<Panel class="contact jl-bleed jl-bleed-top" data-shade="corner">
			<Caption>{contact.caption[locale]}</Caption>
			<div class="contact-copy">
				<h2 class="jl-display">{contact.title[locale]}</h2>
				<p>{contact.body[locale]}</p>
				<ul>
					<li><a href="mailto:{identity.email}">{t('contact.email')}</a></li>
					<li><a href={identity.github} rel="me noopener">{t('contact.github')}</a></li>
					<li><a href={identity.linkedin} rel="me noopener">{t('contact.linkedin')}</a></li>
				</ul>

				<p class="colophon jl-kicker">
					<span>{t('footer.rights')}</span>
					<span>© {year} {identity.name} · {identity.domain}</span>
					<a
						href={switchHref}
						hreflang={otherLocale}
						lang={otherLocale}
						rel="alternate"
						aria-label={t('lang.switchAria')}
						data-sveltekit-reload
					>
						{LOCALE_LABEL[otherLocale]}
					</a>
				</p>
			</div>
		</Panel>
	</div>
{/snippet}

<!-- The archive is the homepage. Canonical mission routes remain independent
     documents; without JavaScript every volume is still an ordinary link. -->
<main id="content" class="archive-home">
	<!-- Existing documents link to these historical home anchors. They now land
	     at the archive entrance instead of a section in the old long page. -->
	<span id="origin" hidden></span>
	<span id="missions" hidden></span>
	<span id="contact" hidden></span>
	<ComicExperience {locale} volumes={archiveVolumes} />
</main>

<style>
	.archive-home {
		display: block;
		min-height: 100svh;
	}

	/* Every panel below lives inside a reader page, which is half a spread on
	   desktop and a whole page on mobile. They size against that page container
	   (`cqi`), never the viewport — the viewport is not what they sit in. */

	/* Pages whose panels fill the sheet rather than sitting at the top, leaving a
	   tail of blank paper. Every page in a spread is the same height, so a page
	   with less in it has to grow its panels, not pad itself out. */
	.fill {
		flex: 1;
		grid-template-rows: 1fr;
	}

	/* Case files only. */
	.stack {
		flex: 1;
		grid-auto-rows: 1fr;
	}

	/* A panel that sets its own height, then one that takes the rest of the sheet. */
	.stack-intro {
		flex: 1;
		grid-template-rows: auto 1fr;
	}

	/* ---------------------------------------------------------- page one ---- */

	:global(.jl-panel.origin) {
		display: grid;
		min-height: 320px;
		color: var(--jl-white);
		background: linear-gradient(145deg, #111b2c, #263d64);
	}

	/* Copy flows and the top padding reserves the caption's corner: the panel
	   clips, and Spanish runs a line longer than English. */
	.origin-copy {
		display: flex;
		flex-direction: column;
		justify-content: end;
		min-height: 320px;
		padding: 104px clamp(20px, 5cqi, 40px) clamp(20px, 5cqi, 40px);
	}

	/* Three statements, three lines — wrapping on width breaks them in the
	   wrong places, and differently in each language. */
	.origin-copy h2 {
		margin: 0 0 16px;
		font-size: clamp(2rem, 9cqi, 3.6rem);
		line-height: 0.9;
	}

	.origin-copy h2 :is(span, em) {
		display: block;
	}

	.origin-copy h2 em {
		color: var(--jl-red);
		font-style: normal;
		text-shadow: 3px 3px 0 var(--jl-white);
	}

	.origin-copy p {
		max-width: 54ch;
		margin: 0;
		color: var(--jl-on-dark);
		font-size: clamp(0.82rem, 2.4cqi, 0.92rem);
		line-height: 1.6;
	}

	/* ---------------------------------------------------------- page two ---- */

	:global(.jl-panel.years) {
		min-height: 230px;
		color: var(--jl-ink);
		background: var(--jl-yellow);
	}

	.years-copy {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: end;
		min-height: 230px;
		padding: 100px 24px 26px;
		text-align: center;
	}

	.years-copy strong {
		font-size: clamp(3.4rem, 18cqi, 7rem);
		line-height: 0.8;
		text-shadow: 5px 5px 0 var(--jl-white);
	}

	.years-copy span {
		margin-top: 16px;
		font-size: clamp(0.66rem, 2cqi, 0.8rem);
		letter-spacing: 0.09em;
	}

	/* Four sub-panels sharing the ink background as their gutter. */
	/* Not four equal tiles: the first power leads, the others follow at their own
	   sizes, the way a letterer would break up a strip. */
	:global(.jl-panel.powers) {
		display: grid;
		grid-template-columns: 1.3fr 0.7fr;
		grid-template-rows: 1.15fr 0.85fr;
		gap: 5px;
		min-height: 300px;
		padding: 5px;
		background: var(--jl-ink);
	}

	.power {
		display: flex;
		flex-direction: column;
		justify-content: end;
		min-height: 138px;
		padding: 16px;
		color: var(--jl-white);
		background: var(--jl-blue-deep);
	}

	.power:nth-child(2) {
		--jl-display-stroke: var(--jl-white);

		color: var(--jl-ink);
		background: var(--jl-yellow);
	}

	.power:nth-child(2) small {
		color: var(--jl-ink);
	}

	/* A wide one, a tall one beside it, then one below and one closing the
	   width — a strip broken the way a letterer would break it, with no hole. */
	.power:nth-child(2) {
		grid-row: 1 / span 2;
		grid-column: 2;
	}

	.power:nth-child(3) {
		grid-row: 2;
		grid-column: 1;
	}

	.power:nth-child(4) {
		grid-row: 3;
		grid-column: 1 / -1;
	}

	:global(.jl-panel.powers) {
		grid-template-rows: 1.15fr 0.85fr 0.75fr;
	}

	.power:nth-child(3) {
		background: var(--jl-red);
	}

	.power:nth-child(4) {
		background: #1b2a43;
	}

	.power strong {
		font-size: clamp(1.15rem, 5cqi, 1.5rem);
		letter-spacing: 0.03em;
	}

	.power small {
		margin-top: 5px;
		color: var(--jl-white);
		font-size: clamp(0.68rem, 2.1cqi, 0.75rem);
		line-height: 1.35;
	}

	@container jl-page (max-width: 330px) {
		:global(.jl-panel.powers) {
			grid-template-columns: 1fr;
		}

		.power {
			min-height: 104px;
		}
	}

	/* -------------------------------------------------- pages three to five -- */

	:global(.jl-panel.mission-intro) {
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 14px;
		min-height: 190px;
		padding: clamp(20px, 5cqi, 34px);
		color: var(--jl-white);
		background: linear-gradient(115deg, var(--jl-red) 0 62%, var(--jl-ink) 62%);
	}

	:global(.jl-panel.mission-intro) h2 {
		max-width: 12ch;
		font-size: clamp(2rem, 11cqi, 3.6rem);
		line-height: 0.86;
		text-shadow: 4px 4px 0 var(--jl-ink);
	}

	/* A caption plate, so the copy is not crossing the diagonal in mid-sentence. */
	:global(.jl-panel.mission-intro) p {
		max-width: 48ch;
		margin: 0;
		padding: 11px 13px;
		color: var(--jl-white);
		background: color-mix(in oklab, var(--jl-ink) 84%, transparent);
		font-size: clamp(0.78rem, 2.3cqi, 0.9rem);
		line-height: 1.55;
	}

	/*
	 * Two tones of the world's own palette, on the comic's diagonal.
	 *
	 * The far side is a tint of the accent rather than the accent itself. The
	 * copy block is anchored to the foot of the panel, which is precisely where
	 * the diagonal has crossed over, so at full strength the summary ran from
	 * near-black onto raw gold at 2.2:1. The accent keeps full strength only
	 * where the text on it is `--jl-world-on-accent`: the open control, the
	 * snapshot panel, the cover plate.
	 */
	:global(.jl-panel.case) {
		--jl-display-stroke: var(--jl-world-base, var(--jl-ink));

		color: var(--jl-world-on, var(--jl-white));
		background: linear-gradient(
			150deg,
			var(--jl-world-base, var(--jl-navy-deep)) 0 55%,
			color-mix(
					in oklab,
					var(--jl-world-accent, var(--jl-red)) 32%,
					var(--jl-world-base, var(--jl-navy-deep))
				)
				55%
		);
	}

	/* Two case files share a page, so the shot is a band across the top of the
	   panel rather than the 16:9 hero it is on the case-file route. */
	:global(.jl-panel.case .frame) {
		aspect-ratio: 16 / 7;
	}

	/* One shot, one block of copy, and which of the two leads alternates down the
	   issue, so no two case files are laid out the same way. */
	.case-page {
		flex: 1;
		grid-template-rows: 1.05fr 1fr;
	}

	.case-page[data-flipped] {
		grid-template-rows: 1fr 1.05fr;
	}

	.case-page > :global(:nth-child(1)) {
		grid-row: 1;
	}

	.case-page > :global(:nth-child(2)) {
		grid-row: 2;
	}

	.case-page[data-flipped] > :global(:nth-child(1)) {
		grid-row: 2;
	}

	.case-page[data-flipped] > :global(:nth-child(2)) {
		grid-row: 1;
	}

	/* The shot sits on its own world's colour, with room for its frame. */
	:global(.jl-panel.case-shot) {
		--jl-shot-mat: var(--jl-world-base, var(--jl-ink));

		display: grid;
		padding: clamp(12px, 3.5cqi, 24px);
		background: var(--jl-world-base, var(--jl-ink));
	}

	:global(.jl-panel.case-shot figure) {
		height: 100%;
	}

	/* The panel itself is drag surface: only the control below navigates, so a
	   gesture that crosses a case file never opens it by accident. */
	:global(.jl-panel.case) {
		display: flex;
		flex-direction: column;
	}

	.case-copy {
		display: flex;
		flex-direction: column;
		align-items: start;
		margin-top: auto;
		padding: clamp(14px, 4cqi, 24px);
	}

	.case-copy h3 {
		max-width: 13ch;
		margin: 6px 0 8px;
		font-size: clamp(1.5rem, 7cqi, 2.5rem);
		line-height: 0.9;
	}

	.case-copy p {
		max-width: 40ch;
		margin: 0 0 12px;
		font-size: clamp(0.74rem, 2.2cqi, 0.82rem);
		line-height: 1.5;
	}

	.case-copy .stack {
		font-size: clamp(0.58rem, 1.8cqi, 0.66rem);
		opacity: 0.75;
	}

	.case-open {
		margin-top: 14px;
		padding: 9px 14px;
		color: var(--jl-world-on-accent, var(--jl-ink));
		background: var(--jl-world-accent, var(--jl-yellow));
		border: 3px solid var(--jl-world-on, var(--jl-ink));
		box-shadow: 4px 4px 0 var(--jl-world-on, var(--jl-ink));
		font-family: var(--jl-font-body);
		font-size: clamp(0.62rem, 2cqi, 0.72rem);
		font-weight: 600;
		letter-spacing: 0.06em;
		text-decoration: none;
		text-transform: uppercase;
	}

	.case-open:hover {
		color: var(--jl-world-accent, var(--jl-red));
		background: var(--jl-world-on, var(--jl-white));
	}

	/* ---------------------------------------------------------- page six ---- */

	:global(.jl-panel.contact) {
		min-height: 300px;
		background: linear-gradient(135deg, var(--jl-ink) 0 58%, var(--jl-blue-deep) 58%);
	}

	/* Top padding reserves the caption's corner, the same way page one does. */
	/* The closing page fills a whole sheet, so the copy sits in the middle of it
	   rather than at the foot of a short panel. */
	.contact-copy {
		display: flex;
		flex-direction: column;
		justify-content: center;
		min-height: 300px;
		height: 100%;
		padding: 104px clamp(20px, 5cqi, 36px) clamp(20px, 5cqi, 36px);
		color: var(--jl-white);
	}

	/* Three long lines in Spanish, and `¿` plus `Ó` meet across them at the 0.88
	   line-height the display face normally uses. */
	.contact-copy h2 {
		max-width: 12ch;
		font-size: clamp(2rem, 10cqi, 3.6rem);
		line-height: 0.98;
		text-shadow: 4px 4px 0 var(--jl-red);
	}

	.contact-copy p {
		max-width: 46ch;
		margin: 18px 0 24px;
		color: var(--jl-on-dark);
		font-size: clamp(0.82rem, 2.4cqi, 0.92rem);
		line-height: 1.6;
	}

	.contact-copy ul {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	/* Scoped to the contact list: the colophon below it is printed matter, not
	   another button. */
	.contact-copy ul a {
		display: inline-block;
		padding: 10px 16px;
		color: var(--jl-ink);
		background: var(--jl-yellow);
		border: 3px solid var(--jl-ink);
		box-shadow: 4px 4px 0 var(--jl-ink);
		font-size: clamp(0.7rem, 2.1cqi, 0.78rem);
		font-weight: 600;
		text-decoration: none;
		text-transform: uppercase;
	}

	.contact-copy ul a:hover {
		color: var(--jl-white);
		background: var(--jl-red);
	}

	/* The indicia a printed issue carries on its last page, now that the site
	   has no footer of its own. */
	.colophon {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 6px 14px;
		margin: 26px 0 0;
		color: var(--jl-on-dark-dim);
		font-size: clamp(0.54rem, 1.7cqi, 0.64rem);
	}

	.colophon a {
		color: var(--jl-yellow);
		text-decoration-thickness: 1px;
		text-underline-offset: 3px;
	}

	.colophon a:hover {
		color: var(--jl-white);
	}
</style>
