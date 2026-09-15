import { defineConfig } from 'vitest/config';

/**
 * Unit tests only, and deliberately plain: the things worth unit-testing here
 * are the pure reducers — `reader-state.ts` and `experience-state.ts` — which
 * touch no DOM, no SvelteKit runtime and no aliases. Anything that needs a
 * browser is a Playwright test instead (`playwright.config.ts` for the site,
 * `playwright.spike.config.ts` for the milestone-0 harness).
 */
export default defineConfig({
	test: {
		environment: 'node',
		include: ['src/**/*.test.ts']
	}
});
