#!/usr/bin/env node
import { parseHTML as e } from "linkedom";
import s from "./modules/metaLinks.js";
import r from "./modules/anchors.js";
import n from "./modules/blindsearch.js";
import o from "./modules/deepSearch.js";
import h from "./modules/eventEmitter.js";
import c from "./modules/fetchWithTimeout.js";
class y extends h {
  /**
   * Creates a new FeedScout instance
   * @param {string} site - The website URL to search for feeds (protocol optional, defaults to https://)
   * @param {object} [options={}] - Configuration options for the search
   * @param {number} [options.maxFeeds=0] - Maximum number of feeds to find (0 = no limit)
   * @param {number} [options.timeout=5] - Request timeout in seconds
   * @param {number} [options.depth=3] - Maximum crawling depth for deep search
   * @param {number} [options.maxLinks=1000] - Maximum links to process in deep search
   * @param {boolean} [options.all=false] - Whether to find all feeds or stop after finding one of each type
   * @param {boolean} [options.keepQueryParams=false] - Whether to preserve query parameters in URLs
   * @param {boolean} [options.checkForeignFeeds=false] - Whether to check feeds on foreign domains
   * @param {boolean} [options.showErrors=false] - Whether to emit error events
   * @throws {TypeError} When site parameter is not provided or invalid
   * @example
   * // Basic usage
   * const scout = new FeedScout('example.com');
   *
   * // With options
   * const scout = new FeedScout('https://blog.example.com', {
   *   maxFeeds: 5,
   *   timeout: 10,
   *   all: true
   * });
   */
  constructor(i, t = {}) {
    super(), i.includes("://") || (i = `https://${i}`), this.site = new URL(i).href, this.options = t, this.initPromise = null;
  }
  /**
   * Initializes the FeedScout instance by fetching the site content and parsing the HTML
   * This method is called automatically by other methods and caches the result
   * @returns {Promise<void>} A promise that resolves when the initialization is complete
   * @throws {Error} When the site cannot be fetched or parsed
   * @private
   * @example
   * await scout.initialize(); // Usually called automatically
   */
  async initialize() {
    return this.initPromise === null && (this.initPromise = (async () => {
      try {
        const i = await c(this.site);
        if (!i) {
          this.emit("error", `Failed to fetch ${this.site}`), this.content = "", this.document = { querySelectorAll: () => [] }, this.emit("initialized");
          return;
        }
        this.content = await i.text();
        const { document: t } = e(this.content);
        this.document = t, this.emit("initialized");
      } catch (i) {
        this.emit(`Error fetching ${this.site}:`, i), this.content = "", this.document = { querySelectorAll: () => [] }, this.emit("initialized");
      }
    })()), this.initPromise;
  }
  // initialize
  /**
   * Searches for feeds using meta links in the page (link tags in head)
   * This method looks for <link> elements with feed-related type attributes
   * @returns {Promise<Array<object>>} A promise that resolves to an array of found feed objects
   * @throws {Error} When initialization fails or network errors occur
   * @example
   * const feeds = await scout.metaLinks();
   * console.log(feeds); // [{ url: '...', title: '...', type: 'rss' }]
   */
  async metaLinks() {
    return await this.initialize(), s(this);
  }
  /**
   * Searches for feeds by checking all anchor links on the page
   * This method analyzes all <a> elements for potential feed URLs
   * @returns {Promise<Array<object>>} A promise that resolves to an array of found feed objects
   * @throws {Error} When initialization fails or network errors occur
   * @example
   * const feeds = await scout.checkAllAnchors();
   * console.log(feeds); // [{ url: '...', title: '...', type: 'atom' }]
   */
  async checkAllAnchors() {
    return await this.initialize(), r(this);
  }
  /**
   * Performs a blind search for common feed endpoints
   * This method tries common feed paths like /feed, /rss, /atom.xml, etc.
   * @returns {Promise<Array<object>>} A promise that resolves to an array of found feed objects
   * @throws {Error} When network errors occur during endpoint testing
   * @example
   * const feeds = await scout.blindSearch();
   * console.log(feeds); // [{ url: '...', feedType: 'rss', title: '...' }]
   */
  async blindSearch() {
    return await this.initialize(), n(this);
  }
  /**
   * Performs a deep search by crawling the website
   * This method recursively crawls pages to find feeds, respecting depth and link limits
   * @returns {Promise<Array<object>>} A promise that resolves to an array of found feed objects
   * @throws {Error} When network errors occur during crawling
   * @example
   * const feeds = await scout.deepSearch();
   * console.log(feeds); // [{ url: '...', type: 'json', title: '...' }]
   */
  async deepSearch() {
    return await this.initialize(), o(this.site, this.options, this);
  }
}
export {
  y as default
};
