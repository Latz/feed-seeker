import { c as d } from "../checkFeed-CpnV4saY.js";
function c(e, r) {
  try {
    return new URL(e, r);
  } catch {
    return null;
  }
}
function h(e) {
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
  return o.includes(t.hostname) || o.some((l) => t.hostname.endsWith("." + l));
}
function g(e) {
  if (e.options.followMetaRefresh && e.document && typeof e.document.querySelector == "function") {
    const r = e.document.querySelector('meta[http-equiv="refresh"]')?.getAttribute("content");
    if (r) {
      const t = r.match(/url=(.*)/i);
      if (t && t[1]) {
        const o = new URL(t[1], e.site).href;
        return e.emit("log", {
          module: "anchors",
          message: `Following meta refresh redirect to ${o}`
        }), f({ ...e, site: o });
      }
    }
  }
  return null;
}
function u(e, r, t) {
  if (!e.href)
    return null;
  if (h(e.href))
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
  const { instance: t, baseUrl: o, feedUrls: l } = r, n = u(e, o, t);
  if (n)
    try {
      const s = await d(n, "", t);
      s && l.push({
        url: n,
        title: e.textContent?.trim() || null,
        type: s.type,
        feedTitle: s.title
      });
    } catch (s) {
      if (t.options?.showErrors) {
        const i = s instanceof Error ? s : new Error(String(s));
        t.emit("error", {
          module: "anchors",
          error: `Error checking feed at ${n}: ${i.message}`,
          explanation: "An error occurred while trying to fetch and validate a potential feed URL found in an anchor tag. This could be due to network timeouts, server errors, or invalid feed content.",
          suggestion: "Check if the URL is accessible and returns valid feed content. Network connectivity issues or server problems may cause this error."
        });
      }
    }
}
async function f(e) {
  await g(e);
  const r = new URL(e.site), t = e.document.querySelectorAll("a"), o = [];
  for (const i of t) {
    const a = u(i, r, e);
    a && p(a, r) && o.push(i);
  }
  const l = e.options?.maxFeeds || 0, n = {
    instance: e,
    baseUrl: r,
    feedUrls: []
  };
  let s = 1;
  for (const i of o) {
    if (l > 0 && n.feedUrls.length >= l) {
      e.emit("log", {
        module: "anchors",
        message: `Stopped due to reaching maximum feeds limit: ${n.feedUrls.length} feeds found (max ${l} allowed).`
      });
      break;
    }
    e.emit("log", { module: "anchors", totalCount: s++, totalEndpoints: o.length }), await U(i, n);
  }
  return n.feedUrls;
}
async function w(e) {
  e.emit("start", {
    module: "anchors",
    niceName: "Check all anchors"
  });
  const r = await f(e);
  return e.emit("end", { module: "anchors", feeds: r }), r;
}
export {
  w as default
};
