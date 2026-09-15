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

/**
 * The issue's cover furniture. The cover story itself reuses `hero`: it is the
 * same headline, now printed where a comic prints it.
 */
export const cover = {
	issue: '#1227',
	volume: { en: 'Vol. 1', es: 'Vol. 1' },
	imprint: { en: 'JLDEV Comics · Colombia', es: 'JLDEV Comics · Colombia' },
	date: { en: 'Sep 2026', es: 'Sep 2026' },
	price: { en: 'Free to read', es: 'Lectura libre' },
	stamp: { en: 'Colombia to the world', es: 'De Colombia al mundo' },
	storyKicker: { en: 'Cover story', es: 'Historia de portada' }
} satisfies Record<string, Localized | string>;

export const origin = {
	pageLabel: { en: 'Origin', es: 'Origen' },
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

/** Page two of the first spread: the toolkit behind the origin story. */
export const powersPage = {
	pageLabel: { en: 'Powers', es: 'Poderes' },
	caption: {
		en: 'Meanwhile… the toolkit that came out of it.',
		es: 'Mientras tanto… las herramientas que salieron de ahí.'
	}
} satisfies Record<string, Localized>;

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

/**
 * Page three of the introductory issue: the tools, grouped by where they do
 * their work. Nothing here is aspirational — every entry is drawn from the
 * `stack` of a case file in `projects.ts`, and a unit test holds it to that.
 */
export const stackPage = {
	pageLabel: { en: 'Stack', es: 'Stack' },
	caption: {
		en: 'Meanwhile, on the utility belt… the tools every mission was built with.',
		es: 'Mientras tanto, en el cinturón… las herramientas con las que se construyó cada misión.'
	},
	title: { en: 'The stack', es: 'El stack' },
	body: {
		en: 'Nothing on this page is decorative: every tool has shipped inside one of the case files in this archive.',
		es: 'Nada en esta página es decorativo: cada herramienta ya salió a producción en algún expediente de este archivo.'
	}
} satisfies Record<string, Localized>;

/**
 * Page four of the introductory issue: the case files laid on one timeline,
 * from the repositories' own first commits to their latest. The data is
 * `project-history.ts`, generated from the local Git history.
 */
export const timelinePage = {
	pageLabel: { en: 'Timeline', es: 'Cronología' },
	caption: {
		en: 'Meanwhile… every case file, on one calendar.',
		es: 'Mientras tanto… todos los expedientes, en un solo calendario.'
	},
	title: { en: 'The calendar', es: 'El calendario' },
	body: {
		en: 'One bar per case file, from its first commit to its latest, read from the repositories themselves. Overlaps are real: these products were built side by side.',
		es: 'Una barra por expediente, desde su primer commit hasta el último, leída de los propios repositorios. Los solapes son reales: estos productos se construyeron en paralelo.'
	},
	commits: { en: '{count} commits in total', es: '{count} commits en total' }
} satisfies Record<string, Localized>;

export const stack = [
	{
		label: { en: 'Product', es: 'Producto' },
		items: ['SvelteKit', 'TypeScript', 'Tailwind CSS']
	},
	{
		label: { en: 'Backend & data', es: 'Backend y datos' },
		items: ['NestJS', 'Fastify', 'Prisma', 'PostgreSQL', 'Redis', 'BullMQ']
	},
	{
		label: { en: 'Real time & integrations', es: 'Tiempo real e integraciones' },
		items: ['WebSockets', 'Socket.IO', 'SAML/OIDC', 'Azure Blob', 'Mapbox']
	},
	{
		label: { en: 'Mobile', es: 'Móvil' },
		items: ['Swift', 'SwiftUI', 'Kotlin', 'Jetpack Compose', 'SQLite']
	}
] satisfies { label: Localized; items: string[] }[];

export const missionIntro = {
	pageLabel: { en: 'Selected missions', es: 'Misiones destacadas' },
	pageLabelMore: { en: 'Case files, continued', es: 'Expedientes, continuación' },
	pageLabelLast: { en: 'Case files, closing', es: 'Expedientes, cierre' },
	title: { en: 'Selected missions', es: 'Misiones destacadas' },
	body: {
		en: 'Private work, public thinking: each case reveals the challenge, decisions, architecture and outcome without exposing confidential code.',
		es: 'Trabajo privado, pensamiento público: cada caso muestra el reto, las decisiones, la arquitectura y el resultado sin exponer código confidencial.'
	}
} satisfies Record<string, Localized>;

export const contact = {
	pageLabel: { en: 'Contact', es: 'Contacto' },
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
