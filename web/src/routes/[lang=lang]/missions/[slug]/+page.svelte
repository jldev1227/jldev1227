<script lang="ts">
	import { Caption, Panel, Seo } from '$lib/components';
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

<div class="jl-grid blocks">
	{#each blocks as block (block.heading)}
		<Panel class="block">
			<h2 class="jl-display">{block.heading}</h2>
			<p>{block.body}</p>
		</Panel>
	{/each}
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
		.blocks {
			grid-template-columns: 1fr;
		}

		:global(.jl-panel.block) {
			min-height: 0;
		}
	}
</style>
