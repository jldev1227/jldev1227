import { chromium } from '@playwright/test';

const PAGES = [
	[
		'intro',
		'/es',
		[
			'origin',
			'powers',
			'missions',
			'segispro',
			'formarpro',
			'transmeralda',
			'developer-os',
			'gym-vancouver',
			'contact'
		]
	],
	[
		'segispro',
		'/es/missions/segispro',
		['challenge', 'snapshot', 'approach', 'architecture', 'before-after', 'outcome']
	],
	[
		'formarpro',
		'/es/missions/formarpro',
		['challenge', 'snapshot', 'approach', 'architecture', 'before-after', 'outcome']
	],
	[
		'transmeralda',
		'/es/missions/transmeralda',
		['challenge', 'snapshot', 'approach', 'architecture', 'before-after', 'outcome']
	],
	[
		'developer-os',
		'/es/missions/developer-os',
		['challenge', 'snapshot', 'approach', 'architecture', 'before-after', 'outcome']
	],
	[
		'gym-vancouver',
		'/es/missions/gym-vancouver',
		['challenge', 'snapshot', 'approach', 'architecture', 'before-after', 'outcome']
	]
];

const BLANK = `*, *::before, *::after {
	color: transparent !important;
	text-shadow: none !important;
	-webkit-text-stroke: 0 !important;
	caret-color: transparent !important;
}`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });

let failures = 0;
let checked = 0;
const seen = new Map();

for (const [issue, url, hashes] of PAGES) {
	for (const hash of ['', ...hashes]) {
		await page.goto(`http://127.0.0.1:4173${url}${hash ? '#' + hash : ''}`);
		await page.waitForSelector('.reader[data-enhanced]');
		await page.waitForTimeout(650);

		// What text is on screen, where, and in what colour.
		const items = await page.evaluate(() => {
			const out = [];
			document
				.querySelectorAll(
					':is(.page[data-in-view], .face[data-live]) :is(h1,h2,h3,p,span,small,strong,li,a,button)'
				)
				.forEach((el) => {
					if (!el.textContent.trim() || el.children.length) return;
					const cs = getComputedStyle(el);
					if (cs.visibility === 'hidden' || Number(cs.opacity) < 0.2) return;
					const r = el.getBoundingClientRect();
					if (r.width < 6 || r.height < 6 || r.bottom < 0 || r.top > innerHeight) return;
					const size = parseFloat(cs.fontSize);
					const trail = [];
					for (let n = el; n && trail.length < 4; n = n.parentElement) {
						const c = (n.className || '')
							.toString()
							.split(' ')
							.filter((x) => x && !x.startsWith('svelte-'))[0];
						trail.unshift(c ? '.' + c : n.tagName.toLowerCase());
					}
					// The line boxes the text actually occupies, not the element's box.
					// A short paragraph's box runs the full column width, and anything
					// sitting in the empty remainder — the cover's speech bubble, for
					// one — posed as a ground the glyphs never touch.
					const range = document.createRange();
					range.selectNodeContents(el);
					const rects = [...range.getClientRects()]
						.filter((q) => q.width >= 6 && q.height >= 6)
						.map((q) => ({
							x: Math.round(q.x),
							y: Math.round(q.y),
							w: Math.round(q.width),
							h: Math.round(q.height)
						}));
					if (!rects.length) return;
					out.push({
						text: el.textContent.trim().slice(0, 30),
						path: trail.join(' > '),
						cls:
							(el.className || '')
								.toString()
								.split(' ')
								.filter((c) => !c.startsWith('svelte-'))[0] || el.tagName,
						color: cs.color,
						size: Math.round(size),
						large: size >= 24 || (size >= 18.66 && parseInt(cs.fontWeight, 10) >= 600),
						rects
					});
				});
			return out;
		});
		if (!items.length) continue;
		checked += items.length;

		// The same frame with every glyph blanked: the ground, exactly as painted.
		const handle = await page.addStyleTag({ content: BLANK });
		const plate = (await page.screenshot()).toString('base64');
		await handle.evaluate((node) => node.remove());

		const bad = await page.evaluate(
			async ({ items, plate }) => {
				const img = new Image();
				img.src = 'data:image/png;base64,' + plate;
				await img.decode();
				const canvas = Object.assign(document.createElement('canvas'), {
					width: img.width,
					height: img.height
				});
				const ctx = canvas.getContext('2d', { willReadFrequently: true });
				ctx.drawImage(img, 0, 0);

				const probe = Object.assign(document.createElement('canvas'), { width: 1, height: 1 });
				const pctx = probe.getContext('2d', { willReadFrequently: true });
				const toRgb = (css) => {
					pctx.clearRect(0, 0, 1, 1);
					pctx.fillStyle = '#000';
					pctx.fillStyle = css;
					pctx.fillRect(0, 0, 1, 1);
					const [r, g, b, a] = pctx.getImageData(0, 0, 1, 1).data;
					return { r, g, b, a: a / 255 };
				};
				const lum = ({ r, g, b }) => {
					const f = (v) => {
						v /= 255;
						return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
					};
					return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
				};
				const ratio = (a, b) => {
					const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
					return (hi + 0.05) / (lo + 0.05);
				};
				const over = (fg, bg) => ({
					r: Math.round(fg.r * fg.a + bg.r * (1 - fg.a)),
					g: Math.round(fg.g * fg.a + bg.g * (1 - fg.a)),
					b: Math.round(fg.b * fg.a + bg.b * (1 - fg.a)),
					a: 1
				});

				const out = [];
				for (const item of items) {
					// Every line box of this run, binned together: a paragraph that
					// crosses the panel's diagonal must be judged on both sides of it.
					const bins = new Map();
					let total = 0;
					for (const { x, y, w, h } of item.rects) {
						if (y < 0 || y + h > canvas.height || x < 0 || x + w > canvas.width) continue;
						// Inside the line's leading, which picks up whatever the line
						// above and below sit on rather than what the glyphs do.
						const pad = Math.min(3, Math.floor(h / 5));
						const iy = y + pad,
							ih = h - pad * 2;
						if (w < 3 || ih < 3) continue;
						const { data } = ctx.getImageData(x, iy, w, ih);
						for (let i = 0; i < data.length; i += 4) {
							const key = `${data[i] >> 3}_${data[i + 1] >> 3}_${data[i + 2] >> 3}`;
							const bin = bins.get(key) || { n: 0, r: 0, g: 0, b: 0 };
							bin.n++;
							bin.r += data[i];
							bin.g += data[i + 1];
							bin.b += data[i + 2];
							bins.set(key, bin);
						}
						total += data.length / 4;
					}
					if (!total) continue;
					const grounds = [...bins.values()]
						.filter((bin) => bin.n / total >= 0.08)
						.map((bin) => ({
							r: Math.round(bin.r / bin.n),
							g: Math.round(bin.g / bin.n),
							b: Math.round(bin.b / bin.n),
							a: 1
						}));
					if (!grounds.length) continue;

					const fg = toRgb(item.color);
					const worst = Math.min(...grounds.map((bg) => ratio(fg.a < 1 ? over(fg, bg) : fg, bg)));
					const need = item.large ? 3 : 4.5;
					if (worst < need) {
						const hex = (c) =>
							'#' + [c.r, c.g, c.b].map((v) => v.toString(16).padStart(2, '0')).join('');
						out.push({
							...item,
							ratio: +worst.toFixed(2),
							need,
							fg: hex(fg),
							grounds: grounds.map(hex).join(' ')
						});
					}
				}
				return out;
			},
			{ items, plate }
		);

		for (const b of bad) {
			failures++;
			const prev = seen.get(b.path) || {
				n: 0,
				worst: 99,
				where: new Set(),
				sample: b.text,
				fg: b.fg,
				grounds: b.grounds,
				need: b.need
			};
			if (b.ratio < prev.worst) {
				prev.worst = b.ratio;
				prev.fg = b.fg;
				prev.grounds = b.grounds;
				prev.sample = b.text;
			}
			prev.n++;
			prev.where.add(issue);
			seen.set(b.path, prev);
		}
	}
}

for (const [where, v] of [...seen.entries()].sort((a, b) => a[1].worst - b[1].worst)) {
	console.log(
		`${v.worst.toFixed(2).padStart(6)}:1 (min ${v.need})  x${String(v.n).padStart(3)}  texto ${v.fg}  fondo ${v.grounds}`
	);
	console.log(`         ${where}`);
	console.log(`         "${v.sample}"  [${[...v.where].join(', ')}]`);
}
console.log(
	`\n${checked} textos medidos, ${failures ? `${failures} por debajo del umbral` : 'todos pasan'}`
);
await browser.close();
