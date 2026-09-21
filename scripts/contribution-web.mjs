#!/usr/bin/env node
/**
 * Contribution web — the GitHub contribution calendar, drawn as a comic panel.
 *
 * The profile README used to point at a third-party image service for this.
 * That service owns the uptime, the theme and the data; this script owns all
 * three. It asks GitHub's GraphQL API for the last year of contributions and
 * prints two hand-drawn SVG panels — one for each colour scheme — in the same
 * ink as `assets/comic-banner-*.svg`: ink ground, halftone wedge, a white
 * caption box, display type set in the websafe Impact stack that GitHub's
 * image sandbox can actually render.
 *
 *   node scripts/contribution-web.mjs --user jldev1227 --out assets
 *
 * Auth: GH_PROFILE_TOKEN, else GH_TOKEN, else GITHUB_TOKEN. The calendar only
 * counts private contributions when the token is a PAT belonging to the user
 * with `read:user` — Actions' own GITHUB_TOKEN sees public activity only.
 */

const ARGS = parseArgs(process.argv.slice(2));
const USER = ARGS.user ?? 'jldev1227';
const OUT = ARGS.out ?? 'assets';
const TOKEN = process.env.GH_PROFILE_TOKEN || process.env.GH_TOKEN || process.env.GITHUB_TOKEN;

/* ---------------------------------------------------------------- data --- */

const QUERY = `
query($login: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $login) {
    contributionsCollection(from: $from, to: $to) {
      totalCommitContributions
      totalPullRequestContributions
      totalIssueContributions
      totalPullRequestReviewContributions
      restrictedContributionsCount
      contributionCalendar {
        totalContributions
        weeks { contributionDays { date contributionCount weekday } }
      }
    }
  }
}`;

async function fetchCalendar() {
	if (!TOKEN) {
		throw new Error('No token: set GH_PROFILE_TOKEN, GH_TOKEN or GITHUB_TOKEN.');
	}

	// GitHub aligns the calendar to whole weeks, so ask for 52 weeks plus the
	// days already elapsed in the current one and let the API square it off.
	const to = new Date();
	const from = new Date(to);
	from.setUTCDate(from.getUTCDate() - 364);

	const response = await fetch('https://api.github.com/graphql', {
		method: 'POST',
		headers: {
			authorization: `bearer ${TOKEN}`,
			'content-type': 'application/json',
			'user-agent': `${USER}-contribution-web`
		},
		body: JSON.stringify({
			query: QUERY,
			variables: { login: USER, from: from.toISOString(), to: to.toISOString() }
		})
	});

	if (!response.ok) {
		throw new Error(`GitHub API ${response.status}: ${await response.text()}`);
	}

	const payload = await response.json();
	if (payload.errors?.length) {
		throw new Error(`GitHub API: ${payload.errors.map((e) => e.message).join('; ')}`);
	}
	if (!payload.data?.user) {
		throw new Error(`No such user: ${USER}`);
	}

	return payload.data.user.contributionsCollection;
}

/** Everything the panel prints, derived from one calendar. */
function digest(collection) {
	const calendar = collection.contributionCalendar;
	const today = new Date().toISOString().slice(0, 10);

	// The last week runs to Saturday whatever today is; days that have not
	// happened yet are not zeroes, they are absent.
	const weeks = calendar.weeks.map((week) => ({
		days: week.contributionDays
			.filter((day) => day.date <= today)
			.map((day) => ({ date: day.date, count: day.contributionCount, weekday: day.weekday }))
	}));
	const days = weeks.flatMap((week) => week.days);

	const active = days
		.map((day) => day.count)
		.filter((count) => count > 0)
		.sort((a, b) => a - b);
	// Quantiles, not a fraction of the maximum: one 40-commit afternoon would
	// otherwise flatten the whole year into level one.
	const at = (p) => (active.length ? active[Math.min(active.length - 1, Math.floor(active.length * p))] : 0);
	const cuts = [at(0.4), at(0.7), at(0.92)];
	const level = (count) => {
		if (count <= 0) return 0;
		if (count <= cuts[0]) return 1;
		if (count <= cuts[1]) return 2;
		if (count <= cuts[2]) return 3;
		return 4;
	};

	let longest = 0;
	let running = 0;
	for (const day of days) {
		running = day.count > 0 ? running + 1 : 0;
		longest = Math.max(longest, running);
	}

	// A streak is not broken by a day that is still being lived: start counting
	// at today only if today already has something on it.
	let current = 0;
	for (let i = days.length - 1; i >= 0; i -= 1) {
		if (days[i].count > 0) current += 1;
		else if (i !== days.length - 1) break;
	}

	const peak = days.reduce((best, day) => (day.count > best.count ? day : best), { count: 0, date: today });
	const activeDays = active.length;

	return {
		weeks,
		level,
		today,
		total: calendar.totalContributions,
		commits: collection.totalCommitContributions,
		pullRequests: collection.totalPullRequestContributions,
		issues: collection.totalIssueContributions,
		reviews: collection.totalPullRequestReviewContributions,
		current,
		longest,
		peak,
		activeDays,
		perDay: activeDays ? days.reduce((sum, day) => sum + day.count, 0) / days.length : 0,
		from: days[0]?.date ?? today,
		to: days.at(-1)?.date ?? today
	};
}

/* -------------------------------------------------------------- drawing --- */

const THEMES = {
	dark: {
		bg: '#080b16',
		wedge: '#f0142f',
		wedgeOpacity: 0.9,
		dots: '#f0142f',
		dotOpacity: 0.34,
		frame: '#f7f8fc',
		text: '#ffffff',
		muted: '#8ba9e8',
		accent: '#ffb000',
		rule: '#1f2c4d',
		captionFill: '#fffdf6',
		captionInk: '#080b16',
		onWedge: '#ffffff',
		chipFill: '#101a31',
		chipStroke: '#2b3a5e',
		empty: '#181f33',
		cellInk: '#080b16',
		ramp: ['#7d1230', '#c1162f', '#f0142f', '#ffb000']
	},
	light: {
		bg: '#fffdf6',
		wedge: '#ffd23f',
		wedgeOpacity: 1,
		dots: '#d91d3b',
		dotOpacity: 0.26,
		frame: '#080b16',
		text: '#080b16',
		muted: '#5c6675',
		accent: '#d91d3b',
		rule: '#ded6c5',
		captionFill: '#080b16',
		captionInk: '#fffdf6',
		onWedge: '#080b16',
		chipFill: '#f4efe3',
		chipStroke: '#080b16',
		empty: '#e8e2d4',
		cellInk: '#080b16',
		ramp: ['#f7c3cb', '#e8677f', '#d91d3b', '#ff9f00']
	}
};

const DISPLAY = 'Arial Black,Arial Bold,Impact,Haettenschweiler,sans-serif';
const LABEL = 'Arial,Helvetica,sans-serif';
const MONO = 'ui-monospace,SFMono-Regular,Menlo,Consolas,monospace';

const MONTHS = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
const WEEKDAYS = { 1: 'LUN', 3: 'MIÉ', 5: 'VIE' };

const W = 1280;
const H = 520;
const PANEL = { x: 8, y: 8, w: 1252, h: 494 };
const PAD = 46;
const GRID = { x: PANEL.x + PAD + 58, y: 190, rows: 7 };

function draw(data, theme, name) {
	const c = THEMES[theme];
	const weeks = data.weeks.length;
	const pitch = (PANEL.x + PANEL.w - PAD - GRID.x) / weeks;
	const cell = pitch - 4.4;
	const gridBottom = GRID.y + GRID.rows * pitch;

	const parts = [];

	/* The cells, and the month ruler above them. */
	const months = [];
	let lastMonth = -1;
	let lastX = -999;
	data.weeks.forEach((week, w) => {
		const first = week.days[0];
		if (first) {
			const month = Number(first.date.slice(5, 7)) - 1;
			const x = GRID.x + w * pitch;
			if (month !== lastMonth && x - lastX > 54 && w < weeks - 2) {
				months.push(`<text x="${r(x)}" y="${GRID.y - 16}" fill="${c.muted}" font-family="${LABEL}" font-size="15" font-weight="700" letter-spacing="2">${MONTHS[month]}</text>`);
				lastMonth = month;
				lastX = x;
			}
		}

		for (const day of week.days) {
			const level = data.level(day.count);
			const fill = level === 0 ? c.empty : c.ramp[level - 1];
			const x = r(GRID.x + w * pitch);
			const y = r(GRID.y + day.weekday * pitch);
			const isToday = day.date === data.today;
			parts.push(
				`<rect${isToday ? ' class="today"' : ''} x="${x}" y="${y}" width="${r(cell)}" height="${r(cell)}" rx="3" fill="${fill}" stroke="${c.cellInk}" stroke-width="1.1"><title>${day.date} · ${day.count}</title></rect>`
			);
		}
	});

	const days = Object.entries(WEEKDAYS).map(
		([weekday, label]) =>
			`<text x="${r(GRID.x - 16)}" y="${r(GRID.y + Number(weekday) * pitch + cell * 0.72)}" text-anchor="end" fill="${c.muted}" font-family="${LABEL}" font-size="13" font-weight="700" letter-spacing="1">${label}</text>`
	);

	/* The legend and the three stat chips share the footer strip. */
	const legendX = PANEL.x + PAD;
	const legendY = 424;
	const swatches = [c.empty, ...c.ramp].map(
		(fill, i) =>
			`<rect x="${legendX + 62 + i * 24}" y="${legendY - 13}" width="17" height="17" rx="3" fill="${fill}" stroke="${c.cellInk}" stroke-width="1.1"/>`
	);

	const chips = [
		['RACHA · STREAK', `${data.current}`, 'DÍAS · DAYS'],
		['MEJOR · BEST', `${data.longest}`, 'DÍAS · DAYS'],
		['PICO · PEAK', `${data.peak.count}`, data.peak.date]
	];
	const chipW = 236;
	const chipGap = 14;
	const chipsX = PANEL.x + PANEL.w - PAD - (chips.length * chipW + (chips.length - 1) * chipGap);
	const chipY = 388;
	const chipCards = chips.flatMap(([label, value, note], i) => {
		const x = chipsX + i * (chipW + chipGap);
		return [
			`<rect x="${x}" y="${chipY}" width="${chipW}" height="78" rx="10" fill="${c.chipFill}" stroke="${c.chipStroke}" stroke-width="3"/>`,
			`<text x="${x + 18}" y="${chipY + 27}" fill="${c.muted}" font-family="${MONO}" font-size="13" font-weight="700" letter-spacing="1">${esc(label)}</text>`,
			`<text x="${x + 18}" y="${chipY + 64}" fill="${c.text}" font-family="${DISPLAY}" font-size="36" letter-spacing="-1">${esc(value)}</text>`,
			`<text x="${x + chipW - 18}" y="${chipY + 62}" text-anchor="end" fill="${c.accent}" font-family="${MONO}" font-size="13" font-weight="700">${esc(note)}</text>`
		];
	});

	const caption = 'RED DE CONTRIBUCIONES · CONTRIBUTION WEB';
	const captionW = caption.length * 11.9 + 36;
	// A zero is not a statistic. Print the kinds of work that actually happened.
	const breakdown = [
		['COMMITS', data.commits],
		['PR', data.pullRequests],
		['ISSUES', data.issues],
		['REVIEWS', data.reviews]
	]
		.filter(([, value]) => value > 0)
		.map(([label, value]) => `${label} ${num(value)}`)
		.join('  ·  ');

	return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="t d">
  <title id="t">${num(data.total)} contribuciones de ${esc(USER)} en el último año · ${num(data.total)} contributions in the last year</title>
  <desc id="d">Panel de cómic con el calendario de contribuciones de GitHub, del ${data.from} al ${data.to}. Racha actual ${data.current} días, mejor racha ${data.longest} días, pico ${data.peak.count} contribuciones el ${data.peak.date}.</desc>
  <defs>
    <pattern id="dots" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="3.5" cy="3.5" r="2.6" fill="${c.dots}" opacity="${c.dotOpacity}"/></pattern>
    <filter id="shadow" x="-10%" y="-10%" width="130%" height="130%"><feDropShadow dx="7" dy="8" stdDeviation="0" flood-color="#000" flood-opacity=".55"/></filter>
    <clipPath id="panel"><rect x="${PANEL.x}" y="${PANEL.y}" width="${PANEL.w}" height="${PANEL.h}" rx="24"/></clipPath>
  </defs>
  <style>
    /* The only movement on the panel: today's tile blinks like a live signal.
       GitHub renders this SVG inside an img, where CSS runs and script does not. */
    .today { stroke: ${c.accent}; stroke-width: 2.4; }
    @keyframes jl-pulse { 0%, 100% { opacity: 1 } 50% { opacity: .35 } }
    @media (prefers-reduced-motion: no-preference) {
      .today { animation: jl-pulse 1.9s ease-in-out infinite; transform-box: fill-box; }
    }
  </style>

  <g filter="url(#shadow)"><rect x="${PANEL.x}" y="${PANEL.y}" width="${PANEL.w}" height="${PANEL.h}" rx="24" fill="${c.bg}"/></g>
  <g clip-path="url(#panel)">
    <path d="M${PANEL.x + PANEL.w - 300} ${PANEL.y}h300v210z" fill="${c.wedge}" opacity="${c.wedgeOpacity}"/>
    <path d="M${PANEL.x + PANEL.w - 300} ${PANEL.y}h300v210z" fill="url(#dots)"/>
    <path d="M${PANEL.x} ${PANEL.y + PANEL.h - 86}l150 86h-150z" fill="url(#dots)"/>
  </g>

  <!-- Caption box, top-left, the way every panel on this profile opens. -->
  <g transform="rotate(-0.7 ${PANEL.x + PAD} 62)">
    <rect x="${PANEL.x + PAD}" y="40" width="${r(captionW)}" height="44" fill="${c.captionFill}" stroke="${c.frame}" stroke-width="3"/>
    <text x="${PANEL.x + PAD + 17}" y="${69}" fill="${c.captionInk}" font-family="${LABEL}" font-size="17" font-weight="900" letter-spacing="1.5">${esc(caption)}</text>
  </g>
  <text x="${PANEL.x + PAD}" y="118" fill="${c.muted}" font-family="${MONO}" font-size="14" font-weight="700" letter-spacing="1">${esc(breakdown)}</text>
  <text x="${PANEL.x + PAD}" y="146" fill="${c.muted}" font-family="${MONO}" font-size="13">${data.from} → ${data.to}  ·  ${num(data.activeDays)} DÍAS ACTIVOS · ACTIVE DAYS</text>

  <!-- The year's total, set like a cover number. -->
  <text x="${PANEL.x + PANEL.w - PAD}" y="106" text-anchor="end" fill="${c.text}" stroke="${c.captionInk}" stroke-width="2" paint-order="stroke" font-family="${DISPLAY}" font-size="78" letter-spacing="-2">${num(data.total)}</text>
  <text x="${PANEL.x + PANEL.w - PAD}" y="136" text-anchor="end" fill="${c.onWedge}" font-family="${LABEL}" font-size="14" font-weight="900" letter-spacing="3">CONTRIBUCIONES · CONTRIBUTIONS</text>

  <g>${months.join('')}</g>
  <g>${days.join('')}</g>
  <g>${parts.join('')}</g>

  <path d="M${PANEL.x + PAD} 368H${PANEL.x + PANEL.w - PAD}" stroke="${c.rule}" stroke-width="3"/>

  <text x="${legendX}" y="${legendY}" fill="${c.muted}" font-family="${MONO}" font-size="13" font-weight="700">MENOS</text>
  ${swatches.join('')}
  <text x="${legendX + 62 + 5 * 24 + 6}" y="${legendY}" fill="${c.muted}" font-family="${MONO}" font-size="13" font-weight="700">MÁS</text>
  <text x="${legendX}" y="${legendY + 26}" fill="${c.muted}" font-family="${MONO}" font-size="12">LESS → MORE  ·  ${num(Math.round(data.perDay * 10) / 10)} / DÍA</text>

  ${chipCards.join('')}
</svg>
`;
}

/* --------------------------------------------------------------- output --- */

function r(value) {
	return Math.round(value * 100) / 100;
}

/** Thin-space grouping: 3 553 reads the same in Spanish and English. */
function num(value) {
	return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function esc(value) {
	return String(value).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]);
}

function parseArgs(argv) {
	const out = {};
	for (let i = 0; i < argv.length; i += 1) {
		if (argv[i].startsWith('--')) out[argv[i].slice(2)] = argv[i + 1];
	}
	return out;
}

const { writeFile, mkdir } = await import('node:fs/promises');
const { join } = await import('node:path');

const data = digest(await fetchCalendar());
await mkdir(OUT, { recursive: true });
for (const theme of Object.keys(THEMES)) {
	const file = join(OUT, `contribution-web-${theme}.svg`);
	await writeFile(file, draw(data, theme, file));
	console.log(`wrote ${file}`);
}
console.log(
	`${USER}: ${data.total} contributions · streak ${data.current} · best ${data.longest} · peak ${data.peak.count} on ${data.peak.date}`
);
