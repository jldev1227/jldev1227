import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

/** Language negotiation needs the request, so this entry point stays dynamic. */
export const prerender = false;

export const load: PageServerLoad = ({ locals }) => {
	redirect(307, `/${locals.locale}`);
};
