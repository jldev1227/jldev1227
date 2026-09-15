import { test, expect, type Page } from '@playwright/test';

/**
 * Milestone 1 — the three-state shell, driven through a browser.
 *
 * The reducer's own behaviour is covered by unit tests
 * (`src/lib/components/comic-experience/experience-state.test.ts`). What is
 * proved here is the part a unit test cannot reach: that the three states
 * render out of the components the site already has, that the URL restores
 * them, and that browser Back reverses exactly one level.
 *
 * Run with: npm run test:spike
 */

const HARNESS = '/spike/experience?lang=es';

const hashOf = (page: Page) => page.evaluate(() => window.location.hash);

async function open(page: Page, hash = '') {
	await page.goto(`${HARNESS}${hash}`);
	await page.locator('[aria-label="Colección de cómics"]').waitFor();
	await page.waitForTimeout(250);
}

const mode = (page: Page) => page.locator('[data-mode]').first().getAttribute('data-mode');

test.describe('the shelf', () => {
	test('is a list of ordinary links to the canonical routes', async ({ page }) => {
		await open(page);
		expect(await mode(page)).toBe('shelf');

		const links = page.locator('.shelf a');
		await expect(links).toHaveCount(5);
		// The no-JavaScript path: every issue is reachable as a normal document.
		for (const href of await links.evaluateAll((els) => els.map((el) => el.getAttribute('href')))) {
			expect(href).toMatch(/^\/es\/missions\/[a-z-]+$/);
		}
	});

	test('carries no hash, so the canonical route is untouched', async ({ page }) => {
		await open(page);
		expect(await hashOf(page)).toBe('');
	});
});

test.describe('picking an issue up', () => {
	test('moves to inspecting its front cover and names it in the URL', async ({ page }) => {
		await open(page);
		await page.locator('.shelf a').first().click();
		await page.waitForTimeout(300);

		expect(await mode(page)).toBe('inspect');
		expect(await hashOf(page)).toBe('#segispro');
		// The cover the site already renders, not a new one.
		await expect(page.locator('.faces .shell')).toBeVisible();
	});

	test('turns the issue over and back without leaving the level', async ({ page }) => {
		await open(page, '#segispro');
		expect(await mode(page)).toBe('inspect');

		await page.getByRole('button', { name: 'Contraportada' }).click();
		await page.waitForTimeout(250);
		expect(await hashOf(page)).toBe('#segispro/back');
		await expect(page.locator('.backface')).toBeVisible();

		await page.getByRole('button', { name: 'Portada', exact: true }).click();
		await page.waitForTimeout(250);
		expect(await hashOf(page)).toBe('#segispro');
	});
});

test.describe('reading', () => {
	test('hands off to the reader the site already has', async ({ page }) => {
		await open(page, '#segispro');
		await page.getByRole('button', { name: 'Lee este número' }).click();
		await page.waitForTimeout(600);

		expect(await mode(page)).toBe('read');
		await expect(page.locator('.reader')).toBeVisible();
	});

	test('two owners of the hash: the reader takes it over once the book opens', async ({ page }) => {
		await open(page, '#segispro');
		await page.getByRole('button', { name: 'Lee este número' }).click();
		await page.waitForTimeout(700);

		// Entering `read` is safe — the book arrives closed, and `ComicReader`
		// only writes a hash for an *open* position.
		expect(await hashOf(page)).toBe('#segispro/p0');

		await page
			.locator('.reader')
			.getByRole('button', { name: /Abre el n/ })
			.first()
			.click();
		await page.waitForTimeout(1200);

		// Once it opens, the reader's own reading-position hash wins: it writes
		// the page id, which is not a shape this shell's reducer can read back.
		const taken = await hashOf(page);
		expect(taken).not.toBe('#segispro/p0');
		expect(taken).toMatch(/^#segispro--/);
	});

	test('so a reload while reading loses the place, until milestone 5 settles ownership', async ({
		page
	}) => {
		await open(page, '#segispro');
		await page.getByRole('button', { name: 'Lee este número' }).click();
		await page.waitForTimeout(700);
		await page
			.locator('.reader')
			.getByRole('button', { name: /Abre el n/ })
			.first()
			.click();
		await page.waitForTimeout(1200);

		await page.reload();
		await page.locator('[aria-label="Colección de cómics"]').waitFor();
		await page.waitForTimeout(400);

		// The reducer refuses a hash it cannot resolve to a known issue and falls
		// back to the shelf, which is the safe outcome — but it is a lost place,
		// and it is the concrete reason the adapter has to own the hash alone.
		expect(await mode(page)).toBe('shelf');
	});
});

test.describe('getting back out', () => {
	test('Escape reverses one level at a time', async ({ page }) => {
		await open(page, '#segispro');
		await page.getByRole('button', { name: 'Lee este número' }).click();
		await page.waitForTimeout(700);
		expect(await mode(page)).toBe('read');

		await page.keyboard.press('Escape');
		await page.waitForTimeout(350);
		expect(await mode(page)).toBe('inspect');

		await page.keyboard.press('Escape');
		await page.waitForTimeout(350);
		expect(await mode(page)).toBe('shelf');

		// The shelf is the floor: Escape does nothing further.
		await page.keyboard.press('Escape');
		await page.waitForTimeout(250);
		expect(await mode(page)).toBe('shelf');
	});

	test('the explicit controls reverse the same one level', async ({ page }) => {
		await open(page, '#segispro');
		await page.getByRole('button', { name: 'Lee este número' }).click();
		await page.waitForTimeout(700);

		await page.getByRole('button', { name: 'Cierra el número' }).click();
		await page.waitForTimeout(350);
		expect(await mode(page)).toBe('inspect');

		await page.getByRole('button', { name: 'Vuelve a la colección' }).click();
		await page.waitForTimeout(350);
		expect(await mode(page)).toBe('shelf');
	});

	test('browser Back reverses one level, not the whole journey', async ({ page }) => {
		await open(page);
		await page.locator('.shelf a').first().click();
		await page.waitForTimeout(350);
		// Turning it over replaces rather than pushes, so it must not cost a step.
		await page.getByRole('button', { name: 'Contraportada' }).click();
		await page.waitForTimeout(350);
		await page.getByRole('button', { name: 'Lee este número' }).click();
		await page.waitForTimeout(700);
		expect(await mode(page)).toBe('read');

		await page.goBack();
		await page.waitForTimeout(500);
		expect(await mode(page)).toBe('inspect');

		await page.goBack();
		await page.waitForTimeout(500);
		expect(await mode(page)).toBe('shelf');
	});
});

test.describe('restoring from the URL', () => {
	test('a direct link to a page opens the issue there', async ({ page }) => {
		await open(page, '#developer-os/p2');
		expect(await mode(page)).toBe('read');
	});

	test('a direct link to the back cover inspects the back', async ({ page }) => {
		await open(page, '#developer-os/back');
		expect(await mode(page)).toBe('inspect');
		await expect(page.locator('.backface')).toBeVisible();
	});

	test('an issue that does not exist falls back to the shelf', async ({ page }) => {
		await open(page, '#not-an-issue');
		expect(await mode(page)).toBe('shelf');
	});

	test('a page beyond the issue settles on one that exists', async ({ page }) => {
		await open(page, '#segispro/p999');
		// Clamped rather than refused: still reading, not thrown back to the shelf.
		expect(await mode(page)).toBe('read');
	});
});
