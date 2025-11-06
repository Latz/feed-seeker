const s = {
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
function c(e) {
  return e.replace(s.CDATA, "$1");
}
function l(e) {
  return e && e.replace(/\s+/g, " ").trim();
}
async function N(e, t = "") {
  if (e.includes("/wp-json/oembed/") || e.includes("/oembed"))
    return null;
  if (!t) {
    const n = await fetch(e);
    if (!n.ok)
      throw new Error(`Failed to fetch ${e}: ${n.status} ${n.statusText}`);
    t = await n.text();
  }
  return A(t) || o(t) || a(t) || null;
}
function E(e) {
  const t = s.RSS.CHANNEL_CONTENT.exec(e);
  if (t) {
    const r = t[1], T = s.RSS.TITLE.exec(r);
    return T ? l(c(T[1])) : null;
  }
  const i = s.RSS.TITLE.exec(e);
  return i ? l(c(i[1])) : null;
}
function A(e) {
  if (s.RSS.VERSION.test(e)) {
    const t = s.RSS.CHANNEL.test(e), i = s.RSS.ITEM.test(e), n = s.RSS.DESCRIPTION.test(e);
    if (t && n && (i || s.RSS.CHANNEL_END.test(e)))
      return { type: "rss", title: E(e) };
  }
  return null;
}
function o(e) {
  const t = s.ATOM.NAMESPACE_XMLNS.test(e) || s.ATOM.NAMESPACE_XMLNS_ATOM.test(e) || s.ATOM.NAMESPACE_ATOM_PREFIX.test(e);
  if (s.ATOM.FEED_START.test(e) && t) {
    const i = s.ATOM.ENTRY.test(e), n = s.ATOM.TITLE_TAG.test(e);
    if (i && n) {
      const r = s.ATOM.TITLE_CONTENT.exec(e);
      return { type: "atom", title: r ? l(c(r[1])) : null };
    }
  }
  return null;
}
function a(e) {
  try {
    const t = JSON.parse(e);
    if (t.type && ["rich", "video", "photo", "link"].includes(t.type) && (t.version === "1.0" || t.version === "2.0") || t.type && t.version && t.html)
      return null;
    if (t.version && typeof t.version == "string" && t.version.includes("jsonfeed") || t.items && Array.isArray(t.items) || t.feed_url) {
      const i = t.title || t.name || null;
      return { type: "json", title: l(i) };
    }
    return null;
  } catch {
    return null;
  }
}
export {
  N as c
};
