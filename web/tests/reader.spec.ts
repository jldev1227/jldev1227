import { expect, test, type Page } from '@playwright/test';

/** How far the reader has carried the current turn, 0…1. */
async function turnProgress(page: Page): Promise<number> {
	return page.evaluate(() => {
		const reader = document.querySelector('.reader') as HTMLElement;
		return Number.parseFloat(getComputedStyle(reader).getPropertyValue('--jl-turn')) || 0;
	});
}

/** What is actually painted at a point — hit testing respects a hidden backface. */
async function at(page: Page, fraction: number): Promise<string> {
	return page.evaluate((f) => {
		const book = document.querySelector('.book')!.getBoundingClientRect();
		const el = document.elementFromPoint(book.left + book.width * f, book.top + book.height * 0.4);
		if (!el) return 'nothing';
		const article = el.closest('.page');
		if (article) return article.id;
		return el.closest('.cover') ? 'cover' : 'paper';
	}, fraction);
}

/** Take hold of the book. Returns where the pointer is, still pressed. */
async function grab(page: Page, from: number) {
	const book = await page.locator('.book').boundingBox();
	if (!book) throw new Error('no book');

	const point = { x: book.x + book.width * from, y: book.y + Math.min(book.height * 0.4, 300) };
	await page.mouse.move(point.x, point.y);
	await page.mouse.down();
	return point;
}

/** Carry the pointer further without letting go. */
async function carry(page: Page, point: { x: number; y: number }, dx: number, steps = 12) {
	point.x += dx;
	await page.mouse.move(point.x, point.y, { steps });
	return point;
}

async function settle(page: Page) {
	await page.mouse.up();
	await expect
		.poll(async () => page.locator('.reader').getAttribute('data-mode'), { timeout: 4000 })
		.not.toBe('turning');
}

test.describe('turning a page', () => {
	test('the arriving page is carried by the sheet, not waiting under it', async ({ page }) => {
		await page.goto('/es/missions/segispro');
		await expect(page.locator('.reader[data-enhanced]')).toBeVisible();

		const spread = (await page.locator('.reader').getAttribute('data-view')) === '2';
		test.skip(!spread, 'a single page has no facing page to carry');

		// Half way through the turn the cover is still in the air: page 1 rides on
		// its back and has not landed yet.
		const hold = await grab(page, 0.8);
		await carry(page, hold, -230);
		expect(await turnProgress(page)).toBeGreaterThan(0.3);
		expect(await turnProgress(page)).toBeLessThan(0.8);
		expect(await at(page, 0.25)).not.toBe('challenge');

		// Past the upright, the back of the sheet faces us and page 1 is on it.
		await carry(page, hold, -170, 6);
		expect(await turnProgress(page)).toBeGreaterThan(0.85);
		expect(await at(page, 0.25)).toBe('challenge');

		await settle(page);
		await expect(page.locator('.page#challenge')).toBeVisible();
	});

	test('a short, slow drag falls back to where it started', async ({ page }) => {
		await page.goto('/es/missions/segispro');
		await expect(page.locator('.reader[data-enhanced]')).toBeVisible();
		const before = await page.locator('.reader').getAttribute('data-mode');

		await carry(page, await grab(page, 0.8), -40, 20);
		await settle(page);

		await expect(page.locator('.reader')).toHaveAttribute('data-mode', before!);
		expect(new URL(page.url()).hash).toBe('');
	});

	test('a full drag turns the page and records it in the URL', async ({ page }) => {
		await page.goto('/es/missions/segispro');
		await expect(page.locator('.reader[data-enhanced]')).toBeVisible();

		await carry(page, await grab(page, 0.8), -320);
		await settle(page);

		expect(new URL(page.url()).hash).toBe('#challenge');
	});
});

test.describe('the gesture and the links do not fight', () => {
	test('dragging across a case file does not open it', async ({ page }) => {
		await page.goto('/es/missions/developer-os#outcome');
		await expect(page.locator('.reader[data-enhanced]')).toBeVisible();
		await expect(page.locator('.actions a').first()).toBeVisible();

		const control = await page.locator('.actions a').first().boundingBox();
		if (!control) throw new Error('no control');

		await page.mouse.move(control.x + control.width / 2, control.y + control.height / 2);
		await page.mouse.down();
		await page.mouse.move(control.x - 260, control.y + control.height / 2, { steps: 12 });
		await settle(page);

		expect(new URL(page.url()).pathname).toBe('/es/missions/developer-os');
	});

	test('nothing in the book starts a selection or a native drag', async ({ page }) => {
		await page.goto('/es/missions/segispro');
		await expect(page.locator('.reader[data-enhanced]')).toBeVisible();

		const styles = await page.evaluate(() => {
			const book = getComputedStyle(document.querySelector('.book')!);
			const link = document.querySelector('.book a');
			return {
				userSelect: book.userSelect,
				linkDrag: link ? getComputedStyle(link).getPropertyValue('-webkit-user-drag') : 'none'
			};
		});

		expect(styles.userSelect).toBe('none');
		expect(styles.linkDrag).toBe('none');
	});
});

test.describe('every link goes where it says', () => {
	test('the closing page of a case file', async ({ page }) => {
		await page.goto('/es/missions/developer-os#outcome');
		await expect(page.locator('.reader[data-enhanced]')).toBeVisible();

		const expected: Record<string, string> = {
			'Volver al número #1227': '/es',
			'Todas las misiones': '/es/missions',
			'Verlo en GitHub ↗': 'https://github.com/jldev1227'
		};

		for (const [label, destination] of Object.entries(expected)) {
			const href = await page
				.locator('#outcome a', { hasText: label })
				.first()
				.getAttribute('href');
			expect(href, `"${label}"`).toBe(destination);
		}
	});

	test('the document the server sends carries no relative link', async ({ request }) => {
		for (const path of ['/es', '/es/missions/developer-os', '/en/missions/gym-vancouver']) {
			const html = await (await request.get(path)).text();
			const relative = [...html.matchAll(/(?:href|src)="(\.{1,2}\/[^"]*)"/g)].map((m) => m[1]);
			expect(relative, `relative URLs in ${path}`).toEqual([]);
		}
	});

	test('the closing page of an issue read from the archive', async ({ page }) => {
		await page.goto('/es/missions');
		await page.getByRole('link', { name: 'Abre SEGISPRO' }).click();
		await expect(page.locator('dialog.issue .reader[data-enhanced] .book')).toBeVisible();
		await page.keyboard.press('End');
		await expect
			.poll(() => page.locator('dialog.issue .reader').getAttribute('data-mode'), { timeout: 4000 })
			.not.toBe('turning');

		const control = page.locator('#segispro--outcome .actions a', {
			hasText: 'Leer el expediente'
		});
		await expect(control).toBeVisible();
		await control.click();
		await page.waitForURL('**/missions/segispro');
		await expect(page).toHaveTitle(/SEGISPRO/);
	});
});

test('every issue of the collection is printed at the same page size', async ({ page }) => {
	const size = async (path: string) => {
		await page.goto(path);
		await expect(page.locator('.reader[data-enhanced]')).toBeVisible();
		return page.evaluate(() => {
			const reader = document.querySelector('.reader') as HTMLElement;
			const book = document.querySelector('.book')!.getBoundingClientRect();
			const columns = reader.dataset.view === '2' ? 2 : 1;
			return Math.round((book.width / columns / book.height) * 100) / 100;
		});
	};

	const intro = await size('/es/missions/formarpro');
	const caseFile = await size('/es/missions/segispro');

	// On a spread the page size is set outright. On one narrow page the content
	// legitimately makes the sheet taller than a printed page would be, so the
	// two issues only have to agree, not match to the pixel.
	expect(Math.abs(intro - caseFile)).toBeLessThanOrEqual(0.1);
});
