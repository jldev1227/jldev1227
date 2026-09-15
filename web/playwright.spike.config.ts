import { defineConfig, devices } from '@playwright/test';

/**
 * Milestone 0's harness lives behind a `dev` guard — the route 404s in a
 * production build on purpose, so that the spike cannot reach the site or the
 * prerendered output. That puts it out of reach of `playwright.config.ts`,
 * which runs the shipping suite against `vite preview`.
 *
 * Hence a second, separate config: a dev server, its own port, its own test
 * directory. `npm run test:spike`.
 */
export default defineConfig({
	testDir: 'tests-spike',
	fullyParallel: false,
	workers: 1,
	reporter: 'list',

	use: {
		baseURL: 'http://127.0.0.1:5199',
		trace: 'on-first-retry'
	},

	projects: [
		{
			name: 'landscape',
			use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 900 } }
		},
		{
			name: 'portrait',
			use: { ...devices['Pixel 7'] }
		}
	],

	webServer: {
		// `localhost` resolves to ::1 on macOS; the tests ask for 127.0.0.1.
		command: 'npm run dev -- --port 5199 --host 127.0.0.1 --strictPort',
		port: 5199,
		reuseExistingServer: !process.env.CI,
		timeout: 120_000
	}
});
