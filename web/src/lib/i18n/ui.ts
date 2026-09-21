import type { Locale, Localized } from './locales';

/**
 * Chrome strings: navigation, labels, accessibility text. Page *content*
 * lives in `$content` — this file is only for the shell.
 */
const UI = {
	'nav.origin': { en: 'Origin', es: 'Origen' },
	'nav.missions': { en: 'Worlds', es: 'Universos' },
	'nav.resume': { en: 'Résumé', es: 'Hoja de vida' },
	'nav.contact': { en: 'Contact', es: 'Contacto' },
	'nav.primary': { en: 'Primary navigation', es: 'Navegación principal' },
	'nav.skip': { en: 'Skip to content', es: 'Saltar al contenido' },

	'lang.switch': {
		en: 'Leer en español',
		es: 'Read in English'
	},
	'lang.switchAria': {
		en: 'Switch language to Spanish',
		es: 'Cambiar el idioma a inglés'
	},

	'art.placeholder': { en: 'Artwork lands here', es: 'Aquí va la ilustración' },

	'missions.back': { en: 'Back to the page', es: 'Volver a la página' },
	'missions.challenge': { en: 'The challenge', es: 'El reto' },
	'missions.approach': { en: 'The approach', es: 'El enfoque' },
	'missions.outcome': { en: 'The outcome', es: 'El resultado' },
	'missions.stack': { en: 'Stack', es: 'Stack' },
	'missions.technologies': { en: 'Technologies', es: 'Tecnologías' },
	'missions.libraries': { en: 'The wider toolkit', es: 'El resto de la caja' },
	'missions.marksNote': {
		en: 'Brand marks from Simple Icons; concepts without one are drawn in-house.',
		es: 'Marcas de Simple Icons; los conceptos sin marca están dibujados en casa.'
	},

	// The project log: what the repositories themselves say about a case file.
	'missions.log': { en: 'Project log', es: 'Bitácora' },
	'missions.logNote': {
		en: 'Read from the local Git history on {date}. Aggregates only.',
		es: 'Leído del historial Git local el {date}. Solo agregados.'
	},
	'missions.logSpan': { en: '{from} → {to}', es: '{from} → {to}' },
	'missions.activeMonths': { en: '{count} active months', es: '{count} meses activos' },
	'missions.commits': { en: 'commits', es: 'commits' },
	'missions.repository': { en: 'repository', es: 'repositorio' },
	'missions.repositories': { en: 'repositories', es: 'repositorios' },
	'missions.busiest': { en: 'Busiest month', es: 'Mes más intenso' },
	'missions.busiestValue': { en: '{month} · {count} commits', es: '{month} · {count} commits' },
	'missions.monthly': { en: 'Commits per month', es: 'Commits por mes' },
	'missions.counts': { en: 'In the tree', es: 'En el árbol' },
	'missions.pages': { en: 'routes', es: 'rutas' },
	'missions.controllers': { en: 'API controllers', es: 'controladores de API' },
	'missions.models': { en: 'data models', es: 'modelos de datos' },
	'missions.migrations': { en: 'migrations', es: 'migraciones' },
	'missions.tests': { en: 'test files', es: 'archivos de prueba' },
	'missions.native': { en: 'Swift & Kotlin files', es: 'archivos Swift y Kotlin' },
	'missions.files': { en: 'tracked files', es: 'archivos versionados' },
	'missions.repoApp': { en: 'app', es: 'app' },
	'missions.repoApi': { en: 'API', es: 'API' },
	'missions.repoNative': { en: 'native', es: 'nativo' },
	'missions.modules': { en: 'Modules', es: 'Módulos' },
	'missions.modulesNote': {
		en: 'What the product is made of, as its own screens divide it.',
		es: 'De qué está hecho el producto, tal como lo dividen sus propias pantallas.'
	},
	'missions.decisions': { en: 'Key decisions', es: 'Decisiones clave' },
	'missions.architecture': { en: 'Technical architecture', es: 'Arquitectura técnica' },
	'missions.architectureNote': {
		en: 'Full-stack architecture designed and built end to end by me.',
		es: 'Arquitectura full stack diseñada y construida de punta a punta por mí.'
	},
	'missions.beforeAfter': { en: 'Before → after', es: 'Antes → después' },
	'missions.before': { en: 'Before', es: 'Antes' },
	'missions.after': { en: 'After', es: 'Después' },
	'missions.confidential': {
		en: 'Private codebase — this file shares the thinking, not the source.',
		es: 'Código privado — este archivo comparte el razonamiento, no el fuente.'
	},

	'missions.source': { en: 'See it on GitHub', es: 'Verlo en GitHub' },
	'missions.backHome': { en: 'Back to issue #1227', es: 'Volver al número #1227' },
	'missions.collection': { en: 'JLDEV case files', es: 'Expedientes JLDEV' },
	'missions.onThisPage': { en: 'On this page', es: 'En esta página' },
	'missions.previousCase': { en: 'Previous case file', es: 'Expediente anterior' },
	'missions.nextCase': { en: 'Next case file', es: 'Siguiente expediente' },

	'contact.title': { en: 'Team-up?', es: '¿Hacemos equipo?' },
	'contact.email': { en: 'Send an email', es: 'Escríbeme un correo' },
	'contact.github': { en: 'GitHub', es: 'GitHub' },
	'contact.linkedin': { en: 'LinkedIn', es: 'LinkedIn' },

	'footer.rights': { en: 'End of transmission.', es: 'Fin de la transmisión.' },
	'error.title': { en: 'Panel not found', es: 'Viñeta no encontrada' },
	'error.home': { en: 'Return to page one', es: 'Volver a la página uno' }
} as const satisfies Record<string, Localized>;

export type UIKey = keyof typeof UI;

/** Build a translator bound to one locale: `const t = translator(locale)`. */
export function translator(locale: Locale) {
	return (key: UIKey): string => UI[key][locale];
}

/**
 * Fill `{name}` placeholders in a UI string, so a countable label stays one
 * translatable sentence instead of concatenated fragments.
 */
export function format(template: string, values: Record<string, string | number>): string {
	return template.replace(/\{(\w+)\}/g, (match, key: string) =>
		key in values ? String(values[key]) : match
	);
}
