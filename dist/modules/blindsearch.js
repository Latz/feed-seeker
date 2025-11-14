import { c as m } from "../checkFeed-DT9wDtY8.js";
const c = [
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
function u(e, f) {
  const t = new URL(e).origin;
  let s = e;
  const d = [];
  let r = "";
  for (f && (r = new URL(e).search); s.length >= t.length; ) {
    const a = s.endsWith("/") ? s.slice(0, -1) : s;
    c.forEach((o) => {
      const n = r ? `${a}/${o}${r}` : `${a}/${o}`;
      d.push(n);
    }), s = s.slice(0, s.lastIndexOf("/"));
  }
  return d;
}
function h(e, f, t, s, d) {
  return e.type === "rss" ? s = !0 : e.type === "atom" && (d = !0), t.push({
    url: f,
    feedType: e.type,
    title: e.title
  }), { rssFound: s, atomFound: d };
}
function g(e, f, t, s, d) {
  return e < f && !(!d && t && s);
}
async function v(e) {
  e.emit("start", { module: "blindsearch", niceName: "Blind search" });
  const f = u(e.site, e.options?.keepQueryParams || !1);
  e.emit("log", {
    module: "blindsearch",
    totalCount: f.length
  });
  const t = e.options?.all || !1, s = e.options?.maxFeeds || 0, d = await x(f, t, s, e);
  return e.emit("end", { module: "blindsearch", feeds: d.feeds }), d.feeds;
}
async function x(e, f, t, s) {
  const d = [], r = /* @__PURE__ */ new Set();
  let a = !1, o = !1, n = 0;
  for (; g(n, e.length, a, o, f); ) {
    if (t > 0 && d.length >= t) {
      await l(s, d, t);
      break;
    }
    const p = e[n], i = await y(p, s, r, d, a, o);
    if (i.found && (a = i.rssFound, o = i.atomFound, t > 0 && d.length >= t)) {
      await l(s, d, t);
      break;
    }
    s.emit("log", { module: "blindsearch", url: !0 }), n++;
  }
  return { feeds: d, rssFound: a, atomFound: o };
}
async function y(e, f, t, s, d, r, a) {
  try {
    const o = await m(e);
    if (o && !t.has(e)) {
      t.add(e);
      const n = h(o, e, s, d, r);
      return d = n.rssFound, r = n.atomFound, f.emit("log", {
        module: "blindsearch",
        foundFeedsCount: s.length
      }), { found: !0, rssFound: d, atomFound: r };
    }
  } catch (o) {
    await w(f, e, o);
  }
  return { found: !1, rssFound: d, atomFound: r };
}
async function l(e, f, t) {
  e.emit("log", {
    module: "blindsearch",
    message: `Stopped due to reaching maximum feeds limit: ${f.length} feeds found (max ${t} allowed).`
  });
}
async function w(e, f, t) {
  e.options?.showErrors && e.emit("error", {
    module: "blindsearch",
    error: `Error fetching ${f}: ${t.message}`,
    explanation: "An error occurred while trying to fetch a potential feed URL during blind search. This could be due to network timeouts, server errors, 404 not found, or invalid content.",
    suggestion: "This is normal during blind search as many URLs are tested. The search will continue with other potential feed endpoints."
  });
}
export {
  v as default
};
