import { c as u } from "../checkFeed-DT9wDtY8.js";
function c(e, r) {
  try {
    return new URL(e, r);
  } catch {
    return null;
  }
}
function f(e) {
  const r = c(e);
  return r ? r.protocol === "http:" || r.protocol === "https:" : !1;
}
function m(e) {
  return c(e) ? !1 : !e.includes("://");
}
function p(e, r) {
  const t = c(e);
  if (!t || t.hostname === r.hostname)
    return !0;
  const o = [
    // Google FeedBurner (most common feed hosting service)
    "feedburner.com",
    "feeds.feedburner.com",
    "feedproxy.google.com",
    "feeds2.feedburner.com"
  ];
  return o.includes(t.hostname) || o.some((s) => t.hostname.endsWith("." + s));
}
async function g(e) {
  const r = e.document.querySelector('meta[http-equiv="refresh"]')?.getAttribute("content");
  if (r && r.toLowerCase().includes("url=")) {
    const t = r.match(/url=(?:["']?)([^"';,\s]+)(?:["']?)/i);
    if (t && t[1]) {
      const o = t[1].trim();
      if (!o) {
        e.emit("error", {
          module: "anchors",
          error: "Meta refresh redirect URL is empty",
          explanation: "The meta refresh tag contains an empty URL parameter. This usually indicates malformed HTML or a website configuration error.",
          suggestion: `Check the website's HTML source for proper meta refresh syntax: <meta http-equiv="refresh" content="0;url=https://example.com">`
        });
        return;
      }
      const s = c(o, e.site);
      if (!s) {
        e.emit("error", {
          module: "anchors",
          error: `Invalid meta refresh redirect URL: ${o}`,
          explanation: "The URL found in the meta refresh tag could not be parsed or resolved. This may be due to malformed URL syntax, unsupported protocol, or invalid characters.",
          suggestion: "Verify the URL format is correct and uses http:// or https:// protocol. Check for special characters that may need encoding."
        });
        return;
      }
      if (s.href === e.site) {
        e.emit("error", {
          module: "anchors",
          error: `Meta refresh redirect would create infinite loop: ${s.href}`,
          explanation: "The meta refresh tag redirects to the same URL that is currently being processed. This would cause an infinite loop of redirects.",
          suggestion: "This is likely a website configuration error. The meta refresh should redirect to a different URL, not back to itself."
        });
        return;
      }
      e.site = s.href;
      const { default: i } = await import("./fetchWithTimeout.js"), { parseHTML: n } = await import("linkedom");
      try {
        const a = await i(s.href);
        if (a) {
          const l = await a.text(), { document: d } = n(l);
          e.document = d;
        }
      } catch (a) {
        e.emit("error", {
          module: "anchors",
          error: `Failed to follow meta refresh redirect to ${s.href}: ${a.message}`,
          explanation: "An error occurred while trying to fetch the redirected page. This could be due to network issues, server problems, or the target URL being inaccessible.",
          suggestion: "Check if the redirect URL is accessible in a browser. The original page will be processed instead of the redirect target."
        });
      }
    }
  }
}
function h(e, r, t) {
  if (!e.href)
    return null;
  if (f(e.href))
    return e.href;
  if (m(e.href)) {
    const o = c(e.href, r);
    return o ? o.href : (t.emit("error", {
      module: "anchors",
      error: `Invalid relative URL: ${e.href}`,
      explanation: "A relative URL found in an anchor tag could not be resolved against the base URL. This may be due to malformed relative path syntax.",
      suggestion: 'Check the anchor href attribute for proper relative path format (e.g., "./feed.xml", "../rss.xml", or "/feed").'
    }), null);
  }
  return null;
}
async function U(e, r) {
  const { instance: t, baseUrl: o, feedUrls: s } = r, i = h(e, o, t);
  if (i) {
    t.emit("log", {
      module: "anchors",
      anchor: i
    });
    try {
      const n = await u(i);
      n && s.push({
        href: i,
        title: e.textContent?.trim() || null,
        type: n.type,
        feedTitle: n.title
      });
    } catch (n) {
      t.emit("error", {
        module: "anchors",
        error: `Error checking feed at ${i}: ${n.message}`,
        explanation: "An error occurred while trying to fetch and validate a potential feed URL found in an anchor tag. This could be due to network timeouts, server errors, or invalid feed content.",
        suggestion: "Check if the URL is accessible and returns valid feed content. Network connectivity issues or server problems may cause this error."
      });
    }
  }
}
async function y(e) {
  await g(e);
  const r = new URL(e.site), t = e.document.querySelectorAll("a"), o = [];
  let s = 0;
  for (const a of t) {
    s++;
    const l = h(a, r, e);
    l && p(l, r) && o.push(a);
  }
  const i = e.options?.maxFeeds || 0, n = {
    instance: e,
    baseUrl: r,
    feedUrls: []
  };
  e.emit("log", {
    module: "anchors",
    totalCount: s,
    filteredCount: o.length
    // Number of anchors that passed the domain filter
  });
  for (const a of o) {
    if (i > 0 && n.feedUrls.length >= i) {
      e.emit("log", {
        module: "anchors",
        message: `Stopped due to reaching maximum feeds limit: ${n.feedUrls.length} feeds found (max ${i} allowed).`
      });
      break;
    }
    await U(a, n);
  }
  return n.feedUrls;
}
async function w(e) {
  e.emit("start", {
    module: "checkAllAnchors",
    niceName: "Check all anchors"
  });
  const r = await y(e);
  return e.emit("end", { module: "checkAllAnchors", feeds: r }), r;
}
export {
  w as default
};
