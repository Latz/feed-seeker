import { describe, it, beforeEach, expect } from 'vitest';
import tldts from 'tldts';
import EventEmitter from '../modules/eventEmitter.ts';

// Replicate internal functions and classes from deepSearch.js for testing

function excludedFile(url) {
	const excludedExtensions = ['.zip', '.jpg', '.png', '.pdf', '.mp3', '.mp4'];
	return excludedExtensions.some(extension => url.endsWith(extension));
}

class MockCrawler extends EventEmitter {
	constructor(startUrl, maxDepth = 3, maxLinks = 1000, maxErrors = 5) {
		super();
		this.startUrl = new URL(startUrl).href;
		this.maxDepth = maxDepth;
		this.maxLinks = maxLinks;
		this.maxErrors = maxErrors;
		this.mainDomain = tldts.getDomain(this.startUrl);
		this.visitedUrls = new Set();
		this.errorCount = 0;
		this.maxLinksReachedMessageEmitted = false;
	}

	isValidUrl(url) {
		try {
			const sameDomain = tldts.getDomain(url) === this.mainDomain;
			const notExcludedFile = !excludedFile(url);
			return sameDomain && notExcludedFile;
		} catch (error) {
			return false;
		}
	}

	shouldCrawl(url, depth) {
		if (depth > this.maxDepth) return false;
		if (this.visitedUrls.has(url)) return false;

		if (this.visitedUrls.size >= this.maxLinks) {
			if (!this.maxLinksReachedMessageEmitted) {
				this.emit('log', {
					module: 'deepSearch',
					message: `Max links limit of ${this.maxLinks} reached. Stopping deep search.`,
				});
				this.maxLinksReachedMessageEmitted = true;
			}
			return false;
		}

		return this.isValidUrl(url);
	}

	handleFetchError(url, depth, error) {
		if (this.errorCount < this.maxErrors) {
			this.errorCount++;
			if (this.errorCount >= this.maxErrors) {
				return true; // Stop crawling
			}
		}
		return false; // Continue crawling
	}
}

describe('Deep Search Module', () => {
	let crawler;

	beforeEach(() => {
		crawler = new MockCrawler('https://example.com');
	});

	describe('excludedFile() helper', () => {
		it('should return true for excluded file extensions', () => {
			expect(excludedFile('https://example.com/archive.zip')).toBe(true);
			expect(excludedFile('https://example.com/image.jpg')).toBe(true);
			expect(excludedFile('https://example.com/document.pdf')).toBe(true);
		});

		it('should return false for allowed file extensions', () => {
			expect(excludedFile('https://example.com/page.html')).toBe(false);
			expect(excludedFile('https://example.com/feed.xml')).toBe(false);
			expect(excludedFile('https://example.com/')).toBe(false);
		});
	});

	describe('isValidUrl() method', () => {
		it('should return true for valid, same-domain URLs', () => {
			expect(crawler.isValidUrl('https://example.com/page')).toBe(true);
			expect(crawler.isValidUrl('https://sub.example.com/page')).toBe(true); // tldts matches registrable domain, subdomains are same domain
		});

		it('should return false for external domains', () => {
			expect(crawler.isValidUrl('https://other.com/page')).toBe(false);
		});

		it('should return false for excluded file types', () => {
			expect(crawler.isValidUrl('https://example.com/image.jpg')).toBe(false);
		});

		it('should return false for invalid URLs', () => {
			expect(crawler.isValidUrl('not-a-url')).toBe(false);
		});
	});

	describe('shouldCrawl() method', () => {
		it('should return false if max depth is exceeded', () => {
			crawler.maxDepth = 2;
			expect(crawler.shouldCrawl('https://example.com/page', 3)).toBe(false);
		});

		it('should return false if URL has been visited', () => {
			const url = 'https://example.com/page';
			crawler.visitedUrls.add(url);
			expect(crawler.shouldCrawl(url, 1)).toBe(false);
		});

		it('should return false if max links limit is reached', () => {
			crawler.maxLinks = 1;
			crawler.visitedUrls.add('https://example.com/another-page');
			expect(crawler.shouldCrawl('https://example.com/page', 1)).toBe(false);
		});

		it('should emit a log message when max links limit is reached', () => {
			let logEmitted = false;
			crawler.on('log', data => {
				if (data.message && data.message.includes('Max links limit')) {
					logEmitted = true;
				}
			});
			crawler.maxLinks = 0;
			const result = crawler.shouldCrawl('https://example.com/page');
			expect(result).toBe(false); // Should return false when maxLinks is 0
			expect(logEmitted).toBe(true);
		});

		it('should return true for a valid, unvisited URL within limits', () => {
			expect(crawler.shouldCrawl('https://example.com/page', 1)).toBe(true);
		});
	});

	describe('handleFetchError() method', () => {
		it('should increment error count on each call', () => {
			crawler.handleFetchError('url', 1, 'error');
			expect(crawler.errorCount).toBe(1);
			crawler.handleFetchError('url', 1, 'error');
			expect(crawler.errorCount).toBe(2);
		});

		it('should return true to stop crawling when maxErrors is reached', () => {
			crawler.maxErrors = 2;
			crawler.handleFetchError('url1', 1, 'error1'); // count = 1
			const shouldStop = crawler.handleFetchError('url2', 1, 'error2'); // count = 2
			expect(crawler.errorCount).toBe(2);
			expect(shouldStop).toBe(true);
		});

		it('should return false if maxErrors is not reached', () => {
			crawler.maxErrors = 3;
			crawler.handleFetchError('url1', 1, 'error1');
			const shouldStop = crawler.handleFetchError('url2', 1, 'error2');
			expect(shouldStop).toBe(false);
		});
	});
});
