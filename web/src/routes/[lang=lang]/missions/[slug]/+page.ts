import { error } from '@sveltejs/kit';
import { findProject, projects } from '$content/projects';
import { LOCALES } from '$lib/i18n';
import type { EntryGenerator, PageLoad } from './$types';

export const prerender = true;

export const entries: EntryGenerator = () =>
	LOCALES.flatMap((lang) => projects.map((project) => ({ lang, slug: project.slug })));

export const load: PageLoad = ({ params }) => {
	const project = findProject(params.slug);
	if (!project) error(404, 'Mission not found');
	return { project };
};
