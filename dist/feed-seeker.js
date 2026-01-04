#!/usr/bin/env node
import { parseHTML as C } from "linkedom";
import b from "tldts";
import X from "async";
const _ = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"
];
function j() {
  return _[Math.floor(Math.random() * _.length)];
}
function G(t) {
  return new Promise((e) => setTimeout(e, t));
}
async function F(t, e = {}) {
  let r, s, i, o;
  if (typeof e == "number")
    r = e, s = 0, i = 1e3, o = {};
  else {
    const {
      timeout: a = 5e3,
      retries: c = 0,
      retryDelay: d = 1e3,
      ...h
    } = e;
    r = a, s = c, i = d, o = h;
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
  let n;
  const l = new URL(t);
  for (let a = 0; a <= s; a++) {
    if (a > 0) {
      const u = i * Math.pow(2, a - 1), T = Math.random() * 500;
      await G(u + T);
    }
    const c = new AbortController(), d = setTimeout(() => c.abort(), r), m = {
      ...{
        "User-Agent": j(),
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br, zstd",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Sec-Ch-Ua": '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": '"Windows"',
        DNT: "1",
        "Cache-Control": "max-age=0",
        Referer: l.origin + "/"
      },
      ...o.headers || {}
    };
    try {
      const u = await fetch(t, {
        ...o,
        signal: c.signal,
        headers: m
      });
      if (clearTimeout(d), u.status === 403 && a < s) {
        n = new Error(`HTTP 403 Forbidden (attempt ${a + 1}/${s + 1})`);
        continue;
      }
      return u;
    } catch (u) {
      if (clearTimeout(d), n = u, u instanceof Error && u.name === "AbortError" && (n = new Error(`Request to ${t} timed out after ${r}ms`)), a >= s)
        break;
    }
  }
  throw n;
}
const p = {
  MAX_CONTENT_SIZE: 10 * 1024 * 1024,
  // 10MB maximum content size
  DEFAULT_TIMEOUT: 5,
  // Default timeout in seconds
  MAX_TIMEOUT: 60,
  // Maximum timeout in seconds (60 seconds)
  MIN_TIMEOUT: 1
  // Minimum timeout in seconds
}, N = {
  TYPES: ["rich", "video", "photo", "link"],
  VERSIONS: ["1.0", "2.0"],
  URL_PATTERNS: ["/wp-json/oembed/", "/oembed"]
}, f = {
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
function V(t) {
  if (t.length > p.MAX_CONTENT_SIZE)
    throw new Error(
      `Content too large: ${t.length} bytes. Maximum allowed: ${p.MAX_CONTENT_SIZE} bytes.`
    );
}
function Y(t) {
  return t == null ? p.DEFAULT_TIMEOUT : !Number.isFinite(t) || t < p.MIN_TIMEOUT ? (console.warn(
    `Invalid timeout value ${t}. Using minimum: ${p.MIN_TIMEOUT} seconds.`
  ), p.MIN_TIMEOUT) : t > p.MAX_TIMEOUT ? (console.warn(
    `Timeout value ${t} exceeds maximum. Clamping to ${p.MAX_TIMEOUT} seconds.`
  ), p.MAX_TIMEOUT) : Math.floor(t);
}
function B(t) {
  return N.URL_PATTERNS.some((e) => t.includes(e));
}
function J(t) {
  return !!(t.type && N.TYPES.includes(t.type) && N.VERSIONS.includes(t.version) || t.type && t.version && t.html);
}
function $(t) {
  return t.replace(f.CDATA, "$1");
}
function S(t) {
  return t ? t.replace(/\s+/g, " ").trim() : null;
}
async function E(t, e = "", r) {
  if (K(t), B(t))
    return null;
  if (!e) {
    if (!r)
      throw new Error("Instance parameter is required when content is not provided");
    const o = Y(r.options.timeout) * 1e3, n = await F(t, o);
    if (!n.ok)
      throw new Error(`Failed to fetch ${t}: ${n.status} ${n.statusText}`);
    e = await n.text();
  }
  return V(e), Z(e) || ee(e) || te(e) || null;
}
function Q(t) {
  const e = f.RSS.CHANNEL_CONTENT.exec(t);
  if (e) {
    const i = e[1], o = f.RSS.TITLE.exec(i);
    return o ? S($(o[1])) : null;
  }
  const r = f.RSS.TITLE.exec(t);
  return r ? S($(r[1])) : null;
}
function Z(t) {
  if (f.RSS.VERSION.test(t)) {
    const e = f.RSS.CHANNEL.test(t), r = f.RSS.ITEM.test(t), s = f.RSS.DESCRIPTION.test(t);
    if (e && s && (r || f.RSS.CHANNEL_END.test(t)))
      return { type: "rss", title: Q(t) };
  }
  return null;
}
function ee(t) {
  const e = f.ATOM.NAMESPACE_XMLNS.test(t) || f.ATOM.NAMESPACE_XMLNS_ATOM.test(t) || f.ATOM.NAMESPACE_ATOM_PREFIX.test(t);
  if (f.ATOM.FEED_START.test(t) && e) {
    const r = f.ATOM.ENTRY.test(t), s = f.ATOM.TITLE_TAG.test(t);
    if (r && s) {
      const i = f.ATOM.TITLE_CONTENT.exec(t);
      return { type: "atom", title: i ? S($(i[1])) : null };
    }
  }
  return null;
}
function te(t) {
  try {
    const e = JSON.parse(t);
    if (J(e))
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
const re = ["feed+json", "rss+xml", "atom+xml", "xml", "rdf+xml"], se = ["/rss", "/feed", "/atom", ".rss", ".atom", ".xml", ".json"];
function ie(t) {
  return t ? t.replace(/\s+/g, " ").trim() : null;
}
async function L(t, e, r, s, i = 5) {
  const o = e.options?.maxFeeds || 0;
  for (let n = 0; n < t.length; n += i) {
    if (o > 0 && r.length >= o)
      return !0;
    const l = t.slice(n, n + i);
    if ((await Promise.allSettled(
      l.map((d) => oe(d, e, r, s))
    )).some(
      (d) => d.status === "fulfilled" && d.value === !0
    ))
      return !0;
  }
  return !1;
}
async function oe(t, e, r, s) {
  const i = e.options?.maxFeeds || 0;
  if (!t.href) return !1;
  let o;
  try {
    o = new URL(t.href, e.site).href;
  } catch (n) {
    if (e.options?.showErrors) {
      const l = n instanceof Error ? n : new Error(String(n));
      e.emit("error", {
        module: "metalinks",
        error: l.message,
        explanation: `Invalid URL found in meta link: ${t.href}. Unable to construct a valid URL.`,
        suggestion: "Check the meta link href attribute for malformed URLs."
      });
    }
    return !1;
  }
  if (s.has(o)) return !1;
  e.emit("log", { module: "metalinks", message: `Checking feed: ${o}` });
  try {
    const n = await E(o, "", e);
    if (n && (r.push({
      url: o,
      title: ie(t.title),
      type: n.type,
      feedTitle: n.title
    }), s.add(o), i > 0 && r.length >= i))
      return e.emit("log", {
        module: "metalinks",
        message: `Stopped due to reaching maximum feeds limit: ${r.length} feeds found (max ${i} allowed).`
      }), !0;
  } catch (n) {
    if (e.options?.showErrors) {
      const l = n instanceof Error ? n : new Error(String(n));
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
async function ne(t) {
  t.emit("start", { module: "metalinks", niceName: "Meta links" });
  const e = [], r = /* @__PURE__ */ new Set();
  try {
    const s = re.map((c) => `link[type="application/${c}"]`).join(", "), i = Array.from(t.document.querySelectorAll(s));
    if (await L(i, t, e, r))
      return e;
    const n = Array.from(
      t.document.querySelectorAll('link[rel="alternate"][type*="rss"], link[rel="alternate"][type*="xml"], link[rel="alternate"][type*="atom"], link[rel="alternate"][type*="json"]')
    );
    if (await L(n, t, e, r))
      return e;
    const a = Array.from(
      t.document.querySelectorAll('link[rel="alternate"]')
    ).filter(
      (c) => c.href && se.some((d) => c.href.toLowerCase().includes(d))
    );
    return await L(a, t, e, r), e;
  } finally {
    t.emit("end", { module: "metalinks", feeds: e });
  }
}
function x(t, e) {
  try {
    return new URL(t, e);
  } catch {
    return null;
  }
}
function ae(t) {
  const e = x(t);
  return e ? e.protocol === "http:" || e.protocol === "https:" : !1;
}
function le(t) {
  return x(t) ? !1 : !t.includes("://");
}
function O(t, e) {
  const r = x(t);
  if (!r || r.hostname === e.hostname)
    return !0;
  const s = [
    // Google FeedBurner (most common feed hosting service)
    "feedburner.com",
    "feeds.feedburner.com",
    "feedproxy.google.com",
    "feeds2.feedburner.com"
  ];
  return s.includes(r.hostname) || s.some((i) => r.hostname.endsWith("." + i));
}
function de(t) {
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
function q(t, e, r) {
  if (!t.href)
    return null;
  if (ae(t.href))
    return t.href;
  if (le(t.href)) {
    const s = x(t.href, e);
    return s ? s.href : (r.emit("error", {
      module: "anchors",
      error: `Invalid relative URL: ${t.href}`,
      explanation: "A relative URL found in an anchor tag could not be resolved against the base URL. This may be due to malformed relative path syntax.",
      suggestion: 'Check the anchor href attribute for proper relative path format (e.g., "./feed.xml", "../rss.xml", or "/feed").'
    }), null);
  }
  return null;
}
function ce(t) {
  const e = /https?:\/\/[^\s"'<>)]+/gi, r = t.match(e);
  if (!r)
    return [];
  const s = /* @__PURE__ */ new Set();
  for (const i of r) {
    const o = i.replace(/[.,;:!?]+$/, "");
    s.add(o);
  }
  return Array.from(s);
}
async function he(t, e) {
  const { instance: r, baseUrl: s, feedUrls: i } = e, o = q(t, s, r);
  if (o)
    try {
      const n = await E(o, "", r);
      n && i.push({
        url: o,
        title: t.textContent?.trim() || null,
        type: n.type,
        feedTitle: n.title
      });
    } catch (n) {
      if (r.options?.showErrors) {
        const l = n instanceof Error ? n : new Error(String(n));
        r.emit("error", {
          module: "anchors",
          error: `Error checking feed at ${o}: ${l.message}`,
          explanation: "An error occurred while trying to fetch and validate a potential feed URL found in an anchor tag. This could be due to network timeouts, server errors, or invalid feed content.",
          suggestion: "Check if the URL is accessible and returns valid feed content. Network connectivity issues or server problems may cause this error."
        });
      }
    }
}
async function W(t) {
  await de(t);
  const e = new URL(t.site), r = t.document.querySelectorAll("a"), s = [];
  for (const l of r) {
    const a = q(l, e, t);
    a && O(a, e) && s.push(l);
  }
  const i = t.options?.maxFeeds || 0, o = {
    instance: t,
    baseUrl: e,
    feedUrls: []
  };
  let n = 1;
  for (const l of s) {
    if (i > 0 && o.feedUrls.length >= i) {
      t.emit("log", {
        module: "anchors",
        message: `Stopped due to reaching maximum feeds limit: ${o.feedUrls.length} feeds found (max ${i} allowed).`
      });
      break;
    }
    t.emit("log", { module: "anchors", totalCount: n++, totalEndpoints: s.length }), await he(l, o);
  }
  if (i === 0 || o.feedUrls.length < i) {
    const l = t.document.body?.innerHTML || "", a = ce(l), c = new Set(o.feedUrls.map((h) => h.url)), d = [];
    for (const h of a)
      !c.has(h) && O(h, e) && (d.push(h), c.add(h));
    for (const h of d) {
      if (i > 0 && o.feedUrls.length >= i) {
        t.emit("log", {
          module: "anchors",
          message: `Stopped due to reaching maximum feeds limit: ${o.feedUrls.length} feeds found (max ${i} allowed).`
        });
        break;
      }
      t.emit("log", {
        module: "anchors",
        totalCount: n++,
        totalEndpoints: s.length + d.length
      });
      try {
        const m = await E(h, "", t);
        m && o.feedUrls.push({
          url: h,
          title: null,
          // Plain-text URLs don't have anchor text
          type: m.type,
          feedTitle: m.title
        });
      } catch (m) {
        if (t.options?.showErrors) {
          const u = m instanceof Error ? m : new Error(String(m));
          t.emit("error", {
            module: "anchors",
            error: `Error checking feed at ${h}: ${u.message}`,
            explanation: "An error occurred while trying to fetch and validate a potential feed URL found in page text. This could be due to network timeouts, server errors, or invalid feed content.",
            suggestion: "Check if the URL is accessible and returns valid feed content. Network connectivity issues or server problems may cause this error."
          });
        }
      }
    }
  }
  return o.feedUrls;
}
async function fe(t) {
  t.emit("start", {
    module: "anchors",
    niceName: "Check all anchors"
  });
  const e = await W(t);
  return t.emit("end", { module: "anchors", feeds: e }), e;
}
const ue = 0, k = 0, me = 3, A = "standard", H = 2083, v = 10, U = 1, D = 1e4, M = 6e4, y = [
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
], R = [
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
], pe = [
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
function ge(t) {
  switch (t) {
    case "fast":
      return y;
    case "standard":
      return [...y, ...R];
    case "exhaustive":
    case "full":
      return [...y, ...R, ...pe];
    default:
      return [...y, ...R];
  }
}
function we(t) {
  return t ? ["fast", "standard", "exhaustive", "full"].includes(t) ? t : (console.warn(`Invalid search mode "${t}". Falling back to "${A}".`), A) : A;
}
function Ee(t) {
  return t == null ? me : !Number.isFinite(t) || t < U ? (console.warn(`Invalid concurrency value ${t}. Using minimum: ${U}.`), U) : t > v ? (console.warn(
    `Concurrency value ${t} exceeds maximum. Clamping to ${v}.`
  ), v) : Math.floor(t);
}
function ye(t) {
  return t == null ? k : !Number.isFinite(t) || t < 0 ? (console.warn(`Invalid request delay ${t}. Using default: ${k}.`), k) : t > M ? (console.warn(`Request delay ${t}ms exceeds maximum. Clamping to ${M}ms.`), M) : Math.floor(t);
}
function z(t) {
  return t.length <= H;
}
function Se(t, e, r) {
  let s;
  try {
    s = new URL(t);
  } catch {
    throw new Error(`Invalid URL provided to blindSearch: ${t}`);
  }
  if (!z(t))
    throw new Error(
      `URL too long (${t.length} chars). Maximum allowed: ${H} characters.`
    );
  if (!["http:", "https:"].includes(s.protocol))
    throw new Error(`Invalid protocol "${s.protocol}". Only http: and https: are allowed.`);
  const i = s.origin;
  let o = t;
  const n = [];
  let l = "";
  for (e && (l = s.search); o.length >= i.length; ) {
    const a = o.endsWith("/") ? o.slice(0, -1) : o;
    for (const c of r) {
      if (n.length >= D)
        return console.warn(
          `URL generation limit reached (${D} URLs). Stopping to prevent resource exhaustion.`
        ), n;
      const d = l ? `${a}/${c}${l}` : `${a}/${c}`;
      z(d) ? n.push(d) : console.warn(`Skipping URL (too long): ${d.substring(0, 100)}...`);
    }
    o = o.slice(0, o.lastIndexOf("/"));
  }
  return n;
}
function xe(t, e, r, s, i) {
  return t.type === "rss" ? s = !0 : t.type === "atom" && (i = !0), r.push({
    url: e,
    title: null,
    // No link element title in blind search (unlike metaLinks)
    type: t.type,
    feedTitle: t.title
    // Actual feed title from parsing the feed
  }), { rssFound: s, atomFound: i };
}
function Te(t, e, r, s, i) {
  return t >= e ? !1 : i ? !0 : !(r && s);
}
async function be(t, e) {
  const r = we(t.options?.searchMode), s = ge(r), i = Se(
    t.site,
    t.options?.keepQueryParams || !1,
    s
  );
  t.emit("start", {
    module: "blindsearch",
    niceName: "Blind search",
    endpointUrls: i.length
  });
  const o = t.options?.all || !1, n = t.options?.maxFeeds ?? ue, l = Ee(t.options?.concurrency), a = await Le(
    i,
    o,
    n,
    l,
    t
  );
  return t.emit("end", { module: "blindsearch", feeds: a.feeds }), a.feeds;
}
async function Le(t, e, r, s, i, o) {
  const n = [], l = /* @__PURE__ */ new Set();
  let a = !1, c = !1, d = 0;
  for (; Te(d, t.length, a, c, e); ) {
    if (r > 0 && n.length >= r) {
      await P(i, n, r);
      break;
    }
    const h = Math.min(s, t.length - d), m = t.slice(d, d + h), u = await Promise.allSettled(
      m.map((g) => ke(g, i, l, n, a, c))
    );
    for (const g of u)
      if (g.status === "fulfilled" && g.value.found && (a = g.value.rssFound, c = g.value.atomFound, r > 0 && n.length >= r)) {
        await P(i, n, r), d = t.length;
        break;
      }
    d += h;
    const T = n.length;
    i.emit("log", {
      module: "blindsearch",
      totalEndpoints: t.length,
      totalCount: d,
      feedsFound: T
    });
    const I = ye(i.options?.requestDelay);
    I > 0 && d < t.length && await new Promise((g) => setTimeout(g, I));
  }
  return { feeds: n, rssFound: a, atomFound: c };
}
async function ke(t, e, r, s, i, o) {
  if (r.has(t))
    return { found: !1, rssFound: i, atomFound: o };
  r.add(t);
  try {
    const n = await E(t, "", e);
    if (n) {
      const l = xe(n, t, s, i, o);
      return i = l.rssFound, o = l.atomFound, { found: !0, rssFound: i, atomFound: o };
    }
  } catch (n) {
    const l = n instanceof Error ? n : new Error(String(n));
    await Ae(e, t, l);
  }
  return { found: !1, rssFound: i, atomFound: o };
}
async function P(t, e, r) {
  t.emit("log", {
    module: "blindsearch",
    message: `Stopped due to reaching maximum feeds limit: ${e.length} feeds found (max ${r} allowed).`
  });
}
async function Ae(t, e, r) {
  t.options?.showErrors && t.emit("error", {
    module: "blindsearch",
    error: `Error fetching ${e}: ${r.message}`,
    explanation: "An error occurred while trying to fetch a potential feed URL during blind search. This could be due to network timeouts, server errors, 404 not found, or invalid content.",
    suggestion: "This is normal during blind search as many URLs are tested. The search will continue with other potential feed endpoints."
  });
}
class w {
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
  #i;
  /**
   * Default max listeners for all instances
   * @private
   */
  static #o = 10;
  /**
   * Creates a new EventEmitter instance
   * @param {EventEmitterOptions} options - Configuration options
   */
  constructor(e = {}) {
    this.#t = e.maxListeners ?? w.#o, this.#i = e.captureAsyncErrors ?? !0;
  }
  /**
   * Sets the default maximum number of listeners for all new EventEmitter instances
   * @param {number} n - The maximum number of listeners (0 = unlimited)
   */
  static setDefaultMaxListeners(e) {
    if (typeof e != "number" || e < 0 || !Number.isInteger(e))
      throw new TypeError("Max listeners must be a non-negative integer");
    w.#o = e;
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
  #n(e) {
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
    return s ? s.add(r) : this.#e.set(e, /* @__PURE__ */ new Set([r])), this.#n(e), this;
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
      const i = /* @__PURE__ */ new Set([r, ...s]);
      this.#e.set(e, i);
    }
    return this.#n(e), this;
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
    const s = ((...i) => {
      this.off(e, s), r(...i);
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
    const s = ((...i) => {
      this.off(e, s), r(...i);
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
        const i = r[0];
        if (i instanceof Error)
          throw i;
        {
          const o = this.#l(i);
          throw new Error(`Unhandled error event: ${o}`);
        }
      }
      return !1;
    }
    return [...s].forEach((i) => {
      try {
        const o = i(...r);
        this.#i && o instanceof Promise && o.catch((n) => {
          this.#a(n, e);
        });
      } catch (o) {
        this.#a(o, e);
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
    return s ? ([...s].forEach((i) => {
      (i === r || i.originalListener === r) && s.delete(i);
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
const { queue: ve } = X;
function Ue(t) {
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
class Me extends w {
  constructor(e, r = 3, s = 5, i = 1e3, o = !1, n = 5, l = 0, a = null) {
    super();
    try {
      const c = new URL(e);
      this.startUrl = c.href;
    } catch {
      throw new Error(`Invalid start URL: ${e}`);
    }
    this.maxDepth = r, this.concurrency = s, this.maxLinks = i, this.mainDomain = b.getDomain(this.startUrl), this.checkForeignFeeds = o, this.maxErrors = n, this.maxFeeds = l, this.errorCount = 0, this.instance = a, this.queue = ve(this.crawlPage.bind(this), this.concurrency), this.visitedUrls = /* @__PURE__ */ new Set(), this.timeout = 5e3, this.maxLinksReachedMessageEmitted = !1, this.feeds = [], this.queue.error((c) => {
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
      const r = b.getDomain(e) === b.getDomain(this.startUrl), s = !Ue(e);
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
    const i = this.queue.length();
    this.emit("log", {
      module: "deepSearch",
      url: e,
      depth: r,
      progress: { processed: this.visitedUrls.size, remaining: i }
    });
    try {
      const o = await E(e, "", this.instance || void 0);
      if (o && !this.feeds.some((n) => n.url === e)) {
        if (this.feeds.push({ url: e, type: o.type, title: o.title, feedTitle: o.title }), this.emit("log", {
          module: "deepSearch",
          url: e,
          depth: r + 1,
          feedCheck: { isFeed: !0, type: o.type }
        }), this.maxFeeds > 0 && this.feeds.length >= this.maxFeeds)
          return this.queue.kill(), this.emit("log", {
            module: "deepSearch",
            message: `Stopped due to reaching maximum feeds limit: ${this.feeds.length} feeds found (max ${this.maxFeeds} allowed).`
          }), !0;
      } else o || this.emit("log", { module: "deepSearch", url: e, depth: r + 1, feedCheck: { isFeed: !1 } });
    } catch (o) {
      const n = o instanceof Error ? o : new Error(String(o));
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
    const i = await F(r, this.timeout);
    if (!i) {
      this.handleFetchError(r, s, "Failed to fetch URL - timeout or network error");
      return;
    }
    if (!i.ok) {
      this.handleFetchError(r, s, `HTTP ${i.status} ${i.statusText}`);
      return;
    }
    const o = await i.text(), { document: n } = C(o);
    for (const l of n.querySelectorAll("a"))
      try {
        const a = new URL(l.href, this.startUrl).href;
        if (await this.processLink(a, s)) break;
      } catch {
        continue;
      }
  }
}
async function Re(t, e = {}, r = null) {
  const s = new Me(
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
  return s.timeout = (e.timeout || 5) * 1e3, r && r.emit && (s.on("start", (i) => r.emit("start", i)), s.on("log", (i) => r.emit("log", i)), s.on("error", (i) => r.emit("error", i)), s.on("end", (i) => r.emit("end", i))), s.start(), await new Promise((i) => {
    s.queue.drain(() => {
      s.emit("end", { module: "deepSearch", feeds: s.feeds, visitedUrls: s.visitedUrls.size }), i();
    });
  }), s.feeds;
}
class Fe extends w {
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
      const i = new URL(s);
      this.site = i.pathname === "/" ? i.origin : i.href;
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
    const { document: e } = C("<!DOCTYPE html><html><head></head><body></body></html>");
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
          this.initStatus = "error", this.emit("error", {
            module: "FeedSeeker",
            error: "Site parameter must be a non-empty string"
          }), this.setEmptyState(), this.emit("initialized");
          return;
        }
        try {
          new URL(this.site);
        } catch {
          this.initStatus = "error", this.emit("error", {
            module: "FeedSeeker",
            error: `Invalid URL: ${this.site}`
          }), this.setEmptyState(), this.emit("initialized");
          return;
        }
        const e = (this.options.timeout ?? 5) * 1e3, r = await F(this.site, {
          timeout: e,
          retries: 3,
          retryDelay: 1e3
        });
        if (!r.ok) {
          this.initStatus = "error", this.emit("error", {
            module: "FeedSeeker",
            error: `HTTP error while fetching ${this.site}: ${r.status} ${r.statusText}`
          }), this.setEmptyState(), this.emit("initialized");
          return;
        }
        this.content = await r.text();
        const { document: s } = C(this.content);
        this.document = s, this.initStatus = "success", this.emit("initialized");
      } catch (e) {
        const r = e instanceof Error ? e : new Error(String(e));
        let s = `Failed to fetch ${this.site}`;
        if (r.name === "AbortError")
          s += ": Request timed out";
        else {
          s += `: ${r.message}`;
          const i = r.cause;
          i && (s += ` (cause: ${i.code || i.message})`);
        }
        this.initStatus = "error", this.emit("error", {
          module: "FeedSeeker",
          error: s,
          cause: r.cause
        }), this.setEmptyState(), this.emit("initialized");
      }
    })(), this.initPromise;
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
    return await this.initialize(), ne(this);
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
    return await this.initialize(), fe(this);
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
    return await this.initialize(), be(this);
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
    return await this.initialize(), Re(this.site, this.options, this);
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
    const { deepsearchOnly: e, metasearch: r, blindsearch: s, anchorsonly: i } = this.options;
    return e ? this.deepSearch() : r ? this.metaLinks() : s ? this.blindSearch() : i ? this.checkAllAnchors() : null;
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
      const i = await s.call(this);
      if (this.addFeedsToMap(e, i), this.hasReachedLimit(e))
        break;
    }
  }
  /**
   * Adds feeds to the feed map, deduplicating by URL
   * @param {Map<string, Feed>} feedMap - Map to store feeds
   * @param {Feed[]} feeds - Feeds to add
   * @returns {void}
   * @private
   */
  addFeedsToMap(e, r) {
    if (!(!r || r.length === 0))
      for (const s of r)
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
   * @returns {Promise<void>}
   * @private
   */
  async handleDeepSearch(e) {
    const { deepsearch: r, maxFeeds: s } = this.options;
    if (!r || s && e.size >= s)
      return;
    const i = await this.deepSearch();
    if (!(!i || i.length === 0)) {
      for (const o of i)
        if (e.has(o.url) || e.set(o.url, o), this.hasReachedLimit(e))
          break;
    }
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
export {
  Fe as default
};
