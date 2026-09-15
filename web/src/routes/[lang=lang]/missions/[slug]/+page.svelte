<script lang="ts">
	import { page as appPage } from '$app/state';
	import { Caption, Panel, ProjectShot, Seo } from '$lib/components';
	import {
		ComicCover,
		ComicReader,
		type CoverIssue,
		type ReaderPage
	} from '$lib/components/comic-reader';
	import { cover as coverCopy, identity } from '$content/site';
	import { techMark, techMonogram } from '$content/tech-marks';
	import { homePath, LOCALE_LABEL, missionsPath, other, path, swapLocale, translator } from '$i18n';
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
		palette: project.palette
	});

	const otherLocale = $derived(other(locale));
	const switchHref = $derived(swapLocale(appPage.url.pathname, otherLocale));
	const year = new Date().getFullYear();

	const readerPages = $derived<ReaderPage[]>([
		{ id: 'challenge', label: t('missions.challenge'), content: pageChallenge },
		{ id: 'snapshot', label: t('missions.snapshot'), content: pageSnapshot },
		{ id: 'approach', label: t('missions.approach'), content: pageApproach },
		{ id: 'architecture', label: t('missions.architecture'), content: pageArchitecture },
		{ id: 'before-after', label: t('missions.beforeAfter'), content: pageTransformation },
		{ id: 'outcome', label: t('missions.outcome'), content: pageOutcome }
	]);
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

<!-- ------------------------------------------------------------- page 1 ---- -->
{#snippet pageChallenge()}
	<div class="jl-grid stack-intro">
		<Panel class="case-visual jl-bleed jl-bleed-top">
			<ProjectShot src={project.image.src} alt={project.image.alt[locale]} compact />
		</Panel>

		<Panel class="block" data-accent={project.accent} data-shade="corner">
			<Caption>{project.kicker[locale]}</Caption>
			<div class="block-copy">
				<h2 class="jl-display">{t('missions.challenge')}</h2>
				<p>{project.challenge[locale]}</p>
			</div>
		</Panel>
	</div>
{/snippet}

<!-- ------------------------------------------------------------- page 2 ---- -->
{#snippet pageSnapshot()}
	<div class="jl-grid stack-outro">
		<Panel class="snapshot" data-accent={project.accent}>
			<h2 class="jl-display">{t('missions.snapshot')}</h2>
			<div class="stats">
				{#each project.stats as stat (stat.label.en)}
					<div class="stat">
						<strong class="jl-display">{stat.value}</strong>
						<span class="jl-kicker">{stat.label[locale]}</span>
					</div>
				{/each}
			</div>
			<small class="jl-kicker snapshot-note">{t('missions.snapshotNote')}</small>
		</Panel>

		<Panel class="technologies" data-shade="head">
			<div class="block-copy">
				<h2 class="jl-display">{t('missions.technologies')}</h2>
				<ul class="technology-list">
					{#each project.stack as technology (technology)}
						{@const mark = techMark(technology)}
						<li class="jl-kicker">
							{#if mark}
								<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
									<path d={mark.path} />
								</svg>
							{/if}
							{technology}
						</li>
					{/each}
				</ul>
			</div>
		</Panel>
	</div>
{/snippet}

<!-- ------------------------------------------------------------- page 3 ---- -->
{#snippet pageApproach()}
	<div class="jl-grid fill">
		<Panel class="block jl-bleed jl-bleed-top" data-accent={project.accent} data-shade="head">
			<div class="block-copy">
				<h2 class="jl-display">{t('missions.approach')}</h2>
				<p>{project.approach[locale]}</p>
			</div>
		</Panel>
	</div>
{/snippet}

<!-- ------------------------------------------------------------- page 4 ---- -->
{#snippet pageArchitecture()}
	<div class="jl-grid fill">
		<Panel class="architecture">
			<div class="block-copy">
				<h2 class="jl-display">{t('missions.architecture')}</h2>
				<p class="architecture-note">{t('missions.architectureNote')}</p>

				<ol class="architecture-flow">
					{#each project.architecture as node, index (node.technology)}
						<li>
							<span class="marks" aria-hidden="true">
								{#each node.technology.split('·').map((t) => t.trim()) as tech (tech)}
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
{/snippet}

<!-- ------------------------------------------------------------- page 5 ---- -->
{#snippet pageTransformation()}
	<div class="jl-grid stack-intro">
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

		<Panel class="decisions">
			<div class="block-copy">
				<h2 class="jl-display">{t('missions.decisions')}</h2>
				<ol>
					{#each project.decisions as decision (decision.en)}
						<li>{decision[locale]}</li>
					{/each}
				</ol>
			</div>
		</Panel>
	</div>
{/snippet}

<!-- ------------------------------------------------------------- page 6 ---- -->
{#snippet pageOutcome()}
	<div class="jl-grid fill">
		<Panel class="outro jl-bleed jl-bleed-top" data-accent={project.accent} data-shade="corner">
			<Caption>{t('missions.confidential')}</Caption>
			<div class="outro-copy">
				<h2 class="jl-display">{t('missions.outcome')}</h2>
				<p>{project.outcome[locale]}</p>

				<ul class="actions">
					<li><a href={homePath(locale)}>{t('missions.backHome')}</a></li>
					<li><a href={missionsPath(locale)}>{t('missions.all')}</a></li>
					{#if project.link}
						<!--
							Named after where it actually goes. It used to be labelled with the
							project's own title, which promised the project and delivered a
							GitHub profile.
						-->
						<li><a href={project.link} rel="noopener">{t('missions.source')} ↗</a></li>
					{/if}
				</ul>

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
			</div>
		</Panel>
	</div>
{/snippet}

<!-- Its own issue of the collection, read exactly like the introductory one. -->
<main
	id="content"
	class="comic"
	style="--jl-world-base:{project.palette.base}; --jl-world-accent:{project.palette
		.accent}; --jl-world-on:{project.palette.on === 'ink'
		? 'var(--jl-ink)'
		: 'var(--jl-white)'}; --jl-world-on-accent:{project.palette.onAccent === 'ink'
		? 'var(--jl-ink)'
		: 'var(--jl-white)'}"
>
	<ComicReader {locale} pages={readerPages}>
		{#snippet cover({ enhanced, open })}
			<ComicCover {locale} {issue} {enhanced} onopen={open} />
		{/snippet}
	</ComicReader>
</main>

<style>
	/* Every panel here lives inside a reader page — half a spread on a wide
	   screen, a whole page on a narrow one — so it sizes against that page
	   container, never the viewport. */

	.comic {
		display: block;
		max-width: var(--jl-page-max);
		margin: 0 auto;
		/* Room either side for the stack of page edges the reader draws. */
		padding: 0 clamp(18px, 3vw, 36px);
	}

	/* A panel that sets its own height, then one that takes the rest of the sheet. */
	.stack-intro {
		flex: 1;
		grid-template-rows: auto 1fr;
	}

	/* The other way round: the first panel leads and the second closes at its
	   own height, so a short list does not sit in a tall empty box. */
	.stack-outro {
		flex: 1;
		grid-template-rows: 1fr auto;
	}

	.fill {
		flex: 1;
		grid-template-rows: 1fr;
	}

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
	:global(.jl-panel.architecture),
	:global(.jl-panel.transformation),
	:global(.jl-panel.decisions),
	:global(.jl-panel.outro),
	:global(.jl-panel.technologies) {
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

	:global(.jl-panel.snapshot) {
		--jl-display-stroke: var(--jl-world-accent);

		color: var(--jl-world-on-accent);
		background: var(--jl-world-accent);
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
	.outro-copy {
		padding-top: 104px;
	}

	/* ----------------------------------------------------------- snapshot ---- */

	:global(.jl-panel.snapshot) {
		display: grid;
		align-content: center;
		gap: 14px;
		min-height: 200px;
		padding: clamp(20px, 5cqi, 34px);
	}

	:global(.jl-panel.snapshot) h2 {
		font-size: clamp(1.3rem, 6cqi, 2rem);
	}

	.stats {
		display: flex;
		flex-wrap: wrap;
		gap: clamp(16px, 5cqi, 34px) clamp(18px, 6cqi, 44px);
	}

	.stat strong {
		display: block;
		font-size: clamp(2.4rem, 15cqi, 5rem);
		line-height: 0.82;
		/* The panel is the accent, so the drop is the world's other tone. */
		text-shadow: 5px 5px 0 var(--jl-world-base);
	}

	.stat span {
		display: block;
		margin-top: 6px;
		font-size: clamp(0.56rem, 1.8cqi, 0.68rem);
	}

	.snapshot-note {
		font-size: clamp(0.54rem, 1.7cqi, 0.64rem);
		opacity: 0.7;
	}

	/* ------------------------------------------------------- technologies ---- */

	.technology-list svg {
		width: 15px;
		height: 15px;
		fill: var(--jl-world-accent);
	}

	.technology-list {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin: 16px 0 0;
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
</style>
