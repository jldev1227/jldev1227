import type { Localized } from '$i18n';

/** Panel accent — maps to a CSS custom property in `comic.css`. */
export type Accent = 'red' | 'blue' | 'yellow' | 'ink';

/**
 * The world's own colours, sampled from its screenshot so each issue is set in
 * the app it is about rather than in the site's palette.
 *
 * `base` is the field the product actually sits on; `accent` its signal colour.
 * `on` says whether type on `base` is paper or ink — decided from the measured
 * luminance, not by eye.
 */
export interface Palette {
	base: string;
	accent: string;
	on: 'paper' | 'ink';
	/** What reads on `accent` — decided the same way, from its luminance. */
	onAccent: 'paper' | 'ink';
}

export interface ProjectArchitectureNode {
	layer: Localized;
	technology: string;
	detail: Localized;
}

export interface ProjectTransformation {
	before: Localized;
	after: Localized;
}

/** One part of the product, the way its routes and screens divide it. */
export interface ProjectModule {
	name: Localized;
	detail: Localized;
}

export interface Project {
	slug: string;
	/** Case file number, rendered as `Case file 01`. */
	number: string;
	kicker: Localized;
	title: string;
	tagline: Localized;
	/** The core: what the product is built on. */
	stack: string[];
	/**
	 * The wider toolkit, read off the repositories' own manifests: the
	 * libraries that do the real work behind the core. Names as `tech-marks`
	 * knows them, so each can carry its mark.
	 */
	libraries: string[];
	/** What the product is made of, one entry per area of the app. */
	modules: ProjectModule[];
	accent: Accent;
	palette: Palette;
	/** Full-bleed comic illustration; cover typography remains live HTML. */
	coverArt: { src: string; width: number; height: number };
	/** Force paper-white cover lettering when the illustration is visually busy. */
	coverText?: 'paper';
	image: {
		src: string;
		alt: Localized;
		caption: Localized;
	};
	architecture: ProjectArchitectureNode[];
	transformation: ProjectTransformation[];
	decisions: Localized[];
	/** Full case narrative, kept confidentiality-safe. */
	challenge: Localized;
	approach: Localized;
	outcome: Localized;
	/** External link, when the world has a public face. */
	link?: string;
}

/** The six worlds. Order is the reading order of the comic page. */
export const projects: Project[] = [
	{
		slug: 'segispro',
		number: '01',
		kicker: { en: 'Case file 01 · Platform', es: 'Expediente 01 · Plataforma' },
		title: 'SEGISPRO',
		tagline: {
			en: 'One operational platform connecting HSE talent, clients, planning, documents and service delivery.',
			es: 'Una plataforma operativa que conecta talento HSE, clientes, planeación, documentos y prestación del servicio.'
		},
		stack: ['SvelteKit', 'TypeScript', 'NestJS', 'PostgreSQL', 'Azure Blob', 'WebSockets'],
		accent: 'red',
		libraries: [
			'Drizzle ORM',
			'BullMQ',
			'Passport',
			'JSON Web Tokens',
			'Swagger',
			'Chart.js',
			'D3',
			'FullCalendar',
			'ExcelJS',
			'Azure AI',
			'Microsoft Graph',
			'Google Calendar',
			'Vitest',
			'Lucide'
		],
		modules: [
			{
				name: { en: 'HSE talent', es: 'Talento HSE' },
				detail: {
					en: 'Professional profiles, documents, availability and payments.',
					es: 'Perfiles profesionales, documentos, disponibilidad y pagos.'
				}
			},
			{
				name: { en: 'Clients & contracts', es: 'Clientes y contratos' },
				detail: {
					en: 'Accounts, sites and the contracts that frame each service.',
					es: 'Cuentas, sedes y los contratos que enmarcan cada servicio.'
				}
			},
			{
				name: { en: 'Planning & work orders', es: 'Planeación y órdenes' },
				detail: {
					en: 'Calendar planning turned into orders with evidence attached.',
					es: 'Planeación en calendario convertida en órdenes con evidencia.'
				}
			},
			{
				name: { en: 'Billing', es: 'Facturación' },
				detail: {
					en: 'Service billing and professional payouts from the same records.',
					es: 'Facturación de servicios y pagos a profesionales desde los mismos registros.'
				}
			},
			{
				name: { en: 'Reports & statistics', es: 'Reportes y estadísticas' },
				detail: {
					en: 'Activity, dashboards and exports for operations and management.',
					es: 'Actividad, tableros y exportaciones para operación y gerencia.'
				}
			},
			{
				name: { en: 'Notifications', es: 'Notificaciones' },
				detail: {
					en: 'In-app notices and WhatsApp templates for every process step.',
					es: 'Avisos en la app y plantillas de WhatsApp para cada paso del proceso.'
				}
			},
			{
				name: { en: 'Backups & manual', es: 'Backups y manual' },
				detail: {
					en: 'Scheduled backups and the built-in user manual.',
					es: 'Copias programadas y el manual de usuario integrado.'
				}
			}
		],
		palette: {
			base: '#020619',
			accent: '#3d82ff',
			on: 'paper',
			onAccent: 'ink'
		},
		coverArt: {
			src: '/art/project-covers/segispro-cover-v2.webp',
			width: 1024,
			height: 1536
		},
		image: {
			src: '/projects/segispro.webp',
			alt: {
				en: 'SEGISPRO public product presentation and operational workflow',
				es: 'Presentación pública de SEGISPRO y su flujo operativo'
			},
			caption: {
				en: 'Public presentation rendered from the local product; it explains the workflow without exposing client data.',
				es: 'Presentación pública renderizada desde el producto local; explica el flujo sin exponer datos de clientes.'
			}
		},
		architecture: [
			{
				layer: { en: 'Product experience', es: 'Experiencia de producto' },
				technology: 'SvelteKit · TypeScript',
				detail: {
					en: 'Role-aware workflows for operations, professionals and clients.',
					es: 'Flujos por rol para operación, profesionales y clientes.'
				}
			},
			{
				layer: { en: 'Application API', es: 'API de aplicación' },
				technology: 'NestJS',
				detail: {
					en: 'Business rules, permissions and process orchestration.',
					es: 'Reglas de negocio, permisos y orquestación de procesos.'
				}
			},
			{
				layer: { en: 'Operational data', es: 'Datos operativos' },
				technology: 'PostgreSQL',
				detail: {
					en: 'Shared model for talent, clients, services and billing.',
					es: 'Modelo compartido para talento, clientes, servicios y facturación.'
				}
			},
			{
				layer: { en: 'Files and events', es: 'Archivos y eventos' },
				technology: 'Azure Blob · WebSockets',
				detail: {
					en: 'Protected evidence, notifications and real-time updates.',
					es: 'Evidencia protegida, notificaciones y actualizaciones en tiempo real.'
				}
			}
		],
		transformation: [
			{
				before: {
					en: 'Professional records scattered across files.',
					es: 'Hojas de vida dispersas entre archivos.'
				},
				after: {
					en: 'One traceable professional profile.',
					es: 'Un perfil profesional único y trazable.'
				}
			},
			{
				before: {
					en: 'Planning disconnected from execution.',
					es: 'Planeación separada de la ejecución.'
				},
				after: {
					en: 'Work orders connected to evidence and follow-up.',
					es: 'Órdenes conectadas con evidencia y seguimiento.'
				}
			},
			{
				before: {
					en: 'Repeated manual document verification.',
					es: 'Validación documental manual y repetitiva.'
				},
				after: {
					en: 'Controlled workflows with explicit approvals.',
					es: 'Flujos controlados con aprobaciones explícitas.'
				}
			}
		],
		decisions: [
			{
				en: 'Separate the SvelteKit client from the NestJS API so each side can evolve around a clear contract.',
				es: 'Separar el cliente SvelteKit de la API NestJS para que cada lado evolucione sobre un contrato claro.'
			},
			{
				en: 'Keep sensitive documents in object storage and expose them through short-lived signed access.',
				es: 'Mantener documentos sensibles en object storage y exponerlos mediante accesos firmados de corta duración.'
			},
			{
				en: 'Automate repetitive synchronization and document workflows without removing human approval points.',
				es: 'Automatizar sincronizaciones y flujos documentales repetitivos sin eliminar los puntos de aprobación humana.'
			}
		],
		challenge: {
			en: 'HSE operations crossed recruiting, professional records, client requirements, work orders, planning and billing. When each step lives in a different document or conversation, the team loses traceability and repeats verification work.',
			es: 'La operación HSE cruzaba selección, hojas de vida, requisitos de clientes, órdenes de trabajo, planeación y facturación. Cuando cada paso vive en un documento o conversación distinta, el equipo pierde trazabilidad y repite validaciones.'
		},
		approach: {
			en: 'I shaped the product as role-aware workflows backed by a NestJS API and a SvelteKit application. PostgreSQL holds the operational model, object storage protects files, and background jobs, notifications and real-time events move long-running work without blocking the interface.',
			es: 'Construí el producto como flujos por rol respaldados por una API NestJS y una aplicación SvelteKit. PostgreSQL sostiene el modelo operativo, object storage protege los archivos y los trabajos en segundo plano, notificaciones y eventos en tiempo real mueven procesos largos sin bloquear la interfaz.'
		},
		outcome: {
			en: 'The resulting platform connects the operating chain in one product: from a professional profile to planning, evidence and follow-up. The local Git snapshot covers 740 commits across two codebases and 44 product routes, reflecting a system grown through sustained operational use.',
			es: 'La plataforma resultante conecta la cadena operativa en un solo producto: desde el perfil profesional hasta la planeación, la evidencia y el seguimiento. La foto local de Git reúne 740 commits en dos repositorios y 44 rutas de producto, reflejo de un sistema construido mediante uso operativo sostenido.'
		}
	},
	{
		slug: 'formarpro',
		number: '02',
		kicker: { en: 'Case file 02 · Product', es: 'Expediente 02 · Producto' },
		title: 'FORMARPRO',
		tagline: {
			en: 'Corporate learning, assessment and verifiable certification designed as one continuous journey.',
			es: 'Capacitación empresarial, evaluación y certificación verificable diseñadas como un solo recorrido.'
		},
		stack: [
			'SvelteKit',
			'NestJS',
			'PostgreSQL',
			'Redis',
			'BullMQ',
			'Socket.IO',
			'SAML/OIDC',
			'H5P'
		],
		accent: 'blue',
		libraries: [
			'TypeORM',
			'BullMQ',
			'Passport',
			'JSON Web Tokens',
			'SAML/OIDC',
			'OpenAI',
			'Resend',
			'TanStack',
			'GSAP',
			'H5P',
			'SCORM',
			'hls.js',
			'jsPDF',
			'Mapbox'
		],
		modules: [
			{
				name: { en: 'Catalogue & learning paths', es: 'Catálogo y rutas de aprendizaje' },
				detail: {
					en: 'Courses, packages and prerequisites arranged into paths.',
					es: 'Cursos, paquetes y prerrequisitos organizados en rutas.'
				}
			},
			{
				name: { en: 'Training delivery', es: 'Capacitaciones' },
				detail: {
					en: 'Interactive H5P and SCORM content, video and reading tracked per learner.',
					es: 'Contenido interactivo H5P y SCORM, video y lectura con seguimiento por persona.'
				}
			},
			{
				name: { en: 'Assessment', es: 'Evaluaciones' },
				detail: {
					en: 'Evaluations with instructors, approvals and results.',
					es: 'Evaluaciones con instructores, aprobaciones y resultados.'
				}
			},
			{
				name: { en: 'Verifiable certificates', es: 'Certificados verificables' },
				detail: {
					en: 'QR-signed certificates anyone can verify on the public site.',
					es: 'Certificados firmados con QR que cualquiera verifica en el sitio público.'
				}
			},
			{
				name: { en: 'Companies & orders', es: 'Empresas y órdenes' },
				detail: {
					en: 'Corporate accounts, purchase orders and catalogue requests.',
					es: 'Cuentas corporativas, órdenes de compra y solicitudes de catálogo.'
				}
			},
			{
				name: { en: 'Corporate SSO', es: 'SSO corporativo' },
				detail: {
					en: 'SAML and OIDC sign-in configured per company.',
					es: 'Inicio de sesión SAML y OIDC configurado por empresa.'
				}
			},
			{
				name: { en: 'Public site', es: 'Sitio público' },
				detail: {
					en: 'Catalogue, docs, status and the verification page.',
					es: 'Catálogo, documentación, estado y la página de verificación.'
				}
			}
		],
		palette: {
			base: '#fdf6dc',
			accent: '#2554e2',
			on: 'ink',
			onAccent: 'paper'
		},
		coverArt: {
			src: '/art/project-covers/formarpro-cover-v2.webp',
			width: 1024,
			height: 1536
		},
		coverText: 'paper',
		image: {
			src: '/projects/formarpro.webp',
			alt: {
				en: 'FORMARPRO corporate training landing page',
				es: 'Página pública de capacitación empresarial de FORMARPRO'
			},
			caption: {
				en: 'Public product surface captured from the local frontend.',
				es: 'Superficie pública del producto capturada desde el frontend local.'
			}
		},
		architecture: [
			{
				layer: { en: 'Learning experiences', es: 'Experiencias de aprendizaje' },
				technology: 'SvelteKit',
				detail: {
					en: 'Dedicated journeys for learners, trainers, companies and admins.',
					es: 'Recorridos para estudiantes, instructores, empresas y administración.'
				}
			},
			{
				layer: { en: 'Learning domain', es: 'Dominio de aprendizaje' },
				technology: 'NestJS',
				detail: {
					en: 'Enrollment, progress, assessment and certification rules.',
					es: 'Reglas de inscripción, progreso, evaluación y certificación.'
				}
			},
			{
				layer: { en: 'State and cache', es: 'Estado y caché' },
				technology: 'PostgreSQL · Redis',
				detail: {
					en: 'Durable learning records with fast operational state.',
					es: 'Registros durables con estado operativo de respuesta rápida.'
				}
			},
			{
				layer: { en: 'Jobs and integrations', es: 'Trabajos e integraciones' },
				technology: 'BullMQ · SSO · H5P',
				detail: {
					en: 'Certificates, notifications, enterprise identity and interactive content.',
					es: 'Certificados, notificaciones, identidad empresarial y contenido interactivo.'
				}
			}
		],
		transformation: [
			{
				before: {
					en: 'Training split across unrelated tools.',
					es: 'Capacitación dividida entre herramientas aisladas.'
				},
				after: {
					en: 'One continuous learning journey.',
					es: 'Un recorrido continuo de aprendizaje.'
				}
			},
			{
				before: {
					en: 'Certificates delivered as static files.',
					es: 'Certificados entregados como archivos estáticos.'
				},
				after: {
					en: 'Certificates backed by verifiable records.',
					es: 'Certificados respaldados por registros verificables.'
				}
			},
			{
				before: {
					en: 'Heavy tasks blocking user flows.',
					es: 'Tareas pesadas bloqueando la experiencia.'
				},
				after: {
					en: 'Asynchronous jobs with visible progress.',
					es: 'Trabajos asíncronos con progreso visible.'
				}
			}
		],
		decisions: [
			{
				en: 'Model separate learner, trainer, company and administrator journeys on top of one learning domain.',
				es: 'Modelar recorridos separados para estudiante, instructor, empresa y administración sobre un mismo dominio de aprendizaje.'
			},
			{
				en: 'Treat certificates as verifiable records, not decorative PDF downloads.',
				es: 'Tratar los certificados como registros verificables, no como simples PDF decorativos.'
			},
			{
				en: 'Move heavy work to queues and support enterprise identity through SAML and OpenID Connect.',
				es: 'Mover el trabajo pesado a colas y admitir identidad empresarial mediante SAML y OpenID Connect.'
			}
		],
		challenge: {
			en: 'Corporate training is more than publishing videos: companies need enrollment, assessments, live sessions, prerequisites, evidence and certificates they can verify. Those responsibilities had to feel coherent for learners while remaining controllable for training teams.',
			es: 'La capacitación empresarial es más que publicar videos: las empresas necesitan inscripciones, evaluaciones, sesiones en vivo, prerrequisitos, evidencias y certificados verificables. Todo debía sentirse coherente para el estudiante y seguir siendo controlable para los equipos de formación.'
		},
		approach: {
			en: 'I designed distinct product surfaces for each role while keeping a shared learning and compliance model. SvelteKit handles the experience; NestJS, PostgreSQL and Redis coordinate enrollment, progress, notifications and asynchronous certificate work, with interactive content and enterprise SSO as first-class capabilities.',
			es: 'Diseñé superficies distintas para cada rol sobre un modelo compartido de aprendizaje y cumplimiento. SvelteKit resuelve la experiencia; NestJS, PostgreSQL y Redis coordinan inscripciones, progreso, notificaciones y certificados asíncronos, con contenido interactivo y SSO empresarial como capacidades de primer nivel.'
		},
		outcome: {
			en: 'The current build joins discovery, training, evaluation and certification in one product family. Its local Git snapshot spans 73 commits, two codebases and 68 routes across public, learner, trainer, company and administration experiences.',
			es: 'La versión actual une descubrimiento, capacitación, evaluación y certificación en una misma familia de producto. Su foto local de Git abarca 73 commits, dos repositorios y 68 rutas entre experiencias públicas, de estudiante, instructor, empresa y administración.'
		}
	},
	{
		slug: 'transmeralda',
		number: '03',
		kicker: { en: 'Case file 03 · Ops', es: 'Expediente 03 · Operaciones' },
		title: 'TRANSMERALDA × COTRANSMEQ',
		tagline: {
			en: 'One transport platform adapted to two operators without losing operational identity.',
			es: 'Una plataforma de transporte adaptada a dos operadoras sin perder su identidad operacional.'
		},
		stack: ['SvelteKit', 'Fastify', 'Prisma', 'PostgreSQL', 'Socket.IO', 'Univer', 'Mapbox', 'PDF'],
		accent: 'yellow',
		libraries: [
			'Prisma',
			'Zod',
			'Pino',
			'Swagger',
			'JSON Web Tokens',
			'Puppeteer',
			'Univer',
			'Chart.js',
			'Mapbox',
			'ExcelJS',
			'pdfmake',
			'Anthropic',
			'Azure Blob',
			'Amazon S3',
			'Resend'
		],
		modules: [
			{
				name: { en: 'Fleet & drivers', es: 'Flota y conductores' },
				detail: {
					en: 'Vehicles, drivers, documents and their expiry.',
					es: 'Vehículos, conductores, documentos y sus vencimientos.'
				}
			},
			{
				name: { en: 'Services & settlements', es: 'Servicios y liquidaciones' },
				detail: {
					en: 'Trips, third-party and service settlements, statements.',
					es: 'Viajes, liquidaciones de servicios y terceros, extractos.'
				}
			},
			{
				name: { en: 'Payroll & surcharges', es: 'Nómina y recargos' },
				detail: {
					en: 'Payroll with surcharges computed from the operation itself.',
					es: 'Nómina con recargos calculados desde la propia operación.'
				}
			},
			{
				name: { en: 'Road safety (PESV)', es: 'PESV' },
				detail: {
					en: 'The road-safety plan: checks, forms and evidence.',
					es: 'El plan estratégico de seguridad vial: controles, formularios y evidencia.'
				}
			},
			{
				name: { en: 'Compliance', es: 'Cumplimiento' },
				detail: {
					en: 'SARLAFT, corrective actions and non-conformity exits.',
					es: 'SARLAFT, acciones correctivas y salidas no conformes.'
				}
			},
			{
				name: { en: 'Forms & attendance', es: 'Formularios y asistencias' },
				detail: {
					en: 'Custom forms and token-based attendance, no login needed.',
					es: 'Formularios propios y asistencia por token, sin iniciar sesión.'
				}
			},
			{
				name: { en: 'Two operators, one base', es: 'Dos operadoras, una base' },
				detail: {
					en: 'The same codebase branded and deployed for each company.',
					es: 'La misma base de código con marca y despliegue por empresa.'
				}
			}
		],
		palette: {
			base: '#0b1a15',
			accent: '#17a06f',
			on: 'paper',
			onAccent: 'ink'
		},
		coverArt: {
			src: '/art/project-covers/transmeralda-cover-v2.webp',
			width: 1024,
			height: 1536
		},
		image: {
			src: '/projects/transmeralda.webp',
			alt: {
				en: 'Transmeralda public presentation showing the transport workflow',
				es: 'Presentación pública de Transmeralda con el flujo de transporte'
			},
			caption: {
				en: 'Public presentation rendered locally; Cotransmeq shares the architecture with its own identity.',
				es: 'Presentación pública renderizada en local; Cotransmeq comparte la arquitectura con identidad propia.'
			}
		},
		architecture: [
			{
				layer: { en: 'Field and office', es: 'Campo y oficina' },
				technology: 'SvelteKit',
				detail: {
					en: 'Administrative workspace and offline-aware driver portal.',
					es: 'Espacio administrativo y portal de conductor con soporte offline.'
				}
			},
			{
				layer: { en: 'Operational API', es: 'API operativa' },
				technology: 'Fastify',
				detail: {
					en: 'Shared transport rules isolated from each operator identity.',
					es: 'Reglas de transporte compartidas y aisladas de la identidad de cada operadora.'
				}
			},
			{
				layer: { en: 'Transport model', es: 'Modelo de transporte' },
				technology: 'Prisma · PostgreSQL',
				detail: {
					en: 'Services, fleet, people, safety and compliance records.',
					es: 'Registros de servicios, flota, personas, seguridad y cumplimiento.'
				}
			},
			{
				layer: { en: 'Operational tools', es: 'Herramientas operativas' },
				technology: 'Socket.IO · Mapbox · Univer · PDF',
				detail: {
					en: 'Live updates, maps, spreadsheets and regulated documents.',
					es: 'Actualizaciones en vivo, mapas, hojas de cálculo y documentos regulados.'
				}
			}
		],
		transformation: [
			{
				before: {
					en: 'Two products evolving through manual copies.',
					es: 'Dos productos evolucionando mediante copias manuales.'
				},
				after: {
					en: 'One shared core with isolated operator identity.',
					es: 'Un núcleo compartido con identidad aislada por operadora.'
				}
			},
			{
				before: {
					en: 'Road evidence arriving after the operation.',
					es: 'Evidencia de carretera llegando después de la operación.'
				},
				after: {
					en: 'Offline-aware capture and later synchronization.',
					es: 'Captura con soporte offline y sincronización posterior.'
				}
			},
			{
				before: {
					en: 'Manual spreadsheets and document templates.',
					es: 'Hojas de cálculo y plantillas documentales manuales.'
				},
				after: {
					en: 'Documents generated from structured operational data.',
					es: 'Documentos generados desde datos operativos estructurados.'
				}
			}
		],
		decisions: [
			{
				en: 'Share the operational core while keeping branding, deployment and operator-specific rules isolated.',
				es: 'Compartir el núcleo operativo y aislar marca, despliegue y reglas particulares de cada operadora.'
			},
			{
				en: 'Design dynamic forms for intermittent connectivity, traceability and later synchronization.',
				es: 'Diseñar formularios dinámicos para conectividad intermitente, trazabilidad y sincronización posterior.'
			},
			{
				en: 'Generate spreadsheets and regulated documents from structured data instead of manual templates.',
				es: 'Generar hojas de cálculo y documentos regulados desde datos estructurados en lugar de plantillas manuales.'
			}
		],
		challenge: {
			en: 'Two transport operators shared the same hard problems—fleet, drivers, services, attendance, payroll support and regulatory evidence—but each one carried its own brand, users and operating rules. Copying features between separate products would quickly create drift.',
			es: 'Dos operadoras de transporte compartían los mismos problemas difíciles —flota, conductores, servicios, asistencia, apoyo a nómina y evidencia normativa—, pero cada una tenía su propia marca, usuarios y reglas. Copiar funciones entre productos separados habría creado divergencias rápidamente.'
		},
		approach: {
			en: 'I evolved a shared SvelteKit and Fastify architecture, separating reusable domain workflows from operator configuration and deployment. PostgreSQL and Prisma anchor the data model; sockets, offline-aware forms, maps, spreadsheets and document generation support work that moves between office and road.',
			es: 'Evolucioné una arquitectura compartida en SvelteKit y Fastify, separando los flujos reutilizables de la configuración y el despliegue de cada operadora. PostgreSQL y Prisma sostienen el modelo; sockets, formularios con soporte offline, mapas, hojas de cálculo y generación documental acompañan el trabajo entre oficina y carretera.'
		},
		outcome: {
			en: 'The product family now expresses one operational model through two deployments instead of two disconnected inventions. Across four frontend and backend repositories, the local Git history contains 884 commits and a shared surface covering services, fleet, people, safety and compliance.',
			es: 'La familia de producto expresa un modelo operativo mediante dos despliegues, no dos inventos desconectados. En cuatro repositorios de frontend y backend, el historial local suma 884 commits y una superficie compartida para servicios, flota, personas, seguridad y cumplimiento.'
		}
	},
	{
		slug: 'developer-os',
		number: '04',
		kicker: { en: 'Case file 04 · Open source', es: 'Expediente 04 · Open source' },
		title: 'DEVELOPER OS',
		tagline: {
			en: 'A local-first control plane for planning, running, validating and reviewing agent-assisted development.',
			es: 'Un centro de control local-first para planear, ejecutar, validar y revisar desarrollo asistido por agentes.'
		},
		stack: ['Swift', 'SwiftUI', 'Kotlin', 'Jetpack Compose', 'SQLite', 'Git worktrees'],
		accent: 'blue',
		libraries: ['Xcode', 'macOS', 'Android', 'Android Studio', 'Keychain'],
		modules: [
			{
				name: { en: 'Projects & tasks', es: 'Proyectos y tareas' },
				detail: {
					en: 'Local projects, their tasks and the specs behind them.',
					es: 'Proyectos locales, sus tareas y las especificaciones detrás.'
				}
			},
			{
				name: { en: 'Executions in worktrees', es: 'Ejecuciones en worktrees' },
				detail: {
					en: 'Every task execution isolated in its own Git worktree.',
					es: 'Cada ejecución de tarea aislada en su propio worktree de Git.'
				}
			},
			{
				name: { en: 'Agent providers', es: 'Proveedores de agentes' },
				detail: {
					en: 'Agents behind a provider-independent protocol.',
					es: 'Agentes detrás de un protocolo independiente del proveedor.'
				}
			},
			{
				name: { en: 'Validation & review', es: 'Validación y revisión' },
				detail: {
					en: 'Checks that do not trust the agent’s own account of its work.',
					es: 'Comprobaciones que no se fían del relato del propio agente.'
				}
			},
			{
				name: { en: 'Approval & merge', es: 'Aprobación y merge' },
				detail: {
					en: 'Two distinct actions, then cleanup of the worktree.',
					es: 'Dos acciones distintas, y después limpieza del worktree.'
				}
			},
			{
				name: { en: 'Local-first security', es: 'Seguridad local' },
				detail: {
					en: 'Keychain, audit trail, explicit permissions and a kill switch.',
					es: 'Keychain, auditoría, permisos explícitos y un interruptor de emergencia.'
				}
			},
			{
				name: { en: 'Android companion', es: 'Compañero Android' },
				detail: {
					en: 'A Kotlin and Jetpack Compose app after the core MVP.',
					es: 'Una app en Kotlin y Jetpack Compose después del MVP central.'
				}
			}
		],
		palette: {
			base: '#071826',
			accent: '#d2a53f',
			on: 'paper',
			onAccent: 'ink'
		},
		coverArt: {
			src: '/art/project-covers/developer-os-cover-v2.webp',
			width: 1024,
			height: 1536
		},
		link: 'https://github.com/jldev1227',
		image: {
			src: '/projects/developer-os.webp',
			alt: {
				en: 'Developer OS mission-control interface',
				es: 'Interfaz de centro de control de Developer OS'
			},
			caption: {
				en: 'Master mission-control mockup that guides the native macOS implementation.',
				es: 'Mockup maestro del centro de control que guía la implementación nativa para macOS.'
			}
		},
		architecture: [
			{
				layer: { en: 'Native interfaces', es: 'Interfaces nativas' },
				technology: 'SwiftUI · Compose',
				detail: {
					en: 'Mission control on macOS with an Android companion.',
					es: 'Centro de control en macOS con companion para Android.'
				}
			},
			{
				layer: { en: 'Orchestration core', es: 'Núcleo de orquestación' },
				technology: 'Modular monolith',
				detail: {
					en: 'Projects, tasks, providers, approvals and lifecycle rules.',
					es: 'Proyectos, tareas, proveedores, aprobaciones y reglas de ciclo de vida.'
				}
			},
			{
				layer: { en: 'Local persistence', es: 'Persistencia local' },
				technology: 'SQLite · Filesystem · Keychain',
				detail: {
					en: 'Metadata, artifacts and credentials remain on the machine.',
					es: 'Metadatos, artefactos y credenciales permanecen en la máquina.'
				}
			},
			{
				layer: { en: 'Execution and review', es: 'Ejecución y revisión' },
				technology: 'Agents · Git worktrees',
				detail: {
					en: 'Isolated runs, independent validation, diff review and cleanup.',
					es: 'Ejecuciones aisladas, validación independiente, revisión de diff y limpieza.'
				}
			}
		],
		transformation: [
			{
				before: {
					en: 'Agent work scattered across terminals.',
					es: 'Trabajo de agentes disperso entre terminales.'
				},
				after: {
					en: 'One visible task and execution lifecycle.',
					es: 'Un ciclo visible para tareas y ejecuciones.'
				}
			},
			{
				before: {
					en: 'Changes sharing the active checkout.',
					es: 'Cambios compartiendo el checkout activo.'
				},
				after: {
					en: 'Every run isolated in a Git worktree.',
					es: 'Cada ejecución aislada en un Git worktree.'
				}
			},
			{
				before: {
					en: 'Output accepted without a separate gate.',
					es: 'Resultados aceptados sin una barrera independiente.'
				},
				after: {
					en: 'Validation, review and merge are explicit stages.',
					es: 'Validación, revisión y merge como etapas explícitas.'
				}
			}
		],
		decisions: [
			{
				en: 'Keep metadata in SQLite and code, logs and artifacts in the filesystem so the system remains local-first.',
				es: 'Guardar metadatos en SQLite y código, logs y artefactos en el filesystem para mantener el sistema local-first.'
			},
			{
				en: 'Isolate every execution in a Git worktree and separate agent output from independent validation.',
				es: 'Aislar cada ejecución en un Git worktree y separar el resultado del agente de la validación independiente.'
			},
			{
				en: 'Make approval and merge different actions, with audit history and safe cleanup around both.',
				es: 'Mantener aprobación y merge como acciones distintas, con auditoría y limpieza segura alrededor de ambas.'
			}
		],
		challenge: {
			en: 'Agent-assisted coding can execute quickly, but coordination, isolation, validation and human review are still scattered across terminals and memory. The experiment asks what a trustworthy local operating layer for that work should look like.',
			es: 'El desarrollo asistido por agentes puede ejecutar rápido, pero coordinación, aislamiento, validación y revisión humana siguen dispersos entre terminales y memoria. El experimento pregunta cómo debería verse una capa operativa local y confiable para ese trabajo.'
		},
		approach: {
			en: 'Developer OS uses a native SwiftUI control plane on macOS and a Kotlin companion on Android. A modular monolith coordinates projects, tasks, worktrees, agent providers, validation, review and cleanup while SQLite, Keychain and explicit permissions keep control on the machine.',
			es: 'Developer OS usa un centro de control nativo en SwiftUI para macOS y un companion en Kotlin para Android. Un monolito modular coordina proyectos, tareas, worktrees, proveedores de agentes, validación, revisión y limpieza, mientras SQLite, Keychain y permisos explícitos mantienen el control en la máquina.'
		},
		outcome: {
			en: 'The Core MVP exercises the full path from task creation to a real diff, independent validation, human review, merge and cleanup. The repository snapshot contains 114 commits, two native applications and 105 Swift and Kotlin test files documenting the behavior built so far.',
			es: 'El Core MVP recorre el flujo completo: creación de tarea, diff real, validación independiente, revisión humana, merge y limpieza. La foto del repositorio contiene 114 commits, dos aplicaciones nativas y 105 archivos de prueba en Swift y Kotlin que documentan el comportamiento construido.'
		}
	},
	{
		slug: 'gym-vancouver',
		number: '05',
		kicker: { en: 'Case file 05 · Experience', es: 'Expediente 05 · Experiencia' },
		title: 'GYM VANCOUVER',
		tagline: {
			en: 'A school platform that gives administrators, teachers, students and families one shared source of truth.',
			es: 'Una plataforma escolar que conecta administración, docentes, estudiantes y familias sobre una misma fuente de verdad.'
		},
		stack: ['SvelteKit', 'TypeScript', 'Prisma', 'PostgreSQL', 'Tailwind CSS', 'AVIF', 'PDF'],
		accent: 'ink',
		libraries: [
			'Prisma',
			'Zod',
			'Paraglide',
			'sharp',
			'React PDF',
			'Resend',
			'Azure Blob',
			'argon2',
			'Lucide',
			'Playwright',
			'Vercel'
		],
		modules: [
			{
				name: { en: 'Students & groups', es: 'Estudiantes y grupos' },
				detail: {
					en: 'Enrolment, groups and the family behind each student.',
					es: 'Matrícula, grupos y la familia detrás de cada estudiante.'
				}
			},
			{
				name: { en: 'Academics', es: 'Académico' },
				detail: {
					en: 'Subjects, grades and the academic calendar.',
					es: 'Asignaturas, calificaciones y el calendario académico.'
				}
			},
			{
				name: { en: 'Attendance', es: 'Asistencia' },
				detail: {
					en: 'Daily attendance per group, with reports.',
					es: 'Asistencia diaria por grupo, con reportes.'
				}
			},
			{
				name: { en: 'Report cards', es: 'Boletines' },
				detail: {
					en: 'Report cards rendered to PDF from the same records.',
					es: 'Boletines generados en PDF desde los mismos registros.'
				}
			},
			{
				name: { en: 'Fees & payments', es: 'Cartera y pagos' },
				detail: {
					en: 'Balances, payments and what each family owes.',
					es: 'Saldos, pagos y lo que debe cada familia.'
				}
			},
			{
				name: { en: 'Circulars & posts', es: 'Circulares y publicaciones' },
				detail: {
					en: 'School circulars and publications for families.',
					es: 'Circulares y publicaciones del colegio para las familias.'
				}
			},
			{
				name: { en: 'Files', es: 'Archivos' },
				detail: {
					en: 'Images normalised to AVIF and documents in blob storage.',
					es: 'Imágenes normalizadas a AVIF y documentos en blob storage.'
				}
			}
		],
		palette: {
			base: '#f8f3e9',
			accent: '#c42c36',
			on: 'ink',
			onAccent: 'paper'
		},
		coverArt: {
			src: '/art/project-covers/gym-vancouver-cover-v2.webp',
			width: 1024,
			height: 1536
		},
		coverText: 'paper',
		image: {
			src: '/projects/gym-vancouver.webp',
			alt: {
				en: 'Public home page for the Gym Vancouver school platform',
				es: 'Portada pública de la plataforma escolar Gym Vancouver'
			},
			caption: {
				en: 'Real public home page captured from the local application; no student records are shown.',
				es: 'Portada pública real capturada desde la aplicación local; no muestra registros de estudiantes.'
			}
		},
		architecture: [
			{
				layer: { en: 'Role experiences', es: 'Experiencias por rol' },
				technology: 'SvelteKit · TypeScript',
				detail: {
					en: 'Focused navigation for admins, teachers, students and families.',
					es: 'Navegación enfocada para administración, docentes, estudiantes y familias.'
				}
			},
			{
				layer: { en: 'Server boundary', es: 'Frontera de servidor' },
				technology: 'SvelteKit server',
				detail: {
					en: 'Authentication, authorization and school-scoped actions.',
					es: 'Autenticación, autorización y acciones limitadas por colegio.'
				}
			},
			{
				layer: { en: 'Academic model', es: 'Modelo académico' },
				technology: 'Prisma · PostgreSQL',
				detail: {
					en: 'People, groups, periods, grades, attendance and finance.',
					es: 'Personas, grupos, períodos, notas, asistencia y cartera.'
				}
			},
			{
				layer: { en: 'Media and reports', es: 'Medios y reportes' },
				technology: 'AVIF · PDF',
				detail: {
					en: 'Optimized images, report cards and school documents.',
					es: 'Imágenes optimizadas, boletines y documentos escolares.'
				}
			}
		],
		transformation: [
			{
				before: {
					en: 'Separate portals and duplicated identities.',
					es: 'Portales separados e identidades duplicadas.'
				},
				after: {
					en: 'One identity that can carry multiple roles.',
					es: 'Una identidad capaz de asumir varios roles.'
				}
			},
			{
				before: {
					en: 'Families learning about schoolwork too late.',
					es: 'Familias enterándose tarde del trabajo escolar.'
				},
				after: {
					en: 'Activities, attendance and grades in one place.',
					es: 'Actividades, asistencia y notas en un mismo lugar.'
				}
			},
			{
				before: {
					en: 'Authorization implied by the interface.',
					es: 'Autorización implícita en la interfaz.'
				},
				after: {
					en: 'Every read and write enforced on the server.',
					es: 'Cada lectura y escritura validada en el servidor.'
				}
			}
		],
		decisions: [
			{
				en: 'Use one identity with multiple roles instead of duplicating people across separate portals.',
				es: 'Usar una identidad con múltiples roles en lugar de duplicar personas entre portales separados.'
			},
			{
				en: 'Enforce school boundaries and authorization on the server for every read and write.',
				es: 'Aplicar límites por colegio y autorización en servidor para cada lectura y escritura.'
			},
			{
				en: 'Treat academic history, media and PDFs according to their different retention and processing needs.',
				es: 'Tratar historial académico, imágenes y PDF según sus distintas necesidades de conservación y procesamiento.'
			}
		],
		challenge: {
			en: 'A school does not have one generic user: administrators configure the academic year, teachers publish and assess, students follow their work, and families need timely information. The rebuild had to connect those journeys without turning the interface into an enterprise maze.',
			es: 'Un colegio no tiene un usuario genérico: administración configura el año, docentes publican y evalúan, estudiantes siguen su trabajo y familias necesitan información oportuna. La reconstrucción debía conectar esos recorridos sin convertir la interfaz en un laberinto empresarial.'
		},
		approach: {
			en: 'I rebuilt the system as one full-stack SvelteKit application with server-side authorization and a typed Prisma model over PostgreSQL. Role-specific navigation keeps each surface focused, while media processing, reports and document generation live behind explicit server boundaries.',
			es: 'Reconstruí el sistema como una aplicación full-stack en SvelteKit con autorización en servidor y un modelo Prisma tipado sobre PostgreSQL. La navegación por rol mantiene cada superficie enfocada, mientras procesamiento de imágenes, reportes y generación documental viven detrás de límites explícitos del servidor.'
		},
		outcome: {
			en: 'The working rebuild already demonstrates the four role journeys with seeded, fictional data across academics, attendance, communication and finance. Its current snapshot includes 31 product routes and a documented capture set used to review the experience without touching production records.',
			es: 'La reconstrucción funcional ya demuestra los cuatro recorridos con datos ficticios sembrados en módulos académicos, asistencia, comunicación y cartera. La versión actual incluye 31 rutas de producto y un conjunto documentado de capturas para revisar la experiencia sin tocar registros productivos.'
		}
	},
	{
		slug: 'manejo-comentado',
		number: '06',
		kicker: { en: 'Case file 06 · Road safety', es: 'Expediente 06 · Seguridad vial' },
		title: 'MANEJO COMENTADO',
		tagline: {
			en: 'An offline-first platform that turns every commentary-driving course into auditable evidence: audio, GPS, photos, scoring and reports.',
			es: 'Una plataforma offline-first que convierte cada curso de manejo comentado en evidencia auditable: audio, GPS, fotografías, puntaje e informes.'
		},
		stack: [
			'Kotlin',
			'Jetpack Compose',
			'Room',
			'WorkManager',
			'SvelteKit',
			'NestJS',
			'PostgreSQL',
			'OpenAPI'
		],
		accent: 'blue',
		libraries: [
			'Hilt',
			'CameraX',
			'MediaRecorder',
			'Fused Location',
			'Android Keystore',
			'Retrofit',
			'Prisma',
			'WebSockets',
			'Mapbox',
			'WaveSurfer',
			'QRCode',
			'Puppeteer',
			'Argon2'
		],
		modules: [
			{
				name: { en: 'Field agenda', es: 'Agenda de campo' },
				detail: {
					en: 'Assigned sessions, offline packages and provisional enrolment when operations change.',
					es: 'Sesiones asignadas, paquetes offline y altas provisionales cuando la operación cambia.'
				}
			},
			{
				name: { en: 'Consent & pre-operation', es: 'Autorización y preoperacional' },
				detail: {
					en: 'Versioned consent, identity checks, signatures and the vehicle go/no-go decision.',
					es: 'Autorización versionada, identidad, firmas y decisión de aptitud del vehículo.'
				}
			},
			{
				name: { en: 'Guided road session', es: 'Sesión guiada en vía' },
				detail: {
					en: 'Three phases with continuous audio, GPS, photos, hazards and scoring.',
					es: 'Tres fases con audio continuo, GPS, fotografías, peligros y calificación.'
				}
			},
			{
				name: { en: 'Offline evidence', es: 'Evidencia offline' },
				detail: {
					en: 'Local-first capture, encrypted storage and resumable synchronization.',
					es: 'Captura local-first, almacenamiento cifrado y sincronización reanudable.'
				}
			},
			{
				name: { en: 'Review room', es: 'Sala de revisión' },
				detail: {
					en: 'A synchronized timeline for audio, route, photographs, events and score changes.',
					es: 'Una línea de tiempo que sincroniza audio, recorrido, fotos, eventos y cambios de nota.'
				}
			},
			{
				name: { en: 'Issuance & verification', es: 'Emisión y verificación' },
				detail: {
					en: 'Revocable reports plus a limited QR code that verifies printed authenticity.',
					es: 'Informes revocables y un QR limitado que verifica la autenticidad del papel.'
				}
			},
			{
				name: { en: 'Client & administration portals', es: 'Portales de cliente y administración' },
				detail: {
					en: 'Scheduling, accounts, templates and result-only access scoped to each company.',
					es: 'Programación, cuentas, plantillas y acceso a resultados limitado por empresa.'
				}
			}
		],
		palette: {
			base: '#041233',
			accent: '#45d4ff',
			on: 'paper',
			onAccent: 'ink'
		},
		coverArt: {
			src: '/art/project-covers/manejo-comentado-cover-v1.webp',
			width: 1024,
			height: 1536
		},
		coverText: 'paper',
		image: {
			src: '/projects/manejo-comentado.webp',
			alt: {
				en: 'Manejo Comentado product identity with an illuminated road and GPS route',
				es: 'Identidad de Manejo Comentado con una vía iluminada y un recorrido GPS'
			},
			caption: {
				en: 'The public product identity states the contract clearly: auditable evidence, with or without signal.',
				es: 'La identidad pública del producto declara el contrato con claridad: evidencia auditable, con o sin señal.'
			}
		},
		architecture: [
			{
				layer: { en: 'Field application', es: 'Aplicación de campo' },
				technology: 'Kotlin · Compose · Room',
				detail: {
					en: 'A recoverable state machine captures the complete session without connectivity.',
					es: 'Una máquina de estados recuperable captura la sesión completa sin conectividad.'
				}
			},
			{
				layer: { en: 'Contract and domain', es: 'Contrato y dominio' },
				technology: 'OpenAPI · NestJS',
				detail: {
					en: 'One contract joins the surfaces; the server enforces roles and recalculates results.',
					es: 'Un contrato une las superficies; el servidor aplica roles y recalcula resultados.'
				}
			},
			{
				layer: { en: 'Evidence custody', es: 'Custodia de evidencia' },
				technology: 'PostgreSQL · Hash-addressed files',
				detail: {
					en: 'Original payloads, immutable files, hashes and versioned rules remain auditable.',
					es: 'Cargas originales, archivos inmutables, huellas y reglas versionadas conservan la auditoría.'
				}
			},
			{
				layer: { en: 'Review and delivery', es: 'Revisión y entrega' },
				technology: 'SvelteKit · Mapbox · WaveSurfer',
				detail: {
					en: 'The portal aligns route, sound and events before issuing a revocable report.',
					es: 'El portal alinea recorrido, sonido y eventos antes de emitir un informe revocable.'
				}
			}
		],
		transformation: [
			{
				before: {
					en: 'A signed certificate with little proof behind it.',
					es: 'Una constancia firmada con poca evidencia detrás.'
				},
				after: {
					en: 'Audio, GPS, photos and decisions tied to one traceable session.',
					es: 'Audio, GPS, fotos y decisiones ligados a una sesión trazable.'
				}
			},
			{
				before: {
					en: 'Field work blocked whenever coverage disappears.',
					es: 'Trabajo de campo bloqueado cuando desaparece la señal.'
				},
				after: {
					en: 'The full session runs offline and synchronizes afterwards.',
					es: 'La sesión completa funciona offline y sincroniza después.'
				}
			},
			{
				before: {
					en: 'A field score accepted as the final truth.',
					es: 'Una nota de campo aceptada como verdad final.'
				},
				after: {
					en: 'Independent server recalculation and human resolution of discrepancies.',
					es: 'Recálculo independiente en servidor y resolución humana de discrepancias.'
				}
			}
		],
		decisions: [
			{
				en: 'Model the session as an explicit state machine and retain the original evidence separately from every derived conclusion.',
				es: 'Modelar la sesión como una máquina de estados explícita y conservar la evidencia original separada de cada conclusión derivada.'
			},
			{
				en: 'Capture to Room first, encrypt sensitive material with Android Keystore, and synchronize idempotently by content fingerprint.',
				es: 'Capturar primero en Room, cifrar lo sensible con Android Keystore y sincronizar de forma idempotente por huella de contenido.'
			},
			{
				en: 'Give the evidence link and the printed QR different powers: one opens authorized detail, the other only verifies authenticity.',
				es: 'Dar poderes distintos al enlace de evidencia y al QR impreso: uno abre el detalle autorizado; el otro solo verifica autenticidad.'
			}
		],
		challenge: {
			en: 'A commentary-driving course happens inside a vehicle, often with unreliable coverage, and joins road safety with identity, voice, location, photographs, signatures and scoring. The challenge was not to produce another certificate, but to turn a one-time field session into evidence that can withstand an audit without distracting the instructor or exposing sensitive data.',
			es: 'Un curso de manejo comentado ocurre dentro de un vehículo, a menudo con señal inestable, y mezcla seguridad vial con identidad, voz, ubicación, fotografías, firmas y calificación. El reto no era producir otra constancia, sino convertir una sesión irrepetible en evidencia defendible ante una auditoría sin distraer al instructor ni exponer datos sensibles.'
		},
		approach: {
			en: 'I designed the Android experience as an offline-first state machine backed by Room, WorkManager and protected device storage. A contract-first NestJS API receives immutable evidence, recalculates the score and sends discrepancies to human review; SvelteKit then brings audio, GPS, photographs and events together for review, issuance and limited public verification.',
			es: 'Diseñé la experiencia Android como una máquina de estados offline-first respaldada por Room, WorkManager y almacenamiento protegido en el dispositivo. Una API NestJS contract-first recibe evidencia inmutable, recalcula el puntaje y envía las discrepancias a revisión humana; SvelteKit reúne audio, GPS, fotografías y eventos para revisar, emitir y verificar públicamente con alcance limitado.'
		},
		outcome: {
			en: 'The current build covers the technical journey from scheduling and Android capture to synchronization, web review, revocable issuance and public authenticity checks. The repository snapshot contains 103 commits, 28 web routes and handlers, and 30 test files across the native app, API and portal, while the product advances through internal beta.',
			es: 'La versión actual cubre el recorrido técnico desde la programación y la captura Android hasta la sincronización, la revisión web, la emisión revocable y la verificación pública de autenticidad. La foto del repositorio reúne 103 commits, 28 rutas y handlers web y 30 archivos de prueba entre la app nativa, la API y el portal, mientras el producto avanza en beta interna.'
		},
		link: 'https://manejo-comentado.vercel.app'
	}
];

export function findProject(slug: string): Project | undefined {
	return projects.find((project) => project.slug === slug);
}
