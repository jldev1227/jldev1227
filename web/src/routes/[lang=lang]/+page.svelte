<script lang="ts">
	import { Bubble, Caption, Masthead, PageFooter, Panel, Seo } from '$lib/components';
	import { projects, type Project } from '$content/projects';
	import {
		contact,
		hero,
		identity,
		landing,
		method,
		methodSteps,
		multiverse,
		now,
		origin,
		powers,
		seo,
		years
	} from '$content/site';
	import { missionPath, missionsPath, path, translator } from '$i18n';
	import { ART_SIZES, responsiveArt } from '$lib/images';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const locale = $derived(data.locale);
	const t = $derived(translator(locale));

	/** The hero portrait is the page's largest paint; it is preloaded below. */
	const portrait = responsiveArt('/art/julian-cover-freelancer-v2.webp');

	function worldStyle(project: Project): string {
		const onBase = project.palette.on === 'paper' ? 'var(--jl-white)' : 'var(--jl-ink)';
		const onAccent = project.palette.onAccent === 'paper' ? 'var(--jl-white)' : 'var(--jl-ink)';
		return `--world-base:${project.palette.base};--world-accent:${project.palette.accent};--world-on:${onBase};--world-on-accent:${onAccent}`;
	}
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
			mainEntity: { '@id': `${identity.url}/#person` },
			hasPart: projects.map((project) => ({
				'@type': 'CreativeWork',
				name: project.title,
				url: `${identity.url}${missionPath(locale, project.slug)}`
			}))
		}
	]}
/>

<svelte:head>
	<!-- The portrait is the largest contentful paint on this page. Without this
	     the browser only discovers it once the hero section lays out, which on a
	     phone costs more than a second of the paint it is waiting for. -->
	<link
		rel="preload"
		as="image"
		type="image/avif"
		fetchpriority="high"
		imagesrcset={portrait.avif}
		imagesizes={ART_SIZES.hero}
	/>
</svelte:head>

<div class="landing-shell">
	<Masthead {locale} />

	<main id="content">
		<!-- The portfolio opens on the person, not the archive. The image is the
		     same authored comic portrait used by issue #1227, now allowed to lead. -->
		<section class="hero" aria-labelledby="hero-title">
			<div class="hero-copy">
				<Caption>{hero.caption[locale]}</Caption>
				<p class="hero-name jl-kicker">{identity.name} · {identity.alias}</p>
				<h1 id="hero-title" class="jl-display">
					<span>{hero.titleTop[locale]}</span>
					<em>{hero.titleAccent[locale]}</em>
				</h1>
				<p class="hero-lead">{hero.lead[locale]}</p>

				<div class="hero-actions">
					<a class="action action-primary jl-kicker" href="#missions">
						{multiverse.eyebrow[locale]} <span aria-hidden="true">↓</span>
					</a>
					<a class="action action-secondary jl-kicker" href="#origin">
						{landing.meet[locale]}
					</a>
				</div>
			</div>

			<div class="hero-art">
				<picture>
					<source type="image/avif" srcset={portrait.avif} sizes={ART_SIZES.hero} />
					<source type="image/webp" srcset={portrait.webp} sizes={ART_SIZES.hero} />
					<img
						src={portrait.src}
						alt={origin.portraitAlt[locale]}
						width="1024"
						height="1536"
						fetchpriority="high"
					/>
				</picture>
				<Bubble class="hero-bubble">{hero.bubble[locale]}</Bubble>
			</div>

			<ul class="hero-facts" aria-label={landing.role[locale]}>
				<li>
					<strong class="jl-display">{years.value}</strong>
					<span class="jl-kicker">{years.label[locale]}</span>
				</li>
				<li>
					<strong class="jl-display">{identity.location[locale]}</strong>
					<span class="jl-kicker">{landing.location[locale]}</span>
				</li>
				<li>
					<strong class="jl-display">{projects.length}</strong>
					<span class="jl-kicker">{multiverse.eyebrow[locale]}</span>
				</li>
			</ul>
		</section>

		<!-- Personal context before proof. Both panels keep their copy in flow so
		     the longer Spanish version never grows behind the caption. -->
		<section id="origin" class="personal jl-grid" aria-label={origin.pageLabel[locale]}>
			<Panel class="origin-panel" data-shade="corner">
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

			<Panel class="powers-panel" aria-label={origin.portraitBubble[locale]}>
				{#each powers as power, index (power.title.en)}
					<article class="power" data-power={index + 1}>
						<span class="power-index jl-kicker">0{index + 1}</span>
						<strong class="jl-display">{power.title[locale]}</strong>
						<p>{power.body[locale]}</p>
					</article>
				{/each}
			</Panel>
		</section>

		<section id="missions" class="worlds" aria-labelledby="worlds-title">
			<header class="worlds-heading">
				<div>
					<p class="worlds-eyebrow jl-kicker">{multiverse.eyebrow[locale]}</p>
					<h2 id="worlds-title" class="jl-display">
						<span>{multiverse.titleLead[locale]}</span>
						<em>{multiverse.titleAccent[locale]}</em>
					</h2>
				</div>
				<p>{multiverse.body[locale]}</p>
			</header>

			<div class="world-list">
				{#each projects as project, index (project.slug)}
					{@const cover = responsiveArt(project.coverArt.src)}
					<article
						class="world"
						data-layout={(index % 6) + 1}
						data-long={project.title.length > 20 ? '' : undefined}
						data-copy-tone={project.palette.on}
						style={worldStyle(project)}
					>
						<div class="world-copy">
							<p class="world-kicker jl-kicker">{project.kicker[locale]}</p>
							<h3 class="jl-display">{project.title}</h3>
							<p class="world-tagline">{project.tagline[locale]}</p>
							<ul class="world-stack" aria-label={t('missions.technologies')}>
								{#each project.stack.slice(0, 5) as tool (tool)}
									<li class="jl-kicker">{tool}</li>
								{/each}
							</ul>
							<a
								class="world-link jl-kicker"
								href={missionPath(locale, project.slug)}
								aria-label={`${multiverse.enter[locale]}: ${project.title}`}
							>
								{multiverse.enter[locale]} <span aria-hidden="true">↗</span>
							</a>
						</div>

						<a
							class="world-art"
							href={missionPath(locale, project.slug)}
							aria-hidden="true"
							tabindex="-1"
						>
							<picture>
								<source type="image/avif" srcset={cover.avif} sizes={ART_SIZES.world} />
								<source type="image/webp" srcset={cover.webp} sizes={ART_SIZES.world} />
								<img
									src={cover.src}
									alt=""
									width={project.coverArt.width}
									height={project.coverArt.height}
									loading="lazy"
									decoding="async"
								/>
							</picture>
							<span class="world-number jl-display">{project.number}</span>
						</a>
					</article>
				{/each}
			</div>

			<aside class="archive-signal">
				<p>{multiverse.archiveBody[locale]}</p>
				<a class="jl-kicker" href={missionsPath(locale)}>
					{multiverse.archiveLink[locale]} <span aria-hidden="true">→</span>
				</a>
			</aside>
		</section>

		<section id="method" class="method jl-grid" aria-label={method.title[locale]}>
			<Panel class="method-intro" data-shade="head">
				<Caption>{method.caption[locale]}</Caption>
				<div class="method-copy">
					<h2 class="jl-display">{method.title[locale]}</h2>
					<p>{method.body[locale]}</p>
				</div>
			</Panel>

			<Panel class="method-steps">
				<ol>
					{#each methodSteps as step (step.number)}
						<li>
							<span class="step-number jl-display">{step.number}</span>
							<div>
								<strong class="jl-kicker">{step.title[locale]}</strong>
								<p>{step.body[locale]}</p>
							</div>
						</li>
					{/each}
				</ol>
			</Panel>

			<Panel class="now-panel">
				<span class="now-status jl-kicker">{now.status[locale]}</span>
				<div>
					<h2 class="jl-display">{now.title[locale]}</h2>
					<p>{now.body[locale]}</p>
				</div>
			</Panel>
		</section>

		<section id="contact" class="contact" aria-labelledby="contact-title">
			<p class="contact-caption jl-kicker">{contact.caption[locale]}</p>
			<h2 id="contact-title" class="jl-display">{contact.title[locale]}</h2>
			<p>{contact.body[locale]}</p>
			<nav class="contact-actions" aria-label={contact.pageLabel[locale]}>
				<a class="action action-primary jl-kicker" href={`mailto:${identity.email}`}>
					{t('contact.email')} <span aria-hidden="true">↗</span>
				</a>
				<a class="action action-secondary jl-kicker" href={identity.github} rel="noopener">
					{t('contact.github')}
				</a>
				<a class="action action-secondary jl-kicker" href={identity.linkedin} rel="noopener">
					{t('contact.linkedin')}
				</a>
			</nav>
		</section>
	</main>

	<PageFooter {locale} />
</div>

<style>
	.landing-shell {
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

	/* -------------------------------------------------------------- hero --- */

	.hero {
		position: relative;
		display: grid;
		grid-template-columns: minmax(0, 1.13fr) minmax(360px, 0.87fr);
		grid-template-rows: minmax(0, 1fr) auto;
		height: calc(100svh - 64px);
		min-height: 620px;
		max-height: 720px;
		overflow: hidden;
		color: var(--jl-white);
		background:
			linear-gradient(
				112deg,
				transparent 0 47%,
				rgb(20 120 212 / 0.22) 47.2% 48%,
				transparent 48.2%
			),
			linear-gradient(137deg, var(--jl-ink) 0 58%, var(--jl-navy) 58% 76%, #42162b 76%);
		border: var(--jl-border) solid var(--jl-ink);
		border-top: 0;
		isolation: isolate;
	}

	.hero::before {
		position: absolute;
		inset: 0;
		z-index: -1;
		background-image:
			radial-gradient(circle at 2px 2px, rgb(255 255 255 / 0.2) 1.4px, transparent 1.6px),
			repeating-linear-gradient(116deg, transparent 0 42px, rgb(255 255 255 / 0.06) 43px 44px);
		background-size:
			13px 13px,
			auto;
		content: '';
		mask-image: linear-gradient(110deg, #000, transparent 63%);
	}

	.hero-copy {
		position: relative;
		z-index: 3;
		display: flex;
		flex-direction: column;
		justify-content: end;
		min-width: 0;
		padding: 70px clamp(28px, 5vw, 70px) 38px;
	}

	.hero-name {
		margin: 0 0 16px;
		color: var(--jl-on-dark-dim);
	}

	.hero h1 {
		max-width: 12ch;
		font-size: clamp(3.7rem, 6.5vw, 6.2rem);
		text-shadow: 7px 7px 0 var(--jl-red);
	}

	.hero h1 span,
	.hero h1 em {
		display: block;
	}

	.hero h1 em {
		color: var(--jl-yellow);
		font-style: normal;
	}

	.hero-lead {
		max-width: 61ch;
		margin: 20px 0 0;
		color: var(--jl-on-dark);
		font-size: clamp(0.94rem, 1.35vw, 1.08rem);
		line-height: 1.65;
	}

	.hero-actions,
	.contact-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
		margin-top: 22px;
	}

	.action {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: 46px;
		padding: 11px 16px;
		border: 3px solid var(--jl-ink);
		text-decoration: none;
		transition:
			transform var(--jl-motion-panel) ease,
			box-shadow var(--jl-motion-panel) ease;
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
		color: var(--jl-white);
		background: transparent;
		border-color: var(--jl-white);
		box-shadow: 5px 5px 0 var(--jl-blue);
	}

	.hero-art {
		position: relative;
		z-index: 2;
		min-width: 0;
		height: 100%;
		min-height: 0;
		overflow: hidden;
		border-left: var(--jl-border) solid var(--jl-ink);
		clip-path: polygon(11% 0, 100% 0, 100% 100%, 0 100%);
	}

	.hero-art::after {
		position: absolute;
		inset: 0;
		background: linear-gradient(180deg, transparent 50%, rgb(5 7 12 / 0.58));
		content: '';
		pointer-events: none;
	}

	.hero-art img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		/* The source is portrait-oriented inside a landscape crop. Its focal line
		   keeps Julian's face beside the bubble while the image remains anchored
		   to the panel rather than drifting with the intrinsic aspect ratio. */
		object-position: 52% 18%;
		filter: saturate(1.04) contrast(1.04);
	}

	:global(.hero-bubble) {
		top: 44px;
		right: 30px;
		z-index: 4;
		transform: rotate(3deg);
	}

	.hero-facts {
		z-index: 5;
		display: grid;
		grid-column: 1 / -1;
		grid-template-columns: repeat(3, 1fr);
		margin: 0;
		padding: 0;
		color: var(--jl-ink);
		background: var(--jl-yellow);
		border-top: var(--jl-border) solid var(--jl-ink);
		list-style: none;
	}

	.hero-facts li {
		display: flex;
		align-items: center;
		gap: 18px;
		min-width: 0;
		padding: 12px clamp(18px, 3vw, 30px);
	}

	.hero-facts li + li {
		border-left: var(--jl-border) solid var(--jl-ink);
	}

	.hero-facts strong {
		flex: 0 0 auto;
		font-size: clamp(1.8rem, 3.2vw, 3rem);
	}

	.hero-facts span {
		font-size: clamp(0.58rem, 1vw, 0.7rem);
		line-height: 1.45;
	}

	/* ---------------------------------------------------------- personal --- */

	.personal {
		grid-template-columns: minmax(0, 0.87fr) minmax(0, 1.13fr);
		padding-inline: var(--jl-gutter);
	}

	:global(.jl-panel.origin-panel) {
		min-height: 500px;
		color: var(--jl-white);
		background: linear-gradient(145deg, #111b2c, #263d64);
	}

	.origin-copy {
		display: flex;
		flex-direction: column;
		justify-content: end;
		min-height: 500px;
		padding: 124px clamp(26px, 4vw, 52px) clamp(34px, 5vw, 58px);
	}

	.origin-copy h2 {
		margin-bottom: 24px;
		font-size: clamp(3rem, 5.6vw, 5.5rem);
	}

	.origin-copy h2 span,
	.origin-copy h2 em {
		display: block;
	}

	.origin-copy h2 em {
		color: var(--jl-red);
		font-style: normal;
		text-shadow: 3px 3px 0 var(--jl-white);
	}

	.origin-copy p {
		max-width: 56ch;
		margin: 0;
		color: var(--jl-on-dark);
		line-height: 1.65;
	}

	:global(.jl-panel.powers-panel) {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 4px;
		padding: 4px;
		background: var(--jl-ink);
	}

	.power {
		display: flex;
		flex-direction: column;
		justify-content: end;
		min-height: 242px;
		padding: clamp(24px, 3.5vw, 42px);
		background: var(--jl-blue);
	}

	.power[data-power='2'] {
		--jl-display-stroke: var(--jl-white);
		background: var(--jl-yellow);
	}

	.power[data-power='3'] {
		color: var(--jl-white);
		background: var(--jl-red);
	}

	.power[data-power='4'] {
		color: var(--jl-white);
		background: var(--jl-navy);
	}

	.power-index {
		margin-bottom: auto;
		opacity: 0.68;
	}

	.power strong {
		font-size: clamp(1.7rem, 3.2vw, 2.8rem);
	}

	.power p {
		max-width: 32ch;
		margin: 10px 0 0;
		font-size: 0.8rem;
		line-height: 1.5;
	}

	/* ------------------------------------------------------------- worlds --- */

	.worlds {
		position: relative;
		margin-top: var(--jl-gutter);
		padding: clamp(76px, 9vw, 124px) clamp(18px, 5vw, 74px) clamp(82px, 9vw, 118px);
		overflow: hidden;
		color: var(--jl-white);
		background:
			radial-gradient(circle at 50% 24%, rgb(20 120 212 / 0.28), transparent 29%),
			linear-gradient(145deg, var(--jl-ink), #131b36 58%, #2a112a);
		border-block: var(--jl-border) solid var(--jl-ink);
		isolation: isolate;
	}

	.worlds::before {
		position: absolute;
		inset: 0;
		z-index: -1;
		background-image:
			radial-gradient(circle at 2px 2px, rgb(255 255 255 / 0.14) 1.3px, transparent 1.5px),
			radial-gradient(circle at 2px 2px, rgb(255 210 63 / 0.12) 1px, transparent 1.4px);
		background-position:
			0 0,
			9px 13px;
		background-size:
			23px 23px,
			31px 31px;
		content: '';
	}

	.worlds-heading {
		display: grid;
		grid-template-columns: minmax(0, 1.2fr) minmax(280px, 0.8fr);
		align-items: end;
		gap: clamp(28px, 6vw, 84px);
		margin: 0 auto clamp(52px, 7vw, 88px);
	}

	.worlds-eyebrow {
		margin: 0 0 14px;
		color: #63ddff;
	}

	.worlds-heading h2 {
		font-size: clamp(3.8rem, 7.7vw, 7.6rem);
		text-shadow: 6px 6px 0 var(--jl-red);
	}

	.worlds-heading h2 span,
	.worlds-heading h2 em {
		display: block;
	}

	.worlds-heading h2 em {
		color: var(--jl-yellow);
		font-style: normal;
	}

	.worlds-heading > p {
		max-width: 50ch;
		margin: 0;
		color: var(--jl-on-dark);
		line-height: 1.7;
	}

	.world-list {
		display: grid;
		grid-template-columns: repeat(12, minmax(0, 1fr));
		align-items: stretch;
		gap: clamp(18px, 2.4vw, 30px);
		margin: 0 auto;
	}

	.world {
		position: relative;
		display: grid;
		grid-column: span 6;
		grid-template: 1fr / 1fr;
		aspect-ratio: 1.12;
		overflow: hidden;
		color: var(--jl-white);
		background: var(--world-base);
		border: 4px solid var(--jl-white);
		box-shadow: 9px 9px 0 var(--world-accent);
		isolation: isolate;
	}

	.world::before {
		position: absolute;
		inset: 0;
		z-index: -1;
		background:
			radial-gradient(
				circle at 2px 2px,
				color-mix(in srgb, var(--world-on) 22%, transparent) 1.3px,
				transparent 1.5px
			),
			linear-gradient(
				125deg,
				transparent 0 62%,
				color-mix(in srgb, var(--world-accent) 24%, transparent) 62.4%
			);
		background-size:
			14px 14px,
			auto;
		content: '';
		mask-image: linear-gradient(110deg, #000, transparent 72%);
	}

	/* The archive reads like an editor's contact sheet, not a staircase. Large
	   landscape dossiers interrupt upright covers, and their reading order stays
	   intact in the DOM. */
	.world[data-layout='1'],
	.world[data-layout='4'],
	.world[data-layout='5'] {
		grid-column: span 7;
		aspect-ratio: 1.32;
	}

	.world[data-layout='2'],
	.world[data-layout='3'],
	.world[data-layout='6'] {
		grid-column: span 5;
		aspect-ratio: 0.94;
	}

	.world[data-layout='4'] {
		grid-column: span 7;
	}

	.world[data-layout='5'] {
		grid-column: 1 / span 7;
	}

	.world[data-layout='6'] {
		grid-column: 8 / span 5;
	}

	.world-copy {
		position: relative;
		z-index: 3;
		display: flex;
		grid-area: 1 / 1;
		flex-direction: column;
		align-items: start;
		align-self: end;
		min-width: 0;
		padding: clamp(72px, 9vw, 130px) clamp(24px, 3.5vw, 48px) clamp(26px, 3.5vw, 46px);
	}

	.world[data-layout='1'] .world-copy,
	.world[data-layout='4'] .world-copy,
	.world[data-layout='5'] .world-copy {
		width: min(68%, 640px);
	}

	.world[data-layout='4'] .world-copy {
		justify-self: end;
	}

	.world-kicker {
		margin: 0 0 15px;
		color: var(--world-accent);
		filter: saturate(1.28) brightness(1.18);
	}

	.world h3 {
		max-width: 11ch;
		font-size: clamp(2.5rem, 4.5vw, 4.7rem);
		--jl-display-stroke: var(--jl-ink);
		text-shadow: 4px 4px 0 var(--world-accent);
	}

	.world[data-long] h3 {
		max-width: 15ch;
		font-size: clamp(2.05rem, 3.7vw, 3.7rem);
	}

	.world-tagline {
		max-width: 54ch;
		margin: 22px 0 0;
		font-size: 0.9rem;
		line-height: 1.65;
		color: var(--jl-white);
		opacity: 0.9;
	}

	.world-stack {
		display: flex;
		flex-wrap: wrap;
		gap: 7px;
		margin: 24px 0 0;
		padding: 0;
		list-style: none;
	}

	.world-stack li {
		padding: 5px 7px;
		color: var(--world-on-accent);
		background: var(--world-accent);
		font-size: 0.58rem;
	}

	.world-link {
		display: inline-flex;
		gap: 10px;
		align-items: center;
		margin-top: 28px;
		padding-bottom: 5px;
		border-bottom: 3px solid var(--world-accent);
		text-decoration: none;
	}

	.world-link span {
		font-size: 1rem;
		transition: transform var(--jl-motion-panel) ease;
	}

	.world-link:hover span {
		transform: translate(3px, -3px);
	}

	.world-art {
		position: relative;
		display: block;
		grid-area: 1 / 1;
		min-width: 0;
		overflow: hidden;
		background: color-mix(in srgb, var(--world-accent) 50%, var(--world-base));
	}

	.world-art::after {
		position: absolute;
		inset: 0;
		background: linear-gradient(
			to top,
			rgb(5 7 12 / 0.9) 0%,
			rgb(5 7 12 / 0.72) 24%,
			rgb(5 7 12 / 0.4) 48%,
			rgb(5 7 12 / 0.12) 70%,
			transparent 88%
		);
		content: '';
	}

	.world-art img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: center top;
		transition:
			transform 500ms var(--jl-paper-ease),
			filter 500ms var(--jl-paper-ease);
	}

	.world-art:hover img {
		filter: saturate(1.12) contrast(1.04);
		transform: scale(1.035);
	}

	.world-number {
		position: absolute;
		right: 22px;
		bottom: 16px;
		z-index: 3;
		color: var(--jl-white);
		font-size: clamp(4rem, 8vw, 7rem);
		text-shadow: 4px 4px 0 var(--world-accent);
	}

	.archive-signal {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 28px;
		margin: clamp(66px, 8vw, 100px) auto 0;
		padding: 24px 28px;
		color: var(--jl-ink);
		background: var(--jl-yellow);
		border: 4px solid var(--jl-white);
		box-shadow: 8px 8px 0 var(--jl-red);
	}

	.archive-signal p {
		max-width: 64ch;
		margin: 0;
		line-height: 1.55;
	}

	.archive-signal a {
		flex: 0 0 auto;
		font-weight: 700;
		text-decoration-thickness: 2px;
		text-underline-offset: 5px;
	}

	/* ------------------------------------------------------------- method --- */

	.method {
		grid-template-columns: minmax(0, 1.1fr) minmax(310px, 0.9fr);
		padding-inline: var(--jl-gutter);
	}

	:global(.jl-panel.method-intro) {
		min-height: 430px;
		color: var(--jl-white);
		background: linear-gradient(145deg, var(--jl-red), #8d1734);
	}

	.method-copy {
		display: flex;
		flex-direction: column;
		justify-content: end;
		min-height: 430px;
		padding: 126px clamp(28px, 5vw, 62px) clamp(42px, 6vw, 68px);
	}

	.method-copy h2 {
		max-width: 10ch;
		font-size: clamp(3.2rem, 6vw, 6rem);
		text-shadow: 5px 5px 0 var(--jl-ink);
	}

	.method-copy p {
		max-width: 48ch;
		margin: 24px 0 0;
		line-height: 1.6;
	}

	:global(.jl-panel.method-steps) {
		--jl-display-stroke: var(--jl-white);
		color: var(--jl-ink);
		background: var(--jl-yellow);
	}

	:global(.jl-panel.method-steps) ol {
		display: grid;
		align-content: center;
		min-height: 430px;
		margin: 0;
		padding: 30px clamp(24px, 4vw, 46px);
		list-style: none;
	}

	:global(.jl-panel.method-steps) li {
		display: grid;
		grid-template-columns: auto 1fr;
		align-items: center;
		gap: 18px;
		padding-block: 22px;
	}

	:global(.jl-panel.method-steps) li + li {
		border-top: 4px solid var(--jl-ink);
	}

	.step-number {
		font-size: clamp(2.5rem, 5vw, 4.8rem);
		opacity: 0.42;
	}

	:global(.jl-panel.method-steps) strong {
		font-size: 0.78rem;
	}

	:global(.jl-panel.method-steps) p {
		margin: 7px 0 0;
		font-size: 0.82rem;
		line-height: 1.5;
	}

	:global(.jl-panel.now-panel) {
		display: flex;
		grid-column: 1 / -1;
		align-items: end;
		justify-content: space-between;
		gap: 42px;
		min-height: 290px;
		padding: clamp(34px, 6vw, 72px);
		color: var(--jl-white);
		background:
			linear-gradient(140deg, transparent 0 64%, rgb(255 210 63 / 0.24) 64.4%), var(--jl-blue-deep);
	}

	.now-status {
		align-self: start;
		padding: 8px 10px;
		color: var(--jl-ink);
		background: var(--jl-yellow);
		border: 3px solid var(--jl-ink);
		box-shadow: 4px 4px 0 var(--jl-red);
	}

	:global(.jl-panel.now-panel) h2 {
		font-size: clamp(3.5rem, 7vw, 6.8rem);
		text-shadow: 5px 5px 0 var(--jl-ink);
	}

	:global(.jl-panel.now-panel) p {
		max-width: 54ch;
		margin: 20px 0 0;
		color: var(--jl-on-dark);
		line-height: 1.6;
	}

	/* ------------------------------------------------------------ contact --- */

	.contact {
		position: relative;
		margin-top: var(--jl-gutter);
		padding: clamp(66px, 9vw, 116px) clamp(28px, 8vw, 108px);
		overflow: hidden;
		color: var(--jl-white);
		background: var(--jl-ink);
		border-block: var(--jl-border) solid var(--jl-ink);
		isolation: isolate;
	}

	.contact::before {
		position: absolute;
		right: -24px;
		bottom: -0.22em;
		z-index: -1;
		color: rgb(255 255 255 / 0.055);
		font-family: var(--jl-font-display);
		font-size: clamp(8rem, 20vw, 18rem);
		line-height: 0.8;
		content: '1227';
	}

	.contact-caption {
		margin: 0 0 24px;
		color: var(--jl-yellow);
	}

	.contact h2 {
		max-width: 11ch;
		font-size: clamp(4rem, 8vw, 8rem);
		text-shadow: 6px 6px 0 var(--jl-red);
	}

	.contact > p:not(.contact-caption) {
		max-width: 60ch;
		margin: 26px 0 0;
		color: var(--jl-on-dark);
		line-height: 1.65;
	}

	/* --------------------------------------------------------- responsive --- */

	@media (max-width: 980px) {
		.hero {
			grid-template-columns: minmax(0, 1fr) minmax(310px, 0.82fr);
		}

		.personal,
		.method {
			grid-template-columns: 1fr;
		}

		.world-copy {
			padding: 32px;
		}

		.world h3 {
			font-size: clamp(2.4rem, 5vw, 4.2rem);
		}
	}

	@media (max-width: 760px) {
		.landing-shell {
			box-shadow: none;
		}

		.hero {
			grid-template-columns: 1fr;
			grid-template-rows: auto minmax(400px, 58vh) auto;
			height: auto;
			min-height: 0;
			max-height: none;
		}

		.hero-copy {
			min-height: 480px;
			padding: 96px 24px 42px;
		}

		.hero h1 {
			font-size: clamp(3.6rem, 15vw, 5.7rem);
		}

		.hero-art {
			height: 100%;
			min-height: 0;
			border-top: var(--jl-border) solid var(--jl-ink);
			border-left: 0;
			clip-path: none;
		}

		.hero-art img {
			object-position: center 18%;
		}

		.hero-facts {
			grid-template-columns: 1fr;
		}

		.hero-facts li + li {
			border-top: var(--jl-border) solid var(--jl-ink);
			border-left: 0;
		}

		.personal {
			padding-inline: var(--jl-gutter);
		}

		:global(.jl-panel.powers-panel) {
			grid-template-columns: 1fr;
		}

		.power {
			min-height: 190px;
		}

		.worlds {
			padding-inline: 14px;
		}

		.worlds-heading {
			grid-template-columns: 1fr;
		}

		.worlds-heading h2 {
			font-size: clamp(3.7rem, 16vw, 5.5rem);
		}

		.world,
		.world[data-layout='1'],
		.world[data-layout='2'],
		.world[data-layout='3'],
		.world[data-layout='4'],
		.world[data-layout='5'],
		.world[data-layout='6'] {
			grid-column: 1 / -1;
			grid-template-columns: 1fr;
			grid-template-rows: auto auto;
			aspect-ratio: auto;
			box-shadow: 8px 8px 0 var(--world-accent);
		}

		.world-copy,
		.world[data-layout='1'] .world-copy,
		.world[data-layout='4'] .world-copy,
		.world[data-layout='5'] .world-copy {
			grid-column: 1;
			grid-row: 2;
			justify-self: stretch;
			width: auto;
			padding: 34px 24px 40px;
			background: var(--world-base);
		}

		/* FormarPro and Gym Vancouver use paper-coloured world palettes. Their
		   requested white cover lettering needs an inked mobile information card,
		   while dark worlds can keep their own base colour. */
		.world[data-copy-tone='ink'] .world-copy {
			background: color-mix(in oklab, var(--world-accent) 18%, var(--jl-ink));
		}

		.world-art,
		.world[data-layout='1'] .world-art,
		.world[data-layout='4'] .world-art,
		.world[data-layout='5'] .world-art {
			grid-column: 1;
			grid-row: 1;
			height: min(112vw, 560px);
			border-right: 0;
			border-bottom: 4px solid var(--jl-white);
			border-left: 0;
		}

		.world h3,
		.world[data-long] h3 {
			max-width: 14ch;
			font-size: clamp(2.6rem, 12vw, 4.2rem);
		}

		.world[data-long] h3 {
			font-size: clamp(2.2rem, 10vw, 3.6rem);
		}

		.archive-signal {
			align-items: start;
			flex-direction: column;
		}

		:global(.jl-panel.now-panel) {
			align-items: start;
			flex-direction: column;
		}

		.contact-actions {
			align-items: stretch;
			flex-direction: column;
		}

		.contact-actions .action {
			width: 100%;
		}
	}

	@media (max-width: 430px) {
		.hero-copy {
			min-height: 450px;
			padding-inline: 18px;
		}

		.hero-actions {
			align-items: stretch;
			flex-direction: column;
		}

		.hero-actions .action {
			width: 100%;
		}

		.origin-copy {
			padding-inline: 24px;
		}

		.worlds {
			padding-inline: 10px;
		}

		.world-copy {
			padding-inline: 20px;
		}
	}
</style>
