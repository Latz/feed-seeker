import { describe, it, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import { run } from '../feed-seeker-cli.js';
import FeedSeeker from '../feed-seeker.js';

describe('FeedSeeker CLI', () => {
	let mockFeedSeekerInstance;
	const mockFeeds = [{ url: 'https://example.com/feed.xml', type: 'rss' }];

	beforeEach(() => {
		// Mock the entire FeedSeeker class
		mockFeedSeekerInstance = {
			on: mock.fn(),
			metaLinks: mock.fn(async () => mockFeeds),
			checkAllAnchors: mock.fn(async () => []),
			blindSearch: mock.fn(async () => []),
			deepSearch: mock.fn(async () => []),
		};

		// When FeedSeeker is instantiated, return our mock instance
		mock.method(FeedSeeker.prototype, 'constructor', function () {
			// This replaces the original constructor.
			// We assign the mock methods to the new instance.
			Object.assign(this, mockFeedSeekerInstance);
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

		assert.strictEqual(mockFeedSeekerInstance.metaLinks.mock.callCount(), 1, 'metaLinks should be called');
		assert.strictEqual(
			mockFeedSeekerInstance.blindSearch.mock.callCount(),
			0,
			'blindSearch should not be called if metaLinks finds feeds'
		);
	});

	it('should call only metaLinks with --metasearch flag', async () => {
		const argv = ['node', 'feed-scout-cli.js', 'https://example.com', '--metasearch'];
		await assert.doesNotReject(run(argv));

		assert.strictEqual(mockFeedSeekerInstance.metaLinks.mock.callCount(), 1);
		assert.strictEqual(mockFeedSeekerInstance.checkAllAnchors.mock.callCount(), 0);
		assert.strictEqual(mockFeedSeekerInstance.blindSearch.mock.callCount(), 0);
		assert.strictEqual(mockFeedSeekerInstance.deepSearch.mock.callCount(), 0);
	});

	it('should call only blindSearch with --blindsearch flag', async () => {
		const argv = ['node', 'feed-scout-cli.js', 'https://example.com', '--blindsearch'];
		await assert.doesNotReject(run(argv));

		assert.strictEqual(mockFeedSeekerInstance.metaLinks.mock.callCount(), 0);
		assert.strictEqual(mockFeedSeekerInstance.checkAllAnchors.mock.callCount(), 0);
		assert.strictEqual(mockFeedSeekerInstance.blindSearch.mock.callCount(), 1);
		assert.strictEqual(mockFeedSeekerInstance.deepSearch.mock.callCount(), 0);
	});

	it('should call only deepSearch with --deepsearch-only flag', async () => {
		const argv = ['node', 'feed-scout-cli.js', 'https://example.com', '--deepsearch-only'];
		await assert.doesNotReject(run(argv));

		assert.strictEqual(mockFeedSeekerInstance.metaLinks.mock.callCount(), 0);
		assert.strictEqual(mockFeedSeekerInstance.checkAllAnchors.mock.callCount(), 0);
		assert.strictEqual(mockFeedSeekerInstance.blindSearch.mock.callCount(), 0);
		assert.strictEqual(mockFeedSeekerInstance.deepSearch.mock.callCount(), 1);
	});

	it('should call deepSearch if --deepsearch flag is used and no feeds are found initially', async () => {
		// Make initial searches return no feeds
		mockFeedSeekerInstance.metaLinks.mock.mockImplementation(async () => []);
		mockFeedSeekerInstance.checkAllAnchors.mock.mockImplementation(async () => []);
		mockFeedSeekerInstance.blindSearch.mock.mockImplementation(async () => []);

		const argv = ['node', 'feed-scout-cli.js', 'https://example.com', '--deepsearch'];
		await assert.doesNotReject(run(argv));

		assert.strictEqual(mockFeedSeekerInstance.metaLinks.mock.callCount(), 1);
		assert.strictEqual(mockFeedSeekerInstance.checkAllAnchors.mock.callCount(), 1);
		assert.strictEqual(mockFeedSeekerInstance.blindSearch.mock.callCount(), 1);
		assert.strictEqual(mockFeedSeekerInstance.deepSearch.mock.callCount(), 1);
	});
});
