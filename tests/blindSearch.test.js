/* global AbortController */
import { describe, it, expect } from 'vitest';

// ─── Internal helpers replicated from modules/blindsearch.ts ──────────────────
// (Not exported — tested inline like deepSearch.test.js pattern)

const DEFAULT_SEARCH_MODE = 'standard';
const DEFAULT_CONCURRENCY = 3;
const DEFAULT_REQUEST_DELAY = 0;
const MIN_CONCURRENCY = 1;
const MAX_CONCURRENCY = 10;
const MAX_REQUEST_DELAY = 60000;
const MAX_URL_LENGTH = 2083;
const MAX_GENERATED_URLS = 10000;

function validateSearchMode(mode) {
	if (!mode) return DEFAULT_SEARCH_MODE;
	const validModes = ['fast', 'standard', 'exhaustive', 'full'];
	if (!validModes.includes(mode)) return DEFAULT_SEARCH_MODE;
	return mode;
}

function validateConcurrency(concurrency) {
	if (concurrency === undefined || concurrency === null) return DEFAULT_CONCURRENCY;
	if (!Number.isFinite(concurrency) || concurrency < MIN_CONCURRENCY) return MIN_CONCURRENCY;
	if (concurrency > MAX_CONCURRENCY) return MAX_CONCURRENCY;
	return Math.floor(concurrency);
}

function validateRequestDelay(delay) {
	if (delay === undefined || delay === null) return DEFAULT_REQUEST_DELAY;
	if (!Number.isFinite(delay) || delay < 0) return DEFAULT_REQUEST_DELAY;
	if (delay > MAX_REQUEST_DELAY) return MAX_REQUEST_DELAY;
	return Math.floor(delay);
}

function isValidUrlLength(url) {
	return url.length <= MAX_URL_LENGTH;
}

// Partial replication of generateEndpointUrls for structural testing
function generateEndpointUrls(siteUrl, keepQueryParams, endpoints) {
	let urlObj;
	try {
		urlObj = new URL(siteUrl);
	} catch {
		throw new Error(`Invalid URL provided to blindSearch: ${siteUrl}`);
	}
	if (!isValidUrlLength(siteUrl)) {
		throw new Error(`URL too long`);
	}
	if (!['http:', 'https:'].includes(urlObj.protocol)) {
		throw new Error(`Invalid protocol "${urlObj.protocol}"`);
	}

	const origin = urlObj.origin;
	let path = siteUrl;
	const endpointUrls = [];
	let queryParams = '';
	if (keepQueryParams) queryParams = urlObj.search;

	while (path.length >= origin.length) {
		const basePath = path.endsWith('/') ? path.slice(0, -1) : path;
		for (const endpoint of endpoints) {
			if (endpointUrls.length >= MAX_GENERATED_URLS) return endpointUrls;
			const urlWithParams = queryParams
				? `${basePath}/${endpoint}${queryParams}`
				: `${basePath}/${endpoint}`;
			if (isValidUrlLength(urlWithParams)) endpointUrls.push(urlWithParams);
		}
		path = path.slice(0, path.lastIndexOf('/'));
	}
	return endpointUrls;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('blindsearch internal functions', () => {
	describe('validateSearchMode()', () => {
		it('returns "standard" for undefined', () => {
			expect(validateSearchMode(undefined)).toBe('standard');
		});

		it('returns "standard" for null', () => {
			expect(validateSearchMode(null)).toBe('standard');
		});

		it('returns "standard" for empty string', () => {
			expect(validateSearchMode('')).toBe('standard');
		});

		it('accepts "fast"', () => {
			expect(validateSearchMode('fast')).toBe('fast');
		});

		it('accepts "standard"', () => {
			expect(validateSearchMode('standard')).toBe('standard');
		});

		it('accepts "exhaustive"', () => {
			expect(validateSearchMode('exhaustive')).toBe('exhaustive');
		});

		it('accepts "full"', () => {
			expect(validateSearchMode('full')).toBe('full');
		});

		it('falls back to "standard" for unknown mode', () => {
			expect(validateSearchMode('turbo')).toBe('standard');
			expect(validateSearchMode('FAST')).toBe('standard'); // case-sensitive
		});
	});

	describe('validateConcurrency()', () => {
		it('returns default (3) for undefined', () => {
			expect(validateConcurrency(undefined)).toBe(3);
		});

		it('returns default (3) for null', () => {
			expect(validateConcurrency(null)).toBe(3);
		});

		it('returns the value for valid input', () => {
			expect(validateConcurrency(5)).toBe(5);
		});

		it('clamps to MIN_CONCURRENCY (1) for 0', () => {
			expect(validateConcurrency(0)).toBe(1);
		});

		it('clamps to MIN_CONCURRENCY for negative values', () => {
			expect(validateConcurrency(-5)).toBe(1);
		});

		it('clamps to MAX_CONCURRENCY (10) for values above 10', () => {
			expect(validateConcurrency(100)).toBe(10);
		});

		it('floors decimal values', () => {
			expect(validateConcurrency(3.9)).toBe(3);
		});

		it('clamps to MIN for NaN', () => {
			expect(validateConcurrency(NaN)).toBe(1);
		});

		it('clamps to MIN for Infinity (not finite)', () => {
			expect(validateConcurrency(Infinity)).toBe(1); // not finite → MIN
		});
	});

	describe('validateRequestDelay()', () => {
		it('returns default (0) for undefined', () => {
			expect(validateRequestDelay(undefined)).toBe(0);
		});

		it('returns default (0) for null', () => {
			expect(validateRequestDelay(null)).toBe(0);
		});

		it('returns the value for valid positive delay', () => {
			expect(validateRequestDelay(500)).toBe(500);
		});

		it('returns 0 for delay of 0', () => {
			expect(validateRequestDelay(0)).toBe(0);
		});

		it('returns default for negative values', () => {
			expect(validateRequestDelay(-100)).toBe(0);
		});

		it('clamps to MAX_REQUEST_DELAY (60000) for excessive values', () => {
			expect(validateRequestDelay(999999)).toBe(60000);
		});

		it('floors decimal delay values', () => {
			expect(validateRequestDelay(250.9)).toBe(250);
		});

		it('returns default for NaN', () => {
			expect(validateRequestDelay(NaN)).toBe(0);
		});
	});

	describe('generateEndpointUrls()', () => {
		const endpoints = ['feed', 'rss.xml'];

		it('generates URLs at each path level', () => {
			const urls = generateEndpointUrls('https://example.com/blog/posts', false, endpoints);
			expect(urls).toContain('https://example.com/blog/posts/feed');
			expect(urls).toContain('https://example.com/blog/feed');
			expect(urls).toContain('https://example.com/feed');
		});

		it('generates URLs from a root URL (origin only)', () => {
			const urls = generateEndpointUrls('https://example.com', false, endpoints);
			expect(urls).toContain('https://example.com/feed');
			expect(urls).toContain('https://example.com/rss.xml');
		});

		it('does not go above origin', () => {
			const urls = generateEndpointUrls('https://example.com', false, endpoints);
			// No URL should have a path above origin
			expect(urls.every((u) => u.startsWith('https://example.com/'))).toBe(true);
		});

		it('appends query params when keepQueryParams is true', () => {
			const urls = generateEndpointUrls('https://example.com?cat=tech', true, endpoints);
			expect(urls.some((u) => u.includes('?cat=tech'))).toBe(true);
		});

		it('appends no extra query string when keepQueryParams is false', () => {
			// Without keepQueryParams, the generated URLs have no ? suffix appended
			const urls = generateEndpointUrls('https://example.com/blog', false, endpoints);
			expect(urls.every((u) => !u.includes('?'))).toBe(true);
		});

		it('throws for an invalid URL', () => {
			expect(() => generateEndpointUrls('not-a-url', false, endpoints)).toThrow(
				'Invalid URL provided to blindSearch'
			);
		});

		it('throws for a non-HTTP protocol', () => {
			expect(() => generateEndpointUrls('ftp://example.com', false, endpoints)).toThrow(
				'Invalid protocol'
			);
		});

		it('throws for a URL that exceeds MAX_URL_LENGTH', () => {
			const longUrl = 'https://example.com/' + 'a'.repeat(2083);
			expect(() => generateEndpointUrls(longUrl, false, endpoints)).toThrow('URL too long');
		});

		it('handles trailing slash by stripping it before appending endpoint', () => {
			const urls = generateEndpointUrls('https://example.com/blog/', false, endpoints);
			// Trailing slash is stripped: basePath = 'https://example.com/blog' → 'https://example.com/blog/feed'
			expect(urls).toContain('https://example.com/blog/feed');
			// Should NOT produce 'https://example.com/blog//feed'
			expect(urls.every((u) => !u.includes('//feed'))).toBe(true);
		});

		it('generates more URLs for deeper paths', () => {
			const shallow = generateEndpointUrls('https://example.com', false, endpoints);
			const deep = generateEndpointUrls('https://example.com/a/b/c', false, endpoints);
			expect(deep.length).toBeGreaterThan(shallow.length);
		});
	});
});

// ─── Lazy-load endpoint getter tests (via actual module import) ───────────────

describe('blindsearch module — endpoint getters', () => {
	// We test getEndpointsByMode indirectly via the exported blindSearch function
	// by observing the 'start' event's endpointUrls count.

	class MockInstance {
		constructor(site, options = {}) {
			this.site = site;
			this.options = options;
			this.events = {};
		}
		emit(event, data) {
			if (this.events[event]) this.events[event].forEach((cb) => cb(data));
		}
		on(event, cb) {
			if (!this.events[event]) this.events[event] = [];
			this.events[event].push(cb);
		}
	}

	it('fast mode generates fewer endpoint URLs than standard mode', async () => {
		const { default: blindSearch } = await import('../modules/blindsearch.ts');

		let fastCount = 0;
		let standardCount = 0;

		const fastInstance = new MockInstance('https://example.com', { searchMode: 'fast' });
		fastInstance.on('start', (d) => { fastCount = d.endpointUrls; });

		const standardInstance = new MockInstance('https://example.com', { searchMode: 'standard' });
		standardInstance.on('start', (d) => { standardCount = d.endpointUrls; });

		// Abort immediately so no real network requests are made
		const abortFast = new AbortController();
		abortFast.abort();
		await blindSearch(fastInstance, abortFast.signal).catch(() => {});

		const abortStandard = new AbortController();
		abortStandard.abort();
		await blindSearch(standardInstance, abortStandard.signal).catch(() => {});

		expect(fastCount).toBeGreaterThan(0);
		expect(standardCount).toBeGreaterThan(fastCount);
	});

	it('exhaustive mode generates more endpoint URLs than standard mode', async () => {
		const { default: blindSearch } = await import('../modules/blindsearch.ts');

		let standardCount = 0;
		let exhaustiveCount = 0;

		const standardInstance = new MockInstance('https://example.com', { searchMode: 'standard' });
		standardInstance.on('start', (d) => { standardCount = d.endpointUrls; });

		const exhaustiveInstance = new MockInstance('https://example.com', { searchMode: 'exhaustive' });
		exhaustiveInstance.on('start', (d) => { exhaustiveCount = d.endpointUrls; });

		const a1 = new AbortController(); a1.abort();
		await blindSearch(standardInstance, a1.signal).catch(() => {});

		const a2 = new AbortController(); a2.abort();
		await blindSearch(exhaustiveInstance, a2.signal).catch(() => {});

		expect(exhaustiveCount).toBeGreaterThan(standardCount);
	});
});
