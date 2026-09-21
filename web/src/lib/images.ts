/**
 * Responsive sources for the illustrated art.
 *
 * Every cover is authored once at 1024 × 1536. A 1024 px plate painted into a
 * 384 px slot costs half a megabyte and buys nothing, so
 * `scripts/image-variants.mjs` renders each master down to the widths below in
 * AVIF and WebP, and this module turns a master's path into the `srcset`
 * strings that reference them.
 *
 * The widths live here because the markup is what needs them; the script reads
 * these same arrays back out of this file, so the rendered files and the
 * `srcset` that points at them cannot drift apart.
 */

/** Cover art: portrait plates that never exceed a single column. */
export const COVER_WIDTHS = [384, 576, 768, 1024] as const;

export type ResponsiveArt = {
	/** `srcset` for the AVIF sources. */
	avif: string;
	/** `srcset` for the WebP sources. */
	webp: string;
	/** What `<img>` itself points at, for anything that ignores `<source>`. */
	src: string;
};

const stem = (src: string) => src.replace(/\.[a-z0-9]+$/i, '');

const variant = (src: string, width: number, format: 'avif' | 'webp') =>
	`${stem(src)}-${width}.${format}`;

const srcset = (src: string, widths: readonly number[], format: 'avif' | 'webp') =>
	widths.map((width) => `${variant(src, width, format)} ${width}w`).join(', ');

/**
 * The three sources a `<picture>` needs for one master illustration.
 *
 * `fallbackWidth` is what a browser without `<picture>` downloads — a middle
 * step rather than the largest, because that browser is also the one least
 * likely to be on a fast connection.
 */
export function responsiveArt(
	src: string,
	widths: readonly number[] = COVER_WIDTHS,
	fallbackWidth = 768
): ResponsiveArt {
	return {
		avif: srcset(src, widths, 'avif'),
		webp: srcset(src, widths, 'webp'),
		src: variant(src, fallbackWidth, 'webp')
	};
}

/**
 * `sizes` for each slot the art lands in, measured from the layout rules that
 * place it. A `sizes` value that overstates the slot undoes the whole point of
 * `srcset`, so these track the home page's grid and a case file's own hero.
 */
export const ART_SIZES = {
	/** Home hero: a full-width plate on a phone, half the spread on a desk. */
	hero: '(max-width: 900px) 100vw, 50vw',
	/** Home case-file covers: one per row on a phone, six of twelve columns on a desk. */
	world: '(max-width: 900px) 100vw, 50vw',
	/** A case file's hero: the cover plate runs the full width of the page. */
	caseHero: '100vw'
} as const;
