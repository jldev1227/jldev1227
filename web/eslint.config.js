import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import ts from 'typescript-eslint';
import svelteConfig from './svelte.config.js';

export default ts.config(
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs.recommended,
	{
		languageOptions: {
			globals: { ...globals.browser, ...globals.node }
		}
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts'],
		languageOptions: {
			parserOptions: {
				projectService: true,
				extraFileExtensions: ['.svelte'],
				parser: ts.parser,
				svelteConfig
			}
		}
	},
	{
		files: ['**/*.svelte'],
		rules: {
			// Every internal link goes through `$lib/i18n/paths.ts`, which calls
			// `resolve()` with a typed route id. The rule only recognises a literal
			// `resolve()` in the href, so it cannot see through those helpers.
			'svelte/no-navigation-without-resolve': 'off'
		}
	},
	{
		ignores: ['.svelte-kit/', '.vercel/', 'build/', 'node_modules/']
	}
);
