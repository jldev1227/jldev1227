<script lang="ts">
	import { Caption, Panel, ProjectShot, Seo } from '$lib/components';
	import { ComicCover, ComicReader, type ReaderPage } from '$lib/components/comic-reader';
	import { projects, type Project } from '$content/projects';
	import {
		contact,
		identity,
		missionIntro,
		origin,
		powers,
		powersPage,
		seo,
		years
	} from '$content/site';
	import { page as appPage } from '$app/state';
	import { LOCALE_LABEL, missionPath, other, path, swapLocale, translator } from '$i18n';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const locale = $derived(data.locale);
	const t = $derived(translator(locale));

	// Three groups of case files, one per mission page. Derived from the reading
	// order in `projects.ts` rather than restated here.
	const caseGroups = $derived([projects.slice(0, 1), projects.slice(1, 3), projects.slice(3)]);

	// The comic has no masthead, so the closing page carries the indicia: the
	// colophon, and the second place the other language can be reached.
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
		{ id: 'missions-2', label: missionIntro.pageLabelMore[locale], content: pageMissionsTwo },
		{ id: 'missions-3', label: missionIntro.pageLabelLast[locale], content: pageMissionsThree },
		{ id: 'contact', label: contact.pageLabel[locale], content: pageContact }
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
		<Panel class="origin">
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
{#snippet caseFiles(group: Project[])}
	{#each group as project (project.slug)}
		<Panel as="article" class="case" data-accent={project.accent}>
			<a class="case-link" href={missionPath(locale, project.slug)}>
				<ProjectShot src={project.image.src} alt={project.image.alt[locale]} compact />
				<div class="case-copy">
					<span class="jl-kicker">{project.kicker[locale]}</span>
					<h3 class="jl-display">{project.title}</h3>
					<p>{project.tagline[locale]}</p>
					<span class="jl-kicker stack">{project.stack.slice(0, 4).join(' · ')}</span>
				</div>
			</a>
		</Panel>
	{/each}
{/snippet}

{#snippet pageMissions()}
	<div class="jl-grid stack-intro">
		<Panel class="mission-intro">
			<h2 class="jl-display">{missionIntro.title[locale]}</h2>
			<p>{missionIntro.body[locale]}</p>
		</Panel>
		{@render caseFiles(caseGroups[0])}
	</div>
{/snippet}

{#snippet pageMissionsTwo()}
	<div class="jl-grid stack">
		{@render caseFiles(caseGroups[1])}
	</div>
{/snippet}

{#snippet pageMissionsThree()}
	<div class="jl-grid stack">
		{@render caseFiles(caseGroups[2])}
	</div>
{/snippet}

<!-- ------------------------------------------------------------- page 6 ---- -->
{#snippet pageContact()}
	<div class="jl-grid fill">
		<Panel class="contact">
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

<!-- No masthead and no footer: the book is the whole document, and it rests on
     the stage rather than on a sheet of page furniture. -->
<main id="content" class="comic">
	<ComicReader {locale} pages={readerPages}>
		{#snippet cover({ enhanced, open })}
			<ComicCover {locale} {enhanced} onopen={open} />
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
	:global(.jl-panel.powers) {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		grid-auto-rows: 1fr;
		gap: 4px;
		min-height: 300px;
		padding: 4px;
		background: var(--jl-ink);
	}

	.power {
		display: flex;
		flex-direction: column;
		justify-content: end;
		min-height: 138px;
		padding: 16px;
		color: var(--jl-white);
		background: var(--jl-blue);
	}

	.power:nth-child(2) {
		--jl-display-stroke: var(--jl-white);

		color: var(--jl-ink);
		background: var(--jl-yellow);
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

	:global(.jl-panel.mission-intro) p {
		max-width: 48ch;
		margin: 0;
		color: var(--jl-on-dark);
		font-size: clamp(0.78rem, 2.3cqi, 0.9rem);
		line-height: 1.55;
	}

	:global(.jl-panel.case) {
		color: var(--jl-white);
		background: var(--jl-navy-deep);
	}

	:global(.jl-panel.case[data-accent='red']) {
		background: linear-gradient(150deg, var(--jl-navy-deep) 0 55%, var(--jl-red) 55%);
	}

	:global(.jl-panel.case[data-accent='yellow']) {
		color: var(--jl-ink);
		background: var(--jl-yellow);
	}

	:global(.jl-panel.case[data-accent='blue']) {
		background: linear-gradient(150deg, #14263f 0 55%, var(--jl-blue) 55%);
	}

	/* Two case files share a page, so the shot is a band across the top of the
	   panel rather than the 16:9 hero it is on the case-file route. */
	:global(.jl-panel.case .frame) {
		aspect-ratio: 16 / 7;
	}

	/* The whole panel is the hit area, so the link fills it. */
	.case-link {
		display: flex;
		flex-direction: column;
		height: 100%;
		text-decoration: none;
	}

	/* The copy sits at the foot of the panel and the shot at its head, with the
	   panel's diagonal filling the space between. `margin-top: auto` inside the
	   column flex link does that directly; a `flex: 1` box relying on
	   `justify-content` let the last line absorb the free space instead. */
	.case-copy {
		margin-top: auto;
		padding: clamp(14px, 4cqi, 24px);
	}

	.case-link h3 {
		max-width: 13ch;
		margin: 6px 0 8px;
		font-size: clamp(1.5rem, 7cqi, 2.5rem);
		line-height: 0.9;
	}

	.case-link p {
		max-width: 40ch;
		margin: 0 0 12px;
		font-size: clamp(0.74rem, 2.2cqi, 0.82rem);
		line-height: 1.5;
	}

	.case-link .stack {
		font-size: clamp(0.58rem, 1.8cqi, 0.66rem);
		opacity: 0.75;
	}

	.case-link:hover h3 {
		color: var(--jl-yellow);
	}

	:global(.jl-panel.case[data-accent='yellow']) .case-link:hover h3 {
		color: var(--jl-red);
	}

	/* ---------------------------------------------------------- page six ---- */

	:global(.jl-panel.contact) {
		min-height: 300px;
		background: linear-gradient(135deg, var(--jl-ink) 0 58%, var(--jl-blue) 58%);
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
