import { test, expect } from '@playwright/test';

/**
 * Milestone 1, the path that has to work when nothing else does: with scripting
 * off the shelf is what it was server-rendered as — a list of ordinary links to
 * the issues' canonical routes, each one a readable document.
 */
test.use({ javaScriptEnabled: false });
test('the shelf degrades to ordinary issue links', async ({ page }, info) => {
	test.skip(info.project.name !== 'landscape', 'one pass is enough');
	await page.goto('/spike/experience?lang=es');
	const links = page.locator('.shelf a');
	await expect(links).toHaveCount(5);
	const hrefs = await links.evaluateAll((els) => els.map((e) => e.getAttribute('href')));
	expect(hrefs).toEqual([
		'/es/missions/segispro',
		'/es/missions/formarpro',
		'/es/missions/transmeralda',
		'/es/missions/developer-os',
		'/es/missions/gym-vancouver'
	]);
	// And the destination is a readable document, not a closed cover.
	await links.first().click();
	await expect(page.locator('h1, h2').first()).toBeVisible();
	expect(page.url()).toContain('/es/missions/segispro');
});
