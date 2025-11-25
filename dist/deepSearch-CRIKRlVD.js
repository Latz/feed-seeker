import { parseHTML as j } from "linkedom";
import S from "tldts";
import { queue as H } from "async";
async function O(t, e = {}) {
  let r, s;
  if (typeof e == "number")
    r = e, s = {};
  else {
    const { timeout: a = 5e3, ...d } = e;
    r = a, s = d;
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
  const o = new AbortController(), i = setTimeout(() => o.abort(), r), l = {
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
    return clearTimeout(i), a;
  } catch (a) {
    throw clearTimeout(i), a instanceof Error && a.name === "AbortError" ? new Error(`Request to ${t} timed out after ${r}ms`) : a;
  }
}
const m = {
  MAX_CONTENT_SIZE: 10 * 1024 * 1024,
  // 10MB maximum content size
  DEFAULT_TIMEOUT: 5,
  // Default timeout in seconds
  MAX_TIMEOUT: 60,
  // Maximum timeout in seconds (60 seconds)
  MIN_TIMEOUT: 1
  // Minimum timeout in seconds
}, M = {
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
function X(t) {
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
function W(t) {
  if (t.length > m.MAX_CONTENT_SIZE)
    throw new Error(
      `Content too large: ${t.length} bytes. Maximum allowed: ${m.MAX_CONTENT_SIZE} bytes.`
    );
}
function V(t) {
  return t == null ? m.DEFAULT_TIMEOUT : !Number.isFinite(t) || t < m.MIN_TIMEOUT ? (console.warn(
    `Invalid timeout value ${t}. Using minimum: ${m.MIN_TIMEOUT} seconds.`
  ), m.MIN_TIMEOUT) : t > m.MAX_TIMEOUT ? (console.warn(
    `Timeout value ${t} exceeds maximum. Clamping to ${m.MAX_TIMEOUT} seconds.`
  ), m.MAX_TIMEOUT) : Math.floor(t);
}
function Y(t) {
  return M.URL_PATTERNS.some((e) => t.includes(e));
}
function G(t) {
  return !!(t.type && M.TYPES.includes(t.type) && M.VERSIONS.includes(t.version) || t.type && t.version && t.html);
}
function N(t) {
  return t.replace(f.CDATA, "$1");
}
function E(t) {
  return t ? t.replace(/\s+/g, " ").trim() : null;
}
async function g(t, e = "", r) {
  if (X(t), Y(t))
    return null;
  if (!e) {
    if (!r)
      throw new Error("Instance parameter is required when content is not provided");
    const i = V(r.options.timeout) * 1e3, n = await O(t, i);
    if (!n.ok)
      throw new Error(`Failed to fetch ${t}: ${n.status} ${n.statusText}`);
    e = await n.text();
  }
  return W(e), J(e) || Q(e) || Z(e) || null;
}
function B(t) {
  const e = f.RSS.CHANNEL_CONTENT.exec(t);
  if (e) {
    const o = e[1], i = f.RSS.TITLE.exec(o);
    return i ? E(N(i[1])) : null;
  }
  const r = f.RSS.TITLE.exec(t);
  return r ? E(N(r[1])) : null;
}
function J(t) {
  if (f.RSS.VERSION.test(t)) {
    const e = f.RSS.CHANNEL.test(t), r = f.RSS.ITEM.test(t), s = f.RSS.DESCRIPTION.test(t);
    if (e && s && (r || f.RSS.CHANNEL_END.test(t)))
      return { type: "rss", title: B(t) };
  }
  return null;
}
function Q(t) {
  const e = f.ATOM.NAMESPACE_XMLNS.test(t) || f.ATOM.NAMESPACE_XMLNS_ATOM.test(t) || f.ATOM.NAMESPACE_ATOM_PREFIX.test(t);
  if (f.ATOM.FEED_START.test(t) && e) {
    const r = f.ATOM.ENTRY.test(t), s = f.ATOM.TITLE_TAG.test(t);
    if (r && s) {
      const o = f.ATOM.TITLE_CONTENT.exec(t);
      return { type: "atom", title: o ? E(N(o[1])) : null };
    }
  }
  return null;
}
function Z(t) {
  try {
    const e = JSON.parse(t);
    if (G(e))
      return null;
    if (e.version && typeof e.version == "string" && e.version.includes("jsonfeed") || e.items && Array.isArray(e.items) || e.feed_url) {
      const r = e.title || e.name || null;
      return { type: "json", title: typeof r == "string" ? E(r) : null };
    }
    return null;
  } catch {
    return null;
  }
}
const K = ["feed+json", "rss+xml", "atom+xml", "xml", "rdf+xml"], ee = ["/rss", "/feed", "/atom", ".rss", ".atom", ".xml", ".json"];
function te(t) {
  return t ? t.replace(/\s+/g, " ").trim() : null;
}
async function b(t, e, r, s, o = 5) {
  const i = e.options?.maxFeeds || 0;
  for (let n = 0; n < t.length; n += o) {
    if (i > 0 && r.length >= i)
      return !0;
    const l = t.slice(n, n + o);
    if ((await Promise.allSettled(
      l.map((c) => re(c, e, r, s))
    )).some(
      (c) => c.status === "fulfilled" && c.value === !0
    ))
      return !0;
  }
  return !1;
}
async function re(t, e, r, s) {
  const o = e.options?.maxFeeds || 0;
  if (!t.href) return !1;
  let i;
  try {
    i = new URL(t.href, e.site).href;
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
  if (s.has(i)) return !1;
  e.emit("log", { module: "metalinks", message: `Checking feed: ${i}` });
  try {
    const n = await g(i, "", e);
    if (n && (r.push({
      url: i,
      title: te(t.title),
      type: n.type,
      feedTitle: n.title
    }), s.add(i), o > 0 && r.length >= o))
      return e.emit("log", {
        module: "metalinks",
        message: `Stopped due to reaching maximum feeds limit: ${r.length} feeds found (max ${o} allowed).`
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
async function Ue(t) {
  t.emit("start", { module: "metalinks", niceName: "Meta links" });
  const e = [], r = /* @__PURE__ */ new Set();
  try {
    const s = K.map((d) => `link[type="application/${d}"]`).join(", "), o = Array.from(t.document.querySelectorAll(s));
    if (await b(o, t, e, r))
      return e;
    const n = Array.from(
      t.document.querySelectorAll('link[rel="alternate"][type*="rss"], link[rel="alternate"][type*="xml"], link[rel="alternate"][type*="atom"], link[rel="alternate"][type*="json"]')
    );
    if (await b(n, t, e, r))
      return e;
    const a = Array.from(
      t.document.querySelectorAll('link[rel="alternate"]')
    ).filter(
      (d) => d.href && ee.some((c) => d.href.toLowerCase().includes(c))
    );
    return await b(a, t, e, r), e;
  } finally {
    t.emit("end", { module: "metalinks", feeds: e });
  }
}
function y(t, e) {
  try {
    return new URL(t, e);
  } catch {
    return null;
  }
}
function se(t) {
  const e = y(t);
  return e ? e.protocol === "http:" || e.protocol === "https:" : !1;
}
function oe(t) {
  return y(t) ? !1 : !t.includes("://");
}
function $(t, e) {
  const r = y(t);
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
function ie(t) {
  if (t.options.followMetaRefresh && t.document && typeof t.document.querySelector == "function") {
    const e = t.document.querySelector('meta[http-equiv="refresh"]')?.getAttribute("content");
    if (e) {
      const r = e.match(/url=(.*)/i);
      if (r && r[1]) {
        const s = new URL(r[1], t.site).href;
        return t.emit("log", {
          module: "anchors",
          message: `Following meta refresh redirect to ${s}`
        }), P({ ...t, site: s });
      }
    }
  }
  return null;
}
function D(t, e, r) {
  if (!t.href)
    return null;
  if (se(t.href))
    return t.href;
  if (oe(t.href)) {
    const s = y(t.href, e);
    return s ? s.href : (r.emit("error", {
      module: "anchors",
      error: `Invalid relative URL: ${t.href}`,
      explanation: "A relative URL found in an anchor tag could not be resolved against the base URL. This may be due to malformed relative path syntax.",
      suggestion: 'Check the anchor href attribute for proper relative path format (e.g., "./feed.xml", "../rss.xml", or "/feed").'
    }), null);
  }
  return null;
}
function ne(t) {
  const e = /https?:\/\/[^\s"'<>)]+/gi, r = t.match(e);
  if (!r)
    return [];
  const s = /* @__PURE__ */ new Set();
  for (const o of r) {
    const i = o.replace(/[.,;:!?]+$/, "");
    s.add(i);
  }
  return Array.from(s);
}
async function ae(t, e) {
  const { instance: r, baseUrl: s, feedUrls: o } = e, i = D(t, s, r);
  if (i)
    try {
      const n = await g(i, "", r);
      n && o.push({
        url: i,
        title: t.textContent?.trim() || null,
        type: n.type,
        feedTitle: n.title
      });
    } catch (n) {
      if (r.options?.showErrors) {
        const l = n instanceof Error ? n : new Error(String(n));
        r.emit("error", {
          module: "anchors",
          error: `Error checking feed at ${i}: ${l.message}`,
          explanation: "An error occurred while trying to fetch and validate a potential feed URL found in an anchor tag. This could be due to network timeouts, server errors, or invalid feed content.",
          suggestion: "Check if the URL is accessible and returns valid feed content. Network connectivity issues or server problems may cause this error."
        });
      }
    }
}
async function P(t) {
  await ie(t);
  const e = new URL(t.site), r = t.document.querySelectorAll("a"), s = [];
  for (const l of r) {
    const a = D(l, e, t);
    a && $(a, e) && s.push(l);
  }
  const o = t.options?.maxFeeds || 0, i = {
    instance: t,
    baseUrl: e,
    feedUrls: []
  };
  let n = 1;
  for (const l of s) {
    if (o > 0 && i.feedUrls.length >= o) {
      t.emit("log", {
        module: "anchors",
        message: `Stopped due to reaching maximum feeds limit: ${i.feedUrls.length} feeds found (max ${o} allowed).`
      });
      break;
    }
    t.emit("log", { module: "anchors", totalCount: n++, totalEndpoints: s.length }), await ae(l, i);
  }
  if (o === 0 || i.feedUrls.length < o) {
    const l = t.document.body?.innerHTML || "", a = ne(l), d = new Set(i.feedUrls.map((u) => u.url)), c = [];
    for (const u of a)
      !d.has(u) && $(u, e) && (c.push(u), d.add(u));
    for (const u of c) {
      if (o > 0 && i.feedUrls.length >= o) {
        t.emit("log", {
          module: "anchors",
          message: `Stopped due to reaching maximum feeds limit: ${i.feedUrls.length} feeds found (max ${o} allowed).`
        });
        break;
      }
      t.emit("log", {
        module: "anchors",
        totalCount: n++,
        totalEndpoints: s.length + c.length
      });
      try {
        const h = await g(u, "", t);
        h && i.feedUrls.push({
          url: u,
          title: null,
          // Plain-text URLs don't have anchor text
          type: h.type,
          feedTitle: h.title
        });
      } catch (h) {
        if (t.options?.showErrors) {
          const T = h instanceof Error ? h : new Error(String(h));
          t.emit("error", {
            module: "anchors",
            error: `Error checking feed at ${u}: ${T.message}`,
            explanation: "An error occurred while trying to fetch and validate a potential feed URL found in page text. This could be due to network timeouts, server errors, or invalid feed content.",
            suggestion: "Check if the URL is accessible and returns valid feed content. Network connectivity issues or server problems may cause this error."
          });
        }
      }
    }
  }
  return i.feedUrls;
}
async function ve(t) {
  t.emit("start", {
    module: "anchors",
    niceName: "Check all anchors"
  });
  const e = await P(t);
  return t.emit("end", { module: "anchors", feeds: e }), e;
}
const le = 0, L = 0, de = 3, A = "standard", q = 2083, U = 10, v = 1, I = 1e4, k = 6e4, w = [
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
], ce = [
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
function fe(t) {
  switch (t) {
    case "fast":
      return w;
    case "standard":
      return [...w, ...R];
    case "exhaustive":
    case "full":
      return [...w, ...R, ...ce];
    default:
      return [...w, ...R];
  }
}
function ue(t) {
  return t ? ["fast", "standard", "exhaustive", "full"].includes(t) ? t : (console.warn(`Invalid search mode "${t}". Falling back to "${A}".`), A) : A;
}
function he(t) {
  return t == null ? de : !Number.isFinite(t) || t < v ? (console.warn(`Invalid concurrency value ${t}. Using minimum: ${v}.`), v) : t > U ? (console.warn(`Concurrency value ${t} exceeds maximum. Clamping to ${U}.`), U) : Math.floor(t);
}
function me(t) {
  return t == null ? L : !Number.isFinite(t) || t < 0 ? (console.warn(`Invalid request delay ${t}. Using default: ${L}.`), L) : t > k ? (console.warn(`Request delay ${t}ms exceeds maximum. Clamping to ${k}ms.`), k) : Math.floor(t);
}
function _(t) {
  return t.length <= q;
}
function pe(t, e, r) {
  let s;
  try {
    s = new URL(t);
  } catch {
    throw new Error(`Invalid URL provided to blindSearch: ${t}`);
  }
  if (!_(t))
    throw new Error(`URL too long (${t.length} chars). Maximum allowed: ${q} characters.`);
  if (!["http:", "https:"].includes(s.protocol))
    throw new Error(`Invalid protocol "${s.protocol}". Only http: and https: are allowed.`);
  const o = s.origin;
  let i = t;
  const n = [];
  let l = "";
  for (e && (l = s.search); i.length >= o.length; ) {
    const a = i.endsWith("/") ? i.slice(0, -1) : i;
    for (const d of r) {
      if (n.length >= I)
        return console.warn(
          `URL generation limit reached (${I} URLs). Stopping to prevent resource exhaustion.`
        ), n;
      const c = l ? `${a}/${d}${l}` : `${a}/${d}`;
      _(c) ? n.push(c) : console.warn(`Skipping URL (too long): ${c.substring(0, 100)}...`);
    }
    i = i.slice(0, i.lastIndexOf("/"));
  }
  return n;
}
function ge(t, e, r, s, o) {
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
function we(t, e, r, s, o) {
  return t >= e ? !1 : o ? !0 : !(r && s);
}
async function ke(t, e) {
  const r = ue(t.options?.searchMode), s = fe(r), o = pe(t.site, t.options?.keepQueryParams || !1, s);
  t.emit("start", { module: "blindsearch", niceName: "Blind search", endpointUrls: o.length });
  const i = t.options?.all || !1, n = t.options?.maxFeeds ?? le, l = he(t.options?.concurrency), a = await Ee(o, i, n, l, t);
  return t.emit("end", { module: "blindsearch", feeds: a.feeds }), a.feeds;
}
async function Ee(t, e, r, s, o, i) {
  const n = [], l = /* @__PURE__ */ new Set();
  let a = !1, d = !1, c = 0;
  for (; we(c, t.length, a, d, e); ) {
    if (r > 0 && n.length >= r) {
      await F(o, n, r);
      break;
    }
    const u = Math.min(s, t.length - c), h = t.slice(c, c + u), T = await Promise.allSettled(
      h.map((p) => xe(p, o, l, n, a, d))
    );
    for (const p of T)
      if (p.status === "fulfilled" && p.value.found && (a = p.value.rssFound, d = p.value.atomFound, r > 0 && n.length >= r)) {
        await F(o, n, r), c = t.length;
        break;
      }
    c += u;
    const z = n.length;
    o.emit("log", { module: "blindsearch", totalEndpoints: t.length, totalCount: c, feedsFound: z });
    const C = me(o.options?.requestDelay);
    C > 0 && c < t.length && await new Promise((p) => setTimeout(p, C));
  }
  return { feeds: n, rssFound: a, atomFound: d };
}
async function xe(t, e, r, s, o, i) {
  if (r.has(t))
    return { found: !1, rssFound: o, atomFound: i };
  r.add(t);
  try {
    const n = await g(t, "", e);
    if (n) {
      const l = ge(n, t, s, o, i);
      return o = l.rssFound, i = l.atomFound, { found: !0, rssFound: o, atomFound: i };
    }
  } catch (n) {
    const l = n instanceof Error ? n : new Error(String(n));
    await ye(e, t, l);
  }
  return { found: !1, rssFound: o, atomFound: i };
}
async function F(t, e, r) {
  t.emit("log", {
    module: "blindsearch",
    message: `Stopped due to reaching maximum feeds limit: ${e.length} feeds found (max ${r} allowed).`
  });
}
async function ye(t, e, r) {
  t.options?.showErrors && t.emit("error", {
    module: "blindsearch",
    error: `Error fetching ${e}: ${r.message}`,
    explanation: "An error occurred while trying to fetch a potential feed URL during blind search. This could be due to network timeouts, server errors, 404 not found, or invalid content.",
    suggestion: "This is normal during blind search as many URLs are tested. The search will continue with other potential feed endpoints."
  });
}
class x {
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
  static #i = 10;
  /**
   * Creates a new EventEmitter instance
   * @param {EventEmitterOptions} options - Configuration options
   */
  constructor(e = {}) {
    this.#t = e.maxListeners ?? x.#i, this.#o = e.captureAsyncErrors ?? !0;
  }
  /**
   * Sets the default maximum number of listeners for all new EventEmitter instances
   * @param {number} n - The maximum number of listeners (0 = unlimited)
   */
  static setDefaultMaxListeners(e) {
    if (typeof e != "number" || e < 0 || !Number.isInteger(e))
      throw new TypeError("Max listeners must be a non-negative integer");
    x.#i = e;
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
      const o = /* @__PURE__ */ new Set([r, ...s]);
      this.#e.set(e, o);
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
          const i = this.#l(o);
          throw new Error(`Unhandled error event: ${i}`);
        }
      }
      return !1;
    }
    return [...s].forEach((o) => {
      try {
        const i = o(...r);
        this.#o && i instanceof Promise && i.catch((n) => {
          this.#a(n, e);
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
function Te(t) {
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
class Se extends x {
  constructor(e, r = 3, s = 5, o = 1e3, i = !1, n = 5, l = 0, a = null) {
    super();
    try {
      const d = new URL(e);
      this.startUrl = d.href;
    } catch {
      throw new Error(`Invalid start URL: ${e}`);
    }
    this.maxDepth = r, this.concurrency = s, this.maxLinks = o, this.mainDomain = S.getDomain(this.startUrl), this.checkForeignFeeds = i, this.maxErrors = n, this.maxFeeds = l, this.errorCount = 0, this.instance = a, this.queue = H(this.crawlPage.bind(this), this.concurrency), this.visitedUrls = /* @__PURE__ */ new Set(), this.timeout = 5e3, this.maxLinksReachedMessageEmitted = !1, this.feeds = [], this.queue.error((d) => {
      this.errorCount < this.maxErrors && (this.errorCount++, this.emit("error", {
        module: "deepSearch",
        error: `Async error: ${d}`,
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
      const r = S.getDomain(e) === S.getDomain(this.startUrl), s = !Te(e);
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
      const i = await g(e, "", this.instance || void 0);
      if (i && !this.feeds.some((n) => n.url === e)) {
        if (this.feeds.push({ url: e, type: i.type, title: i.title, feedTitle: i.title }), this.emit("log", {
          module: "deepSearch",
          url: e,
          depth: r + 1,
          feedCheck: { isFeed: !0, type: i.type }
        }), this.maxFeeds > 0 && this.feeds.length >= this.maxFeeds)
          return this.queue.kill(), this.emit("log", {
            module: "deepSearch",
            message: `Stopped due to reaching maximum feeds limit: ${this.feeds.length} feeds found (max ${this.maxFeeds} allowed).`
          }), !0;
      } else i || this.emit("log", { module: "deepSearch", url: e, depth: r + 1, feedCheck: { isFeed: !1 } });
    } catch (i) {
      const n = i instanceof Error ? i : new Error(String(i));
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
    const o = await O(r, this.timeout);
    if (!o) {
      this.handleFetchError(r, s, "Failed to fetch URL - timeout or network error");
      return;
    }
    if (!o.ok) {
      this.handleFetchError(r, s, `HTTP ${o.status} ${o.statusText}`);
      return;
    }
    const i = await o.text(), { document: n } = j(i);
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
  const s = new Se(
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
export {
  x as E,
  ke as b,
  ve as c,
  Re as d,
  O as f,
  Ue as m
};
