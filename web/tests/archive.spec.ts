import { expect, test } from '@playwright/test';

test('the homepage archive opens a selected comic directly in StPageFlip', async ({ page }) => {
	await page.goto('/es');

	const intro = page.getByRole('link', { name: 'Toma JLDEV #1227' });
	await intro.focus();
	await page.keyboard.press('ArrowRight');
	await expect(page.getByRole('link', { name: 'Toma SEGISPRO' })).toBeFocused();

	await page.keyboard.press('Space');
	await expect(page.locator('.st-reader.enhanced .stf__parent')).toBeVisible();
	await expect(page).toHaveURL(/#segispro\/p0$/);
	await expect(page.getByRole('button', { name: 'Devuélvelo a la caja' })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Contraportada' })).toHaveCount(0);
	await expect(page.getByRole('button', { name: 'Lee este número' })).toHaveCount(0);

	const book = await page.locator('.stf__block').boundingBox();
	if (!book) throw new Error('StPageFlip book was not measurable');
	await page.mouse.move(book.x + book.width - 5, book.y + book.height - 5);
	await page.mouse.down();
	await page.mouse.move(book.x - Math.max(40, book.width * 0.35), book.y + book.height - 30, {
		steps: 16
	});
	await page.mouse.up();
	await expect(page).toHaveURL(/#segispro\/p1$/, { timeout: 4000 });

	await page.getByRole('button', { name: 'Devuélvelo a la caja' }).click();
	await expect(page.getByRole('link', { name: 'Toma SEGISPRO' })).toBeFocused();
	await expect(page).toHaveURL(/\/es$/);
});

test('reduced motion settles the pickup without waiting for animation', async ({ page }) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.goto('/en');
	await page.getByRole('link', { name: 'Pick up FORMARPRO' }).click();

	await expect(page.locator('.st-reader.enhanced .stf__parent')).toBeVisible();
	await expect(page).toHaveURL(/#formarpro\/p0$/);
});

test('the server-rendered archive keeps canonical project links', async ({ request }) => {
	const html = await (await request.get('/es')).text();
	for (const slug of ['segispro', 'formarpro', 'transmeralda', 'developer-os', 'gym-vancouver']) {
		expect(html).toContain(`href="/es/missions/${slug}"`);
	}
});
