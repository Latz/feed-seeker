async function T(e, t = 5e3) {
  const s = new AbortController(), r = s.signal, i = setTimeout(() => s.abort(), t), c = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    "Accept-Encoding": "gzip, deflate, br",
    Connection: "keep-alive",
    "Upgrade-Insecure-Requests": "1",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Cache-Control": "max-age=0"
  };
  try {
    const l = await fetch(e, {
      signal: r,
      headers: c
    });
    return clearTimeout(i), l;
  } catch (l) {
    throw clearTimeout(i), l;
  }
}
const n = {
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
function a(e) {
  return e.replace(n.CDATA, "$1");
}
function o(e) {
  return e && e.replace(/\s+/g, " ").trim();
}
async function N(e, t = "", s) {
  if (e.includes("/wp-json/oembed/") || e.includes("/oembed"))
    return null;
  if (!t) {
    const i = await T(e, s.options.timeout * 1e3);
    if (!i.ok)
      throw new Error(`Failed to fetch ${e}: ${i.status} ${i.statusText}`);
    t = await i.text();
  }
  return A(t) || E(t) || S(t) || null;
}
function u(e) {
  const t = n.RSS.CHANNEL_CONTENT.exec(e);
  if (t) {
    const i = t[1], c = n.RSS.TITLE.exec(i);
    return c ? o(a(c[1])) : null;
  }
  const s = n.RSS.TITLE.exec(e);
  return s ? o(a(s[1])) : null;
}
function A(e) {
  if (n.RSS.VERSION.test(e)) {
    const t = n.RSS.CHANNEL.test(e), s = n.RSS.ITEM.test(e), r = n.RSS.DESCRIPTION.test(e);
    if (t && r && (s || n.RSS.CHANNEL_END.test(e)))
      return { type: "rss", title: u(e) };
  }
  return null;
}
function E(e) {
  const t = n.ATOM.NAMESPACE_XMLNS.test(e) || n.ATOM.NAMESPACE_XMLNS_ATOM.test(e) || n.ATOM.NAMESPACE_ATOM_PREFIX.test(e);
  if (n.ATOM.FEED_START.test(e) && t) {
    const s = n.ATOM.ENTRY.test(e), r = n.ATOM.TITLE_TAG.test(e);
    if (s && r) {
      const i = n.ATOM.TITLE_CONTENT.exec(e);
      return { type: "atom", title: i ? o(a(i[1])) : null };
    }
  }
  return null;
}
function S(e) {
  try {
    const t = JSON.parse(e);
    if (t.type && ["rich", "video", "photo", "link"].includes(t.type) && (t.version === "1.0" || t.version === "2.0") || t.type && t.version && t.html)
      return null;
    if (t.version && typeof t.version == "string" && t.version.includes("jsonfeed") || t.items && Array.isArray(t.items) || t.feed_url) {
      const s = t.title || t.name || null;
      return { type: "json", title: o(s) };
    }
    return null;
  } catch {
    return null;
  }
}
export {
  N as c,
  T as f
};
