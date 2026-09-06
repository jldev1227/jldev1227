import type { Locale, Localized } from './locales';

/**
 * Chrome strings: navigation, labels, accessibility text. Page *content*
 * lives in `$content` — this file is only for the shell.
 */
const UI = {
	'nav.origin': { en: 'Origin', es: 'Origen' },
	'nav.missions': { en: 'Missions', es: 'Misiones' },
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

	'missions.all': { en: 'All missions', es: 'Todas las misiones' },
	'missions.back': { en: 'Back to the page', es: 'Volver a la página' },
	'missions.challenge': { en: 'The challenge', es: 'El reto' },
	'missions.approach': { en: 'The approach', es: 'El enfoque' },
	'missions.outcome': { en: 'The outcome', es: 'El resultado' },
	'missions.stack': { en: 'Stack', es: 'Stack' },
	'missions.snapshot': { en: 'Engineering snapshot', es: 'Foto técnica' },
	'missions.snapshotNote': {
		en: 'Local Git history · 5 Sep 2026',
		es: 'Historial Git local · 5 sep 2026'
	},
	'missions.technologies': { en: 'Technologies', es: 'Tecnologías' },
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
