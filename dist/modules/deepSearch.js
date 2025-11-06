import { c as f } from "../checkFeed-DT9wDtY8.js";
import { parseHTML as g } from "linkedom";
import c from "tldts";
import x from "./eventEmitter.js";
import { queue as k } from "async";
import w from "./fetchWithTimeout.js";
function U(h) {
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
  ].some((t) => h.endsWith(t));
}
class S extends x {
  constructor(r, t = 3, e = 5, s = 1e3, o = !1, l = 5, u = 0) {
    super();
    const n = new URL(r);
    this.startUrl = n.href, this.maxDepth = t, this.concurrency = e, this.maxLinks = s, this.mainDomain = c.getDomain(this.startUrl), this.checkForeignFeeds = o, this.maxErrors = l, this.maxFeeds = u, this.errorCount = 0, this.queue = k(this.crawlPage.bind(this), this.concurrency), this.visitedUrls = /* @__PURE__ */ new Set(), this.timeout = 5e3, this.maxLinksReachedMessageEmitted = !1, this.feeds = [], this.queue.error((m, i) => {
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
  // constructor
  /**
   * Starts the crawling process
   * @returns {Array} Array of found feeds
   */
  start() {
    return this.queue.push({ url: this.startUrl, depth: 0 }), this.emit("start", { module: "deepSearch", niceName: "Deep search" }), this.queue.drain(() => {
      this.emit("end", { module: "deepSearch", feeds: this.feeds, visitedUrls: this.visitedUrls.size });
    }), this.feeds;
  }
  // ----------------------------------------------------------------------------------
  // Check if url is
  // * valid
  // * from same domain
  // * not visited before
  /**
   * Checks if a URL is valid (same domain, not excluded file type)
   * @param {string} url - The URL to validate
   * @returns {boolean} True if the URL is valid, false otherwise
   */
  isValidUrl(r) {
    try {
      const t = c.getDomain(r) == c.getDomain(this.startUrl), e = !U(r);
      return t && e;
    } catch {
      return this.errorCount < this.maxErrors && (this.errorCount++, this.emit("error", {
        module: "deepSearch",
        error: `Invalid URL: ${r}`,
        explanation: "A URL encountered during crawling could not be parsed or validated. This may be due to malformed URL syntax or unsupported URL schemes.",
        suggestion: "This is usually caused by broken links on the website. The crawler will skip this URL and continue with others."
      }), this.errorCount >= this.maxErrors && (this.queue.kill(), this.emit("log", {
        module: "deepSearch",
        message: `Stopped due to ${this.errorCount} errors (max ${this.maxErrors} allowed).`
      }))), !1;
    }
  }
  // ----------------------------------------------------------------------------------
  /**
   * Crawls a single page, extracting links and checking for feeds
   * @param {object} task - The task object containing the URL and depth
   * @param {string} task.url - The URL to crawl
   * @param {number} task.depth - The current depth of crawling
   * @returns {Promise<void>} A promise that resolves when the page has been crawled
   */
  async crawlPage(r) {
    let { url: t, depth: e } = r;
    if (e > this.maxDepth || this.visitedUrls.has(t)) return;
    if (this.visitedUrls.size + this.queue.length() >= this.maxLinks) {
      this.maxLinksReachedMessageEmitted || (this.emit("log", {
        module: "deepSearch",
        message: `Max links limit of ${this.maxLinks} reached. Stopping deep search.`
      }), this.maxLinksReachedMessageEmitted = !0);
      return;
    }
    if (!this.isValidUrl(t)) return;
    this.visitedUrls.add(t);
    const o = await w(t, this.timeout);
    if (!o) {
      this.errorCount < this.maxErrors && (this.errorCount++, this.emit("log", {
        module: "deepSearch",
        url: t,
        depth: e,
        error: "Failed to fetch URL - timeout or network error"
      }), this.errorCount >= this.maxErrors && (this.queue.kill(), this.emit("log", {
        module: "deepSearch",
        message: `Stopped due to ${this.errorCount} errors (max ${this.maxErrors} allowed).`
      })));
      return;
    }
    if (!o.ok) {
      this.errorCount < this.maxErrors && (this.errorCount++, this.emit("log", {
        module: "deepSearch",
        url: t,
        depth: e,
        error: `HTTP ${o.status} ${o.statusText}`
      }), this.errorCount >= this.maxErrors && (this.queue.kill(), this.emit("log", {
        module: "deepSearch",
        message: `Stopped due to ${this.errorCount} errors (max ${this.maxErrors} allowed).`
      })));
      return;
    }
    const l = await o.text(), { document: u } = g(l);
    let n = u.querySelectorAll("a");
    for (let m of n) {
      let i = new URL(m.href, this.startUrl).href;
      if (this.visitedUrls.has(i)) continue;
      if (this.visitedUrls.size + this.queue.length() >= this.maxLinks) {
        this.maxLinksReachedMessageEmitted || (this.emit("log", {
          module: "deepSearch",
          message: `Max links limit of ${this.maxLinks} reached. Stopping deep search.`
        }), this.maxLinksReachedMessageEmitted = !0);
        break;
      }
      try {
        if (this.isValidUrl(i) || this.checkForeignFeeds) {
          const d = await f(i);
          if (d) {
            if (!this.feeds.some((p) => p.url === i) && (this.feeds.push({
              url: i,
              type: d.type,
              title: d.title
            }), this.emit("log", {
              module: "deepSearch",
              url: i,
              depth: e + 1,
              feedCheck: { isFeed: !0, type: d.type }
            }), this.maxFeeds > 0 && this.feeds.length >= this.maxFeeds)) {
              this.queue.kill(), this.emit("log", {
                module: "deepSearch",
                message: `Stopped due to reaching maximum feeds limit: ${this.feeds.length} feeds found (max ${this.maxFeeds} allowed).`
              });
              break;
            }
          } else
            this.emit("log", {
              module: "deepSearch",
              url: i,
              depth: e + 1,
              feedCheck: { isFeed: !1 }
            });
        } else
          continue;
      } catch (a) {
        if (this.errorCount < this.maxErrors) {
          if (this.errorCount++, this.emit("error", {
            module: "deepSearch",
            error: `Error checking feed ${i}: ${a.message}`,
            explanation: "An error occurred while trying to fetch and validate a potential feed URL discovered during deep crawling. This could be due to network timeouts, server errors, or invalid feed content.",
            suggestion: "Check if the URL is accessible and returns valid content. Network issues or server problems may cause this error. The crawler will continue with other URLs."
          }), this.emit("log", {
            module: "deepSearch",
            url: i,
            depth: e + 1,
            error: `Error checking feed: ${a.message}`
          }), this.errorCount >= this.maxErrors) {
            this.queue.kill(), this.emit("log", {
              module: "deepSearch",
              message: `Stopped due to ${this.errorCount} errors (max ${this.maxErrors} allowed).`
            });
            break;
          }
        } else
          break;
      }
      e + 1 <= this.maxDepth && this.isValidUrl(i) && this.visitedUrls.size + this.queue.length() < this.maxLinks && this.queue.push({ url: i, depth: e + 1 });
    }
  }
}
async function R(h, r = {}, t = null) {
  const e = new S(
    h,
    r.depth || 3,
    5,
    r.maxLinks || 1e3,
    !!r.checkForeignFeeds,
    // Whether to check foreign domains for feeds
    r.maxErrors || 5,
    // Maximum number of errors before stopping
    r.maxFeeds || 0
    // Maximum number of feeds before stopping (0 = no limit)
  );
  return e.timeout = (r.timeout || 5) * 1e3, t && (e.on("start", (s) => t.emit("start", s)), e.on("log", (s) => t.emit("log", s)), e.on("error", (s) => t.emit("error", s)), e.on("end", (s) => t.emit("end", s))), e.start(), await new Promise((s) => {
    e.queue.drain(() => {
      s();
    });
  }), e.feeds;
}
export {
  R as default
};
