/** The archive has one decision: browse the box or read the selected issue. */
export type ExperienceState =
	{ mode: 'browse'; focusedIssueId?: string } | { mode: 'read'; issueId: string; page: number };

export interface ExperienceIssue {
	id: string;
	/** Interior pages; page zero is the cover supplied by the reader. */
	pageCount: number;
}

export type Catalogue = readonly ExperienceIssue[];

export type ExperienceEvent =
	| { type: 'focus'; issueId: string }
	| { type: 'select'; issueId: string }
	| { type: 'turnTo'; page: number }
	| { type: 'return' }
	| { type: 'back' };

export const BROWSE: ExperienceState = { mode: 'browse' };
export const FIRST_PAGE = 0;

export function findIssue(catalogue: Catalogue, id: string): ExperienceIssue | undefined {
	return catalogue.find((issue) => issue.id === id);
}

export function issueOf(state: ExperienceState): string | undefined {
	return state.mode === 'browse' ? state.focusedIssueId : state.issueId;
}

export function clampPage(page: number, issue: ExperienceIssue): number {
	if (!Number.isFinite(page)) return FIRST_PAGE;
	return Math.min(Math.max(Math.trunc(page), FIRST_PAGE), issue.pageCount);
}

export function reduce(
	state: ExperienceState,
	event: ExperienceEvent,
	catalogue: Catalogue
): ExperienceState {
	switch (event.type) {
		case 'focus': {
			if (state.mode !== 'browse' || !findIssue(catalogue, event.issueId)) return state;
			return state.focusedIssueId === event.issueId
				? state
				: { mode: 'browse', focusedIssueId: event.issueId };
		}

		case 'select': {
			if (state.mode !== 'browse' || !findIssue(catalogue, event.issueId)) return state;
			return { mode: 'read', issueId: event.issueId, page: FIRST_PAGE };
		}

		case 'turnTo': {
			if (state.mode !== 'read') return state;
			const issue = findIssue(catalogue, state.issueId);
			if (!issue) return state;
			const page = clampPage(event.page, issue);
			return page === state.page ? state : { ...state, page };
		}

		case 'return':
		case 'back':
			return state.mode === 'read' ? { mode: 'browse', focusedIssueId: state.issueId } : state;
	}
}

export function back(state: ExperienceState, catalogue: Catalogue): ExperienceState {
	return reduce(state, { type: 'back' }, catalogue);
}

export function isSame(a: ExperienceState, b: ExperienceState): boolean {
	if (a.mode !== b.mode) return false;
	if (a.mode === 'browse' && b.mode === 'browse') return a.focusedIssueId === b.focusedIssueId;
	if (a.mode === 'read' && b.mode === 'read') return a.issueId === b.issueId && a.page === b.page;
	return false;
}

/* The canonical route stays unchanged. The hash stores only transient reading
   position: `#segispro/p0` is its cover and `#segispro/p3` its third page. */
const PAGE_PREFIX = 'p';

export function toHash(state: ExperienceState): string {
	return state.mode === 'browse' ? '' : `#${state.issueId}/${PAGE_PREFIX}${state.page}`;
}

export function fromHash(hash: string, catalogue: Catalogue): ExperienceState {
	const raw = hash.startsWith('#') ? hash.slice(1) : hash;
	if (!raw) return BROWSE;

	const [encodedId, detail] = raw.split('/');
	const issue = findIssue(catalogue, decodeURIComponent(encodedId));
	if (!issue) return BROWSE;

	// Old inspect links remain useful after the flow was flattened: they now
	// open that same issue directly on its cover.
	if (!detail || detail === 'front' || detail === 'back') {
		return { mode: 'read', issueId: issue.id, page: FIRST_PAGE };
	}

	if (detail.startsWith(PAGE_PREFIX)) {
		const digits = detail.slice(PAGE_PREFIX.length);
		if (/^-?\d+$/.test(digits)) {
			return { mode: 'read', issueId: issue.id, page: clampPage(Number(digits), issue) };
		}
	}

	return { mode: 'read', issueId: issue.id, page: FIRST_PAGE };
}
