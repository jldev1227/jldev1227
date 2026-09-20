import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

/**
 * Responsive AVIF and WebP renditions of the illustrated art.
 *
 * The masters are authored large — covers at 1024 × 1536 — and the layout
 * paints them into slots as small as 384 px. This script renders each master
 * down to the widths declared in
 * `src/lib/images.ts` in both formats, beside the master, so `<picture>` can
 * hand every viewport the smallest file that still looks sharp.
 *
 * Which images get rendered is not a list kept here: the script reads every
 * `/art/...` path the source actually references, so a new case file's cover
 * is picked up the moment its markup points at it, and nothing renders
 * variants of art no page uses.
 *
 * Regenerate with `npm run art:variants`. Output is committed — the build
 * stays a plain `vite build` with no image pipeline in it.
 */

const HERE = dirname(fileURLToPath(import.meta.url));
const WEB = join(HERE, '..');
const SRC = join(WEB, 'src');
const STATIC = join(WEB, 'static');

/** Comic line and flat colour survive AVIF hard; the WebP is the safety net. */
const AVIF = { quality: 52, effort: 6 };
const WEBP = { quality: 74, effort: 6 };

/** Read the width ladder out of `src/lib/images.ts` so the two cannot drift. */
function widthLadder() {
	const module = readFileSync(join(SRC, 'lib', 'images.ts'), 'utf8');
	const match = module.match(/export const COVER_WIDTHS = \[([^\]]+)\]/);
	if (!match) throw new Error('COVER_WIDTHS is not declared in src/lib/images.ts');
	return match[1]
		.split(',')
		.map((width) => Number(width.trim()))
		.filter((width) => Number.isFinite(width));
}

/** Every `/art/…` file the site's own source points at, once each. */
function referencedArt() {
	const found = new Set();
	const pattern = /\/art\/[A-Za-z0-9/._-]+\.(?:webp|jpg|jpeg|png)/g;

	const walk = (dir) => {
		for (const entry of readdirSync(dir, { withFileTypes: true })) {
			const path = join(dir, entry.name);
			if (entry.isDirectory()) {
				walk(path);
			} else if (/\.(ts|js|svelte|html)$/.test(entry.name)) {
				for (const match of readFileSync(path, 'utf8').matchAll(pattern)) found.add(match[0]);
			}
		}
	};

	walk(SRC);
	return [...found].sort();
}

const kb = (bytes) => `${Math.round(bytes / 1024)} KB`;

const ladder = widthLadder();
const masters = referencedArt();
let written = 0;
let masterBytes = 0;
let bestBytes = 0;

for (const reference of masters) {
	const master = join(STATIC, reference);
	let source;
	try {
		source = statSync(master);
	} catch {
		console.error(`missing master: static${reference}`);
		process.exitCode = 1;
		continue;
	}

	const image = sharp(master);
	const { width } = await image.metadata();

	const stem = join(dirname(master), basename(master, extname(master)));
	const widths = ladder.filter((candidate) => candidate <= width);

	masterBytes += source.size;
	let smallestUsable = Infinity;

	for (const target of widths) {
		for (const [format, options] of [
			['avif', AVIF],
			['webp', WEBP]
		]) {
			const out = `${stem}-${target}.${format}`;
			let size;

			try {
				const existing = statSync(out);
				if (existing.mtimeMs >= source.mtimeMs) {
					size = existing.size;
				}
			} catch {
				// Not rendered yet.
			}

			if (size === undefined) {
				const resized = sharp(master).resize({ width: target, withoutEnlargement: true });
				const encoded = format === 'avif' ? resized.avif(options) : resized.webp(options);
				const buffer = await encoded.toBuffer();
				writeFileSync(out, buffer);
				size = buffer.length;
				written += 1;
			}

			if (format === 'avif' && target === widths[0]) smallestUsable = size;
		}
	}

	bestBytes += smallestUsable;
	console.log(
		`${reference.padEnd(52)} ${String(width).padStart(4)}px ${kb(source.size).padStart(7)} → ` +
			`${widths.length} widths, smallest AVIF ${kb(smallestUsable)}`
	);
}

console.log(
	`\n${masters.length} masters, ${written} files rendered. ` +
		`Masters weigh ${kb(masterBytes)}; the smallest AVIF of each weighs ${kb(bestBytes)}.`
);
