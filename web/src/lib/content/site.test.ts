import { describe, expect, it } from 'vitest';
import { projects } from './projects';
import { stack } from './site';

describe('the stack page', () => {
	it('lists only tools that have shipped in a case file', () => {
		// The page says every tool here has shipped. That has to stay true as the
		// case files change, and a claim about the résumé is not one to let drift.
		const shipped = new Set(projects.flatMap((project) => project.stack));
		const invented = stack.flatMap((group) => group.items).filter((tool) => !shipped.has(tool));
		expect(invented).toEqual([]);
	});

	it('names each tool once', () => {
		const tools = stack.flatMap((group) => group.items);
		expect(new Set(tools).size).toBe(tools.length);
	});
});
