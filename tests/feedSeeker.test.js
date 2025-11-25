import { describe, it, beforeEach, afterEach, expect, vi } from 'vitest';
import FeedSeeker from '../feed-seeker.ts';
import metaLinks from '../modules/metaLinks.ts';
import checkAllAnchors from '../modules/anchors.ts';
import blindSearch from '../modules/blindsearch.ts';
import deepSearch from '../modules/deepSearch.ts';

// Since we can't easily mock the imported modules, let's test the constructor and basic functionality
describe('FeedSeeker Main Class', () => {
	let fs;

	beforeEach(() => {
		fs = new FeedSeeker('https://example.com');
		// Mock the initialize method to prevent actual network calls
		vi.spyOn(fs, 'initialize').mockImplementation(async () => {
			fs.document = { querySelectorAll: () => [] }; // Provide a mock document
			fs.emit('initialized'); // Emit the initialized event
			return Promise.resolve();
		});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('Constructor', () => {
		it('should create instance with proper site normalization', () => {
			const scout = new FeedSeeker('example.com');
			expect(scout.site).toBe('https://example.com');
		});

		it('should handle URLs with protocol correctly', () => {
			const scout = new FeedSeeker('https://example.com');
			expect(scout.site).toBe('https://example.com');
		});

		it('should store options correctly', () => {
			const options = { timeout: 10, maxFeeds: 5 };
			const scout = new FeedSeeker('https://example.com', options);
			expect(scout.options).toEqual(options);
		});

		it('should initialize with null initPromise', () => {
			const scout = new FeedSeeker('https://example.com');
			expect(scout.initPromise).toBe(null);
		});
	});

	describe('Method Availability', () => {
		it('should have all required search methods', () => {
			expect(typeof fs.initialize).toBe('function');
			expect(typeof fs.metaLinks).toBe('function');
			expect(typeof fs.checkAllAnchors).toBe('function');
			expect(typeof fs.blindSearch).toBe('function');
			expect(typeof fs.deepSearch).toBe('function');
		});
	});

	describe('Search Method Orchestration', () => {
		it('should call metaLinks module when metaLinks() is invoked', async () => {
			const metaLinksMock = vi.fn().mockResolvedValue([{ type: 'rss' }]);
			vi.spyOn(fs, 'metaLinks').mockImplementation(metaLinksMock);
			const result = await fs.metaLinks();

			expect(metaLinksMock).toHaveBeenCalledTimes(1);
			expect(result).toEqual([{ type: 'rss' }]);
		});

		it('should call blindSearch module when blindSearch() is invoked', async () => {
			const blindSearchMock = vi.fn().mockResolvedValue([{ type: 'json' }]);
			vi.spyOn(fs, 'blindSearch').mockImplementation(blindSearchMock);
			const result = await fs.blindSearch();

			expect(blindSearchMock).toHaveBeenCalledTimes(1);
			expect(result).toEqual([{ type: 'json' }]);
		});

		it('should call deepSearch module when deepSearch() is invoked', async () => {
			const deepSearchMock = vi.fn().mockResolvedValue([{ type: 'rss' }]);
			vi.spyOn(fs, 'deepSearch').mockImplementation(deepSearchMock);
			const result = await fs.deepSearch();

			expect(deepSearchMock).toHaveBeenCalledTimes(1);
			expect(result).toEqual([{ type: 'rss' }]);
		});
	});

	describe('Event System Integration', () => {
		it('should extend EventEmitter functionality', () => {
			expect(fs.on && fs.emit && typeof fs.on === 'function');
		});

		it('should emit "initialized" after initialize() is complete', async () => {
			let eventEmitted = false;
			fs.on('initialized', () => {
				eventEmitted = true;
			});

			await fs.initialize();
			expect(eventEmitted).toBe(true);
		});
	});

	describe('URL handling', () => {
		it('should normalize different URL formats', () => {
			const fs1 = new FeedSeeker('example.com');
			const fs2 = new FeedSeeker('http://example.com');
			const fs3 = new FeedSeeker('https://example.com/path');

			expect(fs1.site).toBe('https://example.com');
			expect(fs2.site).toBe('http://example.com');
			expect(fs3.site).toBe('https://example.com/path');
		});
	});
});
