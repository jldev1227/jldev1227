<script module lang="ts">
	import type { UIKey } from '$lib/i18n/ui';

	/**
	 * The sections of a case file, in reading order.
	 *
	 * A section id is also the hash that opens the page at it, so these names
	 * outlive the layout that prints them: every `#challenge`, `#log` or
	 * `#before-after` link ever shared still lands on its own section.
	 */
	const SECTION_LABEL = {
		challenge: 'missions.challenge',
		approach: 'missions.approach',
		architecture: 'missions.architecture',
		modules: 'missions.modules',
		'mobile-screenshots': 'missions.mobileScreenshots',
		'before-after': 'missions.beforeAfter',
		stack: 'missions.technologies',
		log: 'missions.log',
		outcome: 'missions.outcome'
	} as const satisfies Record<string, UIKey>;

	type CaseSection = keyof typeof SECTION_LABEL;
</script>

<script lang="ts">
	import { Masthead, PageFooter, Panel, ProjectShot, Seo } from '$lib/components';
	import { contentLog } from '$content/content-log';
	import { historyOf } from '$content/project-history';
	import { projects } from '$content/projects';
	import { identity } from '$content/site';
	import { techMark, techMonogram } from '$content/tech-marks';
	import { format, homePath, missionPath, path, translator } from '$i18n';
	import './case.css';
	import type { PageProps } from './$types';

	/**
	 * A case file, read as its own landing page.
	 *
	 * It was a book before: eight panels sized against a reader page, which is
	 * why the narrative never had room. Here every section sizes against the
	 * page itself, so the copy, the architecture and the log get the width the
	 * work actually needs.
	 */

	let { data }: PageProps = $props();

	const locale = $derived(data.locale);
	const project = $derived(data.project);
	const t = $derived(translator(locale));

	const canonicalPath = $derived(path(locale, 'missions', project.slug));
	const title = $derived(`${project.title} · ${identity.alias}`);

	const characterSrc = $derived(`/art/project-characters/${project.slug}.webp`);

	/** What the repositories behind this case file say about it. */
	const history = $derived(historyOf(project.slug));

	/** The toolkit behind the core — without repeating the core itself. */
	const toolkit = $derived(project.libraries.filter((name) => !project.stack.includes(name)));

	/**
	 * Only the sections this project can actually fill. A world with no
	 * before/after pairs prints no empty band, and the rail above never offers
	 * an anchor that leads nowhere.
	 */
	const sections = $derived(
		(
			[
				['challenge', Boolean(project.challenge[locale])],
				['approach', Boolean(project.approach[locale])],
				['architecture', project.architecture.length > 0],
				['modules', project.modules.length > 0],
				['mobile-screenshots', Boolean(project.screenshotGroups?.length)],
				['before-after', project.transformation.length > 0],
				['stack', project.stack.length > 0],
				['log', Boolean(history)],
				['outcome', Boolean(project.outcome[locale])]
			] as [CaseSection, boolean][]
		)
			.filter(([, filled]) => filled)
			.map(([id]) => ({ id, label: t(SECTION_LABEL[id]) }))
	);

	const shown = $derived(new Set(sections.map((section) => section.id)));

	/* ----------------------------------------------------------------- log -- */

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

	const REPO_KIND: Record<'app' | 'api' | 'native' | 'extension', UIKey> = {
		app: 'missions.repoApp',
		api: 'missions.repoApi',
		native: 'missions.repoNative',
		extension: 'missions.repoExtension'
	};

	/* ------------------------------------------------------- the next world -- */

	/** The collection reads in a circle: the last case file leads back to the first. */
	const index = $derived(projects.findIndex((entry) => entry.slug === project.slug));
	const previous = $derived(projects[(index - 1 + projects.length) % projects.length]);
	const next = $derived(projects[(index + 1) % projects.length]);
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
			keywords: project.stack.join(', '),
			// The same date the sitemap reports for this page, from Git.
			dateModified: contentLog.caseFile
		}
	]}
/>

<svelte:head>
	<link rel="preload" as="image" href={characterSrc} fetchpriority="high" />
</svelte:head>

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

<div
	class="case-shell"
	data-tone={project.palette.on}
	data-project={project.slug}
	style:--case-accent={project.palette.accent}
	style:--case-accent-fg={project.palette.onAccent === 'paper' ? '#fff' : '#25131b'}
	style:--case-base={project.palette.base}
>
	<Masthead {locale} />

	<main id="content">
		<section class="case-hero" aria-labelledby="case-title">
			<div class="case-art" aria-hidden="true">
				<div class="case-product">
					<img src={project.image.src} alt="" loading="lazy" decoding="async" />
				</div>
				<img
					class="case-character"
					src={characterSrc}
					alt=""
					width="1024"
					height="1536"
					fetchpriority="high"
				/>
			</div>

			<span class="case-number jl-display" aria-hidden="true">{project.number}</span>

			<div class="case-headline">
				<p class="case-collection jl-kicker">{project.kicker[locale]}</p>
				<h1 id="case-title" class="jl-display">{project.title}</h1>
				<p class="case-lead">{project.tagline[locale]}</p>

				<ul class="case-core" aria-label={t('missions.technologies')}>
					{#each project.stack.slice(0, 6) as technology (technology)}
						<li class="jl-kicker">{technology}</li>
					{/each}
				</ul>

				<div class="case-actions">
					{#if project.link}
						<a class="action action-primary jl-kicker" href={project.link} rel="noopener">
							{t(project.publicSource ? 'missions.viewSource' : 'missions.source')}
							<span aria-hidden="true">↗</span>
						</a>
					{/if}
					{#each project.links ?? [] as destination (destination.href)}
						<a
							class="action action-primary jl-kicker"
							href={destination.href}
							target="_blank"
							rel="noopener noreferrer"
						>
							{destination.label[locale]} <span aria-hidden="true">↗</span>
						</a>
					{/each}
					<a class="action action-secondary jl-kicker" href={`${homePath(locale)}#missions`}>
						{t('nav.missions')}
					</a>
				</div>
			</div>
		</section>

		<!-- The file's own table of contents. Ordinary anchors: they work in the
		     document the server sent, and each one is the hash that has always
		     named that section. -->
		<nav class="case-rail" aria-label={t('missions.onThisPage')}>
			<ul>
				{#each sections as section (section.id)}
					<li><a class="jl-kicker" href="#{section.id}">{section.label}</a></li>
				{/each}
			</ul>
		</nav>

		{#if shown.has('challenge')}
			<section id="challenge" class="case-section" aria-labelledby="challenge-title">
				<div class="jl-grid split">
					<Panel class="case-block" data-accent data-shade="corner">
						<div class="block-copy">
							<h2 id="challenge-title" class="jl-display">{t('missions.challenge')}</h2>
							<p class="lede">{project.challenge[locale]}</p>
						</div>
					</Panel>

					<Panel class="case-visual">
						<ProjectShot
							src={project.image.src}
							alt={project.image.alt[locale]}
							caption={project.image.caption[locale]}
						/>
					</Panel>
				</div>
			</section>
		{/if}

		{#if project.screenshotGroups?.length}
			<section
				id="mobile-screenshots"
				class="case-section mobile-screenshots"
				aria-labelledby="mobile-screenshots-title"
			>
				<div class="screenshots-heading">
					<p class="jl-kicker">{project.kicker[locale]}</p>
					<h2 id="mobile-screenshots-title" class="jl-display">
						{t('missions.mobileScreenshots')}
					</h2>
				</div>
				{#each project.screenshotGroups as group (group.title.en)}
					<div class="screenshot-group">
						<h3 class="jl-display">{group.title[locale]}</h3>
						<div class="screenshot-grid">
							{#each group.images as shot (shot.src)}
								<figure>
									<img
										src={shot.src}
										alt={shot.alt[locale]}
										width="480"
										height="853"
										loading="lazy"
									/>
								</figure>
							{/each}
						</div>
					</div>
				{/each}
			</section>
		{/if}

		{#if shown.has('approach')}
			<section id="approach" class="case-section" aria-labelledby="approach-title">
				<div class="jl-grid split wide-first">
					<Panel class="case-block" data-shade="head">
						<div class="block-copy">
							<h2 id="approach-title" class="jl-display">{t('missions.approach')}</h2>
							<p class="lede">{project.approach[locale]}</p>
						</div>
					</Panel>

					{#if project.decisions.length > 0}
						<Panel class="case-block decisions">
							<div class="block-copy">
								<h3 class="jl-display">{t('missions.decisions')}</h3>
								<ol>
									{#each project.decisions as decision (decision.en)}
										<li>{decision[locale]}</li>
									{/each}
								</ol>
							</div>
						</Panel>
					{/if}
				</div>
			</section>
		{/if}

		{#if shown.has('architecture')}
			<section id="architecture" class="case-section" aria-labelledby="architecture-title">
				<header class="section-head">
					<h2 id="architecture-title" class="jl-display">{t('missions.architecture')}</h2>
					<p class="section-note">{t('missions.architectureNote')}</p>
				</header>

				<!-- Layer by layer, left to right: the width the single column in the
				     book never had. -->
				<ol class="architecture-flow">
					{#each project.architecture as node, position (node.technology)}
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
								<span class="jl-kicker node-number">{String(position + 1).padStart(2, '0')}</span>
								<span class="jl-kicker node-layer">{node.layer[locale]}</span>
								<strong>{node.technology}</strong>
								<p>{node.detail[locale]}</p>
							</span>
						</li>
					{/each}
				</ol>
			</section>
		{/if}

		{#if shown.has('modules')}
			<section id="modules" class="case-section" aria-labelledby="modules-title">
				<header class="section-head">
					<h2 id="modules-title" class="jl-display">{t('missions.modules')}</h2>
					<p class="section-note">{t('missions.modulesNote')}</p>
				</header>

				<ul class="module-list">
					{#each project.modules as item, position (item.name.en)}
						<li>
							<span class="jl-kicker">{String(position + 1).padStart(2, '0')}</span>
							<strong>{item.name[locale]}</strong>
							<p>{item.detail[locale]}</p>
						</li>
					{/each}
				</ul>
			</section>
		{/if}

		{#if shown.has('before-after')}
			<section id="before-after" class="case-section" aria-labelledby="before-after-title">
				<header class="section-head">
					<h2 id="before-after-title" class="jl-display">{t('missions.beforeAfter')}</h2>
				</header>

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
			</section>
		{/if}

		{#if shown.has('stack')}
			<section id="stack" class="case-section" aria-labelledby="stack-title">
				<header class="section-head">
					<h2 id="stack-title" class="jl-display">{t('missions.technologies')}</h2>
				</header>

				<ul class="technology-list core">
					{#each project.stack as technology (technology)}
						{@render chip(technology)}
					{/each}
				</ul>

				{#if toolkit.length > 0}
					<h3 class="jl-kicker toolkit-title">{t('missions.libraries')}</h3>
					<ul class="technology-list">
						{#each toolkit as technology (technology)}
							{@render chip(technology)}
						{/each}
					</ul>
				{/if}

				<p class="marks-note jl-kicker">{t('missions.marksNote')}</p>
			</section>
		{/if}

		{#if shown.has('log') && history}
			<!-- The project log: not a claim about the work, a reading of it. Every
			     number here was counted in the repositories by
			     `scripts/project-history.mjs`. -->
			<section id="log" class="case-section log-band" aria-labelledby="log-title">
				<header class="section-head">
					<h2 id="log-title" class="jl-display">{t('missions.log')}</h2>
					<p class="section-note">
						{format(t('missions.logSpan'), {
							from: month(history.since),
							to: month(history.until)
						})}
						· {format(t('missions.activeMonths'), { count: history.activeMonths })}
					</p>
				</header>

				<div class="figures">
					<div class="figure">
						<strong class="jl-display">{history.commits}</strong>
						<span class="jl-kicker">{t('missions.commits')}</span>
					</div>
					<div class="figure">
						<strong class="jl-display">{history.repos.length}</strong>
						<span class="jl-kicker">
							{t(history.repos.length === 1 ? 'missions.repository' : 'missions.repositories')}
						</span>
					</div>
					<div class="figure">
						<strong class="jl-display">{history.activeMonths}</strong>
						<span class="jl-kicker">
							{t('missions.activeMonths').replace('{count}', '').trim()}
						</span>
					</div>
				</div>

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
						{#each history.months as entry, position (entry.month)}
							{@const height = Math.max(entry.commits > 0 ? 2 : 0.6, (entry.commits / peak) * 38)}
							<rect
								x={position * 10 + 1}
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

				<div class="log-detail">
					<ul class="repos">
						{#each history.repos as repo (repo.name)}
							<li class="jl-kicker">
								<strong>{repo.name}</strong>
								<span>{t(REPO_KIND[repo.kind])} · {repo.commits} {t('missions.commits')}</span>
								<span>{month(repo.since)} → {month(repo.until)}</span>
							</li>
						{/each}
					</ul>

					<div class="counts-block">
						<p class="counts-title jl-kicker">{t('missions.counts')}</p>
						<ul class="counts">
							{#each counts as [value, key] (key)}
								<li>
									<strong class="jl-display">{value}</strong>
									<span class="jl-kicker">{t(key)}</span>
								</li>
							{/each}
						</ul>
					</div>
				</div>

				<p class="log-note jl-kicker">
					{format(t('missions.logNote'), { date: day(history.measuredAt) })}
				</p>
			</section>
		{/if}

		{#if shown.has('outcome')}
			<section id="outcome" class="case-section outcome-band" aria-labelledby="outcome-title">
				<div class="outcome-copy">
					<h2 id="outcome-title" class="jl-display">{t('missions.outcome')}</h2>
					<p class="lede">{project.outcome[locale]}</p>
					<p class="confidential jl-kicker">
						{t(project.publicSource ? 'missions.publicCodebase' : 'missions.confidential')}
					</p>

					<div class="case-actions">
						{#if project.link}
							<a class="action action-primary jl-kicker" href={project.link} rel="noopener">
								{t(project.publicSource ? 'missions.viewSource' : 'missions.source')}
								<span aria-hidden="true">↗</span>
							</a>
						{/if}
						{#each project.links ?? [] as destination (destination.href)}
							<a
								class="action action-primary jl-kicker"
								href={destination.href}
								target="_blank"
								rel="noopener noreferrer"
							>
								{destination.label[locale]} <span aria-hidden="true">↗</span>
							</a>
						{/each}
						<a class="action action-secondary jl-kicker" href={`mailto:${identity.email}`}>
							{t('contact.email')} <span aria-hidden="true">↗</span>
						</a>
					</div>
				</div>
			</section>
		{/if}

		<!-- The collection continues: a case file always offers the next world. -->
		<nav class="case-more" aria-label={t('missions.collection')}>
			<a class="more-link" href={missionPath(locale, previous.slug)}>
				<span class="jl-kicker">← {t('missions.previousCase')}</span>
				<strong class="jl-display">{previous.title}</strong>
			</a>
			<a class="more-link home" href={homePath(locale)}>
				<span class="jl-kicker">{t('missions.backHome')}</span>
			</a>
			<a class="more-link next" href={missionPath(locale, next.slug)}>
				<span class="jl-kicker">{t('missions.nextCase')} →</span>
				<strong class="jl-display">{next.title}</strong>
			</a>
		</nav>
	</main>

	<PageFooter {locale} />
</div>
