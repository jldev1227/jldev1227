/**
 * Typings for StPageFlip 2.0.7, which ships none of its own.
 *
 * Two facts about the package shape, both established by reading `dist/`:
 *
 * 1. `main` and `browser` point at `page-flip.browser.js`, which is UMD. The
 *    ESM build exists at `dist/js/page-flip.module.js` but no `module` or
 *    `exports` field advertises it, so it has to be imported by path.
 * 2. The stylesheet is injected by the bundle at import time; there is no CSS
 *    file to import alongside it.
 *
 * Only the surface the adapter actually touches is declared. If milestone 5
 * needs more, widen it here rather than reaching for `any`.
 */
declare module 'page-flip/dist/js/page-flip.module.js' {
	export type FlipOrientation = 'portrait' | 'landscape';
	export type FlipState = 'user_fold' | 'fold_corner' | 'flipping' | 'read';

	export interface PageFlipSettings {
		width: number;
		height: number;
		size: 'fixed' | 'stretch';
		minWidth: number;
		maxWidth: number;
		minHeight: number;
		maxHeight: number;
		drawShadow: boolean;
		flippingTime: number;
		usePortrait: boolean;
		startZIndex: number;
		autoSize: boolean;
		maxShadowOpacity: number;
		showCover: boolean;
		mobileScrollSupport: boolean;
		swipeDistance: number;
		clickEventForward: boolean;
		useMouseEvents: boolean;
		showPageCorners: boolean;
		disableFlipByClick: boolean;
		startPage: number;
	}

	export interface WidgetEvent<T> {
		data: T;
		object: PageFlip;
	}

	export class PageFlip {
		constructor(element: HTMLElement, settings: Partial<PageFlipSettings>);

		loadFromHTML(items: NodeListOf<Element> | HTMLElement[]): void;
		updateFromHtml(items: NodeListOf<Element> | HTMLElement[]): void;

		on(event: 'flip', handler: (event: WidgetEvent<number>) => void): PageFlip;
		on(
			event: 'changeOrientation',
			handler: (event: WidgetEvent<FlipOrientation>) => void
		): PageFlip;
		on(event: 'changeState', handler: (event: WidgetEvent<FlipState>) => void): PageFlip;
		on(
			event: 'init',
			handler: (event: WidgetEvent<{ page: number; mode: FlipOrientation }>) => void
		): PageFlip;
		off(event: 'flip' | 'changeOrientation' | 'changeState' | 'init'): void;

		flipNext(corner?: 'top' | 'bottom'): void;
		flipPrev(corner?: 'top' | 'bottom'): void;
		turnToPage(page: number): void;

		getCurrentPageIndex(): number;
		getPageCount(): number;
		getOrientation(): FlipOrientation;

		destroy(): void;
	}
}
