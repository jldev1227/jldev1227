import { test, expect } from '@playwright/test';

/**
 * Milestone 2 — every word on a shelf cover clears WCAG AA against both grounds
 * it can sit on: the world's own base, and the accent wedge the diagonal lays
 * over it.
 *
 * Colours are resolved through a canvas rather than parsed out of the computed
 * string. `color-mix(in oklab, …)` computes to an `oklab()` value whose three
 * numbers are not RGB, and reading them as RGB reports a perfectly legible
 * white as 1.03:1 — which is how this check first lied to me.
 */
test('every word on a cover clears AA on both of its grounds', async ({ page }, info) => {
	test.skip(info.project.name !== 'landscape', 'one pass');
	await page.setViewportSize({ width: 1280, height: 860 });
	await page.goto('/spike/experience?lang=es');
	await page.locator('.shelf').waitFor();
	await page.waitForTimeout(600);
	const rows = await page.evaluate(() => {
		// Resolve through a canvas: `color-mix(in oklab, …)` computes to an
		// `oklab()` string whose numbers are not RGB, and reading them as RGB is
		// how a perfectly legible white reads as 1.03:1.
		const probe = Object.assign(document.createElement('canvas'), { width: 1, height: 1 });
		const ctx = probe.getContext('2d', { willReadFrequently: true })!;
		const toRgb = (css: string) => {
			ctx.clearRect(0, 0, 1, 1);
			ctx.fillStyle = '#000';
			ctx.fillStyle = css;
			ctx.fillRect(0, 0, 1, 1);
			const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
			return { r, g, b, a: a / 255 };
		};
		const lum = (c: { r: number; g: number; b: number }) => {
			const f = (v: number) => {
				v /= 255;
				return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
			};
			return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
		};
		const ratio = (
			a: { r: number; g: number; b: number },
			b: { r: number; g: number; b: number }
		) => {
			const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
			return (hi + 0.05) / (lo + 0.05);
		};
		const over = (
			fg: { r: number; g: number; b: number; a: number },
			bg: { r: number; g: number; b: number }
		) => ({
			r: Math.round(fg.r * fg.a + bg.r * (1 - fg.a)),
			g: Math.round(fg.g * fg.a + bg.g * (1 - fg.a)),
			b: Math.round(fg.b * fg.a + bg.b * (1 - fg.a))
		});
		const out: {
			issue: string;
			el: string;
			size: number;
			need: number;
			onBase: number;
			onWedge: number;
		}[] = [];
		document.querySelectorAll('.volume').forEach((vol) => {
			const face = vol.querySelector('.face') as HTMLElement;
			const base = toRgb(getComputedStyle(face).backgroundColor);
			const accent = toRgb(
				getComputedStyle(vol).getPropertyValue('--jl-world-accent').trim() || '#d91d3b'
			);
			const wedge = over({ ...accent, a: 0.32 }, base);
			for (const sel of ['.masthead', '.number', '.kicker', '.title']) {
				const el = vol.querySelector(sel) as HTMLElement;
				if (!el) continue;
				const cs = getComputedStyle(el);
				const raw = toRgb(cs.color);
				const size = parseFloat(cs.fontSize);
				const large = size >= 24 || (size >= 18.66 && parseInt(cs.fontWeight, 10) >= 600);
				out.push({
					issue: vol.getAttribute('href')!.split('/').pop(),
					el: sel,
					size: Math.round(size),
					need: large ? 3 : 4.5,
					onBase: +ratio(over(raw, base), base).toFixed(2),
					onWedge: +ratio(over(raw, wedge), wedge).toFixed(2)
				});
			}
		});
		return out;
	});
	const failures = rows.filter((r) => Math.min(r.onBase, r.onWedge) < r.need);
	expect(
		failures.map((r) => `${r.issue} ${r.el}: ${Math.min(r.onBase, r.onWedge)} < ${r.need}`)
	).toEqual([]);

	// And the check itself has to be looking at something.
	expect(rows.length).toBe(20);
});
