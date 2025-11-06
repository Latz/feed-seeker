#!/usr/bin/env node
import { parseHTML as u } from "linkedom";
import { m, c as d, b as f, d as p } from "./deepSearch-CydTS8TB.js";
import { E as S } from "./eventEmitter-DCCreSTG.js";
import { f as y } from "./checkFeed-CpnV4saY.js";
class z extends S {
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
  constructor(t, i = {}) {
    super(), t.includes("://") || (t = `https://${t}`);
    const r = new URL(t);
    this.site = r.pathname === "/" ? r.origin : r.href, this.options = i, this.initPromise = null;
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
        const t = await y(this.site, (this.options.timeout || 5) * 1e3);
        if (!t.ok) {
          this.emit("error", {
            module: "FeedScout",
            error: `HTTP error while fetching ${this.site}: ${t.status} ${t.statusText}`
          }), this.content = "", this.document = { querySelectorAll: () => [] }, this.emit("initialized");
          return;
        }
        this.content = await t.text();
        const { document: i } = u(this.content);
        this.document = i, this.emit("initialized");
      } catch (t) {
        let i = `Failed to fetch ${this.site}`;
        t.name === "AbortError" ? i += ": Request timed out" : (i += `: ${t.message}`, t.cause && (i += ` (cause: ${t.cause.code || t.cause.message})`)), this.emit("error", {
          module: "FeedScout",
          error: i,
          cause: t.cause
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
    return await this.initialize(), m(this);
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
    return await this.initialize(), d(this);
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
    return await this.initialize(), f(this);
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
    return await this.initialize(), p(this.site, this.options, this);
  }
  /**
   * Starts a comprehensive feed search using multiple strategies
   * @returns {Promise<Array<Feed | BlindSearchFeed>>} A promise that resolves to an array of found feed objects
   */
  async startSearch() {
    const { deepsearchOnly: t, metasearch: i, blindsearch: r, anchorsonly: c, deepsearch: h, all: o, maxFeeds: s } = this.options;
    if (t)
      return this.deepSearch();
    if (i)
      return this.metaLinks();
    if (r)
      return this.blindSearch();
    if (c)
      return this.checkAllAnchors();
    let e = [];
    const l = [this.metaLinks, this.checkAllAnchors, this.blindSearch];
    for (const n of l) {
      const a = await n.call(this);
      if (a && a.length > 0 && (e = e.concat(a), !o && s && s > 0 && e.length >= s)) {
        e = e.slice(0, s);
        break;
      }
    }
    if (h && (!s || e.length < s)) {
      const n = await this.deepSearch();
      n && n.length > 0 && (e = e.concat(n), s && s > 0 && e.length > s && (e = e.slice(0, s)));
    }
    return this.emit("end", { module: "all", feeds: e }), e;
  }
}
export {
  z as default
};
