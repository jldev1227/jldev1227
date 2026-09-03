<script lang="ts">
	import { Panel, Seo } from '$lib/components';
	import { projects } from '$content/projects';
	import { identity, missionIntro } from '$content/site';
	import { missionPath, path, translator } from '$i18n';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const locale = $derived(data.locale);
	const t = $derived(translator(locale));
	const canonicalPath = $derived(path(locale, 'missions'));
</script>

<Seo
	{locale}
	title={`${t('missions.all')} · ${identity.alias}`}
	description={missionIntro.body[locale]}
	schema={[
		{
			'@type': 'CollectionPage',
			'@id': `${identity.url}${canonicalPath}#collection`,
			name: t('missions.all'),
			inLanguage: locale,
			hasPart: projects.map((project) => ({
				'@type': 'CreativeWork',
				name: project.title,
				url: `${identity.url}${missionPath(locale, project.slug)}`
			}))
		}
	]}
/>

<div class="jl-grid">
	<Panel class="index-intro">
		<h1 class="jl-display">{missionIntro.title[locale]}</h1>
		<p>{missionIntro.body[locale]}</p>
	</Panel>
</div>

<div class="jl-grid list">
	{#each projects as project (project.slug)}
		<Panel as="article" class="row" data-accent={project.accent}>
			<a href={missionPath(locale, project.slug)}>
				<span class="jl-kicker">{project.number}</span>
				<div>
					<h2 class="jl-display">{project.title}</h2>
					<p>{project.tagline[locale]}</p>
				</div>
				<span class="jl-kicker stack">{project.stack.join(' · ')}</span>
			</a>
		</Panel>
	{/each}
</div>

<style>
	:global(.jl-panel.index-intro) {
		padding: 36px;
		color: var(--jl-white);
		background: linear-gradient(115deg, var(--jl-red) 0 62%, var(--jl-ink) 62%);
	}

	:global(.jl-panel.index-intro) h1 {
		max-width: 12ch;
		font-size: clamp(2.4rem, 6vw, 4.6rem);
		text-shadow: 4px 4px 0 var(--jl-ink);
	}

	:global(.jl-panel.index-intro) p {
		max-width: 52ch;
		margin: 18px 0 0;
		color: var(--jl-on-dark);
		line-height: 1.6;
	}

	:global(.jl-panel.row) {
		color: var(--jl-white);
		background: var(--jl-navy-deep);
	}

	:global(.jl-panel.row[data-accent='yellow']) {
		color: var(--jl-ink);
		background: var(--jl-yellow);
	}

	.list a {
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: center;
		gap: 24px;
		padding: 24px 26px;
		text-decoration: none;
	}

	.list a > span:first-child {
		font-family: var(--jl-font-display);
		font-size: 2.4rem;
		opacity: 0.5;
	}

	.list h2 {
		margin: 0 0 6px;
		font-size: 1.9rem;
	}

	.list p {
		max-width: 60ch;
		margin: 0;
		font-size: 0.85rem;
		line-height: 1.5;
	}

	.list .stack {
		font-size: 0.65rem;
		opacity: 0.7;
	}

	.list a:hover h2 {
		color: var(--jl-yellow);
	}

	:global(.jl-panel.row[data-accent='yellow']) a:hover h2 {
		color: var(--jl-red);
	}

	@media (max-width: 760px) {
		.list a {
			grid-template-columns: 1fr;
			gap: 10px;
		}
	}
</style>
