import { c as h, f as y } from "./checkFeed-CpnV4saY.js";
import { parseHTML as k } from "linkedom";
import c from "tldts";
import { E as b } from "./eventEmitter-DCCreSTG.js";
import { queue as v } from "async";
function U(e) {
  return e && e.replace(/\s+/g, " ").trim();
}
async function u(e, t, s, o) {
  const r = t.options?.maxFeeds || 0;
  if (!e.href) return !1;
  const d = new URL(e.href, t.site).href;
  if (o.has(d)) return !1;
  t.emit("log", { module: "metalinks" });
  try {
    const i = await h(d, "", t);
    if (i && (s.push({
      url: d,
      title: U(e.title),
      type: i.type,
      feedTitle: i.title
    }), o.add(d), r > 0 && s.length >= r))
      return t.emit("log", {
        module: "metalinks",
        message: `Stopped due to reaching maximum feeds limit: ${s.length} feeds found (max ${r} allowed).`
      }), !0;
  } catch (i) {
    t.options?.showErrors && t.emit("error", {
      module: "metalinks",
      error: i.message,
      explanation: "An error occurred while trying to fetch and validate a feed URL found in a meta link tag. This could be due to network issues, server problems, or invalid feed content.",
      suggestion: "Check if the meta link URL is accessible and returns valid feed content. The search will continue with other meta links."
    });
  }
  return !1;
}
async function I(e) {
  e.emit("start", { module: "metalinks", niceName: "Meta links" });
  const t = [], s = /* @__PURE__ */ new Set(), r = ["feed+json", "rss+xml", "atom+xml", "xml", "rdf+xml"].map((i) => `link[type="application/${i}"]`).join(", ");
  for (const i of e.document.querySelectorAll(r))
    if (await u(i, e, t, s)) return t;
  const d = 'link[rel="alternate"][type*="rss"], link[rel="alternate"][type*="xml"], link[rel="alternate"][type*="atom"], link[rel="alternate"][type*="json"]';
  for (const i of e.document.querySelectorAll(d))
    if (await u(i, e, t, s)) return t;
  for (const i of e.document.querySelectorAll('link[rel="alternate"]')) {
    const a = ["/rss", "/feed", "/atom", ".rss", ".atom", ".xml", ".json"];
    if (i.href && a.some((l) => i.href.toLowerCase().includes(l)) && await u(i, e, t, s))
      return t;
  }
  return e.emit("end", { module: "metalinks", feeds: t }), t;
}
function m(e, t) {
  try {
    return new URL(e, t);
  } catch {
    return null;
  }
}
function L(e) {
  const t = m(e);
  return t ? t.protocol === "http:" || t.protocol === "https:" : !1;
}
function S(e) {
  return m(e) ? !1 : !e.includes("://");
}
function E(e, t) {
  const s = m(e);
  if (!s || s.hostname === t.hostname)
    return !0;
  const o = [
    // Google FeedBurner (most common feed hosting service)
    "feedburner.com",
    "feeds.feedburner.com",
    "feedproxy.google.com",
    "feeds2.feedburner.com"
  ];
  return o.includes(s.hostname) || o.some((r) => s.hostname.endsWith("." + r));
}
function R(e) {
  if (e.options.followMetaRefresh && e.document && typeof e.document.querySelector == "function") {
    const t = e.document.querySelector('meta[http-equiv="refresh"]')?.getAttribute("content");
    if (t) {
      const s = t.match(/url=(.*)/i);
      if (s && s[1]) {
        const o = new URL(s[1], e.site).href;
        return e.emit("log", {
          module: "anchors",
          message: `Following meta refresh redirect to ${o}`
        }), x({ ...e, site: o });
      }
    }
  }
  return null;
}
function g(e, t, s) {
  if (!e.href)
    return null;
  if (L(e.href))
    return e.href;
  if (S(e.href)) {
    const o = m(e.href, t);
    return o ? o.href : (s.emit("error", {
      module: "anchors",
      error: `Invalid relative URL: ${e.href}`,
      explanation: "A relative URL found in an anchor tag could not be resolved against the base URL. This may be due to malformed relative path syntax.",
      suggestion: 'Check the anchor href attribute for proper relative path format (e.g., "./feed.xml", "../rss.xml", or "/feed").'
    }), null);
  }
  return null;
}
async function F(e, t) {
  const { instance: s, baseUrl: o, feedUrls: r } = t, d = g(e, o, s);
  if (d)
    try {
      const i = await h(d, "", s);
      i && r.push({
        href: d,
        title: e.textContent?.trim() || null,
        type: i.type,
        feedTitle: i.title
      });
    } catch (i) {
      s.options?.showErrors && s.emit("error", {
        module: "anchors",
        error: `Error checking feed at ${d}: ${i.message}`,
        explanation: "An error occurred while trying to fetch and validate a potential feed URL found in an anchor tag. This could be due to network timeouts, server errors, or invalid feed content.",
        suggestion: "Check if the URL is accessible and returns valid feed content. Network connectivity issues or server problems may cause this error."
      });
    }
}
async function x(e) {
  await R(e);
  const t = new URL(e.site), s = e.document.querySelectorAll("a"), o = [];
  for (const a of s) {
    const n = g(a, t, e);
    n && E(n, t) && o.push(a);
  }
  const r = e.options?.maxFeeds || 0, d = {
    instance: e,
    baseUrl: t,
    feedUrls: []
  };
  let i = 1;
  for (const a of o) {
    if (r > 0 && d.feedUrls.length >= r) {
      e.emit("log", {
        module: "anchors",
        message: `Stopped due to reaching maximum feeds limit: ${d.feedUrls.length} feeds found (max ${r} allowed).`
      });
      break;
    }
    e.emit("log", { module: "anchors", totalCount: i++, totalEndpoints: o.length }), await F(a, d);
  }
  return d.feedUrls;
}
async function O(e) {
  e.emit("start", {
    module: "anchors",
    niceName: "Check all anchors"
  });
  const t = await x(e);
  return e.emit("end", { module: "anchors", feeds: t }), t;
}
const C = [
  // Standard RSS/Atom paths (most common)
  "&_rss=1",
  // eBay-style query parameter feeds
  ".atom",
  // Atom extension feeds
  ".json",
  // JSON Feed format
  ".rss",
  // Reddit-style extension feeds
  ".xml",
  // Generic XML feeds
  "atom",
  // Atom feed endpoint
  "atom.xml",
  // Standard Atom filename
  "atom/index.xml",
  // Atom directory index
  "feed",
  // Generic feed endpoint (very common)
  "feed.atom",
  // Atom with feed prefix
  "feed.json",
  // JSON Feed format
  "feed.rss",
  // RSS with feed prefix
  "feed.xml",
  // Generic feed XML
  "feeds",
  // Plural feeds directory
  "feeds/",
  // Feeds directory with trailing slash
  "index.atom",
  // Index-style Atom
  "index.rss",
  // Index-style RSS
  "index.xml",
  // Generic index XML
  "rss",
  // Simple RSS directory
  "rss/",
  // RSS directory with trailing slash
  "rss.xml",
  // Most commonly used RSS filename
  "rss/index.xml",
  // RSS directory index
  "rss/news/rss.xml",
  // News-specific RSS path
  "rss/rss.php",
  // PHP-generated RSS
  "rssfeed.rdf",
  // RDF-based RSS feeds
  "rssfeed.xml",
  // Descriptive RSS filename
  "syndication/",
  // Syndication directory
  // Blog platform specific paths
  "blog-feed.xml",
  // WIX sites
  "blog/atom",
  "blog/feed",
  "blog/feeds",
  "blog/rss",
  "blog?format=rss",
  // Squarespace
  "weblog/atom",
  "weblog/rss",
  // WordPress specific paths
  "?feed=atom",
  "?feed=rss2",
  "?format=feed",
  // Joomla
  "feed/atom/",
  "feed/rdf/",
  "feed/rss/",
  "feed/rss2/",
  "index.php?format=feed",
  // Joomla
  "wp-atom.php",
  "wp-feed.php",
  "wp-rdf.php",
  "wp-rss.php",
  "wp-rss2.php",
  // News sites and publications
  "articles/feed",
  "atom/news/",
  "latest.rss",
  "latest/feed",
  "news.xml",
  "news/atom",
  "news/rss",
  "rss/articles/",
  "rss/latest/",
  "rss/news/",
  // E-commerce and product feeds
  "catalog.xml",
  // product catalogs
  "catalog/feed",
  "deals.xml",
  // deal/sale feeds
  "deals/feed",
  "inventory.rss",
  // inventory updates
  "inventory/feed",
  "products.rss",
  // product feeds
  "products/atom",
  "products/rss",
  "promotions/feed",
  "specials/feed",
  // Podcast and media feeds
  "audio/feed",
  "episodes.rss",
  // episodic content
  "episodes/feed",
  "gallery.rss",
  // image galleries
  "media/feed",
  "podcast.rss",
  // audio content
  "podcast/atom",
  "podcast/rss",
  "podcasts/feed",
  "shows/feed",
  "video/feed",
  "videos.rss",
  // video content
  // Social media and community feeds
  "comments/feed",
  "community/feed",
  "discussions/feed",
  "forum.rss",
  // forum posts
  "forum/atom",
  "forum/rss",
  "reviews/feed",
  // Event and calendar feeds
  "agenda/feed",
  "calendar/feed",
  "events.rss",
  // calendar events
  "events/feed",
  "schedule/feed",
  // Job and career feeds
  "careers/feed",
  "jobs.rss",
  // job listings
  "jobs/feed",
  "opportunities/feed",
  "vacancies/feed",
  // Content management systems
  "content/feed",
  "documents/feed",
  "pages/feed",
  "resources/feed",
  // Newsletter and email feeds
  "emails/feed",
  "mailinglist/feed",
  "newsletter/feed",
  "subscription/feed",
  // Custom and alternative paths
  "atomfeed",
  "jsonfeed",
  "newsfeed",
  "rssfeed",
  // API style feeds
  "api/atom",
  "api/feed",
  "api/mobile/feed",
  "api/rss",
  "api/rss.xml",
  // API endpoints
  "api/v1/feed",
  "api/v2/feed",
  "v1/feed",
  "v2/feed",
  // Legacy and alternative extensions
  ".opml",
  ".rdf",
  "opml",
  "opml/",
  "rdf",
  "rdf/",
  // Category and tag feeds
  "category/*/feed",
  "tag/*/feed",
  "tags/feed",
  "topics/feed",
  // User and author feeds
  "author/*/feed",
  "profile/*/feed",
  "user/*/feed",
  // Time-based feeds
  "archive/feed",
  "daily/feed",
  "monthly/feed",
  "weekly/feed",
  "yearly/feed",
  // Specialized content feeds
  "announcements/feed",
  "changelog/feed",
  "press/feed",
  "releases/feed",
  "revisions/feed",
  "updates/feed",
  // Mobile and app feeds
  "app/feed",
  "mobile/feed",
  // Regional and local feeds
  "international/feed",
  "local/feed",
  "national/feed",
  "regional/feed",
  // Industry specific feeds
  "education/feed",
  "entertainment/feed",
  "finance/feed",
  "health/feed",
  "industry/feed",
  "market/feed",
  "science/feed",
  "sector/feed",
  "sports/feed",
  "technology/feed",
  // Aggregation and compilation feeds
  "aggregate/feed",
  "all/feed",
  "combined/feed",
  "compilation/feed",
  "everything/feed",
  // International variations
  "actualites/feed",
  // French news
  "nachrichten/feed",
  // German news
  "nieuws/feed",
  // Dutch news
  "noticias/feed",
  // Spanish news
  "novosti/feed",
  // Russian news
  // Query parameter based feeds
  "?atom=1",
  "?download=atom",
  "?download=rss",
  "?export=atom",
  "?export=rss",
  "?feed=atom",
  "?feed=rss",
  "?format=atom",
  "?format=feed",
  "?format=rss",
  "?output=atom",
  "?output=rss",
  "?rss=1",
  "?syndicate=atom",
  "?syndicate=rss",
  "?type=atom",
  "?type=rss",
  "?view=feed",
  "?view=rss",
  // Other existing paths from original list
  "export/rss.xml",
  // export directories
  "extern.php?action=feed&type=atom",
  "external?type=rss2",
  "feed.aspx",
  // ASP.NET feeds
  "feed.cml",
  // Wix, Weflow
  "feed/atom",
  "feed/atom.rss",
  "feed/atom.xml",
  "feed/rdf",
  "feed/rss.xml",
  "feed/rss2",
  "index.php?action=.xml;type=rss",
  "posts.rss",
  "public/feed.xml",
  // public feeds
  "rss.aspx",
  // ASP.NET sites
  "rss.cfm",
  // ColdFusion sites
  "rss.php",
  "sitenews",
  "spip.php?page=backend",
  "spip.php?page=backend-breve",
  "spip.php?page=backend-sites",
  "syndicate/rss.xml",
  "syndication.php",
  "xml",
  // Additional modern feed endpoints
  "feed.jsp",
  // Java Server Pages feeds
  "feed.php",
  // PHP-generated feeds
  "feed.pl",
  // Perl feeds
  "feed.py",
  // Python feeds
  "feed.rb",
  // Ruby feeds
  "feeds.json",
  // JSON feeds directory
  "feeds.php",
  // PHP feeds directory
  "feeds.xml",
  // XML feeds directory
  // Static site generators
  "_site/feed.xml",
  // Jekyll default
  "build/feed.xml",
  // React build
  "dist/feed.xml",
  // Build output
  "out/feed.xml",
  // Next.js output
  // Headless CMS feeds
  "api/feed.xml",
  // Headless CMS
  "cms/feed",
  // CMS endpoints
  "contentful/feed",
  // Contentful
  "sanity/feed",
  // Sanity CMS
  "strapi/feed",
  // Strapi CMS
  // Documentation feeds
  "docs/feed",
  // Documentation feeds
  "documentation/feed",
  "help/feed",
  "kb/feed",
  // Knowledge base
  "support/feed",
  "wiki/feed",
  // Wiki feeds
  // Repository and code feeds
  "branches/feed",
  // Git branches
  "commits/feed",
  // Git commits
  "issues/feed",
  // Issue tracker
  "pull-requests/feed",
  // PR feeds
  "releases/feed",
  // Software releases
  "tags/feed",
  // Git tags
  // Analytics and tracking feeds
  "analytics/feed",
  // Analytics data
  "metrics/feed",
  // Metrics feeds
  "reports/feed",
  // Report feeds
  "stats/feed",
  // Statistics feeds
  // Multi-language feeds
  "de/feed",
  // German
  "en/feed",
  // English
  "es/feed",
  // Spanish
  "fr/feed",
  // French
  "it/feed",
  // Italian
  "ja/feed",
  // Japanese
  "ko/feed",
  // Korean
  "pt/feed",
  // Portuguese
  "ru/feed",
  // Russian
  "zh/feed",
  // Chinese
  // Additional file extensions
  "feed.csv",
  // CSV feeds
  "feed.txt",
  // Plain text feeds
  "feed.yaml",
  // YAML feeds
  "feed.yml",
  // YAML feeds (alternative)
  // Specialized platforms
  "drupal/feed",
  // Drupal CMS
  "joomla/feed",
  // Joomla CMS
  "magento/feed",
  // Magento stores
  "opencart/feed",
  // OpenCart
  "prestashop/feed",
  // PrestaShop
  "shopify/feed",
  // Shopify stores
  "typo3/feed",
  // TYPO3 CMS
  "woocommerce/feed",
  // WooCommerce
  // Social and community platforms
  "discourse/feed",
  // Discourse forums
  "invision/feed",
  // Invision Community
  "phpbb/feed",
  // phpBB forums
  "vbulletin/feed",
  // vBulletin forums
  "xenforo/feed"
  // XenForo forums
];
function $(e, t) {
  const s = new URL(e).origin;
  let o = e;
  const r = [];
  let d = "";
  for (t && (d = new URL(e).search); o.length >= s.length; ) {
    const i = o.endsWith("/") ? o.slice(0, -1) : o;
    C.forEach((a) => {
      const n = d ? `${i}/${a}${d}` : `${i}/${a}`;
      r.push(n);
    }), o = o.slice(0, o.lastIndexOf("/"));
  }
  return r;
}
function T(e, t, s, o, r) {
  return e.type === "rss" ? o = !0 : e.type === "atom" && (r = !0), s.push({
    url: t,
    feedType: e.type,
    title: e.title
  }), { rssFound: o, atomFound: r };
}
function q(e, t, s, o, r) {
  return e < t && !(!r && s && o);
}
async function _(e) {
  const t = $(e.site, e.options?.keepQueryParams || !1);
  e.emit("start", { module: "blindsearch", niceName: "Blind search", endpointUrls: t.length });
  const s = e.options?.all || !1, o = e.options?.maxFeeds || 0, r = await A(t, s, o, e);
  return e.emit("end", { module: "blindsearch", feeds: r.feeds }), r.feeds;
}
async function A(e, t, s, o) {
  const r = [], d = /* @__PURE__ */ new Set();
  let i = !1, a = !1, n = 0;
  for (; q(n, e.length, i, a, t); ) {
    if (s > 0 && r.length >= s) {
      await p(o, r, s);
      break;
    }
    const l = e[n], f = await j(l, o, d, r, i, a);
    if (f.found && (i = f.rssFound, a = f.atomFound, s > 0 && r.length >= s)) {
      await p(o, r, s);
      break;
    }
    let w = r.length;
    o.emit("log", { module: "blindsearch", totalEndpoints: e.length, totalCount: n, feedsFound: w }), n++;
  }
  return { feeds: r, rssFound: i, atomFound: a };
}
async function j(e, t, s, o, r, d) {
  try {
    const i = await h(e, "", t);
    if (i && !s.has(e)) {
      s.add(e);
      const a = T(i, e, o, r, d);
      return r = a.rssFound, d = a.atomFound, { found: !0, rssFound: r, atomFound: d };
    }
  } catch (i) {
    await z(t, e, i);
  }
  return { found: !1, rssFound: r, atomFound: d };
}
async function p(e, t, s) {
  e.emit("log", {
    module: "blindsearch",
    message: `Stopped due to reaching maximum feeds limit: ${t.length} feeds found (max ${s} allowed).`
  });
}
async function z(e, t, s) {
  e.options?.showErrors && e.emit("error", {
    module: "blindsearch",
    error: `Error fetching ${t}: ${s.message}`,
    explanation: "An error occurred while trying to fetch a potential feed URL during blind search. This could be due to network timeouts, server errors, 404 not found, or invalid content.",
    suggestion: "This is normal during blind search as many URLs are tested. The search will continue with other potential feed endpoints."
  });
}
function D(e) {
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
  ].some((s) => e.endsWith(s));
}
class M extends b {
  constructor(t, s = 3, o = 5, r = 1e3, d = !1, i = 5, a = 0, n = null) {
    super();
    const l = new URL(t);
    this.startUrl = l.href, this.maxDepth = s, this.concurrency = o, this.maxLinks = r, this.mainDomain = c.getDomain(this.startUrl), this.checkForeignFeeds = d, this.maxErrors = i, this.maxFeeds = a, this.errorCount = 0, this.instance = n, this.queue = v(this.crawlPage.bind(this), this.concurrency), this.visitedUrls = /* @__PURE__ */ new Set(), this.timeout = 5e3, this.maxLinksReachedMessageEmitted = !1, this.feeds = [], this.queue.error((f) => {
      this.errorCount < this.maxErrors && (this.errorCount++, this.emit("error", {
        module: "deepSearch",
        error: `Async error: ${f}`,
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
  isValidUrl(t) {
    try {
      const s = c.getDomain(t) == c.getDomain(this.startUrl), o = !D(t);
      return s && o;
    } catch {
      return this.errorCount < this.maxErrors && (this.errorCount++, this.emit("error", {
        module: "deepSearch",
        error: `Invalid URL: ${t}`,
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
   * Handles pre-crawl checks and validations for a given URL.
   * @param {string} url - The URL to check.
   * @param {number} depth - The current crawl depth.
   * @returns {boolean} True if the crawl should continue, false otherwise.
   * @private
   */
  shouldCrawl(t, s) {
    return s > this.maxDepth || this.visitedUrls.has(t) ? !1 : this.visitedUrls.size >= this.maxLinks ? (this.maxLinksReachedMessageEmitted || (this.emit("log", {
      module: "deepSearch",
      message: `Max links limit of ${this.maxLinks} reached. Stopping deep search.`
    }), this.maxLinksReachedMessageEmitted = !0), !1) : this.isValidUrl(t);
  }
  /**
   * Handles fetch errors and increments the error counter.
   * @param {string} url - The URL that failed to fetch.
   * @param {number} depth - The crawl depth at which the error occurred.
   * @param {string} error - The error message.
   * @returns {boolean} True if the crawl should stop, false otherwise.
   * @private
   */
  handleFetchError(t, s, o) {
    return this.errorCount < this.maxErrors && (this.errorCount++, this.emit("log", { module: "deepSearch", url: t, depth: s, error: o }), this.errorCount >= this.maxErrors) ? (this.queue.kill(), this.emit("log", {
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
  async processLink(t, s) {
    if (this.visitedUrls.has(t)) return !1;
    if (this.visitedUrls.size >= this.maxLinks)
      return this.maxLinksReachedMessageEmitted || (this.emit("log", {
        module: "deepSearch",
        message: `Max links limit of ${this.maxLinks} reached. Stopping deep search.`
      }), this.maxLinksReachedMessageEmitted = !0), !0;
    if (!(this.isValidUrl(t) || this.checkForeignFeeds)) return !1;
    try {
      const r = await h(t, "", this.instance);
      if (r && !this.feeds.some((d) => d.url === t)) {
        if (this.feeds.push({ url: t, type: r.type, title: r.title }), this.emit("log", {
          module: "deepSearch",
          url: t,
          depth: s + 1,
          feedCheck: { isFeed: !0, type: r.type }
        }), this.maxFeeds > 0 && this.feeds.length >= this.maxFeeds)
          return this.queue.kill(), this.emit("log", {
            module: "deepSearch",
            message: `Stopped due to reaching maximum feeds limit: ${this.feeds.length} feeds found (max ${this.maxFeeds} allowed).`
          }), !0;
      } else r || this.emit("log", { module: "deepSearch", url: t, depth: s + 1, feedCheck: { isFeed: !1 } });
    } catch (r) {
      return this.handleFetchError(t, s + 1, `Error checking feed: ${r.message}`);
    }
    return s + 1 <= this.maxDepth && this.isValidUrl(t) && this.queue.push({ url: t, depth: s + 1 }), !1;
  }
  /**
   * Crawls a single page, extracting links and checking for feeds
   * @param {object} task - The task object containing the URL and depth
   * @param {string} task.url - The URL to crawl
   * @param {number} task.depth - The current depth of crawling
   * @returns {Promise<void>} A promise that resolves when the page has been crawled
   */
  async crawlPage(t) {
    let { url: s, depth: o } = t;
    if (!this.shouldCrawl(s, o)) return;
    this.visitedUrls.add(s);
    const r = await y(s, this.timeout);
    if (!r) {
      this.handleFetchError(s, o, "Failed to fetch URL - timeout or network error");
      return;
    }
    if (!r.ok) {
      this.handleFetchError(s, o, `HTTP ${r.status} ${r.statusText}`);
      return;
    }
    const d = await r.text(), { document: i } = k(d);
    for (const a of i.querySelectorAll("a")) {
      const n = new URL(a.href, this.startUrl).href;
      if (await this.processLink(n, o)) break;
    }
  }
}
async function B(e, t = {}, s = null) {
  const o = new M(
    e,
    t.depth || 3,
    5,
    t.maxLinks || 1e3,
    !!t.checkForeignFeeds,
    // Whether to check foreign domains for feeds
    t.maxErrors || 5,
    // Maximum number of errors before stopping
    t.maxFeeds || 0,
    // Maximum number of feeds before stopping (0 = no limit)
    s
    // Pass the FeedScout instance to the crawler
  );
  return o.timeout = (t.timeout || 5) * 1e3, s && (o.on("start", (r) => s.emit("start", r)), o.on("log", (r) => s.emit("log", r)), o.on("error", (r) => s.emit("error", r)), o.on("end", (r) => s.emit("end", r))), o.start(), await new Promise((r) => {
    o.queue.drain(() => {
      r();
    });
  }), o.feeds;
}
export {
  _ as b,
  O as c,
  B as d,
  I as m
};
