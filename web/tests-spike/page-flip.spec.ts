import { test, expect, type Page } from '@playwright/test';

/**
 * Milestone 0 — the StPageFlip compatibility spike.
 *
 * These tests do not assert that StPageFlip is good. They pin down what it
 * actually does to a Svelte-owned page tree, so that milestone 5 starts from
 * measurements rather than from the library's documentation, and so that a
 * later version changing any of this fails here first.
 *
 * The findings are written up in `docs/comic-reader/LIBRARY-INTERACTION.md`.
 *
 * Run with: npm run test:spike
 */

interface Probe {
	live: boolean;
	page: number;
	pageCount: number;
	orientation: string;
	clicks: number;
	generation: number;
	events: string[];
	errors: string[];
	domPages: number;
	duplicateIds: number;
	generated: { parent: number; wrapper: number; block: number; item: number; shadow: number };
	anchors: number;
	clippedVisible: { id: string; clipped: boolean; overflows: boolean }[];
}

const probe = (page: Page): Promise<Probe> =>
	page.evaluate(() => (window as unknown as { __spike: { probe(): Probe } }).__spike.probe());

/** The turn is 600ms; give it room plus the settle. */
const settle = (page: Page) => page.waitForTimeout(1100);

async function open(page: Page) {
	await page.goto('/spike/page-flip');
	await page.waitForFunction(() => (window as unknown as { __spike?: unknown }).__spike);
	await settle(page);
}

/**
 * Click where the element is rather than through Playwright's actionability
 * check: the generated shadow overlays parts of a page, and refusing to click
 * is the behaviour under test, not a reason to skip it.
 */
async function clickCentre(page: Page, testId: string): Promise<boolean> {
	const box = await page
		.getByTestId(testId)
		.first()
		.boundingBox()
		.catch(() => null);
	if (!box) return false;
	await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
	return true;
}

async function swipe(page: Page, from: [number, number], to: [number, number], steps: number) {
	const cdp = await page.context().newCDPSession(page);
	const send = (type: string, points: { x: number; y: number }[]) =>
		cdp.send('Input.dispatchTouchEvent', {
			type,
			touchPoints: points
		} as Parameters<typeof cdp.send>[1]);

	await send('touchStart', [{ x: from[0], y: from[1] }]);
	for (let i = 1; i <= steps; i += 1) {
		await send('touchMove', [
			{
				x: Math.round(from[0] + ((to[0] - from[0]) * i) / steps),
				y: Math.round(from[1] + ((to[1] - from[1]) * i) / steps)
			}
		]);
		await page.waitForTimeout(20);
	}
	await send('touchEnd', []);
	await page.waitForTimeout(1200);
}

test.beforeEach(async ({ page }) => {
	// Nothing below is allowed to pass while the page is throwing.
	page.on('pageerror', (error) => {
		throw error;
	});
});

test.describe('what loadFromHTML() does to the tree', () => {
	test('it moves the live nodes rather than cloning them', async ({ page }) => {
		await open(page);
		const after = await probe(page);

		expect(after.live).toBe(true);
		expect(after.domPages).toBe(5);
		// Nothing is duplicated: the same five elements are re-parented, keeping
		// their ids and Svelte's own scope class.
		expect(after.duplicateIds).toBe(0);
		expect(after.generated.item).toBe(5);
		expect(after.generated.wrapper).toBe(1);
		expect(after.generated.block).toBe(1);

		const kept = await page.evaluate(() => {
			const el = document.querySelector('#spike-cover');
			return {
				insideBlock: Boolean(el?.closest('.stf__block')),
				keptScopeClass: [...(el?.classList ?? [])].some((c) => c.startsWith('svelte-')),
				gotLibraryClass: el?.classList.contains('stf__item') ?? false
			};
		});
		expect(kept).toEqual({ insideBlock: true, keptScopeClass: true, gotLibraryClass: true });
	});

	test('the Svelte binding on a button inside a page survives', async ({ page }) => {
		await open(page);
		await page.getByTestId('next').click();
		await settle(page);
		expect(await page.getByTestId('handler').first().isVisible()).toBe(true);

		// Dispatch on the element itself. This asks one question only: is the
		// component's `onclick` still attached to the node the library moved?
		await page.evaluate(() =>
			document.querySelector<HTMLButtonElement>('[data-testid="handler"]')?.click()
		);
		await page.waitForTimeout(250);
		expect((await probe(page)).clicks).toBe(1);
	});

	test('whether a pointer reaches that button depends on the generated shadows', async ({
		page
	}) => {
		await open(page);
		await page.getByTestId('next').click();
		await settle(page);

		// On a phone the book sits below the fold, and `elementFromPoint` works in
		// viewport coordinates: scroll first or it answers `null` for everything.
		await page.getByTestId('handler').first().scrollIntoViewIfNeeded();
		await page.waitForTimeout(200);

		const topmost = await page.evaluate(() => {
			const el = document.querySelector<HTMLElement>('[data-testid="handler"]');
			if (!el) return null;
			const r = el.getBoundingClientRect();
			return document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)?.className ?? null;
		});
		expect(topmost).not.toBeNull();

		await clickCentre(page, 'handler');
		await page.waitForTimeout(250);
		const clicks = (await probe(page)).clicks;

		// The two outcomes are the finding: an element the library's shadow does
		// not cover is clickable, and one it covers is inert. Which of the two a
		// given control gets depends on where it lands on the sheet, so the
		// adapter cannot leave interactive content to chance.
		if (topmost?.includes('stf__')) expect(clicks).toBe(0);
		else expect(clicks).toBe(1);
	});

	test('an anchor keeps its href, but a generated shadow can intercept the click', async ({
		page
	}) => {
		await open(page);
		await page.getByTestId('next').click();
		await settle(page);

		const anchor = page.getByTestId('anchor').first();
		// The link survives as a link: correct href, present in the document.
		await expect(anchor).toHaveAttribute('href', '/es/missions/segispro');
		expect((await probe(page)).anchors).toBe(1);

		// What sits on top of it at its own centre point, though, is the library's.
		const topmost = await page.evaluate(() => {
			const el = document.querySelector<HTMLElement>('[data-testid="anchor"]');
			if (!el) return null;
			const r = el.getBoundingClientRect();
			const top = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
			return top?.className ?? null;
		});

		if (topmost?.includes('stf__')) {
			// Then clicking it does nothing, which is the point of this test.
			await clickCentre(page, 'anchor');
			await page.waitForTimeout(1200);
			expect(page.url()).toContain('/spike/page-flip');
		}
	});
});

test.describe('portrait', () => {
	test('shows one page and duplicates no ids, focus targets or pages', async ({ page }, info) => {
		test.skip(info.project.name !== 'portrait', 'portrait project only');
		await open(page);
		const after = await probe(page);

		expect(after.orientation).toBe('portrait');
		expect(after.domPages).toBe(5);
		expect(after.duplicateIds).toBe(0);
		expect(after.generated.item).toBe(5);
		// One page on screen at a time; the rest are hidden, not copied.
		expect(after.clippedVisible).toHaveLength(1);
	});
});

test.describe('Spanish reflow', () => {
	test('copy is not clipped on the cover, the first turn, or after it', async ({ page }) => {
		await open(page);
		expect((await probe(page)).clippedVisible.every((p) => !p.clipped && !p.overflows)).toBe(true);

		await page.getByTestId('next').click();
		// Mid-turn, while the sheet is in motion.
		await page.waitForTimeout(300);
		expect((await probe(page)).clippedVisible.every((p) => !p.overflows)).toBe(true);

		await settle(page);
		const settled = await probe(page);
		expect(settled.clippedVisible.length).toBeGreaterThan(0);
		expect(settled.clippedVisible.every((p) => !p.clipped && !p.overflows)).toBe(true);
	});
});

test.describe('controls', () => {
	test('the library binds no keyboard of its own', async ({ page }) => {
		await open(page);
		// Focus the document, not a control: a focused button would answer Space
		// itself and look like a library binding.
		await page.locator('h1').click();
		const before = (await probe(page)).page;

		for (const key of ['ArrowRight', 'ArrowLeft', 'PageDown', 'End', 'Space']) {
			await page.keyboard.press(key);
			await page.waitForTimeout(400);
		}

		// Unchanged: every keyboard path stays the application's to build.
		expect((await probe(page)).page).toBe(before);
	});

	test('next reports the page it landed on', async ({ page }) => {
		await open(page);
		expect((await probe(page)).page).toBe(0);

		await page.getByTestId('next').click();
		await settle(page);
		const forward = await probe(page);
		expect(forward.page).toBeGreaterThan(0);
		// The event and the getter agree, so a reducer can trust either one.
		expect(forward.events.filter((e) => e.startsWith('flip:')).at(-1)).toBe(`flip:${forward.page}`);
	});

	test('flipPrev() cannot reach the cover in portrait; turnToPage(0) can', async ({
		page
	}, info) => {
		await open(page);
		await page.getByTestId('next').click();
		await settle(page);
		expect((await probe(page)).page).toBe(1);

		await page.getByTestId('prev').click();
		await settle(page);
		const afterPrev = (await probe(page)).page;

		if (info.project.name === 'portrait') {
			// StPageFlip 2.0.7, `showCover: true`, one page at a time: going back
			// from page 1 to the cover emits no event and moves nothing, however
			// many times it is asked. Pressing it twice does not help either.
			expect(afterPrev).toBe(1);
			await page.getByTestId('prev').click();
			await settle(page);
			expect((await probe(page)).page).toBe(1);

			// The way back is to address the page directly.
			await page.getByTestId('to-cover').click();
			await settle(page);
			expect((await probe(page)).page).toBe(0);
		} else {
			expect(afterPrev).toBe(0);
		}
	});

	test('disableFlipByClick means a corner click does not turn the page', async ({ page }) => {
		await open(page);
		const box = await page.getByTestId('book').boundingBox();
		expect(box).not.toBeNull();
		if (!box) return;

		await page.mouse.click(box.x + box.width - 12, box.y + box.height - 12);
		await settle(page);
		expect((await probe(page)).page).toBe(0);
	});
});

test.describe('touch', () => {
	test('a vertical swipe scrolls the document instead of turning a page', async ({ page }) => {
		await open(page);
		await page.evaluate(() => window.scrollTo(0, 0));
		const box = await page.getByTestId('book').boundingBox();
		expect(box).not.toBeNull();
		if (!box) return;

		const x = Math.round(box.x + box.width / 2);
		const y = Math.round(box.y + box.height / 2);
		await swipe(page, [x, y], [x, y - 180], 8);

		// mobileScrollSupport holds: the page scrolled and the book did not turn.
		expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(50);
		expect((await probe(page)).page).toBe(0);
	});

	test('a horizontal swipe turns only from the outer edge, and only quickly', async ({
		page
	}, info) => {
		test.skip(info.project.name !== 'landscape', 'measured in landscape');
		const turned: Record<string, number> = {};

		for (const [name, startFraction, steps] of [
			['outer edge, fast', 0.96, 5],
			['outer edge, slow', 0.96, 14],
			['mid page, slow', 0.75, 14]
		] as const) {
			await open(page);
			const box = await page.getByTestId('book').boundingBox();
			if (!box) continue;
			const y = Math.round(box.y + box.height / 2);
			await swipe(
				page,
				[Math.round(box.x + box.width * startFraction), y],
				[Math.round(box.x + box.width * 0.1), y],
				steps
			);
			turned[name] = (await probe(page)).page;
		}

		// The narrow window is the finding: only the fast gesture from the outer
		// edge commits. The existing reader commits at 35% of a page width from
		// anywhere on the book, so this is a downgrade the adapter has to cover.
		expect(turned['outer edge, fast']).toBe(1);
		expect(turned['outer edge, slow']).toBe(0);
		expect(turned['mid page, slow']).toBe(0);
	});
});

test.describe('lifecycle', () => {
	test('destroy() takes the host page tree with it', async ({ page }) => {
		await open(page);
		expect((await probe(page)).domPages).toBe(5);

		await page.getByTestId('destroy').click();
		await page.waitForTimeout(300);
		const after = await probe(page);

		// Its own generated structure is cleaned up properly…
		expect(after.generated).toEqual({ parent: 0, wrapper: 0, block: 0, item: 0, shadow: 0 });
		// …but so are the elements Svelte rendered, which it did not own.
		expect(after.domPages).toBe(0);

		// So a plain re-create cannot work: there is nothing left to load.
		await page.getByTestId('create').click();
		await page.waitForTimeout(600);
		expect((await probe(page)).live).toBe(false);

		// Rebuilding the container first is what makes a second instance possible.
		await page.getByTestId('rebuild').click();
		await settle(page);
		const rebuilt = await probe(page);
		expect(rebuilt.live).toBe(true);
		expect(rebuilt.domPages).toBe(5);
		expect(rebuilt.errors).toEqual([]);
	});

	test('repeated rebuilds do not accumulate generated structure', async ({ page }) => {
		await open(page);
		for (let i = 0; i < 4; i += 1) {
			await page.getByTestId('rebuild').click();
			await settle(page);
		}

		const after = await probe(page);
		expect(after.generation).toBe(4);
		expect(after.generated).toEqual({ parent: 1, wrapper: 1, block: 1, item: 5, shadow: 4 });
		expect(after.errors).toEqual([]);
	});

	test('locale and issue swap safely when the instance is destroyed first', async ({ page }) => {
		await open(page);

		await page.getByTestId('locale-en').click();
		await settle(page);
		const english = await probe(page);
		expect(english.live).toBe(true);
		expect(english.pageCount).toBe(5);
		expect(english.errors).toEqual([]);
		await expect(page.locator('[data-spike-page] h2').first()).toHaveText(
			'Issue #1227 — introductory'
		);

		await page.getByTestId('issue-case').click();
		await settle(page);
		const cased = await probe(page);
		expect(cased.live).toBe(true);
		expect(cased.pageCount).toBe(4);
		expect(cased.domPages).toBe(4);
		expect(cased.errors).toEqual([]);
	});

	test('swapping content under a live instance desynchronises it', async ({ page }) => {
		await open(page);
		await page.getByTestId('ordered-swap').uncheck();
		await page.getByTestId('issue-case').click();
		await settle(page);

		const after = await probe(page);
		// Svelte replaced the tree with the four-page issue; the library still
		// believes it holds five, and only one element is still one of its items.
		expect(after.domPages).toBe(4);
		expect(after.pageCount).toBe(5);
		expect(after.generated.item).toBeLessThan(4);
	});

	test('a resize across the breakpoint reflows the orientation', async ({ page }, info) => {
		test.skip(info.project.name !== 'landscape', 'needs a resizable viewport');
		await open(page);
		expect((await probe(page)).orientation).toBe('landscape');

		await page.setViewportSize({ width: 560, height: 900 });
		await page.waitForTimeout(900);
		expect((await probe(page)).orientation).toBe('portrait');

		await page.setViewportSize({ width: 1280, height: 900 });
		await page.waitForTimeout(900);
		const back = await probe(page);
		expect(back.orientation).toBe('landscape');
		expect(back.errors).toEqual([]);
	});
});

test.describe('reduced motion', () => {
	test.use({ reducedMotion: 'reduce' });

	test('the library animates the turn anyway', async ({ page }) => {
		await open(page);
		await page.getByTestId('next').click();

		// Sampled inside the configured 600ms: still mid-flight, so the preference
		// reaches nothing the library does. `flippingTime` has to be set from the
		// media query by the adapter.
		await page.waitForTimeout(220);
		const midFlight = (await probe(page)).events.at(-1);
		expect(midFlight).toBe('state:flipping');

		await settle(page);
		expect((await probe(page)).page).toBeGreaterThan(0);
	});
});
