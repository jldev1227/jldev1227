declare module 'page-flip' {
	export interface PageFlipEvent<T = unknown> {
		data: T;
		object: PageFlip;
	}

	export class PageFlip {
		constructor(root: HTMLElement, settings: Record<string, number | string | boolean>);
		loadFromHTML(items: NodeListOf<HTMLElement> | HTMLElement[]): void;
		on<T = unknown>(event: string, callback: (event: PageFlipEvent<T>) => void): PageFlip;
		off(event: string): void;
		flipNext(corner?: 'top' | 'bottom'): void;
		flipPrev(corner?: 'top' | 'bottom'): void;
		turnToPage(page: number): void;
		getCurrentPageIndex(): number;
		getPageCount(): number;
		destroy(): void;
	}
}
