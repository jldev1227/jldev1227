import type { Localized } from '$i18n';

/** Panel accent — maps to a CSS custom property in `comic.css`. */
export type Accent = 'red' | 'blue' | 'yellow' | 'ink';

export interface Project {
	slug: string;
	/** Case file number, rendered as `Case file 01`. */
	number: string;
	kicker: Localized;
	title: string;
	tagline: Localized;
	stack: string[];
	accent: Accent;
	/** Full case narrative. Placeholder copy — replace before launch. */
	challenge: Localized;
	approach: Localized;
	outcome: Localized;
	/** External link, when the world has a public face. */
	link?: string;
}

/**
 * The five worlds. Order is the reading order of the comic page.
 *
 * TODO(julian): the challenge/approach/outcome blocks below are structural
 * placeholders. Replace each with the real story before going live — keep them
 * confidentiality-safe (problem, decisions, architecture, measurable outcome;
 * never client data or source).
 */
export const projects: Project[] = [
	{
		slug: 'segispro',
		number: '01',
		kicker: { en: 'Case file 01 · Platform', es: 'Expediente 01 · Plataforma' },
		title: 'SEGISPRO',
		tagline: {
			en: 'A complete business system told through the problem, architecture, decisions and measurable outcomes.',
			es: 'Un sistema empresarial completo contado desde el problema, la arquitectura, las decisiones y los resultados medibles.'
		},
		stack: ['Svelte', 'TypeScript', 'Cloud'],
		accent: 'red',
		challenge: {
			en: 'TODO: describe the operational problem the platform was built to solve.',
			es: 'TODO: describe el problema operativo que la plataforma vino a resolver.'
		},
		approach: {
			en: 'TODO: describe the architecture and the key technical decisions.',
			es: 'TODO: describe la arquitectura y las decisiones técnicas clave.'
		},
		outcome: {
			en: 'TODO: describe the measurable result.',
			es: 'TODO: describe el resultado medible.'
		}
	},
	{
		slug: 'formarpro',
		number: '02',
		kicker: { en: 'Case file 02 · Product', es: 'Expediente 02 · Producto' },
		title: 'FORMARPRO',
		tagline: {
			en: 'A focused story about product design and execution.',
			es: 'Una historia enfocada en diseño de producto y ejecución.'
		},
		stack: ['Full stack'],
		accent: 'blue',
		challenge: {
			en: 'TODO: describe the product problem.',
			es: 'TODO: describe el problema de producto.'
		},
		approach: {
			en: 'TODO: describe the design and execution approach.',
			es: 'TODO: describe el enfoque de diseño y ejecución.'
		},
		outcome: {
			en: 'TODO: describe the measurable result.',
			es: 'TODO: describe el resultado medible.'
		}
	},
	{
		slug: 'transmeralda',
		number: '03',
		kicker: { en: 'Case file 03 · Ops', es: 'Expediente 03 · Operaciones' },
		title: 'TRANSMERALDA × COTRANSMEQ',
		tagline: {
			en: 'One architecture, two operating contexts.',
			es: 'Una arquitectura, dos contextos operativos.'
		},
		stack: ['Backend', 'Automation'],
		accent: 'yellow',
		challenge: {
			en: 'TODO: describe how two operations shared one problem space.',
			es: 'TODO: describe cómo dos operaciones compartían un mismo problema.'
		},
		approach: {
			en: 'TODO: describe the shared architecture and where it diverges.',
			es: 'TODO: describe la arquitectura compartida y dónde se separa.'
		},
		outcome: {
			en: 'TODO: describe the measurable result.',
			es: 'TODO: describe el resultado medible.'
		}
	},
	{
		slug: 'developer-os',
		number: '04',
		kicker: { en: 'Case file 04 · Open source', es: 'Expediente 04 · Open source' },
		title: 'DEVELOPER OS',
		tagline: {
			en: 'The active lab: roadmap, changelog and public repository.',
			es: 'El laboratorio activo: roadmap, changelog y repositorio público.'
		},
		stack: ['Building in public'],
		accent: 'blue',
		link: 'https://github.com/jldev1227',
		challenge: {
			en: 'TODO: describe what the lab explores.',
			es: 'TODO: describe qué explora el laboratorio.'
		},
		approach: {
			en: 'TODO: describe how the work is built and released in public.',
			es: 'TODO: describe cómo se construye y publica el trabajo en público.'
		},
		outcome: {
			en: 'TODO: describe what has shipped so far.',
			es: 'TODO: describe qué se ha publicado hasta ahora.'
		}
	},
	{
		slug: 'gym-vancouver',
		number: '05',
		kicker: { en: 'Case file 05 · Experience', es: 'Expediente 05 · Experiencia' },
		title: 'GYM VANCOUVER',
		tagline: {
			en: 'A product-world with its own visual signal.',
			es: 'Un mundo de producto con su propia señal visual.'
		},
		stack: ['Web', 'Product'],
		accent: 'ink',
		challenge: {
			en: 'TODO: describe the experience problem.',
			es: 'TODO: describe el problema de experiencia.'
		},
		approach: {
			en: 'TODO: describe the design and build approach.',
			es: 'TODO: describe el enfoque de diseño y construcción.'
		},
		outcome: {
			en: 'TODO: describe the measurable result.',
			es: 'TODO: describe el resultado medible.'
		}
	}
];

export function findProject(slug: string): Project | undefined {
	return projects.find((project) => project.slug === slug);
}
