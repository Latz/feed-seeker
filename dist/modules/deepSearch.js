import { c as u, f as c } from "../checkFeed-CpnV4saY.js";
import { parseHTML as f } from "linkedom";
import d from "tldts";
import { E as p } from "../eventEmitter-DCCreSTG.js";
import { queue as g } from "async";
function x(o) {
  return [
    ".zip",
    ".rar",
    ".7z",
    ".tar.gz",
    ".tar.bz2",
    ".tar.xz",
    ".tar",
    ".gz",
    ".bz2",
    ".xz",
    ".tgz",
    ".epub",
    ".mobi",
    ".azw",
    ".pdf",
    ".doc",
    ".docx",
    ".xls",
    ".xlsx",
    ".ppt",
    ".pptx",
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".bmp",
    ".tiff",
    ".svg",
    ".mp3",
    ".mp4",
    ".avi",
    ".mov",
    ".wmv",
    ".mpg",
    ".mpeg",
    ".flv",
    ".mkv",
    ".webm",
    ".ogg",
    ".ogv",
    ".ogx"
  ].some((t) => o.endsWith(t));
}
class k extends p {
  constructor(e, t = 3, r = 5, s = 1e3, i = !1, a = 5, h = 0, n = null) {
    super();
    const l = new URL(e);
    this.startUrl = l.href, this.maxDepth = t, this.concurrency = r, this.maxLinks = s, this.mainDomain = d.getDomain(this.startUrl), this.checkForeignFeeds = i, this.maxErrors = a, this.maxFeeds = h, this.errorCount = 0, this.instance = n, this.queue = g(this.crawlPage.bind(this), this.concurrency), this.visitedUrls = /* @__PURE__ */ new Set(), this.timeout = 5e3, this.maxLinksReachedMessageEmitted = !1, this.feeds = [], this.queue.error((m) => {
      this.errorCount < this.maxErrors && (this.errorCount++, this.emit("error", {
        module: "deepSearch",
        error: `Async error: ${m}`,
        explanation: "An error occurred in the async queue while processing a crawling task. This could be due to network issues, invalid URLs, or server problems.",
        suggestion: "Check network connectivity and ensure the target website is accessible. The crawler will continue with other URLs."
      }), this.errorCount >= this.maxErrors && (this.queue.kill(), this.emit("log", {
        module: "deepSearch",
        message: `Stopped due to ${this.errorCount} errors (max ${this.maxErrors} allowed).`
      })));
    });
  }
  /**
   * Starts the crawling process
   * @returns {Feed[]} Array of found feeds
   */
  start() {
    return this.queue.push({ url: this.startUrl, depth: 0 }), this.emit("start", { module: "deepSearch", niceName: "Deep search" }), this.queue.drain(() => {
      this.emit("end", { module: "deepSearch", feeds: this.feeds, visitedUrls: this.visitedUrls.size });
    }), this.feeds;
  }
  /**
   * Checks if a URL is valid (same domain, not excluded file type)
   * @param {string} url - The URL to validate
   * @returns {boolean} True if the URL is valid, false otherwise
   */
  isValidUrl(e) {
    try {
      const t = d.getDomain(e) === d.getDomain(this.startUrl), r = !x(e);
      return t && r;
    } catch {
      return this.errorCount < this.maxErrors && (this.errorCount++, this.emit("error", {
        module: "deepSearch",
        error: `Invalid URL: ${e}`,
        explanation: "A URL encountered during crawling could not be parsed or validated. This may be due to malformed URL syntax or unsupported URL schemes.",
        suggestion: "This is usually caused by broken links on the website. The crawler will skip this URL and continue with others."
      }), this.errorCount >= this.maxErrors && (this.queue.kill(), this.emit("log", {
        module: "deepSearch",
        message: `Stopped due to ${this.errorCount} errors (max ${this.maxErrors} allowed).`
      }))), !1;
    }
  }
  /**
   * Handles pre-crawl checks and validations for a given URL.
   * @param {string} url - The URL to check.
   * @param {number} depth - The current crawl depth.
   * @returns {boolean} True if the crawl should continue, false otherwise.
   * @private
   */
  shouldCrawl(e, t) {
    return t > this.maxDepth || this.visitedUrls.has(e) ? !1 : this.visitedUrls.size >= this.maxLinks ? (this.maxLinksReachedMessageEmitted || (this.emit("log", {
      module: "deepSearch",
      message: `Max links limit of ${this.maxLinks} reached. Stopping deep search.`
    }), this.maxLinksReachedMessageEmitted = !0), !1) : this.isValidUrl(e);
  }
  /**
   * Handles fetch errors and increments the error counter.
   * @param {string} url - The URL that failed to fetch.
   * @param {number} depth - The crawl depth at which the error occurred.
   * @param {string} error - The error message.
   * @returns {boolean} True if the crawl should stop, false otherwise.
   * @private
   */
  handleFetchError(e, t, r) {
    return this.errorCount < this.maxErrors && (this.errorCount++, this.emit("log", { module: "deepSearch", url: e, depth: t, error: r }), this.errorCount >= this.maxErrors) ? (this.queue.kill(), this.emit("log", {
      module: "deepSearch",
      message: `Stopped due to ${this.errorCount} errors (max ${this.maxErrors} allowed).`
    }), !0) : !1;
  }
  /**
   * Processes a single link found on a page, checking if it's a feed.
   * @param {string} url - The absolute URL of the link to process.
   * @param {number} depth - The current crawl depth.
   * @returns {Promise<boolean>} True if the crawl should stop, false otherwise.
   * @private
   */
  async processLink(e, t) {
    if (this.visitedUrls.has(e)) return !1;
    if (this.visitedUrls.size >= this.maxLinks)
      return this.maxLinksReachedMessageEmitted || (this.emit("log", {
        module: "deepSearch",
        message: `Max links limit of ${this.maxLinks} reached. Stopping deep search.`
      }), this.maxLinksReachedMessageEmitted = !0), !0;
    if (!(this.isValidUrl(e) || this.checkForeignFeeds)) return !1;
    try {
      const s = await u(e, "", this.instance || void 0);
      if (s && !this.feeds.some((i) => i.url === e)) {
        if (this.feeds.push({ url: e, type: s.type, title: s.title, feedTitle: s.title }), this.emit("log", {
          module: "deepSearch",
          url: e,
          depth: t + 1,
          feedCheck: { isFeed: !0, type: s.type }
        }), this.maxFeeds > 0 && this.feeds.length >= this.maxFeeds)
          return this.queue.kill(), this.emit("log", {
            module: "deepSearch",
            message: `Stopped due to reaching maximum feeds limit: ${this.feeds.length} feeds found (max ${this.maxFeeds} allowed).`
          }), !0;
      } else s || this.emit("log", { module: "deepSearch", url: e, depth: t + 1, feedCheck: { isFeed: !1 } });
    } catch (s) {
      const i = s instanceof Error ? s : new Error(String(s));
      return this.handleFetchError(e, t + 1, `Error checking feed: ${i.message}`);
    }
    return t + 1 <= this.maxDepth && this.isValidUrl(e) && this.queue.push({ url: e, depth: t + 1 }), !1;
  }
  /**
   * Crawls a single page, extracting links and checking for feeds
   * @param {CrawlTask} task - The task object containing the URL and depth
   * @returns {Promise<void>} A promise that resolves when the page has been crawled
   */
  async crawlPage(e) {
    let { url: t, depth: r } = e;
    if (!this.shouldCrawl(t, r)) return;
    this.visitedUrls.add(t);
    const s = await c(t, this.timeout);
    if (!s) {
      this.handleFetchError(t, r, "Failed to fetch URL - timeout or network error");
      return;
    }
    if (!s.ok) {
      this.handleFetchError(t, r, `HTTP ${s.status} ${s.statusText}`);
      return;
    }
    const i = await s.text(), { document: a } = f(i);
    for (const h of a.querySelectorAll("a")) {
      const n = new URL(h.href, this.startUrl).href;
      if (await this.processLink(n, r)) break;
    }
  }
}
async function F(o, e = {}, t = null) {
  const r = new k(
    o,
    e.depth || 3,
    5,
    e.maxLinks || 1e3,
    !!e.checkForeignFeeds,
    // Whether to check foreign domains for feeds
    e.maxErrors || 5,
    // Maximum number of errors before stopping
    e.maxFeeds || 0,
    // Maximum number of feeds before stopping (0 = no limit)
    t
    // Pass the FeedScout instance to the crawler
  );
  return r.timeout = (e.timeout || 5) * 1e3, t && t.emit && (r.on("start", (s) => t.emit("start", s)), r.on("log", (s) => t.emit("log", s)), r.on("error", (s) => t.emit("error", s)), r.on("end", (s) => t.emit("end", s))), r.start(), await new Promise((s) => {
    r.queue.drain(() => {
      s();
    });
  }), r.feeds;
}
export {
  F as default
};
