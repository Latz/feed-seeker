import { c as f } from "../checkFeed-CpnV4saY.js";
function d(t) {
  return t ? t.replace(/\s+/g, " ").trim() : null;
}
async function a(t, e, l, i) {
  const n = e.options?.maxFeeds || 0;
  if (!t.href) return !1;
  const o = new URL(t.href, e.site).href;
  if (i.has(o)) return !1;
  e.emit("log", { module: "metalinks" });
  try {
    const r = await f(o, "", e);
    if (r && (l.push({
      url: o,
      title: d(t.title),
      type: r.type,
      feedTitle: r.title
    }), i.add(o), n > 0 && l.length >= n))
      return e.emit("log", {
        module: "metalinks",
        message: `Stopped due to reaching maximum feeds limit: ${l.length} feeds found (max ${n} allowed).`
      }), !0;
  } catch (r) {
    if (e.options?.showErrors) {
      const s = r instanceof Error ? r : new Error(String(r));
      e.emit("error", {
        module: "metalinks",
        error: s.message,
        explanation: "An error occurred while trying to fetch and validate a feed URL found in a meta link tag. This could be due to network issues, server problems, or invalid feed content.",
        suggestion: "Check if the meta link URL is accessible and returns valid feed content. The search will continue with other meta links."
      });
    }
  }
  return !1;
}
async function p(t) {
  t.emit("start", { module: "metalinks", niceName: "Meta links" });
  const e = [], l = /* @__PURE__ */ new Set();
  if (!t.document)
    return t.emit("end", { module: "metalinks", feeds: e }), e;
  const n = ["feed+json", "rss+xml", "atom+xml", "xml", "rdf+xml"].map((r) => `link[type="application/${r}"]`).join(", ");
  for (const r of t.document.querySelectorAll(n))
    if (await a(r, t, e, l)) return e;
  const o = 'link[rel="alternate"][type*="rss"], link[rel="alternate"][type*="xml"], link[rel="alternate"][type*="atom"], link[rel="alternate"][type*="json"]';
  for (const r of t.document.querySelectorAll(o))
    if (await a(r, t, e, l)) return e;
  for (const r of t.document.querySelectorAll('link[rel="alternate"]')) {
    const s = ["/rss", "/feed", "/atom", ".rss", ".atom", ".xml", ".json"];
    if (r.href && s.some((m) => r.href.toLowerCase().includes(m)) && await a(r, t, e, l))
      return e;
  }
  return t.emit("end", { module: "metalinks", feeds: e }), e;
}
export {
  p as default
};
