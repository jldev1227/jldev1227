<script lang="ts">
	import { Caption, Panel, ProjectShot, Seo } from '$lib/components';
	import { identity } from '$content/site';
	import { missionsPath, path, translator } from '$i18n';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const locale = $derived(data.locale);
	const project = $derived(data.project);
	const t = $derived(translator(locale));

	const canonicalPath = $derived(path(locale, 'missions', project.slug));
	const title = $derived(`${project.title} · ${identity.alias}`);

	const blocks = $derived([
		{ heading: t('missions.challenge'), body: project.challenge[locale] },
		{ heading: t('missions.approach'), body: project.approach[locale] },
		{ heading: t('missions.outcome'), body: project.outcome[locale] }
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

<div class="jl-grid">
	<Panel class="case-hero" data-accent={project.accent}>
		<Caption>{project.kicker[locale]}</Caption>
		<div class="case-hero-copy">
			<h1 class="jl-display">{project.title}</h1>
			<p>{project.tagline[locale]}</p>
			<ul class="stack">
				{#each project.stack as tag (tag)}
					<li class="jl-kicker">{tag}</li>
				{/each}
			</ul>
		</div>
	</Panel>
</div>

<div class="jl-grid evidence">
	<Panel class="case-visual">
		<ProjectShot
			src={project.image.src}
			alt={project.image.alt[locale]}
			caption={project.image.caption[locale]}
		/>
	</Panel>

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
</div>

<div class="jl-grid blocks">
	{#each blocks as block (block.heading)}
		<Panel class="block">
			<h2 class="jl-display">{block.heading}</h2>
			<p>{block.body}</p>
		</Panel>
	{/each}
</div>

<div class="jl-grid">
	<Panel class="architecture">
		<div class="section-heading">
			<div>
				<h2 class="jl-display">{t('missions.architecture')}</h2>
				<p>{t('missions.architectureNote')}</p>
			</div>
			<span class="jl-kicker">FULL STACK · 01—04</span>
		</div>

		<ol class="architecture-flow">
			{#each project.architecture as node, index (node.technology)}
				<li>
					<span class="jl-kicker node-number">{String(index + 1).padStart(2, '0')}</span>
					<span class="jl-kicker node-layer">{node.layer[locale]}</span>
					<strong>{node.technology}</strong>
					<p>{node.detail[locale]}</p>
				</li>
			{/each}
		</ol>
	</Panel>
</div>

<div class="jl-grid">
	<Panel class="transformation" data-accent={project.accent}>
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
	</Panel>
</div>

<div class="jl-grid details">
	<Panel class="technologies">
		<h2 class="jl-display">{t('missions.technologies')}</h2>
		<ul class="technology-list">
			{#each project.stack as technology (technology)}
				<li class="jl-kicker">{technology}</li>
			{/each}
		</ul>
	</Panel>

	<Panel class="decisions">
		<h2 class="jl-display">{t('missions.decisions')}</h2>
		<ol>
			{#each project.decisions as decision (decision.en)}
				<li>{decision[locale]}</li>
			{/each}
		</ol>
	</Panel>
</div>

<div class="jl-grid">
	<Panel class="outro">
		<p class="jl-kicker note">{t('missions.confidential')}</p>
		<div class="actions">
			<a href={missionsPath(locale)}>{t('missions.all')}</a>
			{#if project.link}
				<a href={project.link} rel="noopener">{project.title} ↗</a>
			{/if}
		</div>
	</Panel>
</div>

<style>
	:global(.jl-panel.case-hero) {
		min-height: 340px;
		color: var(--jl-white);
		background: linear-gradient(135deg, var(--jl-navy-deep) 0 58%, var(--jl-red) 58%);
	}

	:global(.jl-panel.case-hero[data-accent='blue']) {
		background: linear-gradient(135deg, #14263f 0 58%, var(--jl-blue) 58%);
	}

	:global(.jl-panel.case-hero[data-accent='yellow']) {
		color: var(--jl-ink);
		background: linear-gradient(135deg, var(--jl-yellow) 0 58%, var(--jl-white) 58%);
	}

	:global(.jl-panel.case-hero[data-accent='ink']) {
		background: linear-gradient(135deg, var(--jl-ink) 0 58%, var(--jl-navy) 58%);
	}

	.case-hero-copy {
		display: flex;
		flex-direction: column;
		justify-content: end;
		min-height: 340px;
		padding: 100px 36px 36px;
	}

	.case-hero-copy h1 {
		font-size: clamp(2.4rem, 7vw, 5.4rem);
		text-shadow: 5px 5px 0 var(--jl-ink);
	}

	:global(.jl-panel.case-hero[data-accent='yellow']) h1 {
		text-shadow: 5px 5px 0 var(--jl-white);
	}

	.case-hero-copy p {
		max-width: 52ch;
		margin: 20px 0 0;
		font-size: 1rem;
		line-height: 1.55;
	}

	.stack {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin: 22px 0 0;
		padding: 0;
		list-style: none;
	}

	.stack li {
		padding: 6px 10px;
		color: var(--jl-ink);
		background: var(--jl-yellow);
		border: 2px solid var(--jl-ink);
	}

	.evidence {
		grid-template-columns: minmax(0, 1.65fr) minmax(260px, 0.75fr);
	}

	:global(.jl-panel.case-visual) {
		padding: 26px;
		background: var(--jl-navy-deep);
	}

	:global(.jl-panel.snapshot) {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		padding: 28px;
		color: var(--jl-white);
		background: var(--jl-blue);
	}

	:global(.jl-panel.snapshot[data-accent='red']) {
		background: var(--jl-red);
	}

	:global(.jl-panel.snapshot[data-accent='yellow']) {
		--jl-display-stroke: var(--jl-white);

		color: var(--jl-ink);
		background: var(--jl-yellow);
	}

	:global(.jl-panel.snapshot[data-accent='ink']) {
		background: var(--jl-ink);
	}

	:global(.jl-panel.snapshot) h2,
	:global(.jl-panel.architecture) h2,
	:global(.jl-panel.transformation) h2,
	:global(.jl-panel.technologies) h2,
	:global(.jl-panel.decisions) h2 {
		font-size: clamp(1.9rem, 4vw, 3rem);
	}

	.stats {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 8px;
		margin: 28px 0;
	}

	.stat {
		min-width: 0;
		padding-top: 14px;
		border-top: 3px solid currentColor;
	}

	.stat strong {
		display: block;
		font-size: clamp(2.1rem, 5vw, 3.6rem);
	}

	.stat span {
		display: block;
		margin-top: 8px;
		font-size: 0.62rem;
		line-height: 1.35;
	}

	.snapshot-note {
		font-size: 0.6rem;
		opacity: 0.72;
	}

	.blocks {
		grid-template-columns: repeat(3, 1fr);
	}

	:global(.jl-panel.block) {
		min-height: 240px;
		padding: 26px;
		color: var(--jl-white);
		background: var(--jl-navy);
	}

	.blocks h2 {
		max-width: 12ch;
		margin: 0 0 14px;
		font-size: 1.9rem;
		color: var(--jl-yellow);
	}

	.blocks p {
		margin: 0;
		color: var(--jl-on-dark);
		font-size: 0.88rem;
		line-height: 1.6;
	}

	:global(.jl-panel.architecture) {
		padding: 30px;
		color: var(--jl-white);
		background: var(--jl-ink);
	}

	.section-heading {
		display: flex;
		align-items: start;
		justify-content: space-between;
		gap: 24px;
	}

	.section-heading h2 {
		color: var(--jl-yellow);
	}

	.section-heading p {
		max-width: 52ch;
		margin: 10px 0 0;
		color: var(--jl-on-dark-dim);
		font-size: 0.8rem;
		line-height: 1.5;
	}

	.section-heading > .jl-kicker {
		flex: 0 0 auto;
		padding: 7px 10px;
		color: var(--jl-ink);
		background: var(--jl-yellow);
		border: 2px solid var(--jl-white);
	}

	.architecture-flow {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 24px;
		margin: 28px 0 0;
		padding: 0;
		list-style: none;
	}

	.architecture-flow li {
		position: relative;
		min-width: 0;
		padding: 18px;
		background: var(--jl-navy-deep);
		border: 3px solid var(--jl-white);
		box-shadow: 5px 5px 0 var(--jl-red);
	}

	.architecture-flow li:not(:last-child)::after {
		position: absolute;
		top: 50%;
		right: -24px;
		z-index: 2;
		width: 24px;
		color: var(--jl-yellow);
		font-family: var(--jl-font-display);
		font-size: 1.8rem;
		line-height: 1;
		text-align: center;
		content: '›';
		transform: translateY(-50%);
	}

	.node-number {
		display: block;
		color: var(--jl-yellow);
		font-size: 1.55rem;
	}

	.node-layer {
		display: block;
		margin-top: 18px;
		color: var(--jl-on-dark-dim);
		font-size: 0.58rem;
		line-height: 1.35;
	}

	.architecture-flow strong {
		display: block;
		margin-top: 7px;
		font-size: 0.9rem;
		line-height: 1.35;
	}

	.architecture-flow p {
		margin: 10px 0 0;
		color: var(--jl-on-dark-dim);
		font-size: 0.74rem;
		line-height: 1.5;
	}

	:global(.jl-panel.transformation) {
		--jl-display-stroke: var(--jl-white);

		padding: 30px;
		color: var(--jl-ink);
		background: var(--jl-yellow);
	}

	:global(.jl-panel.transformation) h2 {
		margin-bottom: 24px;
	}

	.transformation-list {
		display: grid;
		gap: 10px;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.transformation-list li {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 44px minmax(0, 1fr);
		align-items: stretch;
		background: var(--jl-white);
		border: 3px solid var(--jl-ink);
	}

	.transformation-list li > div {
		padding: 15px 18px;
	}

	.transformation-list .before {
		background: color-mix(in srgb, var(--jl-red) 10%, var(--jl-white));
	}

	.transformation-list .after {
		background: color-mix(in srgb, var(--jl-blue) 10%, var(--jl-white));
	}

	.transformation-list p {
		margin: 6px 0 0;
		font-size: 0.83rem;
		font-weight: 600;
		line-height: 1.45;
	}

	.change-arrow {
		display: grid;
		place-items: center;
		color: var(--jl-white);
		background: var(--jl-ink);
		font-family: var(--jl-font-display);
		font-size: 1.6rem;
	}

	.details {
		grid-template-columns: 0.8fr 1.2fr;
	}

	:global(.jl-panel.technologies),
	:global(.jl-panel.decisions) {
		padding: 28px;
		color: var(--jl-white);
		background: var(--jl-navy-deep);
	}

	:global(.jl-panel.technologies) h2,
	:global(.jl-panel.decisions) h2 {
		color: var(--jl-yellow);
	}

	.technology-list {
		display: flex;
		flex-wrap: wrap;
		gap: 9px;
		margin: 24px 0 0;
		padding: 0;
		list-style: none;
	}

	.technology-list li {
		padding: 8px 10px;
		color: var(--jl-ink);
		background: var(--jl-yellow);
		border: 2px solid var(--jl-white);
		box-shadow: 3px 3px 0 var(--jl-red);
	}

	:global(.jl-panel.decisions) ol {
		display: grid;
		gap: 16px;
		margin: 22px 0 0;
		padding-left: 1.5rem;
	}

	:global(.jl-panel.decisions) li {
		padding-left: 8px;
		color: var(--jl-on-dark);
		font-size: 0.88rem;
		line-height: 1.55;
	}

	:global(.jl-panel.decisions) li::marker {
		color: var(--jl-yellow);
		font-family: var(--jl-font-display);
		font-size: 1.3em;
	}

	:global(.jl-panel.outro) {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 18px;
		padding: 26px;
		color: var(--jl-white);
		background: var(--jl-ink);
	}

	.note {
		margin: 0;
		max-width: 46ch;
		color: var(--jl-on-dark-dim);
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
	}

	.actions a {
		padding: 10px 16px;
		color: var(--jl-ink);
		background: var(--jl-yellow);
		border: 3px solid var(--jl-white);
		box-shadow: 4px 4px 0 var(--jl-red);
		font-size: 0.75rem;
		font-weight: 600;
		text-decoration: none;
		text-transform: uppercase;
	}

	.actions a:hover {
		color: var(--jl-white);
		background: var(--jl-red);
	}

	@media (max-width: 760px) {
		.evidence,
		.details,
		.blocks {
			grid-template-columns: 1fr;
		}

		:global(.jl-panel.block) {
			min-height: 0;
		}

		.stats {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}

		.section-heading {
			flex-direction: column;
		}

		.architecture-flow {
			grid-template-columns: 1fr;
			gap: 18px;
		}

		.architecture-flow li:not(:last-child)::after {
			top: auto;
			right: 50%;
			bottom: -20px;
			width: auto;
			transform: translateX(50%) rotate(90deg);
		}

		.transformation-list li {
			grid-template-columns: 1fr;
		}

		.change-arrow {
			min-height: 32px;
			font-size: 0;
		}

		.change-arrow::after {
			font-size: 1.6rem;
			content: '↓';
		}
	}
</style>
