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
	SSO: 'siOpenid'
};

const seen = new Map();
for (const [tech, key] of Object.entries(MAP)) {
	const icon = si[key];
	if (!icon) throw new Error(`no icon for ${tech} (${key})`);
	seen.set(key, icon);
}

const marks = [...seen.entries()]
	.map(
		([key, icon]) =>
			`\t${key.slice(2).toLowerCase()}: {\n\t\ttitle: '${icon.title.replace(/'/g, "\\'")}',\n\t\tpath: '${icon.path}'\n\t}`
	)
	.join(',\n');

const lookup = Object.entries(MAP)
	.map(([tech, key]) => `\t'${tech}': '${key.slice(2).toLowerCase()}'`)
	.join(',\n');

writeFileSync(
	'src/lib/content/tech-marks.ts',
	`/**
 * Brand marks for the stack, so the architecture reads as the tools it is made
 * of rather than as a list of words.
 *
 * Paths are lifted from Simple Icons (https://simpleicons.org), which is CC0.
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
