import { LOCALES } from '$lib/i18n';
import type { EntryGenerator } from './$types';

export const prerender = true;

/** Nothing links to `/en` or `/es` from a prerenderable page, so list them. */
export const entries: EntryGenerator = () => LOCALES.map((lang) => ({ lang }));
