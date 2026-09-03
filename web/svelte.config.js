import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		// No `runtime`: the adapter derives it from the Node version the build
		// runs on, which on Vercel is the project's Node.js Version setting.
		// Pinning it here would be a second place to keep in sync.
		adapter: adapter(),
		alias: {
			$content: 'src/lib/content',
			$i18n: 'src/lib/i18n'
		}
	}
};

export default config;
