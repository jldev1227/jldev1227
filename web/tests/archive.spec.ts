import { expect, test, type Page } from '@playwright/test';

/**
 * The `/missions` archive: a grid of covers, and the modal reader an issue opens
 * in. What matters is that the grid is ordinary links first, one tab stop once
 * enhanced, and that every way out of an issue — the button, Escape, browser
 * Back — lands focus back on the cover it came from.
 */

const issue = (page: Page) => page.locator('dialog.issue');
const book = (page: Page) => page.locator('dialog.issue .reader[data-enhanced] .book');
const focusedLabel = (page: Page) =>
	page.evaluate(() => document.activeElement?.getAttribute('aria-label') ?? null);

/** Take hold of the book at a fraction of its width and carry it sideways. */
async function drag(page: Page, from: number, dx: number) {
	const rect = await book(page).boundingBox();
	if (!rect) throw new Error('the book was not measurable');
	const y = rect.y + Math.min(rect.height * 0.4, 300);
	await page.mouse.move(rect.x + rect.width * from, y);
	await page.mouse.down();
	await page.mouse.move(rect.x + rect.width * from + dx, y, { steps: 14 });
	await page.mouse.up();
}

/**
 * Opening an issue is a View Transition, and while it runs the page is a
 * snapshot that takes no pointer input. A drag has to wait for it to finish.
 */
const transitioned = (page: Page) =>
	expect
		.poll(() => page.evaluate(() => document.documentElement.matches(':active-view-transition')), {
			timeout: 4000
		})
		.toBe(false);

const settled = (page: Page) =>
	expect
		.poll(() => page.locator('dialog.issue .reader').getAttribute('data-mode'), { timeout: 4000 })
		.not.toBe('turning');

test.describe('the grid', () => {
	test('lays every project out as an illustrated cover', async ({ page }, info) => {
		await page.goto('/es/missions');
		const covers = page.locator('.volume');
		await expect(covers).toHaveCount(6);
		await expect(covers.first()).toHaveAttribute('aria-label', 'Abre SEGISPRO');

		await expect(page.locator('.volume[data-art] img')).toHaveCount(6);
		await expect(page.locator('.volume img')).toHaveCount(6);

		// Four across on a desk, two on a phone — the count steps down with the
		// width rather than the covers shrinking.
		const tops = await covers.evaluateAll((els) => els.map((el) => el.getBoundingClientRect().top));
		const firstRow = tops.filter((top) => Math.abs(top - tops[0]) < 2).length;
		expect(firstRow).toBe(info.project.name === 'spread' ? 4 : 2);
	});

	test('is a single tab stop walked with the arrows', async ({ page }, info) => {
		await page.goto('/es/missions');
		await expect(page.locator('.volume[tabindex="0"]')).toHaveCount(1);

		await page.getByRole('link', { name: 'Abre SEGISPRO' }).focus();
		await page.keyboard.press('ArrowRight');
		expect(await focusedLabel(page)).toBe('Abre FORMARPRO');

		// Down steps a whole row, by however many columns the grid has.
		await page.keyboard.press('ArrowDown');
		expect(await focusedLabel(page)).toBe(
			info.project.name === 'spread' ? 'Abre MANEJO COMENTADO' : 'Abre DEVELOPER OS'
		);

		await page.keyboard.press('Home');
		expect(await focusedLabel(page)).toBe('Abre SEGISPRO');
		await page.keyboard.press('ArrowLeft');
		expect(await focusedLabel(page)).toBe('Abre SEGISPRO');
		await page.keyboard.press('End');
		expect(await focusedLabel(page)).toBe('Abre MANEJO COMENTADO');
	});

	test('the server-rendered archive keeps canonical links', async ({ request }) => {
		const html = await (await request.get('/es/missions')).text();
		for (const slug of [
			'segispro',
			'formarpro',
			'transmeralda',
			'developer-os',
			'gym-vancouver',
			'manejo-comentado'
		]) {
			expect(html).toContain(`href="/es/missions/${slug}"`);
		}
	});
});

test.describe('reading an issue', () => {
	test('opens the selected comic in a modal reader', async ({ page }) => {
		await page.goto('/es/missions');
		await page.getByRole('link', { name: 'Abre SEGISPRO' }).focus();
		await page.keyboard.press('Space');

		// A real modal: top layer, focus trapped, the grid inert behind it.
		await expect(issue(page)).toBeVisible();
		expect(await issue(page).evaluate((el) => el.matches(':modal'))).toBe(true);
		await expect(book(page)).toBeVisible();
		await expect(page).toHaveURL(/#segispro\/p0$/);
		await expect(page.getByRole('button', { name: 'Cierra el número' })).toBeVisible();
		expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).toBe('hidden');

		// Focus is on the book, so the keys work at once.
		await expect(page.getByRole('button', { name: 'Abre el número' })).toBeFocused();

		// A drag across the cover opens it, and the URL follows.
		await transitioned(page);
		const rect = await book(page).boundingBox();
		if (!rect) throw new Error('the book was not measurable');
		await drag(page, 0.8, -Math.max(180, rect.width * 0.45));
		await settled(page);
		await expect(page).toHaveURL(/#segispro\/p1$/);

		// Closing puts it back where it came from.
		await page.getByRole('button', { name: 'Cierra el número' }).click();
		await expect(issue(page)).toHaveCount(0);
		await expect(page.getByRole('link', { name: 'Abre SEGISPRO' })).toBeFocused();
		await expect(page).toHaveURL(/\/es\/missions$/);
	});

	test('a case file reads the same eight pages as its canonical route', async ({ page }) => {
		await page.goto('/es/missions');
		await page.getByRole('link', { name: 'Abre FORMARPRO' }).click();
		await expect(book(page)).toBeVisible();

		const ids = await page
			.locator('dialog.issue .page')
			.evaluateAll((els) => els.map((el) => el.id));
		expect(ids).toEqual([
			'formarpro--challenge',
			'formarpro--log',
			'formarpro--stack',
			'formarpro--approach',
			'formarpro--architecture',
			'formarpro--modules',
			'formarpro--before-after',
			'formarpro--outcome'
		]);

		// The closing page offers the document itself, not the archive it is
		// already on. On a spread the last view leads with page 7.
		await page.keyboard.press('End');
		await settled(page);
		await expect(page).toHaveURL(/#formarpro\/p[78]$/);
		const action = page.locator('#formarpro--outcome .actions a').first();
		await expect(action).toHaveText('Leer el expediente');
		await expect(action).toHaveAttribute('href', '/es/missions/formarpro');
	});

	test('the project log is read from the repositories, not written', async ({ page }) => {
		await page.goto('/es/missions#segispro/p2');
		await expect(book(page)).toBeVisible();

		// One bar per month between the first and the last commit, and the
		// busiest one marked. The numbers come from `project-history.ts`.
		const log = page.locator('#segispro--log');
		const bars = log.locator('.sparkline rect');
		expect(await bars.count()).toBeGreaterThanOrEqual(11);
		await expect(log.locator('.sparkline rect[data-peak]')).toHaveCount(1);
		await expect(log.locator('.figure').first()).toContainText(/\d{3}/);
		await expect(log.locator('.repos li')).toHaveCount(2);

		// The stack page prints the core with marks and the toolkit behind it.
		const stack = page.locator('#segispro--stack');
		expect(await stack.locator('.technology-list.core li svg').count()).toBeGreaterThanOrEqual(4);
		expect(await stack.locator('.technology-list:not(.core) li').count()).toBeGreaterThanOrEqual(8);
	});

	test('Escape closes the issue and restores focus', async ({ page }) => {
		await page.goto('/en/missions');
		await page.getByRole('link', { name: 'Open DEVELOPER OS' }).click();
		await expect(book(page)).toBeVisible();

		await page.keyboard.press('Escape');
		await expect(issue(page)).toHaveCount(0);
		await expect(page.getByRole('link', { name: 'Open DEVELOPER OS' })).toBeFocused();
		await expect(page).toHaveURL(/\/en\/missions$/);
	});

	test('browser Back closes the issue', async ({ page }) => {
		await page.goto('/es/missions');
		await page.getByRole('link', { name: 'Abre TRANSMERALDA × COTRANSMEQ' }).click();
		await expect(book(page)).toBeVisible();

		await page.goBack();
		await expect(issue(page)).toHaveCount(0);
		await expect(page).toHaveURL(/\/es\/missions$/);
		await expect(page.getByRole('link', { name: 'Abre TRANSMERALDA × COTRANSMEQ' })).toBeFocused();
	});

	test('a page deep in an issue is restored from the URL', async ({ page }) => {
		await page.goto('/es/missions#gym-vancouver/p3');
		await expect(book(page)).toBeVisible();
		await expect(page).toHaveURL(/#gym-vancouver\/p3$/);
		await expect(page.locator('dialog.issue .status')).toContainText('3');
		// Open there already: no cover, no turn.
		await expect(page.locator('dialog.issue .reader')).toHaveAttribute('data-mode', 'open');
	});

	test('the book is centred closed and open, and fits a short screen', async ({ page }, info) => {
		test.skip(info.project.name !== 'spread', 'centring is a two-page matter');
		await page.goto('/es/missions#segispro/p0');
		await expect(book(page)).toBeVisible();
		// The modal measures the room and sizes the stage a frame later.
		await expect
			.poll(() => page.locator('dialog.issue .host > .stage').evaluate((el) => el.style.width))
			.not.toBe('');

		const centreOf = (selector: string) =>
			page.evaluate((s) => {
				const r = document.querySelector(s)!.getBoundingClientRect();
				return Math.round(r.left + r.width / 2 - innerWidth / 2);
			}, selector);

		// Closed: the cover alone sits in the middle, not on the right half of
		// an invisible two-page frame.
		const cover = 'dialog.issue .leaf:first-of-type .face.front';
		expect(Math.abs(await centreOf(cover))).toBeLessThanOrEqual(2);

		// A key turns the cover, and the open spread is centred as a whole.
		await page.keyboard.press('ArrowRight');
		await settled(page);
		await expect(page).toHaveURL(/#segispro\/p1$/);
		expect(Math.abs(await centreOf('dialog.issue .book'))).toBeLessThanOrEqual(2);

		// A short screen gets a smaller book: one page across, its top on
		// screen and never wider than the window. A single page is allowed to
		// grow with its content, and then the dialog scrolls rather than clips.
		await page.setViewportSize({ width: 1280, height: 600 });
		await page.waitForTimeout(600);
		const short = await page.evaluate(() => {
			const dialog = document.querySelector('dialog.issue')!;
			const r = document.querySelector('dialog.issue .book')!.getBoundingClientRect();
			return {
				view: document.querySelector('dialog.issue .reader')!.getAttribute('data-view'),
				onScreen: r.top >= 0 && r.right <= innerWidth,
				reachable: r.bottom <= innerHeight || dialog.scrollHeight > dialog.clientHeight
			};
		});
		expect(short).toEqual({ view: '1', onScreen: true, reachable: true });
	});

	test('a short, slow drag falls back to the spread it started on', async ({ page }) => {
		await page.goto('/es/missions#segispro/p1');
		await expect(book(page)).toBeVisible();
		await drag(page, 0.8, -30);
		await settled(page);
		await expect(page).toHaveURL(/#segispro\/p1$/);
	});

	test('reduced motion opens the issue without waiting for animation', async ({ page }) => {
		await page.emulateMedia({ reducedMotion: 'reduce' });
		await page.goto('/en/missions');
		await page.getByRole('link', { name: 'Open FORMARPRO' }).click();

		await expect(book(page)).toBeVisible();
		await expect(page).toHaveURL(/#formarpro\/p0$/);
		await page.keyboard.press('ArrowRight');
		await expect(page).toHaveURL(/#formarpro\/p1$/);
	});
});
