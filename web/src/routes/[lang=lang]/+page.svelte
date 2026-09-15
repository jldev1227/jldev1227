<script lang="ts">
	import { Caption, Panel, Seo } from '$lib/components';
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
	import { histories, monthSpan } from '$content/project-history';
	import {
		contact,
		// `cover` is aliased: the snippet handed to the reader is named `cover` too.
		cover as coverCopy,
		hero,
		identity,
		origin,
		powers,
		powersPage,
		seo,
		stack,
		stackPage,
		timelinePage,
		years
	} from '$content/site';
	import { techMark, techMonogram } from '$content/tech-marks';
	import { page as appPage } from '$app/state';
	import { homePath, LOCALE_LABEL, missionPath, other, path, swapLocale, translator } from '$i18n';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const locale = $derived(data.locale);
	const t = $derived(translator(locale));

	/**
	 * The introductory issue: who is writing, what with, and where to reach
	 * them. The case files are no longer pages of it — each is an issue of its
	 * own on the same table.
	 */
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
		art: { src: '/art/julian-cover-freelancer-v2.webp', width: 1024, height: 1536 }
	});

	const otherLocale = $derived(other(locale));
	const switchHref = $derived(swapLocale(appPage.url.pathname, otherLocale));
	const year = new Date().getFullYear();

	// The reader owns presentation only; the pages it turns are these snippets,
	// and their copy comes from `$content` like every other string on the site.
	const introPages = $derived<ReaderPage[]>([
		{ id: 'origin', label: origin.pageLabel[locale], content: pageOrigin },
		{ id: 'powers', label: powersPage.pageLabel[locale], content: pagePowers },
		{ id: 'stack', label: stackPage.pageLabel[locale], content: pageStack },
		{ id: 'timeline', label: timelinePage.pageLabel[locale], content: pageTimeline },
		{ id: 'contact', label: contact.pageLabel[locale], content: pageContact }
	]);

	/**
	 * The case files on one calendar, from the earliest first commit to the
	 * latest last one. Each bar is positioned in months, so overlapping work
	 * overlaps on the page the way it did in the year.
	 */
	const calendar = $derived.by(() => {
		const since = histories.map((h) => h.since).sort()[0];
		const until =
			histories
				.map((h) => h.until)
				.sort()
				.at(-1) ?? since;
		const months = monthSpan(since, until);
		const monthName = new Intl.DateTimeFormat(locale, { month: 'short', year: '2-digit' });
		const label = (id: string) => {
			const [y, m] = id.split('-').map(Number);
			return monthName.format(new Date(y, m - 1, 1));
		};
		return {
			months,
			ticks: months
				.filter((m, i) => i === 0 || m.endsWith('-01') || i === months.length - 1)
				.map(label),
			rows: projects.map((project) => {
				const history = histories.find((h) => h.slug === project.slug);
				const start = history ? months.indexOf(history.since) : 0;
				const end = history ? months.indexOf(history.until) : 0;
				return {
					title: project.title,
					palette: project.palette,
					commits: history?.commits ?? 0,
					left: (start / months.length) * 100,
					width: ((end - start + 1) / months.length) * 100,
					from: history ? label(history.since) : '',
					to: history ? label(history.until) : ''
				};
			}),
			total: histories.reduce((sum, h) => sum + h.commits, 0)
		};
	});

	/**
	 * A page snippet is handed its own id and nothing else, so for a case file
	 * the id carries the issue as well as the section: `segispro--outcome`.
	 */
	const archiveVolumes = $derived<ExperienceVolume[]>([
		{
			id: 'intro',
			href: homePath(locale),
			title: `${identity.alias} ${coverCopy.issue}`,
			cover: issue,
			pages: introPages
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

<!-- ------------------------------------------------------------- page 3 ---- -->
{#snippet pageStack()}
	<div class="jl-grid fill">
		<Panel class="toolkit jl-bleed jl-bleed-top" data-shade="head">
			<Caption>{stackPage.caption[locale]}</Caption>
			<div class="toolkit-copy">
				<h2 class="jl-display">{stackPage.title[locale]}</h2>
				<p>{stackPage.body[locale]}</p>

				<dl class="groups">
					{#each stack as group (group.label.en)}
						<div class="group">
							<dt class="jl-kicker">{group.label[locale]}</dt>
							<dd>
								<ul>
									{#each group.items as tool (tool)}
										{@const mark = techMark(tool)}
										<li class="jl-kicker">
											{#if mark}
												<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
													<path d={mark.path} />
												</svg>
											{:else}
												<span class="monogram" aria-hidden="true">{techMonogram(tool)}</span>
											{/if}
											{tool}
										</li>
									{/each}
								</ul>
							</dd>
						</div>
					{/each}
				</dl>
			</div>
		</Panel>
	</div>
{/snippet}

<!-- ------------------------------------------------------------- page 4 ---- -->
{#snippet pageTimeline()}
	<div class="jl-grid fill">
		<Panel class="calendar jl-bleed jl-bleed-top" data-shade="corner">
			<Caption>{timelinePage.caption[locale]}</Caption>
			<div class="calendar-copy">
				<h2 class="jl-display">{timelinePage.title[locale]}</h2>
				<p>{timelinePage.body[locale]}</p>

				<ol class="calendar-rows">
					{#each calendar.rows as row (row.title)}
						<li
							style="--row-left:{row.left}%; --row-width:{row.width}%; --row-accent:{row.palette
								.accent}"
						>
							<span class="calendar-name jl-display">{row.title}</span>
							<span class="calendar-track" aria-hidden="true"
								><span class="calendar-bar"></span></span
							>
							<span class="calendar-meta jl-kicker">{row.from} → {row.to} · {row.commits}</span>
						</li>
					{/each}
				</ol>
				<p class="calendar-ticks jl-kicker" aria-hidden="true">
					{#each calendar.ticks as tick (tick)}<span>{tick}</span>{/each}
				</p>
				<p class="calendar-total jl-kicker">
					{timelinePage.commits[locale].replace('{count}', String(calendar.total))}
				</p>
			</div>
		</Panel>
	</div>
{/snippet}

<!-- ------------------------------------------------------------- page 5 ---- -->
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

				<!-- The comic has no masthead, so the closing page carries the
				     indicia: the colophon, and the other place the other language
				     can be reached. -->
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

<!-- ---------------------------------------------------------- case files -- -->

<!-- One snippet stands in for every page of every case file: the id says
     which issue and which section, and `CaseFilePage` prints the same page
     the canonical route does. -->
{#snippet casePage(id: string)}
	{@const [slug, section] = id.split('--')}
	{@const project = findProject(slug)}
	{#if project && isCaseSection(section)}
		<CaseFilePage {locale} {project} {section} context="archive" />
	{/if}
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
		grid-template-rows: 1.15fr 0.85fr 0.75fr;
		gap: 5px;
		min-height: 300px;
		padding: 5px;
		background: var(--jl-ink);
	}

	.power {
		display: flex;
		flex-direction: column;
		justify-content: end;
		min-height: 120px;
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
		background: var(--jl-red);
	}

	.power:nth-child(4) {
		grid-row: 3;
		grid-column: 1 / -1;
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

	/* -------------------------------------------------------- page three ---- */

	/* The deep blue is the reading ground; the signal blue on the diagonal is
	   a graphic, and nothing is set on it. */
	:global(.jl-panel.toolkit) {
		--jl-display-stroke: var(--jl-navy-deep);

		display: grid;
		min-height: 320px;
		color: var(--jl-white);
		background: linear-gradient(160deg, var(--jl-navy-deep) 0 64%, var(--jl-blue-deep) 64%);
	}

	.toolkit-copy {
		display: flex;
		flex-direction: column;
		gap: 12px;
		min-height: 320px;
		padding: 104px clamp(18px, 4.5cqi, 34px) clamp(18px, 4.5cqi, 34px);
	}

	.toolkit-copy h2 {
		margin: 0;
		font-size: clamp(2rem, 9cqi, 3.4rem);
		line-height: 0.9;
		text-shadow: 4px 4px 0 var(--jl-red);
	}

	.toolkit-copy > p {
		max-width: 50ch;
		margin: 0;
		color: var(--jl-on-dark);
		font-size: clamp(0.78rem, 2.3cqi, 0.9rem);
		line-height: 1.55;
	}

	.groups {
		display: grid;
		gap: 10px;
		margin: 6px 0 0;
	}

	.group {
		display: grid;
		gap: 6px;
	}

	.group dt {
		color: var(--jl-yellow);
		font-size: clamp(0.56rem, 1.8cqi, 0.66rem);
	}

	.group dd {
		margin: 0;
	}

	.group ul {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	/* Chips, the way a case file lists its technologies: the mark first, then
	   the name, in a rule of the accent rather than a filled block. */
	.group li {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 5px 9px;
		border: 2px solid color-mix(in oklab, var(--jl-yellow) 55%, transparent);
		font-size: clamp(0.54rem, 1.7cqi, 0.64rem);
	}

	.group svg {
		width: 13px;
		height: 13px;
		fill: var(--jl-yellow);
	}

	.monogram {
		display: grid;
		place-items: center;
		width: 13px;
		height: 13px;
		color: var(--jl-yellow);
		font-size: 0.45rem;
		font-weight: 600;
		letter-spacing: 0;
	}

	/* --------------------------------------------------------- page four ---- */

	:global(.jl-panel.calendar) {
		--jl-display-stroke: var(--jl-navy-deep);

		display: grid;
		min-height: 320px;
		color: var(--jl-white);
		background: linear-gradient(160deg, var(--jl-navy-deep) 0 62%, var(--jl-blue-deep) 62%);
	}

	.calendar-copy {
		display: flex;
		flex-direction: column;
		gap: 12px;
		min-height: 320px;
		padding: 104px clamp(18px, 4.5cqi, 34px) clamp(18px, 4.5cqi, 34px);
	}

	.calendar-copy h2 {
		margin: 0;
		font-size: clamp(2rem, 9cqi, 3.4rem);
		line-height: 0.9;
		text-shadow: 4px 4px 0 var(--jl-red);
	}

	.calendar-copy > p {
		max-width: 50ch;
		margin: 0;
		color: var(--jl-on-dark);
		font-size: clamp(0.78rem, 2.3cqi, 0.9rem);
		line-height: 1.55;
	}

	.calendar-rows {
		display: grid;
		gap: 9px;
		margin: 6px 0 0;
		padding: 0;
		list-style: none;
	}

	/* Name, then the bar on a shared axis, then the dates it spans. */
	.calendar-rows li {
		display: grid;
		gap: 3px;
	}

	.calendar-name {
		font-size: clamp(0.72rem, 2.6cqi, 0.9rem);
		letter-spacing: 0.03em;
	}

	.calendar-track {
		position: relative;
		display: block;
		height: 12px;
		background: repeating-linear-gradient(
			90deg,
			rgb(255 253 246 / 0.1) 0 1px,
			transparent 1px calc(100% / 12)
		);
		border-bottom: 1px solid rgb(255 253 246 / 0.25);
	}

	.calendar-bar {
		position: absolute;
		top: 0;
		bottom: 0;
		left: var(--row-left);
		width: var(--row-width);
		background: var(--row-accent, var(--jl-yellow));
		box-shadow: 2px 2px 0 var(--jl-ink);
	}

	.calendar-meta {
		color: var(--jl-on-dark-dim);
		font-size: clamp(0.5rem, 1.6cqi, 0.6rem);
	}

	.calendar-ticks {
		display: flex;
		justify-content: space-between;
		margin: 2px 0 0;
		color: var(--jl-on-dark-dim);
		font-size: clamp(0.5rem, 1.6cqi, 0.6rem);
	}

	.calendar-total {
		margin: 4px 0 0;
		color: var(--jl-yellow);
		font-size: clamp(0.56rem, 1.8cqi, 0.66rem);
	}

	/* ------------------------------------------------------- a short page ---- */

	/* Same rule as the case files: a page sized to a short screen tightens. */
	@container jl-page (max-height: 720px) {
		.origin-copy,
		.toolkit-copy,
		.calendar-copy,
		.contact-copy {
			padding-top: 84px;
		}

		.toolkit-copy,
		.calendar-copy {
			gap: 8px;
			padding-inline: clamp(14px, 3.5cqi, 24px);
			padding-bottom: 14px;
		}

		.toolkit-copy h2,
		.calendar-copy h2 {
			font-size: clamp(1.6rem, 7cqi, 2.6rem);
		}

		.toolkit-copy > p,
		.calendar-copy > p {
			font-size: clamp(0.7rem, 2.1cqi, 0.82rem);
			line-height: 1.45;
		}

		.groups {
			gap: 6px;
		}

		.group {
			gap: 4px;
		}

		.group ul {
			gap: 4px;
		}

		.group li {
			padding: 3px 7px;
			font-size: clamp(0.5rem, 1.6cqi, 0.58rem);
		}

		.calendar-rows {
			gap: 5px;
		}

		.calendar-track {
			height: 9px;
		}

		.years-copy {
			min-height: 180px;
			padding-top: 84px;
		}

		.contact-copy p {
			margin: 10px 0 14px;
		}

		:global(.jl-panel.years) {
			min-height: 180px;
		}

		.power {
			min-height: 96px;
			padding: 10px 12px;
		}
	}

	/* --------------------------------------------------------- page five ---- */

	:global(.jl-panel.contact) {
		min-height: 300px;
		background: linear-gradient(135deg, var(--jl-ink) 0 58%, var(--jl-blue-deep) 58%);
	}

	/* Top padding reserves the caption's corner, the same way page one does.
	   The closing page fills a whole sheet, so the copy sits in the middle of it
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
