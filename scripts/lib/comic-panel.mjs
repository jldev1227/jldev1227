/**
 * The ink every profile panel is drawn in.
 *
 * `assets/` holds hand-drawn SVG, and the generated panels have to pass for
 * hand-drawn too: same palette as `comic-banner-*.svg`, same halftone, same
 * caption box, and the websafe Impact stack — GitHub renders these inside an
 * `<img>`, where a webfont would never load and script would never run.
 *
 * Panels: `contribution-web.mjs`, `activity-signal.mjs`.
 */

export const THEMES = {
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

export const DISPLAY = 'Arial Black,Arial Bold,Impact,Haettenschweiler,sans-serif';
export const LABEL = 'Arial,Helvetica,sans-serif';
export const MONO = 'ui-monospace,SFMono-Regular,Menlo,Consolas,monospace';

export const W = 1280;
export const PAD = 46;
export const PANEL_X = 8;
export const PANEL_Y = 8;
export const PANEL_W = 1252;
/** Where content starts and ends horizontally. */
export const LEFT = PANEL_X + PAD;
export const RIGHT = PANEL_X + PANEL_W - PAD;

/* ----------------------------------------------------------------- data --- */

const TOKEN = process.env.GH_PROFILE_TOKEN || process.env.GH_TOKEN || process.env.GITHUB_TOKEN;

/** One GraphQL round trip, with GitHub's two ways of failing folded into one. */
export async function graphql(query, variables) {
	if (!TOKEN) {
		throw new Error('No token: set GH_PROFILE_TOKEN, GH_TOKEN or GITHUB_TOKEN.');
	}

	const response = await fetch('https://api.github.com/graphql', {
		method: 'POST',
		headers: {
			authorization: `bearer ${TOKEN}`,
			'content-type': 'application/json',
			'user-agent': 'jldev1227-profile-panels'
		},
		body: JSON.stringify({ query, variables })
	});

	if (!response.ok) {
		throw new Error(`GitHub API ${response.status}: ${await response.text()}`);
	}

	const payload = await response.json();
	if (payload.errors?.length) {
		throw new Error(`GitHub API: ${payload.errors.map((e) => e.message).join('; ')}`);
	}
	return payload.data;
}

/* -------------------------------------------------------------- drawing --- */

export function r(value) {
	return Math.round(value * 100) / 100;
}

/** Thin-space grouping: 3 553 reads the same in Spanish and English. */
export function num(value) {
	return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

export function esc(value) {
	return String(value).replace(
		/[&<>"]/g,
		(ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]
	);
}

/**
 * The narration box every panel opens with. The box is drawn around the text,
 * so it has to be measured the way the text is set — bold Arial at 17px plus
 * its letter-spacing, which is what the 11.9 is.
 */
export function captionBox(c, text, y = 40) {
	const width = text.length * 11.9 + 36;
	return `<g transform="rotate(-0.7 ${LEFT} ${y + 22})">
    <rect x="${LEFT}" y="${y}" width="${r(width)}" height="44" fill="${c.captionFill}" stroke="${c.frame}" stroke-width="3"/>
    <text x="${LEFT + 17}" y="${y + 29}" fill="${c.captionInk}" font-family="${LABEL}" font-size="17" font-weight="900" letter-spacing="1.5">${esc(text)}</text>
  </g>`;
}

/**
 * A row of evenly spaced stat chips: small label, display value, accent note.
 * Chips with nothing in them are the caller's business — a zero is not a
 * statistic, so drop them before they get here.
 */
export function chipRow(c, chips, { x = LEFT, y, width = RIGHT - LEFT, height = 78, gap = 14 }) {
	const chipW = (width - gap * (chips.length - 1)) / chips.length;
	return chips
		.flatMap(({ label, value, note }, i) => {
			const cx = x + i * (chipW + gap);
			return [
				`<rect x="${r(cx)}" y="${y}" width="${r(chipW)}" height="${height}" rx="10" fill="${c.chipFill}" stroke="${c.chipStroke}" stroke-width="3"/>`,
				`<text x="${r(cx + 18)}" y="${y + 27}" fill="${c.muted}" font-family="${MONO}" font-size="13" font-weight="700" letter-spacing="1">${esc(label)}</text>`,
				`<text x="${r(cx + 18)}" y="${y + height - 14}" fill="${c.text}" font-family="${DISPLAY}" font-size="36" letter-spacing="-1">${esc(value)}</text>`,
				note
					? `<text x="${r(cx + chipW - 18)}" y="${y + height - 16}" text-anchor="end" fill="${c.accent}" font-family="${MONO}" font-size="13" font-weight="700">${esc(note)}</text>`
					: ''
			];
		})
		.join('');
}

/**
 * Assemble one panel: the rounded ink page, its corner wedge, the halftone and
 * whatever the caller draws on top. `body` is given the theme and the panel's
 * own height so it can lay out against the bottom edge.
 */
export function panel({ theme, height, title, desc, style = '', body }) {
	const c = THEMES[theme];
	const panelH = height - 26;
	// A panel's own CSS usually names the theme's colours, so it may be given as
	// a function of them rather than a fixed string.
	const css = typeof style === 'function' ? style(c) : style;

	return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${height}" viewBox="0 0 ${W} ${height}" role="img" aria-labelledby="t d">
  <title id="t">${esc(title)}</title>
  <desc id="d">${esc(desc)}</desc>
  <defs>
    <pattern id="dots" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="3.5" cy="3.5" r="2.6" fill="${c.dots}" opacity="${c.dotOpacity}"/></pattern>
    <filter id="shadow" x="-10%" y="-10%" width="130%" height="130%"><feDropShadow dx="7" dy="8" stdDeviation="0" flood-color="#000" flood-opacity=".55"/></filter>
    <clipPath id="panel"><rect x="${PANEL_X}" y="${PANEL_Y}" width="${PANEL_W}" height="${panelH}" rx="24"/></clipPath>
  </defs>
  <style>${css}</style>

  <g filter="url(#shadow)"><rect x="${PANEL_X}" y="${PANEL_Y}" width="${PANEL_W}" height="${panelH}" rx="24" fill="${c.bg}"/></g>
  <g clip-path="url(#panel)">
    <path d="M${PANEL_X + PANEL_W - 300} ${PANEL_Y}h300v210z" fill="${c.wedge}" opacity="${c.wedgeOpacity}"/>
    <path d="M${PANEL_X + PANEL_W - 300} ${PANEL_Y}h300v210z" fill="url(#dots)"/>
    <path d="M${PANEL_X} ${PANEL_Y + panelH - 86}l150 86h-150z" fill="url(#dots)"/>
  </g>

  ${body(c, { panelH, bottom: PANEL_Y + panelH })}
</svg>
`;
}

/** `--user x --out y` and nothing cleverer. */
export function parseArgs(argv) {
	const out = {};
	for (let i = 0; i < argv.length; i += 1) {
		if (argv[i].startsWith('--')) out[argv[i].slice(2)] = argv[i + 1];
	}
	return out;
}

/** Write one panel per theme and say so. */
export async function writeThemes(outDir, name, render) {
	const { writeFile, mkdir } = await import('node:fs/promises');
	const { join } = await import('node:path');
	await mkdir(outDir, { recursive: true });
	for (const theme of Object.keys(THEMES)) {
		const file = join(outDir, `${name}-${theme}.svg`);
		await writeFile(file, render(theme));
		console.log(`wrote ${file}`);
	}
}
