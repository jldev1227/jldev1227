import type { Locale } from '$lib/i18n';

declare global {
	namespace App {
		interface Locals {
			/** Resolved from the route, a cookie, or `Accept-Language`. */
			locale: Locale;
		}
	}
}

export {};
