import { describe, expect, it } from 'vitest';
import {
	BROWSE,
	back,
	clampPage,
	fromHash,
	isSame,
	reduce,
	toHash,
	type Catalogue,
	type ExperienceEvent,
	type ExperienceState
} from './experience-state';

const CATALOGUE: Catalogue = [
	{ id: 'intro', pageCount: 9 },
	{ id: 'segispro', pageCount: 6 }
];

const browse = (focusedIssueId?: string): ExperienceState => ({ mode: 'browse', focusedIssueId });
const read = (issueId: string, page = 0): ExperienceState => ({ mode: 'read', issueId, page });
const on = (state: ExperienceState, ...events: ExperienceEvent[]) =>
	events.reduce((current, event) => reduce(current, event, CATALOGUE), state);

describe('the direct box-to-reader flow', () => {
	it('opens a selected issue directly on its cover', () => {
		expect(on(BROWSE, { type: 'select', issueId: 'segispro' })).toEqual(read('segispro'));
	});

	it('returns directly to the box with the issue focused', () => {
		expect(on(read('segispro', 4), { type: 'return' })).toEqual(browse('segispro'));
		expect(back(read('segispro', 4), CATALOGUE)).toEqual(browse('segispro'));
	});

	it('tracks a valid page and clamps an invalid one', () => {
		expect(on(read('segispro'), { type: 'turnTo', page: 4 })).toEqual(read('segispro', 4));
		expect(on(read('segispro'), { type: 'turnTo', page: 99 })).toEqual(read('segispro', 6));
		expect(clampPage(Number.NaN, CATALOGUE[1])).toBe(0);
	});

	it('ignores events that do not belong to the current state', () => {
		expect(on(BROWSE, { type: 'turnTo', page: 2 })).toBe(BROWSE);
		expect(on(BROWSE, { type: 'select', issueId: 'missing' })).toBe(BROWSE);
		expect(on(read('segispro'), { type: 'focus', issueId: 'intro' })).toEqual(read('segispro'));
	});
});

describe('URL restoration', () => {
	it('stores the selected issue and reading position', () => {
		expect(toHash(BROWSE)).toBe('');
		expect(toHash(read('segispro'))).toBe('#segispro/p0');
		expect(toHash(read('segispro', 4))).toBe('#segispro/p4');
		expect(fromHash('#segispro/p4', CATALOGUE)).toEqual(read('segispro', 4));
	});

	it('opens legacy inspect hashes directly in the reader', () => {
		expect(fromHash('#segispro', CATALOGUE)).toEqual(read('segispro'));
		expect(fromHash('#segispro/back', CATALOGUE)).toEqual(read('segispro'));
	});

	it('falls back safely', () => {
		expect(fromHash('', CATALOGUE)).toEqual(BROWSE);
		expect(fromHash('#missing/p2', CATALOGUE)).toEqual(BROWSE);
		expect(fromHash('#segispro/nope', CATALOGUE)).toEqual(read('segispro'));
	});
});

describe('state identity', () => {
	it('distinguishes meaningful changes', () => {
		expect(isSame(read('intro', 2), read('intro', 2))).toBe(true);
		expect(isSame(read('intro', 2), read('intro', 3))).toBe(false);
		expect(isSame(BROWSE, browse('intro'))).toBe(false);
	});
});
