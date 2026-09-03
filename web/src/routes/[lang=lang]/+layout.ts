import type { Locale } from '$lib/i18n';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = ({ params }) => ({
	// The `lang` matcher guarantees this is a real locale.
	locale: params.lang as Locale
});
