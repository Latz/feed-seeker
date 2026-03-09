#!/usr/bin/env node
import { Command as Y, Option as G } from "commander";
import { parseHTML as N } from "linkedom";
import T from "tldts";
import J from "async";
import { styleText as f } from "node:util";
async function C(t, e = {}) {
  let r, s;
  if (typeof e == "number")
    r = e, s = {};
  else {
    const { timeout: m = 5e3, ...l } = e;
    r = m, s = l;
  }
  try {
    const m = new URL(t);
    if (!["http:", "https:"].includes(m.protocol))
      throw new Error(`Invalid URL protocol: ${m.protocol}. Only http: and https: are allowed.`);
  } catch (m) {
    throw m instanceof TypeError ? new Error(`Invalid URL: ${t}`) : m;
  }
  if (r <= 0)
    throw new TypeError(`Invalid timeout: ${r}. Timeout must be a positive number.`);
  if (!Number.isFinite(r))
    throw new TypeError(`Invalid timeout: ${r}. Timeout must be a finite number.`);
  const n = new AbortController(), i = setTimeout(() => n.abort(), r), a = {
    ...{
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
      "Accept-Encoding": "gzip, deflate, br",
      Connection: "keep-alive",
      "Upgrade-Insecure-Requests": "1",
      "Sec-CH-UA": '"Chromium";v="132", "Google Chrome";v="132", "Not-A.Brand";v="99"',
      "Sec-CH-UA-Mobile": "?0",
      "Sec-CH-UA-Platform": '"Windows"',
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "none",
      "Cache-Control": "max-age=0"
    },
    ...s.headers
  };
  try {
    const m = await fetch(t, {
      ...s,
      signal: n.signal,
      headers: a
    });
    return clearTimeout(i), m;
  } catch (m) {
    throw clearTimeout(i), m instanceof Error && m.name === "AbortError" ? new Error(`Request to ${t} timed out after ${r}ms`) : m;
  }
}
const h = {
  MAX_CONTENT_SIZE: 10 * 1024 * 1024,
  // 10MB maximum content size
  DEFAULT_TIMEOUT: 5,
  // Default timeout in seconds
  MAX_TIMEOUT: 60,
  // Maximum timeout in seconds (60 seconds)
  MIN_TIMEOUT: 1
  // Minimum timeout in seconds
}, $ = {
  TYPES: ["rich", "video", "photo", "link"],
  VERSIONS: ["1.0", "2.0"],
  URL_PATTERNS: ["/wp-json/oembed/", "/oembed"]
}, c = {
  // CDATA processing - matches XML CDATA sections: <![CDATA[content]]>
  // Used to extract clean text content from feeds that wrap content in CDATA
  CDATA: /<!\[CDATA\[(.*?)\]\]>/g,
  // RSS feed detection patterns
  RSS: {
    // Matches RSS root element with version attribute: <rss version="2.0">
    // [^>]* matches any attributes before version, \s+ ensures whitespace before version
    VERSION: /<rss\s[^>]*version\s*=\s*["'][\d.]+["']/i,
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
    FEED_START: /<feed[\s>]/i,
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
  if (t.length > h.MAX_CONTENT_SIZE)
    throw new Error(
      `Content too large: ${t.length} bytes. Maximum allowed: ${h.MAX_CONTENT_SIZE} bytes.`
    );
}
function Z(t) {
  return t == null ? h.DEFAULT_TIMEOUT : !Number.isFinite(t) || t < h.MIN_TIMEOUT ? (console.warn(
    `Invalid timeout value ${t}. Using minimum: ${h.MIN_TIMEOUT} seconds.`
  ), h.MIN_TIMEOUT) : t > h.MAX_TIMEOUT ? (console.warn(
    `Timeout value ${t} exceeds maximum. Clamping to ${h.MAX_TIMEOUT} seconds.`
  ), h.MAX_TIMEOUT) : Math.floor(t);
}
function ee(t) {
  return $.URL_PATTERNS.some((e) => t.includes(e));
}
function te(t) {
  return !!(t.type && $.TYPES.includes(t.type) && $.VERSIONS.includes(t.version) || t.type && t.version && t.html);
}
function F(t) {
  return t.replaceAll(c.CDATA, "$1");
}
function _(t) {
  return t ? t.replaceAll(/\s+/g, " ").trim() : null;
}
async function g(t, e = "", r) {
  if (K(t), ee(t))
    return null;
  if (!e) {
    if (!r)
      throw new Error("Instance parameter is required when content is not provided");
    const i = Z(r.options.timeout) * 1e3, o = await C(t, i);
    if (!o.ok)
      throw new Error(`Failed to fetch ${t}: ${o.status} ${o.statusText}`);
    e = await o.text();
  }
  return Q(e), se(e) || ne(e) || ie(e) || null;
}
function re(t) {
  const e = c.RSS.CHANNEL_CONTENT.exec(t);
  if (e) {
    const n = e[1], i = c.RSS.TITLE.exec(n);
    return i ? _(F(i[1])) : null;
  }
  const r = c.RSS.TITLE.exec(t);
  return r ? _(F(r[1])) : null;
}
function se(t) {
  if (c.RSS.VERSION.test(t)) {
    const e = c.RSS.CHANNEL.test(t), r = c.RSS.ITEM.test(t), s = c.RSS.DESCRIPTION.test(t);
    if (e && s && (r || c.RSS.CHANNEL_END.test(t)))
      return { type: "rss", title: re(t) };
  }
  return null;
}
function ne(t) {
  const e = c.ATOM.NAMESPACE_XMLNS.test(t) || c.ATOM.NAMESPACE_XMLNS_ATOM.test(t) || c.ATOM.NAMESPACE_ATOM_PREFIX.test(t);
  if (c.ATOM.FEED_START.test(t) && e) {
    const r = c.ATOM.ENTRY.test(t), s = c.ATOM.TITLE_TAG.test(t);
    if (r && s) {
      const n = c.ATOM.TITLE_CONTENT.exec(t);
      return { type: "atom", title: n ? _(F(n[1])) : null };
    }
  }
  return null;
}
function ie(t) {
  try {
    const e = JSON.parse(t);
    if (te(e))
      return null;
    if (e.version && typeof e.version == "string" && e.version.includes("jsonfeed") || e.items && Array.isArray(e.items) || e.feed_url) {
      const r = e.title || e.name || null;
      return { type: "json", title: typeof r == "string" ? _(r) : null };
    }
    return null;
  } catch {
    return null;
  }
}
const oe = ["feed+json", "rss+xml", "atom+xml", "xml", "rdf+xml"], me = ["/rss", "/feed", "/atom", ".rss", ".atom", ".xml", ".json"];
function ae(t) {
  return t ? t.replaceAll(/\s+/g, " ").trim() : null;
}
async function L(t, e, r, s, n = 5) {
  const i = e.options?.maxFeeds || 0;
  for (let o = 0; o < t.length; o += n) {
    if (i > 0 && r.length >= i)
      return !0;
    const a = t.slice(o, o + n);
    if ((await Promise.allSettled(
      a.map((x) => ce(x, e, r, s))
    )).some(
      (x) => x.status === "fulfilled" && x.value === !0
    ))
      return !0;
  }
  return !1;
}
function le(t, e) {
  if (!t.href) return null;
  try {
    return new URL(t.href, e.site).href;
  } catch (r) {
    if (e.options?.showErrors) {
      const s = r instanceof Error ? r : new Error(String(r));
      e.emit("error", {
        module: "metalinks",
        error: s.message,
        explanation: `Invalid URL found in meta link: ${t.href}. Unable to construct a valid URL.`,
        suggestion: "Check the meta link href attribute for malformed URLs."
      });
    }
    return null;
  }
}
function xe(t, e, r, s, n, i) {
  s.push({ url: t, title: ae(e.title), type: r.type, feedTitle: r.title }), n.add(t);
  const o = i.options?.maxFeeds || 0;
  return o > 0 && s.length >= o ? (i.emit("log", {
    module: "metalinks",
    message: `Stopped due to reaching maximum feeds limit: ${s.length} feeds found (max ${o} allowed).`
  }), !0) : !1;
}
async function ce(t, e, r, s) {
  const n = le(t, e);
  if (!n || s.has(n)) return !1;
  e.emit("log", { module: "metalinks", message: `Checking feed: ${n}` });
  try {
    const i = await g(n, "", e);
    if (i)
      return xe(n, t, i, r, s, e);
  } catch (i) {
    if (e.options?.showErrors) {
      const o = i instanceof Error ? i : new Error(String(i));
      e.emit("error", {
        module: "metalinks",
        error: o.message,
        explanation: "An error occurred while trying to fetch and validate a feed URL found in a meta link tag. This could be due to network issues, server problems, or invalid feed content.",
        suggestion: "Check if the meta link URL is accessible and returns valid feed content. The search will continue with other meta links."
      });
    }
  }
  return !1;
}
async function de(t) {
  t.emit("start", { module: "metalinks", niceName: "Meta links" });
  const e = [], r = /* @__PURE__ */ new Set();
  try {
    const s = oe.map((l) => `link[type="application/${l}"]`).join(", "), n = Array.from(t.document.querySelectorAll(s));
    if (await L(n, t, e, r))
      return e;
    const o = Array.from(
      t.document.querySelectorAll('link[rel="alternate"][type*="rss"], link[rel="alternate"][type*="xml"], link[rel="alternate"][type*="atom"], link[rel="alternate"][type*="json"]')
    );
    if (await L(o, t, e, r))
      return e;
    const m = Array.from(
      t.document.querySelectorAll('link[rel="alternate"]')
    ).filter(
      (l) => l.href && me.some((x) => l.href.toLowerCase().includes(x))
    );
    return await L(m, t, e, r), e;
  } finally {
    t.emit("end", { module: "metalinks", feeds: e });
  }
}
function S(t, e) {
  try {
    return new URL(t, e);
  } catch {
    return null;
  }
}
function Be(t) {
  const e = S(t);
  return e ? e.protocol === "http:" || e.protocol === "https:" : !1;
}
function fe(t) {
  return S(t) ? !1 : !t.includes("://");
}
function P(t, e) {
  const r = S(t);
  if (!r || r.hostname === e.hostname)
    return !0;
  const s = [
    // Google FeedBurner (most common feed hosting service)
    "feedburner.com",
    "feeds.feedburner.com",
    "feedproxy.google.com",
    "feeds2.feedburner.com"
  ];
  return s.includes(r.hostname) || s.some((n) => r.hostname.endsWith("." + n));
}
function he(t) {
  if (t.options.followMetaRefresh && t.document && typeof t.document.querySelector == "function") {
    const e = t.document.querySelector('meta[http-equiv="refresh"]')?.getAttribute("content");
    if (e) {
      const r = /url=(.*)/i.exec(e);
      if (r?.[1]) {
        const s = new URL(r[1], t.site).href;
        return t.emit("log", {
          module: "anchors",
          message: `Following meta refresh redirect to ${s}`
        }), j({ ...t, site: s });
      }
    }
  }
  return null;
}
function z(t, e, r) {
  if (!t.href)
    return null;
  if (Be(t.href))
    return t.href;
  if (fe(t.href)) {
    const s = S(t.href, e);
    return s ? s.href : (r.emit("error", {
      module: "anchors",
      error: `Invalid relative URL: ${t.href}`,
      explanation: "A relative URL found in an anchor tag could not be resolved against the base URL. This may be due to malformed relative path syntax.",
      suggestion: 'Check the anchor href attribute for proper relative path format (e.g., "./feed.xml", "../rss.xml", or "/feed").'
    }), null);
  }
  return null;
}
function ue(t) {
  const e = /https?:\/\/[^\s"'<>)]+/gi, r = t.match(e);
  if (!r)
    return [];
  const s = /* @__PURE__ */ new Set();
  for (const n of r) {
    let i = n;
    for (; i.length > 0 && ".,;:!?".includes(i.at(-1)); )
      i = i.slice(0, -1);
    s.add(i);
  }
  return Array.from(s);
}
async function pe(t, e) {
  const { instance: r, baseUrl: s, feedUrls: n } = e, i = z(t, s, r);
  if (i)
    try {
      const o = await g(i, "", r);
      o && n.push({
        url: i,
        title: t.textContent?.trim() || null,
        type: o.type,
        feedTitle: o.title
      });
    } catch (o) {
      if (r.options?.showErrors) {
        const a = o instanceof Error ? o : new Error(String(o));
        r.emit("error", {
          module: "anchors",
          error: `Error checking feed at ${i}: ${a.message}`,
          explanation: "An error occurred while trying to fetch and validate a potential feed URL found in an anchor tag. This could be due to network timeouts, server errors, or invalid feed content.",
          suggestion: "Check if the URL is accessible and returns valid feed content. Network connectivity issues or server problems may cause this error."
        });
      }
    }
}
function q(t, e, r) {
  t.emit("log", {
    module: "anchors",
    message: `Stopped due to reaching maximum feeds limit: ${e} feeds found (max ${r} allowed).`
  });
}
async function ge(t, e, r, s) {
  let n = 0;
  for (let i = 0; i < t.length; i += r) {
    if (s > 0 && e.feedUrls.length >= s) {
      q(e.instance, e.feedUrls.length, s);
      break;
    }
    const o = t.slice(i, i + r);
    await Promise.allSettled(
      o.map(async (a) => {
        s > 0 && e.feedUrls.length >= s || (n++, e.instance.emit("log", { module: "anchors", totalCount: n, totalEndpoints: t.length }), await pe(a, e));
      })
    );
  }
  return n;
}
async function we(t, e, r, s, n, i) {
  const o = t.instance.document.body?.innerHTML || "", a = ue(o), m = new Set(t.feedUrls.map((d) => d.url)), l = [];
  for (const d of a)
    !m.has(d) && P(d, e) && (l.push(d), m.add(d));
  let x = s;
  const w = r + l.length;
  for (let d = 0; d < l.length; d += n) {
    if (i > 0 && t.feedUrls.length >= i) {
      q(t.instance, t.feedUrls.length, i);
      break;
    }
    const b = l.slice(d, d + n);
    await Promise.allSettled(
      b.map(async (u) => {
        if (!(i > 0 && t.feedUrls.length >= i)) {
          t.instance.emit("log", { module: "anchors", totalCount: x++, totalEndpoints: w });
          try {
            const B = await g(u, "", t.instance);
            B && t.feedUrls.push({ url: u, title: null, type: B.type, feedTitle: B.title });
          } catch (B) {
            if (t.instance.options?.showErrors) {
              const V = B instanceof Error ? B : new Error(String(B));
              t.instance.emit("error", {
                module: "anchors",
                error: `Error checking feed at ${u}: ${V.message}`,
                explanation: "An error occurred while trying to fetch and validate a potential feed URL found in page text. This could be due to network timeouts, server errors, or invalid feed content.",
                suggestion: "Check if the URL is accessible and returns valid feed content. Network connectivity issues or server problems may cause this error."
              });
            }
          }
        }
      })
    );
  }
}
async function j(t) {
  const e = he(t);
  if (e)
    return e;
  const r = new URL(t.site), s = t.document.querySelectorAll("a"), n = [];
  for (const l of s) {
    const x = z(l, r, t);
    x && P(x, r) && n.push(l);
  }
  const i = t.options?.maxFeeds || 0, o = t.options?.concurrency ?? 3, a = { instance: t, baseUrl: r, feedUrls: [] }, m = await ge(n, a, o, i);
  return (i === 0 || a.feedUrls.length < i) && await we(a, r, n.length, m + 1, o, i), a.feedUrls;
}
async function ye(t) {
  t.emit("start", {
    module: "anchors",
    niceName: "Check all anchors"
  });
  const e = await j(t);
  return t.emit("end", { module: "anchors", feeds: e }), e;
}
const Ee = 0, k = 0, _e = 3, A = "standard", H = 2083, v = 10, U = 1, I = 1e4, M = 6e4, y = [
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
];
let O = null;
function R() {
  return O ??= [
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
  ], O;
}
let D = null;
function Se() {
  return D ??= [
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
  ], D;
}
function be(t) {
  switch (t) {
    case "fast":
      return y;
    case "standard":
      return [...y, ...R()];
    case "exhaustive":
    case "full":
      return [...y, ...R(), ...Se()];
    default:
      return [...y, ...R()];
  }
}
function Te(t) {
  return t ? ["fast", "standard", "exhaustive", "full"].includes(t) ? t : (console.warn(`Invalid search mode "${t}". Falling back to "${A}".`), A) : A;
}
function Le(t) {
  return t == null ? _e : !Number.isFinite(t) || t < U ? (console.warn(`Invalid concurrency value ${t}. Using minimum: ${U}.`), U) : t > v ? (console.warn(
    `Concurrency value ${t} exceeds maximum. Clamping to ${v}.`
  ), v) : Math.floor(t);
}
function ke(t) {
  return t == null ? k : !Number.isFinite(t) || t < 0 ? (console.warn(`Invalid request delay ${t}. Using default: ${k}.`), k) : t > M ? (console.warn(`Request delay ${t}ms exceeds maximum. Clamping to ${M}ms.`), M) : Math.floor(t);
}
function W(t) {
  return t.length <= H;
}
function Ae(t) {
  let e;
  try {
    e = new URL(t);
  } catch {
    throw new Error(`Invalid URL provided to blindSearch: ${t}`);
  }
  if (!W(t))
    throw new Error(
      `URL too long (${t.length} chars). Maximum allowed: ${H} characters.`
    );
  if (!["http:", "https:"].includes(e.protocol))
    throw new Error(`Invalid protocol "${e.protocol}". Only http: and https: are allowed.`);
  return e;
}
function ve(t, e, r, s) {
  for (const n of e) {
    if (s.length >= I)
      return console.warn(
        `URL generation limit reached (${I} URLs). Stopping to prevent resource exhaustion.`
      ), !1;
    const i = r ? `${t}/${n}${r}` : `${t}/${n}`;
    W(i) ? s.push(i) : console.warn(`Skipping URL (too long): ${i.substring(0, 100)}...`);
  }
  return !0;
}
function Ue(t, e, r) {
  const s = Ae(t), n = s.origin, i = e ? s.search : "";
  let o = t;
  const a = [];
  for (; o.length >= n.length; ) {
    const m = o.endsWith("/") ? o.slice(0, -1) : o;
    if (!ve(m, r, i, a)) break;
    o = o.slice(0, o.lastIndexOf("/"));
  }
  return a;
}
function Me(t, e, r, s, n) {
  return t.type === "rss" ? s = !0 : t.type === "atom" && (n = !0), r.push({
    url: e,
    title: null,
    // No link element title in blind search (unlike metaLinks)
    type: t.type,
    feedTitle: t.title
    // Actual feed title from parsing the feed
  }), { rssFound: s, atomFound: n };
}
function Re(t, e, r, s, n) {
  return t >= e ? !1 : n ? !0 : !(r && s);
}
async function Ne(t, e) {
  const r = Te(t.options?.searchMode), s = be(r), n = Ue(
    t.site,
    t.options?.keepQueryParams || !1,
    s
  );
  t.emit("start", {
    module: "blindsearch",
    niceName: "Blind search",
    endpointUrls: n.length
  });
  const i = t.options?.all || !1, o = t.options?.maxFeeds ?? Ee, a = Le(t.options?.concurrency), m = await $e(
    n,
    i,
    o,
    a,
    t
  );
  return t.emit("end", { module: "blindsearch", feeds: m.feeds }), m.feeds;
}
async function $e(t, e, r, s, n, i) {
  const o = [], a = /* @__PURE__ */ new Set();
  let m = !1, l = !1, x = 0;
  for (; Re(x, t.length, m, l, e); ) {
    if (r > 0 && o.length >= r) {
      await X(n, o, r);
      break;
    }
    const w = Math.min(s, t.length - x), d = t.slice(x, x + w), b = await Promise.allSettled(
      d.map((B) => Ce(B, n, a, o, m, l))
    );
    ({ rssFound: m, atomFound: l, i: x } = await Fe(b, o, m, l, { maxFeeds: r, totalUrls: t.length, i: x }, n)), x += w, n.emit("log", {
      module: "blindsearch",
      totalEndpoints: t.length,
      totalCount: x,
      feedsFound: o.length
    });
    const u = ke(n.options?.requestDelay);
    u > 0 && x < t.length && await new Promise((B) => setTimeout(B, u));
  }
  return { feeds: o, rssFound: m, atomFound: l };
}
async function Fe(t, e, r, s, n, i) {
  let { i: o } = n;
  const { maxFeeds: a, totalUrls: m } = n;
  for (const l of t)
    if (l.status === "fulfilled" && l.value.found && (r = l.value.rssFound, s = l.value.atomFound, a > 0 && e.length >= a)) {
      await X(i, e, a), o = m;
      break;
    }
  return { rssFound: r, atomFound: s, i: o };
}
async function Ce(t, e, r, s, n, i) {
  if (r.has(t))
    return { found: !1, rssFound: n, atomFound: i };
  r.add(t);
  try {
    const o = await g(t, "", e);
    if (o) {
      const a = Me(o, t, s, n, i);
      return n = a.rssFound, i = a.atomFound, { found: !0, rssFound: n, atomFound: i };
    }
  } catch (o) {
    const a = o instanceof Error ? o : new Error(String(o));
    await Ie(e, t, a);
  }
  return { found: !1, rssFound: n, atomFound: i };
}
async function X(t, e, r) {
  t.emit("log", {
    module: "blindsearch",
    message: `Stopped due to reaching maximum feeds limit: ${e.length} feeds found (max ${r} allowed).`
  });
}
async function Ie(t, e, r) {
  t.options?.showErrors && t.emit("error", {
    module: "blindsearch",
    error: `Error fetching ${e}: ${r.message}`,
    explanation: "An error occurred while trying to fetch a potential feed URL during blind search. This could be due to network timeouts, server errors, 404 not found, or invalid content.",
    suggestion: "This is normal during blind search as many URLs are tested. The search will continue with other potential feed endpoints."
  });
}
class p {
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
  #n;
  /**
   * Default max listeners for all instances
   * @private
   */
  static #i = 10;
  /**
   * Creates a new EventEmitter instance
   * @param {EventEmitterOptions} options - Configuration options
   */
  constructor(e = {}) {
    this.#t = e.maxListeners ?? p.#i, this.#n = e.captureAsyncErrors ?? !0;
  }
  /**
   * Sets the default maximum number of listeners for all new EventEmitter instances
   * @param {number} n - The maximum number of listeners (0 = unlimited)
   */
  static setDefaultMaxListeners(e) {
    if (typeof e != "number" || e < 0 || !Number.isInteger(e))
      throw new TypeError("Max listeners must be a non-negative integer");
    p.#i = e;
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
  #o(e) {
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
  #m(e) {
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
      throw console.error("Error in error event listener:", this.#m(e)), e;
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
    return s ? s.add(r) : this.#e.set(e, /* @__PURE__ */ new Set([r])), this.#o(e), this;
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
    if (s) {
      const n = /* @__PURE__ */ new Set([r, ...s]);
      this.#e.set(e, n);
    } else
      this.#e.set(e, /* @__PURE__ */ new Set([r]));
    return this.#o(e), this;
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
    const s = ((...n) => {
      this.off(e, s), r(...n);
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
    const s = ((...n) => {
      this.off(e, s), r(...n);
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
        const n = r[0];
        if (n instanceof Error)
          throw n;
        {
          const i = this.#m(n);
          throw new Error(`Unhandled error event: ${i}`);
        }
      }
      return !1;
    }
    return [...s].forEach((n) => {
      try {
        const i = n(...r);
        this.#n && i instanceof Promise && i.catch((o) => {
          this.#a(o, e);
        });
      } catch (i) {
        this.#a(i, e);
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
    return s ? ([...s].forEach((n) => {
      (n === r || n.originalListener === r) && s.delete(n);
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
const { queue: Oe } = J;
function De(t) {
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
class Pe extends p {
  constructor(e, r = {}) {
    const {
      maxDepth: s = 3,
      concurrency: n = 5,
      maxLinks: i = 1e3,
      checkForeignFeeds: o = !1,
      maxErrors: a = 5,
      maxFeeds: m = 0,
      instance: l = null
    } = r;
    super();
    try {
      const x = new URL(e);
      this.startUrl = x.href;
    } catch {
      throw new Error(`Invalid start URL: ${e}`);
    }
    this.maxDepth = s, this.concurrency = n, this.maxLinks = i, this.mainDomain = T.getDomain(this.startUrl), this.checkForeignFeeds = o, this.maxErrors = a, this.maxFeeds = m, this.errorCount = 0, this.instance = l, this.queue = Oe(this.crawlPage.bind(this), this.concurrency), this.visitedUrls = /* @__PURE__ */ new Set(), this.timeout = 5e3, this.maxLinksReachedMessageEmitted = !1, this.feeds = [], this.queue.error((x) => {
      this.emit("error", {
        module: "deepSearch",
        error: `Async error: ${x}`,
        explanation: "An error occurred in the async queue while processing a crawling task. This could be due to network issues, invalid URLs, or server problems.",
        suggestion: "Check network connectivity and ensure the target website is accessible. The crawler will continue with other URLs."
      }), this.incrementError();
    });
  }
  /**
   * Increments the error counter and kills the queue if the limit is reached.
   * @returns {boolean} True if the error limit has been reached, false otherwise.
   * @private
   */
  incrementError() {
    return this.errorCount >= this.maxErrors ? !0 : (this.errorCount++, this.errorCount >= this.maxErrors ? (this.queue.kill(), this.emit("log", {
      module: "deepSearch",
      message: `Stopped due to ${this.errorCount} errors (max ${this.maxErrors} allowed).`
    }), !0) : !1);
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
      const r = T.getDomain(e) === T.getDomain(this.startUrl), s = !De(e);
      return r && s;
    } catch {
      return this.emit("error", {
        module: "deepSearch",
        error: `Invalid URL: ${e}`,
        explanation: "A URL encountered during crawling could not be parsed or validated. This may be due to malformed URL syntax or unsupported URL schemes.",
        suggestion: "This is usually caused by broken links on the website. The crawler will skip this URL and continue with others."
      }), this.incrementError(), !1;
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
    return this.emit("log", { module: "deepSearch", url: e, depth: r, error: s }), this.incrementError();
  }
  /**
   * Processes a single link found on a page, checking if it's a feed.
   * @param {string} url - The absolute URL of the link to process.
   * @param {number} depth - The current crawl depth.
   * @returns {Promise<boolean>} True if the crawl should stop, false otherwise.
   * @private
   */
  /**
   * Records a found feed and returns true if the max feeds limit has been reached.
   */
  recordFeed(e, r, s) {
    return this.feeds.some((n) => n.url === e) ? !1 : (this.feeds.push({ url: e, type: s.type, title: s.title, feedTitle: s.title }), this.emit("log", { module: "deepSearch", url: e, depth: r + 1, feedCheck: { isFeed: !0, type: s.type } }), this.maxFeeds > 0 && this.feeds.length >= this.maxFeeds ? (this.queue.kill(), this.emit("log", {
      module: "deepSearch",
      message: `Stopped due to reaching maximum feeds limit: ${this.feeds.length} feeds found (max ${this.maxFeeds} allowed).`
    }), !0) : !1);
  }
  async processLink(e, r) {
    if (this.visitedUrls.has(e)) return !1;
    if (this.visitedUrls.size >= this.maxLinks)
      return this.maxLinksReachedMessageEmitted || (this.emit("log", { module: "deepSearch", message: `Max links limit of ${this.maxLinks} reached. Stopping deep search.` }), this.maxLinksReachedMessageEmitted = !0), !0;
    if (!this.isValidUrl(e) && !this.checkForeignFeeds) return !1;
    this.emit("log", {
      module: "deepSearch",
      url: e,
      depth: r,
      progress: { processed: this.visitedUrls.size, remaining: this.queue.length() }
    });
    try {
      const s = await g(e, "", this.instance || void 0);
      if (s) {
        if (this.recordFeed(e, r, s)) return !0;
      } else
        this.emit("log", { module: "deepSearch", url: e, depth: r + 1, feedCheck: { isFeed: !1 } });
    } catch (s) {
      const n = s instanceof Error ? s : new Error(String(s));
      return this.handleFetchError(e, r + 1, `Error checking feed: ${n.message}`);
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
    const n = await C(r, this.timeout);
    if (!n) {
      this.handleFetchError(r, s, "Failed to fetch URL - timeout or network error");
      return;
    }
    if (!n.ok) {
      this.handleFetchError(r, s, `HTTP ${n.status} ${n.statusText}`);
      return;
    }
    const i = await n.text(), { document: o } = N(i);
    for (const a of o.querySelectorAll("a"))
      try {
        const m = new URL(a.href, this.startUrl).href;
        if (await this.processLink(m, s)) break;
      } catch {
        continue;
      }
  }
}
async function ze(t, e = {}, r = null) {
  const s = new Pe(t, {
    maxDepth: e.depth || 3,
    maxLinks: e.maxLinks || 1e3,
    checkForeignFeeds: !!e.checkForeignFeeds,
    maxErrors: e.maxErrors || 5,
    maxFeeds: e.maxFeeds || 0,
    instance: r
  });
  return s.timeout = (e.timeout || 5) * 1e3, r?.emit && (s.on("start", (n) => r.emit("start", n)), s.on("log", (n) => r.emit("log", n)), s.on("error", (n) => r.emit("error", n)), s.on("end", (n) => r.emit("end", n))), s.start(), await new Promise((n) => {
    s.queue.drain(() => {
      s.emit("end", { module: "deepSearch", feeds: s.feeds, visitedUrls: s.visitedUrls.size }), n();
    });
  }), s.feeds;
}
class qe extends p {
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
  constructor(e, r = {}) {
    super(), this.initStatus = "pending", this.rawSite = e;
    let s = e;
    s.includes("://") || (s = `https://${s}`);
    try {
      const n = new URL(s);
      this.site = n.pathname === "/" ? n.origin : n.href;
    } catch {
      this.site = s;
    }
    this.options = {
      timeout: 5,
      // Default timeout of 5 seconds
      ...r
    }, this.initPromise = null;
  }
  /**
   * Gets the current initialization status
   * @returns {InitStatus} The current status: 'pending', 'success', or 'error'
   * @example
   * const seeker = new FeedSeeker('https://example.com');
   * await seeker.initialize();
   * if (seeker.getInitStatus() === 'error') {
   *   console.error('Failed to initialize');
   * }
   */
  getInitStatus() {
    return this.initStatus;
  }
  /**
   * Checks if initialization was successful
   * @returns {boolean} True if initialization succeeded, false otherwise
   * @example
   * const seeker = new FeedSeeker('https://example.com');
   * await seeker.initialize();
   * if (seeker.isInitialized()) {
   *   const feeds = await seeker.metaLinks();
   * }
   */
  isInitialized() {
    return this.initStatus === "success";
  }
  /**
   * Creates an empty document for error states
   * This ensures all Document methods are available even when initialization fails
   * @returns {Document} An empty but valid Document object
   * @private
   */
  createEmptyDocument() {
    const { document: e } = N("<!DOCTYPE html><html><head></head><body></body></html>");
    return e;
  }
  /**
   * Sets the instance to an empty state (used when initialization fails)
   * @private
   */
  setEmptyState() {
    this.content = "", this.document = this.createEmptyDocument();
  }
  /**
   * Handles initialization failure by setting error state and emitting events
   * @param {string} errorMessage - The error message to emit
   * @param {unknown} [cause] - Optional error cause
   * @private
   */
  handleInitError(e, r) {
    this.initStatus = "error", this.emit("error", {
      module: "FeedSeeker",
      error: e,
      ...r !== void 0 && { cause: r }
    }), this.setEmptyState(), this.emit("initialized");
  }
  /**
   * Initializes the FeedSeeker instance by validating the URL and fetching the site content and parsing the HTML
   * This method is called automatically by other methods and caches the result
   * Emits 'error' events if validation or fetching fails
   * Sets initStatus to 'success' or 'error' based on the outcome
   * @returns {Promise<void>} A promise that resolves when the initialization is complete
   * @private
   * @example
   * await seeker.initialize(); // Usually called automatically
   * if (seeker.getInitStatus() === 'error') {
   *   console.error('Initialization failed');
   * }
   */
  async initialize() {
    return this.initPromise ??= (async () => {
      try {
        if (!this.rawSite || typeof this.rawSite != "string") {
          this.handleInitError("Site parameter must be a non-empty string");
          return;
        }
        try {
          new URL(this.site);
        } catch {
          this.handleInitError(`Invalid URL: ${this.site}`);
          return;
        }
        const e = (this.options.timeout ?? 5) * 1e3, r = await C(this.site, e);
        if (!r.ok) {
          this.content = "", this.document = this.createEmptyDocument(), this.initStatus = "success", this.emit("initialized");
          return;
        }
        this.content = await r.text();
        const { document: s } = N(this.content);
        this.document = s, this.initStatus = "success", this.emit("initialized");
      } catch (e) {
        const r = e instanceof Error ? e : new Error(String(e)), s = this.buildErrorMessage(r), n = r.cause;
        this.handleInitError(s, n);
      }
    })(), this.initPromise;
  }
  /**
   * Builds an error message from an error object
   * @param {Error} err - The error to build a message from
   * @returns {string} The formatted error message
   * @private
   */
  buildErrorMessage(e) {
    let r = `Failed to fetch ${this.site}`;
    if (e.name === "AbortError")
      return r + ": Request timed out";
    r += `: ${e.message}`;
    const s = e.cause;
    return s && (r += ` (cause: ${s.code || s.message})`), r;
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
    return await this.initialize(), de(this);
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
    return await this.initialize(), ye(this);
  }
  /**
   * Performs a blind search for common feed endpoints
   * This method tries common feed paths like /feed, /rss, /atom.xml, etc.
   * @returns {Promise<Feed[]>} A promise that resolves to an array of found feed objects
   * @throws {Error} When network errors occur during endpoint testing
   * @example
   * const feeds = await seeker.blindSearch();
   * console.log(feeds); // [{ url: '...', type: 'rss', title: '...' }]
   */
  async blindSearch() {
    return await this.initialize(), Ne(this);
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
    return await this.initialize(), ze(this.site, this.options, this);
  }
  /**
   * Starts a comprehensive feed search using multiple strategies
   * Automatically deduplicates feeds found by multiple strategies
   * @returns {Promise<Feed[]>} A promise that resolves to an array of unique found feed objects
   * @example
   * const seeker = new FeedSeeker('https://example.com', { maxFeeds: 10 });
   * const feeds = await seeker.startSearch();
   * console.log('All feeds:', feeds);
   */
  async startSearch() {
    const e = await this.handleSingleStrategyMode();
    if (e)
      return e;
    const r = /* @__PURE__ */ new Map();
    await this.collectFeedsFromStrategies(r), await this.handleDeepSearch(r);
    const s = this.getFeedsWithLimit(r);
    return this.emit("end", { module: "all", feeds: s }), s;
  }
  /**
   * Handles single strategy search modes (deepsearchOnly, metasearch, blindsearch, anchorsonly)
   * @returns {Promise<Feed[] | null>} Results if a single strategy mode is active, null otherwise
   * @private
   */
  async handleSingleStrategyMode() {
    const { deepsearchOnly: e, metasearch: r, blindsearch: s, anchorsonly: n } = this.options;
    return e ? this.deepSearch() : r ? this.metaLinks() : s ? this.blindSearch() : n ? this.checkAllAnchors() : null;
  }
  /**
   * Collects feeds from multiple search strategies
   * @param {Map<string, Feed>} feedMap - Map to store deduplicated feeds
   * @returns {Promise<void>}
   * @private
   */
  async collectFeedsFromStrategies(e) {
    const r = [this.metaLinks, this.checkAllAnchors, this.blindSearch];
    for (const s of r) {
      const n = await s.call(this);
      if (this.addFeedsToMap(e, n), this.hasReachedLimit(e))
        break;
    }
  }
  /**
   * Adds feeds to the feed map, deduplicating by URL
   * @param {Map<string, Feed>} feedMap - Map to store feeds
   * @param {Feed[]} feeds - Feeds to add
   * @private
   */
  addFeedsToMap(e, r) {
    for (const s of r ?? [])
      e.has(s.url) || e.set(s.url, s);
  }
  /**
   * Checks if the feed limit has been reached
   * @param {Map<string, Feed>} feedMap - Current feed map
   * @returns {boolean} True if limit is reached, false otherwise
   * @private
   */
  hasReachedLimit(e) {
    const { all: r, maxFeeds: s } = this.options;
    return !r && s !== void 0 && s > 0 && e.size >= s;
  }
  /**
   * Handles deep search if enabled
   * @param {Map<string, Feed>} feedMap - Map to store feeds
   * @private
   */
  async handleDeepSearch(e) {
    const { deepsearch: r, maxFeeds: s } = this.options;
    if (!r || s && e.size >= s)
      return;
    const n = await this.deepSearch();
    for (const i of n ?? [])
      if (e.has(i.url) || e.set(i.url, i), this.hasReachedLimit(e))
        break;
  }
  /**
   * Gets feeds from the map with limit applied
   * @param {Map<string, Feed>} feedMap - Map containing feeds
   * @returns {Feed[]} Feeds with limit applied
   * @private
   */
  getFeedsWithLimit(e) {
    const r = Array.from(e.values()), { maxFeeds: s } = this.options;
    return s !== void 0 && s > 0 && r.length > s ? r.slice(0, s) : r;
  }
}
const je = `\x1B[38;5;39m_\x1B[39m\x1B[38;5;39m_\x1B[39m\x1B[38;5;39m_\x1B[39m\x1B[38;5;39m_\x1B[39m\x1B[38;5;39m_\x1B[39m\x1B[38;5;39m_\x1B[39m\x1B[38;5;39m_\x1B[39m\x1B[38;5;39m_\x1B[39m\x1B[38;5;39m_\x1B[39m\x1B[38;5;38m_\x1B[39m\x1B[38;5;44m_\x1B[39m\x1B[38;5;44m_\x1B[39m\x1B[38;5;44m \x1B[39m\x1B[38;5;44m \x1B[39m\x1B[38;5;44m \x1B[39m\x1B[38;5;44m \x1B[39m\x1B[38;5;44m \x1B[39m\x1B[38;5;44m \x1B[39m\x1B[38;5;44m \x1B[39m\x1B[38;5;44m \x1B[39m\x1B[38;5;44m \x1B[39m\x1B[38;5;43m \x1B[39m\x1B[38;5;49m \x1B[39m\x1B[38;5;49m \x1B[39m\x1B[38;5;49m \x1B[39m\x1B[38;5;49m \x1B[39m\x1B[38;5;49m \x1B[39m\x1B[38;5;49m.\x1B[39m\x1B[38;5;49m_\x1B[39m\x1B[38;5;49m_\x1B[39m\x1B[38;5;49m_\x1B[39m\x1B[38;5;48m_\x1B[39m\x1B[38;5;48m_\x1B[39m\x1B[38;5;48m_\x1B[39m\x1B[38;5;48m_\x1B[39m\x1B[38;5;48m_\x1B[39m\x1B[38;5;48m_\x1B[39m\x1B[38;5;48m_\x1B[39m\x1B[38;5;48m_\x1B[39m\x1B[38;5;48m_\x1B[39m\x1B[38;5;84m \x1B[39m\x1B[38;5;83m \x1B[39m\x1B[38;5;83m \x1B[39m\x1B[38;5;83m \x1B[39m\x1B[38;5;83m \x1B[39m\x1B[38;5;83m \x1B[39m\x1B[38;5;83m \x1B[39m\x1B[38;5;83m \x1B[39m\x1B[38;5;83m \x1B[39m\x1B[38;5;83m \x1B[39m\x1B[38;5;83m \x1B[39m\x1B[38;5;83m \x1B[39m\x1B[38;5;119m \x1B[39m\x1B[38;5;118m \x1B[39m\x1B[38;5;118m_\x1B[39m\x1B[38;5;118m_\x1B[39m\x1B[38;5;118m \x1B[39m\x1B[38;5;118m \x1B[39m\x1B[38;5;118m \x1B[39m\x1B[38;5;118m \x1B[39m\x1B[38;5;118m \x1B[39m\x1B[38;5;118m \x1B[39m\x1B[38;5;154m \x1B[39m\x1B[38;5;154m \x1B[39m\x1B[38;5;154m \x1B[39m\x1B[38;5;154m \x1B[39m\x1B[38;5;154m \x1B[39m\x1B[38;5;154m \x1B[39m\x1B[38;5;154m \x1B[39m\x1B[38;5;154m \x1B[39m\x1B[38;5;154m \x1B[39m\x1B[38;5;154m \x1B[39m\x1B[38;5;148m \x1B[39m\x1B[38;5;184m\x1B[39m\r
\x1B[38;5;39m\\\x1B[39m\x1B[38;5;39m_\x1B[39m\x1B[38;5;39m \x1B[39m\x1B[38;5;39m \x1B[39m\x1B[38;5;39m \x1B[39m\x1B[38;5;38m_\x1B[39m\x1B[38;5;44m_\x1B[39m\x1B[38;5;44m_\x1B[39m\x1B[38;5;44m_\x1B[39m\x1B[38;5;44m_\x1B[39m\x1B[38;5;44m/\x1B[39m\x1B[38;5;44m_\x1B[39m\x1B[38;5;44m_\x1B[39m\x1B[38;5;44m_\x1B[39m\x1B[38;5;44m \x1B[39m\x1B[38;5;44m \x1B[39m\x1B[38;5;44m \x1B[39m\x1B[38;5;43m_\x1B[39m\x1B[38;5;49m_\x1B[39m\x1B[38;5;49m_\x1B[39m\x1B[38;5;49m_\x1B[39m\x1B[38;5;49m \x1B[39m\x1B[38;5;49m \x1B[39m\x1B[38;5;49m \x1B[39m\x1B[38;5;49m_\x1B[39m\x1B[38;5;49m_\x1B[39m\x1B[38;5;49m|\x1B[39m\x1B[38;5;48m \x1B[39m\x1B[38;5;48m_\x1B[39m\x1B[38;5;48m/\x1B[39m\x1B[38;5;48m \x1B[39m\x1B[38;5;48m \x1B[39m\x1B[38;5;48m \x1B[39m\x1B[38;5;48m_\x1B[39m\x1B[38;5;48m_\x1B[39m\x1B[38;5;48m_\x1B[39m\x1B[38;5;84m_\x1B[39m\x1B[38;5;83m_\x1B[39m\x1B[38;5;83m/\x1B[39m\x1B[38;5;83m \x1B[39m\x1B[38;5;83m_\x1B[39m\x1B[38;5;83m_\x1B[39m\x1B[38;5;83m_\x1B[39m\x1B[38;5;83m_\x1B[39m\x1B[38;5;83m \x1B[39m\x1B[38;5;83m \x1B[39m\x1B[38;5;83m \x1B[39m\x1B[38;5;83m_\x1B[39m\x1B[38;5;119m_\x1B[39m\x1B[38;5;118m_\x1B[39m\x1B[38;5;118m_\x1B[39m\x1B[38;5;118m \x1B[39m\x1B[38;5;118m|\x1B[39m\x1B[38;5;118m \x1B[39m\x1B[38;5;118m \x1B[39m\x1B[38;5;118m|\x1B[39m\x1B[38;5;118m \x1B[39m\x1B[38;5;118m_\x1B[39m\x1B[38;5;154m_\x1B[39m\x1B[38;5;154m \x1B[39m\x1B[38;5;154m_\x1B[39m\x1B[38;5;154m_\x1B[39m\x1B[38;5;154m_\x1B[39m\x1B[38;5;154m_\x1B[39m\x1B[38;5;154m_\x1B[39m\x1B[38;5;154m_\x1B[39m\x1B[38;5;154m_\x1B[39m\x1B[38;5;154m_\x1B[39m\x1B[38;5;148m_\x1B[39m\x1B[38;5;184m_\x1B[39m\x1B[38;5;184m_\x1B[39m\x1B[38;5;184m \x1B[39m\x1B[38;5;184m\x1B[39m\r
\x1B[38;5;39m \x1B[39m\x1B[38;5;39m|\x1B[39m\x1B[38;5;38m \x1B[39m\x1B[38;5;44m \x1B[39m\x1B[38;5;44m \x1B[39m\x1B[38;5;44m \x1B[39m\x1B[38;5;44m_\x1B[39m\x1B[38;5;44m_\x1B[39m\x1B[38;5;44m)\x1B[39m\x1B[38;5;44m/\x1B[39m\x1B[38;5;44m \x1B[39m\x1B[38;5;44m_\x1B[39m\x1B[38;5;44m_\x1B[39m\x1B[38;5;44m \x1B[39m\x1B[38;5;43m\\\x1B[39m\x1B[38;5;49m_\x1B[39m\x1B[38;5;49m/\x1B[39m\x1B[38;5;49m \x1B[39m\x1B[38;5;49m_\x1B[39m\x1B[38;5;49m_\x1B[39m\x1B[38;5;49m \x1B[39m\x1B[38;5;49m\\\x1B[39m\x1B[38;5;49m \x1B[39m\x1B[38;5;49m/\x1B[39m\x1B[38;5;48m \x1B[39m\x1B[38;5;48m_\x1B[39m\x1B[38;5;48m_\x1B[39m\x1B[38;5;48m \x1B[39m\x1B[38;5;48m|\x1B[39m\x1B[38;5;48m\\\x1B[39m\x1B[38;5;48m_\x1B[39m\x1B[38;5;48m_\x1B[39m\x1B[38;5;48m_\x1B[39m\x1B[38;5;84m_\x1B[39m\x1B[38;5;83m_\x1B[39m\x1B[38;5;83m \x1B[39m\x1B[38;5;83m \x1B[39m\x1B[38;5;83m\\\x1B[39m\x1B[38;5;83m_\x1B[39m\x1B[38;5;83m/\x1B[39m\x1B[38;5;83m \x1B[39m\x1B[38;5;83m_\x1B[39m\x1B[38;5;83m_\x1B[39m\x1B[38;5;83m \x1B[39m\x1B[38;5;83m\\\x1B[39m\x1B[38;5;119m_\x1B[39m\x1B[38;5;118m/\x1B[39m\x1B[38;5;118m \x1B[39m\x1B[38;5;118m_\x1B[39m\x1B[38;5;118m_\x1B[39m\x1B[38;5;118m \x1B[39m\x1B[38;5;118m\\\x1B[39m\x1B[38;5;118m|\x1B[39m\x1B[38;5;118m \x1B[39m\x1B[38;5;118m \x1B[39m\x1B[38;5;154m|\x1B[39m\x1B[38;5;154m/\x1B[39m\x1B[38;5;154m \x1B[39m\x1B[38;5;154m/\x1B[39m\x1B[38;5;154m/\x1B[39m\x1B[38;5;154m \x1B[39m\x1B[38;5;154m_\x1B[39m\x1B[38;5;154m_\x1B[39m\x1B[38;5;154m \x1B[39m\x1B[38;5;154m\\\x1B[39m\x1B[38;5;148m_\x1B[39m\x1B[38;5;184m \x1B[39m\x1B[38;5;184m \x1B[39m\x1B[38;5;184m_\x1B[39m\x1B[38;5;184m_\x1B[39m\x1B[38;5;184m \x1B[39m\x1B[38;5;184m\\\x1B[39m\x1B[38;5;184m\x1B[39m\r
\x1B[38;5;44m \x1B[39m\x1B[38;5;44m|\x1B[39m\x1B[38;5;44m \x1B[39m\x1B[38;5;44m \x1B[39m\x1B[38;5;44m \x1B[39m\x1B[38;5;44m \x1B[39m\x1B[38;5;44m \x1B[39m\x1B[38;5;44m\\\x1B[39m\x1B[38;5;44m\\\x1B[39m\x1B[38;5;44m \x1B[39m\x1B[38;5;44m \x1B[39m\x1B[38;5;43m_\x1B[39m\x1B[38;5;49m_\x1B[39m\x1B[38;5;49m_\x1B[39m\x1B[38;5;49m/\x1B[39m\x1B[38;5;49m\\\x1B[39m\x1B[38;5;49m \x1B[39m\x1B[38;5;49m \x1B[39m\x1B[38;5;49m_\x1B[39m\x1B[38;5;49m_\x1B[39m\x1B[38;5;49m_\x1B[39m\x1B[38;5;48m/\x1B[39m\x1B[38;5;48m/\x1B[39m\x1B[38;5;48m \x1B[39m\x1B[38;5;48m/\x1B[39m\x1B[38;5;48m_\x1B[39m\x1B[38;5;48m/\x1B[39m\x1B[38;5;48m \x1B[39m\x1B[38;5;48m|\x1B[39m\x1B[38;5;48m/\x1B[39m\x1B[38;5;84m \x1B[39m\x1B[38;5;83m \x1B[39m\x1B[38;5;83m \x1B[39m\x1B[38;5;83m \x1B[39m\x1B[38;5;83m \x1B[39m\x1B[38;5;83m \x1B[39m\x1B[38;5;83m \x1B[39m\x1B[38;5;83m \x1B[39m\x1B[38;5;83m\\\x1B[39m\x1B[38;5;83m \x1B[39m\x1B[38;5;83m \x1B[39m\x1B[38;5;83m_\x1B[39m\x1B[38;5;119m_\x1B[39m\x1B[38;5;118m_\x1B[39m\x1B[38;5;118m/\x1B[39m\x1B[38;5;118m\\\x1B[39m\x1B[38;5;118m \x1B[39m\x1B[38;5;118m \x1B[39m\x1B[38;5;118m_\x1B[39m\x1B[38;5;118m_\x1B[39m\x1B[38;5;118m_\x1B[39m\x1B[38;5;118m/\x1B[39m\x1B[38;5;154m|\x1B[39m\x1B[38;5;154m \x1B[39m\x1B[38;5;154m \x1B[39m\x1B[38;5;154m \x1B[39m\x1B[38;5;154m \x1B[39m\x1B[38;5;154m<\x1B[39m\x1B[38;5;154m\\\x1B[39m\x1B[38;5;154m \x1B[39m\x1B[38;5;154m \x1B[39m\x1B[38;5;154m_\x1B[39m\x1B[38;5;148m_\x1B[39m\x1B[38;5;184m_\x1B[39m\x1B[38;5;184m/\x1B[39m\x1B[38;5;184m|\x1B[39m\x1B[38;5;184m \x1B[39m\x1B[38;5;184m \x1B[39m\x1B[38;5;184m|\x1B[39m\x1B[38;5;184m \x1B[39m\x1B[38;5;184m\\\x1B[39m\x1B[38;5;184m/\x1B[39m\x1B[38;5;184m\x1B[39m\r
\x1B[38;5;44m \x1B[39m\x1B[38;5;44m\\\x1B[39m\x1B[38;5;44m_\x1B[39m\x1B[38;5;44m_\x1B[39m\x1B[38;5;44m_\x1B[39m\x1B[38;5;44m \x1B[39m\x1B[38;5;44m \x1B[39m\x1B[38;5;44m/\x1B[39m\x1B[38;5;43m \x1B[39m\x1B[38;5;49m\\\x1B[39m\x1B[38;5;49m_\x1B[39m\x1B[38;5;49m_\x1B[39m\x1B[38;5;49m_\x1B[39m\x1B[38;5;49m \x1B[39m\x1B[38;5;49m \x1B[39m\x1B[38;5;49m>\x1B[39m\x1B[38;5;49m\\\x1B[39m\x1B[38;5;49m_\x1B[39m\x1B[38;5;48m_\x1B[39m\x1B[38;5;48m_\x1B[39m\x1B[38;5;48m \x1B[39m\x1B[38;5;48m \x1B[39m\x1B[38;5;48m>\x1B[39m\x1B[38;5;48m_\x1B[39m\x1B[38;5;48m_\x1B[39m\x1B[38;5;48m_\x1B[39m\x1B[38;5;48m_\x1B[39m\x1B[38;5;84m \x1B[39m\x1B[38;5;83m/\x1B[39m\x1B[38;5;83m_\x1B[39m\x1B[38;5;83m_\x1B[39m\x1B[38;5;83m_\x1B[39m\x1B[38;5;83m_\x1B[39m\x1B[38;5;83m_\x1B[39m\x1B[38;5;83m_\x1B[39m\x1B[38;5;83m_\x1B[39m\x1B[38;5;83m \x1B[39m\x1B[38;5;83m \x1B[39m\x1B[38;5;83m/\x1B[39m\x1B[38;5;119m\\\x1B[39m\x1B[38;5;118m_\x1B[39m\x1B[38;5;118m_\x1B[39m\x1B[38;5;118m_\x1B[39m\x1B[38;5;118m \x1B[39m\x1B[38;5;118m \x1B[39m\x1B[38;5;118m>\x1B[39m\x1B[38;5;118m\\\x1B[39m\x1B[38;5;118m_\x1B[39m\x1B[38;5;118m_\x1B[39m\x1B[38;5;154m_\x1B[39m\x1B[38;5;154m \x1B[39m\x1B[38;5;154m \x1B[39m\x1B[38;5;154m>\x1B[39m\x1B[38;5;154m_\x1B[39m\x1B[38;5;154m_\x1B[39m\x1B[38;5;154m|\x1B[39m\x1B[38;5;154m_\x1B[39m\x1B[38;5;154m \x1B[39m\x1B[38;5;154m\\\x1B[39m\x1B[38;5;148m\\\x1B[39m\x1B[38;5;184m_\x1B[39m\x1B[38;5;184m_\x1B[39m\x1B[38;5;184m_\x1B[39m\x1B[38;5;184m \x1B[39m\x1B[38;5;184m \x1B[39m\x1B[38;5;184m>\x1B[39m\x1B[38;5;184m_\x1B[39m\x1B[38;5;184m_\x1B[39m\x1B[38;5;184m|\x1B[39m\x1B[38;5;184m \x1B[39m\x1B[38;5;184m \x1B[39m\x1B[38;5;178m \x1B[39m\x1B[38;5;214m\x1B[39m\r
\x1B[38;5;44m \x1B[39m\x1B[38;5;44m \x1B[39m\x1B[38;5;44m \x1B[39m\x1B[38;5;44m \x1B[39m\x1B[38;5;44m \x1B[39m\x1B[38;5;43m\\\x1B[39m\x1B[38;5;49m/\x1B[39m\x1B[38;5;49m \x1B[39m\x1B[38;5;49m \x1B[39m\x1B[38;5;49m \x1B[39m\x1B[38;5;49m \x1B[39m\x1B[38;5;49m \x1B[39m\x1B[38;5;49m \x1B[39m\x1B[38;5;49m\\\x1B[39m\x1B[38;5;49m/\x1B[39m\x1B[38;5;48m \x1B[39m\x1B[38;5;48m \x1B[39m\x1B[38;5;48m \x1B[39m\x1B[38;5;48m \x1B[39m\x1B[38;5;48m \x1B[39m\x1B[38;5;48m\\\x1B[39m\x1B[38;5;48m/\x1B[39m\x1B[38;5;48m \x1B[39m\x1B[38;5;48m \x1B[39m\x1B[38;5;84m \x1B[39m\x1B[38;5;83m \x1B[39m\x1B[38;5;83m \x1B[39m\x1B[38;5;83m\\\x1B[39m\x1B[38;5;83m/\x1B[39m\x1B[38;5;83m \x1B[39m\x1B[38;5;83m \x1B[39m\x1B[38;5;83m \x1B[39m\x1B[38;5;83m \x1B[39m\x1B[38;5;83m \x1B[39m\x1B[38;5;83m \x1B[39m\x1B[38;5;83m \x1B[39m\x1B[38;5;119m\\\x1B[39m\x1B[38;5;118m/\x1B[39m\x1B[38;5;118m \x1B[39m\x1B[38;5;118m \x1B[39m\x1B[38;5;118m \x1B[39m\x1B[38;5;118m \x1B[39m\x1B[38;5;118m \x1B[39m\x1B[38;5;118m\\\x1B[39m\x1B[38;5;118m/\x1B[39m\x1B[38;5;118m \x1B[39m\x1B[38;5;154m \x1B[39m\x1B[38;5;154m \x1B[39m\x1B[38;5;154m \x1B[39m\x1B[38;5;154m \x1B[39m\x1B[38;5;154m\\\x1B[39m\x1B[38;5;154m/\x1B[39m\x1B[38;5;154m \x1B[39m\x1B[38;5;154m \x1B[39m\x1B[38;5;154m \x1B[39m\x1B[38;5;154m \x1B[39m\x1B[38;5;148m \x1B[39m\x1B[38;5;184m\\\x1B[39m\x1B[38;5;184m/\x1B[39m\x1B[38;5;184m \x1B[39m\x1B[38;5;184m \x1B[39m\x1B[38;5;184m \x1B[39m\x1B[38;5;184m \x1B[39m\x1B[38;5;184m\\\x1B[39m\x1B[38;5;184m/\x1B[39m\x1B[38;5;184m \x1B[39m\x1B[38;5;184m \x1B[39m\x1B[38;5;184m \x1B[39m\x1B[38;5;178m \x1B[39m\x1B[38;5;214m \x1B[39m\x1B[38;5;214m \x1B[39m\x1B[38;5;214m \x1B[39m\x1B[38;5;214m\x1B[39m`;
let E = 0;
function He(...t) {
  const e = t[0];
  E = 0, process.stdout.write(`Starting ${e.niceName} `);
}
function We(t) {
  return function(...r) {
    const s = r[0];
    t.isAllMode ? s.feeds.length === 0 ? process.stdout.write(f("yellow", ` No feeds found.
`)) : (process.stdout.write(f("green", ` Found ${s.feeds.length} feeds.
`)), console.log(JSON.stringify(s.feeds, null, 2)), t.allModeFeeds = t.allModeFeeds.concat(s.feeds)) : s.feeds.length === 0 ? process.stdout.write(f("yellow", ` No feeds found.
`)) : process.stdout.write(f("green", ` Found ${s.feeds.length} feeds.
`));
  };
}
async function Xe(...t) {
  const e = t[0];
  if (e.module === "metalinks" && process.stdout.write("."), (e.module === "blindsearch" || e.module === "anchors") && "totalCount" in e && "totalEndpoints" in e) {
    E > 0 && process.stdout.write(`\x1B[${E}D`);
    const r = ` (${e.totalCount}/${e.totalEndpoints})`;
    process.stdout.write(r), E = r.length;
  }
  if (e.module === "deepSearch" && "url" in e && "depth" in e && "progress" in e) {
    const r = e.progress, s = r.processed || 0, n = r.remaining || 0, i = s + n;
    try {
      const o = new URL(e.url), a = o.hostname, m = o.pathname.length > 30 ? o.pathname.substring(0, 27) + "..." : o.pathname, l = `${a}${m}`;
      process.stdout.write(`  [depth:${e.depth} ${s}/${i}] ${l}
`);
    } catch {
      process.stdout.write(`  [depth:${e.depth} ${s}/${i}]
`);
    }
  }
}
function Ve(t, e, r) {
  const s = new qe(t, e);
  return s.site = t, s.options = e, s.initializationError = !1, s.on("start", He), s.on("log", Xe), s.on("end", We(r)), s.on("error", (...n) => {
    const i = n[0];
    if (typeof i == "object" && i !== null && i.module === "FeedSeeker" && (s.initializationError = !0), i instanceof Error)
      console.error(f("red", `
Error for ${t}: ${i.message}`));
    else if (typeof i == "object" && i !== null) {
      const o = i, a = typeof o.error == "string" ? o.error : String(i);
      console.error(f("red", `
Error for ${t}: ${a}`));
    } else
      console.error(f("red", `
Error for ${t}: ${String(i)}`));
  }), s;
}
async function Ye(t, e, r) {
  t.includes("://") || (t = `https://${t}`);
  const s = Ve(t, e, r);
  if (await s.initialize(), s.initializationError)
    return [];
  const n = [];
  return e.metasearch ? n.push(() => s.metaLinks()) : e.anchorsonly ? n.push(() => s.checkAllAnchors()) : e.blindsearch ? n.push(() => s.blindSearch()) : e.deepsearchOnly ? n.push(() => s.deepSearch()) : e.all ? n.push(
    () => s.metaLinks(),
    () => s.checkAllAnchors(),
    () => s.blindSearch(),
    () => s.deepSearch()
  ) : n.push(
    () => s.metaLinks(),
    () => s.checkAllAnchors(),
    () => s.blindSearch(),
    ...e.deepsearch ? [() => s.deepSearch()] : []
  ), await (async () => {
    if (e.all) {
      const a = [];
      for (const m of n) {
        const l = await m();
        l.length > 0 && a.push(...l);
      }
      return a;
    } else {
      for (const a of n) {
        const m = await a();
        if (m.length > 0) return m;
      }
      return [];
    }
  })();
}
function Ge(t) {
  const e = new Y();
  return e.name("feed-seeker").description("Find RSS, Atom, and JSON feeds on any website with FeedSeeker."), e.command("version").description("Get version").action(async () => {
    const s = (await import("./package-DxC7lVBq.js")).default;
    process.stdout.write(`${s.version}
`);
  }), e.argument("[site]", "The website URL to search for feeds").option("-m, --metasearch", "Meta search only").option("-b, --blindsearch", "Blind search only").option("-a, --anchorsonly", "Anchors search only").option("-d, --deepsearch", "Enable deep search").option("--all", "Execute all strategies and combine results").option("--deepsearch-only", "Deep search only").option(
    "--depth <number>",
    "Depth of deep search",
    (r) => {
      const s = parseInt(r, 10);
      if (Number.isNaN(s) || s < 1)
        throw new Error("Depth must be a positive number (minimum 1)");
      return s;
    },
    3
  ).option(
    "--max-links <number>",
    "Maximum number of links to process during deep search",
    (r) => {
      const s = parseInt(r, 10);
      if (Number.isNaN(s) || s < 1)
        throw new Error("Max links must be a positive number (minimum 1)");
      return s;
    },
    1e3
  ).option(
    "--timeout <seconds>",
    "Timeout for fetch requests in seconds",
    (r) => {
      const s = parseInt(r, 10);
      if (Number.isNaN(s) || s < 1)
        throw new Error("Timeout must be a positive number (minimum 1 second)");
      return s;
    },
    5
  ).option("--keep-query-params", "Keep query parameters from the original URL when searching").option("--check-foreign-feeds", "Check if foreign domain URLs are feeds (but don't crawl them)").option(
    "--max-errors <number>",
    "Stop after a certain number of errors",
    (r) => {
      const s = parseInt(r, 10);
      if (Number.isNaN(s) || s < 0)
        throw new Error("Max errors must be a non-negative number");
      return s;
    },
    5
  ).option(
    "--max-feeds <number>",
    "Stop search after finding a certain number of feeds",
    (r) => {
      const s = parseInt(r, 10);
      if (Number.isNaN(s) || s < 0)
        throw new Error("Max feeds must be a non-negative number");
      return s;
    },
    0
  ).option(
    "--search-mode <mode>",
    "Search mode for blind search: fast (~25), standard (~100), or full (~350+)",
    "standard"
  ).description(`Find feeds for site
`).action(async (r, s) => {
    r || (e.help(), process.exit(0));
    try {
      const n = {
        isAllMode: !!s.all,
        allModeFeeds: []
      };
      e.feeds = await Ye(r, s, n), e.ctx = n;
    } catch (n) {
      s.displayErrors ? console.error(`
Error details:`, n) : console.error(f("red", `
Error: ${n.message}`)), process.exit(1);
    }
  }), e.addOption(new G("--display-errors", "Display errors").hideHelp()), e;
}
async function Je(t = process.argv) {
  console.log(`${je}
`);
  const e = Ge();
  if (await e.parseAsync(t), e.feeds !== void 0) {
    const r = e.ctx;
    r?.isAllMode && r.allModeFeeds.length > 0 ? (console.log(f("yellow", `
=== All Strategies Complete ===`)), console.log(
      f(
        "green",
        `Total: ${r.allModeFeeds.length} ${r.allModeFeeds.length === 1 ? "feed" : "feeds"} found from all strategies
`
      )
    ), console.log(JSON.stringify(r.allModeFeeds, null, 2))) : e.feeds.length > 0 && console.log(JSON.stringify(e.feeds, null, 2));
  }
}
import.meta.url === `file://${process.argv[1]}` && Je().catch((t) => {
  console.error(f("red", `
Error: ${t.message}`)), process.exit(1);
});
export {
  Ge as createProgram,
  Je as run
};
