/**
 * Responsive sources for the illustrated art.
 *
 * Artwork is authored at its natural dimensions. A large plate painted into a
 * small slot costs bandwidth and buys nothing, so
 * `scripts/image-variants.mjs` renders each master down to the widths below in
 * AVIF and WebP, and this module turns a master's path into the `srcset`
 * strings that reference them.
 *
 * The build script reads `ART_WIDTHS`; `responsiveArt()` defaults to the smaller
 * cover ladder, while wide backdrops can opt into the 1536 px rendition.
 */

/** Width ladder the asset script can render, including wide hero backgrounds. */
export const ART_WIDTHS = [384, 576, 768, 1024, 1536] as const;

/** Standard cover widths; wide heroes opt into the 1536 px rendition. */
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
	/** Home hero artwork spans the full viewport at every breakpoint. */
	hero: '100vw',
	/** Home project banners: full card width on phones, roughly half the page on desks. */
	world: '(max-width: 900px) 100vw, 50vw',
	/** A case file's hero: the cover plate runs the full width of the page. */
	caseHero: '100vw'
} as const;
