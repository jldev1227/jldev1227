import type { Localized } from '$i18n';

/**
 * Everything on the comic page that is not a project case file.
 * Edit copy here — components never hard-code prose.
 */

export const identity = {
	name: 'Julian Lopez',
	alias: 'JLDEV',
	handle: '1227',
	domain: '1227jl.dev',
	url: 'https://1227jl.dev',
	email: 'lopezvidaljuliandavid7@gmail.com',
	github: 'https://github.com/jldev1227',
	linkedin: 'https://www.linkedin.com/in/jldev1227/',
	location: { en: 'Colombia', es: 'Colombia' } satisfies Localized
};

export const hero = {
	caption: {
		en: 'Transmission #1227 — Colombia to the world. A new challenge arrives.',
		es: 'Transmisión #1227 — de Colombia al mundo. Llega un nuevo reto.'
	},
	bubble: {
		en: 'Okay… what are we building next?',
		es: 'Bien… ¿qué construimos ahora?'
	},
	titleTop: { en: 'Julian builds', es: 'Julian construye' },
	titleAccent: { en: 'what others need.', es: 'lo que otros necesitan.' },
	lead: {
		en: 'Custom software, backend systems, AI and automation for real companies with real operational problems.',
		es: 'Software a medida, sistemas backend, IA y automatización para empresas reales con problemas operativos reales.'
	}
} satisfies Record<string, Localized | string>;

export const origin = {
	caption: {
		en: 'Previously… curiosity became code. Code became a profession.',
		es: 'Anteriormente… la curiosidad se volvió código. El código se volvió profesión.'
	},
	headingLead: { en: 'I learn.', es: 'Aprendo.' },
	headingAccent: { en: 'I propose.', es: 'Propongo.' },
	headingTail: { en: 'I solve.', es: 'Resuelvo.' },
	body: {
		en: 'Software development is both my work and my passion. I take on each project as a new world to understand — its people, constraints, processes and opportunities.',
		es: 'El desarrollo de software es mi trabajo y mi pasión. Tomo cada proyecto como un mundo nuevo por entender: su gente, sus límites, sus procesos y sus oportunidades.'
	},
	portraitBubble: {
		en: 'Fast learning is my real superpower.',
		es: 'Aprender rápido es mi verdadero superpoder.'
	},
	portraitAlt: {
		en: 'Comic-style portrait of Julian Lopez',
		es: 'Retrato estilo cómic de Julian Lopez'
	}
} satisfies Record<string, Localized>;

export const years = {
	value: '3+',
	label: {
		en: 'Years facing real-world challenges',
		es: 'Años enfrentando retos del mundo real'
	}
};

export const powers = [
	{
		title: { en: 'Learn fast', es: 'Aprendo rápido' },
		body: {
			en: 'Understand unfamiliar domains and turn discovery into action.',
			es: 'Entiendo dominios nuevos y convierto el descubrimiento en acción.'
		}
	},
	{
		title: { en: 'Propose', es: 'Propongo' },
		body: {
			en: 'Bring options, tradeoffs and a clear technical direction.',
			es: 'Traigo opciones, tradeoffs y una dirección técnica clara.'
		}
	},
	{
		title: { en: 'Solve', es: 'Resuelvo' },
		body: {
			en: 'Transform operational friction into reliable software.',
			es: 'Convierto la fricción operativa en software confiable.'
		}
	},
	{
		title: { en: 'Take ownership', es: 'Me apropio' },
		body: {
			en: 'Accept the challenge and stay with the problem.',
			es: 'Acepto el reto y me quedo con el problema hasta resolverlo.'
		}
	}
] satisfies { title: Localized; body: Localized }[];

export const missionIntro = {
	title: { en: 'Selected missions', es: 'Misiones destacadas' },
	body: {
		en: 'Private work, public thinking: each case reveals the challenge, decisions, architecture and outcome without exposing confidential code.',
		es: 'Trabajo privado, pensamiento público: cada caso muestra el reto, las decisiones, la arquitectura y el resultado sin exponer código confidencial.'
	}
} satisfies Record<string, Localized>;

export const contact = {
	caption: {
		en: 'To be continued — the next mission starts with a message.',
		es: 'Continuará — la próxima misión empieza con un mensaje.'
	},
	title: { en: 'Ready for the next issue?', es: '¿Listos para el próximo número?' },
	body: {
		en: 'Open to product teams, founders and companies with an operational problem worth solving properly.',
		es: 'Abierto a equipos de producto, founders y empresas con un problema operativo que valga la pena resolver bien.'
	}
} satisfies Record<string, Localized>;

export const seo = {
	title: {
		en: 'Julian Lopez · JLDEV — Backend, AI and automation developer',
		es: 'Julian Lopez · JLDEV — Desarrollador backend, IA y automatización'
	},
	description: {
		en: 'Custom software, backend systems, AI and automation for companies with real operational problems. Case studies told as a comic page.',
		es: 'Software a medida, sistemas backend, IA y automatización para empresas con problemas operativos reales. Casos de estudio contados como una página de cómic.'
	},
	keywords: {
		en: 'backend developer, AI automation, TypeScript, NestJS, SvelteKit, Colombia, software engineer',
		es: 'desarrollador backend, automatización con IA, TypeScript, NestJS, SvelteKit, Colombia, ingeniero de software'
	}
} satisfies Record<string, Localized>;
