#!/usr/bin/env node
import { Command as J, Option as B } from "commander";
import { parseHTML as H } from "linkedom";
import A from "tldts";
import { queue as G } from "async";
import { styleText as u } from "node:util";
async function I(t, e = {}) {
  let r, s;
  if (typeof e == "number")
    r = e, s = {};
  else {
    const { timeout: a = 5e3, ...c } = e;
    r = a, s = c;
  }
  try {
    const a = new URL(t);
    if (!["http:", "https:"].includes(a.protocol))
      throw new Error(`Invalid URL protocol: ${a.protocol}. Only http: and https: are allowed.`);
  } catch (a) {
    throw a instanceof TypeError ? new Error(`Invalid URL: ${t}`) : a;
  }
  if (r <= 0)
    throw new Error(`Invalid timeout: ${r}. Timeout must be a positive number.`);
  if (!Number.isFinite(r))
    throw new Error(`Invalid timeout: ${r}. Timeout must be a finite number.`);
  const o = new AbortController(), n = setTimeout(() => o.abort(), r), l = {
    ...{
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
      "Accept-Encoding": "gzip, deflate, br",
      Connection: "keep-alive",
      "Upgrade-Insecure-Requests": "1",
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "none",
      "Cache-Control": "max-age=0"
    },
    ...s.headers || {}
  };
  try {
    const a = await fetch(t, {
      ...s,
      signal: o.signal,
      headers: l
    });
    return clearTimeout(n), a;
  } catch (a) {
    throw clearTimeout(n), a instanceof Error && a.name === "AbortError" ? new Error(`Request to ${t} timed out after ${r}ms`) : a;
  }
}
const g = {
  MAX_CONTENT_SIZE: 10 * 1024 * 1024,
  // 10MB maximum content size
  DEFAULT_TIMEOUT: 5,
  // Default timeout in seconds
  MAX_TIMEOUT: 60,
  // Maximum timeout in seconds (60 seconds)
  MIN_TIMEOUT: 1
  // Minimum timeout in seconds
}, C = {
  TYPES: ["rich", "video", "photo", "link"],
  VERSIONS: ["1.0", "2.0"],
  URL_PATTERNS: ["/wp-json/oembed/", "/oembed"]
}, h = {
  // CDATA processing - matches XML CDATA sections: <![CDATA[content]]>
  // Used to extract clean text content from feeds that wrap content in CDATA
  CDATA: /<!\[CDATA\[(.*?)\]\]>/g,
  // RSS feed detection patterns
  RSS: {
    // Matches RSS root element with version attribute: <rss version="2.0">
    // [^>]* matches any attributes before version, \s+ ensures whitespace before version
    VERSION: /<rss[^>]*\s+version\s*=\s*["'][\d.]+["'][^>]*>/i,
    // Matches RSS channel opening tag (required container for RSS content)
    CHANNEL: /<channel[^>]*>/i,
    // Matches RSS item opening tag (individual feed entries)
    ITEM: /<item[^>]*>/i,
    // Matches RSS description opening tag (content description)
    DESCRIPTION: /<description[^>]*>/i,
    // Matches RSS channel closing tag
    CHANNEL_END: /<\/channel>/i,
    // Captures entire channel content between opening and closing tags
    // [\s\S]*? uses non-greedy matching to capture everything including newlines
    CHANNEL_CONTENT: /<channel>([\s\S]*?)<\/channel>/i,
    // Captures title content between title tags (feed or item title)
    TITLE: /<title>([\s\S]*?)<\/title>/i
  },
  // Atom feed detection patterns
  ATOM: {
    // Matches Atom feed opening tag with optional attributes: <feed ...>
    // (?:\s+[^>]*)? is a non-capturing group for optional attributes
    FEED_START: /<feed(?:\s+[^>]*)?>/i,
    // Matches Atom namespace declaration: xmlns="...atom..." or xmlns:atom="..."
    // These patterns ensure the feed uses the Atom XML namespace
    NAMESPACE_XMLNS: /<feed[^>]*xmlns[^>]*atom/i,
    NAMESPACE_XMLNS_ATOM: /<feed[^>]*xmlns:atom/i,
    NAMESPACE_ATOM_PREFIX: /<feed[^>]*atom:/i,
    // Matches Atom entry opening tag (individual feed entries)
    ENTRY: /<entry[^>]*>/i,
    // Matches Atom title opening tag
    TITLE_TAG: /<title[^>]*>/i,
    // Captures title content between title tags
    TITLE_CONTENT: /<title>([\s\S]*?)<\/title>/i
  }
};
function K(t) {
  let e;
  try {
    e = new URL(t);
  } catch {
    throw new Error(`Invalid URL: ${t}`);
  }
  if (!["http:", "https:"].includes(e.protocol))
    throw new Error(
      `Invalid protocol: ${e.protocol}. Only http: and https: protocols are allowed.`
    );
}
function Q(t) {
  if (t.length > g.MAX_CONTENT_SIZE)
    throw new Error(
      `Content too large: ${t.length} bytes. Maximum allowed: ${g.MAX_CONTENT_SIZE} bytes.`
    );
}
function Z(t) {
  return t == null ? g.DEFAULT_TIMEOUT : !Number.isFinite(t) || t < g.MIN_TIMEOUT ? (console.warn(
    `Invalid timeout value ${t}. Using minimum: ${g.MIN_TIMEOUT} seconds.`
  ), g.MIN_TIMEOUT) : t > g.MAX_TIMEOUT ? (console.warn(
    `Timeout value ${t} exceeds maximum. Clamping to ${g.MAX_TIMEOUT} seconds.`
  ), g.MAX_TIMEOUT) : Math.floor(t);
}
function ee(t) {
  return C.URL_PATTERNS.some((e) => t.includes(e));
}
function te(t) {
  return !!(t.type && C.TYPES.includes(t.type) && C.VERSIONS.includes(t.version) || t.type && t.version && t.html);
}
function F(t) {
  return t.replace(h.CDATA, "$1");
}
function S(t) {
  return t ? t.replace(/\s+/g, " ").trim() : null;
}
async function _(t, e = "", r) {
  if (K(t), ee(t))
    return null;
  if (!e) {
    if (!r)
      throw new Error("Instance parameter is required when content is not provided");
    const n = Z(r.options.timeout) * 1e3, i = await I(t, n);
    if (!i.ok)
      throw new Error(`Failed to fetch ${t}: ${i.status} ${i.statusText}`);
    e = await i.text();
  }
  return Q(e), se(e) || oe(e) || ne(e) || null;
}
function re(t) {
  const e = h.RSS.CHANNEL_CONTENT.exec(t);
  if (e) {
    const o = e[1], n = h.RSS.TITLE.exec(o);
    return n ? S(F(n[1])) : null;
  }
  const r = h.RSS.TITLE.exec(t);
  return r ? S(F(r[1])) : null;
}
function se(t) {
  if (h.RSS.VERSION.test(t)) {
    const e = h.RSS.CHANNEL.test(t), r = h.RSS.ITEM.test(t), s = h.RSS.DESCRIPTION.test(t);
    if (e && s && (r || h.RSS.CHANNEL_END.test(t)))
      return { type: "rss", title: re(t) };
  }
  return null;
}
function oe(t) {
  const e = h.ATOM.NAMESPACE_XMLNS.test(t) || h.ATOM.NAMESPACE_XMLNS_ATOM.test(t) || h.ATOM.NAMESPACE_ATOM_PREFIX.test(t);
  if (h.ATOM.FEED_START.test(t) && e) {
    const r = h.ATOM.ENTRY.test(t), s = h.ATOM.TITLE_TAG.test(t);
    if (r && s) {
      const o = h.ATOM.TITLE_CONTENT.exec(t);
      return { type: "atom", title: o ? S(F(o[1])) : null };
    }
  }
  return null;
}
function ne(t) {
  try {
    const e = JSON.parse(t);
    if (te(e))
      return null;
    if (e.version && typeof e.version == "string" && e.version.includes("jsonfeed") || e.items && Array.isArray(e.items) || e.feed_url) {
      const r = e.title || e.name || null;
      return { type: "json", title: typeof r == "string" ? S(r) : null };
    }
    return null;
  } catch {
    return null;
  }
}
const ie = ["feed+json", "rss+xml", "atom+xml", "xml", "rdf+xml"], ae = ["/rss", "/feed", "/atom", ".rss", ".atom", ".xml", ".json"];
function le(t) {
  return t ? t.replace(/\s+/g, " ").trim() : null;
}
async function L(t, e, r, s, o = 5) {
  const n = e.options?.maxFeeds || 0;
  for (let i = 0; i < t.length; i += o) {
    if (n > 0 && r.length >= n)
      return !0;
    const l = t.slice(i, i + o);
    if ((await Promise.allSettled(
      l.map((d) => de(d, e, r, s))
    )).some(
      (d) => d.status === "fulfilled" && d.value === !0
    ))
      return !0;
  }
  return !1;
}
async function de(t, e, r, s) {
  const o = e.options?.maxFeeds || 0;
  if (!t.href) return !1;
  let n;
  try {
    n = new URL(t.href, e.site).href;
  } catch (i) {
    if (e.options?.showErrors) {
      const l = i instanceof Error ? i : new Error(String(i));
      e.emit("error", {
        module: "metalinks",
        error: l.message,
        explanation: `Invalid URL found in meta link: ${t.href}. Unable to construct a valid URL.`,
        suggestion: "Check the meta link href attribute for malformed URLs."
      });
    }
    return !1;
  }
  if (s.has(n)) return !1;
  e.emit("log", { module: "metalinks", message: `Checking feed: ${n}` });
  try {
    const i = await _(n, "", e);
    if (i && (r.push({
      url: n,
      title: le(t.title),
      type: i.type,
      feedTitle: i.title
    }), s.add(n), o > 0 && r.length >= o))
      return e.emit("log", {
        module: "metalinks",
        message: `Stopped due to reaching maximum feeds limit: ${r.length} feeds found (max ${o} allowed).`
      }), !0;
  } catch (i) {
    if (e.options?.showErrors) {
      const l = i instanceof Error ? i : new Error(String(i));
      e.emit("error", {
        module: "metalinks",
        error: l.message,
        explanation: "An error occurred while trying to fetch and validate a feed URL found in a meta link tag. This could be due to network issues, server problems, or invalid feed content.",
        suggestion: "Check if the meta link URL is accessible and returns valid feed content. The search will continue with other meta links."
      });
    }
  }
  return !1;
}
async function ce(t) {
  t.emit("start", { module: "metalinks", niceName: "Meta links" });
  const e = [], r = /* @__PURE__ */ new Set();
  try {
    const s = ie.map((c) => `link[type="application/${c}"]`).join(", "), o = Array.from(t.document.querySelectorAll(s));
    if (await L(o, t, e, r))
      return e;
    const i = Array.from(
      t.document.querySelectorAll('link[rel="alternate"][type*="rss"], link[rel="alternate"][type*="xml"], link[rel="alternate"][type*="atom"], link[rel="alternate"][type*="json"]')
    );
    if (await L(i, t, e, r))
      return e;
    const a = Array.from(
      t.document.querySelectorAll('link[rel="alternate"]')
    ).filter(
      (c) => c.href && ae.some((d) => c.href.toLowerCase().includes(d))
    );
    return await L(a, t, e, r), e;
  } finally {
    t.emit("end", { module: "metalinks", feeds: e });
  }
}
function T(t, e) {
  try {
    return new URL(t, e);
  } catch {
    return null;
  }
}
function fe(t) {
  const e = T(t);
  return e ? e.protocol === "http:" || e.protocol === "https:" : !1;
}
function he(t) {
  return T(t) ? !1 : !t.includes("://");
}
function q(t, e) {
  const r = T(t);
  if (!r || r.hostname === e.hostname)
    return !0;
  const s = [
    // Google FeedBurner (most common feed hosting service)
    "feedburner.com",
    "feeds.feedburner.com",
    "feedproxy.google.com",
    "feeds2.feedburner.com"
  ];
  return s.includes(r.hostname) || s.some((o) => r.hostname.endsWith("." + o));
}
function ue(t) {
  if (t.options.followMetaRefresh && t.document && typeof t.document.querySelector == "function") {
    const e = t.document.querySelector('meta[http-equiv="refresh"]')?.getAttribute("content");
    if (e) {
      const r = e.match(/url=(.*)/i);
      if (r && r[1]) {
        const s = new URL(r[1], t.site).href;
        return t.emit("log", {
          module: "anchors",
          message: `Following meta refresh redirect to ${s}`
        }), W({ ...t, site: s });
      }
    }
  }
  return null;
}
function X(t, e, r) {
  if (!t.href)
    return null;
  if (fe(t.href))
    return t.href;
  if (he(t.href)) {
    const s = T(t.href, e);
    return s ? s.href : (r.emit("error", {
      module: "anchors",
      error: `Invalid relative URL: ${t.href}`,
      explanation: "A relative URL found in an anchor tag could not be resolved against the base URL. This may be due to malformed relative path syntax.",
      suggestion: 'Check the anchor href attribute for proper relative path format (e.g., "./feed.xml", "../rss.xml", or "/feed").'
    }), null);
  }
  return null;
}
function me(t) {
  const e = /https?:\/\/[^\s"'<>)]+/gi, r = t.match(e);
  if (!r)
    return [];
  const s = /* @__PURE__ */ new Set();
  for (const o of r) {
    const n = o.replace(/[.,;:!?]+$/, "");
    s.add(n);
  }
  return Array.from(s);
}
async function pe(t, e) {
  const { instance: r, baseUrl: s, feedUrls: o } = e, n = X(t, s, r);
  if (n)
    try {
      const i = await _(n, "", r);
      i && o.push({
        url: n,
        title: t.textContent?.trim() || null,
        type: i.type,
        feedTitle: i.title
      });
    } catch (i) {
      if (r.options?.showErrors) {
        const l = i instanceof Error ? i : new Error(String(i));
        r.emit("error", {
          module: "anchors",
          error: `Error checking feed at ${n}: ${l.message}`,
          explanation: "An error occurred while trying to fetch and validate a potential feed URL found in an anchor tag. This could be due to network timeouts, server errors, or invalid feed content.",
          suggestion: "Check if the URL is accessible and returns valid feed content. Network connectivity issues or server problems may cause this error."
        });
      }
    }
}
async function W(t) {
  await ue(t);
  const e = new URL(t.site), r = t.document.querySelectorAll("a"), s = [];
  for (const l of r) {
    const a = X(l, e, t);
    a && q(a, e) && s.push(l);
  }
  const o = t.options?.maxFeeds || 0, n = {
    instance: t,
    baseUrl: e,
    feedUrls: []
  };
  let i = 1;
  for (const l of s) {
    if (o > 0 && n.feedUrls.length >= o) {
      t.emit("log", {
        module: "anchors",
        message: `Stopped due to reaching maximum feeds limit: ${n.feedUrls.length} feeds found (max ${o} allowed).`
      });
      break;
    }
    t.emit("log", { module: "anchors", totalCount: i++, totalEndpoints: s.length }), await pe(l, n);
  }
  if (o === 0 || n.feedUrls.length < o) {
    const l = t.document.body?.innerHTML || "", a = me(l), c = new Set(n.feedUrls.map((f) => f.url)), d = [];
    for (const f of a)
      !c.has(f) && q(f, e) && (d.push(f), c.add(f));
    for (const f of d) {
      if (o > 0 && n.feedUrls.length >= o) {
        t.emit("log", {
          module: "anchors",
          message: `Stopped due to reaching maximum feeds limit: ${n.feedUrls.length} feeds found (max ${o} allowed).`
        });
        break;
      }
      t.emit("log", {
        module: "anchors",
        totalCount: i++,
        totalEndpoints: s.length + d.length
      });
      try {
        const p = await _(f, "", t);
        p && n.feedUrls.push({
          url: f,
          title: null,
          // Plain-text URLs don't have anchor text
          type: p.type,
          feedTitle: p.title
        });
      } catch (p) {
        if (t.options?.showErrors) {
          const k = p instanceof Error ? p : new Error(String(p));
          t.emit("error", {
            module: "anchors",
            error: `Error checking feed at ${f}: ${k.message}`,
            explanation: "An error occurred while trying to fetch and validate a potential feed URL found in page text. This could be due to network timeouts, server errors, or invalid feed content.",
            suggestion: "Check if the URL is accessible and returns valid feed content. Network connectivity issues or server problems may cause this error."
          });
        }
      }
    }
  }
  return n.feedUrls;
}
async function ge(t) {
  t.emit("start", {
    module: "anchors",
    niceName: "Check all anchors"
  });
  const e = await W(t);
  return t.emit("end", { module: "anchors", feeds: e }), e;
}
const we = 0, v = 0, Ee = 3, U = "standard", V = 2083, $ = 10, N = 1, P = 1e4, R = 6e4, x = [
  // Most common standard paths (highest success rate)
  "feed",
  "rss",
  "atom",
  "feed.xml",
  "rss.xml",
  "atom.xml",
  "index.xml",
  "feeds",
  ".rss",
  ".atom",
  ".xml",
  // WordPress (extremely common CMS)
  "?feed=rss2",
  "?feed=atom",
  "feed/rss/",
  "feed/atom/",
  // Blog platforms
  "blog/feed",
  "blog/rss",
  // Common variations
  "feed.json",
  "rss.php",
  "feed.php",
  "news/rss",
  "latest/feed",
  // Query parameters
  "?format=rss",
  "?format=feed"
], M = [
  // Extended standard paths
  "rssfeed.xml",
  "feed.rss",
  "feed.atom",
  "feeds/",
  "rss/",
  "index.rss",
  "index.atom",
  "rss/index.xml",
  "atom/index.xml",
  "syndication/",
  "rssfeed.rdf",
  "&_rss=1",
  // Blog platforms
  "blog/atom",
  "blog/feeds",
  "blog?format=rss",
  "blog-feed.xml",
  "weblog/atom",
  "weblog/rss",
  // WordPress extended
  "?format=feed",
  "feed/rdf/",
  "feed/rss2/",
  "wp-atom.php",
  "wp-feed.php",
  "wp-rdf.php",
  "wp-rss.php",
  "wp-rss2.php",
  "index.php?format=feed",
  // News and articles
  "articles/feed",
  "atom/news/",
  "latest.rss",
  "news.xml",
  "news/atom",
  "rss/articles/",
  "rss/latest/",
  "rss/news/",
  "rss/news/rss.xml",
  "rss/rss.php",
  // API style
  "api/feed",
  "api/rss",
  "api/atom",
  "api/rss.xml",
  "api/feed.xml",
  "api/v1/feed",
  "api/v2/feed",
  "v1/feed",
  "v2/feed",
  // CMS and frameworks
  "feed.aspx",
  "rss.aspx",
  "rss.cfm",
  "feed.jsp",
  "feed.pl",
  "feed.py",
  "feed.rb",
  "feed/atom",
  "feed/rdf",
  "feed/atom.rss",
  "feed/atom.xml",
  "feed/rss.xml",
  "feed/rss2",
  "posts.rss",
  // Static site generators
  "_site/feed.xml",
  "build/feed.xml",
  "dist/feed.xml",
  "out/feed.xml",
  // Query parameters
  "?atom=1",
  "?rss=1",
  "?feed=atom",
  "?feed=rss",
  "?format=atom",
  "?output=rss",
  "?output=atom",
  "?type=rss",
  "?type=atom",
  "?view=feed",
  "?view=rss"
], ye = [
  // Custom and alternative paths
  "atomfeed",
  "jsonfeed",
  "newsfeed",
  "rssfeed",
  "feeds.json",
  "feeds.php",
  "feeds.xml",
  ".json",
  ".opml",
  ".rdf",
  "opml",
  "opml/",
  "rdf",
  "rdf/",
  // Additional modern formats
  "feed.cml",
  "feed.csv",
  "feed.txt",
  "feed.yaml",
  "feed.yml",
  // Complex query parameters
  "?download=atom",
  "?download=rss",
  "?export=atom",
  "?export=rss",
  "?syndicate=atom",
  "?syndicate=rss",
  // Specialized CMS paths
  "export/rss.xml",
  "extern.php?action=feed&type=atom",
  "external?type=rss2",
  "index.php?action=.xml;type=rss",
  "public/feed.xml",
  "spip.php?page=backend",
  "spip.php?page=backend-breve",
  "spip.php?page=backend-sites",
  "syndicate/rss.xml",
  "syndication.php",
  "xml",
  "sitenews",
  "api/mobile/feed",
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
  "updates/feed",
  "revisions/feed",
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
  "nachrichten/feed",
  "nieuws/feed",
  "noticias/feed",
  "novosti/feed",
  // Headless CMS feeds
  "cms/feed",
  "contentful/feed",
  "sanity/feed",
  "strapi/feed",
  // Documentation feeds
  "docs/feed",
  "documentation/feed",
  "help/feed",
  "kb/feed",
  "support/feed",
  "wiki/feed",
  // Repository and code feeds
  "branches/feed",
  "commits/feed",
  "issues/feed",
  "pull-requests/feed",
  "releases/feed",
  "tags/feed",
  // Analytics and tracking feeds
  "analytics/feed",
  "metrics/feed",
  "reports/feed",
  "stats/feed",
  // Multi-language feeds
  "de/feed",
  "en/feed",
  "es/feed",
  "fr/feed",
  "it/feed",
  "ja/feed",
  "ko/feed",
  "pt/feed",
  "ru/feed",
  "zh/feed",
  // Specialized platforms
  "drupal/feed",
  "joomla/feed",
  "magento/feed",
  "opencart/feed",
  "prestashop/feed",
  "shopify/feed",
  "typo3/feed",
  "woocommerce/feed",
  // Social and community platforms
  "discourse/feed",
  "invision/feed",
  "phpbb/feed",
  "vbulletin/feed",
  "xenforo/feed"
];
function _e(t) {
  switch (t) {
    case "fast":
      return x;
    case "standard":
      return [...x, ...M];
    case "exhaustive":
    case "full":
      return [...x, ...M, ...ye];
    default:
      return [...x, ...M];
  }
}
function xe(t) {
  return t ? ["fast", "standard", "exhaustive", "full"].includes(t) ? t : (console.warn(`Invalid search mode "${t}". Falling back to "${U}".`), U) : U;
}
function be(t) {
  return t == null ? Ee : !Number.isFinite(t) || t < N ? (console.warn(`Invalid concurrency value ${t}. Using minimum: ${N}.`), N) : t > $ ? (console.warn(`Concurrency value ${t} exceeds maximum. Clamping to ${$}.`), $) : Math.floor(t);
}
function Se(t) {
  return t == null ? v : !Number.isFinite(t) || t < 0 ? (console.warn(`Invalid request delay ${t}. Using default: ${v}.`), v) : t > R ? (console.warn(`Request delay ${t}ms exceeds maximum. Clamping to ${R}ms.`), R) : Math.floor(t);
}
function z(t) {
  return t.length <= V;
}
function Te(t, e, r) {
  let s;
  try {
    s = new URL(t);
  } catch {
    throw new Error(`Invalid URL provided to blindSearch: ${t}`);
  }
  if (!z(t))
    throw new Error(`URL too long (${t.length} chars). Maximum allowed: ${V} characters.`);
  if (!["http:", "https:"].includes(s.protocol))
    throw new Error(`Invalid protocol "${s.protocol}". Only http: and https: are allowed.`);
  const o = s.origin;
  let n = t;
  const i = [];
  let l = "";
  for (e && (l = s.search); n.length >= o.length; ) {
    const a = n.endsWith("/") ? n.slice(0, -1) : n;
    for (const c of r) {
      if (i.length >= P)
        return console.warn(
          `URL generation limit reached (${P} URLs). Stopping to prevent resource exhaustion.`
        ), i;
      const d = l ? `${a}/${c}${l}` : `${a}/${c}`;
      z(d) ? i.push(d) : console.warn(`Skipping URL (too long): ${d.substring(0, 100)}...`);
    }
    n = n.slice(0, n.lastIndexOf("/"));
  }
  return i;
}
function ke(t, e, r, s, o) {
  return t.type === "rss" ? s = !0 : t.type === "atom" && (o = !0), r.push({
    url: e,
    title: null,
    // No link element title in blind search (unlike metaLinks)
    type: t.type,
    feedTitle: t.title,
    // Actual feed title from parsing the feed
    feedType: t.type
    // Included for BlindSearchFeed interface compatibility
  }), { rssFound: s, atomFound: o };
}
function Ae(t, e, r, s, o) {
  return t >= e ? !1 : o ? !0 : !(r && s);
}
async function Le(t, e) {
  const r = xe(t.options?.searchMode), s = _e(r), o = Te(t.site, t.options?.keepQueryParams || !1, s);
  t.emit("start", { module: "blindsearch", niceName: "Blind search", endpointUrls: o.length });
  const n = t.options?.all || !1, i = t.options?.maxFeeds ?? we, l = be(t.options?.concurrency), a = await ve(o, n, i, l, t);
  return t.emit("end", { module: "blindsearch", feeds: a.feeds }), a.feeds;
}
async function ve(t, e, r, s, o, n) {
  const i = [], l = /* @__PURE__ */ new Set();
  let a = !1, c = !1, d = 0;
  for (; Ae(d, t.length, a, c, e); ) {
    if (r > 0 && i.length >= r) {
      await j(o, i, r);
      break;
    }
    const f = Math.min(s, t.length - d), p = t.slice(d, d + f), k = await Promise.allSettled(
      p.map((w) => Ue(w, o, l, i, a, c))
    );
    for (const w of k)
      if (w.status === "fulfilled" && w.value.found && (a = w.value.rssFound, c = w.value.atomFound, r > 0 && i.length >= r)) {
        await j(o, i, r), d = t.length;
        break;
      }
    d += f;
    const Y = i.length;
    o.emit("log", { module: "blindsearch", totalEndpoints: t.length, totalCount: d, feedsFound: Y });
    const D = Se(o.options?.requestDelay);
    D > 0 && d < t.length && await new Promise((w) => setTimeout(w, D));
  }
  return { feeds: i, rssFound: a, atomFound: c };
}
async function Ue(t, e, r, s, o, n) {
  if (r.has(t))
    return { found: !1, rssFound: o, atomFound: n };
  r.add(t);
  try {
    const i = await _(t, "", e);
    if (i) {
      const l = ke(i, t, s, o, n);
      return o = l.rssFound, n = l.atomFound, { found: !0, rssFound: o, atomFound: n };
    }
  } catch (i) {
    const l = i instanceof Error ? i : new Error(String(i));
    await $e(e, t, l);
  }
  return { found: !1, rssFound: o, atomFound: n };
}
async function j(t, e, r) {
  t.emit("log", {
    module: "blindsearch",
    message: `Stopped due to reaching maximum feeds limit: ${e.length} feeds found (max ${r} allowed).`
  });
}
async function $e(t, e, r) {
  t.options?.showErrors && t.emit("error", {
    module: "blindsearch",
    error: `Error fetching ${e}: ${r.message}`,
    explanation: "An error occurred while trying to fetch a potential feed URL during blind search. This could be due to network timeouts, server errors, 404 not found, or invalid content.",
    suggestion: "This is normal during blind search as many URLs are tested. The search will continue with other potential feed endpoints."
  });
}
class y {
  /**
   * Private field storing event listeners using Map and Set for optimal performance
   * @private
   * @type {Map<string, Set<EventListener>>}
   */
  #e = /* @__PURE__ */ new Map();
  /**
   * Maximum number of listeners per event (0 = unlimited)
   * @private
   */
  #t;
  /**
   * Whether to capture async errors
   * @private
   */
  #o;
  /**
   * Default max listeners for all instances
   * @private
   */
  static #n = 10;
  /**
   * Creates a new EventEmitter instance
   * @param {EventEmitterOptions} options - Configuration options
   */
  constructor(e = {}) {
    this.#t = e.maxListeners ?? y.#n, this.#o = e.captureAsyncErrors ?? !0;
  }
  /**
   * Sets the default maximum number of listeners for all new EventEmitter instances
   * @param {number} n - The maximum number of listeners (0 = unlimited)
   */
  static setDefaultMaxListeners(e) {
    if (typeof e != "number" || e < 0 || !Number.isInteger(e))
      throw new TypeError("Max listeners must be a non-negative integer");
    y.#n = e;
  }
  /**
   * Validates event name
   * @private
   */
  #r(e) {
    if (typeof e != "string" || e.trim().length === 0)
      throw new TypeError("Event must be a non-empty string");
  }
  /**
   * Validates listener
   * @private
   */
  #s(e) {
    if (typeof e != "function")
      throw new TypeError("Listener must be a function");
  }
  /**
   * Checks and warns if max listeners exceeded
   * @private
   */
  #i(e) {
    if (this.#t > 0) {
      const r = this.listenerCount(e);
      r > this.#t && console.warn(
        `Warning: Possible EventEmitter memory leak detected. ${r} ${e} listeners added. Use emitter.setMaxListeners() to increase limit`
      );
    }
  }
  /**
   * Converts an error to a string representation
   * Handles Error objects, plain objects with error properties, and other types
   * @private
   */
  #l(e) {
    if (e instanceof Error)
      return e.message;
    if (typeof e == "object" && e !== null) {
      const r = e;
      if (typeof r.error == "string") return r.error;
      if (typeof r.message == "string") return r.message;
      try {
        return JSON.stringify(r);
      } catch {
        return String(e);
      }
    }
    return String(e);
  }
  /**
   * Handles errors from listener execution
   * @private
   */
  #a(e, r) {
    if (r === "error")
      throw console.error("Error in error event listener:", e), e;
    const s = this.#e.get("error");
    if (s && s.size > 0)
      this.emit("error", e, r);
    else
      throw console.error(`Unhandled error in event listener for '${r}':`, e), e;
  }
  /**
   * Adds an event listener for the specified event
   * @param {string} event - The name of the event to listen for
   * @param {EventListener} listener - The function to call when the event is emitted
   * @returns {EventEmitter} The instance for method chaining
   * @throws {TypeError} When event is not a non-empty string or listener is not a function
   * @example
   * emitter.on('data', (payload) => {
   *   console.log('Received data:', payload);
   * });
   */
  on(e, r) {
    this.#r(e), this.#s(r);
    const s = this.#e.get(e);
    return s ? s.add(r) : this.#e.set(e, /* @__PURE__ */ new Set([r])), this.#i(e), this;
  }
  /**
   * Adds an event listener to the beginning of the listeners array
   * @param {string} event - The name of the event to listen for
   * @param {EventListener} listener - The function to call when the event is emitted
   * @returns {EventEmitter} The instance for method chaining
   * @throws {TypeError} When event is not a non-empty string or listener is not a function
   * @example
   * emitter.prependListener('data', (payload) => {
   *   console.log('This runs first');
   * });
   */
  prependListener(e, r) {
    this.#r(e), this.#s(r);
    const s = this.#e.get(e);
    if (!s)
      this.#e.set(e, /* @__PURE__ */ new Set([r]));
    else {
      const o = /* @__PURE__ */ new Set([r, ...s]);
      this.#e.set(e, o);
    }
    return this.#i(e), this;
  }
  /**
   * Adds a one-time event listener for the specified event
   * The listener will be automatically removed after being called once
   * @param {string} event - The name of the event to listen for
   * @param {EventListener} listener - The function to call when the event is emitted (will be removed after first call)
   * @returns {EventEmitter} The instance for method chaining
   * @throws {TypeError} When event is not a non-empty string or listener is not a function
   * @example
   * emitter.once('init', () => {
   *   console.log('This will only run once');
   * });
   *
   * emitter.emit('init'); // Triggers listener
   * emitter.emit('init'); // Does nothing - listener was removed
   */
  once(e, r) {
    this.#r(e), this.#s(r);
    const s = ((...o) => {
      this.off(e, s), r(...o);
    });
    return s.originalListener = r, this.on(e, s);
  }
  /**
   * Adds a one-time event listener to the beginning of the listeners array
   * @param {string} event - The name of the event to listen for
   * @param {EventListener} listener - The function to call when the event is emitted
   * @returns {EventEmitter} The instance for method chaining
   * @throws {TypeError} When event is not a non-empty string or listener is not a function
   */
  prependOnceListener(e, r) {
    this.#r(e), this.#s(r);
    const s = ((...o) => {
      this.off(e, s), r(...o);
    });
    return s.originalListener = r, this.prependListener(e, s);
  }
  /**
   * Emits an event, calling all listeners registered for that event
   * Listeners are called synchronously in the order they were added
   * @param {string} event - The name of the event to emit
   * @param {...unknown} args - Arguments to pass to the listeners
   * @returns {boolean} True if the event had listeners, false otherwise
   * @throws {Error} If an 'error' event is emitted with no listeners
   * @example
   * emitter.emit('data', { id: 1, message: 'Hello' });
   * emitter.emit('error', new Error('Something went wrong'));
   *
   * const hasListeners = emitter.emit('test');
   * console.log(hasListeners); // true if listeners exist, false otherwise
   */
  emit(e, ...r) {
    const s = this.#e.get(e);
    if (!s || s.size === 0) {
      if (e === "error") {
        const o = r[0];
        if (o instanceof Error)
          throw o;
        {
          const n = this.#l(o);
          throw new Error(`Unhandled error event: ${n}`);
        }
      }
      return !1;
    }
    return [...s].forEach((o) => {
      try {
        const n = o(...r);
        this.#o && n instanceof Promise && n.catch((i) => {
          this.#a(i, e);
        });
      } catch (n) {
        this.#a(n, e);
      }
    }), !0;
  }
  /**
   * Removes an event listener for the specified event
   * @param {string} event - The name of the event
   * @param {EventListener} listener - The specific listener function to remove (must be same reference)
   * @returns {EventEmitter} The instance for method chaining
   * @example
   * const handler = (data) => console.log(data);
   * emitter.on('test', handler);
   * emitter.off('test', handler); // Removes the specific handler
   */
  off(e, r) {
    const s = this.#e.get(e);
    return s ? ([...s].forEach((o) => {
      (o === r || o.originalListener === r) && s.delete(o);
    }), s.size === 0 && this.#e.delete(e), this) : this;
  }
  /**
   * Removes all listeners for a specific event, or all events if no event specified
   * @param {string} [event] - The name of the event (optional, if not provided removes all listeners for all events)
   * @returns {EventEmitter} The instance for method chaining
   */
  removeAllListeners(e) {
    return e ? (this.#r(e), this.#e.delete(e)) : this.#e.clear(), this;
  }
  /**
   * Sets the maximum number of listeners for this emitter instance
   * @param {number} n - The maximum number of listeners (0 = unlimited)
   * @returns {EventEmitter} The instance for method chaining
   */
  setMaxListeners(e) {
    if (typeof e != "number" || e < 0 || !Number.isInteger(e))
      throw new TypeError("Max listeners must be a non-negative integer");
    return this.#t = e, this;
  }
  /**
   * Gets the maximum number of listeners for this emitter instance
   * @returns {number} The maximum number of listeners
   */
  getMaxListeners() {
    return this.#t;
  }
  /**
   * Returns the number of listeners for a specific event
   * @param {string} event - The name of the event
   * @returns {number} The number of listeners for the event
   */
  listenerCount(e) {
    const r = this.#e.get(e);
    return r ? r.size : 0;
  }
  /**
   * Returns a copy of the array of listeners for the specified event
   * Returns unwrapped listeners (without once() wrappers)
   * @param {string} event - The name of the event
   * @returns {Array<EventListener>} Array of listener functions
   * @example
   * const listeners = emitter.listeners('data');
   * console.log(`There are ${listeners.length} listeners`);
   */
  listeners(e) {
    const r = this.#e.get(e);
    return r ? [...r].map((s) => s.originalListener || s) : [];
  }
  /**
   * Returns a copy of the array of listeners for the specified event,
   * including any wrappers (such as those created by once())
   * @param {string} event - The name of the event
   * @returns {Array<EventListener>} Array of listener functions including wrappers
   * @example
   * const rawListeners = emitter.rawListeners('data');
   */
  rawListeners(e) {
    const r = this.#e.get(e);
    return r ? [...r] : [];
  }
  /**
   * Returns an array of event names that have listeners
   * @returns {Array<string>} Array of event names
   */
  eventNames() {
    return Array.from(this.#e.keys());
  }
}
function Ne(t) {
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
  ].some((r) => t.endsWith(r));
}
class Re extends y {
  constructor(e, r = 3, s = 5, o = 1e3, n = !1, i = 5, l = 0, a = null) {
    super();
    try {
      const c = new URL(e);
      this.startUrl = c.href;
    } catch {
      throw new Error(`Invalid start URL: ${e}`);
    }
    this.maxDepth = r, this.concurrency = s, this.maxLinks = o, this.mainDomain = A.getDomain(this.startUrl), this.checkForeignFeeds = n, this.maxErrors = i, this.maxFeeds = l, this.errorCount = 0, this.instance = a, this.queue = G(this.crawlPage.bind(this), this.concurrency), this.visitedUrls = /* @__PURE__ */ new Set(), this.timeout = 5e3, this.maxLinksReachedMessageEmitted = !1, this.feeds = [], this.queue.error((c) => {
      this.errorCount < this.maxErrors && (this.errorCount++, this.emit("error", {
        module: "deepSearch",
        error: `Async error: ${c}`,
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
   */
  start() {
    this.queue.push({ url: this.startUrl, depth: 0 }), this.emit("start", { module: "deepSearch", niceName: "Deep search" });
  }
  /**
   * Checks if a URL is valid (same domain, not excluded file type)
   * @param {string} url - The URL to validate
   * @returns {boolean} True if the URL is valid, false otherwise
   */
  isValidUrl(e) {
    try {
      const r = A.getDomain(e) === A.getDomain(this.startUrl), s = !Ne(e);
      return r && s;
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
  shouldCrawl(e, r) {
    return r > this.maxDepth || this.visitedUrls.has(e) ? !1 : this.visitedUrls.size >= this.maxLinks ? (this.maxLinksReachedMessageEmitted || (this.emit("log", {
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
  handleFetchError(e, r, s) {
    return this.errorCount < this.maxErrors && (this.errorCount++, this.emit("log", { module: "deepSearch", url: e, depth: r, error: s }), this.errorCount >= this.maxErrors) ? (this.queue.kill(), this.emit("log", {
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
  async processLink(e, r) {
    if (this.visitedUrls.has(e)) return !1;
    if (this.visitedUrls.size >= this.maxLinks)
      return this.maxLinksReachedMessageEmitted || (this.emit("log", {
        module: "deepSearch",
        message: `Max links limit of ${this.maxLinks} reached. Stopping deep search.`
      }), this.maxLinksReachedMessageEmitted = !0), !0;
    if (!(this.isValidUrl(e) || this.checkForeignFeeds)) return !1;
    const o = this.queue.length();
    this.emit("log", {
      module: "deepSearch",
      url: e,
      depth: r,
      progress: { processed: this.visitedUrls.size, remaining: o }
    });
    try {
      const n = await _(e, "", this.instance || void 0);
      if (n && !this.feeds.some((i) => i.url === e)) {
        if (this.feeds.push({ url: e, type: n.type, title: n.title, feedTitle: n.title }), this.emit("log", {
          module: "deepSearch",
          url: e,
          depth: r + 1,
          feedCheck: { isFeed: !0, type: n.type }
        }), this.maxFeeds > 0 && this.feeds.length >= this.maxFeeds)
          return this.queue.kill(), this.emit("log", {
            module: "deepSearch",
            message: `Stopped due to reaching maximum feeds limit: ${this.feeds.length} feeds found (max ${this.maxFeeds} allowed).`
          }), !0;
      } else n || this.emit("log", { module: "deepSearch", url: e, depth: r + 1, feedCheck: { isFeed: !1 } });
    } catch (n) {
      const i = n instanceof Error ? n : new Error(String(n));
      return this.handleFetchError(e, r + 1, `Error checking feed: ${i.message}`);
    }
    return r + 1 <= this.maxDepth && this.isValidUrl(e) && this.queue.push({ url: e, depth: r + 1 }), !1;
  }
  /**
   * Crawls a single page, extracting links and checking for feeds
   * @param {CrawlTask} task - The task object containing the URL and depth
   * @returns {Promise<void>} A promise that resolves when the page has been crawled
   */
  async crawlPage(e) {
    let { url: r, depth: s } = e;
    if (!this.shouldCrawl(r, s)) return;
    this.visitedUrls.add(r);
    const o = await I(r, this.timeout);
    if (!o) {
      this.handleFetchError(r, s, "Failed to fetch URL - timeout or network error");
      return;
    }
    if (!o.ok) {
      this.handleFetchError(r, s, `HTTP ${o.status} ${o.statusText}`);
      return;
    }
    const n = await o.text(), { document: i } = H(n);
    for (const l of i.querySelectorAll("a"))
      try {
        const a = new URL(l.href, this.startUrl).href;
        if (await this.processLink(a, s)) break;
      } catch {
        continue;
      }
  }
}
async function Me(t, e = {}, r = null) {
  const s = new Re(
    t,
    e.depth || 3,
    5,
    e.maxLinks || 1e3,
    !!e.checkForeignFeeds,
    // Whether to check foreign domains for feeds
    e.maxErrors || 5,
    // Maximum number of errors before stopping
    e.maxFeeds || 0,
    // Maximum number of feeds before stopping (0 = no limit)
    r
    // Pass the FeedSeeker instance to the crawler
  );
  return s.timeout = (e.timeout || 5) * 1e3, r && r.emit && (s.on("start", (o) => r.emit("start", o)), s.on("log", (o) => r.emit("log", o)), s.on("error", (o) => r.emit("error", o)), s.on("end", (o) => r.emit("end", o))), s.start(), await new Promise((o) => {
    s.queue.drain(() => {
      s.emit("end", { module: "deepSearch", feeds: s.feeds, visitedUrls: s.visitedUrls.size }), o();
    });
  }), s.feeds;
}
class Ce extends y {
  /**
   * Creates a new FeedSeeker instance
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
   * const scout = new FeedSeeker('example.com');
   *
   * // With options
   * const scout = new FeedSeeker('https://blog.example.com', {
   *   maxFeeds: 5,
   *   timeout: 10,
   *   all: true
   * });
   */
  constructor(e, r = {}) {
    super(), e.includes("://") || (e = `https://${e}`);
    const s = new URL(e);
    this.site = s.pathname === "/" ? s.origin : s.href, this.options = r, this.initPromise = null;
  }
  /**
   * Initializes the FeedSeeker instance by fetching the site content and parsing the HTML
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
        const e = await I(this.site, this.options.timeout * 1e3);
        if (!e.ok) {
          this.emit("error", {
            module: "FeedSeeker",
            error: `HTTP error while fetching ${this.site}: ${e.status} ${e.statusText}`
          }), this.content = "", this.document = { querySelectorAll: () => [] }, this.emit("initialized");
          return;
        }
        this.content = await e.text();
        const { document: r } = H(this.content);
        this.document = r, this.emit("initialized");
      } catch (e) {
        let r = `Failed to fetch ${this.site}`;
        e.name === "AbortError" ? r += ": Request timed out" : (r += `: ${e.message}`, e.cause && (r += ` (cause: ${e.cause.code || e.cause.message})`)), this.emit("error", {
          module: "FeedSeeker",
          error: r,
          cause: e.cause
        }), this.content = "", this.document = { querySelectorAll: () => [] }, this.emit("initialized");
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
    return await this.initialize(), ce(this);
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
    return await this.initialize(), ge(this);
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
    return await this.initialize(), Le(this);
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
    return await this.initialize(), Me(this.site, this.options, this);
  }
  async startSearch() {
    const { deepsearchOnly: e, metasearch: r, blindsearch: s, anchorsonly: o, deepsearch: n, all: i, maxFeeds: l } = this.options;
    if (e)
      return this.deepSearch();
    if (r)
      return this.metaLinks();
    if (s)
      return this.blindSearch();
    if (o)
      return this.checkAllAnchors();
    let a = [];
    const c = [this.metaLinks, this.checkAllAnchors, this.blindSearch];
    for (const d of c) {
      const f = await d.call(this);
      if (f && f.length > 0 && (a = a.concat(f), !i && l > 0 && a.length >= l)) {
        a = a.slice(0, l);
        break;
      }
    }
    if (n && (!l || a.length < l)) {
      const d = await this.deepSearch();
      d && d.length > 0 && (a = a.concat(d), l > 0 && a.length > l && (a = a.slice(0, l)));
    }
    return this.emit("end", { module: "all", feeds: a }), a;
  }
}
const Fe = `___________               .____________              __                 
_   _____/___   ____   __| _/   _____/ ____   ____ |  | __ ___________ 
 |    __)/ __ _/ __  / __ |_____  _/ __ _/ __ |  |/ // __ _  __  |     \\  ___/  ___// /_/ |/          ___/  ___/|    <  ___/|  | /
 ___  / ___  >___  >____ /_______  /___  >___  >__|_ \\___  >__|   
     /      /     /     /       /     /     /     /    /       `;
let b = 0, E = [], O = !1;
function Ie(...t) {
  const e = t[0];
  b = 0, process.stdout.write(`Starting ${e.niceName} `);
}
function Oe(...t) {
  const e = t[0];
  O ? e.feeds.length === 0 ? process.stdout.write(u("yellow", ` No feeds found.
`)) : (process.stdout.write(u("green", ` Found ${e.feeds.length} feeds.
`)), console.log(JSON.stringify(e.feeds, null, 2)), E = E.concat(e.feeds)) : e.feeds.length === 0 ? process.stdout.write(u("yellow", ` No feeds found.
`)) : process.stdout.write(u("green", ` Found ${e.feeds.length} feeds.
`));
}
async function De(...t) {
  const e = t[0];
  if (e.module === "metalinks" && process.stdout.write("."), (e.module === "blindsearch" || e.module === "anchors") && "totalCount" in e && "totalEndpoints" in e) {
    b > 0 && process.stdout.write(`\x1B[${b}D`);
    const r = ` (${e.totalCount}/${e.totalEndpoints})`;
    process.stdout.write(r), b = r.length;
  }
  if (e.module === "deepSearch" && "url" in e && "depth" in e && "progress" in e) {
    const r = e.progress, s = r.processed || 0, o = r.remaining || 0, n = s + o;
    try {
      const i = new URL(e.url), l = i.hostname, a = i.pathname.length > 30 ? i.pathname.substring(0, 27) + "..." : i.pathname, c = `${l}${a}`;
      process.stdout.write(`  [depth:${e.depth} ${s}/${n}] ${c}
`);
    } catch {
      process.stdout.write(`  [depth:${e.depth} ${s}/${n}]
`);
    }
  }
}
function qe(t, e) {
  const r = new Ce(t, e);
  return r.site = t, r.options = e, r.initializationError = !1, r.on("start", Ie), r.on("log", De), r.on("end", Oe), r.on("error", (...s) => {
    const o = s[0];
    if (typeof o == "object" && o !== null && o.module === "FeedSeeker" && (r.initializationError = !0), o instanceof Error)
      console.error(u("red", `
Error for ${t}: ${o.message}`));
    else if (typeof o == "object" && o !== null) {
      const n = o, i = typeof n.error == "string" ? n.error : String(o);
      console.error(u("red", `
Error for ${t}: ${i}`));
    } else
      console.error(u("red", `
Error for ${t}: ${String(o)}`));
  }), r;
}
async function Pe(t, e) {
  t.includes("://") || (t = `https://${t}`);
  const r = qe(t, e);
  if (await r.initialize(), r.initializationError)
    return [];
  const s = [];
  return e.metasearch ? s.push(() => r.metaLinks()) : e.anchorsonly ? s.push(() => r.checkAllAnchors()) : e.blindsearch ? s.push(() => r.blindSearch()) : e.deepsearchOnly ? s.push(() => r.deepSearch()) : e.all ? s.push(
    () => r.metaLinks(),
    () => r.checkAllAnchors(),
    () => r.blindSearch(),
    () => r.deepSearch()
  ) : s.push(
    () => r.metaLinks(),
    () => r.checkAllAnchors(),
    () => r.blindSearch(),
    ...e.deepsearch ? [() => r.deepSearch()] : []
  ), await (async () => {
    if (e.all) {
      const i = [];
      for (const l of s) {
        const a = await l();
        a.length > 0 && i.push(...a);
      }
      return i;
    } else {
      for (const i of s) {
        const l = await i();
        if (l.length > 0) return l;
      }
      return [];
    }
  })();
}
console.log(`${Fe}
`);
const m = new J();
m.name("feed-seeker").description("Find RSS, Atom, and JSON feeds on any website with FeedSeeker.");
m.command("version").description("Get version").action(async () => {
  const e = (await import("./package-DbyUeqLl.js")).default;
  process.stdout.write(`${e.version}
`);
});
m.argument("[site]", "The website URL to search for feeds").option("-m, --metasearch", "Meta search only").option("-b, --blindsearch", "Blind search only").option("-a, --anchorsonly", "Anchors search only").option("-d, --deepsearch", "Enable deep search").option("--all", "Execute all strategies and combine results").option("--deepsearch-only", "Deep search only").option(
  "--depth <number>",
  "Depth of deep search",
  (t) => {
    const e = parseInt(t, 10);
    if (Number.isNaN(e) || e < 1)
      throw new Error("Depth must be a positive number (minimum 1)");
    return e;
  },
  3
).option(
  "--max-links <number>",
  "Maximum number of links to process during deep search",
  (t) => {
    const e = parseInt(t, 10);
    if (Number.isNaN(e) || e < 1)
      throw new Error("Max links must be a positive number (minimum 1)");
    return e;
  },
  1e3
).option(
  "--timeout <seconds>",
  "Timeout for fetch requests in seconds",
  (t) => {
    const e = parseInt(t, 10);
    if (Number.isNaN(e) || e < 1)
      throw new Error("Timeout must be a positive number (minimum 1 second)");
    return e;
  },
  5
).option("--keep-query-params", "Keep query parameters from the original URL when searching").option("--check-foreign-feeds", "Check if foreign domain URLs are feeds (but don't crawl them)").option(
  "--max-errors <number>",
  "Stop after a certain number of errors",
  (t) => {
    const e = parseInt(t, 10);
    if (Number.isNaN(e) || e < 0)
      throw new Error("Max errors must be a non-negative number");
    return e;
  },
  5
).option(
  "--max-feeds <number>",
  "Stop search after finding a certain number of feeds",
  (t) => {
    const e = parseInt(t, 10);
    if (Number.isNaN(e) || e < 0)
      throw new Error("Max feeds must be a non-negative number");
    return e;
  },
  0
).option(
  "--search-mode <mode>",
  "Search mode for blind search: fast (~25), standard (~100), or full (~350+)",
  "standard"
).description(`Find feeds for site
`).action(async (t, e) => {
  t || (m.help(), process.exit(0));
  try {
    e.all && (O = !0, E = []), m.feeds = await Pe(t, e);
  } catch (r) {
    e.displayErrors ? console.error(`
Error details:`, r) : console.error(u("red", `
Error: ${r.message}`)), process.exit(1);
  }
});
m.addOption(new B("--display-errors", "Display errors").hideHelp());
m.parseAsync(process.argv).then(() => {
  m.feeds !== void 0 && (O && E.length > 0 ? (console.log(u("yellow", `
=== All Strategies Complete ===`)), console.log(
    u("green", `Total: ${E.length} ${E.length === 1 ? "feed" : "feeds"} found from all strategies
`)
  ), console.log(JSON.stringify(E, null, 2))) : m.feeds.length > 0 && console.log(JSON.stringify(m.feeds, null, 2)));
}).catch((t) => {
  console.error(u("red", `
Error: ${t.message}`)), process.exit(1);
});
