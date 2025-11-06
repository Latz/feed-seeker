import { describe, it, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import blindSearch from '../modules/blindsearch.js';
import * as checkFeedModule from '../modules/checkFeed.js';

// Mock FeedScout instance for testing
class MockFeedScout {
	constructor(site, options = {}) {
		this.site = site;
		this.options = options;
		this.events = {};
	}

	emit(event, data) {
		if (this.events[event]) {
			this.events[event].forEach(callback => callback(data));
		}
	}

	on(event, callback) {
		if (!this.events[event]) {
			this.events[event] = [];
		}
		this.events[event].push(callback);
	}
}

describe('Blind Search Module', () => {
	let instance;

	beforeEach(() => {
		instance = new MockFeedScout('https://example.com/blog/posts');
		// Mock checkFeed to prevent network calls
		mock.method(checkFeedModule, 'default', async url => {
			if (url.includes('blog/feed')) {
				return { type: 'rss', title: 'Blog Feed' };
			}
			return null;
		});
	});

	afterEach(() => {
		mock.reset();
	});

	it('should find a feed using path traversal', async () => {
		const feeds = await blindSearch(instance);
		assert.strictEqual(feeds.length, 1);
		assert.strictEqual(feeds[0].title, 'Blog Feed');
	});

	it('should emit start and end events', async () => {
		let startEmitted = false;
		let endEmitted = false;
		instance.on('start', data => (startEmitted = data.module === 'blindsearch'));
		instance.on('end', data => (endEmitted = data.module === 'blindsearch'));

		await blindSearch(instance);

		assert.strictEqual(startEmitted, true, 'Start event should be emitted');
		assert.strictEqual(endEmitted, true, 'End event should be emitted');
	});
});
