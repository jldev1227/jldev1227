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
		en: 'Transmission #1227 · Colombia to the world · Portfolio of Julian Lopez.',
		es: 'Transmisión #1227 · de Colombia al mundo · portafolio de Julian Lopez.'
	},
	bubble: {
		en: 'Ready to open the next world?',
		es: '¿Listos para abrir el próximo mundo?'
	},
	titleTop: { en: 'One creator.', es: 'Un creador.' },
	titleAccent: { en: 'Many worlds.', es: 'Muchos mundos.' },
	lead: {
		en: 'I step into complex operations, learn their rules and build the software they need to move forward. Every project is a universe; the way I solve is the thread connecting them.',
		es: 'Entro a operaciones complejas, entiendo sus reglas y construyo el software que necesitan para avanzar. Cada proyecto es un universo; mi forma de resolver es el hilo que los conecta.'
	}
} satisfies Record<string, Localized | string>;

/** Calls to action and compact facts on the personal cover. */
export const landing = {
	explore: { en: 'Explore the worlds', es: 'Explorar los universos' },
	meet: { en: 'Meet Julian', es: 'Conocer a Julian' },
	role: { en: 'Freelance software developer', es: 'Desarrollador de software freelance' },
	location: { en: 'Based in Colombia', es: 'Desde Colombia' }
} satisfies Record<string, Localized>;

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
		en: 'I am a developer from Colombia, and software is both my work and my passion. I enter every project as a new world to understand: its people, constraints, processes and opportunities.',
		es: 'Soy desarrollador colombiano y el software es tanto mi trabajo como mi pasión. Entro a cada proyecto como un mundo nuevo por entender: su gente, sus límites, sus procesos y sus oportunidades.'
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
	pageLabel: { en: 'Comic archive', es: 'Archivo de cómics' },
	pageLabelMore: { en: 'Case files, continued', es: 'Expedientes, continuación' },
	pageLabelLast: { en: 'Case files, closing', es: 'Expedientes, cierre' },
	title: { en: 'The complete archive', es: 'El archivo completo' },
	body: {
		en: 'Every issue reveals the challenge, decisions, architecture and outcome of a real project without exposing confidential code.',
		es: 'Cada número muestra el reto, las decisiones, la arquitectura y el resultado de un proyecto real sin exponer código confidencial.'
	}
} satisfies Record<string, Localized>;

/** The bridge between the personal story and the six project case files. */
export const multiverse = {
	eyebrow: { en: 'The project multiverse', es: 'El multiverso de proyectos' },
	titleLead: { en: 'Six worlds.', es: 'Seis mundos.' },
	titleAccent: { en: 'One way of building.', es: 'Una forma de construir.' },
	body: {
		en: 'Every portal keeps the product’s own visual identity. Step through to read the full comic: challenge, architecture, decisions, evidence and outcome.',
		es: 'Cada portal conserva la identidad visual de su producto. Entra para leer el cómic completo: reto, arquitectura, decisiones, evidencia y resultado.'
	},
	enter: { en: 'Enter this world', es: 'Entrar a este mundo' },
	archiveBody: {
		en: 'The portals are the editorial selection. The complete shelf remains available for anyone who wants every issue in one place.',
		es: 'Los portales son la selección editorial. La estantería completa sigue disponible para quien quiera todos los números en un solo lugar.'
	},
	archiveLink: { en: 'Open the comic archive', es: 'Abrir el archivo de cómics' }
} satisfies Record<string, Localized>;

export const method = {
	caption: {
		en: 'Different industries. The same responsibility: understand the real problem before writing the solution.',
		es: 'Industrias distintas. La misma responsabilidad: entender el problema real antes de escribir la solución.'
	},
	title: { en: 'What repeats across worlds.', es: 'Lo que se repite entre mundos.' },
	body: {
		en: 'The technology changes with the mission. The way of working does not.',
		es: 'La tecnología cambia con la misión. La forma de trabajar no.'
	}
} satisfies Record<string, Localized>;

export const methodSteps = [
	{
		number: '01',
		title: { en: 'Understand', es: 'Entender' },
		body: {
			en: 'People, rules, constraints and operational friction.',
			es: 'Personas, reglas, restricciones y fricción operativa.'
		}
	},
	{
		number: '02',
		title: { en: 'Design', es: 'Diseñar' },
		body: {
			en: 'Flows, architecture and decisions with visible tradeoffs.',
			es: 'Flujos, arquitectura y decisiones con tradeoffs visibles.'
		}
	},
	{
		number: '03',
		title: { en: 'Deliver', es: 'Entregar' },
		body: {
			en: 'An operable product, real evidence and a maintainable foundation.',
			es: 'Un producto operable, evidencia real y una base mantenible.'
		}
	}
] satisfies { number: string; title: Localized; body: Localized }[];

export const now = {
	status: { en: 'Active signal · Colombia', es: 'Señal activa · Colombia' },
	title: { en: 'Right now.', es: 'Ahora mismo.' },
	body: {
		en: 'Building products with SvelteKit, NestJS, TypeScript, PostgreSQL, AI and automation.',
		es: 'Construyendo productos con SvelteKit, NestJS, TypeScript, PostgreSQL, IA y automatización.'
	}
} satisfies Record<string, Localized>;

export const contact = {
	pageLabel: { en: 'Contact', es: 'Contacto' },
	caption: {
		en: 'To be continued — the next mission starts with a message.',
		es: 'Continuará — la próxima misión empieza con un mensaje.'
	},
	title: { en: 'Shall we open a new universe?', es: '¿Abrimos un nuevo universo?' },
	body: {
		en: 'If you have an operational problem worth solving properly, the next story can start with a conversation.',
		es: 'Si tienes un problema operativo que merezca una solución bien pensada, la próxima historia puede empezar con una conversación.'
	}
} satisfies Record<string, Localized>;

export const seo = {
	title: {
		en: 'Julian Lopez · JLDEV — Backend, AI and automation developer',
		es: 'Julian Lopez · JLDEV — Desarrollador backend, IA y automatización'
	},
	description: {
		en: 'Personal portfolio of Julian Lopez: software, backend systems, AI and automation told through six project universes.',
		es: 'Portafolio personal de Julian Lopez: software, backend, IA y automatización contados en seis universos de proyectos.'
	},
	keywords: {
		en: 'backend developer, AI automation, TypeScript, NestJS, SvelteKit, Colombia, software engineer',
		es: 'desarrollador backend, automatización con IA, TypeScript, NestJS, SvelteKit, Colombia, ingeniero de software'
	}
} satisfies Record<string, Localized>;
