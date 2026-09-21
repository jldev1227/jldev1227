#!/usr/bin/env node
/**
 * Contribution web — the GitHub contribution calendar, drawn as a comic panel.
 *
 * The profile README used to point at a third-party image service for this.
 * That service owned the uptime, the theme and the data; this script owns all
 * three. It asks GitHub's GraphQL API for the last year of contributions and
 * prints one panel per colour scheme, in the ink of `lib/comic-panel.mjs`.
 *
 *   node scripts/contribution-web.mjs --user jldev1227 --out assets
 *
 * Auth: GH_PROFILE_TOKEN, else GH_TOKEN, else GITHUB_TOKEN. The calendar only
 * counts private contributions when the token is a PAT belonging to the user
 * with `read:user` — Actions' own GITHUB_TOKEN sees public activity only.
 */

import {
	DISPLAY,
	LABEL,
	LEFT,
	MONO,
	PANEL_X,
	PANEL_Y,
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
	// GitHub aligns the calendar to whole weeks, so ask for 52 weeks plus the
	// days already elapsed in the current one and let the API square it off.
	const to = new Date();
	const from = new Date(to);
	from.setUTCDate(from.getUTCDate() - 364);

	const data = await graphql(QUERY, {
		login: USER,
		from: from.toISOString(),
		to: to.toISOString()
	});
	if (!data.user) throw new Error(`No such user: ${USER}`);
	return data.user.contributionsCollection;
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
	const at = (p) =>
		active.length ? active[Math.min(active.length - 1, Math.floor(active.length * p))] : 0;
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

	const peak = days.reduce((best, day) => (day.count > best.count ? day : best), {
		count: 0,
		date: today
	});
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

const MONTHS = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
const WEEKDAYS = { 1: 'LUN', 3: 'MIÉ', 5: 'VIE' };

const H = 520;
const GRID = { x: LEFT + 58, y: 190, rows: 7 };

function draw(data, theme) {
	const weeks = data.weeks.length;
	const pitch = (RIGHT - GRID.x) / weeks;
	const cell = pitch - 4.4;

	const caption = 'RED DE CONTRIBUCIONES · CONTRIBUTION WEB';
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

	return panel({
		theme,
		height: H,
		title: `${num(data.total)} contribuciones de ${USER} en el último año · ${num(data.total)} contributions in the last year`,
		desc: `Panel de cómic con el calendario de contribuciones de GitHub, del ${data.from} al ${data.to}. Racha actual ${data.current} días, mejor racha ${data.longest} días, pico ${data.peak.count} contribuciones el ${data.peak.date}.`,
		style: (c) => `
    /* The only movement on the panel: today's tile blinks like a live signal.
       GitHub renders this SVG inside an img, where CSS runs and script does not. */
    .today { stroke: ${c.accent}; stroke-width: 2.4; }
    @keyframes jl-pulse { 0%, 100% { opacity: 1 } 50% { opacity: .35 } }
    @media (prefers-reduced-motion: no-preference) {
      .today { animation: jl-pulse 1.9s ease-in-out infinite; transform-box: fill-box; }
    }
  `,
		body: (c) => {
			/* The cells, and the month ruler above them. */
			const cells = [];
			const months = [];
			let lastMonth = -1;
			let lastX = -999;

			data.weeks.forEach((week, w) => {
				const first = week.days[0];
				if (first) {
					const month = Number(first.date.slice(5, 7)) - 1;
					const x = GRID.x + w * pitch;
					if (month !== lastMonth && x - lastX > 54 && w < weeks - 2) {
						months.push(
							`<text x="${r(x)}" y="${GRID.y - 16}" fill="${c.muted}" font-family="${LABEL}" font-size="15" font-weight="700" letter-spacing="2">${MONTHS[month]}</text>`
						);
						lastMonth = month;
						lastX = x;
					}
				}

				for (const day of week.days) {
					const level = data.level(day.count);
					const fill = level === 0 ? c.empty : c.ramp[level - 1];
					const isToday = day.date === data.today;
					cells.push(
						`<rect${isToday ? ' class="today"' : ''} x="${r(GRID.x + w * pitch)}" y="${r(GRID.y + day.weekday * pitch)}" width="${r(cell)}" height="${r(cell)}" rx="3" fill="${fill}" stroke="${c.cellInk}" stroke-width="1.1"><title>${day.date} · ${day.count}</title></rect>`
					);
				}
			});

			const dayLabels = Object.entries(WEEKDAYS).map(
				([weekday, label]) =>
					`<text x="${r(GRID.x - 16)}" y="${r(GRID.y + Number(weekday) * pitch + cell * 0.72)}" text-anchor="end" fill="${c.muted}" font-family="${LABEL}" font-size="13" font-weight="700" letter-spacing="1">${label}</text>`
			);

			const legendY = 424;
			const swatches = [c.empty, ...c.ramp].map(
				(fill, i) =>
					`<rect x="${LEFT + 62 + i * 24}" y="${legendY - 13}" width="17" height="17" rx="3" fill="${fill}" stroke="${c.cellInk}" stroke-width="1.1"/>`
			);

			const chips = chipRow(
				c,
				[
					{ label: 'RACHA · STREAK', value: `${data.current}`, note: 'DÍAS · DAYS' },
					{ label: 'MEJOR · BEST', value: `${data.longest}`, note: 'DÍAS · DAYS' },
					{ label: 'PICO · PEAK', value: `${data.peak.count}`, note: data.peak.date }
				],
				{ x: RIGHT - 736, y: 388, width: 736 }
			);

			return `${captionBox(c, caption)}
  <text x="${LEFT}" y="118" fill="${c.muted}" font-family="${MONO}" font-size="14" font-weight="700" letter-spacing="1">${esc(breakdown)}</text>
  <text x="${LEFT}" y="146" fill="${c.muted}" font-family="${MONO}" font-size="13">${data.from} → ${data.to}  ·  ${num(data.activeDays)} DÍAS ACTIVOS · ACTIVE DAYS</text>

  <!-- The year's total, set like a cover number. -->
  <text x="${RIGHT}" y="106" text-anchor="end" fill="${c.text}" stroke="${c.captionInk}" stroke-width="2" paint-order="stroke" font-family="${DISPLAY}" font-size="78" letter-spacing="-2">${num(data.total)}</text>
  <text x="${RIGHT}" y="136" text-anchor="end" fill="${c.onWedge}" font-family="${LABEL}" font-size="14" font-weight="900" letter-spacing="3">CONTRIBUCIONES · CONTRIBUTIONS</text>

  <g>${months.join('')}</g>
  <g>${dayLabels.join('')}</g>
  <g>${cells.join('')}</g>

  <path d="M${LEFT} 368H${RIGHT}" stroke="${c.rule}" stroke-width="3"/>

  <text x="${LEFT}" y="${legendY}" fill="${c.muted}" font-family="${MONO}" font-size="13" font-weight="700">MENOS</text>
  ${swatches.join('')}
  <text x="${LEFT + 62 + 5 * 24 + 6}" y="${legendY}" fill="${c.muted}" font-family="${MONO}" font-size="13" font-weight="700">MÁS</text>
  <text x="${LEFT}" y="${legendY + 26}" fill="${c.muted}" font-family="${MONO}" font-size="12">LESS → MORE  ·  ${num(Math.round(data.perDay * 10) / 10)} / DÍA</text>

  ${chips}`;
		}
	});
}

/* --------------------------------------------------------------- output --- */

const data = digest(await fetchCalendar());
await writeThemes(OUT, 'contribution-web', (theme) => draw(data, theme));
console.log(
	`${USER}: ${data.total} contributions · streak ${data.current} · best ${data.longest} · peak ${data.peak.count} on ${data.peak.date}`
);
