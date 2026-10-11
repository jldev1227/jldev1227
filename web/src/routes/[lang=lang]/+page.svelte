<script lang="ts">
	import '@fontsource-variable/inter';
	import '@fontsource/anton/400.css';
	import { Bubble, Caption, Masthead, PageFooter, Panel, Seo } from '$lib/components';
	import { projects } from '$content/projects';
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
	import { missionPath, path, translator } from '$i18n';
	import { ART_SIZES, responsiveArt } from '$lib/images';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const locale = $derived(data.locale);
	const t = $derived(translator(locale));

	/** Responsive full-bleed hero art is preloaded below. */
	const desktopArt = responsiveArt('/art/julian-3d-hero-v3.webp', [768, 1024, 1536], 1536);
	const mobileArt = responsiveArt('/art/julian-3d-hero-mobile-v2.webp', [384, 576, 768]);
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
	<link
		rel="preload"
		as="image"
		type="image/avif"
		media="(min-width: 761px)"
		fetchpriority="high"
		imagesrcset={desktopArt.avif}
		imagesizes={ART_SIZES.hero}
	/>
	<link
		rel="preload"
		as="image"
		type="image/avif"
		media="(max-width: 760px)"
		fetchpriority="high"
		imagesrcset={mobileArt.avif}
		imagesizes="100vw"
	/>
</svelte:head>

<div class="landing-shell">
	<Masthead {locale} />

	<main id="content">
		<!-- The portfolio opens on the person, not the archive. -->
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
					<source
						media="(max-width: 760px)"
						type="image/avif"
						srcset={mobileArt.avif}
						sizes="100vw"
					/>
					<source
						media="(max-width: 760px)"
						type="image/webp"
						srcset={mobileArt.webp}
						sizes="100vw"
					/>
					<source type="image/avif" srcset={desktopArt.avif} sizes={ART_SIZES.hero} />
					<source type="image/webp" srcset={desktopArt.webp} sizes={ART_SIZES.hero} />
					<img
						src={desktopArt.src}
						alt={origin.portraitAlt[locale]}
						width="1681"
						height="936"
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
				{#each projects as project (project.slug)}
					<article class="world">
						<span class="world-number jl-display" aria-hidden="true">{project.number}</span>
						<div class="world-copy">
							<p class="world-kicker jl-kicker">{project.kicker[locale]}</p>
							<h3 class="jl-display">{project.title}</h3>
							<p class="world-tagline">{project.tagline[locale]}</p>
						</div>
						<div class="world-meta">
							<ul class="world-stack" aria-label={t('missions.technologies')}>
								{#each project.stack.slice(0, 4) as tool (tool)}
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
					</article>
				{/each}
			</div>
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
		overflow-x: clip;
	}

	.hero {
		--hero-paper: #fff4ee;
		--hero-muted: rgb(255 244 238 / 0.72);
		box-sizing: border-box;
		position: relative;
		isolation: isolate;
		display: grid;
		min-height: clamp(700px, calc(100svh - 58px), 940px);
		margin-inline: 0;
		padding: clamp(64px, 9vh, 108px) clamp(24px, 7.4vw, 116px) 150px;
		overflow: hidden;
		align-items: center;
		color: var(--hero-paper);
	}

	.hero-copy {
		position: relative;
		z-index: 2;
		width: min(57%, 650px);
		padding-bottom: 54px;
	}

	.hero-copy :global(.jl-caption) {
		display: inline-flex;
		max-width: min(100%, 410px);
		margin: 0 0 32px;
		padding: 10px 14px;
		border: 1px solid rgb(255 244 238 / 0.23);
		border-radius: 2px;
		background: rgb(43 0 7 / 0.28);
		color: var(--hero-muted);
		font:
			600 0.67rem/1.45 'Inter',
			sans-serif;
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}

	.hero-name {
		margin: 0 0 16px;
		color: #ffc3a9;
		font:
			700 0.78rem/1.4 'Inter',
			sans-serif;
		letter-spacing: 0.2em;
		text-transform: uppercase;
	}

	.hero h1 {
		max-width: 660px;
		margin: 0;
		font:
			400 clamp(4rem, 6.1vw, 6.3rem) / 0.94 'Anton',
			Impact,
			sans-serif;
		letter-spacing: -0.035em;
		text-transform: uppercase;
		text-wrap: balance;
		text-shadow: 0 4px 24px rgb(31 0 6 / 0.18);
	}

	.hero h1 span,
	.hero h1 em {
		display: block;
		font-style: normal;
	}

	.hero h1 em {
		color: #ffd390;
	}

	.hero-lead {
		max-width: 510px;
		margin: 26px 0 0;
		color: var(--hero-muted);
		font:
			400 clamp(1rem, 1.25vw, 1.12rem) / 1.75 'Inter',
			sans-serif;
	}

	.hero-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
		margin-top: 34px;
	}

	.hero-actions :global(.action) {
		display: inline-flex;
		min-height: 48px;
		align-items: center;
		justify-content: center;
		gap: 12px;
		padding: 0 20px;
		border: 1px solid rgb(255 244 238 / 0.45);
		border-radius: 3px;
		color: var(--hero-paper);
		font:
			700 0.72rem/1 'Inter',
			sans-serif;
		letter-spacing: 0.11em;
		text-decoration: none;
		text-transform: uppercase;
		transition:
			background-color 160ms ease,
			color 160ms ease,
			transform 160ms ease;
	}

	.hero-actions :global(.action:hover) {
		transform: translateY(-2px);
	}

	.hero-actions :global(.action-primary) {
		border-color: #ffd390;
		background: #ffd390;
		color: #4a0710;
	}

	.hero-actions :global(.action-primary:hover) {
		background: #ffe4b4;
	}

	.hero-actions :global(.action-secondary:hover) {
		background: rgb(255 244 238 / 0.12);
	}

	.hero-art {
		position: absolute;
		z-index: 1;
		inset: 0;
		pointer-events: none;
	}

	.hero-art picture {
		display: block;
		width: 100%;
		height: 100%;
	}

	.hero-art img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: center center;
	}

	.hero-art :global(.hero-bubble) {
		position: absolute;
		top: 7%;
		right: 3%;
		max-width: 200px;
		box-sizing: border-box;
		margin: 0;
		padding: 13px 17px;
		border: 1px solid rgb(255 255 255 / 0.5);
		border-radius: 999px;
		background: rgb(255 244 238 / 0.96);
		box-shadow: 0 16px 40px rgb(34 0 5 / 0.28);
		color: #590711;
		font:
			700 0.76rem/1.4 'Inter',
			sans-serif;
		text-align: center;
	}

	.hero-facts {
		position: absolute;
		z-index: 3;
		bottom: 32px;
		left: clamp(24px, 7.4vw, 116px);
		display: grid;
		width: min(650px, calc(100% - 48px));
		grid-template-columns: 0.72fr 0.72fr 1.56fr;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.hero-facts li {
		display: flex;
		min-width: 0;
		flex-direction: column;
		gap: 5px;
		padding: 0 18px;
	}

	.hero-facts li:first-child {
		padding-left: 0;
	}

	.hero-facts li + li {
		border-left: 1px solid rgb(255 244 238 / 0.28);
	}

	.hero-facts strong {
		color: var(--hero-paper);
		font:
			400 1.75rem/1 'Anton',
			Impact,
			sans-serif;
	}

	.hero-facts span {
		color: var(--hero-muted);
		font:
			500 0.62rem/1.4 'Inter',
			sans-serif;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	@media (max-width: 760px) {
		.hero {
			min-height: 920px;
			padding: 54px 24px 156px;
			align-items: start;
		}

		.hero-copy {
			width: min(100%, 570px);
			padding-bottom: 0;
		}

		.hero-copy :global(.jl-caption) {
			margin-bottom: 24px;
			font-size: 0.58rem;
		}

		.hero-name {
			font-size: 0.68rem;
		}

		.hero h1 {
			max-width: 570px;
			font-size: clamp(3rem, 13vw, 4.3rem);
		}

		.hero h1 em {
			font-size: 0.9em;
		}

		.hero-lead {
			max-width: 490px;
			margin-top: 18px;
			font-size: 0.95rem;
			line-height: 1.6;
		}

		.hero-actions {
			gap: 9px;
			margin-top: 24px;
		}

		.hero-actions :global(.action) {
			min-height: 44px;
			padding-inline: 14px;
			font-size: 0.63rem;
		}

		.hero-art {
			inset: 0;
		}

		.hero-art img {
			height: 108%;
			object-position: 52% center;
		}

		.hero-art :global(.hero-bubble) {
			top: 77%;
			right: 8%;
			max-width: 150px;
			padding: 10px 13px;
			font-size: 0.66rem;
		}

		.hero-facts {
			bottom: 22px;
			left: 24px;
			width: calc(100% - 48px);
			grid-template-columns: 0.72fr 0.8fr 1.48fr;
			padding: 12px 10px;
			border: 1px solid rgb(255 244 238 / 0.2);
			border-radius: 4px;
			background: rgb(55 0 8 / 0.68);
			backdrop-filter: blur(14px);
		}

		.hero-facts li {
			gap: 5px;
			padding-inline: 10px;
		}

		.hero-facts li:first-child {
			padding-left: 4px;
		}

		.hero-facts strong {
			font-size: 1.45rem;
		}

		.hero-facts span {
			font-size: 0.53rem;
			letter-spacing: 0.04em;
		}
	}

	@media (max-width: 380px) {
		.hero {
			padding-inline: 18px;
		}

		.hero h1 {
			font-size: clamp(2.6rem, 12.7vw, 3.3rem);
		}

		.hero-facts {
			left: 18px;
			width: calc(100% - 36px);
		}
	}

	.personal {
		--origin-ink: #720914;
		--origin-muted: #69343b;
		position: relative;
		isolation: isolate;
		display: grid;
		grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
		gap: clamp(32px, 5vw, 76px);
		padding: clamp(64px, 8vw, 110px) clamp(24px, 7.4vw, 116px) clamp(76px, 9vw, 124px);
		overflow: hidden;
		background:
			radial-gradient(ellipse at 75% 34%, rgb(255 255 255 / 0.5), transparent 38%),
			radial-gradient(ellipse at 13% 13%, rgb(255 222 152 / 0.58), transparent 32%),
			linear-gradient(135deg, #fff5dc 0%, #ffecbd 52%, #fff1d0 100%);
		color: var(--origin-ink);
	}

	.personal :global(.jl-panel.origin-panel) {
		display: flex;
		min-width: 0;
		flex-direction: column;
		justify-content: center;
		padding-block: 10px;
		background: transparent;
		color: var(--origin-ink);
	}

	.personal :global(.jl-panel.origin-panel .jl-caption) {
		width: fit-content;
		max-width: min(100%, 430px);
		margin-bottom: 28px;
		color: #9c1021;
		font:
			700 0.69rem/1.5 'Inter',
			sans-serif;
		letter-spacing: 0.14em;
		text-transform: uppercase;
	}

	.origin-copy {
		display: flex;
		flex-direction: column;
	}

	.origin-copy h2 {
		max-width: 11ch;
		font:
			400 clamp(3.6rem, 5.5vw, 5.3rem) / 0.96 'Anton',
			Impact,
			sans-serif;
		letter-spacing: -0.025em;
		text-shadow: 0 4px 24px rgb(90 0 12 / 0.1);
		text-transform: uppercase;
		text-wrap: balance;
	}

	.origin-copy h2 span,
	.origin-copy h2 em {
		display: block;
		font-style: normal;
	}

	.origin-copy h2 em {
		color: #bd1328;
	}

	.origin-copy > p {
		max-width: 54ch;
		margin-top: 24px;
		color: var(--origin-muted);
		font:
			400 1rem/1.75 'Inter',
			sans-serif;
	}

	.personal :global(.jl-panel.powers-panel) {
		display: grid;
		min-width: 0;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 13px;
		align-content: center;
		background: transparent;
	}

	.power {
		position: relative;
		display: flex;
		min-width: 0;
		min-height: 194px;
		flex-direction: column;
		justify-content: space-between;
		padding: clamp(18px, 2.1vw, 28px);
		overflow: hidden;
		border: 1px solid rgb(114 9 20 / 0.17);
		border-radius: 6px;
		background: linear-gradient(145deg, rgb(255 255 255 / 0.68), rgb(255 239 199 / 0.62));
		box-shadow:
			inset 0 1px 0 rgb(255 255 255 / 0.88),
			0 18px 42px rgb(81 2 15 / 0.1);
		backdrop-filter: blur(14px);
		color: var(--origin-ink);
	}

	.power::before {
		position: absolute;
		top: 22px;
		bottom: 22px;
		left: 0;
		width: 2px;
		background: linear-gradient(180deg, #bd1328, rgb(189 19 40 / 0.24));
		content: '';
		pointer-events: none;
	}

	.power-index {
		color: #a51224;
		font:
			600 0.63rem/1 ui-monospace,
			monospace;
		letter-spacing: 0.1em;
	}

	.power strong {
		margin-top: 28px;
		color: var(--origin-ink);
		font:
			400 clamp(1.3rem, 2vw, 1.8rem) / 1.05 'Anton',
			Impact,
			sans-serif;
		letter-spacing: 0.015em;
		text-transform: uppercase;
		text-wrap: balance;
	}

	.power p {
		margin-top: 9px;
		color: var(--origin-muted);
		font:
			500 0.76rem/1.5 'Inter',
			sans-serif;
	}

	@media (max-width: 760px) {
		.personal {
			grid-template-columns: minmax(0, 1fr);
			gap: 36px;
			padding: 64px 22px 76px;
		}

		.personal :global(.jl-panel.origin-panel) {
			padding-block: 0;
		}

		.origin-copy {
			min-height: 0;
		}

		.origin-copy h2 {
			font-size: clamp(3.4rem, 10vw, 4.8rem);
		}

		.personal :global(.jl-panel.powers-panel) {
			gap: 12px;
		}

		.power {
			min-height: 184px;
			padding: 20px;
		}
	}

	@media (max-width: 430px) {
		.personal {
			gap: 30px;
			padding: 54px 18px 64px;
		}

		.personal :global(.jl-panel.origin-panel .jl-caption) {
			margin-bottom: 20px;
			font-size: 0.62rem;
		}

		.origin-copy h2 {
			font-size: clamp(3.1rem, 12vw, 3.8rem);
		}

		.power {
			min-height: 174px;
			padding: 16px 15px;
		}

		.power strong {
			font-size: 1.25rem;
		}

		.power p {
			font-size: 0.69rem;
		}
	}

	.worlds {
		position: relative;
		isolation: isolate;
		padding: clamp(92px, 10vw, 150px) clamp(24px, 7.4vw, 116px) clamp(100px, 10vw, 150px);
		overflow: hidden;
		background:
			radial-gradient(ellipse at 100% 0%, rgb(221 83 94 / 0.42), transparent 38%),
			linear-gradient(155deg, #710c1b, #a33544 64%, #a33544);
		color: #fff1d0;
	}

	.worlds::before {
		position: absolute;
		z-index: -1;
		top: -130px;
		right: -230px;
		width: min(85vw, 950px);
		aspect-ratio: 1;
		background: url('/art/spider-web.svg') center / contain no-repeat;
		opacity: 0.1;
		content: '';
		pointer-events: none;
	}

	.worlds-heading,
	.world-list {
		width: min(100%, 1450px);
		margin-inline: auto;
	}

	.worlds-heading {
		display: grid;
		grid-template-columns: minmax(0, 1.15fr) minmax(270px, 0.85fr);
		gap: clamp(30px, 6vw, 90px);
		align-items: end;
	}

	.worlds-eyebrow {
		margin-bottom: 22px;
		color: #ffd390;
		font:
			700 0.7rem/1.3 'Inter',
			sans-serif;
		letter-spacing: 0.15em;
		text-transform: uppercase;
	}

	.worlds-heading h2 {
		font:
			400 clamp(3.6rem, 6.8vw, 7rem)/0.97 'Anton',
			Impact,
			sans-serif;
		letter-spacing: -0.025em;
		text-transform: uppercase;
		text-wrap: balance;
	}

	.worlds-heading h2 span,
	.worlds-heading h2 em {
		display: block;
		font-style: normal;
	}

	.worlds-heading h2 em {
		color: #ffd390;
	}

	.worlds-heading > p {
		max-width: 42ch;
		padding-bottom: 8px;
		color: rgb(255 241 208 / 0.78);
		font:
			400 clamp(1rem, 1.2vw, 1.12rem)/1.7 'Inter',
			sans-serif;
	}

	.world-list {
		margin-top: clamp(70px, 8vw, 120px);
		border-top: 1px solid rgb(255 241 208 / 0.3);
	}

	.world {
		position: relative;
		display: grid;
		grid-template-columns: clamp(64px, 8vw, 120px) minmax(0, 1fr) minmax(190px, 0.42fr);
		gap: clamp(20px, 3vw, 46px);
		padding: clamp(30px, 3.3vw, 48px) 0;
		border-bottom: 1px solid rgb(255 241 208 / 0.3);
		transition:
			background-color 180ms ease,
			padding-inline 180ms ease;
	}

	.world-number {
		color: rgb(255 211 144 / 0.67);
		font:
			400 clamp(2.5rem, 4.2vw, 4.4rem)/1 'Anton',
			Impact,
			sans-serif;
	}

	.world-copy,
	.world-meta {
		min-width: 0;
	}

	.world-kicker {
		margin-bottom: 12px;
		color: #ffd390;
		font:
			700 0.65rem/1.4 'Inter',
			sans-serif;
		letter-spacing: 0.13em;
		text-transform: uppercase;
	}

	.world-copy h3 {
		max-width: 18ch;
		font:
			400 clamp(2.1rem, 3.7vw, 4rem)/1.03 'Anton',
			Impact,
			sans-serif;
		letter-spacing: -0.012em;
		overflow-wrap: anywhere;
		text-transform: uppercase;
	}

	.world-tagline {
		max-width: 65ch;
		margin-top: 15px;
		color: rgb(255 241 208 / 0.79);
		font:
			400 clamp(0.92rem, 1vw, 1.02rem)/1.65 'Inter',
			sans-serif;
	}

	.world-meta {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		justify-content: space-between;
		gap: 26px;
		padding-top: 4px;
	}

	.world-stack {
		display: flex;
		flex-wrap: wrap;
		gap: 7px;
		list-style: none;
	}

	.world-stack li {
		padding: 7px 9px;
		border: 1px solid rgb(255 241 208 / 0.23);
		border-radius: 3px;
		color: rgb(255 241 208 / 0.76);
		font:
			700 0.57rem/1 'Inter',
			sans-serif;
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}

	.world-link {
		display: inline-flex;
		align-items: center;
		gap: 18px;
		padding-bottom: 5px;
		border-bottom: 1px solid #ffd390;
		color: #ffd390;
		font:
			800 0.7rem/1.3 'Inter',
			sans-serif;
		letter-spacing: 0.1em;
		text-decoration: none;
		text-transform: uppercase;
	}

	.world-link span {
		font-size: 1.1rem;
		transition: transform 180ms ease;
	}

	.world-link:focus-visible {
		outline: 2px solid #ffd390;
		outline-offset: 6px;
	}

	@media (hover: hover) and (pointer: fine) {
		.world:hover {
			padding-inline: 18px;
			background: rgb(255 241 208 / 0.055);
		}

		.world-link:hover span {
			transform: translate(3px, -3px);
		}
	}

	@media (max-width: 900px) {
		.worlds-heading {
			grid-template-columns: minmax(0, 1fr);
			gap: 24px;
		}

		.world {
			grid-template-columns: 70px minmax(0, 1fr);
		}

		.world-meta {
			grid-column: 2;
			gap: 20px;
		}
	}

	@media (max-width: 600px) {
		.worlds {
			padding: 78px 24px 100px;
		}

		.worlds::before {
			top: 0;
			right: -180px;
			width: 620px;
			opacity: 0.075;
		}

		.worlds-heading h2 {
			font-size: clamp(3rem, 11vw, 5rem);
		}

		.world-list {
			margin-top: 64px;
		}

		.world {
			grid-template-columns: 46px minmax(0, 1fr);
			gap: 14px;
			padding-block: 30px;
		}

		.world-number {
			font-size: 2.2rem;
		}

		.world-copy h3 {
			font-size: clamp(2rem, 9vw, 3rem);
		}

		.world-tagline {
			font-size: 0.88rem;
		}

		.world-stack li {
			font-size: 0.52rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.world,
		.world-link span {
			transition: none;
		}
	}

	.method {
		--method-ink: #720914;
		position: relative;
		display: grid;
		grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr);
		gap: clamp(36px, 7vw, 110px);
		padding: clamp(190px, 21vw, 320px) clamp(24px, 7.4vw, 116px) clamp(84px, 9vw, 140px);
		background: linear-gradient(180deg, #a33544 0, #cd7378 105px, #f4d2ba 255px, #fff1d0 420px);
		color: var(--method-ink);
	}

	.method :global(.jl-panel.method-intro),
	.method :global(.jl-panel.method-steps) {
		min-width: 0;
		background: transparent;
	}

	.method :global(.jl-panel.method-intro) {
		display: flex;
		flex-direction: column;
		justify-content: center;
	}

	.method :global(.jl-panel.method-intro .jl-caption) {
		max-width: 48ch;
		margin-bottom: 26px;
		color: #9c1021;
		font:
			700 0.69rem/1.55 'Inter',
			sans-serif;
		letter-spacing: 0.11em;
		text-transform: uppercase;
	}

	.method-copy h2 {
		max-width: 11ch;
		font:
			400 clamp(3.5rem, 5.7vw, 5.8rem) / 1 'Anton',
			Impact,
			sans-serif;
		letter-spacing: -0.025em;
		text-transform: uppercase;
		text-wrap: balance;
	}

	.method-copy > p {
		max-width: 42ch;
		margin-top: 26px;
		color: #69343b;
		font:
			400 clamp(1rem, 1.2vw, 1.13rem) / 1.7 'Inter',
			sans-serif;
	}

	.method :global(.method-steps ol) {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.method :global(.method-steps li) {
		display: grid;
		grid-template-columns: clamp(62px, 7vw, 92px) minmax(0, 1fr);
		gap: 18px;
		padding: clamp(22px, 2.5vw, 32px) 0;
		border-bottom: 1px solid rgb(114 9 20 / 0.22);
	}

	.method :global(.method-steps li:first-child) {
		border-top: 1px solid rgb(114 9 20 / 0.22);
	}

	.step-number {
		color: #c34753;
		font:
			400 clamp(2.3rem, 3.4vw, 3.7rem) / 1 'Anton',
			Impact,
			sans-serif;
	}

	.method :global(.method-steps strong) {
		display: block;
		margin-bottom: 8px;
		color: var(--method-ink);
		font:
			400 clamp(1.35rem, 1.8vw, 1.75rem) / 1.15 'Anton',
			Impact,
			sans-serif;
		letter-spacing: 0.01em;
		text-transform: uppercase;
	}

	.method :global(.method-steps p) {
		max-width: 42ch;
		color: #69343b;
		font:
			400 0.96rem/1.65 'Inter',
			sans-serif;
	}

	.method :global(.jl-panel.now-panel) {
		position: relative;
		display: grid;
		grid-column: 1 / -1;
		grid-template-columns: minmax(0, 0.55fr) minmax(0, 1fr);
		gap: 32px;
		margin-top: clamp(12px, 3vw, 42px);
		padding: clamp(30px, 4vw, 58px);
		overflow: hidden;
		border: 1px solid rgb(255 226 185 / 0.2);
		border-radius: 8px;
		background: radial-gradient(circle at 100% 0, #ab3642, #790d1c 55%, #570613);
		box-shadow: 0 28px 64px rgb(89 7 17 / 0.2);
		color: #fff1d0;
	}

	.now-status {
		display: flex;
		align-items: flex-start;
		gap: 12px;
		color: #ffd69a;
		font:
			700 0.72rem/1.5 'Inter',
			sans-serif;
		letter-spacing: 0.13em;
		text-transform: uppercase;
	}

	.now-status::before {
		width: 8px;
		height: 8px;
		flex: 0 0 auto;
		margin-top: 0.35em;
		border-radius: 50%;
		background: #ffd69a;
		box-shadow: 0 0 0 5px rgb(255 214 154 / 0.12);
		content: '';
	}

	.method :global(.now-panel h2) {
		font:
			400 clamp(2.8rem, 4.8vw, 5rem) / 1 'Anton',
			Impact,
			sans-serif;
		text-transform: uppercase;
	}

	.method :global(.now-panel p) {
		max-width: 50ch;
		margin-top: 18px;
		color: rgb(255 241 208 / 0.79);
		font:
			400 clamp(1rem, 1.25vw, 1.18rem) / 1.65 'Inter',
			sans-serif;
	}

	@media (max-width: 850px) {
		.method {
			grid-template-columns: minmax(0, 1fr);
			gap: 42px;
			padding-top: 220px;
			background: linear-gradient(180deg, #a33544 0, #d27b7e 95px, #f5d6bc 210px, #fff1d0 340px);
		}

		.method-copy h2 {
			max-width: 14ch;
		}

		.method :global(.jl-panel.now-panel) {
			grid-template-columns: minmax(0, 1fr);
			gap: 24px;
		}
	}

	@media (max-width: 560px) {
		.method {
			gap: 36px;
			padding: 178px 24px 82px;
			background: linear-gradient(180deg, #a33544 0, #d27b7e 70px, #f5d6bc 155px, #fff1d0 290px);
		}

		.method :global(.jl-panel.method-intro .jl-caption) {
			margin-bottom: 20px;
			font-size: 0.62rem;
		}

		.method-copy h2 {
			font-size: clamp(3rem, 11vw, 4.1rem);
		}

		.method-copy > p {
			margin-top: 20px;
		}

		.method :global(.method-steps li) {
			grid-template-columns: 54px minmax(0, 1fr);
			gap: 14px;
		}

		.method :global(.method-steps p) {
			font-size: 0.9rem;
		}

		.method :global(.jl-panel.now-panel) {
			margin-top: 2px;
			padding: 28px 24px 32px;
		}
	}

	.contact {
		position: relative;
		isolation: isolate;
		padding: clamp(92px, 11vw, 164px) clamp(24px, 7.4vw, 116px);
		overflow: hidden;
		background:
			radial-gradient(ellipse at 80% 10%, rgb(218 83 91 / 0.55), transparent 45%),
			radial-gradient(ellipse at 0% 100%, rgb(50 0 7 / 0.7), transparent 55%),
			linear-gradient(140deg, #760d1d, #a32939 58%, #660815);
		color: #fff1d0;
	}

	.contact::before {
		position: absolute;
		z-index: -1;
		top: -30%;
		right: -14%;
		width: min(70vw, 800px);
		aspect-ratio: 1;
		border: 1px solid rgb(255 241 208 / 0.1);
		border-radius: 50%;
		box-shadow:
			0 0 0 110px rgb(255 241 208 / 0.035),
			0 0 0 230px rgb(255 241 208 / 0.025);
		content: '';
		pointer-events: none;
	}

	.contact-caption {
		max-width: 58ch;
		color: #ffd69a;
		font:
			700 0.72rem/1.5 'Inter',
			sans-serif;
		letter-spacing: 0.15em;
		text-transform: uppercase;
	}

	.contact h2 {
		max-width: 13ch;
		margin-top: 28px;
		font:
			400 clamp(3.8rem, 8vw, 8rem) / 0.98 'Anton',
			Impact,
			sans-serif;
		letter-spacing: -0.02em;
		text-transform: uppercase;
		text-wrap: balance;
	}

	.contact > p:not(.contact-caption) {
		max-width: 55ch;
		margin-top: 28px;
		color: rgb(255 241 208 / 0.82);
		font:
			400 clamp(1rem, 1.3vw, 1.18rem) / 1.7 'Inter',
			sans-serif;
	}

	.contact-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
		margin-top: 40px;
	}

	.contact-actions a {
		display: inline-flex;
		min-height: 50px;
		align-items: center;
		justify-content: center;
		gap: 18px;
		padding: 0 20px;
		border: 1px solid rgb(255 241 208 / 0.45);
		border-radius: 3px;
		color: #fff1d0;
		font:
			700 0.72rem/1 'Inter',
			sans-serif;
		letter-spacing: 0.1em;
		text-decoration: none;
		text-transform: uppercase;
		transition:
			background-color 160ms ease,
			color 160ms ease,
			transform 160ms ease;
	}

	.contact-actions a:hover {
		transform: translateY(-2px);
		background: rgb(255 241 208 / 0.1);
	}

	.contact-actions .action-primary {
		border-color: #ffd390;
		background: #ffd390;
		color: #570613;
	}

	.contact-actions .action-primary:hover {
		background: #ffe4b4;
	}

	.contact-actions a:focus-visible {
		outline: 2px solid #fff1d0;
		outline-offset: 4px;
	}

	@media (max-width: 560px) {
		.contact {
			padding: 88px 24px 98px;
		}

		.contact h2 {
			font-size: clamp(3.2rem, 13vw, 4.7rem);
		}

		.contact-actions {
			gap: 10px;
			margin-top: 32px;
		}

		.contact-actions a {
			min-height: 46px;
			padding-inline: 15px;
			font-size: 0.65rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.contact-actions a {
			transition: none;
		}
	}
</style>
