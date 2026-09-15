import { test, expect, type Page } from '@playwright/test';

/**
 * Milestone 2 — the semantic shelf.
 *
 * What matters here is that the depth treatment is decoration over a shelf that
 * already works: five ordinary links, one tab stop, arrows within it, and no
 * copy escaping a cover in either language.
 *
 * Run with: npm run test:spike
 */

const ISSUES = ['segispro', 'formarpro', 'transmeralda', 'developer-os', 'gym-vancouver'];

async function open(page: Page, lang: 'es' | 'en' = 'es') {
	await page.goto(`/spike/experience?lang=${lang}`);
	await page.locator('.shelf').waitFor();
	await page.waitForTimeout(300);
}

const volumes = (page: Page) => page.locator('.volume');

/** Which volumes the keyboard can reach with Tab. */
const tabbable = (page: Page) =>
	page.locator('.volume').evaluateAll((els) => els.filter((e) => e.tabIndex === 0).length);

const focusedId = (page: Page) =>
	page.evaluate(() => document.activeElement?.getAttribute('href') ?? null);

test.describe('the shelf as markup', () => {
	test('is one volume per issue, each a link to its canonical route', async ({ page }) => {
		await open(page);
		await expect(volumes(page)).toHaveCount(5);

		const hrefs = await volumes(page).evaluateAll((els) =>
			els.map((el) => el.getAttribute('href'))
		);
		expect(hrefs).toEqual(ISSUES.map((slug) => `/es/missions/${slug}`));
	});

	test('each cover carries its own issue number and title', async ({ page }) => {
		await open(page);
		const numbers = await page.locator('.volume .number').allInnerTexts();
		expect(numbers).toEqual(['#01', '#02', '#03', '#04', '#05']);
		await expect(page.locator('.volume .title').first()).toHaveText('SEGISPRO');
	});

	test('each cover is set in its own palette, not the house colours', async ({ page }) => {
		await open(page);
		const grounds = await page
			.locator('.volume .face')
			.evaluateAll((els) => els.map((el) => getComputedStyle(el).backgroundColor));
		// Five issues, five different worlds.
		expect(new Set(grounds).size).toBe(5);
	});
});

test.describe('the keyboard', () => {
	test('the shelf is a single tab stop', async ({ page }) => {
		await open(page);
		// Five links in a row would otherwise cost five tabs to walk past.
		expect(await tabbable(page)).toBe(1);
	});

	test('the arrows walk the row, and Home and End reach its ends', async ({ page }) => {
		await open(page);
		await volumes(page).first().focus();
		expect(await focusedId(page)).toContain('segispro');

		await page.keyboard.press('ArrowRight');
		expect(await focusedId(page)).toContain('formarpro');

		await page.keyboard.press('ArrowRight');
		await page.keyboard.press('ArrowLeft');
		expect(await focusedId(page)).toContain('formarpro');

		await page.keyboard.press('End');
		expect(await focusedId(page)).toContain('gym-vancouver');

		await page.keyboard.press('Home');
		expect(await focusedId(page)).toContain('segispro');
	});

	test('the ends do not wrap, so the row has a beginning and an end', async ({ page }) => {
		await open(page);
		await volumes(page).first().focus();
		await page.keyboard.press('ArrowLeft');
		expect(await focusedId(page)).toContain('segispro');

		await page.keyboard.press('End');
		await page.keyboard.press('ArrowRight');
		expect(await focusedId(page)).toContain('gym-vancouver');
	});

	test('Space picks an issue up, where a link would have scrolled', async ({ page }) => {
		await open(page);
		await volumes(page).nth(3).focus();
		await page.keyboard.press(' ');
		await page.waitForTimeout(400);

		expect(await page.locator('[data-mode]').first().getAttribute('data-mode')).toBe('inspect');
		expect(page.url()).toContain('#developer-os');
	});

	test('Enter picks one up too', async ({ page }) => {
		await open(page);
		await volumes(page).nth(1).focus();
		await page.keyboard.press('Enter');
		await page.waitForTimeout(400);
		expect(page.url()).toContain('#formarpro');
	});
});

test.describe('focus', () => {
	test('moves into the issue when one is picked up', async ({ page }) => {
		await open(page);
		await volumes(page).first().click();
		await page.waitForTimeout(400);

		// Not left on a detached link, and not dumped back on <body>, which would
		// send the next Tab to the top of the page.
		const landed = await page.evaluate(() => document.activeElement?.className ?? '');
		expect(landed).toContain('inspect');
	});

	test('returns to the volume the issue came from', async ({ page }) => {
		await open(page);
		await volumes(page).nth(2).click();
		await page.waitForTimeout(400);
		await page.getByRole('button', { name: 'Vuelve a la colección' }).click();
		await page.waitForTimeout(500);

		// Back on the shelf, looking at the one just put down — not at the start.
		expect(await focusedId(page)).toContain('transmeralda');
		expect(await tabbable(page)).toBe(1);
	});
});

test.describe('the covers hold their copy', () => {
	for (const lang of ['es', 'en'] as const) {
		test(`nothing escapes a cover in ${lang}`, async ({ page }) => {
			await open(page, lang);

			// The check `comic-panel` prescribes: type-checking cannot see a title
			// crossing its own frame, and Spanish runs a line longer than English.
			const escapes = await page.locator('.volume .face').evaluateAll((faces) =>
				faces.flatMap((face) => {
					const box = face.getBoundingClientRect();
					return [...face.querySelectorAll('span, strong')]
						.filter((el) => {
							const r = el.getBoundingClientRect();
							return (
								r.height > 0 &&
								(r.bottom > box.bottom + 1 || r.right > box.right + 1 || r.top < box.top - 1)
							);
						})
						.map((el) => `${el.className}: ${el.textContent?.slice(0, 24)}`);
				})
			);
			expect(escapes).toEqual([]);
		});
	}
});

test.describe('narrow screens', () => {
	test('become a snap row, never a miniature shelf', async ({ page }) => {
		await page.setViewportSize({ width: 390, height: 844 });
		await open(page);

		const row = await page.locator('.row').evaluate((el) => {
			const cs = getComputedStyle(el);
			return {
				display: cs.display,
				perspective: cs.perspective,
				snap: cs.scrollSnapType,
				overflowX: cs.overflowX
			};
		});
		expect(row.display).toBe('flex');
		expect(row.perspective).toBe('none');
		expect(row.snap).toContain('x');
		expect(row.overflowX).toBe('auto');

		// And the volumes lie flat rather than being angled at thumbnail size.
		const transform = await volumes(page)
			.first()
			.evaluate((el) => getComputedStyle(el).transform);
		expect(transform).toBe('none');

		// The row scrolls sideways rather than the page growing a horizontal bar.
		const bodyOverflows = await page.evaluate(
			() => document.documentElement.scrollWidth > window.innerWidth + 1
		);
		expect(bodyOverflows).toBe(false);
	});
});

test.describe('reduced motion', () => {
	test.use({ reducedMotion: 'reduce' });

	test('removes the pickup and the tilt but keeps the shelf usable', async ({ page }) => {
		await open(page);
		const first = volumes(page).first();
		expect(await first.evaluate((el) => getComputedStyle(el).transform)).toBe('none');

		await first.hover();
		await page.waitForTimeout(250);
		expect(await first.evaluate((el) => getComputedStyle(el).transform)).toBe('none');

		// Still selectable: the preference removes travel, not the transition.
		await first.click();
		await page.waitForTimeout(350);
		expect(await page.locator('[data-mode]').first().getAttribute('data-mode')).toBe('inspect');
	});
});
