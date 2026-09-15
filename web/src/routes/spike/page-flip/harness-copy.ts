import type { Localized } from '$i18n';

/**
 * Labels for the StPageFlip compatibility harness (milestone 0 of
 * `docs/comic-reader/LIBRARY-INTERACTION.md`).
 *
 * These live here rather than in `i18n/ui.ts` because the harness is a
 * development instrument, not part of the site: the route 404s outside `dev`,
 * so none of this can reach a visitor and none of it belongs in the shipped
 * dictionary. They are still `Localized`, because the harness has to be driven
 * in Spanish as well — reflow under Spanish copy is one of the things the spike
 * exists to measure.
 */
export const harness = {
	title: { en: 'StPageFlip compatibility spike', es: 'Spike de compatibilidad StPageFlip' },
	lede: {
		en: 'Development harness. Not part of the site and not reachable in production.',
		es: 'Banco de pruebas de desarrollo. No es parte del sitio ni existe en producción.'
	},
	locale: { en: 'Language', es: 'Idioma' },
	issue: { en: 'Issue', es: 'Número' },
	previous: { en: 'Previous', es: 'Anterior' },
	next: { en: 'Next', es: 'Siguiente' },
	create: { en: 'Create instance', es: 'Crear instancia' },
	rebuild: { en: 'Rebuild tree + create', es: 'Reconstruir árbol + crear' },
	destroy: { en: 'Destroy instance', es: 'Destruir instancia' },
	status: { en: 'Instance status', es: 'Estado de la instancia' },
	live: { en: 'live', es: 'viva' },
	down: { en: 'destroyed', es: 'destruida' },
	handler: {
		en: 'Svelte handler — clicks counted:',
		es: 'Manejador de Svelte — clics contados:'
	},
	handlerButton: { en: 'Count a click', es: 'Contar un clic' },
	linkProbe: { en: 'Ordinary link into the site', es: 'Enlace ordinario hacia el sitio' },
	issueIntro: { en: 'Issue #1227 — introductory', es: 'Número #1227 — introductorio' },
	issueCase: { en: 'Case file 01 — SEGISPRO', es: 'Expediente 01 — SEGISPRO' }
} satisfies Record<string, Localized>;
