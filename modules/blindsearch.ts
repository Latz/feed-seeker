/**
 * Constants for blind search configuration
 */
const DEFAULT_MAX_FEEDS = 0; // 0 means no limit
const DEFAULT_REQUEST_DELAY = 0; // 0 means no delay (in milliseconds)
const DEFAULT_CONCURRENCY = 3; // Number of concurrent requests to make
const DEFAULT_SEARCH_MODE = 'standard'; // Default search thoroughness

/**
 * Essential feed endpoints - highest probability of success
 * These are the most common feed paths found across the web
 * Fast mode: checks only these endpoints (~25 patterns)
 */
const ESSENTIAL_ENDPOINTS: string[] = [
	// Most common standard paths (highest success rate)
	'feed',
	'rss',
	'atom',
	'feed.xml',
	'rss.xml',
	'atom.xml',
	'index.xml',
	'feeds',
	'.rss',
	'.atom',
	'.xml',

	// WordPress (extremely common CMS)
	'?feed=rss2',
	'?feed=atom',
	'feed/rss/',
	'feed/atom/',

	// Blog platforms
	'blog/feed',
	'blog/rss',

	// Common variations
	'feed.json',
	'rss.php',
	'feed.php',
	'news/rss',
	'latest/feed',

	// Query parameters
	'?format=rss',
	'?format=feed',
];

/**
 * Standard feed endpoints - commonly used patterns
 * Standard mode: checks essential + standard endpoints (~100 patterns)
 */
const STANDARD_ENDPOINTS: string[] = [
	// Extended standard paths
	'rssfeed.xml',
	'feed.rss',
	'feed.atom',
	'feeds/',
	'rss/',
	'index.rss',
	'index.atom',
	'rss/index.xml',
	'atom/index.xml',
	'syndication/',
	'rssfeed.rdf',
	'&_rss=1',

	// Blog platforms
	'blog/atom',
	'blog/feeds',
	'blog?format=rss',
	'blog-feed.xml',
	'weblog/atom',
	'weblog/rss',

	// WordPress extended
	'?format=feed',
	'feed/rdf/',
	'feed/rss2/',
	'wp-atom.php',
	'wp-feed.php',
	'wp-rdf.php',
	'wp-rss.php',
	'wp-rss2.php',
	'index.php?format=feed',

	// News and articles
	'articles/feed',
	'atom/news/',
	'latest.rss',
	'news.xml',
	'news/atom',
	'rss/articles/',
	'rss/latest/',
	'rss/news/',
	'rss/news/rss.xml',
	'rss/rss.php',

	// API style
	'api/feed',
	'api/rss',
	'api/atom',
	'api/rss.xml',
	'api/feed.xml',
	'api/v1/feed',
	'api/v2/feed',
	'v1/feed',
	'v2/feed',

	// CMS and frameworks
	'feed.aspx',
	'rss.aspx',
	'rss.cfm',
	'feed.jsp',
	'feed.pl',
	'feed.py',
	'feed.rb',
	'feed/atom',
	'feed/rdf',
	'feed/atom.rss',
	'feed/atom.xml',
	'feed/rss.xml',
	'feed/rss2',
	'posts.rss',

	// Static site generators
	'_site/feed.xml',
	'build/feed.xml',
	'dist/feed.xml',
	'out/feed.xml',

	// Query parameters
	'?atom=1',
	'?rss=1',
	'?feed=atom',
	'?feed=rss',
	'?format=atom',
	'?output=rss',
	'?output=atom',
	'?type=rss',
	'?type=atom',
	'?view=feed',
	'?view=rss',
];

/**
 * Comprehensive feed endpoints - exhaustive search
 * Exhaustive mode: checks all endpoints including niche and specialized patterns (~350+ patterns)
 */
const COMPREHENSIVE_ENDPOINTS: string[] = [
	// Custom and alternative paths
	'atomfeed',
	'jsonfeed',
	'newsfeed',
	'rssfeed',
	'feeds.json',
	'feeds.php',
	'feeds.xml',
	'.json',
	'.opml',
	'.rdf',
	'opml',
	'opml/',
	'rdf',
	'rdf/',

	// Additional modern formats
	'feed.cml',
	'feed.csv',
	'feed.txt',
	'feed.yaml',
	'feed.yml',

	// Complex query parameters
	'?download=atom',
	'?download=rss',
	'?export=atom',
	'?export=rss',
	'?syndicate=atom',
	'?syndicate=rss',

	// Specialized CMS paths
	'export/rss.xml',
	'extern.php?action=feed&type=atom',
	'external?type=rss2',
	'index.php?action=.xml;type=rss',
	'public/feed.xml',
	'spip.php?page=backend',
	'spip.php?page=backend-breve',
	'spip.php?page=backend-sites',
	'syndicate/rss.xml',
	'syndication.php',
	'xml',
	'sitenews',
	'api/mobile/feed',

	// E-commerce and product feeds
	'catalog.xml', // product catalogs
	'catalog/feed',
	'deals.xml', // deal/sale feeds
	'deals/feed',
	'inventory.rss', // inventory updates
	'inventory/feed',
	'products.rss', // product feeds
	'products/atom',
	'products/rss',
	'promotions/feed',
	'specials/feed',

	// Podcast and media feeds
	'audio/feed',
	'episodes.rss', // episodic content
	'episodes/feed',
	'gallery.rss', // image galleries
	'media/feed',
	'podcast.rss', // audio content
	'podcast/atom',
	'podcast/rss',
	'podcasts/feed',
	'shows/feed',
	'video/feed',
	'videos.rss', // video content

	// Social media and community feeds
	'comments/feed',
	'community/feed',
	'discussions/feed',
	'forum.rss', // forum posts
	'forum/atom',
	'forum/rss',
	'reviews/feed',

	// Event and calendar feeds
	'agenda/feed',
	'calendar/feed',
	'events.rss', // calendar events
	'events/feed',
	'schedule/feed',

	// Job and career feeds
	'careers/feed',
	'jobs.rss', // job listings
	'jobs/feed',
	'opportunities/feed',
	'vacancies/feed',

	// Content management systems
	'content/feed',
	'documents/feed',
	'pages/feed',
	'resources/feed',

	// Newsletter and email feeds
	'emails/feed',
	'mailinglist/feed',
	'newsletter/feed',
	'subscription/feed',

	// Category and tag feeds
	'category/*/feed',
	'tag/*/feed',
	'tags/feed',
	'topics/feed',

	// User and author feeds
	'author/*/feed',
	'profile/*/feed',
	'user/*/feed',

	// Time-based feeds
	'archive/feed',
	'daily/feed',
	'monthly/feed',
	'weekly/feed',
	'yearly/feed',

	// Specialized content feeds
	'announcements/feed',
	'changelog/feed',
	'press/feed',
	'updates/feed',
	'revisions/feed',

	// Mobile and app feeds
	'app/feed',
	'mobile/feed',

	// Regional and local feeds
	'international/feed',
	'local/feed',
	'national/feed',
	'regional/feed',

	// Industry specific feeds
	'education/feed',
	'entertainment/feed',
	'finance/feed',
	'health/feed',
	'industry/feed',
	'market/feed',
	'science/feed',
	'sector/feed',
	'sports/feed',
	'technology/feed',

	// Aggregation and compilation feeds
	'aggregate/feed',
	'all/feed',
	'combined/feed',
	'compilation/feed',
	'everything/feed',

	// International variations
	'actualites/feed',
	'nachrichten/feed',
	'nieuws/feed',
	'noticias/feed',
	'novosti/feed',

	// Headless CMS feeds
	'cms/feed',
	'contentful/feed',
	'sanity/feed',
	'strapi/feed',

	// Documentation feeds
	'docs/feed',
	'documentation/feed',
	'help/feed',
	'kb/feed',
	'support/feed',
	'wiki/feed',

	// Repository and code feeds
	'branches/feed',
	'commits/feed',
	'issues/feed',
	'pull-requests/feed',
	'releases/feed',
	'tags/feed',

	// Analytics and tracking feeds
	'analytics/feed',
	'metrics/feed',
	'reports/feed',
	'stats/feed',

	// Multi-language feeds
	'de/feed',
	'en/feed',
	'es/feed',
	'fr/feed',
	'it/feed',
	'ja/feed',
	'ko/feed',
	'pt/feed',
	'ru/feed',
	'zh/feed',

	// Specialized platforms
	'drupal/feed',
	'joomla/feed',
	'magento/feed',
	'opencart/feed',
	'prestashop/feed',
	'shopify/feed',
	'typo3/feed',
	'woocommerce/feed',

	// Social and community platforms
	'discourse/feed',
	'invision/feed',
	'phpbb/feed',
	'vbulletin/feed',
	'xenforo/feed',
];

/**
 * Gets the appropriate endpoint list based on search mode
 * @param {'fast' | 'standard' | 'exhaustive'} mode - The search thoroughness mode
 * @returns {string[]} The combined endpoint list for the given mode
 */
function getEndpointsByMode(mode: 'fast' | 'standard' | 'exhaustive'): string[] {
	switch (mode) {
		case 'fast':
			return ESSENTIAL_ENDPOINTS;
		case 'standard':
			return [...ESSENTIAL_ENDPOINTS, ...STANDARD_ENDPOINTS];
		case 'exhaustive':
			return [...ESSENTIAL_ENDPOINTS, ...STANDARD_ENDPOINTS, ...COMPREHENSIVE_ENDPOINTS];
		default:
			return [...ESSENTIAL_ENDPOINTS, ...STANDARD_ENDPOINTS];
	}
}

import checkFeed from './checkFeed.js';
import { type FeedSeekerInstance } from './checkFeed.js';
import { type MetaLinksInstance, type Feed } from './metaLinks.js';

/**
 * Interface for blind search feed results
 */
export interface BlindSearchFeed extends Feed {
	feedType: 'rss' | 'atom' | 'json';
}

/**
 * Generates all possible endpoint URLs by traversing up the URL path
 * Uses a "path traversal" algorithm that starts from the specific URL and works up to the domain root
 * @param {string} siteUrl - The base site URL
 * @param {boolean} keepQueryParams - Whether to keep query parameters
 * @param {string[]} endpoints - The list of feed endpoints to check
 * @returns {string[]} Array of potential feed URLs
 * @throws {Error} When siteUrl is invalid
 */
function generateEndpointUrls(siteUrl: string, keepQueryParams: boolean, endpoints: string[]): string[] {
	// Validate URL format
	let urlObj: URL;
	try {
		urlObj = new URL(siteUrl);
	} catch (error) {
		throw new Error(`Invalid URL provided to blindSearch: ${siteUrl}`);
	}

	const origin = urlObj.origin;
	let path = siteUrl;
	const endpointUrls: string[] = [];

	// Extract query parameters if the keepQueryParams option is enabled
	// This preserves original URL parameters like ?category=tech in feed URLs
	let queryParams = '';
	if (keepQueryParams) {
		queryParams = urlObj.search; // This includes the '?' character if there are query parameters
	}

	// Path traversal algorithm: Start from specific path, work up to domain root
	// Example: https://example.com/blog/posts → https://example.com/blog → https://example.com
	// This strategy tries more specific locations first, then falls back to general ones
	while (path.length >= origin.length) {
		// Normalize path by removing trailing slash to prevent double slashes in URLs
		// Example: "https://example.com/blog/" becomes "https://example.com/blog"
		const basePath = path.endsWith('/') ? path.slice(0, -1) : path;

		// Try each known feed endpoint at this path level
		endpoints.forEach(endpoint => {
			// Construct final URL: basePath + "/" + endpoint + queryParams (if any)
			// Example: "https://example.com/blog" + "/" + "feed" + "?category=tech"
			const urlWithParams = queryParams ? `${basePath}/${endpoint}${queryParams}` : `${basePath}/${endpoint}`;
			endpointUrls.push(urlWithParams);
		});

		// Move up one directory level by removing everything after the last "/"
		// Example: "https://example.com/blog/posts" → "https://example.com/blog"
		path = path.slice(0, path.lastIndexOf('/'));
	}

	return endpointUrls;
}

/**
 * Adds a found feed to the feeds array and updates the feed type flags
 * @param {object} feedResult - The result from checkFeed
 * @param {string} url - The URL of the found feed
 * @param {BlindSearchFeed[]} feeds - The array to add the feed to
 * @param {boolean} rssFound - Whether an RSS feed has already been found
 * @param {boolean} atomFound - Whether an Atom feed has already been found
 * @returns {{rssFound: boolean, atomFound: boolean}} Updated flags
 */
function addFeed(
	feedResult: { type: 'rss' | 'atom' | 'json'; title: string | null },
	url: string,
	feeds: BlindSearchFeed[],
	rssFound: boolean,
	atomFound: boolean
): { rssFound: boolean; atomFound: boolean } {
	if (feedResult.type === 'rss') {
		rssFound = true;
	} else if (feedResult.type === 'atom') {
		atomFound = true;
	}

	feeds.push({
		url,
		title: null, // No link element title in blind search (unlike metaLinks)
		type: feedResult.type,
		feedTitle: feedResult.title, // Actual feed title from parsing the feed
		feedType: feedResult.type, // Included for BlindSearchFeed interface compatibility
	});

	return { rssFound, atomFound };
}

/**
 * Determines if the search should continue based on options and found feeds
 * Implements early termination logic: stop when both RSS and Atom feeds are found (unless checking all)
 * @param {number} currentIndex - Current index in the URL array
 * @param {number} totalUrls - Total number of URLs to check
 * @param {boolean} rssFound - Whether an RSS feed has been found
 * @param {boolean} atomFound - Whether an Atom feed has already been found
 * @param {boolean} shouldCheckAll - Whether to check all URLs regardless of what's found
 * @returns {boolean} Whether to continue searching
 */
function shouldContinueSearch(
	currentIndex: number,
	totalUrls: number,
	rssFound: boolean,
	atomFound: boolean,
	shouldCheckAll: boolean
): boolean {
	// Stop if we've processed all URLs
	if (currentIndex >= totalUrls) {
		return false;
	}

	// Continue checking all URLs if shouldCheckAll is enabled
	if (shouldCheckAll) {
		return true;
	}

	// Otherwise, stop when both RSS and Atom feeds are found
	return !(rssFound && atomFound);
}

/**
 * Performs a "blind search" for RSS/Atom feeds by trying a list of common feed endpoint paths.
 * It traverses up the URL path from the instance's site URL to its origin,
 * appending various known feed endpoints at each level.
 *
 * @param {MetaLinksInstance} instance - The instance object containing site information and an event emitter.
 * @param {AbortSignal} [signal] - Optional AbortSignal to cancel the search operation
 * @returns {Promise<BlindSearchFeed[]>} A promise that resolves to an array of found feed objects.
 *   Each object contains the `url` of the feed, its `feedType` ('rss' or 'atom'), and its `title` if available.
 * @throws {Error} When the operation is aborted via AbortSignal
 */
export default async function blindSearch(instance: MetaLinksInstance, signal?: AbortSignal): Promise<BlindSearchFeed[]> {
	// Get search mode and endpoints (priority-based: fast -> standard -> exhaustive)
	const searchMode = instance.options?.searchMode ?? DEFAULT_SEARCH_MODE;
	const endpoints = getEndpointsByMode(searchMode as 'fast' | 'standard' | 'exhaustive');

	// Generate all possible endpoint URLs with prioritized endpoints
	const endpointUrls = generateEndpointUrls(instance.site, instance.options?.keepQueryParams || false, endpoints);

	// Emit the total count so the CLI can display it
	instance.emit('start', { module: 'blindsearch', niceName: 'Blind search', endpointUrls: endpointUrls.length });

	const shouldCheckAll = instance.options?.all || false;
	const maxFeeds = instance.options?.maxFeeds ?? DEFAULT_MAX_FEEDS; // Maximum number of feeds to find
	const concurrency = instance.options?.concurrency ?? DEFAULT_CONCURRENCY; // Number of concurrent requests

	// Process each URL to find feeds with concurrent batching
	const results = await processFeeds(endpointUrls, shouldCheckAll, maxFeeds, concurrency, instance, signal);

	instance.emit('end', { module: 'blindsearch', feeds: results.feeds });
	return results.feeds;
}

/**
 * Processes a list of URLs to find feeds with concurrent batching
 * @param {string[]} endpointUrls - Array of URLs to check for feeds
 * @param {boolean} shouldCheckAll - Whether to check all URLs regardless of what's found
 * @param {number} maxFeeds - Maximum number of feeds to find (0 = no limit)
 * @param {number} concurrency - Number of concurrent requests to make
 * @param {MetaLinksInstance} instance - The FeedSeeker instance
 * @param {AbortSignal} [signal] - Optional AbortSignal to cancel the operation
 * @returns {Promise<{feeds: BlindSearchFeed[], rssFound: boolean, atomFound: boolean}>} A promise that resolves to an object containing feeds, rssFound, and atomFound status
 * @throws {Error} When the operation is aborted
 */
async function processFeeds(
	endpointUrls: string[],
	shouldCheckAll: boolean,
	maxFeeds: number,
	concurrency: number,
	instance: MetaLinksInstance,
	signal?: AbortSignal
): Promise<{ feeds: BlindSearchFeed[]; rssFound: boolean; atomFound: boolean }> {
	const feeds: BlindSearchFeed[] = [];
	const foundUrls = new Set<string>();
	let rssFound = false;
	let atomFound = false;
	let i = 0;

	// Process URLs in concurrent batches
	while (shouldContinueSearch(i, endpointUrls.length, rssFound, atomFound, shouldCheckAll)) {
		// Check if the operation has been aborted
		if (signal?.aborted) {
			throw new Error('Blind search operation was aborted');
		}

		// Check if we've reached the maximum number of feeds
		if (maxFeeds > 0 && feeds.length >= maxFeeds) {
			await handleMaxFeedsReached(instance, feeds, maxFeeds);
			break;
		}

		// Create a batch of URLs to process concurrently
		const batchSize = Math.min(concurrency, endpointUrls.length - i);
		const batch = endpointUrls.slice(i, i + batchSize);

		// Process batch concurrently using Promise.allSettled (continue even if some fail)
		const batchResults = await Promise.allSettled(
			batch.map(url => processSingleFeedUrl(url, instance, foundUrls, feeds, rssFound, atomFound))
		);

		// Process results from the batch
		for (const result of batchResults) {
			if (result.status === 'fulfilled' && result.value.found) {
				rssFound = result.value.rssFound;
				atomFound = result.value.atomFound;

				// Check if we've reached the maximum number of feeds after finding one
				if (maxFeeds > 0 && feeds.length >= maxFeeds) {
					await handleMaxFeedsReached(instance, feeds, maxFeeds);
					i = endpointUrls.length; // Force loop to end
					break;
				}
			}
		}

		// Emit progress for the processed batch
		i += batchSize;
		const feedsFound = feeds.length;
		instance.emit('log', { module: 'blindsearch', totalEndpoints: endpointUrls.length, totalCount: i, feedsFound });

		// Rate limiting: Add delay between batches if configured
		const requestDelay = instance.options?.requestDelay ?? DEFAULT_REQUEST_DELAY;
		if (requestDelay > 0 && i < endpointUrls.length) {
			await new Promise(resolve => setTimeout(resolve, requestDelay));
		}
	}

	return { feeds, rssFound, atomFound };
}

/**
 * Processes a single feed URL
 * @param {string} url - The URL to process
 * @param {MetaLinksInstance} instance - The FeedSeeker instance
 * @param {Set<string>} foundUrls - Set of already checked URLs to prevent duplicate requests
 * @param {BlindSearchFeed[]} feeds - Array of found feeds
 * @param {boolean} rssFound - Whether an RSS feed has been found
 * @param {boolean} atomFound - Whether an Atom feed has been found
 * @returns {Promise<{found: boolean, rssFound: boolean, atomFound: boolean}>} A promise that resolves to an object containing found status and updated flags
 */
async function processSingleFeedUrl(
	url: string,
	instance: MetaLinksInstance,
	foundUrls: Set<string>,
	feeds: BlindSearchFeed[],
	rssFound: boolean,
	atomFound: boolean
): Promise<{ found: boolean; rssFound: boolean; atomFound: boolean }> {
	// Skip if this URL has already been checked (prevents duplicate requests)
	if (foundUrls.has(url)) {
		return { found: false, rssFound, atomFound };
	}

	// Mark URL as checked before making the request
	foundUrls.add(url);

	try {
		const feedResult = await checkFeed(url, '', instance);

		// Add feed if it was successfully validated
		if (feedResult) {
			// Add feed and update tracking flags
			const updatedFlags = addFeed(feedResult, url, feeds, rssFound, atomFound);
			rssFound = updatedFlags.rssFound;
			atomFound = updatedFlags.atomFound;

			return { found: true, rssFound, atomFound };
		}
	} catch (error: unknown) {
		const err = error instanceof Error ? error : new Error(String(error));
		await handleFeedError(instance, url, err);
	}

	return { found: false, rssFound, atomFound };
}

/**
 * Handles the case when maximum feeds limit is reached
 * @param {MetaLinksInstance} instance - The FeedSeeker instance
 * @param {BlindSearchFeed[]} feeds - Array of found feeds
 * @param {number} maxFeeds - Maximum number of feeds allowed
 * @returns {Promise<void>}
 */
async function handleMaxFeedsReached(
	instance: MetaLinksInstance,
	feeds: BlindSearchFeed[],
	maxFeeds: number
): Promise<void> {
	instance.emit('log', {
		module: 'blindsearch',
		message: `Stopped due to reaching maximum feeds limit: ${feeds.length} feeds found (max ${maxFeeds} allowed).`,
	});
}

/**
 * Handles errors that occur during feed checking
 * @param {MetaLinksInstance} instance - The FeedSeeker instance
 * @param {string} url - The URL that caused the error
 * @param {Error} error - The error that occurred
 * @returns {Promise<void>}
 */
async function handleFeedError(instance: MetaLinksInstance, url: string, error: Error): Promise<void> {
	// Only show errors if the undocumented --show-errors flag is set
	if (instance.options?.showErrors) {
		instance.emit('error', {
			module: 'blindsearch',
			error: `Error fetching ${url}: ${error.message}`,
			explanation:
				'An error occurred while trying to fetch a potential feed URL during blind search. This could be due to network timeouts, server errors, 404 not found, or invalid content.',
			suggestion:
				'This is normal during blind search as many URLs are tested. The search will continue with other potential feed endpoints.',
		});
	}
}
