<script module lang="ts">
	import type { UIKey } from '$lib/i18n/ui';

	/**
	 * The eight pages of a case file, in reading order. On the canonical route a
	 * page's id is its section; inside the archive the id carries the issue as
	 * well, so one snippet can print any case file.
	 */
	export const CASE_SECTIONS = [
		'challenge',
		'log',
		'stack',
		'approach',
		'architecture',
		'modules',
		'before-after',
		'outcome'
	] as const;

	export type CaseSection = (typeof CASE_SECTIONS)[number];

	const LABEL: Record<CaseSection, UIKey> = {
		challenge: 'missions.challenge',
		log: 'missions.log',
		stack: 'missions.stack',
		approach: 'missions.approach',
		architecture: 'missions.architecture',
		modules: 'missions.modules',
		'before-after': 'missions.beforeAfter',
		outcome: 'missions.outcome'
	};

	export function isCaseSection(value: string): value is CaseSection {
		return (CASE_SECTIONS as readonly string[]).includes(value);
	}

	/** The localized accessible name of a section, for the reader's page list. */
	export function caseSectionLabel(t: (key: UIKey) => string, section: CaseSection): string {
		return t(LABEL[section]);
	}
</script>

<script lang="ts">
	import { page as appPage } from '$app/state';
	import { Caption, Panel, ProjectShot } from '$lib/components';
	import type { Project } from '$content/projects';
	import { historyOf } from '$content/project-history';
	import { identity } from '$content/site';
	import { techMark, techMonogram } from '$content/tech-marks';
	import {
		format,
		homePath,
		LOCALE_LABEL,
		missionPath,
		missionsPath,
		other,
		swapLocale,
		translator,
		type Locale
	} from '$i18n';

	/**
	 * One page of a case file. The canonical mission route and the `/missions`
	 * archive print the same eight pages from the same copy; this is the
	 * one place they are laid out, so the two can never drift apart.
	 *
	 * Every panel here lives inside a reader page — half a spread on a wide
	 * screen, a whole page on a narrow one — so it sizes against that page
	 * container (`cqi`), never the viewport.
	 */

	interface Props {
		locale: Locale;
		project: Project;
		section: CaseSection;
		/**
		 * Where the page is being read. On the canonical route the closing page
		 * carries the site's own navigation and the indicia; inside the archive
		 * the issue is already open in the archive, so it offers the canonical
		 * route instead.
		 */
		context?: 'route' | 'archive';
	}

	let { locale, project, section, context = 'route' }: Props = $props();

	const t = $derived(translator(locale));
	const otherLocale = $derived(other(locale));
	const switchHref = $derived(swapLocale(appPage.url.pathname, otherLocale));
	const year = new Date().getFullYear();

	/* Every page of a case file is printed in that world's own colours. */
	const world = $derived(
		`--jl-world-base:${project.palette.base}; --jl-world-accent:${project.palette.accent};` +
			` --jl-world-on:${project.palette.on === 'ink' ? 'var(--jl-ink)' : 'var(--jl-white)'};` +
			` --jl-world-on-accent:${project.palette.onAccent === 'ink' ? 'var(--jl-ink)' : 'var(--jl-white)'}`
	);

	/* ----------------------------------------------------------------- log -- */

	/** What the repositories behind this case file say about it. */
	const history = $derived(historyOf(project.slug));

	const monthName = $derived(new Intl.DateTimeFormat(locale, { month: 'short', year: 'numeric' }));
	const dayName = $derived(
		new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric' })
	);

	/** `2025-11` → `Nov 2025`, in the reader's language. */
	function month(id: string): string {
		const [y, m] = id.split('-').map(Number);
		return monthName.format(new Date(y, m - 1, 1));
	}

	function day(id: string): string {
		const [y, m, d] = id.split('-').map(Number);
		return dayName.format(new Date(y, m - 1, d));
	}

	const busiest = $derived(
		history?.months.reduce((top, entry) => (entry.commits > top.commits ? entry : top))
	);
	const peak = $derived(Math.max(1, busiest?.commits ?? 1));

	/** The tree, counted — only what this project actually has. */
	const counts = $derived.by(() => {
		if (!history) return [];
		const c = history.counts;
		return (
			[
				[c.pages, 'missions.pages'],
				[c.controllers, 'missions.controllers'],
				[c.models, 'missions.models'],
				[c.migrations, 'missions.migrations'],
				[c.tests, 'missions.tests'],
				[c.native, 'missions.native'],
				[history.files, 'missions.files']
			] as [number, UIKey][]
		).filter(([value]) => value > 0);
	});

	/** The toolkit behind the core — without repeating the core itself. */
	const toolkit = $derived(project.libraries.filter((name) => !project.stack.includes(name)));

	const REPO_KIND: Record<'app' | 'api' | 'native', UIKey> = {
		app: 'missions.repoApp',
		api: 'missions.repoApi',
		native: 'missions.repoNative'
	};
</script>

<!-- A technology with its mark: the brand's own where it has one, a monogram
     for the wordmarks that do not. -->
{#snippet chip(technology: string)}
	{@const mark = techMark(technology)}
	<li class="jl-kicker">
		{#if mark}
			<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
				<path d={mark.path} />
			</svg>
		{:else}
			<span class="monogram" aria-hidden="true">{techMonogram(technology)}</span>
		{/if}
		{technology}
	</li>
{/snippet}

{#if section === 'challenge'}
	<!-- ----------------------------------------------------------- page 1 ---- -->
	<div class="jl-grid case-page challenge-page" style={world}>
		<Panel class="case-visual">
			<ProjectShot src={project.image.src} alt={project.image.alt[locale]} compact />
		</Panel>

		<Panel class="block" data-accent={project.accent} data-shade="corner">
			<Caption>{project.kicker[locale]}</Caption>
			<div class="block-copy challenge-copy">
				<h2 class="jl-display">{t('missions.challenge')}</h2>
				<p>{project.challenge[locale]}</p>
			</div>
		</Panel>
	</div>
{:else if section === 'log'}
	<!-- ----------------------------------------------------------- page 2 ---- -->
	<!-- The project log: not a claim about the work, a reading of it. Every
	     number here was counted in the repositories by `scripts/project-history.mjs`. -->
	{#if history}
		<div class="jl-grid case-page log-page" style={world}>
			<Panel class="log-title" data-accent={project.accent} data-shade="head">
				<Caption>{format(t('missions.logNote'), { date: day(history.measuredAt) })}</Caption>
				<div class="log-heading">
					<h2 class="jl-display">{t('missions.log')}</h2>
					<p class="span jl-kicker">
						{format(t('missions.logSpan'), {
							from: month(history.since),
							to: month(history.until)
						})}
						· {format(t('missions.activeMonths'), { count: history.activeMonths })}
					</p>
				</div>
			</Panel>

			<Panel class="log-figures">
				<div class="figures">
					<div class="figure">
						<strong class="jl-display">{history.commits}</strong>
						<span class="jl-kicker">{t('missions.commits')}</span>
					</div>
					<div class="figure">
						<strong class="jl-display">{history.repos.length}</strong>
						<span class="jl-kicker"
							>{t(
								history.repos.length === 1 ? 'missions.repository' : 'missions.repositories'
							)}</span
						>
					</div>
					<div class="figure">
						<strong class="jl-display">{history.activeMonths}</strong>
						<span class="jl-kicker">{t('missions.activeMonths').replace('{count}', '').trim()}</span
						>
					</div>
				</div>
			</Panel>

			<Panel class="log-chart">
				<!-- Commits per month, first to last. The busiest bar is the accent;
				     quiet months are kept as gaps, because a pause is part of the story. -->
				<figure class="pulse">
					<svg
						class="sparkline"
						viewBox="0 0 {history.months.length * 10} 40"
						preserveAspectRatio="none"
						role="img"
						aria-label="{t('missions.monthly')}: {history.months
							.map((entry) => `${month(entry.month)} ${entry.commits}`)
							.join(', ')}"
					>
						{#each history.months as entry, index (entry.month)}
							{@const height = Math.max(entry.commits > 0 ? 2 : 0.6, (entry.commits / peak) * 38)}
							<rect
								x={index * 10 + 1}
								y={40 - height}
								width="8"
								{height}
								data-peak={entry.month === busiest?.month ? '' : undefined}
							/>
						{/each}
					</svg>
					<figcaption class="jl-kicker">
						<span>{month(history.since)}</span>
						<span>
							{t('missions.busiest')}:
							{format(t('missions.busiestValue'), {
								month: busiest ? month(busiest.month) : '',
								count: busiest?.commits ?? 0
							})}
						</span>
						<span>{month(history.until)}</span>
					</figcaption>
				</figure>
			</Panel>

			<Panel class="log-detail">
				<ul class="repos">
					{#each history.repos as repo (repo.name)}
						<li class="jl-kicker">
							<strong>{repo.name}</strong>
							<span>{t(REPO_KIND[repo.kind])} · {repo.commits} {t('missions.commits')}</span>
							<span>{month(repo.since)} → {month(repo.until)}</span>
						</li>
					{/each}
				</ul>

				<p class="counts-title jl-kicker">{t('missions.counts')}</p>
				<ul class="counts">
					{#each counts as [value, key] (key)}
						<li>
							<strong class="jl-display">{value}</strong> <span class="jl-kicker">{t(key)}</span>
						</li>
					{/each}
				</ul>
			</Panel>
		</div>
	{/if}
{:else if section === 'stack'}
	<!-- ----------------------------------------------------------- page 3 ---- -->
	<div class="jl-grid case-page stack-page" style={world}>
		<Panel class="technologies" data-accent={project.accent} data-shade="head">
			<div class="block-copy">
				<h2 class="jl-display">{t('missions.technologies')}</h2>
				<ul class="technology-list core">
					{#each project.stack as technology (technology)}
						{@render chip(technology)}
					{/each}
				</ul>

				<h3 class="jl-kicker">{t('missions.libraries')}</h3>
				<ul class="technology-list">
					{#each toolkit as technology (technology)}
						{@render chip(technology)}
					{/each}
				</ul>
			</div>
		</Panel>

		<Panel class="marks-note">
			<p class="jl-kicker">{t('missions.marksNote')}</p>
		</Panel>
	</div>
{:else if section === 'approach'}
	<!-- ----------------------------------------------------------- page 4 ---- -->
	<div class="jl-grid case-page approach-page" style={world}>
		<Panel class="approach-title" data-accent={project.accent} data-shade="head">
			<Caption>{project.kicker[locale]}</Caption>
			<div class="chapter-heading">
				<h2 class="jl-display">{t('missions.approach')}</h2>
			</div>
		</Panel>

		<Panel class="block approach-story">
			<div class="block-copy">
				<p>{project.approach[locale]}</p>
			</div>
		</Panel>

		<Panel class="decisions approach-decisions">
			<div class="block-copy">
				<h3 class="jl-display">{t('missions.decisions')}</h3>
				<ol>
					{#each project.decisions as decision (decision.en)}
						<li>{decision[locale]}</li>
					{/each}
				</ol>
			</div>
		</Panel>
	</div>
{:else if section === 'architecture'}
	<!-- ----------------------------------------------------------- page 5 ---- -->
	<div class="jl-grid case-page architecture-page" style={world}>
		<Panel class="architecture">
			<div class="block-copy">
				<h2 class="jl-display">{t('missions.architecture')}</h2>
				<p class="architecture-note">{t('missions.architectureNote')}</p>

				<ol class="architecture-flow">
					{#each project.architecture as node, index (node.technology)}
						<li>
							<span class="marks" aria-hidden="true">
								{#each node.technology.split('·').map((name) => name.trim()) as tech (tech)}
									{@const mark = techMark(tech)}
									{#if mark}
										<svg viewBox="0 0 24 24" focusable="false"><path d={mark.path} /></svg>
									{:else}
										<span class="monogram">{techMonogram(tech)}</span>
									{/if}
								{/each}
							</span>

							<span class="node-copy">
								<span class="jl-kicker node-number">{String(index + 1).padStart(2, '0')}</span>
								<span class="jl-kicker node-layer">{node.layer[locale]}</span>
								<strong>{node.technology}</strong>
								<p>{node.detail[locale]}</p>
							</span>
						</li>
					{/each}
				</ol>
			</div>
		</Panel>
	</div>
{:else if section === 'modules'}
	<!-- ----------------------------------------------------------- page 6 ---- -->
	<div class="jl-grid case-page modules-page" style={world}>
		<Panel class="modules" data-accent={project.accent} data-shade="corner">
			<Caption>{t('missions.modulesNote')}</Caption>
			<div class="block-copy modules-copy">
				<h2 class="jl-display">{t('missions.modules')}</h2>
				<ul class="module-list">
					{#each project.modules as item, index (item.name.en)}
						<li>
							<span class="jl-kicker">{String(index + 1).padStart(2, '0')}</span>
							<strong>{item.name[locale]}</strong>
							<p>{item.detail[locale]}</p>
						</li>
					{/each}
				</ul>
			</div>
		</Panel>
	</div>
{:else if section === 'before-after'}
	<!-- ----------------------------------------------------------- page 7 ---- -->
	<div class="jl-grid case-page transformation-page" style={world}>
		<Panel class="transformation" data-accent={project.accent}>
			<div class="block-copy">
				<h2 class="jl-display">{t('missions.beforeAfter')}</h2>
				<ul class="transformation-list">
					{#each project.transformation as item (item.before.en)}
						<li>
							<div class="before">
								<span class="jl-kicker">{t('missions.before')}</span>
								<p>{item.before[locale]}</p>
							</div>
							<span class="change-arrow" aria-hidden="true">→</span>
							<div class="after">
								<span class="jl-kicker">{t('missions.after')}</span>
								<p>{item.after[locale]}</p>
							</div>
						</li>
					{/each}
				</ul>
			</div>
		</Panel>
	</div>
{:else}
	<!-- ----------------------------------------------------------- page 8 ---- -->
	<div class="jl-grid case-page outcome-page" style={world}>
		<Panel class="outro" data-accent={project.accent} data-shade="corner">
			<Caption>{t('missions.confidential')}</Caption>
			<div class="outro-copy">
				<h2 class="jl-display">{t('missions.outcome')}</h2>
				<p>{project.outcome[locale]}</p>

				<ul class="actions">
					{#if context === 'archive'}
						<!-- The issue is open in the archive already; what it can offer
						     is its own document. -->
						<li><a href={missionPath(locale, project.slug)}>{t('missions.readFile')}</a></li>
					{:else}
						<li><a href={homePath(locale)}>{t('missions.backHome')}</a></li>
						<li><a href={missionsPath(locale)}>{t('missions.all')}</a></li>
					{/if}
					{#if project.link}
						<!--
							Named after where it actually goes. It used to be labelled with the
							project's own title, which promised the project and delivered a
							GitHub profile.
						-->
						<li><a href={project.link} rel="noopener">{t('missions.source')} ↗</a></li>
					{/if}
				</ul>

				{#if context === 'route'}
					<p class="colophon jl-kicker">
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
				{/if}
			</div>
		</Panel>
	</div>
{/if}

<style>
	/* ------------------------------------------------------------- panels ---- */

	:global(.jl-panel.case-visual) {
		--jl-shot-mat: var(--jl-world-base);

		display: grid;
		padding: clamp(12px, 3.5cqi, 26px);
		background: var(--jl-world-base);
	}

	:global(.jl-panel.case-visual figure) {
		height: 100%;
	}

	/* Every panel of a case file is printed in that world's own colours. */
	:global(.jl-panel.block),
	:global(.jl-panel.log),
	:global(.jl-panel.architecture),
	:global(.jl-panel.modules),
	:global(.jl-panel.transformation),
	:global(.jl-panel.decisions),
	:global(.jl-panel.outro),
	:global(.jl-panel.technologies),
	:global(.jl-panel.marks-note) {
		/* Display type is outlined in its own ground, so a cream world keeps its
		   accents as legible as a near-black one. */
		--jl-display-stroke: var(--jl-world-base);

		color: var(--jl-world-on);
		background: var(--jl-world-base);
	}

	/*
	 * The panels that carry the accent take it on the comic's diagonal, as a
	 * tint of the world's ground. These panels are the ones that hold running
	 * text, so the far side of the diagonal has to stay a reading ground: at
	 * 58% the case-file copy crossed onto it at 4.4:1, and the before/after
	 * rows, which lay their own accent wash on top, at 3.0:1.
	 */
	:global(.jl-panel[data-accent]) {
		background: linear-gradient(
			150deg,
			var(--jl-world-base) 0 58%,
			color-mix(in oklab, var(--jl-world-accent) 32%, var(--jl-world-base)) 58%
		);
	}

	/* Copy flows, and the top padding reserves the caption's corner: the panel
	   clips, and Spanish runs a line longer than English. */
	.block-copy,
	.outro-copy {
		display: flex;
		flex-direction: column;
		height: 100%;
		padding: clamp(20px, 5cqi, 36px);
	}

	.block-copy h2,
	.outro-copy h2 {
		margin: 0 0 14px;
		font-size: clamp(1.6rem, 8cqi, 2.8rem);
		line-height: 0.9;
	}

	.block-copy p,
	.outro-copy p {
		max-width: 56ch;
		margin: 0;
		color: color-mix(in oklab, var(--jl-world-on) 92%, transparent);
		font-size: clamp(0.8rem, 2.4cqi, 0.92rem);
		line-height: 1.6;
	}

	/* A panel that carries a caption needs the corner kept clear. */
	:global(.jl-panel.block) .block-copy,
	.outro-copy,
	.modules-copy {
		padding-top: 104px;
	}

	/* ---------------------------------------------------------------- log ---- */

	.span {
		margin: 0;
		color: color-mix(in oklab, var(--jl-world-on) 80%, transparent);
		font-size: clamp(0.56rem, 1.8cqi, 0.68rem);
	}

	/* Three figures, the way the cover prints its price and its number. */
	.figures {
		display: flex;
		flex-wrap: wrap;
		gap: 6px clamp(14px, 5cqi, 34px);
		margin-top: 4px;
	}

	.figure strong {
		display: block;
		font-size: clamp(1.9rem, 11cqi, 3.6rem);
		line-height: 0.85;
		text-shadow: 4px 4px 0 color-mix(in oklab, var(--jl-world-accent) 60%, var(--jl-world-base));
	}

	.figure span {
		display: block;
		margin-top: 4px;
		font-size: clamp(0.52rem, 1.7cqi, 0.62rem);
	}

	.pulse {
		margin: 8px 0 0;
	}

	/* Stretched to the panel's width: the bars are proportion, not pixels. */
	.sparkline {
		display: block;
		width: 100%;
		height: clamp(44px, 12cqi, 72px);
		border-bottom: 2px solid color-mix(in oklab, var(--jl-world-on) 30%, transparent);
	}

	.sparkline rect {
		fill: color-mix(in oklab, var(--jl-world-on) 62%, transparent);
	}

	.sparkline rect[data-peak] {
		fill: var(--jl-world-accent);
	}

	.pulse figcaption {
		display: flex;
		justify-content: space-between;
		gap: 8px;
		margin-top: 5px;
		color: color-mix(in oklab, var(--jl-world-on) 78%, transparent);
		font-size: clamp(0.5rem, 1.6cqi, 0.6rem);
	}

	.pulse figcaption span:nth-child(2) {
		text-align: center;
	}

	.repos {
		display: grid;
		gap: 5px;
		margin: 6px 0 0;
		padding: 0;
		list-style: none;
	}

	.repos li {
		display: grid;
		grid-template-columns: auto 1fr auto;
		gap: 10px;
		padding: 5px 9px;
		background: color-mix(in oklab, var(--jl-world-accent) 12%, transparent);
		border-left: 3px solid color-mix(in oklab, var(--jl-world-accent) 70%, var(--jl-world-on));
		font-size: clamp(0.5rem, 1.6cqi, 0.6rem);
	}

	.repos strong {
		color: var(--jl-world-on);
	}

	.repos span {
		color: color-mix(in oklab, var(--jl-world-on) 80%, transparent);
	}

	.counts-title {
		margin: 8px 0 0;
		color: color-mix(in oklab, var(--jl-world-on) 78%, transparent);
		font-size: clamp(0.5rem, 1.6cqi, 0.6rem);
	}

	.counts {
		display: flex;
		flex-wrap: wrap;
		gap: 6px 14px;
		margin: 2px 0 0;
		padding: 0;
		list-style: none;
	}

	.counts li {
		display: flex;
		align-items: baseline;
		gap: 5px;
	}

	.counts strong {
		font-size: clamp(0.95rem, 4cqi, 1.3rem);
	}

	.counts span {
		font-size: clamp(0.5rem, 1.6cqi, 0.6rem);
	}

	/* ------------------------------------------------------- technologies ---- */

	:global(.jl-panel.technologies) .block-copy {
		gap: 12px;
	}

	:global(.jl-panel.technologies) h3 {
		margin: 6px 0 0;
		color: color-mix(in oklab, var(--jl-world-on) 78%, transparent);
		font-size: clamp(0.56rem, 1.8cqi, 0.66rem);
	}

	.technology-list svg {
		width: 15px;
		height: 15px;
		fill: var(--jl-world-accent);
	}

	.technology-list {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.technology-list li {
		display: flex;
		align-items: center;
		gap: 7px;
		padding: 7px 11px;
		color: var(--jl-world-on);
		border: 2px solid color-mix(in oklab, var(--jl-world-accent) 55%, transparent);
		font-size: clamp(0.56rem, 1.8cqi, 0.66rem);
	}

	/* The core stack stands out from the toolkit behind it. */
	.technology-list.core li {
		color: var(--jl-world-on-accent);
		background: var(--jl-world-accent);
		border-color: var(--jl-world-accent);
		font-weight: 600;
	}

	.technology-list.core svg {
		fill: var(--jl-world-on-accent);
	}

	.technology-list .monogram {
		width: 15px;
		font-size: 0.5rem;
	}

	.technology-list.core .monogram {
		color: var(--jl-world-on-accent);
		border-color: color-mix(in oklab, var(--jl-world-on-accent) 60%, transparent);
	}

	:global(.jl-panel.marks-note) {
		padding: 10px clamp(14px, 4cqi, 24px);
	}

	:global(.jl-panel.marks-note) p {
		margin: 0;
		color: color-mix(in oklab, var(--jl-world-on) 74%, transparent);
		font-size: clamp(0.5rem, 1.6cqi, 0.6rem);
	}

	/* ------------------------------------------------------- architecture ---- */

	.architecture-note {
		margin-bottom: 18px !important;
		color: color-mix(in oklab, var(--jl-world-on) 68%, transparent);
		font-size: clamp(0.72rem, 2.1cqi, 0.82rem) !important;
	}

	.architecture-flow {
		display: grid;
		gap: 10px;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	/* The tools first, then what they are doing there. */
	.architecture-flow li {
		display: grid;
		grid-template-columns: auto 1fr;
		align-items: start;
		gap: clamp(10px, 3cqi, 18px);
		padding: 12px 14px;
		background: color-mix(in oklab, var(--jl-world-accent) 12%, transparent);
		border-left: 4px solid var(--jl-world-accent);
	}

	.marks {
		display: flex;
		flex-wrap: wrap;
		gap: 7px;
		max-width: clamp(64px, 20cqi, 104px);
	}

	.marks svg {
		width: clamp(20px, 5.5cqi, 30px);
		height: auto;
		fill: var(--jl-world-accent);
	}

	.monogram {
		display: grid;
		place-items: center;
		width: clamp(20px, 5.5cqi, 30px);
		aspect-ratio: 1;
		color: var(--jl-world-on);
		border: 2px solid color-mix(in oklab, var(--jl-world-accent) 55%, transparent);
		font-family: var(--jl-font-mono);
		font-size: clamp(0.5rem, 1.6cqi, 0.62rem);
		font-weight: 600;
	}

	.node-copy {
		display: block;
		min-width: 0;
	}

	.node-number {
		color: var(--jl-world-on);
		font-size: 0.6rem;
		font-weight: 600;
	}

	.node-layer {
		display: block;
		margin-top: 2px;
		color: color-mix(in oklab, var(--jl-world-on) 78%, transparent);
		font-size: 0.58rem;
	}

	.architecture-flow strong {
		display: block;
		margin-top: 4px;
		font-size: clamp(0.82rem, 2.4cqi, 0.95rem);
	}

	.architecture-flow p {
		margin: 4px 0 0 !important;
		color: color-mix(in oklab, var(--jl-world-on) 86%, transparent);
		font-size: clamp(0.68rem, 2cqi, 0.78rem) !important;
		line-height: 1.45;
	}

	/* ------------------------------------------------------------ modules ---- */

	.module-list {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 8px;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.module-list li {
		display: grid;
		gap: 3px;
		padding: 9px 11px;
		background: color-mix(in oklab, var(--jl-world-accent) 12%, transparent);
	}

	.module-list .jl-kicker {
		color: color-mix(in oklab, var(--jl-world-accent) 70%, var(--jl-world-on));
		font-size: 0.55rem;
		font-weight: 600;
	}

	.module-list strong {
		font-size: clamp(0.72rem, 2.2cqi, 0.85rem);
		line-height: 1.2;
	}

	.module-list p {
		margin: 0 !important;
		color: color-mix(in oklab, var(--jl-world-on) 82%, transparent);
		font-size: clamp(0.62rem, 1.9cqi, 0.72rem) !important;
		line-height: 1.4;
	}

	@container jl-page (max-width: 330px) {
		.module-list {
			grid-template-columns: 1fr;
		}
	}

	/* ----------------------------------------------------- transformation ---- */

	.transformation-list {
		display: grid;
		gap: 12px;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.transformation-list li {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		align-items: center;
		gap: 10px;
		padding: 12px 14px;
		background: color-mix(in oklab, var(--jl-world-accent) 12%, transparent);
	}

	.transformation-list span {
		display: block;
		margin-bottom: 4px;
		font-size: 0.58rem;
	}

	.before span {
		color: color-mix(in oklab, var(--jl-world-on) 82%, transparent);
	}

	/* The row is already tinted with the accent, so the accent cannot mark it. */
	.after span {
		color: var(--jl-world-on);
		font-weight: 600;
	}

	.transformation-list p {
		margin: 0 !important;
		font-size: clamp(0.68rem, 2cqi, 0.78rem) !important;
		line-height: 1.4;
	}

	.change-arrow {
		color: var(--jl-world-on);
		font-size: 1.1rem;
	}

	/* ---------------------------------------------------------- decisions ---- */

	:global(.jl-panel.decisions) ol {
		display: grid;
		gap: 9px;
		margin: 16px 0 0;
		padding-left: 18px;
		color: color-mix(in oklab, var(--jl-world-on) 84%, transparent);
		font-size: clamp(0.72rem, 2.1cqi, 0.82rem);
		line-height: 1.5;
	}

	/* -------------------------------------------------------------- outro ---- */

	.outro-copy {
		justify-content: center;
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		margin: 26px 0 0;
		padding: 0;
		list-style: none;
	}

	.actions a {
		display: inline-block;
		padding: 10px 15px;
		color: var(--jl-world-on-accent);
		background: var(--jl-world-accent);
		border: 3px solid var(--jl-ink);
		box-shadow: 4px 4px 0 var(--jl-ink);
		font-size: clamp(0.62rem, 2cqi, 0.74rem);
		font-weight: 600;
		text-decoration: none;
		text-transform: uppercase;
	}

	.actions a:hover {
		color: var(--jl-white);
		background: var(--jl-red);
	}

	/* The indicia this issue carries on its last page. */
	.colophon {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 6px 14px;
		margin: 26px 0 0 !important;
		color: color-mix(in oklab, var(--jl-world-on) 86%, transparent);
		font-size: clamp(0.54rem, 1.7cqi, 0.64rem) !important;
	}

	.colophon a {
		color: var(--jl-world-on);
		text-underline-offset: 3px;
	}

	.colophon a:hover {
		color: var(--jl-white);
	}

	/* ------------------------------------------------------- a short page ---- */

	/*
	 * The page is a size container, so a book sized to a short screen tells
	 * its pages so. Everything dense — chips, figures, the sparkline, the
	 * module cards — tightens rather than running off the paper.
	 */
	@container jl-page (max-height: 720px) {
		.block-copy,
		.outro-copy {
			padding: clamp(14px, 3.5cqi, 24px);
		}

		:global(.jl-panel.block) .block-copy,
		.outro-copy,
		.modules-copy {
			padding-top: 84px;
		}

		.block-copy h2,
		.outro-copy h2 {
			margin-bottom: 8px;
			font-size: clamp(1.3rem, 6.5cqi, 2.2rem);
		}

		.block-copy p,
		.outro-copy p {
			font-size: clamp(0.72rem, 2.2cqi, 0.84rem);
			line-height: 1.5;
		}

		.figure strong {
			font-size: clamp(1.5rem, 8cqi, 2.6rem);
		}

		.sparkline {
			height: clamp(34px, 9cqi, 52px);
		}

		.repos {
			gap: 3px;
		}

		.repos li {
			padding: 3px 7px;
		}

		.technology-list {
			gap: 5px;
		}

		.technology-list li {
			gap: 5px;
			padding: 4px 7px;
			font-size: clamp(0.5rem, 1.6cqi, 0.58rem);
		}

		.technology-list svg,
		.technology-list .monogram {
			width: 12px;
			height: 12px;
		}

		:global(.jl-panel.technologies) .block-copy {
			gap: 8px;
		}

		.architecture-flow {
			gap: 6px;
		}

		.architecture-flow li {
			padding: 8px 10px;
		}

		.architecture-note {
			margin-bottom: 10px !important;
		}

		.module-list {
			gap: 5px;
		}

		.module-list li {
			padding: 6px 8px;
		}

		.transformation-list {
			gap: 7px;
		}

		.transformation-list li {
			padding: 8px 10px;
		}

		:global(.jl-panel.decisions) ol {
			gap: 5px;
			margin-top: 10px;
		}
	}

	/* Shorter still — a 720p laptop: the architecture flow and the before/after
	   rows lose their air, not their content. */
	@container jl-page (max-height: 640px) {
		.architecture-flow {
			gap: 4px;
		}

		.architecture-flow li {
			gap: 8px;
			padding: 5px 8px;
		}

		.architecture-flow strong {
			margin-top: 2px;
			font-size: clamp(0.74rem, 2.2cqi, 0.86rem);
		}

		.architecture-flow p {
			font-size: clamp(0.6rem, 1.8cqi, 0.7rem) !important;
			line-height: 1.35;
		}

		.marks svg,
		.marks .monogram {
			width: clamp(16px, 4.5cqi, 24px);
		}

		.transformation-list {
			gap: 5px;
		}

		.transformation-list li {
			padding: 6px 8px;
		}

		.transformation-list p {
			font-size: clamp(0.6rem, 1.8cqi, 0.7rem) !important;
		}
	}

	/* ---------------------------------------------------- comic page system -- */

	/* A case-file sheet is a composition of tight ink frames. The one-pixel rule
	   keeps the page dense inside StPageFlip without turning every frame into a
	   heavy black stripe. */
	.case-page {
		--jl-border: 1px;
		flex: 1;
		gap: 4px;
		margin-top: 4px;
		grid-auto-flow: dense;
		min-height: 0;
	}

	.case-page :global(.jl-panel) {
		color: var(--jl-world-on);
		background: var(--jl-world-base);
		border-width: 1px;
		transform: none;
	}

	.challenge-page {
		grid-template-rows: minmax(0, 0.72fr) minmax(0, 1.28fr);
	}

	.challenge-page .challenge-copy {
		padding: 76px clamp(14px, 4cqi, 24px) 14px;
	}

	.log-page {
		grid-template-columns: repeat(2, minmax(0, 1fr));
		grid-template-rows: auto auto auto minmax(0, 1fr);
	}

	:global(.jl-panel.log-title) {
		grid-column: 1 / -1;
		min-height: clamp(148px, 35cqi, 178px);
	}

	.log-heading,
	.chapter-heading {
		display: flex;
		flex-direction: column;
		justify-content: end;
		height: 100%;
		padding: 104px clamp(14px, 4cqi, 24px) 12px;
	}

	.log-heading h2,
	.chapter-heading h2 {
		margin: 0;
		font-size: clamp(1.55rem, 7cqi, 2.6rem);
		line-height: 0.88;
	}

	:global(.jl-panel.log-figures),
	:global(.jl-panel.log-chart),
	:global(.jl-panel.log-detail) {
		padding: clamp(8px, 2.5cqi, 14px);
	}

	:global(.jl-panel.log-chart) {
		grid-column: 1 / -1;
	}

	:global(.jl-panel.log-figures) {
		grid-column: 1 / -1;
	}

	:global(.jl-panel.log-detail) {
		grid-column: 1 / -1;
	}

	.figures {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 3px;
	}

	.figure,
	.repos li,
	.counts li {
		padding: clamp(6px, 2cqi, 10px);
		background: color-mix(in oklab, var(--jl-world-accent) 13%, var(--jl-world-base));
		border: 1px solid color-mix(in oklab, var(--jl-world-accent) 72%, var(--jl-world-on));
	}

	.repos {
		gap: 3px;
	}

	.repos li {
		grid-template-columns: minmax(0, 1fr) auto;
		border-left-width: 1px;
	}

	.repos li span:last-child {
		grid-column: 1 / -1;
	}

	.counts {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 3px;
	}

	.counts li {
		display: grid;
		gap: 1px;
		padding: 4px 6px;
	}

	/* The stack reads as a wall of recognizable marks. The SVG paths come from
	   Simple Icons; only generic formats and concepts keep a labeled monogram. */
	.stack-page {
		grid-template-rows: minmax(0, 1fr) auto;
	}

	:global(.jl-panel.technologies) .block-copy {
		gap: 8px;
		padding: clamp(12px, 3.5cqi, 22px);
	}

	.technology-list {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 4px;
	}

	.technology-list li,
	.technology-list.core li {
		min-width: 0;
		min-height: clamp(42px, 11cqi, 62px);
		padding: 7px;
		background: color-mix(in oklab, var(--jl-world-accent) 13%, var(--jl-world-base));
		border: 1px solid color-mix(in oklab, var(--jl-world-accent) 72%, var(--jl-world-on));
		color: var(--jl-world-on);
		font-size: clamp(0.48rem, 1.55cqi, 0.6rem);
		line-height: 1.25;
	}

	.technology-list.core li {
		background: var(--jl-world-accent);
		color: var(--jl-world-on-accent);
	}

	.technology-list svg,
	.technology-list .monogram,
	.technology-list.core svg,
	.technology-list.core .monogram {
		flex: none;
		width: clamp(20px, 6cqi, 30px);
		height: clamp(20px, 6cqi, 30px);
	}

	.technology-list svg {
		fill: var(--jl-world-accent);
	}

	.technology-list.core svg {
		fill: var(--jl-world-on-accent);
	}

	.approach-page {
		grid-template-columns: minmax(0, 0.72fr) minmax(0, 1.28fr);
		grid-template-rows: minmax(132px, 0.58fr) minmax(0, 1fr);
	}

	:global(.jl-panel.approach-title) {
		grid-column: 1 / -1;
	}

	:global(.jl-panel.approach-story) .block-copy,
	:global(.jl-panel.approach-decisions) .block-copy {
		justify-content: center;
		padding: clamp(14px, 4cqi, 26px);
	}

	:global(.jl-panel.approach-decisions) h3 {
		margin: 0 0 10px;
		font-size: clamp(1.1rem, 5cqi, 1.9rem);
	}

	.architecture-flow,
	.module-list,
	.transformation-list {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 4px;
	}

	.architecture-flow li,
	.module-list li,
	.transformation-list li {
		min-width: 0;
		padding: clamp(7px, 2cqi, 11px);
		background: color-mix(in oklab, var(--jl-world-accent) 13%, var(--jl-world-base));
		border: 1px solid color-mix(in oklab, var(--jl-world-accent) 72%, var(--jl-world-on));
	}

	.architecture-flow li {
		grid-template-columns: 1fr;
		gap: 5px;
		border-left-width: 1px;
	}

	.marks {
		max-width: none;
	}

	.marks svg,
	.marks .monogram {
		width: clamp(20px, 5cqi, 28px);
	}

	:global(.jl-panel.architecture) .block-copy,
	:global(.jl-panel.modules) .block-copy,
	:global(.jl-panel.transformation) .block-copy {
		padding: clamp(12px, 3.5cqi, 22px);
	}

	.modules-copy {
		padding-top: 118px !important;
	}

	.transformation-page {
		grid-template-rows: 1fr;
	}

	.transformation-list li {
		grid-template-columns: 1fr;
		align-content: start;
		gap: 4px;
	}

	.change-arrow {
		margin: -2px 0;
		transform: rotate(90deg);
	}

	.outcome-page {
		grid-template-rows: 1fr;
	}

	.outro-copy {
		gap: 4px;
		justify-content: flex-start;
		padding: 86px clamp(14px, 4cqi, 26px) 14px;
	}

	.outro-copy > p:not(.colophon),
	.actions,
	.colophon {
		max-width: none;
		margin: 0 !important;
		padding: clamp(10px, 3cqi, 16px);
		background: color-mix(in oklab, var(--jl-world-accent) 13%, var(--jl-world-base));
		border: 1px solid color-mix(in oklab, var(--jl-world-accent) 72%, var(--jl-world-on));
	}

	.actions a {
		border-width: 1px;
		box-shadow: 3px 3px 0 var(--jl-ink);
	}

	@container jl-page (max-width: 360px) {
		.technology-list,
		.counts {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}

		.architecture-flow,
		.module-list,
		.transformation-list {
			grid-template-columns: 1fr;
		}

		.approach-page {
			grid-template-columns: 1fr;
			grid-template-rows: auto auto 1fr;
		}
	}
</style>
