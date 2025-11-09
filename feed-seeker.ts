#!/usr/bin/env node

/**
 * @fileoverview FeedSeeker - A comprehensive RSS, Atom, and JSON feed discovery tool
 *
 * This module provides the main FeedSeeker class for discovering feeds on websites
 * through multiple search strategies including meta links, anchor analysis,
 * blind search, and deep crawling.
 *
 * @module FeedSeeker
 * @version 1.0.0
 * @author latz
 * @since 1.0.0
 */

import { parseHTML } from 'linkedom';
import metaLinks, { type Feed, type MetaLinksInstance } from './modules/metaLinks.js';
import checkAllAnchors from './modules/anchors.js';
import blindSearch, { type BlindSearchFeed } from './modules/blindsearch.js';
import deepSearch, { type DeepSearchOptions } from './modules/deepSearch.js';
import EventEmitter from './modules/eventEmitter.js';
import fetchWithTimeout from './modules/fetchWithTimeout.js';

/**
 * FeedSeeker options interface
 */
export interface FeedSeekerOptions extends DeepSearchOptions {
	maxFeeds?: number;
	timeout?: number;
	all?: boolean;
	keepQueryParams?: boolean;
	showErrors?: boolean;
	followMetaRefresh?: boolean;
	deepsearchOnly?: boolean;
	metasearch?: boolean;
	blindsearch?: boolean;
	anchorsonly?: boolean;
	deepsearch?: boolean;
	searchMode?: string;
}

/**
 * Main FeedSeeker class for discovering RSS, Atom, and JSON feeds on websites
 *
 * @class FeedSeeker
 * @extends EventEmitter
 * @fires FeedSeeker#initialized - Emitted when the instance has finished initializing
 * @fires FeedSeeker#error - Emitted when an error occurs during initialization or search
 * @fires FeedSeeker#end - Emitted when a search completes with results
 * @example
 * const seeker = new FeedSeeker('https://example.com', { maxFeeds: 10 });
 * seeker.on('initialized', () => console.log('Initialization complete'));
 * seeker.on('error', (data) => console.error('Error:', data.error));
 * seeker.on('end', (data) => console.log('Found feeds:', data.feeds));
 *
 * const feeds = await seeker.metaLinks();
 * console.log('Meta link feeds:', feeds);
 */
export default class FeedSeeker extends EventEmitter implements MetaLinksInstance {
	site: string;
	options: FeedSeekerOptions;
	initPromise: Promise<void> | null;
	content?: string;
	document!: Document;
	private rawSite: string; // Store the raw input for validation during initialization

	/**
	 * Creates a new FeedSeeker instance
	 * @param {string} site - The website URL to search for feeds (protocol optional, defaults to https://)
	 * @param {FeedSeekerOptions} [options={}] - Configuration options for the search
	 * @example
	 * // Basic usage
	 * const seeker = new FeedSeeker('example.com');
	 * seeker.on('error', (error) => console.error(error));
	 *
	 * // With options
	 * const seeker = new FeedSeeker('https://blog.example.com', {
	 *   maxFeeds: 5,
	 *   timeout: 10,
	 *   all: true
	 * });
	 * seeker.on('error', (error) => console.error(error));
	 */
	constructor(site: string, options: FeedSeekerOptions = {}) {
		super();

		// Store the raw site for potential deferred error handling
		this.rawSite = site;

		// Normalize site URL (add https:// if no protocol, remove trailing slash)
		// This is done synchronously to maintain backward compatibility with tests
		// Any validation errors will be emitted during initialize()
		let normalizedSite = site;
		if (!normalizedSite.includes('://')) {
			normalizedSite = `https://${normalizedSite}`;
		}

		// Try to parse URL to normalize it, but don't throw errors here
		try {
			const urlObj = new URL(normalizedSite);
			// Normalize site link but remove trailing slash for root paths to prevent duplicate checks in path traversal
			// For example: https://example.com/ should become https://example.com to avoid checking endpoints twice
			this.site = urlObj.pathname === '/' ? urlObj.origin : urlObj.href;
		} catch {
			// If URL is invalid, store the normalized attempt
			// The actual error will be emitted during initialize()
			this.site = normalizedSite;
		}

		this.options = {
			timeout: 5, // Default timeout of 5 seconds
			...options
		};
		this.initPromise = null; // Store the initialization promise
	}

	/**
	 * Initializes the FeedSeeker instance by validating the URL and fetching the site content and parsing the HTML
	 * This method is called automatically by other methods and caches the result
	 * Emits 'error' events if validation or fetching fails
	 * @returns {Promise<void>} A promise that resolves when the initialization is complete
	 * @private
	 * @example
	 * await seeker.initialize(); // Usually called automatically
	 */
	async initialize(): Promise<void> {
		if (this.initPromise === null) {
			this.initPromise = (async () => {
				try {
					// Validate site parameter is not empty
					if (!this.rawSite || typeof this.rawSite !== 'string') {
						this.emit('error', {
							module: 'FeedSeeker',
							error: 'Site parameter must be a non-empty string',
						});
						this.content = '';
						this.document = { querySelectorAll: () => [] } as unknown as Document;
						this.emit('initialized');
						return;
					}

					// Validate URL format (site should already be normalized in constructor)
					try {
						// eslint-disable-next-line no-new
						new URL(this.site);
					} catch {
						this.emit('error', {
							module: 'FeedSeeker',
							error: `Invalid URL: ${this.site}`,
						});
						this.content = '';
						this.document = { querySelectorAll: () => [] } as unknown as Document;
						this.emit('initialized');
						return;
					}

					const response = await fetchWithTimeout(this.site, this.options.timeout! * 1000);

					if (!response.ok) {
						this.emit('error', {
							module: 'FeedSeeker',
							error: `HTTP error while fetching ${this.site}: ${response.status} ${response.statusText}`,
						});
						this.content = '';
						this.document = { querySelectorAll: () => [] } as unknown as Document;
						this.emit('initialized');
						return;
					}

					this.content = await response.text();
					const { document } = parseHTML(this.content);
					this.document = document;

					this.emit('initialized');
				} catch (error: unknown) {
					const err = error instanceof Error ? error : new Error(String(error));
					let errorMessage = `Failed to fetch ${this.site}`;
					if (err.name === 'AbortError') {
						errorMessage += ': Request timed out';
					} else {
						errorMessage += `: ${err.message}`;
						const cause = (err as Error & { cause?: { code?: string; message?: string } }).cause;
						if (cause) {
							errorMessage += ` (cause: ${cause.code || cause.message})`;
						}
					}

					this.emit('error', {
						module: 'FeedSeeker',
						error: errorMessage,
						cause: (err as Error & { cause?: unknown }).cause,
					});

					this.content = '';
					this.document = { querySelectorAll: () => [] } as unknown as Document;
					this.emit('initialized');
				}
			})();
		}

		return this.initPromise;
	}

	/**
	 * Searches for feeds using meta links in the page (link tags in head)
	 * This method looks for <link> elements with feed-related type attributes
	 * @returns {Promise<Feed[]>} A promise that resolves to an array of found feed objects
	 * @throws {Error} When initialization fails or network errors occur
	 * @example
	 * const feeds = await seeker.metaLinks();
	 * console.log(feeds); // [{ url: '...', title: '...', type: 'rss' }]
	 */
	async metaLinks(): Promise<Feed[]> {
		await this.initialize();
		return metaLinks(this);
	}

	/**
	 * Searches for feeds by checking all anchor links on the page
	 * This method analyzes all <a> elements for potential feed URLs
	 * @returns {Promise<Feed[]>} A promise that resolves to an array of found feed objects
	 * @throws {Error} When initialization fails or network errors occur
	 * @example
	 * const feeds = await seeker.checkAllAnchors();
	 * console.log(feeds); // [{ url: '...', title: '...', type: 'atom' }]
	 */
	async checkAllAnchors(): Promise<Feed[]> {
		await this.initialize();
		return checkAllAnchors(this);
	}

	/**
	 * Performs a blind search for common feed endpoints
	 * This method tries common feed paths like /feed, /rss, /atom.xml, etc.
	 * @returns {Promise<BlindSearchFeed[]>} A promise that resolves to an array of found feed objects
	 * @throws {Error} When network errors occur during endpoint testing
	 * @example
	 * const feeds = await seeker.blindSearch();
	 * console.log(feeds); // [{ url: '...', feedType: 'rss', title: '...' }]
	 */
	async blindSearch(): Promise<BlindSearchFeed[]> {
		await this.initialize();
		return blindSearch(this);
	}

	/**
	 * Performs a deep search by crawling the website
	 * This method recursively crawls pages to find feeds, respecting depth and link limits
	 * @returns {Promise<Feed[]>} A promise that resolves to an array of found feed objects
	 * @throws {Error} When network errors occur during crawling
	 * @example
	 * const feeds = await seeker.deepSearch();
	 * console.log(feeds); // [{ url: '...', type: 'json', title: '...' }]
	 */
	async deepSearch(): Promise<Feed[]> {
		await this.initialize();
		const crawler = deepSearch(this.site, this.options, this);
		return crawler;
	}

	/**
	 * Starts a comprehensive feed search using multiple strategies
	 * Automatically deduplicates feeds found by multiple strategies
	 * @returns {Promise<Array<Feed | BlindSearchFeed>>} A promise that resolves to an array of unique found feed objects
	 * @example
	 * const seeker = new FeedSeeker('https://example.com', { maxFeeds: 10 });
	 * const feeds = await seeker.startSearch();
	 * console.log('All feeds:', feeds);
	 */
	async startSearch(): Promise<Array<Feed | BlindSearchFeed>> {
		const { deepsearchOnly, metasearch, blindsearch, anchorsonly, deepsearch, all, maxFeeds } = this.options;

		// Handle single strategy modes
		if (deepsearchOnly) {
			return this.deepSearch();
		}

		if (metasearch) {
			return this.metaLinks();
		}

		if (blindsearch) {
			return this.blindSearch();
		}

		if (anchorsonly) {
			return this.checkAllAnchors();
		}

		// Use Map for deduplication by URL
		const feedMap = new Map<string, Feed | BlindSearchFeed>();
		const searchStrategies = [this.metaLinks, this.checkAllAnchors, this.blindSearch];

		for (const strategy of searchStrategies) {
			const feeds = await strategy.call(this);
			if (feeds && feeds.length > 0) {
				// Add feeds to map, deduplicating by URL
				for (const feed of feeds) {
					if (!feedMap.has(feed.url)) {
						feedMap.set(feed.url, feed);
					}
				}

				// Check if we've reached maxFeeds limit
				if (!all && maxFeeds && maxFeeds > 0 && feedMap.size >= maxFeeds) {
					break;
				}
			}
		}

		// Run deep search if enabled and we haven't reached the limit
		if (deepsearch && (!maxFeeds || feedMap.size < maxFeeds)) {
			const deepFeeds = await this.deepSearch();
			if (deepFeeds && deepFeeds.length > 0) {
				for (const feed of deepFeeds) {
					if (!feedMap.has(feed.url)) {
						feedMap.set(feed.url, feed);
					}
					// Stop if we've reached the limit
					if (maxFeeds && maxFeeds > 0 && feedMap.size >= maxFeeds) {
						break;
					}
				}
			}
		}

		// Convert map to array and apply maxFeeds limit
		let totalFeeds = Array.from(feedMap.values());
		if (maxFeeds && maxFeeds > 0 && totalFeeds.length > maxFeeds) {
			totalFeeds = totalFeeds.slice(0, maxFeeds);
		}

		this.emit('end', { module: 'all', feeds: totalFeeds });
		return totalFeeds;
	}
}
