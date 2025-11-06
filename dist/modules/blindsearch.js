import { c } from "../checkFeed-CpnV4saY.js";
const u = [
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
function h(e, f) {
  const d = new URL(e).origin;
  let t = e;
  const s = [];
  let r = "";
  for (f && (r = new URL(e).search); t.length >= d.length; ) {
    const o = t.endsWith("/") ? t.slice(0, -1) : t;
    u.forEach((a) => {
      const n = r ? `${o}/${a}${r}` : `${o}/${a}`;
      s.push(n);
    }), t = t.slice(0, t.lastIndexOf("/"));
  }
  return s;
}
function g(e, f, d, t, s) {
  return e.type === "rss" ? t = !0 : e.type === "atom" && (s = !0), d.push({
    url: f,
    feedType: e.type,
    title: e.title,
    type: e.type,
    feedTitle: e.title
  }), { rssFound: t, atomFound: s };
}
function x(e, f, d, t, s) {
  return e < f && !(!s && d && t);
}
async function k(e) {
  const f = h(e.site, e.options?.keepQueryParams || !1);
  e.emit("start", { module: "blindsearch", niceName: "Blind search", endpointUrls: f.length });
  const d = e.options?.all || !1, t = e.options?.maxFeeds || 0, s = await y(f, d, t, e);
  return e.emit("end", { module: "blindsearch", feeds: s.feeds }), s.feeds;
}
async function y(e, f, d, t) {
  const s = [], r = /* @__PURE__ */ new Set();
  let o = !1, a = !1, n = 0;
  for (; x(n, e.length, o, a, f); ) {
    if (d > 0 && s.length >= d) {
      await l(t, s, d);
      break;
    }
    const p = e[n], i = await w(p, t, r, s, o, a);
    if (i.found && (o = i.rssFound, a = i.atomFound, d > 0 && s.length >= d)) {
      await l(t, s, d);
      break;
    }
    let m = s.length;
    t.emit("log", { module: "blindsearch", totalEndpoints: e.length, totalCount: n, feedsFound: m }), n++;
  }
  return { feeds: s, rssFound: o, atomFound: a };
}
async function w(e, f, d, t, s, r) {
  try {
    const o = await c(e, "", f);
    if (o && !d.has(e)) {
      d.add(e);
      const a = g(o, e, t, s, r);
      return s = a.rssFound, r = a.atomFound, { found: !0, rssFound: s, atomFound: r };
    }
  } catch (o) {
    await b(f, e, o);
  }
  return { found: !1, rssFound: s, atomFound: r };
}
async function l(e, f, d) {
  e.emit("log", {
    module: "blindsearch",
    message: `Stopped due to reaching maximum feeds limit: ${f.length} feeds found (max ${d} allowed).`
  });
}
async function b(e, f, d) {
  e.options?.showErrors && e.emit("error", {
    module: "blindsearch",
    error: `Error fetching ${f}: ${d.message}`,
    explanation: "An error occurred while trying to fetch a potential feed URL during blind search. This could be due to network timeouts, server errors, 404 not found, or invalid content.",
    suggestion: "This is normal during blind search as many URLs are tested. The search will continue with other potential feed endpoints."
  });
}
export {
  k as default
};
