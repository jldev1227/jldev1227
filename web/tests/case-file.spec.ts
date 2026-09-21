import { expect, test, type Page } from '@playwright/test';

/**
 * A case file is a document now, not a book. These tests exist for the things
 * the in-app browser could not answer: a link followed from the HTML the server
 * sent, a hash that has to land on a real section, and a hero whose plate must
 * not push its own headline out through the clip.
 */

const CASE = '/es/missions/segispro';

/** The sections the rail offers, in the order it offers them. */
async function railSections(page: Page): Promise<string[]> {
	return page
		.locator('.case-rail a')
		.evaluateAll((links) => links.map((link) => (link as HTMLAnchorElement).hash.slice(1)));
}

test.describe('the file reads as a page', () => {
	test('the narrative is in the document the server sent', async ({ browser }) => {
		// No JavaScript at all: whatever a crawler or a reader without it gets.
		const context = await browser.newContext({ javaScriptEnabled: false });
		const bare = await context.newPage();
		await bare.goto(CASE);

		await expect(bare.locator('h1')).toHaveText('SEGISPRO');
		await expect(bare.locator('#challenge p').first()).not.toBeEmpty();
		await expect(bare.locator('#outcome p').first()).not.toBeEmpty();
		await expect(bare.locator('.case-rail a').first()).toBeVisible();
		await context.close();
	});

	test('every anchor the rail names is a section on the page', async ({ page }) => {
		await page.goto(CASE);

		const ids = await railSections(page);
		expect(ids.length).toBeGreaterThan(4);

		for (const id of ids) {
			await expect(page.locator(`section#${id}`)).toHaveCount(1);
		}
	});

	test('a section hash opens the page at that section', async ({ page }) => {
		await page.goto(`${CASE}#before-after`);

		const section = page.locator('#before-after');
		await expect(section).toBeVisible();

		// Below the sticky rail rather than under it. Scrolling is smooth, so the
		// assertion has to wait for it to settle rather than read the first frame.
		const railHeight = (await page.locator('.case-rail').boundingBox())!.height;
		await expect
			.poll(async () => Math.round((await section.boundingBox())!.y), { timeout: 4000 })
			.toBeLessThan(260);
		const box = (await section.boundingBox())!;
		expect(box.y).toBeGreaterThanOrEqual(railHeight - 2);
	});
});

test.describe('the hero', () => {
	test('the plate is printed and the headline stays inside the frame', async ({ page }) => {
		await page.goto(CASE);

		const hero = (await page.locator('.case-hero').boundingBox())!;
		const headline = (await page.locator('.case-headline').boundingBox())!;
		const art = (await page.locator('.case-art img').boundingBox())!;

		// The plate sized the grid row twice during the redesign, which carried
		// the headline a thousand pixels below the hero's own clip.
		expect(headline.y + headline.height).toBeLessThanOrEqual(hero.y + hero.height + 1);
		expect(headline.y).toBeGreaterThanOrEqual(hero.y - 1);

		// And the illustration is the protagonist, not a strip: a column beside
		// the story on a desk, a plate above it on a phone, never a letterbox.
		expect(art.height).toBeGreaterThan(300);
		expect(art.width).toBeGreaterThan(300);
	});

	test('the plate is decorative, so the heading is what names the page', async ({ page }) => {
		await page.goto(CASE);

		await expect(page.locator('.case-art img')).toHaveAttribute('alt', '');
		await expect(page.locator('h1')).toHaveText('SEGISPRO');
	});
});

test.describe('the collection continues', () => {
	test('the next case file is a link to another case file', async ({ page }) => {
		await page.goto(CASE);

		const slug = await page
			.locator('.case-more a.next')
			.evaluate((link) => (link as HTMLAnchorElement).pathname);
		expect(slug).not.toBe(new URL(CASE, 'https://x').pathname);

		await page.locator('.case-more a.next').click();
		// Waiting on the pattern alone would resolve against the URL we started
		// from, which already matches it.
		await page.waitForURL((url) => url.pathname === slug);
		await expect(page.locator('h1')).not.toHaveText('SEGISPRO');
	});

	test('the masthead carries the reader back to the worlds', async ({ page }) => {
		await page.goto(CASE);

		await page.locator('.masthead a.logo').click();
		await page.waitForURL(/\/es$/);
		await expect(page.locator('#missions')).toHaveCount(1);
	});
});

test('nothing on the page scrolls sideways', async ({ page }) => {
	await page.goto(CASE);

	const overflows = await page.evaluate(
		() => document.documentElement.scrollWidth > window.innerWidth + 1
	);
	expect(overflows).toBe(false);
});
