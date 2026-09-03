import { LOCALES } from '$lib/i18n';
import type { EntryGenerator } from './$types';

export const prerender = true;

export const entries: EntryGenerator = () => LOCALES.map((lang) => ({ lang }));
