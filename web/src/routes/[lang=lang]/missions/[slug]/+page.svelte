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
		'before-after': 'missions.beforeAfter',
		stack: 'missions.technologies',
		log: 'missions.log',
		outcome: 'missions.outcome'
	} as const satisfies Record<string, UIKey>;

	type CaseSection = keyof typeof SECTION_LABEL;
</script>

<script lang="ts">
	import { Caption, Masthead, PageFooter, Panel, ProjectShot, Seo } from '$lib/components';
	import { contentLog } from '$content/content-log';
	import { historyOf } from '$content/project-history';
	import { projects } from '$content/projects';
	import { identity } from '$content/site';
	import { techMark, techMonogram } from '$content/tech-marks';
	import { format, homePath, missionPath, path, translator } from '$i18n';
	import { ART_SIZES, responsiveArt } from '$lib/images';
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

	const cover = $derived(responsiveArt(project.coverArt.src));

	/** Each case file is printed in its own product's colours, not the house ones. */
	const world = $derived(
		`--jl-world-base:${project.palette.base}; --jl-world-accent:${project.palette.accent};` +
			` --jl-world-on:${project.palette.on === 'ink' ? 'var(--jl-ink)' : 'var(--jl-white)'};` +
			` --jl-world-on-accent:${project.palette.onAccent === 'ink' ? 'var(--jl-ink)' : 'var(--jl-white)'}`
	);

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

	const REPO_KIND: Record<'app' | 'api' | 'native', UIKey> = {
		app: 'missions.repoApp',
		api: 'missions.repoApi',
		native: 'missions.repoNative'
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
	<!-- The cover plate is this page's largest paint, and it opens the page: the
	     browser would otherwise only discover it once the hero lays out. -->
	<link
		rel="preload"
		as="image"
		type="image/avif"
		fetchpriority="high"
		imagesrcset={cover.avif}
		imagesizes={ART_SIZES.caseHero}
	/>
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

<div class="case-shell" style={world}>
	<Masthead {locale} />

	<main id="content">
		<!-- The cover plate opens the file at full width, with the story lines
		     over it the way the issue printed them. -->
		<section class="case-hero" aria-labelledby="case-title">
			<div class="case-art" aria-hidden="true">
				<picture>
					<source type="image/avif" srcset={cover.avif} sizes={ART_SIZES.caseHero} />
					<source type="image/webp" srcset={cover.webp} sizes={ART_SIZES.caseHero} />
					<img
						src={cover.src}
						alt=""
						width={project.coverArt.width}
						height={project.coverArt.height}
						fetchpriority="high"
					/>
				</picture>
			</div>

			<Caption class="case-blurb">{project.image.caption[locale]}</Caption>
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
							{t('missions.source')} <span aria-hidden="true">↗</span>
						</a>
					{/if}
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
					<p class="confidential jl-kicker">{t('missions.confidential')}</p>

					<div class="case-actions">
						{#if project.link}
							<a class="action action-primary jl-kicker" href={project.link} rel="noopener">
								{t('missions.source')} <span aria-hidden="true">↗</span>
							</a>
						{/if}
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

<style>
	.case-shell {
		position: relative;
		z-index: 1;
		width: 100%;
		margin: 0 auto;
		color: var(--jl-ink);
		background: var(--jl-white);
		box-shadow:
			0 0 0 1px rgb(255 255 255 / 0.12),
			0 28px 90px rgb(0 0 0 / 0.55);
	}

	/* --------------------------------------------------------------- hero --- */

	/*
	 * The cover plate is the strongest asset a case file has, and it is painted
	 * portrait. Cropping it into a full-width band showed a third of it under a
	 * scrim heavy enough to read type through — the illustration lost both its
	 * composition and its legibility. It gets its own column instead: nearly the
	 * whole plate, no wash over it, with the story lines beside it on the
	 * product's own colour.
	 */
	.case-hero {
		position: relative;
		display: grid;
		grid-template-columns: minmax(0, 1.05fr) minmax(360px, 0.95fr);
		/* One explicit row, or the plate sizes it: a 1024 × 1536 cover painted
		   across a 773px column is 1154px tall, and a content-sized row carries
		   the story lines that far down, out through the hero's own clip. */
		grid-template-rows: minmax(0, 1fr);
		height: calc(100svh - 64px);
		min-height: 620px;
		max-height: 900px;
		overflow: hidden;
		color: var(--jl-white);
		background:
			linear-gradient(
				112deg,
				transparent 0 47%,
				color-mix(in oklab, var(--jl-world-accent) 30%, transparent) 47.2% 48%,
				transparent 48.2%
			),
			/* The wedge is tinted with the world's accent rather than its ground:
			   two of the six worlds are painted on cream, and mixing that into the
			   ink left a pale stain under paper-white cover lines. */
			linear-gradient(
					137deg,
					var(--jl-ink) 0 56%,
					color-mix(in oklab, var(--jl-world-accent) 26%, var(--jl-ink)) 56%
				);
		border: var(--jl-border) solid var(--jl-ink);
		border-top: 0;
		isolation: isolate;
	}

	/* Halftone over the lettering side only, the way a printed cover screens the
	   ground behind its cover lines. */
	.case-hero::before {
		position: absolute;
		inset: 0;
		z-index: 0;
		background-image:
			radial-gradient(circle at 2px 2px, rgb(255 255 255 / 0.2) 1.4px, transparent 1.6px),
			repeating-linear-gradient(116deg, transparent 0 42px, rgb(255 255 255 / 0.06) 43px 44px);
		background-size:
			13px 13px,
			auto;
		content: '';
		mask-image: linear-gradient(110deg, #000, transparent 58%);
		pointer-events: none;
	}

	/* The plate is second in the document — it is the illustration, and the
	   heading should be what a screen reader meets first — but it is printed on
	   the right, where a cover's art sits next to its lettering. */
	.case-art {
		position: relative;
		z-index: 1;
		grid-area: 1 / 2;
		min-width: 0;
		min-height: 0;
		background: var(--jl-world-base);
		border-left: var(--jl-border) solid var(--jl-ink);
	}

	.case-art img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		/* The plates are composed top-down: the scene reads from the top edge, so
		   whatever the panel cannot fit comes off the bottom. */
		object-position: center top;
	}

	/* Just enough shade at the foot of the plate to seat it against the frame —
	   nothing type has to be read through. */
	.case-art::after {
		position: absolute;
		inset: 0;
		background: linear-gradient(to top, rgb(5 7 12 / 0.55) 0, transparent 22%);
		content: '';
		pointer-events: none;
	}

	.case-headline {
		position: relative;
		z-index: 2;
		display: flex;
		grid-area: 1 / 1;
		flex-direction: column;
		justify-content: end;
		min-width: 0;
		min-height: 0;
		padding: 104px clamp(24px, 3.6vw, 64px) clamp(34px, 4vw, 60px);
	}

	.case-collection {
		margin: 0 0 16px;
		color: var(--jl-yellow);
	}

	.case-hero h1 {
		margin: 0;
		font-size: clamp(2.7rem, 6.4vw, 5.8rem);
	}

	.case-lead {
		max-width: 46ch;
		margin: 20px 0 0;
		color: var(--jl-on-dark);
		font-size: clamp(0.92rem, 1.4vw, 1.12rem);
		line-height: 1.6;
	}

	.case-core {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin: 24px 0 0;
		padding: 0;
		list-style: none;
	}

	.case-core li {
		padding: 6px 11px;
		color: var(--jl-world-on-accent);
		background: var(--jl-world-accent);
		font-size: 0.64rem;
		font-weight: 600;
	}

	:global(.case-blurb) {
		top: clamp(18px, 2.6vw, 30px);
		left: clamp(18px, 2.6vw, 30px);
		z-index: 4;
		max-width: min(420px, 62%);
	}

	/* The issue number, printed over the lettering side the way the cover
	   printed it — never over the plate, where it would land on a face. */
	.case-number {
		position: absolute;
		top: clamp(52px, 8vw, 104px);
		right: auto;
		left: clamp(20px, 3.4vw, 60px);
		z-index: 1;
		color: transparent;
		font-size: clamp(5rem, 13vw, 11rem);
		line-height: 0.8;
		-webkit-text-stroke: 2px rgb(255 253 246 / 0.22);
	}

	/* --------------------------------------------------------------- rail --- */

	.case-rail {
		position: sticky;
		top: 0;
		z-index: 6;
		overflow-x: auto;
		color: var(--jl-white);
		background: var(--jl-ink);
		border: var(--jl-border) solid var(--jl-ink);
		border-block: 0;
		scrollbar-width: none;
	}

	.case-rail ul {
		display: flex;
		gap: 4px;
		margin: 0 auto;
		padding: 0 clamp(12px, 5vw, 64px);
		list-style: none;
	}

	.case-rail a {
		display: block;
		padding: 13px 14px;
		color: var(--jl-on-dark-dim);
		white-space: nowrap;
		text-decoration: none;
	}

	.case-rail a:hover {
		color: var(--jl-yellow);
	}

	/* ------------------------------------------------------------ sections -- */

	.case-section {
		max-width: 1240px;
		margin: 0 auto;
		padding: clamp(46px, 7vw, 96px) clamp(20px, 5vw, 64px);
		/* The rail parks on the top edge, so an anchored section has to start
		   below it rather than under it. */
		scroll-margin-top: 54px;
	}

	.section-head {
		max-width: 68ch;
		margin-bottom: clamp(22px, 3vw, 38px);
	}

	.section-head h2,
	.block-copy h2 {
		margin: 0;
		font-size: clamp(2.1rem, 5.6vw, 4.2rem);
	}

	.section-note {
		margin: 14px 0 0;
		color: color-mix(in oklab, var(--jl-ink) 72%, transparent);
		font-size: clamp(0.82rem, 1.5vw, 0.95rem);
		line-height: 1.6;
	}

	.jl-grid.split {
		grid-template-columns: repeat(2, minmax(0, 1fr));
		margin-top: 0;
		gap: clamp(12px, 2vw, 22px);
	}

	.jl-grid.split.wide-first {
		grid-template-columns: minmax(0, 1.25fr) minmax(0, 0.75fr);
	}

	/* --------------------------------------------------------------- panels -- */

	/* Every panel of a case file is printed in that world's own colours. Display
	   type is outlined in its own ground, so a cream world keeps its accents as
	   legible as a near-black one. */
	:global(.jl-panel.case-block),
	:global(.jl-panel.case-visual) {
		--jl-display-stroke: var(--jl-world-base);

		color: var(--jl-world-on);
		background: var(--jl-world-base);
	}

	/*
	 * The panel that carries the accent takes it on the comic's diagonal, as a
	 * tint of the world's ground. It holds running text, so the far side of the
	 * diagonal has to stay a reading ground: at 58% the copy crossed onto it at
	 * 4.4:1.
	 */
	:global(.jl-panel.case-block[data-accent]) {
		background: linear-gradient(
			150deg,
			var(--jl-world-base) 0 58%,
			color-mix(in oklab, var(--jl-world-accent) 32%, var(--jl-world-base)) 58%
		);
	}

	.block-copy {
		display: flex;
		flex-direction: column;
		height: 100%;
		padding: clamp(26px, 3.4vw, 48px);
	}

	.lede {
		max-width: 62ch;
		margin: 18px 0 0;
		color: color-mix(in oklab, var(--jl-world-on) 92%, transparent);
		font-size: clamp(0.92rem, 1.5vw, 1.08rem);
		line-height: 1.68;
	}

	:global(.jl-panel.case-visual) {
		--jl-shot-mat: var(--jl-world-base);

		display: grid;
		align-content: center;
		padding: clamp(18px, 2.6vw, 34px);
	}

	/* -------------------------------------------------------- decisions ----- */

	:global(.jl-panel.decisions) h3 {
		margin: 0;
		font-size: clamp(1.3rem, 2.6vw, 1.9rem);
	}

	:global(.jl-panel.decisions) ol {
		display: grid;
		gap: 12px;
		margin: 20px 0 0;
		padding-left: 20px;
		color: color-mix(in oklab, var(--jl-world-on) 86%, transparent);
		font-size: clamp(0.82rem, 1.4vw, 0.94rem);
		line-height: 1.6;
	}

	:global(.jl-panel.decisions) li::marker {
		color: var(--jl-world-accent);
		font-weight: 700;
	}

	/* ------------------------------------------------------- architecture --- */

	.architecture-flow {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(290px, 1fr));
		gap: clamp(12px, 1.6vw, 18px);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.architecture-flow li {
		display: grid;
		gap: 14px;
		padding: clamp(18px, 2vw, 26px);
		color: var(--jl-world-on);
		background: var(--jl-world-base);
		border: var(--jl-border) solid var(--jl-ink);
		border-left: 8px solid var(--jl-world-accent);
	}

	.marks {
		display: flex;
		flex-wrap: wrap;
		gap: 9px;
	}

	.marks svg {
		width: 30px;
		height: auto;
		fill: var(--jl-world-accent);
	}

	.monogram {
		display: grid;
		place-items: center;
		width: 30px;
		aspect-ratio: 1;
		color: var(--jl-world-on);
		border: 2px solid color-mix(in oklab, var(--jl-world-accent) 55%, transparent);
		font-family: var(--jl-font-mono);
		font-size: 0.62rem;
		font-weight: 600;
	}

	.node-copy {
		display: block;
		min-width: 0;
	}

	.node-number {
		color: color-mix(in oklab, var(--jl-world-accent) 70%, var(--jl-world-on));
		font-size: 0.66rem;
		font-weight: 700;
	}

	.node-layer {
		display: block;
		margin-top: 4px;
		color: color-mix(in oklab, var(--jl-world-on) 78%, transparent);
		font-size: 0.62rem;
	}

	.architecture-flow strong {
		display: block;
		margin-top: 8px;
		font-size: clamp(0.95rem, 1.6vw, 1.12rem);
	}

	.architecture-flow p {
		max-width: 46ch;
		margin: 8px 0 0;
		color: color-mix(in oklab, var(--jl-world-on) 86%, transparent);
		font-size: clamp(0.8rem, 1.4vw, 0.9rem);
		line-height: 1.55;
	}

	/* ------------------------------------------------------------ modules --- */

	.module-list {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(270px, 1fr));
		gap: clamp(12px, 1.6vw, 18px);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.module-list li {
		display: grid;
		align-content: start;
		gap: 6px;
		padding: clamp(18px, 2vw, 26px);
		color: var(--jl-world-on);
		background: var(--jl-world-base);
		border: var(--jl-border) solid var(--jl-ink);
	}

	.module-list .jl-kicker {
		color: color-mix(in oklab, var(--jl-world-accent) 74%, var(--jl-world-on));
		font-size: 0.66rem;
		font-weight: 700;
	}

	.module-list strong {
		font-size: clamp(0.98rem, 1.7vw, 1.18rem);
		line-height: 1.22;
	}

	.module-list p {
		max-width: 44ch;
		margin: 4px 0 0;
		color: color-mix(in oklab, var(--jl-world-on) 84%, transparent);
		font-size: clamp(0.8rem, 1.4vw, 0.9rem);
		line-height: 1.55;
	}

	/* ----------------------------------------------------- transformation --- */

	.transformation-list {
		display: grid;
		gap: clamp(10px, 1.4vw, 16px);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.transformation-list li {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
		align-items: center;
		gap: clamp(14px, 2.6vw, 34px);
		padding: clamp(18px, 2vw, 28px) clamp(20px, 2.4vw, 34px);
		color: var(--jl-world-on);
		background: var(--jl-world-base);
		border: var(--jl-border) solid var(--jl-ink);
	}

	.transformation-list span {
		display: block;
		margin-bottom: 7px;
		font-size: 0.64rem;
	}

	.before span {
		color: color-mix(in oklab, var(--jl-world-on) 76%, transparent);
	}

	.after span {
		color: var(--jl-world-accent);
		font-weight: 700;
	}

	.transformation-list p {
		margin: 0;
		font-size: clamp(0.84rem, 1.4vw, 0.95rem);
		line-height: 1.55;
	}

	.after p {
		font-weight: 500;
	}

	.change-arrow {
		color: var(--jl-world-accent);
		font-size: clamp(1.4rem, 3vw, 2.2rem);
	}

	/* -------------------------------------------------------------- stack --- */

	.technology-list {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.technology-list li {
		display: flex;
		align-items: center;
		gap: 9px;
		padding: 10px 15px;
		color: var(--jl-ink);
		border: 2px solid color-mix(in oklab, var(--jl-ink) 45%, transparent);
		font-size: 0.72rem;
	}

	.technology-list svg {
		width: 17px;
		height: 17px;
		fill: currentcolor;
	}

	.technology-list .monogram {
		width: 17px;
		color: inherit;
		border-color: color-mix(in oklab, currentcolor 45%, transparent);
		font-size: 0.5rem;
	}

	/* The core stack stands out from the toolkit behind it. */
	.technology-list.core li {
		padding: 12px 18px;
		color: var(--jl-world-on-accent);
		background: var(--jl-world-accent);
		border-color: var(--jl-ink);
		font-size: 0.82rem;
		font-weight: 600;
	}

	.toolkit-title {
		margin: clamp(26px, 3vw, 40px) 0 14px;
		color: color-mix(in oklab, var(--jl-ink) 66%, transparent);
	}

	.marks-note {
		margin: clamp(22px, 3vw, 34px) 0 0;
		color: color-mix(in oklab, var(--jl-ink) 58%, transparent);
		font-size: 0.62rem;
	}

	/* ---------------------------------------------------------------- log --- */

	/* The log is evidence, so it is printed on the world's own ground rather
	   than on the paper the narrative runs on. */
	.log-band {
		max-width: none;
		color: var(--jl-world-on);
		background: var(--jl-world-base);
		border: var(--jl-border) solid var(--jl-ink);
		border-inline: 0;
	}

	.log-band .section-head,
	.log-band .figures,
	.log-band .pulse,
	.log-band .log-detail,
	.log-band .log-note {
		max-width: 1240px;
		margin-inline: auto;
	}

	.log-band h2 {
		--jl-display-stroke: var(--jl-world-base);
	}

	.log-band .section-note {
		color: color-mix(in oklab, var(--jl-world-on) 78%, transparent);
	}

	.figures {
		display: flex;
		flex-wrap: wrap;
		gap: 18px clamp(28px, 6vw, 72px);
	}

	.figure strong {
		display: block;
		font-size: clamp(2.6rem, 7vw, 5rem);
		line-height: 0.85;
		text-shadow: 5px 5px 0 color-mix(in oklab, var(--jl-world-accent) 60%, var(--jl-world-base));
	}

	.figure span {
		display: block;
		margin-top: 8px;
		color: color-mix(in oklab, var(--jl-world-on) 80%, transparent);
		font-size: 0.66rem;
	}

	.pulse {
		margin: clamp(30px, 4vw, 50px) auto 0;
	}

	/* Stretched to the band's width: the bars are proportion, not pixels. */
	.sparkline {
		display: block;
		width: 100%;
		height: clamp(70px, 11vw, 130px);
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
		flex-wrap: wrap;
		justify-content: space-between;
		gap: 8px;
		margin-top: 10px;
		color: color-mix(in oklab, var(--jl-world-on) 78%, transparent);
		font-size: 0.62rem;
	}

	.log-detail {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: clamp(18px, 3vw, 40px);
		margin-top: clamp(30px, 4vw, 50px);
	}

	.repos {
		display: grid;
		align-content: start;
		gap: 8px;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.repos li {
		display: grid;
		grid-template-columns: auto 1fr auto;
		gap: 14px;
		padding: 11px 14px;
		background: color-mix(in oklab, var(--jl-world-accent) 12%, transparent);
		border-left: 4px solid color-mix(in oklab, var(--jl-world-accent) 70%, var(--jl-world-on));
		font-size: 0.64rem;
	}

	.repos span {
		color: color-mix(in oklab, var(--jl-world-on) 80%, transparent);
	}

	.counts-title {
		margin: 0 0 12px;
		color: color-mix(in oklab, var(--jl-world-on) 78%, transparent);
	}

	.counts {
		display: flex;
		flex-wrap: wrap;
		gap: 14px 26px;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.counts li {
		display: flex;
		align-items: baseline;
		gap: 8px;
	}

	.counts strong {
		font-size: clamp(1.3rem, 2.6vw, 1.9rem);
	}

	.counts span {
		color: color-mix(in oklab, var(--jl-world-on) 82%, transparent);
		font-size: 0.62rem;
	}

	.log-note {
		margin: clamp(24px, 3vw, 36px) auto 0;
		color: color-mix(in oklab, var(--jl-world-on) 66%, transparent);
		font-size: 0.6rem;
	}

	/* ------------------------------------------------------------ outcome --- */

	.outcome-band {
		max-width: none;
		color: var(--jl-world-on-accent);
		background: var(--jl-world-accent);
		border: var(--jl-border) solid var(--jl-ink);
		border-inline: 0;
	}

	.outcome-copy {
		max-width: 1240px;
		margin-inline: auto;
	}

	.outcome-band h2 {
		--jl-display-stroke: var(--jl-world-accent);
	}

	.outcome-band .lede {
		color: var(--jl-world-on-accent);
	}

	.confidential {
		margin: clamp(22px, 3vw, 32px) 0 0;
		color: color-mix(in oklab, var(--jl-world-on-accent) 72%, transparent);
		font-size: 0.62rem;
	}

	/* ------------------------------------------------------------ actions --- */

	.case-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 14px;
		margin-top: clamp(26px, 3vw, 38px);
	}

	.action {
		padding: 13px 22px;
		border: 3px solid var(--jl-ink);
		text-decoration: none;
		transition: transform 160ms var(--jl-paper-ease);
	}

	.action:hover {
		transform: translate(-2px, -2px);
	}

	.action-primary {
		color: var(--jl-ink);
		background: var(--jl-yellow);
		box-shadow: 5px 5px 0 var(--jl-red);
	}

	.action-secondary {
		color: inherit;
		background: transparent;
		border-color: currentcolor;
		box-shadow: 5px 5px 0 var(--jl-blue);
	}

	.outcome-band .action-primary,
	.outcome-band .action-secondary {
		box-shadow: 5px 5px 0 var(--jl-ink);
	}

	/* --------------------------------------------------------------- more --- */

	.case-more {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: var(--jl-border);
		padding: 0;
		background: var(--jl-ink);
		border: var(--jl-border) solid var(--jl-ink);
		border-bottom: 0;
	}

	.more-link {
		display: grid;
		align-content: center;
		gap: 10px;
		padding: clamp(26px, 3.4vw, 44px) clamp(18px, 3vw, 36px);
		color: var(--jl-white);
		background: var(--jl-navy);
		text-decoration: none;
	}

	.more-link:hover {
		background: var(--jl-navy-deep);
	}

	.more-link span {
		color: var(--jl-on-dark-dim);
	}

	.more-link strong {
		font-size: clamp(1.2rem, 2.4vw, 1.9rem);
		font-weight: 400;
	}

	.more-link.next {
		text-align: right;
	}

	.more-link.home {
		place-items: center;
		background: var(--jl-ink);
		text-align: center;
	}

	/* --------------------------------------------------------- responsive --- */

	@media (max-width: 900px) {
		/* Stacked, and each half kept whole: the plate above at close to its own
		   proportions, the story under it. */
		.case-hero {
			grid-template-columns: minmax(0, 1fr);
			grid-template-rows: auto auto;
			height: auto;
			min-height: 0;
			max-height: none;
		}

		.case-art {
			grid-area: 1 / 1;
			aspect-ratio: 5 / 4;
			border-left: 0;
			border-bottom: var(--jl-border) solid var(--jl-ink);
		}

		.case-headline {
			grid-area: 2 / 1;
			padding: clamp(28px, 6vw, 44px) clamp(20px, 5vw, 40px) clamp(30px, 6vw, 46px);
		}

		.case-number {
			top: auto;
			bottom: clamp(20px, 5vw, 40px);
			left: auto;
			right: clamp(20px, 5vw, 40px);
			font-size: clamp(4rem, 17vw, 7rem);
		}

		:global(.case-blurb) {
			max-width: min(420px, 78%);
		}

		.jl-grid.split,
		.jl-grid.split.wide-first {
			grid-template-columns: 1fr;
		}

		.transformation-list li {
			grid-template-columns: 1fr;
			gap: 12px;
		}

		.change-arrow {
			justify-self: start;
			transform: rotate(90deg);
		}
	}

	@media (max-width: 760px) {
		.case-shell {
			box-shadow: none;
		}

		.case-more {
			grid-template-columns: 1fr;
		}

		.more-link.next {
			text-align: left;
		}
	}
</style>
