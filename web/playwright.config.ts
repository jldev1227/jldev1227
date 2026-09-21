import { defineConfig, devices } from '@playwright/test';

/**
 * These tests exist for the things the in-app browser could not answer: a link
 * followed from the document the server sent, a page read with no JavaScript at
 * all, and a layout measured at a real viewport. They run against the
 * production build, so what they check is what ships.
 */
export default defineConfig({
	testDir: 'tests',
	fullyParallel: true,
	forbidOnly: Boolean(process.env.CI),
	retries: process.env.CI ? 1 : 0,
	reporter: process.env.CI ? 'github' : 'list',

	use: {
		baseURL: 'http://127.0.0.1:4173',
		trace: 'on-first-retry'
	},

	projects: [
		{
			name: 'desktop',
			use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 900 } }
		},
		{
			name: 'phone',
			use: { ...devices['Pixel 7'] }
		}
	],

	webServer: {
		// Bound explicitly: `localhost` resolves to ::1 on macOS, and the tests
		// ask for 127.0.0.1.
		command: 'npm run build && npm run preview -- --port 4173 --host 127.0.0.1',
		port: 4173,
		reuseExistingServer: !process.env.CI,
		timeout: 180_000
	}
});
