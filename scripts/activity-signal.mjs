#!/usr/bin/env node
/**
 * Activity signal — who is at the desk, and what the tree is written in.
 *
 * Replaces the two third-party summary cards the README used to embed, which
 * had started rendering as empty black rectangles. Two panels come out of this:
 *
 *   activity-signal-*.svg   the identity plate and the counters that matter
 *   languages-*.svg         the language mix, weighted by bytes in the tree
 *
 *   node scripts/activity-signal.mjs --user jldev1227 --out assets
 *
 * Auth: GH_PROFILE_TOKEN, else GH_TOKEN, else GITHUB_TOKEN. A PAT with `repo`
 * sees private repositories and counts them; Actions' own token sees the public
 * tree alone. Either way the panel prints the number of repositories it read,
 * so what it claims is always what it looked at.
 */

import {
	DISPLAY,
	LABEL,
	LEFT,
	MONO,
	RIGHT,
	captionBox,
	chipRow,
	esc,
	graphql,
	num,
	panel,
	parseArgs,
	r,
	writeThemes
} from './lib/comic-panel.mjs';

const ARGS = parseArgs(process.argv.slice(2));
const USER = ARGS.user ?? 'jldev1227';
const OUT = ARGS.out ?? 'assets';

/* ---------------------------------------------------------------- data --- */

const PROFILE = `
query($login: String!, $after: String) {
  user(login: $login) {
    name login createdAt
    pullRequests { totalCount }
    issues { totalCount }
    repositories(first: 100, after: $after, ownerAffiliations: OWNER, isFork: false) {
      totalCount
      pageInfo { hasNextPage endCursor }
      nodes {
        isPrivate
        languages(first: 12, orderBy: { field: SIZE, direction: DESC }) {
          edges { size node { name color } }
        }
      }
    }
  }
}`;

async function fetchProfile() {
	let after = null;
	let user = null;
	const repos = [];

	// Repositories come a hundred at a time; everything else rides along with
	// the first page and is simply overwritten by the identical later ones.
	do {
		const data = await graphql(PROFILE, { login: USER, after });
		if (!data.user) throw new Error(`No such user: ${USER}`);
		user = data.user;
		repos.push(...user.repositories.nodes);
		after = user.repositories.pageInfo.hasNextPage ? user.repositories.pageInfo.endCursor : null;
	} while (after);

	return { user, repos };
}

/**
 * Lifetime commits, a calendar year at a time — `contributionsCollection` only
 * spans one year per call, so the years are asked for as aliases in a single
 * request rather than one round trip each.
 */
async function fetchYears(createdAt) {
	const first = new Date(createdAt).getUTCFullYear();
	const last = new Date().getUTCFullYear();
	const years = [];
	for (let year = first; year <= last; year += 1) years.push(year);

	const fields = years
		.map(
			(year) => `y${year}: contributionsCollection(from: "${year}-01-01T00:00:00Z", to: "${year}-12-31T23:59:59Z") {
        totalCommitContributions
        totalPullRequestContributions
        totalIssueContributions
        totalPullRequestReviewContributions
        restrictedContributionsCount
      }`
		)
		.join('\n');

	const data = await graphql(`query($login: String!) { user(login: $login) { ${fields} } }`, {
		login: USER
	});

	const sum = (field) => years.reduce((total, year) => total + data.user[`y${year}`][field], 0);
	return {
		firstYear: first,
		commits: sum('totalCommitContributions'),
		pullRequests: sum('totalPullRequestContributions'),
		issues: sum('totalIssueContributions'),
		reviews: sum('totalPullRequestReviewContributions'),
		restricted: sum('restrictedContributionsCount')
	};
}

function digest({ user, repos }, years) {
	const sizes = new Map();
	for (const repo of repos) {
		for (const edge of repo.languages.edges) {
			const current = sizes.get(edge.node.name) ?? { size: 0, color: edge.node.color };
			current.size += edge.size;
			sizes.set(edge.node.name, current);
		}
	}

	const totalBytes = [...sizes.values()].reduce((total, lang) => total + lang.size, 0) || 1;
	const ranked = [...sizes.entries()]
		.map(([name, lang]) => ({ name, color: lang.color, share: lang.size / totalBytes }))
		.sort((a, b) => b.share - a.share);

	const top = ranked.slice(0, 8);
	const rest = ranked.slice(8).reduce((total, lang) => total + lang.share, 0);

	const created = new Date(user.createdAt);
	return {
		login: user.login,
		name: user.name ?? user.login,
		created,
		repos: repos.length,
		reposTotal: user.repositories.totalCount,
		private: repos.filter((repo) => repo.isPrivate).length,
		languages: ranked.length,
		top,
		rest,
		...years
	};
}

/* -------------------------------------------------------------- drawing --- */

const MONTHS = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

/** Bytes are a sharp number about a blunt thing; one decimal is honest enough. */
function pct(share) {
	const value = share * 100;
	return `${value >= 10 ? Math.round(value) : Math.round(value * 10) / 10}%`;
}

function drawSignal(data, theme) {
	const since = `${MONTHS[data.created.getUTCMonth()]} ${data.created.getUTCFullYear()}`;
	const years = Math.max(1, new Date().getUTCFullYear() - data.created.getUTCFullYear());

	// Followers and stars are a popularity contest this profile is not entering;
	// what it has is a tree. Order the counters by what the work actually is and
	// drop any that would print a zero.
	const chips = [
		{
			label: 'REPOS · REPOS',
			value: num(data.repos),
			note: data.private ? 'PROPIOS · OWNED' : 'PÚBLICOS · PUBLIC'
		},
		{
			label: 'EN PRIVADO · PRIVATE',
			value: num(data.private),
			note: `${Math.round((data.private / Math.max(1, data.repos)) * 100)}%`
		},
		{ label: 'PULL REQUESTS', value: num(data.pullRequests), note: `DESDE ${data.firstYear}` },
		{ label: 'LENGUAJES · LANGUAGES', value: num(data.languages), note: 'EN USO · IN USE' }
	].filter((chip) => chip.value !== '0');

	const AVATAR = { x: LEFT + 4, y: 112, size: 146 };
	const textX = AVATAR.x + AVATAR.size + 36;

	return panel({
		theme,
		height: 420,
		title: `Señal de actividad de ${data.login} · activity signal`,
		desc: `Panel de cómic con el perfil de GitHub de ${data.login}: ${data.repos} repositorios propios, ${data.private} privados, ${num(data.commits)} commits y ${num(data.pullRequests)} pull requests desde ${data.firstYear}, en ${data.languages} lenguajes.`,
		body: (c) => `${captionBox(c, 'SEÑAL DE ACTIVIDAD · ACTIVITY SIGNAL')}

  <!-- Identity plate: drawn, not photographed — the badge off the banner, so
       the panel stays a few kilobytes and the whole profile stays illustrated. -->
  <g transform="rotate(-3 ${AVATAR.x + AVATAR.size / 2} ${AVATAR.y + AVATAR.size / 2})">
    <rect x="${AVATAR.x}" y="${AVATAR.y}" width="${AVATAR.size}" height="${AVATAR.size}" rx="10" fill="#080b16"/>
    <rect x="${AVATAR.x}" y="${AVATAR.y}" width="${AVATAR.size}" height="${AVATAR.size}" rx="10" fill="url(#dots)" opacity=".7"/>
    <text x="${AVATAR.x + AVATAR.size / 2}" y="${AVATAR.y + 82}" text-anchor="middle" fill="#ffffff" font-family="${DISPLAY}" font-size="62" letter-spacing="-2">JL</text>
    <path d="M${AVATAR.x + 26} ${AVATAR.y + 96}h${AVATAR.size - 52}" stroke="#ffb000" stroke-width="7"/>
    <text x="${AVATAR.x + AVATAR.size / 2}" y="${AVATAR.y + 126}" text-anchor="middle" fill="#ffb000" font-family="${MONO}" font-size="17" font-weight="700" letter-spacing="2">#1227</text>
    <rect x="${AVATAR.x}" y="${AVATAR.y}" width="${AVATAR.size}" height="${AVATAR.size}" rx="10" fill="none" stroke="${c.frame}" stroke-width="6"/>
  </g>

  <text x="${textX}" y="168" fill="${c.text}" stroke="${c.captionInk}" stroke-width="2" paint-order="stroke" font-family="${DISPLAY}" font-size="56" letter-spacing="-1">${esc(data.name.toUpperCase())}</text>
  <text x="${textX}" y="199" fill="${c.accent}" font-family="${MONO}" font-size="15" font-weight="700" letter-spacing="1">@${esc(data.login)}  ·  1227JL.DEV</text>
  <text x="${textX}" y="226" fill="${c.muted}" font-family="${MONO}" font-size="13">EN ÓRBITA DESDE ${since}  ·  IN ORBIT SINCE ${since}  ·  ${years}+ AÑOS</text>

  <!-- The lifetime commit count, set like a cover number on the wedge. -->
  <text x="${RIGHT}" y="106" text-anchor="end" fill="${c.text}" stroke="${c.captionInk}" stroke-width="2" paint-order="stroke" font-family="${DISPLAY}" font-size="78" letter-spacing="-2">${num(data.commits)}</text>
  <text x="${RIGHT}" y="136" text-anchor="end" fill="${c.onWedge}" font-family="${LABEL}" font-size="14" font-weight="900" letter-spacing="3">COMMITS DESDE ${data.firstYear} · SINCE ${data.firstYear}</text>

  <path d="M${LEFT} 252H${RIGHT}" stroke="${c.rule}" stroke-width="3"/>

  ${chipRow(c, chips, { y: 276, height: 88 })}`
	});
}

function drawLanguages(data, theme) {
	const BAR = { x: LEFT, y: 140, w: RIGHT - LEFT, h: 56 };
	const cellW = (RIGHT - LEFT) / 4;

	return panel({
		theme,
		height: 400,
		title: `Lenguajes de ${data.login} · languages`,
		desc: `Panel de cómic con la mezcla de lenguajes en ${data.repos} repositorios: ${data.top
			.slice(0, 5)
			.map((lang) => `${lang.name} ${pct(lang.share)}`)
			.join(', ')}.`,
		body: (c) => {
			const segments = [...data.top];
			if (data.rest > 0.004) {
				segments.push({ name: 'OTROS · OTHER', color: c.muted, share: data.rest });
			}

			let x = BAR.x;
			const bar = segments.map((lang) => {
				const width = (BAR.w * lang.share) / segments.reduce((t, l) => t + l.share, 0);
				const rect = `<rect x="${r(x)}" y="${BAR.y}" width="${r(width)}" height="${BAR.h}" fill="${lang.color ?? c.muted}" stroke="${c.cellInk}" stroke-width="1.6"><title>${esc(lang.name)} · ${pct(lang.share)}</title></rect>`;
				x += width;
				return rect;
			});

			const legend = data.top.flatMap((lang, i) => {
				const cx = LEFT + (i % 4) * cellW;
				const cy = 272 + Math.floor(i / 4) * 56;
				return [
					`<rect x="${r(cx)}" y="${cy - 16}" width="20" height="20" rx="4" fill="${lang.color ?? c.muted}" stroke="${c.cellInk}" stroke-width="1.6"/>`,
					`<text x="${r(cx + 30)}" y="${cy}" fill="${c.text}" font-family="${LABEL}" font-size="17" font-weight="700">${esc(lang.name)}</text>`,
					`<text x="${r(cx + cellW - 28)}" y="${cy + 2}" text-anchor="end" fill="${c.muted}" font-family="${DISPLAY}" font-size="24" letter-spacing="-0.5">${pct(lang.share)}</text>`
				];
			});

			return `${captionBox(c, 'LENGUAJES · LANGUAGES')}
  <text x="${LEFT}" y="118" fill="${c.muted}" font-family="${MONO}" font-size="13">POR BYTES EN ${num(data.repos)} REPOSITORIOS ${data.private ? `(${num(data.private)} PRIVADOS)` : 'PÚBLICOS'}  ·  BY BYTES ACROSS ${num(data.repos)} ${data.private ? 'REPOSITORIES' : 'PUBLIC REPOSITORIES'}</text>

  <!-- One bar, ink-framed, each language as wide as it is written. -->
  <g>${bar.join('')}</g>
  <rect x="${BAR.x}" y="${BAR.y}" width="${BAR.w}" height="${BAR.h}" rx="6" fill="none" stroke="${c.frame}" stroke-width="4"/>

  <path d="M${LEFT} 228H${RIGHT}" stroke="${c.rule}" stroke-width="3"/>
  ${legend.join('')}`;
		}
	});
}

/* --------------------------------------------------------------- output --- */

const profile = await fetchProfile();
const years = await fetchYears(profile.user.createdAt);
const data = digest(profile, years);

await writeThemes(OUT, 'activity-signal', (theme) => drawSignal(data, theme));
await writeThemes(OUT, 'languages', (theme) => drawLanguages(data, theme));
console.log(
	`${USER}: ${data.repos} repos (${data.private} private) · ${data.commits} commits · ${data.pullRequests} PRs · ${data.languages} languages`
);
