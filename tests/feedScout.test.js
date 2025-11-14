import { describe, it, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import FeedScout from '../feed-scout.js';
import metaLinks from '../modules/metaLinks.js';
import checkAllAnchors from '../modules/anchors.js';
import blindSearch from '../modules/blindsearch.js';
import deepSearch from '../modules/deepSearch.js';

// Since we can't easily mock the imported modules, let's test the constructor and basic functionality
describe('FeedScout Main Class', () => {
	let fs;

	beforeEach(() => {
		fs = new FeedScout('https://example.com');
		// Mock the initialize method to prevent actual network calls
		mock.method(fs, 'initialize', async () => {
			fs.document = { querySelectorAll: () => [] }; // Provide a mock document
			return Promise.resolve();
		});
	});

	afterEach(() => {
		mock.reset();
	});

	describe('Constructor', () => {
		it('should create instance with proper site normalization', () => {
			const scout = new FeedScout('example.com');
			assert.strictEqual(scout.site, 'https://example.com');
		});

		it('should handle URLs with protocol correctly', () => {
			const scout = new FeedScout('https://example.com');
			assert.strictEqual(scout.site, 'https://example.com');
		});

		it('should store options correctly', () => {
			const options = { timeout: 10, maxFeeds: 5 };
			const scout = new FeedScout('https://example.com', options);
			assert.deepStrictEqual(scout.options, options);
		});

		it('should initialize with null initPromise', () => {
			const scout = new FeedScout('https://example.com');
			assert.strictEqual(scout.initPromise, null);
		});
	});

	describe('Method Availability', () => {
		it('should have all required search methods', () => {
			assert.strictEqual(typeof fs.initialize, 'function');
			assert.strictEqual(typeof fs.metaLinks, 'function');
			assert.strictEqual(typeof fs.checkAllAnchors, 'function');
			assert.strictEqual(typeof fs.blindSearch, 'function');
			assert.strictEqual(typeof fs.deepSearch, 'function');
		});
	});

	describe('Search Method Orchestration', () => {
		it('should call metaLinks module when metaLinks() is invoked', async () => {
			const metaLinksMock = mock.fn(metaLinks, async () => [{ type: 'rss' }]);
			const result = await fs.metaLinks();

			assert.strictEqual(metaLinksMock.mock.callCount(), 1);
			assert.deepStrictEqual(result, [{ type: 'rss' }]);
		});

		it('should call blindSearch module when blindSearch() is invoked', async () => {
			const blindSearchMock = mock.fn(blindSearch, async () => [{ type: 'json' }]);
			const result = await fs.blindSearch();

			assert.strictEqual(blindSearchMock.mock.callCount(), 1);
			assert.deepStrictEqual(result, [{ type: 'json' }]);
		});

		it('should call deepSearch module when deepSearch() is invoked', async () => {
			const deepSearchMock = mock.fn(deepSearch, async () => [{ type: 'rss' }]);
			const result = await fs.deepSearch();

			assert.strictEqual(deepSearchMock.mock.callCount(), 1);
			assert.deepStrictEqual(result, [{ type: 'rss' }]);
		});
	});

	describe('Event System Integration', () => {
		it('should extend EventEmitter functionality', () => {
			assert.ok(fs.on && fs.emit && typeof fs.on === 'function');
		});

		it('should emit "initialized" after initialize() is complete', async () => {
			let eventEmitted = false;
			fs.on('initialized', () => {
				eventEmitted = true;
			});

			await fs.initialize();
			assert.strictEqual(eventEmitted, true);
		});
	});

	describe('URL handling', () => {
		it('should normalize different URL formats', () => {
			const fs1 = new FeedScout('example.com');
			const fs2 = new FeedScout('http://example.com');
			const fs3 = new FeedScout('https://example.com/path');

			assert.strictEqual(fs1.site, 'https://example.com');
			assert.strictEqual(fs2.site, 'http://example.com');
			assert.strictEqual(fs3.site, 'https://example.com/path');
		});
	});
});
