#!/usr/bin/env node
import { parseHTML as n } from "linkedom";
import { E as a, f as h, m as o, c, b as l, d } from "./deepSearch-CRIKRlVD.js";
class S extends a {
  // Store the raw input for validation during initialization
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
  constructor(t, i = {}) {
    super(), this.rawSite = t;
    let e = t;
    e.includes("://") || (e = `https://${e}`);
    try {
      const s = new URL(e);
      this.site = s.pathname === "/" ? s.origin : s.href;
    } catch {
      this.site = e;
    }
    this.options = {
      timeout: 5,
      // Default timeout of 5 seconds
      ...i
    }, this.initPromise = null;
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
  async initialize() {
    return this.initPromise === null && (this.initPromise = (async () => {
      try {
        if (!this.rawSite || typeof this.rawSite != "string") {
          this.emit("error", {
            module: "FeedSeeker",
            error: "Site parameter must be a non-empty string"
          }), this.content = "", this.document = { querySelectorAll: () => [] }, this.emit("initialized");
          return;
        }
        try {
          new URL(this.site);
        } catch {
          this.emit("error", {
            module: "FeedSeeker",
            error: `Invalid URL: ${this.site}`
          }), this.content = "", this.document = { querySelectorAll: () => [] }, this.emit("initialized");
          return;
        }
        const t = await h(this.site, this.options.timeout * 1e3);
        if (!t.ok) {
          this.emit("error", {
            module: "FeedSeeker",
            error: `HTTP error while fetching ${this.site}: ${t.status} ${t.statusText}`
          }), this.content = "", this.document = { querySelectorAll: () => [] }, this.emit("initialized");
          return;
        }
        this.content = await t.text();
        const { document: i } = n(this.content);
        this.document = i, this.emit("initialized");
      } catch (t) {
        const i = t instanceof Error ? t : new Error(String(t));
        let e = `Failed to fetch ${this.site}`;
        if (i.name === "AbortError")
          e += ": Request timed out";
        else {
          e += `: ${i.message}`;
          const s = i.cause;
          s && (e += ` (cause: ${s.code || s.message})`);
        }
        this.emit("error", {
          module: "FeedSeeker",
          error: e,
          cause: i.cause
        }), this.content = "", this.document = { querySelectorAll: () => [] }, this.emit("initialized");
      }
    })()), this.initPromise;
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
  async metaLinks() {
    return await this.initialize(), o(this);
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
  async checkAllAnchors() {
    return await this.initialize(), c(this);
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
  async blindSearch() {
    return await this.initialize(), l(this);
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
  async deepSearch() {
    return await this.initialize(), d(this.site, this.options, this);
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
  async startSearch() {
    const t = await this.handleSingleStrategyMode();
    if (t)
      return t;
    const i = /* @__PURE__ */ new Map();
    await this.collectFeedsFromStrategies(i), await this.handleDeepSearch(i);
    const e = this.getFeedsWithLimit(i);
    return this.emit("end", { module: "all", feeds: e }), e;
  }
  /**
   * Handles single strategy search modes (deepsearchOnly, metasearch, blindsearch, anchorsonly)
   * @returns {Promise<Array<Feed | BlindSearchFeed> | null>} Results if a single strategy mode is active, null otherwise
   * @private
   */
  async handleSingleStrategyMode() {
    const { deepsearchOnly: t, metasearch: i, blindsearch: e, anchorsonly: s } = this.options;
    return t ? this.deepSearch() : i ? this.metaLinks() : e ? this.blindSearch() : s ? this.checkAllAnchors() : null;
  }
  /**
   * Collects feeds from multiple search strategies
   * @param {Map<string, Feed | BlindSearchFeed>} feedMap - Map to store deduplicated feeds
   * @returns {Promise<void>}
   * @private
   */
  async collectFeedsFromStrategies(t) {
    const i = [this.metaLinks, this.checkAllAnchors, this.blindSearch];
    for (const e of i) {
      const s = await e.call(this);
      if (this.addFeedsToMap(t, s), this.hasReachedLimit(t))
        break;
    }
  }
  /**
   * Adds feeds to the feed map, deduplicating by URL
   * @param {Map<string, Feed | BlindSearchFeed>} feedMap - Map to store feeds
   * @param {Array<Feed | BlindSearchFeed>} feeds - Feeds to add
   * @returns {void}
   * @private
   */
  addFeedsToMap(t, i) {
    if (!(!i || i.length === 0))
      for (const e of i)
        t.has(e.url) || t.set(e.url, e);
  }
  /**
   * Checks if the feed limit has been reached
   * @param {Map<string, Feed | BlindSearchFeed>} feedMap - Current feed map
   * @returns {boolean} True if limit is reached, false otherwise
   * @private
   */
  hasReachedLimit(t) {
    const { all: i, maxFeeds: e } = this.options;
    return !i && e !== void 0 && e > 0 && t.size >= e;
  }
  /**
   * Handles deep search if enabled
   * @param {Map<string, Feed | BlindSearchFeed>} feedMap - Map to store feeds
   * @returns {Promise<void>}
   * @private
   */
  async handleDeepSearch(t) {
    const { deepsearch: i, maxFeeds: e } = this.options;
    if (!i || e && t.size >= e)
      return;
    const s = await this.deepSearch();
    if (!(!s || s.length === 0)) {
      for (const r of s)
        if (t.has(r.url) || t.set(r.url, r), this.hasReachedLimit(t))
          break;
    }
  }
  /**
   * Gets feeds from the map with limit applied
   * @param {Map<string, Feed | BlindSearchFeed>} feedMap - Map containing feeds
   * @returns {Array<Feed | BlindSearchFeed>} Feeds with limit applied
   * @private
   */
  getFeedsWithLimit(t) {
    const i = Array.from(t.values()), { maxFeeds: e } = this.options;
    return e !== void 0 && e > 0 && i.length > e ? i.slice(0, e) : i;
  }
}
export {
  S as default
};
