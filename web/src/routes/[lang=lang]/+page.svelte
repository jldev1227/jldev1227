<script lang="ts">
	import { ArtSlot, Bubble, Caption, Panel, Seo } from '$lib/components';
	import { projects } from '$content/projects';
	import { contact, hero, identity, missionIntro, origin, powers, seo, years } from '$content/site';
	import { missionPath, path, translator } from '$i18n';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const locale = $derived(data.locale);
	const t = $derived(translator(locale));

	const lead = $derived(projects[0]);
	const second = $derived(projects[1]);
	const rest = $derived(projects.slice(2));
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

<!-- ------------------------------------------------------------- hero ---- -->
<div class="jl-grid">
	<Panel class="hero">
		<Caption>{hero.caption[locale]}</Caption>
		<Bubble class="hero-bubble">{hero.bubble[locale]}</Bubble>
		<div class="hero-copy">
			<h1 class="jl-display">
				{hero.titleTop[locale]}
				<span>{hero.titleAccent[locale]}</span>
			</h1>
			<p>{hero.lead[locale]}</p>
		</div>
	</Panel>
</div>

<!-- ----------------------------------------------------------- origin ---- -->
<div class="jl-grid origin-grid" id="origin">
	<Panel class="origin">
		<Caption>{origin.caption[locale]}</Caption>
		<h2 class="jl-display">
			<span>{origin.headingLead[locale]}</span>
			<em>{origin.headingAccent[locale]}</em>
			<span>{origin.headingTail[locale]}</span>
		</h2>
		<p>{origin.body[locale]}</p>
	</Panel>

	<Panel class="portrait">
		<ArtSlot label={origin.portraitAlt[locale]} hint={t('art.placeholder')} />
		<Bubble class="portrait-bubble">{origin.portraitBubble[locale]}</Bubble>
	</Panel>
</div>

<!-- --------------------------------------------------------- strengths ---- -->
<div class="jl-grid strength-grid">
	<Panel class="years">
		<strong class="jl-display">{years.value}</strong>
		<span class="jl-kicker">{years.label[locale]}</span>
	</Panel>

	<Panel class="powers" aria-label={t('nav.origin')}>
		{#each powers as power (power.title.en)}
			<div class="power">
				<strong class="jl-display">{power.title[locale]}</strong>
				<small>{power.body[locale]}</small>
			</div>
		{/each}
	</Panel>
</div>

<!-- --------------------------------------------------------- missions ---- -->
<div class="jl-grid" id="missions">
	<Panel class="mission-intro">
		<h2 class="jl-display">{missionIntro.title[locale]}</h2>
		<p>{missionIntro.body[locale]}</p>
	</Panel>
</div>

<div class="jl-grid mission-lead">
	{#each [lead, second] as project (project.slug)}
		<Panel as="article" class="case" data-accent={project.accent}>
			<a class="case-link" href={missionPath(locale, project.slug)}>
				<span class="jl-kicker">{project.kicker[locale]}</span>
				<h3 class="jl-display">{project.title}</h3>
				<p>{project.tagline[locale]}</p>
				<span class="jl-kicker stack">{project.stack.join(' · ')}</span>
			</a>
		</Panel>
	{/each}
</div>

<div class="jl-grid mission-rest">
	{#each rest as project (project.slug)}
		<Panel as="article" class="case case-small" data-accent={project.accent}>
			<a class="case-link" href={missionPath(locale, project.slug)}>
				<span class="jl-kicker">{project.kicker[locale]}</span>
				<h3 class="jl-display">{project.title}</h3>
				<p>{project.tagline[locale]}</p>
				<span class="jl-kicker stack">{project.stack.join(' · ')}</span>
			</a>
		</Panel>
	{/each}
</div>

<!-- ---------------------------------------------------------- contact ---- -->
<div class="jl-grid" id="contact">
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
		</div>
	</Panel>
</div>

<style>
	/* ------------------------------------------------------------ hero ---- */

	:global(.jl-panel.hero) {
		background: linear-gradient(128deg, #0d182b 0 52%, #782036 52% 72%, var(--jl-blue) 72%);
	}

	/* The oversized speed-line ring behind the hero copy. */
	:global(.jl-panel.hero)::after {
		content: '';
		position: absolute;
		right: -8%;
		bottom: -44%;
		z-index: -1;
		width: 65%;
		aspect-ratio: 1;
		border: 34px solid rgb(255 255 255 / 0.12);
		border-radius: 50%;
	}

	:global(.jl-bubble.hero-bubble) {
		top: 82px;
		right: 11%;
		transform: rotate(-4deg);
	}

	/* Flowed rather than absolutely placed: Spanish runs a line longer than
	   English, and the panel has to grow instead of sliding under the caption. */
	.hero-copy {
		position: relative;
		z-index: 2;
		display: flex;
		flex-direction: column;
		justify-content: end;
		min-height: 475px;
		max-width: 700px;
		padding: 108px clamp(24px, 6vw, 68px) 42px;
		color: var(--jl-white);
	}

	.hero-copy h1 {
		font-size: clamp(3.2rem, 8vw, 7.4rem);
		line-height: 0.82;
		text-shadow: 6px 6px 0 var(--jl-ink);
	}

	.hero-copy h1 span {
		display: block;
		color: var(--jl-yellow);
	}

	.hero-copy p {
		max-width: 590px;
		margin: 20px 0 0;
		font-size: 1rem;
		line-height: 1.55;
	}

	/* ---------------------------------------------------------- origin ---- */

	.origin-grid {
		grid-template-columns: 1.05fr 0.95fr;
	}

	:global(.jl-panel.origin) {
		min-height: 380px;
		padding: 42px;
		color: var(--jl-white);
		background: linear-gradient(145deg, #111b2c, #263d64);
	}

	/* Three statements, three lines — wrapping on width breaks them in the
	   wrong places, and differently in each language. */
	.origin-grid h2 {
		margin: 82px 0 18px;
		font-size: clamp(2.4rem, 5vw, 4.7rem);
		line-height: 0.9;
	}

	.origin-grid h2 :is(span, em) {
		display: block;
	}

	.origin-grid h2 em {
		color: var(--jl-red);
		font-style: normal;
		text-shadow: 3px 3px 0 var(--jl-white);
	}

	.origin-grid p {
		max-width: 54ch;
		margin: 0;
		color: var(--jl-on-dark);
		font-size: 0.92rem;
		line-height: 1.6;
	}

	:global(.jl-panel.portrait) {
		min-height: 380px;
		background: linear-gradient(160deg, var(--jl-red) 0 60%, var(--jl-yellow) 60%);
	}

	:global(.jl-bubble.portrait-bubble) {
		top: 28px;
		right: 15px;
	}

	/* ------------------------------------------------------- strengths ---- */

	.strength-grid {
		grid-template-columns: 0.72fr 1.28fr;
	}

	:global(.jl-panel.years) {
		display: grid;
		align-content: center;
		justify-items: center;
		min-height: 300px;
		padding: 24px;
		color: var(--jl-ink);
		background: var(--jl-yellow);
		text-align: center;
	}

	:global(.jl-panel.years) strong {
		font-size: clamp(4.5rem, 10vw, 9rem);
		line-height: 0.8;
		text-shadow: 5px 5px 0 var(--jl-white);
	}

	:global(.jl-panel.years) span {
		margin-top: 22px;
		font-size: 0.8rem;
		letter-spacing: 0.09em;
	}

	/* Four sub-panels sharing the ink background as their gutter. */
	:global(.jl-panel.powers) {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 4px;
		min-height: 300px;
		padding: 4px;
		background: var(--jl-ink);
	}

	.power {
		display: flex;
		flex-direction: column;
		justify-content: end;
		min-height: 142px;
		padding: 18px;
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
		font-size: 1.55rem;
		letter-spacing: 0.03em;
	}

	.power small {
		margin-top: 5px;
		font-size: 0.75rem;
		line-height: 1.35;
	}

	/* -------------------------------------------------------- missions ---- */

	:global(.jl-panel.mission-intro) {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 24px;
		min-height: 180px;
		padding: 28px 36px;
		color: var(--jl-white);
		background: linear-gradient(115deg, var(--jl-red) 0 62%, var(--jl-ink) 62%);
	}

	:global(.jl-panel.mission-intro) h2 {
		max-width: 10ch;
		font-size: clamp(2.4rem, 6vw, 5rem);
		line-height: 0.86;
		text-shadow: 4px 4px 0 var(--jl-ink);
	}

	:global(.jl-panel.mission-intro) p {
		max-width: 390px;
		margin: 0;
		color: var(--jl-on-dark);
		font-size: 0.9rem;
		line-height: 1.55;
	}

	.mission-lead {
		grid-template-columns: 1.2fr 0.8fr;
	}

	.mission-rest {
		grid-template-columns: repeat(3, 1fr);
	}

	:global(.jl-panel.case) {
		min-height: 275px;
		color: var(--jl-white);
		background: var(--jl-navy-deep);
	}

	:global(.jl-panel.case-small) {
		min-height: 230px;
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

	/* The whole panel is the hit area, so the link fills it. */
	.case-link {
		display: flex;
		flex-direction: column;
		justify-content: end;
		height: 100%;
		padding: 26px;
		text-decoration: none;
	}

	.case-link h3 {
		max-width: 12ch;
		margin: 0 0 8px;
		font-size: clamp(1.8rem, 3vw, 2.7rem);
		line-height: 0.9;
	}

	.case-link p {
		max-width: 38ch;
		margin: 0 0 14px;
		font-size: 0.8rem;
		line-height: 1.5;
	}

	.case-link .stack {
		font-size: 0.65rem;
		opacity: 0.75;
	}

	.case-link:hover h3 {
		color: var(--jl-yellow);
	}

	:global(.jl-panel.case[data-accent='yellow']) .case-link:hover h3 {
		color: var(--jl-red);
	}

	/* --------------------------------------------------------- contact ---- */

	:global(.jl-panel.contact) {
		min-height: 300px;
		background: linear-gradient(135deg, var(--jl-ink) 0 58%, var(--jl-blue) 58%);
	}

	/* Top padding reserves the caption's corner, the same way the hero does. */
	.contact-copy {
		display: flex;
		flex-direction: column;
		justify-content: end;
		min-height: 300px;
		padding: 100px 36px 36px;
		color: var(--jl-white);
	}

	.contact-copy h2 {
		max-width: 12ch;
		font-size: clamp(2.4rem, 6vw, 4.6rem);
		text-shadow: 4px 4px 0 var(--jl-red);
	}

	.contact-copy p {
		max-width: 46ch;
		margin: 18px 0 24px;
		color: var(--jl-on-dark);
		font-size: 0.92rem;
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

	.contact-copy a {
		display: inline-block;
		padding: 10px 16px;
		color: var(--jl-ink);
		background: var(--jl-yellow);
		border: 3px solid var(--jl-ink);
		box-shadow: 4px 4px 0 var(--jl-ink);
		font-size: 0.78rem;
		font-weight: 600;
		text-decoration: none;
		text-transform: uppercase;
	}

	.contact-copy a:hover {
		color: var(--jl-white);
		background: var(--jl-red);
	}

	/* ------------------------------------------------------ responsive ---- */

	@media (max-width: 980px) {
		.mission-rest {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (max-width: 760px) {
		.hero-copy {
			min-height: 500px;
			padding: 150px 22px 30px;
		}

		:global(.jl-bubble.hero-bubble) {
			top: 118px;
			right: 20px;
			max-width: 170px;
		}

		.origin-grid,
		.strength-grid,
		.mission-lead,
		.mission-rest {
			grid-template-columns: 1fr;
		}

		:global(.jl-panel.origin) {
			padding: 30px 24px;
		}

		.origin-grid h2 {
			margin-top: 90px;
		}

		:global(.jl-panel.mission-intro) {
			flex-direction: column;
			align-items: start;
			background: var(--jl-red);
		}

		:global(.jl-panel.contact) {
			background: var(--jl-ink);
		}
	}

	@media (max-width: 430px) {
		:global(.jl-panel.powers) {
			grid-template-columns: 1fr;
		}

		.power {
			min-height: 108px;
		}
	}
</style>
