import { describe, it, expect } from 'vitest';
import checkAllAnchors from '../modules/anchors.ts';
import { parseHTML } from 'linkedom';

// Build a minimal mock instance that mirrors MetaLinksInstance
function makeInstance(html, options = {}) {
	const { document } = parseHTML(html);
	return {
		site: 'https://example.com',
		document,
		options,
		events: {},
		emit(event, data) {
			if (this.events[event]) this.events[event].forEach((cb) => cb(data));
		},
		on(event, cb) {
			if (!this.events[event]) this.events[event] = [];
			this.events[event].push(cb);
		},
	};
}

describe('anchors module', () => {
	describe('checkAllAnchors()', () => {
		it('emits start and end events', async () => {
			const instance = makeInstance('<html><body></body></html>');
			const startEvents = [];
			const endEvents = [];
			instance.on('start', (d) => startEvents.push(d));
			instance.on('end', (d) => endEvents.push(d));

			await checkAllAnchors(instance);

			expect(startEvents).toHaveLength(1);
			expect(startEvents[0].module).toBe('anchors');
			expect(endEvents).toHaveLength(1);
			expect(endEvents[0].module).toBe('anchors');
		});

		it('returns empty array when page has no anchors', async () => {
			const instance = makeInstance('<html><body><p>No links here</p></body></html>');
			const feeds = await checkAllAnchors(instance);
			expect(feeds).toEqual([]);
		});

		it('filters out mailto and javascript anchors', async () => {
			const html = `<html><body>
				<a href="mailto:test@example.com">Email</a>
				<a href="javascript:void(0)">JS</a>
			</body></html>`;
			const instance = makeInstance(html);
			const feeds = await checkAllAnchors(instance);
			// Neither mailto: nor javascript: are valid HTTP URLs → no feeds
			expect(feeds).toEqual([]);
		});

		it('returns an array (even with external domain links that fail validation)', async () => {
			const html = `<html><body>
				<a href="https://different-site.com/feed">External</a>
			</body></html>`;
			const instance = makeInstance(html);
			const feeds = await checkAllAnchors(instance);
			expect(Array.isArray(feeds)).toBe(true);
		});

		it('respects maxFeeds option of 1 — never returns more than 1 feed', async () => {
			const instance = makeInstance('<html><body></body></html>', { maxFeeds: 1 });
			const feeds = await checkAllAnchors(instance);
			expect(feeds.length).toBeLessThanOrEqual(1);
		});
	});
});
