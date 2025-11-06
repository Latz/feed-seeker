#!/usr/bin/env node
import { parseHTML as d } from "linkedom";
import { m as f, c as p, b as y, d as w } from "./deepSearch-CydTS8TB.js";
import { E as S } from "./eventEmitter-DCCreSTG.js";
import { f as g } from "./checkFeed-CpnV4saY.js";
class $ extends S {
  /**
   * Creates a new FeedScout instance
   * @param {string} site - The website URL to search for feeds (protocol optional, defaults to https://)
   * @param {FeedScoutOptions} [options={}] - Configuration options for the search
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
  constructor(e, s = {}) {
    if (super(), !e || typeof e != "string")
      throw new TypeError("site parameter must be a non-empty string");
    e.includes("://") || (e = `https://${e}`);
    let i;
    try {
      i = new URL(e);
    } catch {
      throw new TypeError(`Invalid URL: ${e}`);
    }
    this.site = i.pathname === "/" ? i.origin : i.href, this.options = {
      timeout: 5,
      // Default timeout of 5 seconds
      ...s
    }, this.initPromise = null;
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
        const e = await g(this.site, this.options.timeout * 1e3);
        if (!e.ok) {
          this.emit("error", {
            module: "FeedScout",
            error: `HTTP error while fetching ${this.site}: ${e.status} ${e.statusText}`
          }), this.content = "", this.document = { querySelectorAll: () => [] }, this.emit("initialized");
          return;
        }
        this.content = await e.text();
        const { document: s } = d(this.content);
        this.document = s, this.emit("initialized");
      } catch (e) {
        const s = e instanceof Error ? e : new Error(String(e));
        let i = `Failed to fetch ${this.site}`;
        if (s.name === "AbortError")
          i += ": Request timed out";
        else {
          i += `: ${s.message}`;
          const a = s.cause;
          a && (i += ` (cause: ${a.code || a.message})`);
        }
        this.emit("error", {
          module: "FeedScout",
          error: i,
          cause: s.cause
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
   * const feeds = await scout.metaLinks();
   * console.log(feeds); // [{ url: '...', title: '...', type: 'rss' }]
   */
  async metaLinks() {
    return await this.initialize(), f(this);
  }
  /**
   * Searches for feeds by checking all anchor links on the page
   * This method analyzes all <a> elements for potential feed URLs
   * @returns {Promise<Feed[]>} A promise that resolves to an array of found feed objects
   * @throws {Error} When initialization fails or network errors occur
   * @example
   * const feeds = await scout.checkAllAnchors();
   * console.log(feeds); // [{ url: '...', title: '...', type: 'atom' }]
   */
  async checkAllAnchors() {
    return await this.initialize(), p(this);
  }
  /**
   * Performs a blind search for common feed endpoints
   * This method tries common feed paths like /feed, /rss, /atom.xml, etc.
   * @returns {Promise<BlindSearchFeed[]>} A promise that resolves to an array of found feed objects
   * @throws {Error} When network errors occur during endpoint testing
   * @example
   * const feeds = await scout.blindSearch();
   * console.log(feeds); // [{ url: '...', feedType: 'rss', title: '...' }]
   */
  async blindSearch() {
    return await this.initialize(), y(this);
  }
  /**
   * Performs a deep search by crawling the website
   * This method recursively crawls pages to find feeds, respecting depth and link limits
   * @returns {Promise<Feed[]>} A promise that resolves to an array of found feed objects
   * @throws {Error} When network errors occur during crawling
   * @example
   * const feeds = await scout.deepSearch();
   * console.log(feeds); // [{ url: '...', type: 'json', title: '...' }]
   */
  async deepSearch() {
    return await this.initialize(), w(this.site, this.options, this);
  }
  /**
   * Starts a comprehensive feed search using multiple strategies
   * Automatically deduplicates feeds found by multiple strategies
   * @returns {Promise<Array<Feed | BlindSearchFeed>>} A promise that resolves to an array of unique found feed objects
   * @example
   * const scout = new FeedScout('https://example.com', { maxFeeds: 10 });
   * const feeds = await scout.startSearch();
   * console.log('All feeds:', feeds);
   */
  async startSearch() {
    const { deepsearchOnly: e, metasearch: s, blindsearch: i, anchorsonly: a, deepsearch: l, all: u, maxFeeds: t } = this.options;
    if (e)
      return this.deepSearch();
    if (s)
      return this.metaLinks();
    if (i)
      return this.blindSearch();
    if (a)
      return this.checkAllAnchors();
    const r = /* @__PURE__ */ new Map(), m = [this.metaLinks, this.checkAllAnchors, this.blindSearch];
    for (const c of m) {
      const n = await c.call(this);
      if (n && n.length > 0) {
        for (const h of n)
          r.has(h.url) || r.set(h.url, h);
        if (!u && t && t > 0 && r.size >= t)
          break;
      }
    }
    if (l && (!t || r.size < t)) {
      const c = await this.deepSearch();
      if (c && c.length > 0) {
        for (const n of c)
          if (r.has(n.url) || r.set(n.url, n), t && t > 0 && r.size >= t)
            break;
      }
    }
    let o = Array.from(r.values());
    return t && t > 0 && o.length > t && (o = o.slice(0, t)), this.emit("end", { module: "all", feeds: o }), o;
  }
}
export {
  $ as default
};
