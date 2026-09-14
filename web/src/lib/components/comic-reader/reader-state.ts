/**
 * Reader state, as plain data.
 *
 * A *position* is a page index: `0` is the cover and `1…pageCount` are the
 * interior pages. A position always names the **leading** page of the current
 * view — on a desktop spread the view also shows `position + 1`.
 *
 * Nothing here touches the DOM. An animation reports that a turn finished; it
 * never decides where the reader is.
 */

export const COVER = 0;

export type TurnDirection = 'forward' | 'backward';

export type ReaderState =
	| { mode: 'closed' }
	| { mode: 'open'; page: number }
	| {
			mode: 'turning';
			from: number;
			to: number;
			direction: TurnDirection;
			/**
			 * 0…1. Phase 2 only ever settles at the ends; the drag gesture in
			 * phase 3 is what fills this in between them.
			 */
			progress: number;
	  };

export interface ReaderGeometry {
	/** Interior pages, the cover excluded. */
	pageCount: number;
	/** 2 for the desktop spread, 1 for the mobile single page. */
	pagesPerView: 1 | 2;
}

/** Where the reader is heading — the current position unless a sheet is moving. */
export function target(state: ReaderState): number {
	if (state.mode === 'closed') return COVER;
	if (state.mode === 'open') return state.page;
	return state.to;
}

/** Snap a position inside the book and onto a view boundary. */
export function normalize(page: number, geometry: ReaderGeometry): number {
	const { pageCount, pagesPerView } = geometry;
	if (page <= COVER || pageCount === 0) return COVER;

	const clamped = Math.min(page, pageCount);
	// A spread always starts on an odd page, so it reads as `n` and `n + 1`.
	return pagesPerView === 2 ? clamped - ((clamped - 1) % 2) : clamped;
}

export function lastPosition(geometry: ReaderGeometry): number {
	return normalize(geometry.pageCount, geometry);
}

/** The pages one view shows. The cover shows none of them. */
export function pagesInView(page: number, geometry: ReaderGeometry): number[] {
	if (page <= COVER) return [];
	const pages = [page];
	if (geometry.pagesPerView === 2 && page + 1 <= geometry.pageCount) pages.push(page + 1);
	return pages;
}

export function canGoForward(state: ReaderState, geometry: ReaderGeometry): boolean {
	return target(state) < lastPosition(geometry);
}

export function canGoBack(state: ReaderState): boolean {
	return target(state) > COVER;
}

function turn(from: number, to: number): ReaderState {
	return { mode: 'turning', from, to, direction: to > from ? 'forward' : 'backward', progress: 0 };
}

/**
 * The three movement functions return the state unchanged when the move is not
 * available, so repeated input during a turn is ignored — deterministically,
 * rather than queued into a stutter.
 */
export function forward(state: ReaderState, geometry: ReaderGeometry): ReaderState {
	if (state.mode === 'turning') return state;

	const from = target(state);
	const to = normalize(from === COVER ? 1 : from + geometry.pagesPerView, geometry);
	return to === from ? state : turn(from, to);
}

export function backward(state: ReaderState, geometry: ReaderGeometry): ReaderState {
	if (state.mode === 'turning') return state;

	const from = target(state);
	if (from === COVER) return state;

	const previous = from - geometry.pagesPerView;
	return turn(from, previous <= COVER ? COVER : normalize(previous, geometry));
}

export function goTo(state: ReaderState, page: number, geometry: ReaderGeometry): ReaderState {
	if (state.mode === 'turning') return state;

	const from = target(state);
	const to = normalize(page, geometry);
	return to === from ? state : turn(from, to);
}

/** The turn was abandoned: go back where it started. */
export function cancel(state: ReaderState): ReaderState {
	if (state.mode !== 'turning') return state;
	return state.from === COVER ? { mode: 'closed' } : { mode: 'open', page: state.from };
}

/** Report how far a drag has carried the sheet, 0…1. */
export function withProgress(state: ReaderState, progress: number): ReaderState {
	if (state.mode !== 'turning') return state;
	return { ...state, progress: Math.min(1, Math.max(0, progress)) };
}

/** The turn finished: adopt its destination. */
export function settle(state: ReaderState): ReaderState {
	if (state.mode !== 'turning') return state;
	return state.to === COVER ? { mode: 'closed' } : { mode: 'open', page: state.to };
}

/**
 * Re-anchor after the viewport changed how many pages fit in a view: a spread
 * collapsing to one page keeps its left-hand page, and a pair of single pages
 * re-forms into the spread that contains the one being read.
 */
export function reflow(state: ReaderState, geometry: ReaderGeometry): ReaderState {
	const settled = settle(state);
	if (settled.mode !== 'open') return settled;

	const page = normalize(settled.page, geometry);
	return page === COVER ? { mode: 'closed' } : { mode: 'open', page };
}

/** How long a move takes, given the two motion tokens the CSS also uses. */
export function turnDuration(state: ReaderState, motion: { cover: number; page: number }): number {
	if (state.mode !== 'turning') return 0;
	return state.from === COVER || state.to === COVER ? motion.cover : motion.page;
}
