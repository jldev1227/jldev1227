import { writeFileSync } from 'node:fs';
import * as si from 'simple-icons';

/** Technology as written in `projects.ts` → the simple-icons export for it. */
const MAP = {
	SvelteKit: 'siSvelte',
	'SvelteKit server': 'siSvelte',
	TypeScript: 'siTypescript',
	NestJS: 'siNestjs',
	PostgreSQL: 'siPostgresql',
	Redis: 'siRedis',
	Prisma: 'siPrisma',
	Fastify: 'siFastify',
	'Socket.IO': 'siSocketdotio',
	Swift: 'siSwift',
	SwiftUI: 'siSwift',
	Kotlin: 'siKotlin',
	'Jetpack Compose': 'siJetpackcompose',
	Compose: 'siJetpackcompose',
	'Tailwind CSS': 'siTailwindcss',
	SQLite: 'siSqlite',
	Mapbox: 'siMapbox',
	'Git worktrees': 'siGit',
	'SAML/OIDC': 'siOpenid',
	SSO: 'siOpenid',
	// The wider toolkit each case file lists.
	'Drizzle ORM': 'siDrizzle',
	Passport: 'siPassport',
	'JSON Web Tokens': 'siJsonwebtokens',
	Swagger: 'siSwagger',
	'Chart.js': 'siChartdotjs',
	D3: 'siD3',
	'Google Calendar': 'siGooglecalendar',
	Vitest: 'siVitest',
	Lucide: 'siLucide',
	TypeORM: 'siTypeorm',
	Resend: 'siResend',
	TanStack: 'siTanstack',
	GSAP: 'siGsap',
	Zod: 'siZod',
	Pino: 'siPino',
	Puppeteer: 'siPuppeteer',
	Anthropic: 'siAnthropic',
	Xcode: 'siXcode',
	macOS: 'siMacos',
	Android: 'siAndroid',
	'Android Studio': 'siAndroidstudio',
	sharp: 'siSharp',
	'React PDF': 'siReact',
	Vercel: 'siVercel'
};

/**
 * Marks drawn here, for what has no brand mark in Simple Icons: either a
 * concept rather than a product (a socket, a queue, a bucket, a file format)
 * or a product whose mark is a wordmark. Single paths on the same 24×24
 * viewBox, drawn to sit next to the brand marks at the same weight.
 */
const HAND = {
	websockets: {
		title: 'WebSockets',
		// Two arrows passing each other: a channel that talks both ways.
		path: 'M2 8h13.2l-3.6-3.6L13 3l6 6-6 6-1.4-1.4L15.2 10H2V8zm20 8H8.8l3.6 3.6L11 21l-6-6 6-6 1.4 1.4L8.8 14H22v2z'
	},
	bullmq: {
		title: 'BullMQ',
		// Jobs lined up, and the one at the head being taken.
		path: 'M3 5h8v3H3V5zm0 5.5h8v3H3v-3zM3 16h8v3H3v-3zm11-8.5h3.2L14.6 4.9 16 3.5l5 5-5 5-1.4-1.4 2.6-2.6H14v-2zm0 8.5h7v3h-7v-3z'
	},
	azureblob: {
		title: 'Azure Blob Storage',
		// A cloud with a slot: storage you put things into.
		path: 'M7 19a5 5 0 0 1-.6-9.96A6.5 6.5 0 0 1 18.9 9.1 4.5 4.5 0 0 1 18 18.9V19H7zm0-2h11a2.5 2.5 0 0 0 .2-5l-1.6-.1-.3-1.5A4.5 4.5 0 0 0 8 10.9l-.3 1.2-1.2.1A3 3 0 0 0 7 17zm2-3h6v1.6H9V14z'
	},
	azureai: {
		title: 'Azure AI',
		// A spark: the model behind the document reading.
		path: 'M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2zM5 16l.9 2.6L8.5 19.5l-2.6.9L5 23l-.9-2.6L1.5 19.5l2.6-.9L5 16zm14-1l.6 1.9 1.9.6-1.9.6L19 20l-.6-1.9-1.9-.6 1.9-.6L19 15z'
	},
	amazons3: {
		title: 'Amazon S3',
		// A bucket, seen from slightly above.
		path: 'M12 2c5 0 9 1.3 9 3v1.2l-1.6 12.4C19.2 20.3 15.9 22 12 22s-7.2-1.7-7.4-3.4L3 6.2V5c0-1.7 4-3 9-3zm0 2c-3.9 0-6.6.9-7 1.5.4.6 3.1 1.5 7 1.5s6.6-.9 7-1.5c-.4-.6-3.1-1.5-7-1.5zM5.2 8.4l1.4 10c.1.6 2.4 1.6 5.4 1.6s5.3-1 5.4-1.6l1.4-10C17.2 9.4 14.7 10 12 10s-5.2-.6-6.8-1.6z'
	},
	pdf: {
		title: 'PDF',
		// A sheet with a folded corner and three lines of print.
		path: 'M6 2h8l6 6v14H6V2zm2 2v16h10V9h-5V4H8zm2 8h6v1.6h-6V12zm0 3h6v1.6h-6V15zm0-6h2.5v1.6H10V9z'
	},
	avif: {
		title: 'AVIF',
		// A picture in its frame: mountains and a sun.
		path: 'M3 4h18v16H3V4zm2 2v9.2l4-4.4 3.5 3.8 2.5-2.6 4 4.4V6H5zm0 12h14v-.9l-4-4.4-2.5 2.6L9 13.7 5 18zm11-9a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z'
	}
};

const seen = new Map();
for (const [tech, key] of Object.entries(MAP)) {
	const icon = si[key];
	if (!icon) throw new Error(`no icon for ${tech} (${key})`);
	seen.set(key, icon);
}

/** Technology as written in `projects.ts` → a hand-drawn mark above. */
const HAND_MAP = {
	WebSockets: 'websockets',
	BullMQ: 'bullmq',
	'Azure Blob': 'azureblob',
	'Azure AI': 'azureai',
	'Amazon S3': 'amazons3',
	PDF: 'pdf',
	jsPDF: 'pdf',
	pdfmake: 'pdf',
	AVIF: 'avif'
};

const marks = [
	...[...seen.entries()].map(
		([key, icon]) =>
			`\t${key.slice(2).toLowerCase()}: {\n\t\ttitle: '${icon.title.replace(/'/g, "\\'")}',\n\t\tpath: '${icon.path}'\n\t}`
	),
	...Object.entries(HAND).map(
		([key, icon]) => `\t${key}: {\n\t\ttitle: '${icon.title}',\n\t\tpath: '${icon.path}'\n\t}`
	)
].join(',\n');

const lookup = [
	...Object.entries(MAP).map(([tech, key]) => `\t'${tech}': '${key.slice(2).toLowerCase()}'`),
	...Object.entries(HAND_MAP).map(([tech, key]) => `\t'${tech}': '${key}'`)
].join(',\n');

writeFileSync(
	'src/lib/content/tech-marks.ts',
	`/**
 * Brand marks for the stack, so the architecture reads as the tools it is made
 * of rather than as a list of words.
 *
 * Paths are lifted from Simple Icons (https://simpleicons.org), which is CC0,
 * and a few concepts with no brand mark are drawn in the generator by hand.
 * Only the marks this site actually uses are kept here — importing the whole
 * set would put three thousand icons in the bundle. Regenerate with
 * \`node scripts/tech-marks.mjs\` after adding a technology to \`projects.ts\`.
 */

export interface TechMark {
	title: string;
	/** A single path on a 24×24 viewBox. */
	path: string;
}

const MARKS = {
${marks}
} as const satisfies Record<string, TechMark>;

/** Technology as written in \`projects.ts\` → its mark. */
const BY_TECHNOLOGY: Record<string, keyof typeof MARKS> = {
${lookup}
};

/** The mark for a technology, when one exists. Concepts have none on purpose. */
export function techMark(technology: string): TechMark | undefined {
	const key = BY_TECHNOLOGY[technology.trim()];
	return key ? MARKS[key] : undefined;
}

/** Two letters standing in for a technology that has no brand mark. */
export function techMonogram(technology: string): string {
	const words = technology.trim().split(/[\\s·/]+/).filter(Boolean);
	if (words.length > 1) return (words[0][0] + words[1][0]).toUpperCase();
	return technology.trim().slice(0, 2).toUpperCase();
}
`
);
console.log('written: src/lib/content/tech-marks.ts');
