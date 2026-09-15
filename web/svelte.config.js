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
		// The site is served from the root, and every path builder in `$i18n`
		// returns a root-absolute path. Relative asset URLs are the one thing
		// left that changes meaning with a trailing slash, so anchor them too and
		// the whole document speaks one scheme.
		paths: { relative: false },
		alias: {
			$content: 'src/lib/content',
			$i18n: 'src/lib/i18n'
		}
	}
};

export default config;
