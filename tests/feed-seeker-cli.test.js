import { describe, it, beforeEach, afterEach, expect, vi } from 'vitest';
import { run } from '../feed-seeker-cli.ts';
import FeedSeeker from '../feed-seeker.ts';

describe('FeedSeeker CLI', () => {
	let mockFeedSeekerInstance;
	const mockFeeds = [{ url: 'https://example.com/feed.xml', type: 'rss' }];

	beforeEach(() => {
		// Mock the entire FeedSeeker class
		mockFeedSeekerInstance = {
			on: vi.fn(),
			metaLinks: vi.fn(async () => mockFeeds),
			checkAllAnchors: vi.fn(async () => []),
			blindSearch: vi.fn(async () => []),
			deepSearch: vi.fn(async () => []),
		};

		// When FeedSeeker is instantiated, return our mock instance
		vi.spyOn(FeedSeeker.prototype, 'constructor').mockImplementation(function () {
			// This replaces the original constructor.
			// We assign the mock methods to the new instance.
			Object.assign(this, mockFeedSeekerInstance);
			return this;
		});

		// Mock process.stdout.write to suppress output during tests
		vi.spyOn(process.stdout, 'write').mockImplementation(() => {});
		vi.spyOn(console, 'log').mockImplementation(() => {});
		vi.spyOn(process, 'exit').mockImplementation(() => {
			throw new Error('process.exit() was called');
		});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('should call metaLinks by default', async () => {
		const argv = ['node', 'feed-scout-cli.js', 'https://example.com'];
		await expect(run(argv)).resolves.not.toThrow();

		expect(mockFeedSeekerInstance.metaLinks).toHaveBeenCalledTimes(1);
		expect(mockFeedSeekerInstance.blindSearch).toHaveBeenCalledTimes(0);
	});

	it('should call only metaLinks with --metasearch flag', async () => {
		const argv = ['node', 'feed-scout-cli.js', 'https://example.com', '--metasearch'];
		await expect(run(argv)).resolves.not.toThrow();

		expect(mockFeedSeekerInstance.metaLinks).toHaveBeenCalledTimes(1);
		expect(mockFeedSeekerInstance.checkAllAnchors).toHaveBeenCalledTimes(0);
		expect(mockFeedSeekerInstance.blindSearch).toHaveBeenCalledTimes(0);
		expect(mockFeedSeekerInstance.deepSearch).toHaveBeenCalledTimes(0);
	});

	it('should call only blindSearch with --blindsearch flag', async () => {
		const argv = ['node', 'feed-scout-cli.js', 'https://example.com', '--blindsearch'];
		await expect(run(argv)).resolves.not.toThrow();

		expect(mockFeedSeekerInstance.metaLinks).toHaveBeenCalledTimes(0);
		expect(mockFeedSeekerInstance.checkAllAnchors).toHaveBeenCalledTimes(0);
		expect(mockFeedSeekerInstance.blindSearch).toHaveBeenCalledTimes(1);
		expect(mockFeedSeekerInstance.deepSearch).toHaveBeenCalledTimes(0);
	});

	it('should call only deepSearch with --deepsearch-only flag', async () => {
		const argv = ['node', 'feed-scout-cli.js', 'https://example.com', '--deepsearch-only'];
		await expect(run(argv)).resolves.not.toThrow();

		expect(mockFeedSeekerInstance.metaLinks).toHaveBeenCalledTimes(0);
		expect(mockFeedSeekerInstance.checkAllAnchors).toHaveBeenCalledTimes(0);
		expect(mockFeedSeekerInstance.blindSearch).toHaveBeenCalledTimes(0);
		expect(mockFeedSeekerInstance.deepSearch).toHaveBeenCalledTimes(1);
	});

	it('should call deepSearch if --deepsearch flag is used and no feeds are found initially', async () => {
		// Make initial searches return no feeds
		mockFeedSeekerInstance.metaLinks.mockImplementation(async () => []);
		mockFeedSeekerInstance.checkAllAnchors.mockImplementation(async () => []);
		mockFeedSeekerInstance.blindSearch.mockImplementation(async () => []);

		const argv = ['node', 'feed-scout-cli.js', 'https://example.com', '--deepsearch'];
		await expect(run(argv)).resolves.not.toThrow();

		expect(mockFeedSeekerInstance.metaLinks).toHaveBeenCalledTimes(1);
		expect(mockFeedSeekerInstance.checkAllAnchors).toHaveBeenCalledTimes(1);
		expect(mockFeedSeekerInstance.blindSearch).toHaveBeenCalledTimes(1);
		expect(mockFeedSeekerInstance.deepSearch).toHaveBeenCalledTimes(1);
	});
});
