import { describe, it, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import { run } from '../feed-scout-cli.js';
import FeedScout from '../feed-scout.js';

describe('FeedScout CLI', () => {
	let mockFeedScoutInstance;
	const mockFeeds = [{ url: 'https://example.com/feed.xml', type: 'rss' }];

	beforeEach(() => {
		// Mock the entire FeedScout class
		mockFeedScoutInstance = {
			on: mock.fn(),
			metaLinks: mock.fn(async () => mockFeeds),
			checkAllAnchors: mock.fn(async () => []),
			blindSearch: mock.fn(async () => []),
			deepSearch: mock.fn(async () => []),
		};

		// When FeedScout is instantiated, return our mock instance
		mock.method(FeedScout.prototype, 'constructor', function () {
			// This replaces the original constructor.
			// We assign the mock methods to the new instance.
			Object.assign(this, mockFeedScoutInstance);
			return this;
		});

		// Mock process.stdout.write to suppress output during tests
		mock.method(process.stdout, 'write', () => {});
		mock.method(console, 'log', () => {});
		mock.method(process, 'exit', () => {
			throw new Error('process.exit() was called');
		});
	});

	afterEach(() => {
		mock.reset();
	});

	it('should call metaLinks by default', async () => {
		const argv = ['node', 'feed-scout-cli.js', 'https://example.com'];
		await assert.doesNotReject(run(argv));

		assert.strictEqual(mockFeedScoutInstance.metaLinks.mock.callCount(), 1, 'metaLinks should be called');
		assert.strictEqual(
			mockFeedScoutInstance.blindSearch.mock.callCount(),
			0,
			'blindSearch should not be called if metaLinks finds feeds'
		);
	});

	it('should call only metaLinks with --metasearch flag', async () => {
		const argv = ['node', 'feed-scout-cli.js', 'https://example.com', '--metasearch'];
		await assert.doesNotReject(run(argv));

		assert.strictEqual(mockFeedScoutInstance.metaLinks.mock.callCount(), 1);
		assert.strictEqual(mockFeedScoutInstance.checkAllAnchors.mock.callCount(), 0);
		assert.strictEqual(mockFeedScoutInstance.blindSearch.mock.callCount(), 0);
		assert.strictEqual(mockFeedScoutInstance.deepSearch.mock.callCount(), 0);
	});

	it('should call only blindSearch with --blindsearch flag', async () => {
		const argv = ['node', 'feed-scout-cli.js', 'https://example.com', '--blindsearch'];
		await assert.doesNotReject(run(argv));

		assert.strictEqual(mockFeedScoutInstance.metaLinks.mock.callCount(), 0);
		assert.strictEqual(mockFeedScoutInstance.checkAllAnchors.mock.callCount(), 0);
		assert.strictEqual(mockFeedScoutInstance.blindSearch.mock.callCount(), 1);
		assert.strictEqual(mockFeedScoutInstance.deepSearch.mock.callCount(), 0);
	});

	it('should call only deepSearch with --deepsearch-only flag', async () => {
		const argv = ['node', 'feed-scout-cli.js', 'https://example.com', '--deepsearch-only'];
		await assert.doesNotReject(run(argv));

		assert.strictEqual(mockFeedScoutInstance.metaLinks.mock.callCount(), 0);
		assert.strictEqual(mockFeedScoutInstance.checkAllAnchors.mock.callCount(), 0);
		assert.strictEqual(mockFeedScoutInstance.blindSearch.mock.callCount(), 0);
		assert.strictEqual(mockFeedScoutInstance.deepSearch.mock.callCount(), 1);
	});

	it('should call deepSearch if --deepsearch flag is used and no feeds are found initially', async () => {
		// Make initial searches return no feeds
		mockFeedScoutInstance.metaLinks.mock.mockImplementation(async () => []);
		mockFeedScoutInstance.checkAllAnchors.mock.mockImplementation(async () => []);
		mockFeedScoutInstance.blindSearch.mock.mockImplementation(async () => []);

		const argv = ['node', 'feed-scout-cli.js', 'https://example.com', '--deepsearch'];
		await assert.doesNotReject(run(argv));

		assert.strictEqual(mockFeedScoutInstance.metaLinks.mock.callCount(), 1);
		assert.strictEqual(mockFeedScoutInstance.checkAllAnchors.mock.callCount(), 1);
		assert.strictEqual(mockFeedScoutInstance.blindSearch.mock.callCount(), 1);
		assert.strictEqual(mockFeedScoutInstance.deepSearch.mock.callCount(), 1);
	});
});
